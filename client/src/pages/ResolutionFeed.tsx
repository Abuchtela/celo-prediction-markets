import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatVolume, formatProbability, categoryLabel, categoryClass, cn } from "@/lib/utils";
import { CheckCircle2, Calendar, TrendingUp, Droplets } from "lucide-react";

export default function ResolutionFeed() {
  const { data: resolved, isLoading } = trpc.resolution.feed.useQuery({ limit: 20 });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" /> Resolution Feed
          </h1>
          <p className="text-sm text-muted-foreground">Recently settled markets and their winning outcomes</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl bg-card" />
            ))}
          </div>
        ) : !resolved || (resolved as any[]).length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No resolved markets yet</p>
            <p className="text-sm text-muted-foreground mt-1">Check back after markets expire and get settled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(resolved as any[]).map((market: any) => {
              const winner = market.winningOutcome;
              const outcomes = market.outcomes ?? [];

              return (
                <Link key={market.id} href={`/markets/${market.slug}`}>
                  <div className="bg-card border border-emerald-500/20 rounded-xl p-5 hover:border-emerald-500/40 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", categoryClass(market.category))}>
                            {categoryLabel(market.category)}
                          </span>
                          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Resolved
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">{market.title}</h3>
                      </div>
                    </div>

                    {/* Winning outcome */}
                    {winner && (
                      <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-lg p-3 mb-3">
                        <p className="text-xs text-emerald-400/70 font-semibold uppercase tracking-wider mb-1">Winning Outcome</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-400 text-sm">{winner.label}</span>
                          <span className="text-xs font-mono text-emerald-400/70">
                            Final: {formatProbability(winner.probability)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* All outcomes final probabilities */}
                    {outcomes.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        {outcomes.map((o: any) => {
                          const prob = parseFloat(o.probability);
                          const isWinner = o.id === market.resolvedOutcomeId;
                          return (
                            <div key={o.id} className="flex items-center gap-2">
                              <span className={cn("text-xs w-32 truncate", isWinner ? "text-emerald-400 font-semibold" : "text-muted-foreground")}>
                                {o.label}
                              </span>
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full", isWinner ? "bg-emerald-500" : "bg-muted-foreground/30")}
                                  style={{ width: `${prob * 100}%` }}
                                />
                              </div>
                              <span className={cn("text-xs font-mono w-10 text-right", isWinner ? "text-emerald-400 font-bold" : "text-muted-foreground")}>
                                {formatProbability(prob)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/60">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {formatVolume(market.totalVolume)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3 h-3" /> {formatVolume(market.totalLiquidity)}
                      </span>
                      {market.resolvedAt && (
                        <span className="flex items-center gap-1 ml-auto">
                          <Calendar className="w-3 h-3" />
                          Resolved {new Date(market.resolvedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
