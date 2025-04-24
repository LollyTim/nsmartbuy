"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useWallet } from "@/context/wallet-context"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { getADAPriceInNGN } from "@/lib/blockfrost/ada"
import { toast } from "@/components/ui/use-toast"

export default function SellADAPage() {
  const { isConnected, address, balance, sellADA, isLoading } = useWallet()
  const [adaAmount, setAdaAmount] = useState("")
  const [ngnAmount, setNgnAmount] = useState("")
  const [exchangeRate, setExchangeRate] = useState(1000) // Default: 1 ADA = 1000 NGN
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    accountName: "",
    bankCode: "",
  })

  // Fetch the current exchange rate on component mount
  useState(() => {
    getADAPriceInNGN().then((rate) => {
      setExchangeRate(rate)
    })
  })

  const handleAdaAmountChange = (value: string) => {
    setAdaAmount(value)
    if (value) {
      const ngn = (Number(value) * exchangeRate).toFixed(2)
      setNgnAmount(ngn)
    } else {
      setNgnAmount("")
    }
  }

  const handleNgnAmountChange = (value: string) => {
    setNgnAmount(value)
    if (value) {
      const ada = (Number(value) / exchangeRate).toFixed(2)
      setAdaAmount(ada)
    } else {
      setAdaAmount("")
    }
  }

  const handleSellADA = async () => {
    if (!adaAmount || Number(adaAmount) <= 0) {
      return
    }

    if (Number(adaAmount) > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough ADA to sell.",
        variant: "destructive",
      })
      return
    }

    if (!bankDetails.accountNumber || !bankDetails.accountName || !bankDetails.bankCode) {
      toast({
        title: "Missing Bank Details",
        description: "Please provide your bank account details.",
        variant: "destructive",
      })
      return
    }

    try {
      await sellADA(Number(adaAmount))
      // Reset form
      setAdaAmount("")
      setNgnAmount("")
    } catch (error) {
      console.error("Error selling ADA:", error)
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>Please connect your wallet to sell ADA</CardDescription>
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
            <CardTitle>Sell ADA for NGN</CardTitle>
            <CardDescription>Convert your ADA to Nigerian Naira (NGN)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ada-amount">Amount in ADA (₳)</Label>
              <Input
                id="ada-amount"
                type="number"
                placeholder="0.00"
                value={adaAmount}
                onChange={(e) => handleAdaAmountChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Available: {isNaN(balance) ? "0.00" : balance.toFixed(2)} ₳
              </p>
            </div>

            <div className="flex justify-center py-2">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ngn-amount">Amount in NGN (₦)</Label>
              <Input
                id="ngn-amount"
                type="number"
                placeholder="0.00"
                value={ngnAmount}
                onChange={(e) => handleNgnAmountChange(e.target.value)}
                readOnly
              />
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Bank Account Details</h3>

              <div className="space-y-2">
                <Label htmlFor="account-number">Account Number</Label>
                <Input
                  id="account-number"
                  placeholder="Enter your account number"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  placeholder="Enter your account name"
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name</Label>
                <Select
                  value={bankDetails.bankCode}
                  onValueChange={(value) => setBankDetails({ ...bankDetails, bankCode: value })}
                >
                  <SelectTrigger id="bank-name">
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="057">Zenith Bank</SelectItem>
                    <SelectItem value="058">GTBank</SelectItem>
                    <SelectItem value="033">UBA</SelectItem>
                    <SelectItem value="044">Access Bank</SelectItem>
                    <SelectItem value="050">Ecobank</SelectItem>
                    <SelectItem value="070">Fidelity Bank</SelectItem>
                    <SelectItem value="011">First Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate:</span>
                <span>1 ₳ = ₦{exchangeRate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Fee:</span>
                <span>1.5%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payout Time:</span>
                <span>Within 24 hours</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleSellADA}
              disabled={
                isLoading ||
                !adaAmount ||
                Number(adaAmount) <= 0 ||
                Number(adaAmount) > balance ||
                !bankDetails.accountNumber ||
                !bankDetails.accountName ||
                !bankDetails.bankCode
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Sell ADA"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

