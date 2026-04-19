import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Wallet, ChevronDown, Copy, LogOut, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function WalletConnectButton() {
  const {
    address,
    isConnected,
    isConnecting,
    isMiniPayEnv,
    balances,
    balancesLoading,
    cUSDBalance,
    connect,
    disconnect,
    error,
  } = useWallet();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    }
  };

  const viewOnExplorer = () => {
    if (address) {
      window.open(`https://celoscan.io/address/${address}`, "_blank");
    }
  };

  if (isConnecting) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (!isConnected || !address) {
    // Inside MiniPay: show error state (should auto-connect)
    if (isMiniPayEnv) {
      return (
        <Button variant="outline" size="sm" onClick={connect} className="gap-2 text-yellow-400 border-yellow-400/40">
          <Wallet className="h-3.5 w-3.5" />
          Reconnect
        </Button>
      );
    }
    // Desktop / non-MiniPay: show connect button
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={connect}
        className="gap-2 border-[var(--celo-green)]/40 text-[var(--celo-green)] hover:bg-[var(--celo-green)]/10"
      >
        <Wallet className="h-3.5 w-3.5" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-[var(--celo-green)]/40 hover:bg-[var(--celo-green)]/10"
        >
          <div className="h-2 w-2 rounded-full bg-[var(--celo-green)] animate-pulse" />
          <span className="font-mono text-xs">{shortAddress(address)}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            {shortAddress(address)}
          </span>
          {isMiniPayEnv && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              MiniPay
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Token balances */}
        <div className="px-2 py-2 space-y-1.5">
          {balancesLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading balances...
            </div>
          ) : (
            <>
              {Object.entries(balances).map(([sym, b]) => (
                <div key={sym} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{sym}</span>
                  <span className="text-xs font-mono font-semibold">
                    {parseFloat(b.balance).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
                  </span>
                </div>
              ))}
              {Object.keys(balances).length === 0 && (
                <div className="text-xs text-muted-foreground">No stablecoin balances found</div>
              )}
            </>
          )}
        </div>

        {error && (
          <div className="px-2 py-1 text-xs text-red-400">{error.message}</div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress} className="gap-2 text-xs cursor-pointer">
          <Copy className="h-3.5 w-3.5" />
          Copy address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={viewOnExplorer} className="gap-2 text-xs cursor-pointer">
          <ExternalLink className="h-3.5 w-3.5" />
          View on Celoscan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={disconnect}
          className="gap-2 text-xs text-red-400 cursor-pointer focus:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
