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

## MiniPay & Live Data Integration
- [ ] Research MiniPay SDK and wagmi/viem Celo integration approach
- [ ] Install wagmi, viem, @celo/rainbowkit-celo, @rainbow-me/rainbowkit dependencies
- [ ] Configure wagmi with Celo mainnet and Alfajores testnet chains
- [ ] Build WalletProvider context wrapping the app with wagmi + RainbowKit
- [ ] MiniPay detection: auto-connect when window.ethereum is MiniPay
- [ ] Replace simulated wallet UI with real connected wallet address + on-chain cUSD balance
- [ ] Read real cUSD/cEUR/cREAL balances from Celo ERC-20 contracts via viem
- [ ] Backend: CoinGecko price feed endpoint (BTC, ETH, CELO, WTI proxy)
- [ ] Live price ticker in Navbar for BTC and ETH
- [ ] Market detail page: show live current price for relevant crypto markets
- [ ] Auto-resolution trigger: cron job checks CoinGecko prices vs market conditions
- [ ] Resolution feed updates when auto-resolution fires
- [ ] Update tests for new wallet and price feed procedures
