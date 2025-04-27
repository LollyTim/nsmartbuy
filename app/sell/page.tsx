"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/context/wallet-context"
import { Separator } from "@/components/ui/separator"
import { Upload, ImageIcon, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import WalletButton from "@/components/wallet-button"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function SellPage() {
  const { isConnected, address } = useWallet()
  const createProduct = useMutation(api.products.createProduct)
  const saveAuctionData = useMutation(api.products.saveAuctionData)
  const [isLoading, setIsLoading] = useState(false)
  const [productName, setProductName] = useState("")
  const [productDescription, setProductDescription] = useState("")
  const [productCategory, setProductCategory] = useState("")
  const [productPrice, setProductPrice] = useState("")
  const [productQuantity, setProductQuantity] = useState("1")
  const [auctionStartPrice, setAuctionStartPrice] = useState("")
  const [auctionDuration, setAuctionDuration] = useState("3")
  const [productImage, setProductImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProductImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setProductImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCreateListing = async (isAuction = false) => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a listing",
        variant: "destructive",
      })
      return
    }

    if (!productName || !productDescription || !productCategory) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (isAuction && !auctionStartPrice) {
      toast({
        title: "Missing Information",
        description: "Please enter a starting price for the auction",
        variant: "destructive",
      })
      return
    }

    if (!isAuction && !productPrice) {
      toast({
        title: "Missing Information",
        description: "Please enter a price for the product",
        variant: "destructive",
      })
      return
    }

    if (!productImage) {
      toast({
        title: "Missing Image",
        description: "Please upload an image for your product",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      console.log("🚀 Starting product creation process...")

      // First upload the image to IPFS
      console.log("📤 Uploading image to IPFS...")
      const formData = new FormData()
      formData.append("file", productImage)

      const imageUploadResponse = await fetch("/api/ipfs", {
        method: "POST",
        body: formData,
      })

      if (!imageUploadResponse.ok) {
        const errorData = await imageUploadResponse.json()
        throw new Error(`Failed to upload image: ${errorData.error || "Unknown error"}`)
      }

      const imageData = await imageUploadResponse.json()
      console.log("✅ Image uploaded successfully:", imageData)

      // Create product metadata
      const metadata = {
        name: productName,
        description: productDescription,
        image: imageData.url,
        category: productCategory,
        price: isAuction ? Number.parseFloat(auctionStartPrice) : Number.parseFloat(productPrice),
        isAuction,
        auctionDuration: isAuction ? Number.parseInt(auctionDuration) : null,
        quantity: Number.parseInt(productQuantity),
        createdAt: new Date().toISOString(),
        sellerAddress: address,
        attributes: [
          {
            trait_type: "Category",
            value: productCategory
          },
          {
            trait_type: "Listing Type",
            value: isAuction ? "Auction" : "Fixed Price"
          }
        ]
      }

      // Upload metadata to IPFS
      console.log("📤 Uploading metadata to IPFS...")
      const metadataResponse = await fetch("/api/ipfs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      })

      if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json()
        throw new Error(`Failed to upload metadata: ${errorData.error || "Unknown error"}`)
      }

      const metadataData = await metadataResponse.json()
      console.log("✅ Metadata uploaded successfully:", metadataData)

      // Save to Convex
      console.log("💾 Saving product to Convex...")
      const productData = {
        name: productName,
        description: productDescription,
        price: isAuction ? Number.parseFloat(auctionStartPrice) : Number.parseFloat(productPrice),
        currency: "₳",
        image: imageData.url,
        mediaType: productImage.type || "image/jpeg",
        ipfsHash: metadataData.hash,
        metadata: {
          format: productImage.name.split(".").pop() || "jpeg",
          isDirectAsset: true,
        },
        sellerAddress: address,
      }

      // Save product to Convex
      const productId = await createProduct(productData)
      console.log("✅ Product saved to Convex:", productId)

      // If it's an auction, create the auction record
      if (isAuction) {
        console.log("📊 Creating auction record...")
        const auctionData = {
          productId,
          startingPrice: Number.parseFloat(auctionStartPrice),
          sellerAddress: address,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + Number.parseInt(auctionDuration) * 24 * 60 * 60 * 1000).toISOString(),
        }

        const auctionId = await saveAuctionData(auctionData)
        console.log("✅ Auction created:", auctionId)
      }

      console.log("🎉 Product creation completed successfully!")

      // Show success message
      toast({
        title: isAuction ? "Auction Created" : "Product Listed",
        description: isAuction
          ? "Your product has been listed for auction successfully"
          : "Your product has been listed on the marketplace successfully",
      })

      // Reset form
      setProductName("")
      setProductDescription("")
      setProductCategory("")
      setProductPrice("")
      setProductQuantity("1")
      setAuctionStartPrice("")
      setAuctionDuration("3")
      setProductImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

    } catch (error) {
      console.error("❌ Error creating listing:", error)
      toast({
        title: "Error Creating Listing",
        description: error instanceof Error ? error.message : "Failed to create listing",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Connect your Cardano wallet to start selling on smartBuy.</CardDescription>
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
      <h1 className="text-3xl font-bold tracking-tight mb-6">Sell on smartBuy</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create a New Listing</CardTitle>
          <CardDescription>
            List your product for sale or auction. Each product will be tokenized as an NFT on the Cardano blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fixed-price" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="fixed-price" onClick={() => setProductCategory("fixed-price")}>
                Fixed Price
              </TabsTrigger>
              <TabsTrigger value="auction" onClick={() => setProductCategory("auction")}>
                Auction
              </TabsTrigger>
            </TabsList>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name *</Label>
                    <Input
                      id="product-name"
                      placeholder="Enter product name"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-category">Category *</Label>
                    <Select value={productCategory} onValueChange={setProductCategory}>
                      <SelectTrigger id="product-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="collectibles">Collectibles</SelectItem>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="art">Art</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-description">Description *</Label>
                  <Textarea
                    id="product-description"
                    placeholder="Describe your product in detail"
                    className="min-h-[120px]"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Product Image *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 cursor-pointer ${imagePreview ? "border-primary" : ""}`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imagePreview ? (
                        <div className="relative w-full h-32">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Product preview"
                            className="w-full h-full object-contain"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-0 right-0 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveImage()
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">Upload Image</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP</p>
                        </>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center justify-center border rounded-md p-4">
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm">
                          Your product image will be tokenized as an NFT on the Cardano blockchain, providing proof of
                          authenticity.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <TabsContent value="fixed-price" className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="product-price">Price (₳) *</Label>
                      <Input
                        id="product-price"
                        type="number"
                        placeholder="0.00"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-quantity">Quantity</Label>
                      <Input
                        id="product-quantity"
                        type="number"
                        placeholder="1"
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="auction" className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="auction-start-price">Starting Price (₳) *</Label>
                      <Input
                        id="auction-start-price"
                        type="number"
                        placeholder="0.00"
                        value={auctionStartPrice}
                        onChange={(e) => setAuctionStartPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="auction-duration">Duration (days)</Label>
                      <Select value={auctionDuration} onValueChange={setAuctionDuration}>
                        <SelectTrigger id="auction-duration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="5">5 days</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Blockchain Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Your product will be tokenized as an NFT on the Cardano blockchain, providing proof of authenticity
                  and ownership. The metadata will be stored on IPFS for permanent, decentralized access.
                </p>
              </div>
            </div>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={() => handleCreateListing(productCategory === "auction")} disabled={isLoading}>
            {isLoading ? "Creating..." : productCategory === "auction" ? "Create Auction" : "Create Listing"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

