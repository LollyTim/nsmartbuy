import { NextResponse } from "next/server"
import { createTransaction } from "@/lib/convex/transactions"

export async function POST(request: Request) {
  try {
    const { adaAmount, ngnAmount, walletAddress, bankDetails } = await request.json()

    if (!adaAmount || !ngnAmount || !walletAddress || !bankDetails) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate bank details
    if (!bankDetails.accountNumber || !bankDetails.bankCode || !bankDetails.accountName) {
      return NextResponse.json({ error: "Invalid bank details" }, { status: 400 })
    }

    // Generate a unique reference for the transaction
    const reference = `sell_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

    // Create a transaction record in Convex
    await createTransaction({
      type: "sell_ada",
      amount: adaAmount,
      ngnAmount,
      reference,
      status: "pending",
      walletAddress,
      timestamp: new Date().toISOString(),
    })

    // In a real implementation, you would:
    // 1. Verify that the user has transferred the ADA to your platform wallet
    // 2. Initiate a bank transfer to the user's account using Paystack or another payment provider
    // 3. Update the transaction status when the transfer is complete

    return NextResponse.json({
      success: true,
      message: "Sell request received",
      reference,
      estimatedCompletionTime: "24 hours",
    })
  } catch (error) {
    console.error("Error processing sell request:", error)
    return NextResponse.json({ error: "An error occurred while processing the sell request" }, { status: 500 })
  }
}

