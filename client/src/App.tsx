import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import PriceTicker from "./components/PriceTicker";
import Home from "./pages/Home";
import Markets from "./pages/Markets";
import MarketDetail from "./pages/MarketDetail";
import Portfolio from "./pages/Portfolio";
import CreateMarket from "./pages/CreateMarket";
import Leaderboard from "./pages/Leaderboard";
import ResolutionFeed from "./pages/ResolutionFeed";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PriceTicker />
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/markets" component={Markets} />
        <Route path="/markets/:slug" component={MarketDetail} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/create" component={CreateMarket} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/resolved" component={ResolutionFeed} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster theme="dark" position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
