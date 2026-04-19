/**
 * CoinGecko price feed service.
 * Uses the free public API (no key required, 30 req/min).
 * Results are cached for 60 seconds to stay within rate limits.
 */

import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  last_updated: string;
}

export interface PriceFeedResult {
  prices: Record<string, PriceData>;
  fetchedAt: number;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

let cache: PriceFeedResult | null = null;
const CACHE_TTL_MS = 60_000; // 60 seconds

// CoinGecko IDs for the assets we track
const TRACKED_IDS = [
  "bitcoin",
  "ethereum",
  "celo",
  "solana",
  "the-open-network", // TON
].join(",");

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function fetchLivePrices(): Promise<PriceFeedResult> {
  const now = Date.now();

  // Return cached result if fresh
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache;
  }

  try {
    const response = await axios.get<PriceData[]>(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          ids: TRACKED_IDS,
          order: "market_cap_desc",
          per_page: 10,
          page: 1,
          sparkline: false,
          price_change_percentage: "24h",
        },
        timeout: 8000,
        headers: {
          Accept: "application/json",
        },
      }
    );

    const prices: Record<string, PriceData> = {};
    for (const coin of response.data) {
      prices[coin.id] = coin;
    }

    cache = { prices, fetchedAt: now };
    return cache;
  } catch (err) {
    console.error("[PriceService] CoinGecko fetch failed:", err);
    // Return stale cache if available, otherwise throw
    if (cache) {
      console.warn("[PriceService] Returning stale cache");
      return cache;
    }
    throw new Error("Price feed unavailable");
  }
}

/**
 * Get a single coin's price by CoinGecko ID.
 */
export async function getCoinPrice(coinId: string): Promise<number | null> {
  try {
    const feed = await fetchLivePrices();
    return feed.prices[coinId]?.current_price ?? null;
  } catch {
    return null;
  }
}

// ─── Auto-resolution helpers ──────────────────────────────────────────────────

/**
 * Map a market's slug to a CoinGecko coin ID + resolution condition.
 * Returns null if the market is not price-based.
 */
export interface ResolutionCondition {
  coinId: string;
  /** "above" | "below" — direction of the threshold */
  direction: "above" | "below";
  /** Price threshold in USD */
  threshold: number;
  /** Which outcome index wins if condition is met (0 = Yes, 1 = No) */
  yesOutcomeIndex: number;
}

const MARKET_CONDITIONS: Record<string, ResolutionCondition> = {
  "bitcoin-above-100k-may-2026": {
    coinId: "bitcoin",
    direction: "above",
    threshold: 100_000,
    yesOutcomeIndex: 0,
  },
  "bitcoin-above-150k-2026": {
    coinId: "bitcoin",
    direction: "above",
    threshold: 150_000,
    yesOutcomeIndex: 0,
  },
  "ethereum-above-5000-q2-2026": {
    coinId: "ethereum",
    direction: "above",
    threshold: 5_000,
    yesOutcomeIndex: 0,
  },
  "celo-above-1-dollar-2026": {
    coinId: "celo",
    direction: "above",
    threshold: 1.0,
    yesOutcomeIndex: 0,
  },
  "solana-above-300-q2-2026": {
    coinId: "solana",
    direction: "above",
    threshold: 300,
    yesOutcomeIndex: 0,
  },
};

/**
 * Check if a market's price condition is met given current prices.
 * Returns the winning outcome index (0-based) or null if not yet resolved.
 */
export function checkResolutionCondition(
  marketSlug: string,
  prices: Record<string, PriceData>
): { winningOutcomeIndex: number; price: number } | null {
  const condition = MARKET_CONDITIONS[marketSlug];
  if (!condition) return null;

  const coin = prices[condition.coinId];
  if (!coin) return null;

  const currentPrice = coin.current_price;
  const conditionMet =
    condition.direction === "above"
      ? currentPrice >= condition.threshold
      : currentPrice <= condition.threshold;

  if (!conditionMet) return null;

  return {
    winningOutcomeIndex: condition.yesOutcomeIndex,
    price: currentPrice,
  };
}

/**
 * Get the resolution condition config for a market slug (for display purposes).
 */
export function getMarketCondition(
  marketSlug: string
): ResolutionCondition | null {
  return MARKET_CONDITIONS[marketSlug] ?? null;
}
