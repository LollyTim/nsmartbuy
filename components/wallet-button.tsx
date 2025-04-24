"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/context/wallet-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function WalletButton() {
  const { isConnected, connectWallet, disconnectWallet, address, balance, isLoading, walletError } = useWallet()
  const [walletList, setWalletList] = useState<string[]>([])
  const [availableWallets, setAvailableWallets] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Get available wallets on component mount
  useEffect(() => {
    const getWallets = async () => {
      try {
        setError(null)
        // Try to dynamically import BrowserWallet from @meshsdk/core
        if (typeof window !== "undefined") {
          try {
            const meshCore = await import("@meshsdk/core").catch(() => null)
            if (meshCore && meshCore.BrowserWallet) {
              const wallets = await meshCore.BrowserWallet.getInstalledWallets()
              if (wallets.length === 0) {
                setError(
                  "No Cardano wallets found. Please install a wallet extension like Nami, Eternl, Lace, or Flint.",
                )
              }
              setAvailableWallets(wallets.map((wallet) => wallet.name))
            } else {
              setError("Cardano wallet integration is not available. Please install a wallet extension.")
              setAvailableWallets([])
            }
          } catch (error) {
            console.warn("Mesh SDK Core not available:", error)
            setError("Cardano wallet integration is not available. Please install a wallet extension.")
            setAvailableWallets([])
          }
        }
      } catch (error) {
        console.error("Error getting wallets:", error)
        setError("Failed to detect wallets. Please refresh the page or install a Cardano wallet extension.")
        setAvailableWallets([])
      }
    }

    getWallets()
  }, [])

  // Add this function to check if a wallet is installed
  const isWalletInstalled = (walletName: string): boolean => {
    if (typeof window === "undefined") return false

    // Handle different wallet naming conventions
    const walletNameLower = walletName.toLowerCase()

    // Special case for Lace wallet which might use a different key
    if (walletNameLower === "lace") {
      return !!window.cardano?.lace || !!window.cardano?.eternl
    }

    return !!window.cardano?.[walletNameLower]
  }

  // Update the handleConnectClick function for better error handling
  const handleConnectClick = async () => {
    if (isConnected) {
      await disconnectWallet()
      return
    }

    try {
      setError(null)

      // Check if any wallets are available
      if (availableWallets.length === 0) {
        setError("No Cardano wallets found. Please install a wallet extension like Nami, Eternl, Lace, or Flint.")
        return
      }

      // If only one wallet is available, check if it's installed
      if (availableWallets.length === 1) {
        const walletName = availableWallets[0]
        if (walletName !== "Demo Wallet" && !isWalletInstalled(walletName)) {
          setError(`${walletName} wallet is not installed or not accessible. Please install it or try another wallet.`)
          return
        }

        // Connect to the only available wallet
        await connectWallet(walletName)
      } else {
        // If multiple wallets are available, show dropdown
        // Filter out wallets that aren't installed
        const installedWallets = availableWallets.filter(
          (wallet) => wallet === "Demo Wallet" || isWalletInstalled(wallet),
        )

        if (installedWallets.length === 0) {
          setError("No installed Cardano wallets found. Please install a wallet extension.")
          return
        }

        setWalletList(installedWallets)
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)

      // Provide more user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes("No addresses found") || error.message.includes("Could not find any address")) {
          setError("Your wallet doesn't have any addresses. Please create an address in your wallet first.")
        } else if (error.message.includes("wallet is not connected")) {
          setError("Failed to connect to wallet. Please make sure your wallet extension is unlocked and try again.")
        } else if (error.message.includes("timeout")) {
          setError("Connection to wallet timed out. Please try again.")
        } else {
          setError(error.message)
        }
      } else {
        setError("Failed to connect wallet. Please try again.")
      }
    }
  }

  if (isConnected) {
    return (
      <Button onClick={disconnectWallet} variant="outline" size="sm" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {address?.slice(0, 8)}...{address?.slice(-4)} ({isNaN(balance) ? "0.00" : balance.toFixed(2)} ₳)
      </Button>
    )
  }

  if (walletList.length > 0) {
    return (
      <DropdownMenu onOpenChange={(open) => !open && setWalletList([])}>
        <DropdownMenuTrigger asChild>
          <Button size="sm">Select Wallet</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {walletList.map((wallet) => (
            <DropdownMenuItem
              key={wallet}
              onClick={() => {
                connectWallet(wallet)
                setWalletList([])
              }}
            >
              {wallet}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex flex-col">
      <Button onClick={handleConnectClick} size="sm" disabled={isLoading || availableWallets.length === 0}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Connect Wallet
      </Button>

      {(error || walletError) && (
        <Alert variant="destructive" className="mt-2 py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs ml-2">{error || walletError}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

