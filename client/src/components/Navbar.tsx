import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { shortenAddress, formatCurrency } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";
import WalletConnectButton from "@/components/WalletConnectButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, LayoutDashboard, PlusCircle, Trophy, CheckCircle2,
  Wallet, ChevronDown, LogOut, User, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/markets", label: "Markets", icon: TrendingUp },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/resolved", label: "Resolved", icon: CheckCircle2 },
  { href: "/portfolio", label: "Portfolio", icon: LayoutDashboard },
  { href: "/create", label: "Create", icon: PlusCircle },
];

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isConnected: walletConnected } = useWallet();

  const { data: wallet } = trpc.trading.wallet.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <TrendingUp className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            Celo<span className="text-primary">Predict</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}>
              <span className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                location === href || location.startsWith(href + "/")
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}>
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* On-chain wallet (MiniPay / injected) */}
          <div className="hidden md:block">
            <WalletConnectButton />
          </div>

          {/* Simulated platform balance (shown when logged in) */}
          {isAuthenticated && wallet ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 border-border/60 bg-card hover:bg-accent text-sm">
                  <Wallet className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium text-foreground">{formatCurrency(wallet.cUSD, "cUSD", 2)}</span>
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-0.5">Platform</Badge>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-card border-border">
                <div className="px-3 py-2">
                  <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Platform Balances</p>
                  <p className="text-[10px] text-muted-foreground/70 mb-2">Simulated balances for trading on CeloPredict</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">cUSD</span>
                      <Badge variant="outline" className="cat-economics font-mono text-xs">{formatCurrency(wallet.cUSD, "", 2)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">cEUR</span>
                      <Badge variant="outline" className="cat-politics font-mono text-xs">{formatCurrency(wallet.cEUR, "", 2)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">cREAL</span>
                      <Badge variant="outline" className="cat-sports font-mono text-xs">{formatCurrency(wallet.cREAL, "", 2)}</Badge>
                    </div>
                  </div>
                  {walletConnected && (
                    <div className="mt-3 pt-2 border-t border-border">
                      <p className="text-[10px] text-muted-foreground/70">
                        On-chain wallet connected — use the wallet button to view real balances
                      </p>
                    </div>
                  )}
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">Platform Address</p>
                    <p className="text-xs font-mono text-primary mt-0.5">{shortenAddress(wallet.walletAddress)}</p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="hidden md:block text-foreground font-medium">{user?.name?.split(" ")[0] ?? "Account"}</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem asChild>
                  <Link href="/portfolio" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="w-4 h-4" /> Portfolio
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          )}

          {/* Mobile menu toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="container py-3 space-y-1">
            {/* Mobile wallet connect */}
            <div className="px-3 py-2">
              <WalletConnectButton />
            </div>
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                <span className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium cursor-pointer",
                  location === href ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}>
                  <Icon className="w-4 h-4" /> {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
