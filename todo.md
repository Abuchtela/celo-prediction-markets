# Celo Predict — TODO

## Database & Backend
- [x] Database schema: markets, outcomes, bets, positions, users extension, leaderboard
- [x] Seed data: 19 real current-events prediction markets across categories
- [x] tRPC routes: markets CRUD, betting, portfolio, leaderboard, AI forecast, wallet
- [x] AI forecasting endpoint using LLM

## Frontend Pages & Features
- [x] Global layout: top navigation, footer, theme (dark elegant)
- [x] Landing page: hero, live stats, featured markets, categories
- [x] Markets browse page: search, filter by category, sort options
- [x] Market detail page: odds, liquidity, volume, time remaining, outcome shares
- [x] Bet placement UI: buy/sell outcome shares with cUSD balance
- [x] AI probability forecasting panel on market detail
- [x] Portfolio dashboard: active positions, P&L, resolved history
- [x] Market creation form: question, category, expiry, outcomes
- [x] Leaderboard: ranked by accuracy score and total winnings
- [x] Resolution feed: recently settled markets and payout distributions
- [x] Wallet connect UI: cUSD, cEUR, cREAL balance display

## Polish & Quality
- [x] Responsive design across all pages
- [x] Loading states and skeleton screens
- [x] Error handling and empty states
- [x] Vitest unit tests (12 tests, all passing)
- [x] GitHub repo: Abuchtela/celo-prediction-markets
