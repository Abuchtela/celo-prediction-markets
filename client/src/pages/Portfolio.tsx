import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCurrency, formatProbability, pnlColor, categoryClass, categoryLabel, cn, shortenAddress,
} from "@/lib/utils";
import {
  Wallet, TrendingUp, TrendingDown, BarChart3, Clock, ArrowRight,
  LogIn, CircleDollarSign, Target,
} from "lucide-react";

export default function Portfolio() {
  const { isAuthenticated, user } = useAuth();

  const { data: wallet, isLoading: walletLoading } = trpc.trading.wallet.useQuery(undefined, { enabled: isAuthenticated });
  const { data: positions, isLoading: posLoading } = trpc.trading.myPositions.useQuery(undefined, { enabled: isAuthenticated });
  const { data: bets, isLoading: betsLoading } = trpc.trading.myBets.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <LogIn className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">Sign in to view your portfolio, positions, and trade history.</p>
          <Button asChild className="bg-primary text-primary-foreground">
            <a href={getLoginUrl()}>Connect Wallet</a>
          </Button>
        </div>
      </div>
    );
  }

  const totalUnrealizedPnl = (positions as any[])?.reduce((sum: number, p: any) => sum + (p.unrealizedPnl ?? 0), 0) ?? 0;
  const totalInvested = (positions as any[])?.reduce((sum: number, p: any) => sum + parseFloat(p.totalInvested ?? "0"), 0) ?? 0;
  const totalCurrentValue = (positions as any[])?.reduce((sum: number, p: any) => sum + (p.currentValue ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Portfolio</h1>
          <p className="text-sm text-muted-foreground">
            {user?.name ?? "Your"} · {wallet ? shortenAddress(wallet.walletAddress) : ""}
          </p>
        </div>

        {/* Wallet Balances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {walletLoading ? (
            <>
              <Skeleton className="h-28 rounded-xl bg-card" />
              <Skeleton className="h-28 rounded-xl bg-card" />
              <Skeleton className="h-28 rounded-xl bg-card" />
            </>
          ) : wallet ? (
            <>
              {[
                { label: "cUSD Balance", value: wallet.cUSD, color: "text-primary", bg: "bg-primary/10", icon: CircleDollarSign, desc: "US Dollar Stablecoin" },
                { label: "cEUR Balance", value: wallet.cEUR, color: "text-purple-400", bg: "bg-purple-400/10", icon: CircleDollarSign, desc: "Euro Stablecoin" },
                { label: "cREAL Balance", value: wallet.cREAL, color: "text-yellow-400", bg: "bg-yellow-400/10", icon: CircleDollarSign, desc: "Brazilian Real Stablecoin" },
              ].map(({ label, value, color, bg, icon: Icon, desc }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", bg)}>
                      <Icon className={cn("w-4.5 h-4.5", color)} />
                    </div>
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className={cn("text-2xl font-bold font-mono", color)}>{formatCurrency(value, "", 2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                  <p className="text-[10px] text-muted-foreground/60">{desc}</p>
                </div>
              ))}
            </>
          ) : null}
        </div>

        {/* Portfolio Summary */}
        {positions && (positions as any[]).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
              <p className="text-xl font-bold font-mono text-foreground">{formatCurrency(totalInvested, "cUSD")}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Current Value</p>
              <p className="text-xl font-bold font-mono text-foreground">{formatCurrency(totalCurrentValue, "cUSD")}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Unrealized P&L</p>
              <p className={cn("text-xl font-bold font-mono", pnlColor(totalUnrealizedPnl))}>
                {totalUnrealizedPnl >= 0 ? "+" : ""}{formatCurrency(totalUnrealizedPnl, "cUSD")}
              </p>
            </div>
          </div>
        )}

        {/* Active Positions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Active Positions
          </h2>
          {posLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl bg-card" />)}
            </div>
          ) : !positions || (positions as any[]).length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No active positions</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Start trading to build your portfolio</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/markets">Browse Markets <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {(positions as any[]).map((pos: any) => {
                const shares = parseFloat(pos.shares);
                const invested = parseFloat(pos.totalInvested);
                const currentVal = pos.currentValue ?? 0;
                const pnl = pos.unrealizedPnl ?? 0;
                const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;

                return (
                  <Link key={pos.id} href={pos.market ? `/markets/${pos.market.slug}` : "#"}>
                    <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {pos.market && (
                              <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full border", categoryClass(pos.market.category))}>
                                {categoryLabel(pos.market.category)}
                              </span>
                            )}
                            {pos.outcome && (
                              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                                {pos.outcome.label}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {pos.market?.title ?? "Unknown Market"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {shares.toFixed(2)} shares · avg {formatCurrency(pos.avgCostPerShare, "cUSD", 4)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold font-mono text-foreground">{formatCurrency(currentVal, "cUSD")}</p>
                          <p className={cn("text-xs font-mono font-semibold", pnlColor(pnl))}>
                            {pnl >= 0 ? "+" : ""}{formatCurrency(pnl, "cUSD")} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Trade History */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Trade History
          </h2>
          {betsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-lg bg-card" />)}
            </div>
          ) : !bets || (bets as any[]).length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">No trades yet</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shares</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Currency</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(bets as any[]).map((bet: any) => (
                    <tr key={bet.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className={cn("flex items-center gap-1 font-semibold text-xs", bet.type === "buy" ? "text-emerald-400" : "text-red-400")}>
                          {bet.type === "buy" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {bet.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-foreground">{parseFloat(bet.shares).toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{parseFloat(bet.pricePerShare).toFixed(4)}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-foreground">{formatCurrency(bet.totalCost, "", 2)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px] cat-economics">{bet.currency}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(bet.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
