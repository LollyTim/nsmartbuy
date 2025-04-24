"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useWallet } from "@/context/wallet-context"
import { ArrowLeft, ArrowRight, CreditCard, Loader2, RefreshCw } from "lucide-react"

export default function BuyADAPage() {
  const router = useRouter()
  const { isConnected, address, buyADA, isLoading, adaToNgnRate, refreshRates } = useWallet()
  const [ngnAmount, setNgnAmount] = useState("")
  const [adaAmount, setAdaAmount] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Ensure numeric values are valid
  const ensureValidNumber = (value: number): number => {
    return isNaN(value) ? 0 : value
  }

  // Handle NGN amount change
  const handleNgnAmountChange = (value: string) => {
    setNgnAmount(value)
    if (value) {
      const rate = ensureValidNumber(adaToNgnRate)
      const ngnValue = Number.parseFloat(value)
      if (!isNaN(ngnValue) && rate > 0) {
        const ada = (ngnValue / rate).toFixed(2)
        setAdaAmount(ada)
      } else {
        setAdaAmount("0.00")
      }
    } else {
      setAdaAmount("")
    }
  }

  // Handle ADA amount change
  const handleAdaAmountChange = (value: string) => {
    setAdaAmount(value)
    if (value) {
      const rate = ensureValidNumber(adaToNgnRate)
      const adaValue = Number.parseFloat(value)
      if (!isNaN(adaValue)) {
        const ngn = (adaValue * rate).toFixed(2)
        setNgnAmount(ngn)
      } else {
        setNgnAmount("0.00")
      }
    } else {
      setNgnAmount("")
    }
  }

  // Refresh exchange rates
  const handleRefreshRates = async () => {
    setIsRefreshing(true)
    try {
      await refreshRates()
      // Update the conversion if there are values
      if (ngnAmount) {
        handleNgnAmountChange(ngnAmount)
      } else if (adaAmount) {
        handleAdaAmountChange(adaAmount)
      }
    } catch (error) {
      console.error("Error refreshing rates:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleBuyADA = async () => {
    if (!ngnAmount || Number(ngnAmount) <= 0) {
      return
    }

    try {
      const paymentUrl = await buyADA(Number(ngnAmount))
      // Redirect to the payment URL
      window.location.href = paymentUrl
    } catch (error) {
      console.error("Error initiating payment:", error)
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>Please connect your wallet to buy ADA</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/wallet" className="w-full">
                <Button className="w-full">Go to Wallet</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Link href="/wallet" className="flex items-center text-muted-foreground mb-6 hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Wallet
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Buy ADA with NGN</CardTitle>
            <CardDescription>Purchase ADA using Nigerian Naira (NGN)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="ngn-amount">Amount in NGN (₦)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshRates}
                  disabled={isRefreshing}
                  className="h-6 px-2"
                >
                  {isRefreshing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  <span className="ml-1 text-xs">Refresh Rate</span>
                </Button>
              </div>
              <Input
                id="ngn-amount"
                type="number"
                placeholder="0.00"
                value={ngnAmount}
                onChange={(e) => handleNgnAmountChange(e.target.value)}
              />
            </div>

            <div className="flex justify-center py-2">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ada-amount">Amount in ADA (₳)</Label>
              <Input
                id="ada-amount"
                type="number"
                placeholder="0.00"
                value={adaAmount}
                onChange={(e) => handleAdaAmountChange(e.target.value)}
              />
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate:</span>
                <span>1 ₳ = ₦{adaToNgnRate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Fee:</span>
                <span>1.5%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Time:</span>
                <span>Instant</span>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-md text-sm">
              <p>
                ADA will be sent to your connected wallet address:
                <span className="block mt-1 font-mono text-xs truncate">{address}</span>
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleBuyADA}
              disabled={isLoading || !ngnAmount || Number(ngnAmount) <= 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay with Paystack
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

