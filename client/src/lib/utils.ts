import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number, currency = "cUSD", decimals = 2): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n)) return `0 ${currency}`;
  return `${n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ${currency}`;
}

export function formatProbability(prob: string | number): string {
  const n = typeof prob === "string" ? parseFloat(prob) : prob;
  return `${(n * 100).toFixed(1)}%`;
}

export function formatVolume(vol: string | number): string {
  const n = typeof vol === "string" ? parseFloat(vol) : vol;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function timeRemaining(expiresAt: Date | string): string {
  const end = new Date(expiresAt).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (days > 1) return `${days}d ${hours}h`;
  if (days === 1) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    crypto: "Crypto", politics: "Politics", sports: "Sports",
    economics: "Economics", technology: "Technology", entertainment: "Entertainment",
  };
  return map[cat] ?? cat;
}

export function categoryClass(cat: string): string {
  const map: Record<string, string> = {
    crypto: "cat-crypto", politics: "cat-politics", sports: "cat-sports",
    economics: "cat-economics", technology: "cat-technology", entertainment: "cat-entertainment",
  };
  return map[cat] ?? "";
}

export function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function pnlColor(pnl: number): string {
  if (pnl > 0) return "text-emerald-400";
  if (pnl < 0) return "text-red-400";
  return "text-muted-foreground";
}
