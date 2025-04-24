"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function PaymentCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!reference) {
      setStatus("error")
      setMessage("Invalid payment reference")
      return
    }

    // Verify the payment
    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Failed to verify payment")
        }

        const data = await response.json()
        setStatus("success")
        setMessage("Your payment was successful and ADA has been transferred to your wallet.")
      } catch (error) {
        console.error("Error verifying payment:", error)
        setStatus("error")
        setMessage(error instanceof Error ? error.message : "Failed to verify payment")
      }
    }

    verifyPayment()
  }, [reference])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>
              {status === "loading" && "Processing Payment"}
              {status === "success" && "Payment Successful"}
              {status === "error" && "Payment Failed"}
            </CardTitle>
            <CardDescription>
              {status === "loading" && "Please wait while we verify your payment..."}
              {status === "success" && "Your ADA purchase has been completed"}
              {status === "error" && "There was an issue with your payment"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            {status === "loading" && <Loader2 className="h-16 w-16 text-primary animate-spin" />}
            {status === "success" && <CheckCircle className="h-16 w-16 text-green-500" />}
            {status === "error" && <XCircle className="h-16 w-16 text-red-500" />}

            <p className="mt-4 text-center">{message}</p>

            {status === "success" && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Reference: {reference}</p>
                <p className="mt-2">You can view this transaction in your wallet history.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/wallet">
              <Button>Go to Wallet</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

