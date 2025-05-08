"use client";

import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { parseEther, isAddress } from "viem";
import { toast } from "sonner";
import Posts from "@/components/posts";

export default function App() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);

  const handleSend = async () => {
    if (!amount || !toAddress || !isAddress(toAddress)) {
      toast.error("Please enter a valid address and amount");
      return;
    }

    setIsConfirming(true);
    try {
      // Your send transaction logic here
      toast.success("Transaction sent successfully!");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to send transaction");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-4 pb-4 md:pb-8 md:px-8 bg-gradient-to-b from-black via-purple-900 to-black">
      <div className="w-full max-w-6xl mx-auto">
        <nav className="flex justify-between items-center sticky top-0 bg-black/50 backdrop-blur-md z-10 py-4 border-b border-purple-500/20">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">Clank Clank</h1>
          {isConnected ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span
                className="text-sm text-purple-300 cursor-pointer hover:opacity-80"
                onClick={() => {
                  navigator.clipboard.writeText(address || "");
                }}
                title="Click to copy address"
              >
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <span className="text-sm text-purple-300 cursor-pointer hover:opacity-80">
                    ({balance?.formatted.slice(0, 6)} {balance?.symbol})
                  </span>
                </DialogTrigger>
                <DialogContent className="bg-black/90 border-purple-500/20">
                  <DialogHeader>
                    <DialogTitle className="text-purple-400">Send ETH</DialogTitle>
                    <DialogDescription className="text-purple-300/70">
                      Enter the recipient address and amount to send
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/20">
                      <div className="text-sm text-purple-300/70">Your Balance</div>
                      <div className="text-xl font-medium text-purple-300">
                        {balance ? `${balance.formatted} ${balance.symbol}` : "Loading..."}
                      </div>
                    </div>
                    <Input
                      placeholder="Recipient Address (0x...)"
                      value={toAddress}
                      onChange={(e) => setToAddress(e.target.value)}
                      className="bg-black/50 border-purple-500/20 text-purple-300 placeholder:text-purple-300/50"
                    />
                    <Input
                      type="number"
                      placeholder="Amount in ETH"
                      step="0.0001"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-black/50 border-purple-500/20 text-purple-300 placeholder:text-purple-300/50"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleSend}
                      disabled={!amount || !toAddress || isConfirming || isTransactionPending}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      Send ETH
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                onClick={() => disconnect()} 
                size="sm"
                className="border-purple-500/20 text-purple-300 hover:bg-purple-900/20"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              {connectors.map((connector) => (
                <Button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {connector.name}
                </Button>
              ))}
            </div>
          )}
        </nav>

        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-purple-300">Clanker</h2>
            <a 
              href="https://thecreators.com/clankercon" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              CLANKERCON 2025 →
            </a>
          </div>
          <Posts onTipSuccess={() => {}} />
        </div>
      </div>
    </main>
  );
}
