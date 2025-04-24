"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/context/wallet-context"
import { Separator } from "@/components/ui/separator"
import {
  Copy,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  Wallet,
  CreditCard,
  ArrowDown,
  ArrowUp,
  AlertCircle,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import WalletButton from "@/components/wallet-button"
import { getTransactionsByWalletAddress } from "@/lib/blockfrost/transactions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import QRCodeModal from "@/components/qr-code-modal"
import ProductsList from "@/components/product-list"
import NFTGallery from "@/components/nft-gallery"

export default function WalletPage() {
  const walletContext = useWallet()
  const isConnected = walletContext?.isConnected || false
  const address = walletContext?.address || null
  const balance = walletContext?.balance || 0
  const sendTransaction = walletContext?.sendTransaction || (async () => false)
  const isLoading = walletContext?.isLoading || false
  const isRefreshingBalance = walletContext?.isRefreshingBalance || false
  const totalValueUSD = walletContext?.totalValueUSD || 0
  const validateAddress = walletContext?.validateAddress || (() => false)
  const updateBalance = walletContext?.updateBalance || (async () => { })
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [conversionRate, setConversionRate] = useState(20) // Mock conversion rate: 1 ADA = 20 Naira
  const [nairaAmount, setNairaAmount] = useState("")
  const [adaAmount, setAdaAmount] = useState("")
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [addressError, setAddressError] = useState("")

  // Load transactions when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      loadTransactions()
    }
  }, [isConnected, address])

  const loadTransactions = async () => {
    if (!address) return

    setIsLoadingTransactions(true)
    try {
      const txs = await getTransactionsByWalletAddress(address)
      setTransactions(txs)
    } catch (error) {
      console.error("Error loading transactions:", error)
      toast({
        title: "Error Loading Transactions",
        description: "Failed to load your transaction history. Please try again.",
        variant: "destructive",
      })
      setTransactions([])
    } finally {
      setIsLoadingTransactions(false)
    }
  }

  const handleSendTransaction = async () => {
    if (!amount || !recipient) return

    // Validate recipient address
    if (!validateAddress(recipient)) {
      setAddressError("Invalid Cardano address format. Please check and try again.")
      return
    }

    try {
      const success = await sendTransaction(recipient, Number.parseFloat(amount))
      if (success) {
        setAmount("")
        setRecipient("")
        setAddressError("")
        // Reload transactions after successful send
        loadTransactions()
      }
    } catch (error) {
      console.error("Transaction failed:", error)
    }
  }

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const handleNairaToAda = (value: string) => {
    setNairaAmount(value)
    const ada = value ? (Number.parseFloat(value) / conversionRate).toFixed(2) : ""
    setAdaAmount(ada)
  }

  const handleAdaToNaira = (value: string) => {
    setAdaAmount(value)
    const naira = value ? (Number.parseFloat(value) * conversionRate).toFixed(2) : ""
    setNairaAmount(naira)
  }

  const handleRecipientChange = (value: string) => {
    setRecipient(value)
    if (value && !validateAddress(value)) {
      setAddressError("Invalid Cardano address format")
    } else {
      setAddressError("")
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send":
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case "receive":
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case "transfer":
        return <ArrowRight className="h-4 w-4 text-blue-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500"
      case "pending":
        return "text-yellow-500"
      case "processing":
        return "text-blue-500"
      case "failed":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Connect your Cardano wallet to access the TrustEcom platform features.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">My Wallet</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Wallet Overview</CardTitle>
            <CardDescription>Manage your Cardano assets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label>Wallet Address</Label>
              <div className="flex items-center space-x-2">
                <div className="bg-muted p-2 rounded-md flex-1 font-mono text-xs overflow-hidden">
                  <span className="truncate">{address}</span>
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyAddress}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy address</span>
                </Button>
                <QRCodeModal address={address || ""} />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label>Balance</Label>
              <div className="bg-muted p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{isNaN(balance) ? "0.00" : balance.toFixed(2)} ₳</p>
                    <p className="text-sm text-muted-foreground">
                      ≈ {isNaN(balance) ? "0.00" : (balance * conversionRate).toFixed(2)} ₦ | $
                      {isNaN(totalValueUSD) ? "0.00" : totalValueUSD.toFixed(2)} USD
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={updateBalance}
                    disabled={isRefreshingBalance}
                    className="relative"
                  >
                    <RefreshCw
                      className={`h-4 w-4 transition-transform duration-700 ${isRefreshingBalance ? "animate-spin" : ""
                        }`}
                    />
                    {isRefreshingBalance && (
                      <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
                    )}
                    <span className="sr-only">Refresh balance</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Link href="/wallet/buy-ada">
                <Button className="w-full" variant="default">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Buy ADA
                </Button>
              </Link>
              <Link href="/wallet/sell-ada">
                <Button className="w-full" variant="outline">
                  <Wallet className="mr-2 h-4 w-4" />
                  Sell ADA
                </Button>
              </Link>
            </div>

            <div className="pt-4">
              <h3 className="font-medium mb-2">Recent Transactions</h3>
              {isLoadingTransactions ? (
                <div className="flex justify-center py-4">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : transactions.length > 0 ? (
                transactions.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center">
                      <div className="mr-3">{getTransactionIcon(tx.type)}</div>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {tx.type === "send"
                            ? "Sent"
                            : tx.type === "receive"
                              ? "Received"
                              : tx.type === "transfer"
                                ? "Transferred"
                                : "Transaction"}{" "}
                          {Math.abs(tx.amount).toFixed(6)} ₳
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs ${getTransactionStatusColor(tx.status)}`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                      {tx.txHash && (
                        <Link
                          href={`https://cardanoscan.io/transaction/${tx.txHash}`}
                          target="_blank"
                          className="text-xs flex items-center text-primary hover:underline mt-1"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-2">No transactions found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send ADA</CardTitle>
            <CardDescription>Transfer ADA to another wallet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="addr1..."
                value={recipient}
                onChange={(e) => handleRecipientChange(e.target.value)}
                className={addressError ? "border-red-500" : ""}
              />
              {addressError && (
                <Alert variant="destructive" className="py-2 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs ml-2">{addressError}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₳)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {amount && Number(amount) > balance && (
                <Alert variant="destructive" className="py-2 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs ml-2">Insufficient balance</AlertDescription>
                </Alert>
              )}
              <p className="text-xs text-muted-foreground">
                Available: {isNaN(balance) ? "0.000000" : balance.toFixed(6)} ₳
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleSendTransaction}
              disabled={isLoading || !amount || !recipient || Number(amount) > balance || !!addressError}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Send"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Currency Converter</CardTitle>
            <CardDescription>Convert between Naira and ADA</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="buy" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy">Buy ADA</TabsTrigger>
                <TabsTrigger value="sell">Sell ADA</TabsTrigger>
              </TabsList>
              <TabsContent value="buy" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="naira-amount">Naira Amount (₦)</Label>
                  <Input
                    id="naira-amount"
                    type="number"
                    placeholder="0.00"
                    value={nairaAmount}
                    onChange={(e) => handleNairaToAda(e.target.value)}
                  />
                </div>

                <div className="flex justify-center py-2">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ada-amount">ADA Amount (₳)</Label>
                  <Input
                    id="ada-amount"
                    type="number"
                    placeholder="0.00"
                    value={adaAmount}
                    onChange={(e) => handleAdaToNaira(e.target.value)}
                    readOnly
                  />
                </div>

                <Separator className="my-4" />

                <div className="text-sm text-muted-foreground">
                  <p>Exchange Rate: 1 ₳ = {conversionRate} ₦</p>
                  <p className="mt-1">Processing Fee: 1%</p>
                </div>

                <Link href="/wallet/buy-ada">
                  <Button className="w-full mt-4">Buy ADA</Button>
                </Link>
              </TabsContent>
              <TabsContent value="sell" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="ada-sell-amount">ADA Amount (₳)</Label>
                  <Input
                    id="ada-sell-amount"
                    type="number"
                    placeholder="0.00"
                    value={adaAmount}
                    onChange={(e) => handleAdaToNaira(e.target.value)}
                  />
                </div>

                <div className="flex justify-center py-2">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="naira-sell-amount">Naira Amount (₦)</Label>
                  <Input
                    id="naira-sell-amount"
                    type="number"
                    placeholder="0.00"
                    value={nairaAmount}
                    onChange={(e) => handleNairaToAda(e.target.value)}
                    readOnly
                  />
                </div>

                <Separator className="my-4" />

                <div className="text-sm text-muted-foreground">
                  <p>Exchange Rate: 1 ₳ = {conversionRate} ₦</p>
                  <p className="mt-1">Processing Fee: 1%</p>
                </div>

                <Link href="/wallet/sell-ada">
                  <Button className="w-full mt-4">Sell ADA</Button>
                </Link>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>My Products</CardTitle>
              <CardDescription>Products you've listed for sale</CardDescription>
            </CardHeader>
            <CardContent>
              {isConnected ? (
                <div className="space-y-4">
                  <ProductsList />
                  <Link href="/sell">
                    <Button className="w-full">List New Product</Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Connect your wallet to view your listed products</p>
                  <WalletButton />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My NFTs</CardTitle>
              <CardDescription>NFT certificates in your wallet</CardDescription>
            </CardHeader>
            <CardContent>
              {isConnected ? (
                <div className="space-y-4">
                  <NFTGallery />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Connect your wallet to view your NFTs</p>
                  <WalletButton />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

