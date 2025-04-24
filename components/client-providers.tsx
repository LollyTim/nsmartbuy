"use client"

import type React from "react"

import { WalletProvider } from "@/context/wallet-context"
import { Suspense, type ReactNode } from "react"

// Create a fallback MeshProvider component
const FallbackProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>
}

export default function ClientProviders({ children }: { children: ReactNode }) {
  // Dynamically import MeshProvider to handle cases where it might not be available
  let MeshProvider: React.ComponentType<{ children: ReactNode }> = FallbackProvider

  // Try to use the actual MeshProvider if available
  try {
    // This is a workaround to avoid direct imports that might fail
    if (typeof window !== "undefined") {
      try {
        const meshModule = require("@meshsdk/react")
        if (meshModule && meshModule.MeshProvider) {
          MeshProvider = meshModule.MeshProvider
        }
      } catch (error) {
        console.warn("Mesh SDK not available, using fallback provider", error)
      }
    }
  } catch (error) {
    console.warn("Mesh SDK not available, using fallback provider", error)
  }

  return (
    <MeshProvider>
      <Suspense fallback={<div>Loading wallet...</div>}>
        <WalletProvider>{children}</WalletProvider>
      </Suspense>
    </MeshProvider>
  )
}

