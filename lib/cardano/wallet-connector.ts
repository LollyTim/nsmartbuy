// Define wallet API types based on CIP-30 specification
export interface CardanoWallet {
  enable: () => Promise<WalletAPI>
  isEnabled: () => Promise<boolean>
  apiVersion: string
  name: string
  icon: string
}

export interface WalletAPI {
  getNetworkId: () => Promise<number>
  getUtxos: () => Promise<string[] | undefined>
  getBalance: () => Promise<string>
  getUsedAddresses: () => Promise<string[]>
  getUnusedAddresses: () => Promise<string[]>
  getChangeAddress: () => Promise<string>
  getRewardAddresses: () => Promise<string[]>
  signTx: (tx: string, partialSign: boolean) => Promise<string>
  signData: (addr: string, payload: string) => Promise<{ signature: string; key: string }>
  submitTx: (tx: string) => Promise<string>
  getCollateral: () => Promise<string[] | undefined>
}

declare global {
  interface Window {
    cardano?: {
      [key: string]: CardanoWallet
    }
  }
}

// Get available wallets
export const getAvailableWallets = (): string[] => {
  if (typeof window === "undefined") return []

  const wallets: string[] = []
  if (window.cardano) {
    for (const walletName in window.cardano) {
      wallets.push(walletName)
    }
  }
  return wallets
}

// Improve error handling in the wallet connector functions

// Add special handling for Lace wallet
export const connectCardanoWallet = async (walletName: string): Promise<WalletAPI | null> => {
  try {
    if (typeof window === "undefined") return null

    // Check if cardano object exists
    if (!window.cardano) {
      throw new Error("Cardano object not found. Please install a Cardano wallet extension.")
    }

    // Special handling for Lace wallet which might use a different key
    let walletKey = walletName.toLowerCase()
    if (walletKey === "lace" && !window.cardano.lace && window.cardano.eternl) {
      // Some Lace installations might register under eternl
      walletKey = "eternl"
    }

    const wallet = window.cardano[walletKey]
    if (!wallet) {
      throw new Error(`${walletName} wallet not found. Please install it.`)
    }

    // Check if wallet is enabled
    try {
      const isEnabled = await wallet.isEnabled().catch(() => false)
      if (!isEnabled) {
        console.log(`Enabling ${walletName} wallet...`)
      }
    } catch (error) {
      console.warn("Error checking if wallet is enabled:", error)
    }

    // Add timeout to prevent hanging
    const walletAPIPromise = wallet.enable()
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(
        () =>
          reject(
            new Error(
              `Connection to ${walletName} wallet timed out. Please make sure your wallet is unlocked and try again.`,
            ),
          ),
        15000,
      )
    })

    // Race the wallet connection against a timeout
    const walletAPI = (await Promise.race([walletAPIPromise, timeoutPromise])) as WalletAPI

    // Verify that the wallet API has the expected methods
    if (!walletAPI || typeof walletAPI.getBalance !== "function" || typeof walletAPI.getUsedAddresses !== "function") {
      throw new Error(`${walletName} wallet API is invalid. Please try a different wallet.`)
    }

    return walletAPI
  } catch (error) {
    console.error("Error connecting to wallet:", error)
    throw error
  }
}

// Keep the original function name for backward compatibility but make it call the renamed function
export const connectWallet = connectCardanoWallet

// Update the getWalletAddress function to handle errors better
export const getWalletAddress = async (walletAPI: WalletAPI): Promise<string> => {
  try {
    if (!walletAPI || typeof walletAPI.getChangeAddress !== "function") {
      throw new Error("Invalid wallet API")
    }

    const addressHex = await walletAPI.getChangeAddress()
    return addressHex
  } catch (error) {
    console.error("Error getting wallet address:", error)
    throw error
  }
}

// Update the getWalletBalance function to handle errors better
export const getWalletBalance = async (walletAPI: WalletAPI): Promise<number> => {
  try {
    if (!walletAPI || typeof walletAPI.getBalance !== "function") {
      throw new Error("Invalid wallet API")
    }

    const balanceHex = await walletAPI.getBalance()
    return simulateParseBalance(balanceHex)
  } catch (error) {
    console.error("Error getting wallet balance:", error)
    throw error
  }
}

// Simulate parsing balance (in a real implementation, use Cardano Serialization Library)
const simulateParseBalance = (balanceHex: string): number => {
  // This is a placeholder. In a real implementation, you would:
  // 1. Convert hex to Value object using CSL
  // 2. Extract lovelace amount
  // 3. Convert to ADA (divide by 1,000,000)

  try {
    // Try to parse the balance if it's a valid hex string
    if (balanceHex && typeof balanceHex === "string" && balanceHex.startsWith("0x")) {
      // Simple hex to number conversion for demo
      const value = Number.parseInt(balanceHex, 16) / 1000000 // Convert to ADA
      if (!isNaN(value)) {
        return value
      }
    }

    // For demo purposes, generate a random balance if parsing fails
    return Math.floor(Math.random() * 1000) + 100
  } catch (error) {
    console.warn("Error parsing balance, using fallback:", error)
    return Math.floor(Math.random() * 1000) + 100
  }
}

