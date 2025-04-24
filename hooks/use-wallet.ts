import { useState } from "react";
import type { Wallet } from "@meshsdk/core";

interface WalletState {
  isConnected: boolean;
  meshWalletInstance: Wallet | null;
  setIsLoading: (loading: boolean) => void;
}

export function useWallet(): WalletState {
  const [isConnected, setIsConnected] = useState(false);
  const [meshWalletInstance, setMeshWalletInstance] = useState<Wallet | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  return {
    isConnected,
    meshWalletInstance,
    setIsLoading,
  };
}
