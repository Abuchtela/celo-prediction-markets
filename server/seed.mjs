/**
 * Seed script: real prediction markets based on current events (April 2026)
 * Run: node server/seed.mjs
 */
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(conn);

// ── Real markets based on live Polymarket data (April 17, 2026) ──────────────
const MARKETS = [
  // CRYPTO
  {
    slug: "bitcoin-above-100k-may-2026",
    title: "Will Bitcoin (BTC) close above $100,000 before June 1, 2026?",
    description: "Bitcoin is currently trading around $84,000 after a sharp correction from its January 2026 ATH of $109,000. Macro uncertainty from US tariffs and Fed policy is weighing on risk assets. This market resolves YES if BTC closes above $100,000 on any day before June 1, 2026 (UTC).",
    category: "crypto",
    status: "open",
    resolutionCriteria: "Resolves YES if CoinGecko daily close price for BTC/USD exceeds $100,000 before June 1, 2026 00:00 UTC.",
    featured: true,
    totalLiquidity: "284000.000000",
    totalVolume: "1240000.000000",
    expiresAt: new Date("2026-06-01"),
    outcomes: [
      { label: "Yes", probability: "0.380000", pricePerShare: "0.380000", totalShares: "470000.000000" },
      { label: "No", probability: "0.620000", pricePerShare: "0.620000", totalShares: "765000.000000" },
    ],
  },
  {
    slug: "ethereum-above-3000-may-2026",
    title: "Will Ethereum (ETH) close above $3,000 before May 31, 2026?",
    description: "Ethereum is trading near $1,580 following the broader crypto market downturn. The Ethereum Foundation recently announced Pectra upgrade milestones. This market resolves YES if ETH/USD closes above $3,000 on any day before May 31, 2026.",
    category: "crypto",
    status: "open",
    resolutionCriteria: "Resolves YES if CoinGecko daily close price for ETH/USD exceeds $3,000 before May 31, 2026 00:00 UTC.",
    featured: true,
    totalLiquidity: "95000.000000",
    totalVolume: "537000.000000",
    expiresAt: new Date("2026-05-31"),
    outcomes: [
      { label: "Yes", probability: "0.220000", pricePerShare: "0.220000", totalShares: "210000.000000" },
      { label: "No", probability: "0.780000", pricePerShare: "0.780000", totalShares: "745000.000000" },
    ],
  },
  {
    slug: "celo-l2-tvl-100m-2026",
    title: "Will Celo L2 total TVL exceed $100M by end of Q2 2026?",
    description: "Celo completed its migration to an Ethereum L2 in 2025. With MiniPay surpassing 14M users and the Agent Visa program attracting AI builders, DeFi protocols like Aave, Uniswap, Morpho and Curve are growing on Celo. Resolves YES if DeFiLlama reports Celo TVL ≥ $100M on June 30, 2026.",
    category: "crypto",
    status: "open",
    resolutionCriteria: "Resolves YES if DeFiLlama reports Celo chain TVL ≥ $100,000,000 on June 30, 2026.",
    featured: true,
    totalLiquidity: "12000.000000",
    totalVolume: "44000.000000",
    expiresAt: new Date("2026-06-30"),
    outcomes: [
      { label: "Yes", probability: "0.610000", pricePerShare: "0.610000", totalShares: "26800.000000" },
      { label: "No", probability: "0.390000", pricePerShare: "0.390000", totalShares: "17200.000000" },
    ],
  },
  {
    slug: "btc-5min-up-down",
    title: "Bitcoin Up or Down — Next 5 Minutes",
    description: "Live short-term Bitcoin price direction market. Resolves based on BTC/USD price movement over the next 5-minute candle on Binance. UP if close > open, DOWN if close ≤ open.",
    category: "crypto",
    status: "open",
    resolutionCriteria: "Resolves UP if BTC/USD 5-minute candle close > open on Binance. Resolves DOWN otherwise.",
    featured: false,
    totalLiquidity: "40000.000000",
    totalVolume: "40000.000000",
    expiresAt: new Date("2026-04-18"),
    outcomes: [
      { label: "Up", probability: "0.480000", pricePerShare: "0.480000", totalShares: "19200.000000" },
      { label: "Down", probability: "0.520000", pricePerShare: "0.520000", totalShares: "20800.000000" },
    ],
  },

  // GEOPOLITICS / POLITICS
  {
    slug: "iran-us-peace-deal-may-2026",
    title: "Will the US and Iran reach a permanent peace deal by May 31, 2026?",
    description: "Iran reopened the Strait of Hormuz on April 17, 2026 after a ceasefire. Trump stated Iran has agreed to nearly all US demands. Negotiations are ongoing in Oman. This market resolves YES if a formal, signed peace agreement between the US and Iran is announced before June 1, 2026.",
    category: "politics",
    status: "open",
    resolutionCriteria: "Resolves YES if a formal signed peace treaty or comprehensive nuclear deal between the US and Iran is publicly announced before June 1, 2026.",
    featured: true,
    totalLiquidity: "16000.000000",
    totalVolume: "16000.000000",
    expiresAt: new Date("2026-05-31"),
    outcomes: [
      { label: "Yes", probability: "0.640000", pricePerShare: "0.640000", totalShares: "10240.000000" },
      { label: "No", probability: "0.360000", pricePerShare: "0.360000", totalShares: "5760.000000" },
    ],
  },
  {
    slug: "strait-of-hormuz-normal-april-2026",
    title: "Will Strait of Hormuz traffic return to normal by end of April 2026?",
    description: "The Strait of Hormuz was reopened on April 17, 2026 after Iran and the US announced a ceasefire. However, Iran has threatened to close it again. This market resolves YES if shipping traffic through the Strait returns to pre-crisis levels by April 30, 2026.",
    category: "politics",
    status: "open",
    resolutionCriteria: "Resolves YES if Lloyd's List or Reuters reports normal commercial shipping traffic through the Strait of Hormuz by April 30, 2026.",
    featured: true,
    totalLiquidity: "13000.000000",
    totalVolume: "13000.000000",
    expiresAt: new Date("2026-04-30"),
    outcomes: [
      { label: "Yes", probability: "0.380000", pricePerShare: "0.380000", totalShares: "4940.000000" },
      { label: "No", probability: "0.620000", pricePerShare: "0.620000", totalShares: "8060.000000" },
    ],
  },
  {
    slug: "maduro-venezuela-leader-2026",
    title: "Will Nicolás Maduro remain leader of Venezuela through end of 2026?",
    description: "Nicolás Maduro has maintained power despite the disputed 2024 election results and international pressure. The opposition, led by Edmundo González, continues to claim victory. This market resolves YES if Maduro is still recognized as Venezuela's president on December 31, 2026.",
    category: "politics",
    status: "open",
    resolutionCriteria: "Resolves YES if Nicolás Maduro is still serving as Venezuela's president on December 31, 2026.",
    featured: false,
    totalLiquidity: "8000.000000",
    totalVolume: "12000.000000",
    expiresAt: new Date("2026-12-31"),
    outcomes: [
      { label: "Yes", probability: "0.600000", pricePerShare: "0.600000", totalShares: "7200.000000" },
      { label: "No", probability: "0.400000", pricePerShare: "0.400000", totalShares: "4800.000000" },
    ],
  },
  {
    slug: "trump-insult-obama-april-2026",
    title: "Will Donald Trump publicly insult Barack Obama by April 30, 2026?",
    description: "Trump has historically made public statements targeting Obama. This market tracks whether Trump makes a direct personal insult (not policy criticism) about Barack Obama in a public forum — speech, Truth Social post, or press conference — before May 1, 2026.",
    category: "politics",
    status: "open",
    resolutionCriteria: "Resolves YES if Trump makes a verifiable personal insult directed at Barack Obama in a public statement before May 1, 2026.",
    featured: false,
    totalLiquidity: "5000.000000",
    totalVolume: "9000.000000",
    expiresAt: new Date("2026-04-30"),
    outcomes: [
      { label: "Yes", probability: "0.530000", pricePerShare: "0.530000", totalShares: "4770.000000" },
      { label: "No", probability: "0.470000", pricePerShare: "0.470000", totalShares: "4230.000000" },
    ],
  },

  // SPORTS
  {
    slug: "warriors-vs-suns-april-17",
    title: "Warriors vs. Suns — Who wins? (April 17, 2026)",
    description: "Golden State Warriors host the Phoenix Suns in an NBA regular season game on April 17, 2026. Warriors are currently in Q1 with the score 2-0. This market resolves based on the final score.",
    category: "sports",
    status: "open",
    resolutionCriteria: "Resolves to the team with the higher score at the end of regulation or overtime on April 17, 2026.",
    featured: false,
    totalLiquidity: "7000.000000",
    totalVolume: "7000.000000",
    expiresAt: new Date("2026-04-18"),
    outcomes: [
      { label: "Warriors", probability: "0.440000", pricePerShare: "0.440000", totalShares: "3080.000000" },
      { label: "Suns", probability: "0.560000", pricePerShare: "0.560000", totalShares: "3920.000000" },
    ],
  },
  {
    slug: "nba-playoffs-2026-champion",
    title: "Who will win the 2026 NBA Championship?",
    description: "The 2026 NBA Playoffs are approaching. Oklahoma City Thunder, Boston Celtics, and Cleveland Cavaliers are the top seeds. This market resolves when the NBA Finals conclude.",
    category: "sports",
    status: "open",
    resolutionCriteria: "Resolves to the team that wins the 2026 NBA Finals.",
    featured: true,
    totalLiquidity: "95000.000000",
    totalVolume: "677000.000000",
    expiresAt: new Date("2026-06-30"),
    outcomes: [
      { label: "Oklahoma City Thunder", probability: "0.280000", pricePerShare: "0.280000", totalShares: "189560.000000" },
      { label: "Boston Celtics", probability: "0.220000", pricePerShare: "0.220000", totalShares: "148940.000000" },
      { label: "Cleveland Cavaliers", probability: "0.180000", pricePerShare: "0.180000", totalShares: "121860.000000" },
      { label: "Golden State Warriors", probability: "0.120000", pricePerShare: "0.120000", totalShares: "81240.000000" },
      { label: "Other", probability: "0.200000", pricePerShare: "0.200000", totalShares: "135400.000000" },
    ],
  },
  {
    slug: "furia-vs-evil-geniuses-valorant",
    title: "FURIA Esports vs. Evil Geniuses — Valorant Champions Tour (Game 3)",
    description: "FURIA Esports leads 1-1 against Evil Geniuses in the Valorant Champions Tour Americas. FURIA is currently favored at 82%. This market resolves to the winner of Game 3.",
    category: "sports",
    status: "open",
    resolutionCriteria: "Resolves to the team that wins Game 3 of the VCT Americas series between FURIA and Evil Geniuses.",
    featured: false,
    totalLiquidity: "433000.000000",
    totalVolume: "433000.000000",
    expiresAt: new Date("2026-04-19"),
    outcomes: [
      { label: "FURIA Esports", probability: "0.820000", pricePerShare: "0.820000", totalShares: "355060.000000" },
      { label: "Evil Geniuses", probability: "0.180000", pricePerShare: "0.180000", totalShares: "77940.000000" },
    ],
  },

  // ECONOMICS
  {
    slug: "fed-rate-cut-june-2026",
    title: "Will the Federal Reserve cut interest rates at the June 2026 FOMC meeting?",
    description: "The Fed held rates steady at 4.25-4.50% in its March 2026 meeting amid sticky inflation and tariff uncertainty. Markets are pricing in two cuts in 2026. This market resolves YES if the FOMC announces a rate cut of at least 25bps at its June 17-18, 2026 meeting.",
    category: "economics",
    status: "open",
    resolutionCriteria: "Resolves YES if the FOMC announces a federal funds rate reduction of at least 25 basis points at its June 17-18, 2026 meeting.",
    featured: true,
    totalLiquidity: "108000.000000",
    totalVolume: "564000.000000",
    expiresAt: new Date("2026-06-18"),
    outcomes: [
      { label: "Yes — Cut ≥25bps", probability: "0.420000", pricePerShare: "0.420000", totalShares: "236880.000000" },
      { label: "No — Hold or Hike", probability: "0.580000", pricePerShare: "0.580000", totalShares: "327120.000000" },
    ],
  },
  {
    slug: "wti-crude-oil-april-2026",
    title: "What will WTI Crude Oil (WTI) hit in April 2026?",
    description: "WTI crude oil fell sharply after the Strait of Hormuz reopened on April 17, 2026. Oil was trading near $62/barrel. This market tracks the high price WTI reaches before April 30, 2026.",
    category: "economics",
    status: "open",
    resolutionCriteria: "Resolves based on the highest intraday WTI crude oil price (NYMEX) recorded before April 30, 2026 23:59 UTC.",
    featured: false,
    totalLiquidity: "40000.000000",
    totalVolume: "40000.000000",
    expiresAt: new Date("2026-04-30"),
    outcomes: [
      { label: "Below $70", probability: "0.390000", pricePerShare: "0.390000", totalShares: "15600.000000" },
      { label: "$70 – $80", probability: "0.310000", pricePerShare: "0.310000", totalShares: "12400.000000" },
      { label: "$80 – $90", probability: "0.200000", pricePerShare: "0.200000", totalShares: "8000.000000" },
      { label: "Above $90", probability: "0.100000", pricePerShare: "0.100000", totalShares: "4000.000000" },
    ],
  },
  {
    slug: "us-recession-2026",
    title: "Will the US enter a recession in 2026?",
    description: "US GDP growth slowed to 0.4% annualized in Q1 2026 as tariffs weighed on trade. The IMF cut its US growth forecast to 1.8% for 2026. This market resolves YES if the NBER officially declares a US recession with a start date in 2026.",
    category: "economics",
    status: "open",
    resolutionCriteria: "Resolves YES if the National Bureau of Economic Research (NBER) officially declares a US recession with a start date in calendar year 2026.",
    featured: true,
    totalLiquidity: "50000.000000",
    totalVolume: "243000.000000",
    expiresAt: new Date("2026-12-31"),
    outcomes: [
      { label: "Yes", probability: "0.350000", pricePerShare: "0.350000", totalShares: "85050.000000" },
      { label: "No", probability: "0.650000", pricePerShare: "0.650000", totalShares: "157950.000000" },
    ],
  },

  // TECHNOLOGY
  {
    slug: "openai-gpt5-release-2026",
    title: "Will OpenAI release GPT-5 before July 1, 2026?",
    description: "OpenAI has been hinting at GPT-5 since late 2025. Sam Altman confirmed GPT-5 is in training. The model is expected to be significantly more capable than GPT-4o. This market resolves YES if OpenAI publicly releases or announces general availability of GPT-5 before July 1, 2026.",
    category: "technology",
    status: "open",
    resolutionCriteria: "Resolves YES if OpenAI announces general availability (not limited preview) of GPT-5 before July 1, 2026.",
    featured: false,
    totalLiquidity: "30000.000000",
    totalVolume: "110000.000000",
    expiresAt: new Date("2026-06-30"),
    outcomes: [
      { label: "Yes", probability: "0.720000", pricePerShare: "0.720000", totalShares: "79200.000000" },
      { label: "No", probability: "0.280000", pricePerShare: "0.280000", totalShares: "30800.000000" },
    ],
  },
  {
    slug: "apple-ai-glasses-2026",
    title: "Will Apple announce AR/AI glasses at WWDC 2026?",
    description: "Apple is rumored to be developing lightweight AI-powered glasses following the Vision Pro launch. Analysts expect an announcement at WWDC 2026 (June). This market resolves YES if Apple announces a wearable AR/AI glasses product at WWDC 2026.",
    category: "technology",
    status: "open",
    resolutionCriteria: "Resolves YES if Apple announces a wearable AR or AI glasses product at WWDC 2026 (expected June 2026).",
    featured: false,
    totalLiquidity: "8000.000000",
    totalVolume: "22000.000000",
    expiresAt: new Date("2026-06-30"),
    outcomes: [
      { label: "Yes", probability: "0.450000", pricePerShare: "0.450000", totalShares: "9900.000000" },
      { label: "No", probability: "0.550000", pricePerShare: "0.550000", totalShares: "12100.000000" },
    ],
  },

  // RESOLVED MARKETS (for resolution feed)
  {
    slug: "bitcoin-ath-2025",
    title: "Will Bitcoin reach a new all-time high in 2025?",
    description: "Bitcoin hit $109,000 in January 2025, setting a new ATH. This market resolved YES.",
    category: "crypto",
    status: "resolved",
    resolutionCriteria: "Resolves YES if BTC/USD closes above $73,750 (previous ATH) at any point in 2025.",
    featured: false,
    totalLiquidity: "500000.000000",
    totalVolume: "1000000.000000",
    expiresAt: new Date("2025-12-31"),
    resolvedAt: new Date("2025-01-20"),
    outcomes: [
      { label: "Yes", probability: "1.000000", pricePerShare: "1.000000", totalShares: "800000.000000" },
      { label: "No", probability: "0.000000", pricePerShare: "0.000000", totalShares: "200000.000000" },
    ],
    resolvedOutcomeLabel: "Yes",
  },
  {
    slug: "trump-wins-2024-election",
    title: "Will Donald Trump win the 2024 US Presidential Election?",
    description: "Donald Trump defeated Kamala Harris in the November 2024 election. This market resolved YES.",
    category: "politics",
    status: "resolved",
    resolutionCriteria: "Resolves YES if Donald Trump is elected President of the United States in November 2024.",
    featured: false,
    totalLiquidity: "1000000.000000",
    totalVolume: "1000000.000000",
    expiresAt: new Date("2024-11-05"),
    resolvedAt: new Date("2024-11-06"),
    outcomes: [
      { label: "Trump", probability: "1.000000", pricePerShare: "1.000000", totalShares: "600000.000000" },
      { label: "Harris", probability: "0.000000", pricePerShare: "0.000000", totalShares: "400000.000000" },
    ],
    resolvedOutcomeLabel: "Trump",
  },
  {
    slug: "celo-ethereum-l2-migration",
    title: "Will Celo successfully migrate to Ethereum L2 in 2025?",
    description: "Celo completed its migration from an independent L1 to an Ethereum L2 in 2025. This market resolved YES.",
    category: "crypto",
    status: "resolved",
    resolutionCriteria: "Resolves YES if Celo mainnet successfully migrates to an Ethereum L2 architecture in 2025.",
    featured: false,
    totalLiquidity: "50000.000000",
    totalVolume: "120000.000000",
    expiresAt: new Date("2025-12-31"),
    resolvedAt: new Date("2025-03-26"),
    outcomes: [
      { label: "Yes", probability: "1.000000", pricePerShare: "1.000000", totalShares: "96000.000000" },
      { label: "No", probability: "0.000000", pricePerShare: "0.000000", totalShares: "24000.000000" },
    ],
    resolvedOutcomeLabel: "Yes",
  },
];

