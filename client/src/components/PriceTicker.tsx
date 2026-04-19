import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

function formatPrice(price: number | null): string {
  if (price === null) return "—";
  if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

function formatChange(change: number | null): string {
  if (change === null) return "";
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

export default function PriceTicker() {
  const { data: ticker } = trpc.prices.ticker.useQuery(undefined, {
    refetchInterval: 60_000, // refresh every 60s (CoinGecko cache TTL)
    staleTime: 55_000,
  });

  if (!ticker || ticker.length === 0) return null;

  return (
    <div className="border-b border-border/40 bg-background/60 backdrop-blur-sm overflow-hidden">
      <div className="container">
        <div className="flex items-center gap-6 py-1.5 overflow-x-auto scrollbar-none">
          {ticker.map((coin) => {
            const isPositive = (coin.change24h ?? 0) >= 0;
            const isNeutral = coin.change24h === null;
            return (
              <div
                key={coin.id}
                className="flex items-center gap-2 shrink-0 text-xs"
              >
                <span className="font-semibold text-foreground/80 tracking-wide">
                  {coin.symbol}
                </span>
                <span className="font-mono font-medium text-foreground">
                  {formatPrice(coin.price)}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-0.5 font-mono",
                    isNeutral
                      ? "text-muted-foreground"
                      : isPositive
                      ? "text-emerald-400"
                      : "text-red-400"
                  )}
                >
                  {isNeutral ? (
                    <Minus className="h-3 w-3" />
                  ) : isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {formatChange(coin.change24h)}
                </span>
              </div>
            );
          })}
          <div className="shrink-0 text-[10px] text-muted-foreground/50 ml-auto">
            via CoinGecko · live
          </div>
        </div>
      </div>
    </div>
  );
}
