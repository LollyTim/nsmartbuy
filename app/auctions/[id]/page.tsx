"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useWallet } from "@/context/wallet-context"
import { ArrowLeft, Clock, ExternalLink, History, User } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function AuctionDetailPage({ params }: { params: { id: string } }) {
  const auctionId = params.id
  const { isConnected, connectWallet, balance } = useWallet()
  const [bidAmount, setBidAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Mock auction data
  const auction = {
    id: Number.parseInt(auctionId),
    name: `Auction Item ${auctionId}`,
    description:
      "This is a rare collectible item being auctioned with blockchain verification. The winning bidder will receive the physical item along with an NFT certificate of authenticity on the Cardano blockchain.",
    currentBid: 250,
    currency: "₳",
    minBidIncrement: 10,
    category: "Collectibles",
    seller: "TrustSeller123",
    sellerRating: 4.8,
    tokenId: `asset1q9v8p8xz6z4xz6z4xz6z4xz6z4xz6z4xz6z${auctionId}`,
    images: [
      `/placeholder.svg?height=600&width=600&text=Auction+${auctionId}`,
      `/placeholder.svg?height=600&width=600&text=Auction+${auctionId}+View+2`,
      `/placeholder.svg?height=600&width=600&text=Auction+${auctionId}+View+3`,
    ],
    endTime: new Date(Date.now() + 86400000 * 3), // 3 days from now
    bids: [
      {
        id: 1,
        bidder: "User123",
        amount: 250,
        time: new Date(Date.now() - 3600000),
      },
      {
        id: 2,
        bidder: "Collector456",
        amount: 230,
        time: new Date(Date.now() - 7200000),
      },
      {
        id: 3,
        bidder: "Buyer789",
        amount: 200,
        time: new Date(Date.now() - 14400000),
      },
    ],
  }

  const handlePlaceBid = async () => {
    if (!bidAmount) {
      toast({
        title: "Bid Amount Required",
        description: "Please enter a bid amount.",
        variant: "destructive",
      })
      return
    }

    const bidValue = Number.parseFloat(bidAmount)

    if (bidValue <= auction.currentBid) {
      toast({
        title: "Bid Too Low",
        description: `Your bid must be higher than the current bid of ${auction.currentBid} ${auction.currency}.`,
        variant: "destructive",
      })
      return
    }

    if (bidValue < auction.currentBid + auction.minBidIncrement) {
      toast({
        title: "Bid Increment Too Small",
        description: `Minimum bid increment is ${auction.minBidIncrement} ${auction.currency}.`,
        variant: "destructive",
      })
      return
    }

    if (bidValue > balance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${auction.currency} in your wallet.`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Bid Placed Successfully",
        description: `You have placed a bid of ${bidValue} ${auction.currency} on ${auction.name}.`,
      })
      setIsLoading(false)
      setBidAmount("")
    }, 2000)
  }

  // Calculate time remaining
  const now = new Date()
  const timeRemaining = auction.endTime.getTime() - now.getTime()
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/auctions" className="flex items-center text-muted-foreground mb-6 hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Auctions
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden border">
            <img
              src={auction.images[0] || "/placeholder.svg"}
              alt={auction.name}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {auction.images.map((image, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${auction.name} view ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge>{auction.category}</Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Verified NFT
              </Badge>
            </div>
            <h1 className="text-3xl font-bold">{auction.name}</h1>
            <p className="text-sm text-muted-foreground mt-2">Sold by: {auction.seller}</p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Bid:</span>
              <span className="text-2xl font-bold">
                {auction.currentBid} {auction.currency}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Time Remaining:</span>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">
                  {days}d {hours}h {minutes}m
                </span>
              </div>
            </div>

            {isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder={`Min bid: ${auction.currentBid + auction.minBidIncrement} ${auction.currency}`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                  <Button onClick={handlePlaceBid} disabled={isLoading} className="whitespace-nowrap">
                    {isLoading ? "Processing..." : "Place Bid"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum bid increment: {auction.minBidIncrement} {auction.currency}
                </p>
              </div>
            ) : (
              <Button onClick={connectWallet} className="w-full">
                Connect Wallet to Bid
              </Button>
            )}
          </div>

          <div>
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="text-muted-foreground">{auction.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`https://cardanoscan.io/token/${auction.tokenId}`}
              target="_blank"
              className="text-sm flex items-center text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View NFT on Cardano Explorer
            </Link>
          </div>
        </div>
      </div>

      <Tabs defaultValue="bids" className="mt-12">
        <TabsList className="mb-4">
          <TabsTrigger value="bids">Bid History</TabsTrigger>
          <TabsTrigger value="details">Auction Details</TabsTrigger>
          <TabsTrigger value="verification">Blockchain Verification</TabsTrigger>
        </TabsList>
        <TabsContent value="bids" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bid History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auction.bids.map((bid) => (
                  <div key={bid.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{bid.bidder}</p>
                        <p className="text-xs text-muted-foreground">{bid.time.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="font-bold">
                      {bid.amount} {auction.currency}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Auction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Auction Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-muted-foreground">Start Date:</p>
                    <p>{new Date(auction.endTime.getTime() - 7 * 86400000).toLocaleDateString()}</p>
                    <p className="text-muted-foreground">End Date:</p>
                    <p>{auction.endTime.toLocaleDateString()}</p>
                    <p className="text-muted-foreground">Starting Bid:</p>
                    <p>100 {auction.currency}</p>
                    <p className="text-muted-foreground">Current Bid:</p>
                    <p>
                      {auction.currentBid} {auction.currency}
                    </p>
                    <p className="text-muted-foreground">Min Increment:</p>
                    <p>
                      {auction.minBidIncrement} {auction.currency}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Seller Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-muted-foreground">Seller:</p>
                    <p>{auction.seller}</p>
                    <p className="text-muted-foreground">Rating:</p>
                    <p>{auction.sellerRating}/5</p>
                    <p className="text-muted-foreground">Auctions Completed:</p>
                    <p>24</p>
                    <p className="text-muted-foreground">Member Since:</p>
                    <p>January 2023</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Auction Terms</h3>
                <p className="text-sm text-muted-foreground">
                  By placing a bid, you agree to the TrustEcom auction terms and conditions. The highest bidder at the
                  end of the auction will automatically purchase the item. Payment will be processed through a smart
                  contract on the Cardano blockchain. The winning bidder will receive the physical item along with an
                  NFT certificate of authenticity.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This auction is secured by the Cardano blockchain. The item being auctioned has been tokenized as an
                NFT, providing proof of authenticity and ownership. The auction process is managed by a smart contract
                that ensures transparent bidding and secure payment processing.
              </p>

              <div className="space-y-2">
                <h3 className="font-medium">Token Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Token ID</span>
                    <span className="truncate max-w-[200px]">{auction.tokenId}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Blockchain</span>
                    <span>Cardano</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Smart Contract</span>
                    <span>Auction Escrow v1.0</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Current Owner</span>
                    <span>{auction.seller}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Verification Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <History className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Item Tokenized as NFT</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(auction.endTime.getTime() - 14 * 86400000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <History className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Auction Smart Contract Created</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(auction.endTime.getTime() - 7 * 86400000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <History className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Auction Started</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(auction.endTime.getTime() - 7 * 86400000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Link href={`https://cardanoscan.io/token/${auction.tokenId}`} target="_blank">
                  <Button variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Cardano Explorer
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

