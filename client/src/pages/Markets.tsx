import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import MarketCard from "@/components/MarketCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, categoryLabel, categoryClass } from "@/lib/utils";
import { Search, SlidersHorizontal, X } from "lucide-react";

const CATEGORIES = ["all", "crypto", "politics", "sports", "economics", "technology", "entertainment"];
const STATUSES = ["open", "resolved", "closed"];

export default function Markets() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialCategory = params.get("category") ?? "all";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState("open");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: markets, isLoading } = trpc.markets.list.useQuery({
    category: category === "all" ? undefined : category,
    status,
    search: debouncedSearch || undefined,
    limit: 50,
  });

  // Fetch outcomes for each market
  const { data: allOutcomes } = trpc.markets.list.useQuery({ limit: 100 });

  // Build a slug→outcomes map by fetching individual markets
  // We'll show cards without outcomes for the list view (outcomes shown on detail)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Prediction Markets</h1>
          <p className="text-muted-foreground text-sm">
            {markets ? `${markets.length} markets` : "Loading..."} · Real events, real stakes
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search markets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-card border-border focus:border-primary"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            {STATUSES.map(s => (
              <Button
                key={s}
                size="sm"
                variant={status === s ? "default" : "outline"}
                onClick={() => setStatus(s)}
                className={cn(
                  "capitalize text-xs",
                  status === s ? "bg-primary text-primary-foreground" : "border-border/60 bg-card hover:bg-accent"
                )}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                category === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : cat === "all"
                    ? "border-border/60 bg-card text-muted-foreground hover:text-foreground hover:bg-accent"
                    : cn("border", categoryClass(cat), "hover:opacity-80")
              )}
            >
              {cat === "all" ? "All Categories" : categoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Market grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-xl bg-card" />
            ))}
          </div>
        ) : !markets || markets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg font-medium">No markets found</p>
            <p className="text-muted-foreground text-sm mt-2">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(markets as any[]).map((m: any) => (
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
                featured={m.featured}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