// ── Leaderboard seed data ─────────────────────────────────────────────────────
const LEADERBOARD = [
  { userId: 1, totalWinnings: "48250.500000", accuracyScore: "0.8720", marketsParticipated: 142, marketsWon: 124, rank: 1 },
  { userId: 2, totalWinnings: "31890.250000", accuracyScore: "0.8340", marketsParticipated: 98, marketsWon: 82, rank: 2 },
  { userId: 3, totalWinnings: "27650.000000", accuracyScore: "0.8100", marketsParticipated: 115, marketsWon: 93, rank: 3 },
  { userId: 4, totalWinnings: "19420.750000", accuracyScore: "0.7890", marketsParticipated: 76, marketsWon: 60, rank: 4 },
  { userId: 5, totalWinnings: "15300.000000", accuracyScore: "0.7650", marketsParticipated: 88, marketsWon: 67, rank: 5 },
  { userId: 6, totalWinnings: "12800.500000", accuracyScore: "0.7420", marketsParticipated: 64, marketsWon: 47, rank: 6 },
  { userId: 7, totalWinnings: "9750.250000", accuracyScore: "0.7200", marketsParticipated: 55, marketsWon: 39, rank: 7 },
  { userId: 8, totalWinnings: "7200.000000", accuracyScore: "0.6980", marketsParticipated: 43, marketsWon: 30, rank: 8 },
  { userId: 9, totalWinnings: "5600.750000", accuracyScore: "0.6750", marketsParticipated: 37, marketsWon: 25, rank: 9 },
  { userId: 10, totalWinnings: "3400.000000", accuracyScore: "0.6500", marketsParticipated: 28, marketsWon: 18, rank: 10 },
];

