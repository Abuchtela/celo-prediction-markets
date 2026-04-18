import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Simulated wallet balances
  balanceCUSD: decimal("balanceCUSD", { precision: 18, scale: 6 }).default("1000.000000").notNull(),
  balanceCEUR: decimal("balanceCEUR", { precision: 18, scale: 6 }).default("500.000000").notNull(),
  balanceCREAL: decimal("balanceCREAL", { precision: 18, scale: 6 }).default("2000.000000").notNull(),
  walletAddress: varchar("walletAddress", { length: 42 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const markets = mysqlTable("markets", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", ["crypto", "politics", "sports", "economics", "technology", "entertainment"]).notNull(),
  status: mysqlEnum("status", ["open", "closed", "resolved", "cancelled"]).default("open").notNull(),
  resolutionCriteria: text("resolutionCriteria"),
  resolvedOutcomeId: int("resolvedOutcomeId"),
  totalLiquidity: decimal("totalLiquidity", { precision: 18, scale: 6 }).default("0.000000").notNull(),
  totalVolume: decimal("totalVolume", { precision: 18, scale: 6 }).default("0.000000").notNull(),
  creatorId: int("creatorId"),
  featured: boolean("featured").default(false).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Market = typeof markets.$inferSelect;
export type InsertMarket = typeof markets.$inferInsert;

export const outcomes = mysqlTable("outcomes", {
  id: int("id").autoincrement().primaryKey(),
  marketId: int("marketId").notNull(),
  label: varchar("label", { length: 128 }).notNull(),
  probability: decimal("probability", { precision: 8, scale: 6 }).default("0.500000").notNull(),
  totalShares: decimal("totalShares", { precision: 18, scale: 6 }).default("0.000000").notNull(),
  pricePerShare: decimal("pricePerShare", { precision: 8, scale: 6 }).default("0.500000").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Outcome = typeof outcomes.$inferSelect;
export type InsertOutcome = typeof outcomes.$inferInsert;

export const bets = mysqlTable("bets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  marketId: int("marketId").notNull(),
  outcomeId: int("outcomeId").notNull(),
  type: mysqlEnum("type", ["buy", "sell"]).notNull(),
  shares: decimal("shares", { precision: 18, scale: 6 }).notNull(),
  pricePerShare: decimal("pricePerShare", { precision: 8, scale: 6 }).notNull(),
  totalCost: decimal("totalCost", { precision: 18, scale: 6 }).notNull(),
  currency: mysqlEnum("currency", ["cUSD", "cEUR", "cREAL"]).default("cUSD").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Bet = typeof bets.$inferSelect;
export type InsertBet = typeof bets.$inferInsert;

export const positions = mysqlTable("positions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  marketId: int("marketId").notNull(),
  outcomeId: int("outcomeId").notNull(),
  shares: decimal("shares", { precision: 18, scale: 6 }).default("0.000000").notNull(),
  avgCostPerShare: decimal("avgCostPerShare", { precision: 8, scale: 6 }).default("0.000000").notNull(),
  totalInvested: decimal("totalInvested", { precision: 18, scale: 6 }).default("0.000000").notNull(),
  realizedPnl: decimal("realizedPnl", { precision: 18, scale: 6 }).default("0.000000").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Position = typeof positions.$inferSelect;
export type InsertPosition = typeof positions.$inferInsert;

export const leaderboard = mysqlTable("leaderboard", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalWinnings: decimal("totalWinnings", { precision: 18, scale: 6 }).default("0.000000").notNull(),
  accuracyScore: decimal("accuracyScore", { precision: 8, scale: 4 }).default("0.0000").notNull(),
  marketsParticipated: int("marketsParticipated").default(0).notNull(),
  marketsWon: int("marketsWon").default(0).notNull(),
  rank: int("rank").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeaderboardEntry = typeof leaderboard.$inferSelect;
export type InsertLeaderboardEntry = typeof leaderboard.$inferInsert;

export const aiForecasts = mysqlTable("aiForecasts", {
  id: int("id").autoincrement().primaryKey(),
  marketId: int("marketId").notNull(),
  analysis: text("analysis").notNull(),
  suggestedOutcomeId: int("suggestedOutcomeId"),
  confidence: decimal("confidence", { precision: 5, scale: 4 }).default("0.5000").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiForecast = typeof aiForecasts.$inferSelect;
export type InsertAiForecast = typeof aiForecasts.$inferInsert;
