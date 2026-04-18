import { useState } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  formatCurrency, formatVolume, formatProbability, timeRemaining,
  categoryLabel, categoryClass, cn, pnlColor,
} from "@/lib/utils";
import {
  Clock, TrendingUp, Droplets, Brain, ArrowLeft, CheckCircle2,
  AlertCircle, Minus, Plus, Zap, BarChart3,
} from "lucide-react";
import { Streamdown } from "streamdown";

export default function MarketDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();

  const [selectedOutcomeId, setSelectedOutcomeId] = useState<number | null>(null);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [shares, setShares] = useState("10");
  const [currency] = useState<"cUSD" | "cEUR" | "cREAL">("cUSD");

  const { data, isLoading, refetch } = trpc.markets.bySlug.useQuery({ slug: slug! }, { enabled: !!slug });
  const { data: forecast, isLoading: forecastLoading } = trpc.ai.forecast.useQuery(
    { marketId: data?.market.id ?? 0 },
    { enabled: !!data?.market.id }
  );
  const { data: wallet, refetch: refetchWallet } = trpc.trading.wallet.useQuery(undefined, { enabled: isAuthenticated });

  const placeBet = trpc.trading.placeBet.useMutation({
    onSuccess: (result) => {
      toast.success(`Trade executed! Paid ${formatCurrency(result.totalCost, currency)}`);
      refetch();
      refetchWallet();
      setShares("10");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8 space-y-4">
          <Skeleton className="h-8 w-48 bg-card" />
          <Skeleton className="h-64 bg-card rounded-xl" />
          <Skeleton className="h-48 bg-card rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Market Not Found</h2>
          <Link href="/markets"><Button variant="outline">Back to Markets</Button></Link>
        </div>
      </div>
    );
  }

  const { market, outcomes } = data;
  const selectedOutcome = outcomes.find(o => o.id === selectedOutcomeId);
  const sharesNum = parseFloat(shares) || 0;
  const estimatedCost = selectedOutcome ? sharesNum * parseFloat(selectedOutcome.pricePerShare) : 0;
  const estimatedPayout = sharesNum; // 1 share = 1 cUSD if wins
  const potentialProfit = estimatedPayout - estimatedCost;
  const isOpen = market.status === "open";
  const timeLeft = timeRemaining(market.expiresAt);

  const handleTrade = () => {
    if (!selectedOutcomeId) { toast.error("Select an outcome first"); return; }
    if (sharesNum <= 0) { toast.error("Enter a valid number of shares"); return; }
    placeBet.mutate({ marketId: market.id, outcomeId: selectedOutcomeId, type: tradeType, shares: sharesNum, currency });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/markets"><span className="hover:text-foreground cursor-pointer flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Markets</span></Link>
          <span>/</span>
          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", categoryClass(market.category))}>
            {categoryLabel(market.category)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Market Info ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Market Header */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-xl font-bold text-foreground leading-snug flex-1">{market.title}</h1>
                {market.status === "resolved" ? (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shrink-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Resolved
                  </Badge>
                ) : (
                  <Badge className="bg-primary/15 text-primary border-primary/30 shrink-0">Live</Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{market.description}</p>

              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Volume", value: formatVolume(market.totalVolume), icon: BarChart3 },
                  { label: "Liquidity", value: formatVolume(market.totalLiquidity), icon: Droplets },
                  { label: "Time Left", value: timeLeft, icon: Clock },
                  { label: "Outcomes", value: outcomes.length.toString(), icon: TrendingUp },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-muted/40 rounded-lg p-3 text-center">
                    <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-base font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              {/* Resolution Criteria */}
              {market.resolutionCriteria && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Resolution Criteria</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">{market.resolutionCriteria}</p>
                </div>
              )}
            </div>

            {/* Outcomes / Odds */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Outcomes & Odds
              </h2>
              <div className="space-y-3">
                {outcomes.map((outcome, idx) => {
                  const prob = parseFloat(outcome.probability);
                  const price = parseFloat(outcome.pricePerShare);
                  const isSelected = selectedOutcomeId === outcome.id;
                  const isWinner = market.resolvedOutcomeId === outcome.id;
                  const colors = ["bg-emerald-500", "bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-purple-500"];
                  const barColor = colors[idx % colors.length];

                  return (
                    <button
                      key={outcome.id}
                      onClick={() => isOpen && setSelectedOutcomeId(isSelected ? null : outcome.id)}
                      disabled={!isOpen}
                      className={cn(
                        "w-full text-left p-4 rounded-lg border transition-all",
                        isOpen && "cursor-pointer hover:border-primary/40",
                        isSelected ? "border-primary bg-primary/10" : "border-border bg-muted/20",
                        isWinner && "border-emerald-500/50 bg-emerald-500/10"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isWinner && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          <span className="font-semibold text-foreground text-sm">{outcome.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground font-mono">{price.toFixed(3)} cUSD/share</span>
                          <span className={cn("text-sm font-bold font-mono", isWinner ? "text-emerald-400" : "text-foreground")}>
                            {formatProbability(prob)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${prob * 100}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Forecast */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" /> AI Probability Analysis
              </h2>
              {forecastLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-muted" />
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                  <Skeleton className="h-4 w-5/6 bg-muted" />
                </div>
              ) : forecast ? (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                    <Streamdown className="text-sm text-foreground/90 leading-relaxed">{(forecast as any).analysis}</Streamdown>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Probability Estimates</p>
                    {((forecast as any).outcomeAssessments ?? []).map((oa: any) => (
                      <div key={oa.label} className="flex items-center gap-3">
                        <span className="text-xs text-foreground w-40 truncate">{oa.label}</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-purple-400/70 rounded-full" style={{ width: `${oa.probability * 100}%` }} />
                        </div>
                        <span className="text-xs font-mono font-bold text-purple-400 w-12 text-right">
                          {formatProbability(oa.probability)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Suggested: <span className="text-primary font-semibold">{(forecast as any).suggestedOutcome}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Confidence: <span className="text-purple-400 font-semibold">{formatProbability((forecast as any).confidence)}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">AI analysis unavailable</p>
              )}
            </div>
          </div>

          {/* ── Right: Trading Panel ──────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Wallet */}
            {isAuthenticated && wallet && (
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Wallet</p>
                <div className="space-y-2">
                  {[
                    { label: "cUSD", value: wallet.cUSD, active: currency === "cUSD" },
                    { label: "cEUR", value: wallet.cEUR, active: currency === "cEUR" },
                    { label: "cREAL", value: wallet.cREAL, active: currency === "cREAL" },
                  ].map(({ label, value, active }) => (
                    <div key={label} className={cn("flex justify-between items-center p-2 rounded-lg", active && "bg-primary/10")}>
                      <span className={cn("text-xs font-semibold", active ? "text-primary" : "text-muted-foreground")}>{label}</span>
                      <span className={cn("text-sm font-mono font-bold", active ? "text-primary" : "text-foreground")}>
                        {formatCurrency(value, "", 2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trade Panel */}
            <div className="bg-card border border-border rounded-xl p-5 sticky top-20">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Place Trade
              </h2>

              {!isAuthenticated ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">Connect your wallet to trade</p>
                  <Button asChild className="w-full bg-primary text-primary-foreground">
                    <a href={getLoginUrl()}>Connect Wallet</a>
                  </Button>
                </div>
              ) : !isOpen ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">This market is closed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Buy / Sell toggle */}
                  <div className="flex rounded-lg overflow-hidden border border-border">
                    <button
                      onClick={() => setTradeType("buy")}
                      className={cn("flex-1 py-2 text-sm font-semibold transition-colors", tradeType === "buy" ? "bg-emerald-500/20 text-emerald-400" : "bg-muted/20 text-muted-foreground hover:text-foreground")}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => setTradeType("sell")}
                      className={cn("flex-1 py-2 text-sm font-semibold transition-colors", tradeType === "sell" ? "bg-red-500/20 text-red-400" : "bg-muted/20 text-muted-foreground hover:text-foreground")}
                    >
                      Sell
                    </button>
                  </div>

                  {/* Outcome selection */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Select Outcome</p>
                    <div className="space-y-2">
                      {outcomes.map(o => (
                        <button
                          key={o.id}
                          onClick={() => setSelectedOutcomeId(o.id === selectedOutcomeId ? null : o.id)}
                          className={cn(
                            "w-full flex items-center justify-between p-2.5 rounded-lg border text-sm transition-all",
                            selectedOutcomeId === o.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-muted/20 text-foreground hover:border-primary/40"
                          )}
                        >
                          <span className="font-medium">{o.label}</span>
                          <span className="font-mono text-xs">{formatProbability(o.probability)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shares input */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Number of Shares</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-9 w-9 border-border/60"
                        onClick={() => setShares(s => String(Math.max(1, parseFloat(s) - 10)))}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={shares}
                        onChange={e => setShares(e.target.value)}
                        className="text-center font-mono bg-card border-border"
                      />
                      <Button variant="outline" size="icon" className="h-9 w-9 border-border/60"
                        onClick={() => setShares(s => String(parseFloat(s) + 10))}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[10, 50, 100, 500].map(n => (
                        <button key={n} onClick={() => setShares(String(n))}
                          className="flex-1 text-xs py-1 rounded border border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cost breakdown */}
                  {selectedOutcome && sharesNum > 0 && (
                    <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price per share</span>
                        <span className="font-mono text-foreground">{parseFloat(selectedOutcome.pricePerShare).toFixed(4)} cUSD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total cost</span>
                        <span className="font-mono font-bold text-foreground">{formatCurrency(estimatedCost, "cUSD")}</span>
                      </div>
                      <div className="flex justify-between border-t border-border/60 pt-1.5">
                        <span className="text-muted-foreground">Potential profit</span>
                        <span className={cn("font-mono font-bold", pnlColor(potentialProfit))}>
                          +{formatCurrency(potentialProfit, "cUSD")}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleTrade}
                    disabled={!selectedOutcomeId || sharesNum <= 0 || placeBet.isPending}
                    className={cn(
                      "w-full font-semibold",
                      tradeType === "buy"
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    )}
                  >
                    {placeBet.isPending ? "Processing..." : `${tradeType === "buy" ? "Buy" : "Sell"} Shares`}
                  </Button>

                  <p className="text-[10px] text-muted-foreground text-center">
                    Trading with simulated cUSD · Celo L2 · Sub-cent fees
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
