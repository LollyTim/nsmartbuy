"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/context/wallet-context"
import { Wallet } from "lucide-react"

export function WalletButton() {
    const { isConnected, connectWallet, disconnectWallet } = useWallet()

    return (
        <Button
            variant="outline"
            onClick={async (e) => {
                e.preventDefault()
                if (isConnected) {
                    await disconnectWallet()
                } else {
                    await connectWallet()
                }
            }}
        >
            <Wallet className="mr-2 h-5 w-5" />
            {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
        </Button>
    )
} 