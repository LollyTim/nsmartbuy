"use client"

import { type ReactNode } from "react"
import { ConvexProvider } from "convex/react"
import { ConvexReactClient } from "convex/react"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/context/wallet-context"
import { Toaster } from "@/components/ui/toaster"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ConvexProvider client={convex}>
            <WalletProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    {children}
                    <Toaster />
                </ThemeProvider>
            </WalletProvider>
        </ConvexProvider>
    )
} 