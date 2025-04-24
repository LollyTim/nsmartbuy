"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
// Update the import to handle the potentially null context properly
import { useWallet } from "@/context/wallet-context"
import { ShoppingCart, ExternalLink } from "lucide-react"

export default function FeaturedProducts() {
  const { isConnected } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  // Mock featured products data
  const products = [
    {
      id: 1,
      name: "Limited Edition Smartwatch",
      price: 250,
      currency: "₳",
      image: "/placeholder.svg?height=200&width=200",
      category: "Electronics",
      tokenId: "asset1q9v8p8xz6z4xz6z4xz6z4xz6z4xz6z4xz6z4x",
      isVerified: true,
    },
    {
      id: 2,
      name: "Vintage Collectible Figurine",
      price: 180,
      currency: "₳",
      image: "/placeholder.svg?height=200&width=200",
      category: "Collectibles",
      tokenId: "asset1q9v8p8xz6z4xz6z4xz6z4xz6z4xz6z4xz6z4y",
      isVerified: true,
    },
    {
      id: 3,
      name: "Designer Handbag",
      price: 320,
      currency: "₳",
      image: "/placeholder.svg?height=200&width=200",
      category: "Fashion",
      tokenId: "asset1q9v8p8xz6z4xz6z4xz6z4xz6z4xz6z4xz6z4z",
      isVerified: true,
    },
    {
      id: 4,
      name: "Digital Art Collection",
      price: 150,
      currency: "₳",
      image: "/placeholder.svg?height=200&width=200",
      category: "Art",
      tokenId: "asset1q9v8p8xz6z4xz6z4xz6z4xz6z4xz6z4xz6z5a",
      isVerified: true,
    },
  ]

  const handleAddToCart = (productId: number) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log(`Added product ${productId} to cart`)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div className="relative aspect-square">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Verified NFT
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="space-y-1">
              <h3 className="font-medium truncate">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.category}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="font-bold">
                  {product.price} {product.currency}
                </p>
                <Link
                  href={`https://cardanoscan.io/token/${product.tokenId}`}
                  target="_blank"
                  className="text-xs flex items-center text-muted-foreground hover:text-primary"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View on Chain
                </Link>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            {isConnected ? (
              <Button className="w-full" onClick={() => handleAddToCart(product.id)} disabled={isLoading}>
                {isLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
            ) : (
              <Link href="/marketplace/product/1" className="w-full">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

