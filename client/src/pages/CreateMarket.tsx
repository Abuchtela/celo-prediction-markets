import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PlusCircle, X, LogIn, Lightbulb } from "lucide-react";

const CATEGORIES = ["crypto", "politics", "sports", "economics", "technology", "entertainment"];

const EXAMPLES = [
  "Will Bitcoin (BTC) close above $120,000 before September 1, 2026?",
  "Will the Fed cut interest rates at the September 2026 FOMC meeting?",
  "Who will win the 2026 FIFA World Cup?",
  "Will OpenAI release GPT-5 before July 2026?",
];

export default function CreateMarket() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [resolutionCriteria, setResolutionCriteria] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [outcomes, setOutcomes] = useState(["Yes", "No"]);

  const createMarket = trpc.markets.create.useMutation({
    onSuccess: (data) => {
      toast.success("Market created successfully!");
      navigate(`/markets/${data.slug}`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const addOutcome = () => {
    if (outcomes.length < 10) setOutcomes([...outcomes, ""]);
  };

  const removeOutcome = (idx: number) => {
    if (outcomes.length > 2) setOutcomes(outcomes.filter((_, i) => i !== idx));
  };

  const updateOutcome = (idx: number, val: string) => {
    setOutcomes(outcomes.map((o, i) => i === idx ? val : o));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length < 10) { toast.error("Title must be at least 10 characters"); return; }
    if (!description.trim() || description.length < 20) { toast.error("Description must be at least 20 characters"); return; }
    if (!category) { toast.error("Select a category"); return; }
    if (!resolutionCriteria.trim() || resolutionCriteria.length < 10) { toast.error("Resolution criteria required"); return; }
    if (!expiresAt) { toast.error("Set an expiry date"); return; }
    if (new Date(expiresAt) <= new Date()) { toast.error("Expiry date must be in the future"); return; }
    const validOutcomes = outcomes.filter(o => o.trim().length > 0);
    if (validOutcomes.length < 2) { toast.error("At least 2 outcomes required"); return; }

    createMarket.mutate({ title, description, category: category as any, resolutionCriteria, expiresAt, outcomes: validOutcomes });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <LogIn className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Sign In to Create Markets</h2>
          <p className="text-muted-foreground mb-6">Connect your wallet to propose new prediction markets.</p>
          <Button asChild className="bg-primary text-primary-foreground">
            <a href={getLoginUrl()}>Connect Wallet</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-primary" /> Create a Market
          </h1>
          <p className="text-sm text-muted-foreground">Propose a new prediction market for the community to trade on.</p>
        </div>

        {/* Examples */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-yellow-400" /> Example Questions
          </p>
          <div className="space-y-1.5">
            {EXAMPLES.map(ex => (
              <button
                key={ex}
                onClick={() => setTitle(ex)}
                className="w-full text-left text-xs text-muted-foreground hover:text-foreground p-2 rounded hover:bg-muted/40 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Market Question *</Label>
            <Textarea
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Will Bitcoin close above $120,000 before September 1, 2026?"
              className="bg-card border-border focus:border-primary resize-none h-20"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/300</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Description *</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide context, background, and relevant information about this market..."
              className="bg-card border-border focus:border-primary resize-none h-28"
              maxLength={2000}
            />
          </div>

          {/* Category + Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-card border-border focus:border-primary capitalize">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Expiry Date *</Label>
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="bg-card border-border focus:border-primary"
              />
            </div>
          </div>

          {/* Resolution Criteria */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Resolution Criteria *</Label>
            <Textarea
              value={resolutionCriteria}
              onChange={e => setResolutionCriteria(e.target.value)}
              placeholder="Resolves YES if CoinGecko daily close price for BTC/USD exceeds $120,000 before September 1, 2026 00:00 UTC."
              className="bg-card border-border focus:border-primary resize-none h-20"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">Be specific and objective. How will this market be resolved?</p>
          </div>

          {/* Outcomes */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Outcomes * (2–10)</Label>
            <div className="space-y-2">
              {outcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={outcome}
                    onChange={e => updateOutcome(idx, e.target.value)}
                    placeholder={`Outcome ${idx + 1}`}
                    className="bg-card border-border focus:border-primary"
                    maxLength={128}
                  />
                  {outcomes.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOutcome(idx)}
                      className="text-muted-foreground hover:text-destructive shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {outcomes.length < 10 && (
              <Button type="button" variant="outline" size="sm" onClick={addOutcome}
                className="border-border/60 text-muted-foreground hover:text-foreground">
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Add Outcome
              </Button>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={createMarket.isPending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-5"
          >
            {createMarket.isPending ? "Creating Market..." : "Create Market"}
          </Button>
        </form>
      </div>
    </div>
  );
}
