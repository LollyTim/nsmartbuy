import { NextResponse } from "next/server"
import { updateTransaction } from "@/lib/convex/transactions"
import { transferADA } from "@/lib/blockfrost/ada"
import crypto from "crypto"

// Paystack webhook secret for verification
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ""

// Verify Paystack webhook signature
const verifySignature = (payload: string, signature: string | null, secret: string): boolean => {
  if (!signature) return false

  const hash = crypto.createHmac("sha512", secret).update(payload).digest("hex")

  return hash === signature
}

export async function POST(request: Request) {
  try {
    // Clone the request to get the body as text for signature verification
    const clonedRequest = request.clone()
    const payload = await clonedRequest.text()

    // Verify that the request is from Paystack
    const signature = request.headers.get("x-paystack-signature")

    // In production, always verify the signature
    if (process.env.NODE_ENV === "production") {
      const isValid = verifySignature(payload, signature, PAYSTACK_SECRET_KEY)
      if (!isValid) {
        console.error("Invalid Paystack signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    // Parse the payload
    const event = JSON.parse(payload)

    // Handle different event types
    switch (event.event) {
      case "charge.success":
        // Payment was successful
        const { reference, metadata } = event.data

        if (!metadata || !metadata.ada_amount || !metadata.wallet_address) {
          console.error("Missing required metadata in Paystack webhook", metadata)
          return NextResponse.json({ error: "Missing required metadata" }, { status: 400 })
        }

        const adaAmount = Number.parseFloat(metadata.ada_amount)
        const walletAddress = metadata.wallet_address

        console.log(`Processing successful payment: ${reference} - ${adaAmount} ADA to ${walletAddress}`)

        try {
          // Update the transaction status in database
          await updateTransaction(reference, { status: "processing" })

          // Transfer ADA to the user's wallet
          const txHash = await transferADA(walletAddress, adaAmount)
          console.log(`ADA transfer successful: ${txHash}`)

          // Update the transaction with the txHash and mark as completed
          await updateTransaction(reference, {
            status: "completed",
            txHash,
            completedAt: new Date().toISOString(),
          })

          console.log(`Transaction ${reference} completed successfully`)
        } catch (transferError) {
          console.error("Error processing ADA transfer:", transferError)

          // Update transaction status to failed
          await updateTransaction(reference, {
            status: "failed",
            error: transferError instanceof Error ? transferError.message : "Unknown error during ADA transfer",
          })

          return NextResponse.json(
            {
              error: "Failed to process ADA transfer",
              details: transferError instanceof Error ? transferError.message : "Unknown error",
            },
            { status: 500 },
          )
        }
        break

      case "charge.failed":
        // Payment failed
        console.log(`Payment failed: ${event.data.reference}`)
        await updateTransaction(event.data.reference, {
          status: "failed",
          error: "Payment failed at payment gateway",
          failedAt: new Date().toISOString(),
        })
        break

      default:
        // Log other event types but don't process them
        console.log(`Received unhandled Paystack event: ${event.event}`)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      {
        error: "An error occurred while processing the webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

