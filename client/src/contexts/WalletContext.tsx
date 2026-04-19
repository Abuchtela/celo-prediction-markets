import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useConnect,
  useConnectors,
  useDisconnect,
  useReadContracts,
} from "wagmi";
import { erc20Abi, formatUnits, type Hex } from "viem";
import { CELO_TOKENS, isMiniPay } from "@/lib/wagmi";
import { useConnection } from "wagmi";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TokenBalance {
  symbol: string;
  balance: string;
  raw: bigint;
  decimals: number;
}

export interface WalletContextValue {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  isMiniPayEnv: boolean;
  chainId: number | undefined;
  balances: Record<string, TokenBalance>;
  balancesLoading: boolean;
  connect: () => void;
  disconnect: () => void;
  error: Error | null;
  /** cUSD balance as a human-readable string, e.g. "42.50" */
  cUSDBalance: string;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const WalletContext = createContext<WalletContextValue>({
  address: undefined,
  isConnected: false,
  isConnecting: false,
  isMiniPayEnv: false,
  chainId: undefined,
  balances: {},
  balancesLoading: false,
  connect: () => {},
  disconnect: () => {},
  error: null,
  cUSDBalance: "0.00",
});

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWallet() {
  return useContext(WalletContext);
}

// ─── Inner component (needs wagmi hooks) ─────────────────────────────────────

function WalletContextInner({ children }: { children: React.ReactNode }) {
  const { address, isConnected, isConnecting, chainId } = useConnection();
  const connectors = useConnectors();
  const { connect: wagmiConnect, error: connectError } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const [hasAttempted, setHasAttempted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const miniPayEnv = isMiniPay();

  // Auto-connect when running inside MiniPay
  useEffect(() => {
    if (hasAttempted || isConnected || connectors.length === 0) return;
    if (!miniPayEnv) return; // Only auto-connect in MiniPay
    const connector = connectors[connectors.length - 1]; // last = generic injected
    wagmiConnect(
      { connector },
      {
        onError: (err) => setError(err),
      }
    );
    setHasAttempted(true);
  }, [connectors, isConnected, hasAttempted, miniPayEnv, wagmiConnect]);

  const connect = useCallback(() => {
    if (connectors.length === 0) return;
    const connector = connectors[connectors.length - 1];
    wagmiConnect(
      { connector },
      { onError: (err) => setError(err) }
    );
  }, [connectors, wagmiConnect]);

  const disconnect = useCallback(() => {
    wagmiDisconnect();
  }, [wagmiDisconnect]);

  // Build multi-token balance contracts query
  const tokenEntries = Object.entries(CELO_TOKENS).filter(
    ([sym]) => sym !== "CELO"
  ); // cUSD, cEUR, cREAL

  const contracts = useMemo(
    () =>
      address
        ? tokenEntries.flatMap(([, tokenAddress]) => [
            {
              address: tokenAddress,
              abi: erc20Abi,
              functionName: "balanceOf" as const,
              args: [address as Hex],
            },
            {
              address: tokenAddress,
              abi: erc20Abi,
              functionName: "decimals" as const,
            },
            {
              address: tokenAddress,
              abi: erc20Abi,
              functionName: "symbol" as const,
            },
          ])
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [address]
  );

  const { data: balanceResults, isLoading: balancesLoading } = useReadContracts({
    allowFailure: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contracts: contracts as any,
    query: { enabled: !!address && contracts.length > 0 },
  });

  const balances = useMemo<Record<string, TokenBalance>>(() => {
    if (!balanceResults) return {};
    const result: Record<string, TokenBalance> = {};
    tokenEntries.forEach(([sym], index) => {
      const base = index * 3;
      const balRaw = balanceResults[base]?.result as bigint | undefined;
      const dec = balanceResults[base + 1]?.result as number | undefined;
      const symbol = (balanceResults[base + 2]?.result as string | undefined) ?? sym;
      if (balRaw !== undefined && dec !== undefined) {
        result[sym] = {
          symbol,
          balance: formatUnits(balRaw, dec),
          raw: balRaw,
          decimals: dec,
        };
      }
    });
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balanceResults]);

  const cUSDBalance = useMemo(() => {
    const b = balances["cUSD"];
    if (!b) return "0.00";
    return parseFloat(b.balance).toFixed(2);
  }, [balances]);

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      isConnected,
      isConnecting,
      isMiniPayEnv: miniPayEnv,
      chainId,
      balances,
      balancesLoading,
      connect,
      disconnect,
      error: error ?? (connectError as Error | null),
      cUSDBalance,
    }),
    [
      address,
      isConnected,
      isConnecting,
      miniPayEnv,
      chainId,
      balances,
      balancesLoading,
      connect,
      disconnect,
      error,
      connectError,
      cUSDBalance,
    ]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

// ─── Provider (exported) ──────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return <WalletContextInner>{children}</WalletContextInner>;
}
