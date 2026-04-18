import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB module
vi.mock("./db", () => ({
  getMarkets: vi.fn().mockResolvedValue([
    {
      id: 1, slug: "btc-test", title: "Will BTC hit $100k?", category: "crypto",
      status: "open", totalVolume: "50000.000000", totalLiquidity: "20000.000000",
      expiresAt: new Date("2026-12-31"), featured: true, description: "Test market",
      resolutionCriteria: "Resolves YES if BTC > $100k", createdAt: new Date(), updatedAt: new Date(),
      creatorId: null, resolvedAt: null, resolvedOutcomeId: null,
    },
  ]),
  getMarketStats: vi.fn().mockResolvedValue({
    totalMarkets: 19, totalVolume: "5000000", openMarkets: 16, resolvedMarkets: 3,
  }),
  getMarketBySlug: vi.fn().mockResolvedValue({
    id: 1, slug: "btc-test", title: "Will BTC hit $100k?", category: "crypto",
    status: "open", totalVolume: "50000.000000", totalLiquidity: "20000.000000",
    expiresAt: new Date("2026-12-31"), featured: true, description: "Test market",
    resolutionCriteria: "Resolves YES if BTC > $100k", createdAt: new Date(), updatedAt: new Date(),
    creatorId: null, resolvedAt: null, resolvedOutcomeId: null,
  }),
  getMarketById: vi.fn().mockResolvedValue({
    id: 1, slug: "btc-test", title: "Will BTC hit $100k?", category: "crypto",
    status: "open", totalVolume: "50000.000000", totalLiquidity: "20000.000000",
    expiresAt: new Date("2026-12-31"), featured: true, description: "Test market",
    resolutionCriteria: "Resolves YES if BTC > $100k", createdAt: new Date(), updatedAt: new Date(),
    creatorId: null, resolvedAt: null, resolvedOutcomeId: null,
  }),
  getOutcomesByMarketId: vi.fn().mockResolvedValue([
    { id: 1, marketId: 1, label: "Yes", probability: "0.380000", pricePerShare: "0.380000", totalShares: "100000.000000", createdAt: new Date() },
    { id: 2, marketId: 1, label: "No", probability: "0.620000", pricePerShare: "0.620000", totalShares: "163000.000000", createdAt: new Date() },
  ]),
  createMarket: vi.fn().mockResolvedValue({}),
  createOutcome: vi.fn().mockResolvedValue({}),
  placeBet: vi.fn().mockResolvedValue({}),
  getUserBets: vi.fn().mockResolvedValue([]),
  getUserPositions: vi.fn().mockResolvedValue([]),
  upsertPosition: vi.fn().mockResolvedValue(undefined),
  deductUserBalance: vi.fn().mockResolvedValue(undefined),
  addUserBalance: vi.fn().mockResolvedValue(undefined),
  updateOutcomeProbability: vi.fn().mockResolvedValue(undefined),
  updateMarketVolume: vi.fn().mockResolvedValue(undefined),
  getLeaderboard: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, totalWinnings: "48250.500000", accuracyScore: "0.8720", marketsParticipated: 142, marketsWon: 124, rank: 1, name: "CryptoOracle", walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
  ]),
  getLatestForecast: vi.fn().mockResolvedValue(null),
  saveForecast: vi.fn().mockResolvedValue(undefined),
  getResolvedMarkets: vi.fn().mockResolvedValue([]),
  getUserById: vi.fn().mockResolvedValue({
    id: 1, openId: "test-user", name: "Test User", email: "test@example.com",
    balanceCUSD: "5000.000000", balanceCEUR: "2500.000000", balanceCREAL: "10000.000000",
    walletAddress: "0x1234567890123456789012345678901234567890",
    role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
  }),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          analysis: "Based on current market conditions, BTC faces resistance at $90k.",
          outcomeAssessments: [{ label: "Yes", probability: 0.38 }, { label: "No", probability: 0.62 }],
          confidence: 0.75,
          suggestedOutcome: "No",
        }),
      },
    }],
  }),
}));

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAuthCtx(): TrpcContext {
  return {
    user: {
      id: 1, openId: "test-user", name: "Test User", email: "test@example.com",
      loginMethod: "manus", role: "user",
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("markets.list", () => {
  it("returns a list of markets", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.markets.list({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("slug");
    expect(result[0]).toHaveProperty("title");
    expect(result[0]).toHaveProperty("category");
  });
});

describe("markets.stats", () => {
  it("returns platform statistics", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const stats = await caller.markets.stats();
    expect(stats).toHaveProperty("totalMarkets");
    expect(stats).toHaveProperty("totalVolume");
    expect(stats).toHaveProperty("openMarkets");
    expect(stats).toHaveProperty("resolvedMarkets");
    expect(Number(stats.totalMarkets)).toBeGreaterThanOrEqual(0);
  });
});

describe("markets.bySlug", () => {
  it("returns market with outcomes", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.markets.bySlug({ slug: "btc-test" });
    expect(result).toHaveProperty("market");
    expect(result).toHaveProperty("outcomes");
    expect(result.market.slug).toBe("btc-test");
    expect(Array.isArray(result.outcomes)).toBe(true);
    expect(result.outcomes.length).toBe(2);
  });

  it("throws NOT_FOUND for unknown slug", async () => {
    const { getMarketBySlug } = await import("./db");
    vi.mocked(getMarketBySlug).mockResolvedValueOnce(undefined);
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.markets.bySlug({ slug: "nonexistent-market" })).rejects.toThrow("Market not found");
  });
});

describe("leaderboard.top", () => {
  it("returns leaderboard entries", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.leaderboard.top({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("totalWinnings");
    expect(result[0]).toHaveProperty("accuracyScore");
    expect(result[0]).toHaveProperty("marketsParticipated");
    expect(result[0]).toHaveProperty("marketsWon");
  });
});

describe("trading.wallet", () => {
  it("returns wallet balances for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const wallet = await caller.trading.wallet();
    expect(wallet).toHaveProperty("cUSD");
    expect(wallet).toHaveProperty("cEUR");
    expect(wallet).toHaveProperty("cREAL");
    expect(wallet).toHaveProperty("walletAddress");
    expect(parseFloat(wallet.cUSD)).toBeGreaterThanOrEqual(0);
  });

  it("throws UNAUTHORIZED for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.trading.wallet()).rejects.toThrow();
  });
});

