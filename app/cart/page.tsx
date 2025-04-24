"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useWallet } from "@/context/wallet-context"
import { ArrowLeft, ExternalLink, Minus, Plus, ShoppingCart, Trash } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function CartPage() {
  const { isConnected, connectWallet, balance, sendTransaction } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  // Mock cart data
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Premium Smartwatch",
      price: 150,
      currency: "₳",
      quantity: 1,
      image: "/placeholder.svg?height=200&width=200",
      tokenId: "asset1q9v8p8xz6z4xz6z4xz6z4xz6z4xz6z4xz6z4x",
    },
    {
      id: 2,
      name: "Collectible Figurine",
      price: 80,
      currency: "₳",
      quantity: 2,
      image: "/placeholder.svg?height=200&width=200",
      tokenId: "asset1q9v8p8xz6z4xz6z4xz6z4xz6z4xz6z4xz6z4y",
    },
  ])

  const updateQuantity = (id: number, change: number) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + change)
          return { ...item, quantity: newQuantity }
        }
        return item
      }),
    )
  }

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
    toast({
      title: "Item Removed",
      description: "The item has been removed from your cart.",
    })
  }

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const shippingFee = 5
  const total = subtotal + shippingFee

  const handleCheckout = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to proceed with checkout.",
        variant: "destructive",
      })
      return
    }

    if (balance < total) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${total} ₳ to complete this purchase.`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate payment processing
    try {
      // Mock seller address
      const sellerAddress = "addr1qxck...7v4wfgxgp"

      // Process payment via wallet
      const success = await sendTransaction(sellerAddress, total)

      if (success) {
        toast({
          title: "Purchase Successful",
          description: "Your order has been placed and payment processed.",
        })

        // Clear cart after successful purchase
        setCartItems([])
      }
    } catch (error) {
      console.error("Checkout failed:", error)
      toast({
        title: "Checkout Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/marketplace" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Link>
        <h1 className="text-3xl font-bold tracking-tight ml-auto">Your Cart</h1>
        <div className="flex items-center ml-auto">
          <ShoppingCart className="h-5 w-5 mr-2" />
          <span>{cartItems.length} items</span>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/marketplace">
            <Button>Browse Marketplace</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 py-4 border-b last:border-0">
                    <div className="h-20 w-20 rounded-md overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Link
                          href={`https://cardanoscan.io/token/${item.tokenId}`}
                          target="_blank"
                          className="flex items-center hover:text-primary"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Verified NFT
                        </Link>
                      </div>
                      <div className="flex items-center mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-2 w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.price * item.quantity} {item.currency}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 mt-2 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{subtotal} ₳</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee} ₳</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{total} ₳</span>
                </div>

                {isConnected && (
                  <div className="text-sm text-muted-foreground mt-4">
                    <p>Your wallet balance: {balance} ₳</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {isConnected ? (
                  <Button className="w-full" onClick={handleCheckout} disabled={isLoading || balance < total}>
                    {isLoading ? "Processing..." : "Checkout"}
                  </Button>
                ) : (
                  <Button className="w-full" onClick={connectWallet}>
                    Connect Wallet to Checkout
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

