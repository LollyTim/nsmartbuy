"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, Info } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Mock function to fetch NFTs - in a real app, this would call your API
const fetchUserNFTs = async (address: string) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return mock data
  return [
    {
      id: "nft_1",
      name: "Premium Smartwatch NFT",
      image: "/placeholder.svg?height=100&width=100",
      tokenId: "asset1q9v8p8xz6z4xz6z4xz6z4xz6z4xz6z4xz6z4x",
      metadata: {
        name: "Premium Smartwatch NFT",
        description: "Certificate of authenticity for Premium Smartwatch",
        attributes: [
          { trait_type: "Category", value: "Electronics" },
          { trait_type: "Minted", value: "2023-05-15" },
        ],
      },
    },
    {
      id: "nft_2",
      name: "Vintage Collectible NFT",
      image: "/placeholder.svg?height=100&width=100",
      tokenId: "asset1q9v8p8xz6z4xz6z4xz6z4xz6z4xz6z4xz6z4y",
      metadata: {
        name: "Vintage Collectible NFT",
        description: "Certificate of authenticity for Vintage Collectible",
        attributes: [
          { trait_type: "Category", value: "Collectibles" },
          { trait_type: "Minted", value: "2023-06-20" },
        ],
      },
    },
  ]
}

export default function NFTGallery() {
  const { address } = useWallet()
  const [nfts, setNfts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNft, setSelectedNft] = useState<any>(null)

  useEffect(() => {
    const loadNFTs = async () => {
      if (!address) return

      setIsLoading(true)
      try {
        const userNFTs = await fetchUserNFTs(address)
        setNfts(userNFTs)
      } catch (error) {
        console.error("Error loading NFTs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNFTs()
  }, [address])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-md" />
        ))}
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No NFTs found in your wallet</p>
        <Link href="/marketplace">
          <Button>Browse Marketplace</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {nfts.map((nft) => (
          <Card key={nft.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="aspect-square rounded-md overflow-hidden mb-2">
                <img src={nft.image || "/placeholder.svg"} alt={nft.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium truncate">{nft.name}</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedNft(nft)}>
                      <Info className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>NFT Details</DialogTitle>
                    </DialogHeader>
                    {selectedNft && (
                      <div className="space-y-4">
                        <div className="aspect-square max-w-[200px] mx-auto rounded-md overflow-hidden">
                          <img
                            src={selectedNft.image || "/placeholder.svg"}
                            alt={selectedNft.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{selectedNft.metadata.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{selectedNft.metadata.description}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Attributes</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedNft.metadata.attributes.map((attr: any, i: number) => (
                              <div key={i} className="bg-muted rounded-md p-2">
                                <p className="text-xs text-muted-foreground">{attr.trait_type}</p>
                                <p className="text-sm font-medium">{attr.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="pt-2">
                          <Link
                            href={`https://cardanoscan.io/token/${selectedNft.tokenId}`}
                            target="_blank"
                            className="text-sm flex items-center text-primary hover:underline"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View on Cardano Explorer
                          </Link>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center mt-1">
                <Link
                  href={`https://cardanoscan.io/token/${nft.tokenId}`}
                  target="_blank"
                  className="text-xs flex items-center text-muted-foreground hover:text-primary"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View on Chain
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

