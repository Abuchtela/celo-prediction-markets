import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, shortenAddress, cn } from "@/lib/utils";
import { Trophy, Medal, Star, TrendingUp, Target } from "lucide-react";

const RANK_STYLES: Record<number, { icon: React.ReactNode; color: string; bg: string }> = {
  1: { icon: <Trophy className="w-4 h-4" />, color: "text-yellow-400", bg: "bg-yellow-400/15 border-yellow-400/30" },
  2: { icon: <Medal className="w-4 h-4" />, color: "text-slate-300", bg: "bg-slate-300/15 border-slate-300/30" },
  3: { icon: <Medal className="w-4 h-4" />, color: "text-amber-600", bg: "bg-amber-600/15 border-amber-600/30" },
};

export default function Leaderboard() {
  const { data: leaders, isLoading } = trpc.leaderboard.top.useQuery({ limit: 20 });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" /> Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground">Top forecasters ranked by accuracy and total winnings</p>
        </div>

        {/* Top 3 podium */}
        {!isLoading && leaders && (leaders as any[]).length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[1, 0, 2].map((idx) => {
              const entry = (leaders as any[])[idx];
              if (!entry) return null;
              const rank = idx + 1;
              const style = RANK_STYLES[rank] ?? { icon: <Star className="w-4 h-4" />, color: "text-muted-foreground", bg: "bg-muted/20 border-border" };
              return (
                <div key={entry.id} className={cn(
                  "bg-card border rounded-xl p-5 text-center",
                  idx === 0 ? "border-yellow-400/30 bg-gradient-to-b from-yellow-400/5 to-card" : "border-border",
                  idx === 0 && "order-2 md:scale-105"
                )}>
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 border", style.bg)}>
                    <span className={style.color}>{style.icon}</span>
                  </div>
                  <p className="font-bold text-foreground text-sm truncate">{entry.name ?? "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{shortenAddress(entry.walletAddress ?? "")}</p>
                  <p className={cn("text-lg font-bold font-mono mt-2", style.color)}>
                    {formatCurrency(entry.totalWinnings, "cUSD", 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Winnings</p>
                  <div className="mt-3 flex justify-center gap-3 text-xs">
                    <span className="text-primary font-semibold">{(parseFloat(entry.accuracyScore) * 100).toFixed(1)}% acc</span>
                    <span className="text-muted-foreground">{entry.marketsWon}/{entry.marketsParticipated} won</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <div className="grid grid-cols-12 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Forecaster</div>
              <div className="col-span-2 text-right">Winnings</div>
              <div className="col-span-2 text-right">Accuracy</div>
              <div className="col-span-2 text-right">Markets</div>
              <div className="col-span-1 text-right">Won</div>
            </div>
          </div>

          {isLoading ? (
            <div className="divide-y divide-border/60">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="px-4 py-3">
                  <Skeleton className="h-8 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : !leaders || (leaders as any[]).length === 0 ? (
            <div className="py-16 text-center">
              <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No forecasters yet. Be the first!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {(leaders as any[]).map((entry: any, idx: number) => {
                const rank = idx + 1;
                const style = RANK_STYLES[rank];
                const accuracy = parseFloat(entry.accuracyScore ?? "0") * 100;
                const winRate = entry.marketsParticipated > 0
                  ? (entry.marketsWon / entry.marketsParticipated) * 100 : 0;

                return (
                  <div key={entry.id} className={cn(
                    "px-4 py-3 hover:bg-muted/20 transition-colors",
                    rank <= 3 && "bg-gradient-to-r from-transparent to-transparent"
                  )}>
                    <div className="grid grid-cols-12 items-center text-sm">
                      <div className="col-span-1">
                        {style ? (
                          <span className={cn("font-bold", style.color)}>{rank}</span>
                        ) : (
                          <span className="text-muted-foreground font-mono">{rank}</span>
                        )}
                      </div>
                      <div className="col-span-4 flex items-center gap-2 min-w-0">
                        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                          style ? cn(style.bg, style.color) : "bg-muted text-muted-foreground border border-border"
                        )}>
                          {(entry.name ?? "?")[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-xs truncate">{entry.name ?? "Anonymous"}</p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">{shortenAddress(entry.walletAddress ?? "")}</p>
                        </div>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="font-bold font-mono text-primary text-xs">
                          {formatCurrency(entry.totalWinnings, "cUSD", 0)}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${accuracy}%` }} />
                          </div>
                          <span className="text-xs font-mono text-foreground">{accuracy.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-xs text-muted-foreground font-mono">{entry.marketsParticipated}</span>
                      </div>
                      <div className="col-span-1 text-right">
                        <Badge variant="outline" className={cn("text-[10px]", winRate >= 70 ? "border-emerald-500/30 text-emerald-400" : "border-border text-muted-foreground")}>
                          {entry.marketsWon}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
