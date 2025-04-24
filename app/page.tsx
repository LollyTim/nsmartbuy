import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, CheckCircle, Shield, Wallet } from "lucide-react"
import FeaturedProducts from "@/components/featured-products"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Transparent E-commerce Powered by Blockchain
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                TrustEcom provides a secure marketplace where every transaction is verified on the Cardano blockchain.
                Buy, sell, and auction products with complete transparency.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/marketplace">
                  <Button size="lg" className="w-full min-[400px]:w-auto">
                    Explore Marketplace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/learn">
                  <Button variant="outline" size="lg" className="w-full min-[400px]:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-[500px] aspect-square rounded-xl overflow-hidden shadow-xl">
                <img
                  src="/placeholder.svg?height=500&width=500"
                  alt="TrustEcom Marketplace"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-muted/50 rounded-xl">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter">Why Choose TrustEcom?</h2>
            <p className="text-muted-foreground mt-4 max-w-[700px] mx-auto">
              Our blockchain-powered platform offers unique benefits that traditional e-commerce can't match.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <Shield className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">Verified Authenticity</h3>
                  <p className="text-muted-foreground">
                    Every product is tokenized as an NFT, providing proof of authenticity and ownership history.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <CheckCircle className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">Transparent Transactions</h3>
                  <p className="text-muted-foreground">
                    All purchases are recorded on the Cardano blockchain, creating an immutable record of ownership.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <Wallet className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">Integrated Wallet</h3>
                  <p className="text-muted-foreground">
                    Seamlessly convert Naira to Cardano and manage your digital assets in one place.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter mb-8">Featured Products</h2>
          <FeaturedProducts />
          <div className="mt-10 text-center">
            <Link href="/marketplace">
              <Button size="lg">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

