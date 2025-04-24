import { NextResponse } from "next/server"
import { updateTransaction } from "@/lib/convex/transactions"
import { transferADA } from "@/lib/blockfrost/ada"

// Paystack API base URL
const PAYSTACK_BASE_URL = "https://api.paystack.co"
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ""

export async function POST(request: Request) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 })
    }

    // Verify the payment with Paystack
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Paystack verification error:", errorData)
      return NextResponse.json({ error: "Failed to verify payment", details: errorData }, { status: response.status })
    }

    const data = await response.json()

    // Check if the payment was successful
    if (data.data.status !== "success") {
      return NextResponse.json({ error: "Payment was not successful", status: data.data.status }, { status: 400 })
    }

    // Extract metadata from the payment
    const { metadata } = data.data
    const adaAmount = metadata.ada_amount
    const walletAddress = metadata.wallet_address

    // Update the transaction status in Convex
    await updateTransaction(reference, { status: "processing" })

    // Transfer ADA to the user's wallet
    const txHash = await transferADA(walletAddress, adaAmount)

    // Update the transaction with the txHash and mark as completed
    await updateTransaction(reference, { status: "completed", txHash })

    return NextResponse.json({
      success: true,
      message: "Payment verified and ADA transferred successfully",
      txHash,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "An error occurred while verifying the payment" }, { status: 500 })
  }
}

