import { createConfig, http } from "wagmi";
import { celo, celoAlfajores } from "viem/chains";
import { injected } from "wagmi/connectors";

/**
 * Wagmi config for Celo + MiniPay.
 * Uses the injected connector which picks up window.ethereum from MiniPay
 * (or any other injected wallet like MetaMask on desktop).
 */
export const wagmiConfig = createConfig({
  chains: [celo, celoAlfajores],
  connectors: [
    injected({
      target: "metaMask", // falls back to any injected provider
    }),
    injected(), // generic injected — catches MiniPay's window.ethereum
  ],
  transports: {
    [celo.id]: http("https://forno.celo.org"),
    [celoAlfajores.id]: http("https://alfajores-forno.celo-testnet.org"),
  },
});

/**
 * Celo Mainnet stablecoin contract addresses.
 * Source: https://docs.minipay.xyz/technical-references/retrieve-balance.html
 */
export const CELO_TOKENS = {
  cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as `0x${string}`,
  cEUR: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73" as `0x${string}`,
  cREAL: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787" as `0x${string}`,
  CELO: "0x471EcE3750Da237f93B8E339c536989b8978a438" as `0x${string}`,
} as const;

/**
 * Detect if the app is running inside MiniPay.
 */
export function isMiniPay(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as { ethereum?: { isMiniPay?: boolean } })
    .ethereum?.isMiniPay;
}
