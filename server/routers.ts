import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import {
  getMarkets, getMarketBySlug, getMarketById, createMarket, getMarketStats,
  getOutcomesByMarketId, createOutcome,
  placeBet, getUserBets, getUserPositions, upsertPosition,
  deductUserBalance, addUserBalance, updateOutcomeProbability, updateMarketVolume,
  getLeaderboard,
  getLatestForecast, saveForecast,
  getResolvedMarkets,
  getUserById,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Markets ────────────────────────────────────────────────────────────────
  markets: router({
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
        featured: z.boolean().optional(),
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ input }) => {
        return getMarkets(input);
      }),

    stats: publicProcedure.query(async () => {
      return getMarketStats();
    }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const market = await getMarketBySlug(input.slug);
        if (!market) throw new TRPCError({ code: "NOT_FOUND", message: "Market not found" });
        const outcomeList = await getOutcomesByMarketId(market.id);
        return { market, outcomes: outcomeList };
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(10).max(300),
        description: z.string().min(20).max(2000),
        category: z.enum(["crypto", "politics", "sports", "economics", "technology", "entertainment"]),
        resolutionCriteria: z.string().min(10).max(1000),
        expiresAt: z.string(),
        outcomes: z.array(z.string().min(1).max(128)).min(2).max(10),
      }))
      .mutation(async ({ input, ctx }) => {
        const slug = input.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 100) + "-" + Date.now();
        await createMarket({
          slug,
          title: input.title,
          description: input.description,
          category: input.category,
          resolutionCriteria: input.resolutionCriteria,
          expiresAt: new Date(input.expiresAt),
          creatorId: ctx.user.id,
          featured: false,
          status: "open",
        });
        const newMarket = await getMarketBySlug(slug);
        if (!newMarket) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const prob = (1 / input.outcomes.length).toFixed(6);
        for (const label of input.outcomes) {
          await createOutcome({ marketId: newMarket.id, label, probability: prob, pricePerShare: prob });
        }
        return { slug };
      }),
  }),

  // ─── Trading ────────────────────────────────────────────────────────────────
  trading: router({
    placeBet: protectedProcedure
      .input(z.object({
        marketId: z.number(),
        outcomeId: z.number(),
        type: z.enum(["buy", "sell"]),
        shares: z.number().positive(),
        currency: z.enum(["cUSD", "cEUR", "cREAL"]).default("cUSD"),
      }))
      .mutation(async ({ input, ctx }) => {
        const market = await getMarketById(input.marketId);
        if (!market || market.status !== "open") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Market is not open for trading" });
        }
        const outcomeList = await getOutcomesByMarketId(input.marketId);
        const outcome = outcomeList.find(o => o.id === input.outcomeId);
        if (!outcome) throw new TRPCError({ code: "NOT_FOUND", message: "Outcome not found" });

        const pricePerShare = parseFloat(outcome.pricePerShare);
        const totalCost = parseFloat((input.shares * pricePerShare).toFixed(6));

        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });

        const balance = parseFloat(
          input.currency === "cUSD" ? user.balanceCUSD :
          input.currency === "cEUR" ? user.balanceCEUR : user.balanceCREAL
        );

        if (input.type === "buy" && balance < totalCost) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient ${input.currency} balance` });
        }
        if (input.type === "sell") {
          const positions = await getUserPositions(ctx.user.id);
          const pos = positions.find((p: any) => p.marketId === input.marketId && p.outcomeId === input.outcomeId);
          const ownedShares = pos ? parseFloat(pos.shares) : 0;
          if (ownedShares < input.shares) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient shares: you own ${ownedShares.toFixed(2)} shares` });
          }
        }

        // Record the bet
        await placeBet({
          userId: ctx.user.id,
          marketId: input.marketId,
          outcomeId: input.outcomeId,
          type: input.type,
          shares: input.shares.toFixed(6),
          pricePerShare: pricePerShare.toFixed(6),
          totalCost: totalCost.toFixed(6),
          currency: input.currency,
        });

        // Update user balance
        if (input.type === "buy") {
          await deductUserBalance(ctx.user.id, totalCost, input.currency);
          await upsertPosition(ctx.user.id, input.marketId, input.outcomeId, input.shares, totalCost);
        } else {
          await addUserBalance(ctx.user.id, totalCost, input.currency);
          await upsertPosition(ctx.user.id, input.marketId, input.outcomeId, -input.shares, -totalCost);
        }

        // Update market volume and outcome probabilities using LMSR-inspired price update
        await updateMarketVolume(input.marketId, totalCost);
        const totalSharesAll = outcomeList.reduce((s, o) => s + parseFloat(o.totalShares), 0) + input.shares;
        for (const o of outcomeList) {
          const shares = parseFloat(o.totalShares) + (o.id === input.outcomeId ? input.shares : 0);
          const newProb = Math.max(0.01, Math.min(0.99, shares / Math.max(totalSharesAll, 1)));
          await updateOutcomeProbability(o.id, newProb, newProb, o.id === input.outcomeId ? input.shares : 0);
        }

        return { success: true, totalCost, pricePerShare };
      }),

    myBets: protectedProcedure.query(async ({ ctx }) => {
      return getUserBets(ctx.user.id);
    }),

    myPositions: protectedProcedure.query(async ({ ctx }) => {
      const pos = await getUserPositions(ctx.user.id);
      // Enrich with market and outcome info
      const enriched = await Promise.all(pos.map(async (p) => {
        const market = await getMarketById(p.marketId);
        const outcomeList = await getOutcomesByMarketId(p.marketId);
        const outcome = outcomeList.find(o => o.id === p.outcomeId);
        const currentPrice = outcome ? parseFloat(outcome.pricePerShare) : 0;
        const currentValue = parseFloat(p.shares) * currentPrice;
        const invested = parseFloat(p.totalInvested);
        const unrealizedPnl = currentValue - invested;
        return { ...p, market, outcome, currentValue, unrealizedPnl };
      }));
      return enriched;
    }),

    wallet: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        cUSD: user.balanceCUSD,
        cEUR: user.balanceCEUR,
        cREAL: user.balanceCREAL,
        walletAddress: user.walletAddress ?? generateMockAddress(user.id),
      };
    }),
  }),

  // ─── AI Forecasting ─────────────────────────────────────────────────────────
  ai: router({
    forecast: publicProcedure
      .input(z.object({ marketId: z.number() }))
      .query(async ({ input }) => {
        // Return cached forecast if less than 1 hour old
        const cached = await getLatestForecast(input.marketId);
        if (cached) {
          const age = Date.now() - new Date(cached.createdAt).getTime();
          if (age < 3600_000) return cached;
        }

        const market = await getMarketById(input.marketId);
        if (!market) throw new TRPCError({ code: "NOT_FOUND" });
        const outcomeList = await getOutcomesByMarketId(input.marketId);

        const outcomeText = outcomeList.map(o =>
          `- ${o.label}: current probability ${(parseFloat(o.probability) * 100).toFixed(1)}%, price ${parseFloat(o.pricePerShare).toFixed(3)} cUSD/share`
        ).join("\n");

        const prompt = `You are an expert prediction market analyst. Analyze this market and provide a concise probability assessment.

Market: "${market.title}"
Description: ${market.description}
Category: ${market.category}
Expires: ${new Date(market.expiresAt).toLocaleDateString()}
Resolution criteria: ${market.resolutionCriteria ?? "Standard resolution"}

Current market odds:
${outcomeText}

Provide:
1. A brief analysis (2-3 sentences) of the key factors driving this market
2. Your probability assessment for each outcome
3. A confidence level (0-1) in your analysis
4. Which outcome you consider most likely

Be direct, data-driven, and reference real-world context. Format as JSON:
{
  "analysis": "...",
  "outcomeAssessments": [{"label": "...", "probability": 0.xx}],
  "confidence": 0.xx,
  "suggestedOutcome": "..."
}`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "You are a precise prediction market analyst. Always respond with valid JSON." },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_schema", json_schema: {
              name: "forecast",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  analysis: { type: "string" },
                  outcomeAssessments: { type: "array", items: { type: "object", properties: { label: { type: "string" }, probability: { type: "number" } }, required: ["label", "probability"], additionalProperties: false } },
                  confidence: { type: "number" },
                  suggestedOutcome: { type: "string" },
                },
                required: ["analysis", "outcomeAssessments", "confidence", "suggestedOutcome"],
                additionalProperties: false,
              },
            }},
          });

          const rawContent = response.choices[0]?.message?.content;
          const content = typeof rawContent === "string" ? rawContent : null;
          if (!content) throw new Error("No response");
          const parsed = JSON.parse(content);
          const suggested = outcomeList.find(o => o.label === parsed.suggestedOutcome);
          await saveForecast(input.marketId, parsed.analysis, suggested?.id ?? null, parsed.confidence);
          return {
            analysis: parsed.analysis,
            outcomeAssessments: parsed.outcomeAssessments,
            confidence: parsed.confidence,
            suggestedOutcome: parsed.suggestedOutcome,
            createdAt: new Date(),
          };
        } catch (e) {
          return {
            analysis: "AI analysis temporarily unavailable. Market odds reflect current trader sentiment.",
            outcomeAssessments: outcomeList.map(o => ({ label: o.label, probability: parseFloat(o.probability) })),
            confidence: 0.5,
            suggestedOutcome: outcomeList[0]?.label ?? "",
            createdAt: new Date(),
          };
        }
      }),
  }),

  // ─── Leaderboard ────────────────────────────────────────────────────────────
  leaderboard: router({
    top: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).optional().default(20) }))
      .query(async ({ input }) => {
        return getLeaderboard(input.limit);
      }),
  }),

  // ─── Resolution Feed ────────────────────────────────────────────────────────
  resolution: router({
    feed: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).optional().default(10) }))
      .query(async ({ input }) => {
        const resolved = await getResolvedMarkets(input.limit);
        const enriched = await Promise.all(resolved.map(async (m) => {
          const outcomeList = await getOutcomesByMarketId(m.id);
          const winner = outcomeList.find(o => o.id === m.resolvedOutcomeId);
          return { ...m, outcomes: outcomeList, winningOutcome: winner };
        }));
        return enriched;
      }),
  }),
});

function generateMockAddress(userId: number): string {
  const hex = userId.toString(16).padStart(8, "0");
  return `0x${hex}${"0".repeat(32)}`;
}

export type AppRouter = typeof appRouter;
