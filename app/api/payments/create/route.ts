import { NextResponse } from "next/server"

// Paystack API base URL
const PAYSTACK_BASE_URL = "https://api.paystack.co"
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ""

export async function POST(request: Request) {
  try {
    const { amount, email, metadata } = await request.json()

    if (!amount || !email) {
      return NextResponse.json({ error: "Amount and email are required" }, { status: 400 })
    }

    // Create a payment initialization request to Paystack
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Paystack expects amount in kobo (100 kobo = 1 NGN)
        email,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet/payment-callback`,
        metadata: {
          ...metadata,
          custom_fields: [
            {
              display_name: "ADA Amount",
              variable_name: "ada_amount",
              value: metadata.adaAmount,
            },
            {
              display_name: "Wallet Address",
              variable_name: "wallet_address",
              value: metadata.walletAddress,
            },
          ],
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Paystack error:", errorData)
      return NextResponse.json(
        { error: "Failed to initialize payment", details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data.data)
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "An error occurred while creating the payment" }, { status: 500 })
  }
}

