import { Transaction, type Asset } from "@meshsdk/core"
import type { Wallet } from "@meshsdk/core"

// Create a professional payment transaction with proper validation and error handling
export const createPaymentTransaction = async (
  wallet: Wallet,
  recipientAddress: string,
  amountLovelace: number,
  metadata?: Record<string, any>,
): Promise<{ txHash: string; fee: string }> => {
  try {
    // Validate inputs
    if (!recipientAddress || recipientAddress.trim() === "") {
      throw new Error("Recipient address is required")
    }

    if (!amountLovelace || amountLovelace <= 0) {
      throw new Error("Amount must be greater than 0")
    }

    // Check if the address is valid (basic validation)
    if (!recipientAddress.startsWith("addr1")) {
      throw new Error("Invalid Cardano address format")
    }

    // Create a transaction
    const tx = new Transaction({ initiator: wallet })

    // Convert ADA to lovelace if needed (1 ADA = 1,000,000 lovelace)
    const lovelaceAmount = amountLovelace.toString()

    // Send lovelace to the recipient
    tx.sendLovelace(recipientAddress, lovelaceAmount)

    // Add metadata if provided
    if (metadata) {
      tx.setMetadata(0, metadata)
    }

    // Calculate the fee
    const fee = await tx.calculateFee()

    // Sign the transaction
    const signedTx = await tx.sign()

    // Submit the transaction
    const txHash = await tx.submit()

    return { txHash, fee }
  } catch (error) {
    console.error("Error creating payment transaction:", error)
    throw error
  }
}

// Create a transaction with metadata
export const createTransactionWithMetadata = async (wallet: Wallet, metadata: Record<string, any>): Promise<string> => {
  try {
    // Create a transaction
    const tx = new Transaction({ initiator: wallet })

    // Add metadata to the transaction
    tx.setMetadata(0, metadata)

    // Sign and submit the transaction
    const signedTx = await tx.sign()
    const txHash = await tx.submit()

    return txHash
  } catch (error) {
    console.error("Error creating transaction with metadata:", error)
    throw error
  }
}

// Get transaction details
export const getTransactionDetails = async (txHash: string): Promise<any> => {
  try {
    // In a real implementation, you would fetch this from a Cardano blockchain explorer API
    // For demo purposes, we'll return mock data
    return {
      txHash,
      blockHeight: 12345678,
      timestamp: Date.now(),
      fee: 180000,
      inputs: [
        {
          address: "addr1qxy8epmr...",
          amount: 1000000,
        },
      ],
      outputs: [
        {
          address: "addr1qz9tzfh3...",
          amount: 820000,
        },
      ],
      metadata: {
        0: {
          key1: "value1",
          key2: "value2",
        },
      },
    }
  } catch (error) {
    console.error("Error getting transaction details:", error)
    throw error
  }
}

// Calculate transaction fee
export const calculateTransactionFee = async (
  wallet: Wallet,
  recipientAddress: string,
  amountLovelace: number,
): Promise<number> => {
  try {
    // Create a transaction
    const tx = new Transaction({ initiator: wallet })

    // Send lovelace to the recipient
    tx.sendLovelace(recipientAddress, amountLovelace.toString())

    // Calculate the fee
    const fee = await tx.calculateFee()

    return Number.parseInt(fee)
  } catch (error) {
    console.error("Error calculating transaction fee:", error)
    throw error
  }
}

// Get wallet balance with detailed asset information
export const getDetailedWalletBalance = async (
  wallet: Wallet,
): Promise<{
  lovelace: string
  lovelaceFloat: number
  assets: Asset[]
  totalValueUSD: number
}> => {
  try {
    const balance = await wallet.getBalance()

    // Convert lovelace to ADA (floating point)
    const lovelaceFloat = Number.parseInt(balance.lovelace) / 1000000

    // In a real implementation, you would fetch USD values from an API
    // For demo purposes, we'll use a fixed rate: 1 ADA = $0.45 USD
    const adaToUsdRate = 0.45
    const totalValueUSD = lovelaceFloat * adaToUsdRate

    return {
      lovelace: balance.lovelace,
      lovelaceFloat,
      assets: balance.assets,
      totalValueUSD,
    }
  } catch (error) {
    console.error("Error getting detailed wallet balance:", error)
    throw error
  }
}

// Validate a Cardano address
export const validateCardanoAddress = (address: string): boolean => {
  // Basic validation - in a real implementation, you would use a more robust validation
  if (!address || address.trim() === "") {
    return false
  }

  // Check if the address starts with a valid prefix
  // Mainnet addresses start with addr1, testnet with addr_test1
  return address.startsWith("addr1") || address.startsWith("addr_test1")
}

// Format transaction data for display
export const formatTransactionData = (txData: any): any => {
  return {
    ...txData,
    formattedDate: new Date(txData.timestamp).toLocaleString(),
    formattedAmount: `${(Number.parseInt(txData.amount) / 1000000).toFixed(2)} ₳`,
    statusClass: getStatusClass(txData.status),
  }
}

// Get CSS class based on transaction status
const getStatusClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case "completed":
    case "success":
      return "text-green-500"
    case "pending":
      return "text-yellow-500"
    case "processing":
      return "text-blue-500"
    case "failed":
    case "error":
      return "text-red-500"
    default:
      return "text-gray-500"
  }
}

