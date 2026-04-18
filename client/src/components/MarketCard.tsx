import { Link } from "wouter";
import { Clock, TrendingUp, Droplets } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatVolume, formatProbability, timeRemaining, categoryLabel, categoryClass } from "@/lib/utils";

interface Outcome {
  id: number;
  label: string;
  probability: string;
  pricePerShare: string;
}

interface MarketCardProps {
  slug: string;
  title: string;
  category: string;
  status: string;
  totalVolume: string;
  totalLiquidity: string;
  expiresAt: Date | string;
  outcomes: Outcome[];
  featured?: boolean;
}

export default function MarketCard({
  slug, title, category, status, totalVolume, totalLiquidity, expiresAt, outcomes, featured,
}: MarketCardProps) {
  const topOutcome = outcomes[0];
  const secondOutcome = outcomes[1];
  const topProb = topOutcome ? parseFloat(topOutcome.probability) : 0.5;
  const secondProb = secondOutcome ? parseFloat(secondOutcome.probability) : 1 - topProb;
  const isBinary = outcomes.length === 2;
  const timeLeft = timeRemaining(expiresAt);
  const isExpired = timeLeft === "Expired";

  return (
    <Link href={`/markets/${slug}`}>
      <div className={cn(
        "market-card group relative bg-card border border-border rounded-xl p-4 cursor-pointer h-full flex flex-col",
        featured && "border-primary/30 bg-gradient-to-br from-card to-primary/5"
      )}>
        {featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5">
              Featured
            </Badge>
          </div>
        )}

        {/* Category + Status */}
        <div className="flex items-center gap-2 mb-3">
          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", categoryClass(category))}>
            {categoryLabel(category)}
          </span>
          {status === "resolved" && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              Resolved
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground leading-snug mb-3 flex-1 line-clamp-3 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Probability bar (binary markets) */}
        {isBinary && topOutcome && secondOutcome && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-emerald-400">{topOutcome.label}</span>
              <span className="font-mono font-bold text-emerald-400">{formatProbability(topProb)}</span>
            </div>
            <div className="prob-bar">
              <div className="prob-fill-yes h-full" style={{ width: `${topProb * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs mt-1.5">
              <span className="font-medium text-red-400">{secondOutcome.label}</span>
              <span className="font-mono font-bold text-red-400">{formatProbability(secondProb)}</span>
            </div>
          </div>
        )}

        {/* Multi-outcome */}
        {!isBinary && outcomes.length > 0 && (
          <div className="mb-3 space-y-1.5">
            {outcomes.slice(0, 3).map((o) => (
              <div key={o.id} className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-primary/70 rounded-full"
                    style={{ width: `${parseFloat(o.probability) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right font-mono">
                  {formatProbability(o.probability)}
                </span>
                <span className="text-xs text-foreground w-28 truncate">{o.label}</span>
              </div>
            ))}
            {outcomes.length > 3 && (
              <p className="text-xs text-muted-foreground">+{outcomes.length - 3} more outcomes</p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {formatVolume(totalVolume)}
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3" />
              {formatVolume(totalLiquidity)}
            </span>
          </div>
          <span className={cn("flex items-center gap-1", isExpired && "text-destructive")}>
            <Clock className="w-3 h-3" />
            {timeLeft}
          </span>
        </div>
      </div>
    </Link>
  );
}
