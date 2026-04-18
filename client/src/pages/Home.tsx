import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import MarketCard from "@/components/MarketCard";
import { formatVolume, categoryLabel, categoryClass, cn } from "@/lib/utils";
import {
  TrendingUp, Zap, Shield, Globe, ArrowRight, BarChart3,
  CheckCircle2, Trophy, PlusCircle, ChevronRight,
} from "lucide-react";

const CATEGORIES = [
  { key: "crypto", emoji: "₿", label: "Crypto" },
  { key: "politics", emoji: "🏛", label: "Politics" },
  { key: "sports", emoji: "⚽", label: "Sports" },
  { key: "economics", emoji: "📈", label: "Economics" },
  { key: "technology", emoji: "🤖", label: "Technology" },
  { key: "entertainment", emoji: "🎬", label: "Entertainment" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  const { data: stats } = trpc.markets.stats.useQuery();
  const { data: featured } = trpc.markets.list.useQuery({ featured: true, status: "open", limit: 6 });
  const { data: trending } = trpc.markets.list.useQuery({ status: "open", limit: 8 });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/6 rounded-full blur-[100px]" />
        </div>

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/15 text-primary border-primary/30 font-medium px-3 py-1">
              <Zap className="w-3 h-3 mr-1.5" />
              Powered by Celo · Sub-cent Transactions
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Predict the Future,<br />
              <span className="text-primary">Trade with Confidence</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              AI-powered prediction markets on Celo. Trade outcome shares using cUSD, cEUR, and cREAL stablecoins with near-zero fees.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 shadow-lg shadow-primary/25">
                <Link href="/markets">
                  Explore Markets <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button size="lg" variant="outline" asChild className="border-border/60 bg-card hover:bg-accent font-medium px-8">
                  <a href={getLoginUrl()}>Connect Wallet</a>
                </Button>
              )}
            </div>
          </div>

          {/* Live Stats */}
          {stats && (
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Volume", value: formatVolume(stats.totalVolume), icon: BarChart3 },
                { label: "Open Markets", value: stats.openMarkets.toLocaleString(), icon: TrendingUp },
                { label: "Total Markets", value: stats.totalMarkets.toLocaleString(), icon: Globe },
                { label: "Resolved", value: stats.resolvedMarkets.toLocaleString(), icon: CheckCircle2 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground stat-value">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────────── */}
      <section className="py-10 border-y border-border/60 bg-card/30">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Browse by Category</h2>
            <Link href="/markets">
              <span className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer">
                All Markets <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {CATEGORIES.map(({ key, emoji, label }) => (
              <Link key={key} href={`/markets?category=${key}`}>
                <div className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all hover:scale-105",
                  "bg-card border-border hover:border-primary/40"
                )}>
                  <span className="text-2xl">{emoji}</span>
                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", categoryClass(key))}>
                    {label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Markets ─────────────────────────────────────────────────── */}
      {featured && featured.length > 0 && (
        <section className="py-12">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Featured Markets</h2>
                <p className="text-sm text-muted-foreground mt-1">High-volume markets with real-time AI analysis</p>
              </div>
              <Link href="/markets">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(featured as any[]).map((m: any) => (
                <MarketCard
                  key={m.id}
                  slug={m.slug}
                  title={m.title}
                  category={m.category}
                  status={m.status}
                  totalVolume={m.totalVolume}
                  totalLiquidity={m.totalLiquidity}
                  expiresAt={m.expiresAt}
                  outcomes={[]}
                  featured={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Trending Markets ─────────────────────────────────────────────────── */}
      {trending && trending.length > 0 && (
        <section className="py-12 bg-card/20">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Trending Now</h2>
                <p className="text-sm text-muted-foreground mt-1">Most active markets by trading volume</p>
              </div>
              <Link href="/markets">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(trending as any[]).slice(0, 8).map((m: any) => (
                <MarketCard
                  key={m.id}
                  slug={m.slug}
                  title={m.title}
                  category={m.category}
                  status={m.status}
                  totalVolume={m.totalVolume}
                  totalLiquidity={m.totalLiquidity}
                  expiresAt={m.expiresAt}
                  outcomes={[]}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-border/60">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-3">Why CeloPredict?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">The most efficient prediction market platform, built on Celo's fast, low-cost infrastructure.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Sub-cent Fees",
                desc: "Trade outcome shares for less than $0.01 per transaction on Celo L2, secured by Ethereum.",
                color: "text-yellow-400",
                bg: "bg-yellow-400/10",
              },
              {
                icon: Shield,
                title: "AI-Powered Forecasting",
                desc: "Every market features real-time AI analysis of probabilities, sentiment, and likely outcomes.",
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                icon: Globe,
                title: "Multi-Stablecoin",
                desc: "Trade using cUSD, cEUR, or cREAL — Celo's native stablecoins pegged to real-world currencies.",
                color: "text-purple-400",
                bg: "bg-purple-400/10",
              },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-6">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4", bg)}>
                  <Icon className={cn("w-5 h-5", color)} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-border/60">
        <div className="container">
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl p-10 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">Ready to Start Predicting?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">Connect your wallet, get 1,000 cUSD in simulated balance, and start trading on real-world events.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8">
                <Link href="/markets">Start Trading <TrendingUp className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-border/60 bg-card hover:bg-accent font-medium px-8">
                <Link href="/create">Create a Market <PlusCircle className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/60 py-8 bg-card/30">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">CeloPredict</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            AI-powered prediction markets on Celo · cUSD · cEUR · cREAL
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/markets"><span className="hover:text-foreground cursor-pointer">Markets</span></Link>
            <Link href="/leaderboard"><span className="hover:text-foreground cursor-pointer">Leaderboard</span></Link>
            <Link href="/create"><span className="hover:text-foreground cursor-pointer">Create</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
