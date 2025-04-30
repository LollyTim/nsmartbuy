import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, CheckCircle, Shield, Wallet, Star, Flame, TrendingUp, ChevronRight, ChevronLeft } from "lucide-react"
import FeaturedProducts from "@/components/featured-products"

export default function Home() {
  // Sample banners data
  const banners = [
    {
      id: 1,
      title: "Jumia Black Friday Deals",
      subtitle: "Up to 70% off on all electronics",
      bgColor: "bg-red-600",
      cta: "Shop Now"
    },
    {
      id: 2,
      title: "Pay with Crypto & Save",
      subtitle: "Get 10% bonus when you pay with ADA",
      bgColor: "bg-green-700",
      cta: "Learn More"
    }
  ]

  // Sample ads data
  const ads = [
    {
      id: 1,
      title: "MTN Data Bonus",
      description: "Buy data bundles and get 20% extra",
      sponsor: "MTN Nigeria",
      placement: "above-trending"
    },
    {
      id: 2,
      title: "Konga Flash Sale",
      description: "24 hours only - prices slashed!",
      sponsor: "Konga.com",
      placement: "mid-content"
    },
    {
      id: 3,
      title: "Glo Weekend Special",
      description: "Double data on all weekend purchases",
      sponsor: "Glo Nigeria",
      placement: "below-sellers"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Marketplace Header */}
      {/* <div className="flex justify-between items-center py-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="text-primary">smart</span>Market
          </h1>
          <p className="text-sm text-muted-foreground">Naija's trusted blockchain marketplace</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/sell">Sell Now</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/wallet">My Wallet</Link>
          </Button>
        </div>
      </div> */}


      {/* Main Banner Carousel */}
      <section className="mb-6 mt-6 relative">
        <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
          {banners.map(banner => (
            <div key={banner.id} className={`${banner.bgColor} w-full h-full flex items-center p-8 absolute inset-0`}>
              <div className="text-white max-w-md">
                <h2 className="text-xl md:text-2xl font-bold mb-2">{banner.title}</h2>
                <p className="mb-4">{banner.subtitle}</p>
                <Button variant="secondary">{banner.cta}</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      
      {/* Categories Quick Access */}
      <div className="py-4 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {['Phones', 'Fashion', 'Electronics', 'Home Goods', 'Automobile', 'Groceries', 'Beauty', 'Sports'].map(cat => (
            <Button key={cat} variant="outline" className="rounded-full">
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Hot Deals Banner */}
      {/* <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Flame className="text-white" />
          <span className="text-white font-bold">Today's Hot Deals</span>
        </div>
        <div className="text-white text-sm">Ends in 12:34:56</div>
      </div> */}

      {/* Strategic Ad Placement 1: Above Trending Products */}
      {/* {ads.find(ad => ad.placement === 'above-trending') && (
        <div className="mb-6 p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-600 font-medium">SPONSORED</span>
              <h3 className="font-bold">{ads[0].title}</h3>
              <p className="text-sm">{ads[0].description}</p>
            </div>
            <Button variant="outline" size="sm">View Offer</Button>
          </div>
        </div>
      )} */}

      {/* Trending Products */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="text-primary" />
            Trending Now
          </h2>
          <Link href="/trending" className="text-sm text-primary flex items-center">
            See all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <FeaturedProducts />
      </section>

      {/* Strategic Ad Placement 2: Middle of Content */}
      {ads.find(ad => ad.placement === 'mid-content') && (
        <div className="my-8 p-4 bg-gradient-to-r from-green-600 to-green-800 rounded-lg text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <span className="text-xs text-green-200 font-medium">LIMITED TIME OFFER</span>
              <h3 className="text-xl font-bold">{ads[1].title}</h3>
              <p className="text-green-100">{ads[1].description}</p>
            </div>
            <Button variant="secondary">Shop Now</Button>
          </div>
        </div>
      )}

      {/* Top Sellers Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {/* <Star className="text-primary" /> */}
            Top Sellers
          </h2>
          <Link href="/sellers" className="text-sm text-primary flex items-center">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['TechHubNG', 'NaijaFashion', 'LagosGadgets', 'AbujaHome'].map(seller => (
            <Card key={seller} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center">
                <img
                  src={`https://res.cloudinary.com/dsaqsxtup/image/upload/v1745965244/74568200_9806510_qw7uip.jpg`}
                  alt={`${seller} logo`}
                  className="w-16 h-16 rounded-full mb-2"
                />
                <h3 className="font-medium">{seller}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                  4.8+
                </div>
                <Button variant="link" size="sm" className="mt-2">
                  Visit Store
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Strategic Ad Placement 3: Below Top Sellers */}
      {ads.find(ad => ad.placement === 'below-sellers') && (
        <div className="mb-8 p-4 border-2 border-yellow-400 rounded-lg bg-yellow-50">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Flame className="text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{ads[2].title}</h3>
                <p className="text-sm text-muted-foreground">{ads[2].description}</p>
              </div>
            </div>
            <Button variant="outline" className="border-yellow-400 text-yellow-700">
              Claim Offer
            </Button>
          </div>
        </div>
      )}

      {/* Blockchain Benefits */}
      <section className="bg-muted/50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Why Shop With Blockchain?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Verified Sellers</h3>
              <p className="text-sm text-muted-foreground">All sellers are verified on Cardano blockchain</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Authentic Products</h3>
              <p className="text-sm text-muted-foreground">Product history stored permanently</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Wallet className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">Pay in Naira or ADA with escrow protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Local Services */}
      {/* <section>
        <h2 className="text-xl font-bold mb-4">Local Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Plumbers', 'Electricians', 'Tailors', 'Hair Stylists'].map(service => (
            <Card key={service} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <h3 className="font-medium">{service}</h3>
                <p className="text-sm text-muted-foreground mt-2">Near you in Lagos</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section> */}
    </div>
  )
}