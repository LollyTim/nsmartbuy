import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, Check, ExternalLink, ShoppingCart, Star } from "lucide-react"
import ProductVerificationHistory from "@/components/product-verification-history"

export default function ProductPage({ params }: { params: { id: string } }) {
  const productId = params.id

  // Mock product data
  const product = {
    id: Number.parseInt(productId),
    name: `Premium Product ${productId}`,
    description:
      "This is a high-quality product with blockchain verification. Each item is tokenized as an NFT on the Cardano blockchain, providing proof of authenticity and ownership history.",
    price: 250,
    currency: "₳",
    category: "Electronics",
    seller: "TrustSeller123",
    sellerRating: 4.8,
    tokenId: `asset1q9v8p8xz6z4xz6z4xz6z4xz6z4xz6z4xz6z${productId}`,
    images: [
      `/placeholder.svg?height=600&width=600&text=Product+${productId}`,
      `/placeholder.svg?height=600&width=600&text=Product+${productId}+View+2`,
      `/placeholder.svg?height=600&width=600&text=Product+${productId}+View+3`,
    ],
    features: [
      "Blockchain verified authenticity",
      "NFT ownership certificate",
      "Transparent transaction history",
      "Premium quality materials",
      "1-year warranty",
    ],
    specifications: {
      Dimensions: "10 x 5 x 2 inches",
      Weight: "1.2 lbs",
      Material: "Premium grade aluminum",
      Color: "Space Gray",
      Warranty: "1 year limited warranty",
    },
    stock: 15,
    reviews: [
      {
        id: 1,
        user: "VerifiedBuyer1",
        rating: 5,
        date: "2023-12-15",
        comment: "Excellent product! The blockchain verification gave me confidence in my purchase.",
        verified: true,
      },
      {
        id: 2,
        user: "TrustCustomer",
        rating: 4,
        date: "2023-11-28",
        comment: "Good quality and fast shipping. The NFT certificate is a nice touch.",
        verified: true,
      },
    ],
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/marketplace" className="flex items-center text-muted-foreground mb-6 hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden border">
            <img
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {product.images.map((image, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} view ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge>{product.category}</Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Verified NFT
              </Badge>
            </div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.sellerRating) ? "fill-primary text-primary" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.sellerRating} ({product.reviews.length} reviews)
              </span>
            </div>
          </div>

          <div>
            <p className="text-2xl font-bold">
              {product.price} {product.currency}
            </p>
            <p className="text-sm text-muted-foreground mt-1">In stock: {product.stock} available</p>
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          <div className="flex items-center gap-2">
            <Link
              href={`https://cardanoscan.io/token/${product.tokenId}`}
              target="_blank"
              className="text-sm flex items-center text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View NFT on Cardano Explorer
            </Link>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Key Features:</h3>
            <ul className="space-y-1">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 mt-1 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1" size="lg">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button variant="outline" className="flex-1" size="lg">
              Buy Now
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Seller: {product.seller}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="mt-12">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="verification">Blockchain Verification</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <h2 className="text-xl font-bold">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b">
                <span className="font-medium">{key}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="verification">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">Blockchain Verification</h2>
              <p className="mb-6">
                This product has been tokenized as an NFT on the Cardano blockchain. The NFT serves as a certificate of
                authenticity and allows you to verify the product's origin and ownership history.
              </p>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Token Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Token ID</span>
                    <span className="truncate max-w-[200px]">{product.tokenId}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Blockchain</span>
                    <span>Cardano</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Minted Date</span>
                    <span>2023-10-15</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Current Owner</span>
                    <span>TrustSeller123</span>
                  </div>
                </div>
              </div>

              <h3 className="font-medium mb-4">Ownership History</h3>
              <ProductVerificationHistory />

              <div className="mt-6 flex justify-center">
                <Link href={`https://cardanoscan.io/token/${product.tokenId}`} target="_blank">
                  <Button variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Complete History on Cardano Explorer
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews">
          <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.user}</span>
                    {review.verified && (
                      <Badge variant="outline" className="text-xs">
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">{review.date}</span>
                </div>
                <div className="flex mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