describe("trading.placeBet", () => {
  it("executes a buy trade successfully", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const result = await caller.trading.placeBet({
      marketId: 1,
      outcomeId: 1,
      type: "buy",
      shares: 10,
      currency: "cUSD",
    });
    expect(result.success).toBe(true);
    expect(result.totalCost).toBeGreaterThan(0);
    expect(result.pricePerShare).toBeGreaterThan(0);
  });

  it("rejects bet on closed market", async () => {
    const { getMarketById } = await import("./db");
    vi.mocked(getMarketById).mockResolvedValueOnce({
      id: 1, slug: "closed-market", title: "Closed", category: "crypto" as any,
      status: "resolved" as any, totalVolume: "0", totalLiquidity: "0",
      expiresAt: new Date("2025-01-01"), featured: false, description: "",
      resolutionCriteria: null, createdAt: new Date(), updatedAt: new Date(),
      creatorId: null, resolvedAt: new Date(), resolvedOutcomeId: 1,
    });
    const caller = appRouter.createCaller(createAuthCtx());
    await expect(caller.trading.placeBet({
      marketId: 1, outcomeId: 1, type: "buy", shares: 10, currency: "cUSD",
    })).rejects.toThrow("Market is not open for trading");
  });
});

describe("resolution.feed", () => {
  it("returns resolved markets feed", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.resolution.feed({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = createAuthCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
