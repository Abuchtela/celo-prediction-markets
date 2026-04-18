import { eq, desc, asc, like, and, or, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  markets, InsertMarket,
  outcomes, InsertOutcome,
  bets, InsertBet,
  positions,
  leaderboard,
  aiForecasts,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Markets ──────────────────────────────────────────────────────────────────

export async function getMarkets(opts?: {
  category?: string;
  status?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (opts?.category && opts.category !== "all") conditions.push(eq(markets.category, opts.category as any));
  if (opts?.status) conditions.push(eq(markets.status, opts.status as any));
  if (opts?.featured !== undefined) conditions.push(eq(markets.featured, opts.featured));
  if (opts?.search) conditions.push(like(markets.title, `%${opts.search}%`));
  const query = db.select().from(markets);
  if (conditions.length > 0) query.where(and(...conditions) as any);
  query.orderBy(desc(markets.totalVolume));
  if (opts?.limit) query.limit(opts.limit);
  if (opts?.offset) query.offset(opts.offset);
  return query;
}

export async function getMarketBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(markets).where(eq(markets.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMarketById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(markets).where(eq(markets.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMarket(data: InsertMarket) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(markets).values(data);
  return result;
}

export async function getMarketStats() {
  const db = await getDb();
  if (!db) return { totalMarkets: 0, totalVolume: "0", openMarkets: 0, resolvedMarkets: 0 };
  const [total] = await db.select({ count: sql<number>`count(*)` }).from(markets);
  const [open] = await db.select({ count: sql<number>`count(*)` }).from(markets).where(eq(markets.status, "open"));
  const [resolved] = await db.select({ count: sql<number>`count(*)` }).from(markets).where(eq(markets.status, "resolved"));
  const [vol] = await db.select({ total: sql<string>`COALESCE(SUM(totalVolume), 0)` }).from(markets);
  return {
    totalMarkets: Number(total?.count ?? 0),
    totalVolume: vol?.total ?? "0",
    openMarkets: Number(open?.count ?? 0),
    resolvedMarkets: Number(resolved?.count ?? 0),
  };
}

// ─── Outcomes ─────────────────────────────────────────────────────────────────

export async function getOutcomesByMarketId(marketId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(outcomes).where(eq(outcomes.marketId, marketId)).orderBy(asc(outcomes.id));
}

export async function createOutcome(data: InsertOutcome) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(outcomes).values(data);
}

// ─── Bets & Positions ─────────────────────────────────────────────────────────

export async function placeBet(data: InsertBet) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(bets).values(data);
}

export async function getUserBets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bets).where(eq(bets.userId, userId)).orderBy(desc(bets.createdAt)).limit(50);
}

export async function getUserPositions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(positions).where(and(eq(positions.userId, userId), sql`${positions.shares} > 0`)).orderBy(desc(positions.updatedAt));
}

export async function upsertPosition(userId: number, marketId: number, outcomeId: number, sharesDelta: number, costDelta: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db.select().from(positions)
    .where(and(eq(positions.userId, userId), eq(positions.marketId, marketId), eq(positions.outcomeId, outcomeId)))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(positions).values({
      userId, marketId, outcomeId,
      shares: sharesDelta.toFixed(6),
      avgCostPerShare: sharesDelta > 0 ? (costDelta / sharesDelta).toFixed(6) : "0",
      totalInvested: costDelta.toFixed(6),
      realizedPnl: "0",
    });
  } else {
    const pos = existing[0]!;
    const newShares = parseFloat(pos.shares) + sharesDelta;
    const newInvested = parseFloat(pos.totalInvested) + costDelta;
    const newAvg = newShares > 0 ? newInvested / newShares : 0;
    await db.update(positions)
      .set({ shares: Math.max(0, newShares).toFixed(6), totalInvested: newInvested.toFixed(6), avgCostPerShare: newAvg.toFixed(6) })
      .where(eq(positions.id, pos.id));
  }
}

export async function deductUserBalance(userId: number, amount: number, currency: "cUSD" | "cEUR" | "cREAL") {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const col = currency === "cUSD" ? users.balanceCUSD : currency === "cEUR" ? users.balanceCEUR : users.balanceCREAL;
  await db.update(users).set({ [col.name]: sql`${col} - ${amount.toFixed(6)}` }).where(eq(users.id, userId));
}

export async function addUserBalance(userId: number, amount: number, currency: "cUSD" | "cEUR" | "cREAL") {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const col = currency === "cUSD" ? users.balanceCUSD : currency === "cEUR" ? users.balanceCEUR : users.balanceCREAL;
  await db.update(users).set({ [col.name]: sql`${col} + ${amount.toFixed(6)}` }).where(eq(users.id, userId));
}

export async function updateOutcomeProbability(outcomeId: number, probability: number, pricePerShare: number, sharesDelta: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(outcomes).set({
    probability: probability.toFixed(6),
    pricePerShare: pricePerShare.toFixed(6),
    totalShares: sql`${outcomes.totalShares} + ${sharesDelta.toFixed(6)}`,
  }).where(eq(outcomes.id, outcomeId));
}

export async function updateMarketVolume(marketId: number, amount: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(markets).set({
    totalVolume: sql`${markets.totalVolume} + ${amount.toFixed(6)}`,
    totalLiquidity: sql`${markets.totalLiquidity} + ${amount.toFixed(6)}`,
  }).where(eq(markets.id, marketId));
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export async function getLeaderboard(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: leaderboard.id,
    userId: leaderboard.userId,
    totalWinnings: leaderboard.totalWinnings,
    accuracyScore: leaderboard.accuracyScore,
    marketsParticipated: leaderboard.marketsParticipated,
    marketsWon: leaderboard.marketsWon,
    rank: leaderboard.rank,
    name: users.name,
    walletAddress: users.walletAddress,
  })
    .from(leaderboard)
    .leftJoin(users, eq(leaderboard.userId, users.id))
    .orderBy(desc(leaderboard.totalWinnings))
    .limit(limit);
}

// ─── AI Forecasts ─────────────────────────────────────────────────────────────

export async function getLatestForecast(marketId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(aiForecasts).where(eq(aiForecasts.marketId, marketId)).orderBy(desc(aiForecasts.createdAt)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function saveForecast(marketId: number, analysis: string, suggestedOutcomeId: number | null, confidence: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(aiForecasts).values({ marketId, analysis, suggestedOutcomeId, confidence: confidence.toFixed(4) });
}

// ─── Resolution Feed ──────────────────────────────────────────────────────────

export async function getResolvedMarkets(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(markets).where(eq(markets.status, "resolved")).orderBy(desc(markets.resolvedAt)).limit(limit);
}