// ── Seed users for leaderboard ────────────────────────────────────────────────
const USERS = [
  { openId: "seed-user-1", name: "CryptoOracle", walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
  { openId: "seed-user-2", name: "PredictorPro", walletAddress: "0x53d284357ec70cE289D6D64134DfAc8E511c8a3D" },
  { openId: "seed-user-3", name: "MarketMaven", walletAddress: "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8" },
  { openId: "seed-user-4", name: "CeloSage", walletAddress: "0x8103683202AA8A74A9A2DF1B736B3C3b3B3B3B3B" },
  { openId: "seed-user-5", name: "ForecastKing", walletAddress: "0x1234567890123456789012345678901234567890" },
  { openId: "seed-user-6", name: "OddsWizard", walletAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" },
  { openId: "seed-user-7", name: "AlphaTrader", walletAddress: "0x9999999999999999999999999999999999999999" },
  { openId: "seed-user-8", name: "ProbMaster", walletAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
  { openId: "seed-user-9", name: "SignalSeeker", walletAddress: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" },
  { openId: "seed-user-10", name: "EdgeFinder", walletAddress: "0xcccccccccccccccccccccccccccccccccccccccc" },
];

async function seed() {
  console.log("🌱 Seeding real market data...");

  // Seed users
  for (const u of USERS) {
    await conn.execute(
      `INSERT IGNORE INTO users (openId, name, walletAddress, balanceCUSD, balanceCEUR, balanceCREAL, role, createdAt, updatedAt, lastSignedIn)
       VALUES (?, ?, ?, '5000.000000', '2500.000000', '10000.000000', 'user', NOW(), NOW(), NOW())`,
      [u.openId, u.name, u.walletAddress]
    );
  }
  console.log("✓ Users seeded");

  // Seed markets + outcomes
  for (const m of MARKETS) {
    const [existing] = await conn.execute("SELECT id FROM markets WHERE slug = ?", [m.slug]);
    if (existing.length > 0) {
      console.log(`  skip existing: ${m.slug}`);
      continue;
    }

    await conn.execute(
      `INSERT INTO markets (slug, title, description, category, status, resolutionCriteria, featured, totalLiquidity, totalVolume, expiresAt, resolvedAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [m.slug, m.title, m.description, m.category, m.status, m.resolutionCriteria ?? null,
       m.featured ? 1 : 0, m.totalLiquidity, m.totalVolume,
       m.expiresAt, m.resolvedAt ?? null]
    );

    const [marketRow] = await conn.execute("SELECT id FROM markets WHERE slug = ?", [m.slug]);
    const marketId = marketRow[0].id;

    for (const o of m.outcomes) {
      await conn.execute(
        `INSERT INTO outcomes (marketId, label, probability, pricePerShare, totalShares, createdAt)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [marketId, o.label, o.probability, o.pricePerShare, o.totalShares]
      );
    }

    // Set resolvedOutcomeId for resolved markets
    if (m.resolvedOutcomeLabel) {
      const [outcomeRow] = await conn.execute(
        "SELECT id FROM outcomes WHERE marketId = ? AND label = ?",
        [marketId, m.resolvedOutcomeLabel]
      );
      if (outcomeRow.length > 0) {
        await conn.execute("UPDATE markets SET resolvedOutcomeId = ? WHERE id = ?", [outcomeRow[0].id, marketId]);
      }
    }

    console.log(`  ✓ ${m.title.slice(0, 60)}...`);
  }

  // Seed leaderboard
  for (const entry of LEADERBOARD) {
    const [userRow] = await conn.execute("SELECT id FROM users WHERE openId = ?", [`seed-user-${entry.userId}`]);
    if (userRow.length === 0) continue;
    const realUserId = userRow[0].id;
    await conn.execute(
      `INSERT INTO leaderboard (userId, totalWinnings, accuracyScore, marketsParticipated, marketsWon, \`rank\`, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE totalWinnings=VALUES(totalWinnings), accuracyScore=VALUES(accuracyScore),
       marketsParticipated=VALUES(marketsParticipated), marketsWon=VALUES(marketsWon), \`rank\`=VALUES(\`rank\`)`,
      [realUserId, entry.totalWinnings, entry.accuracyScore, entry.marketsParticipated, entry.marketsWon, entry.rank]
    );
  }
  console.log("✓ Leaderboard seeded");

  await conn.end();
  console.log("✅ Seed complete!");
}

seed().catch(err => { console.error(err); process.exit(1); });
