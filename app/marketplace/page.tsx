import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Search, Flame, Star, BadgeCheck } from "lucide-react"
import { ProductCard } from "./components/product-card"
import { Suspense } from "react"

// Define the product type
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  priceInAda?: number;
  image: string;
  isNew?: boolean;
  isVerified?: boolean;
  isPopular?: boolean;
  seller: string;
  ipfsUrl: string;
  tokenId: string;
}

// Sample products data
const products: Product[] = [
  {
    id: 1,
    name: "African Print Dashiki",
    description: "Authentic Nigerian Ankara fabric",
    price: 15000,
    priceInAda: 45,
    image: "https://ipfs.io/ipfs/QmPgiNFzGrhH5C6NPKcyxPRc8RS7wPGptzH2KoVLJbAvBj",
    ipfsUrl: "https://ipfs.io/ipfs/QmPgiNFzGrhH5C6NPKcyxPRc8RS7wPGptzH2KoVLJbAvBj",
    tokenId: "NFT-001",
    seller: "NaijaFashion",
    isVerified: true,
    isPopular: true
  },
  {
    id: 2,
    name: "Tecno Camon 20 Pro",
    description: "Brand new smartphone with 64MP camera",
    price: 185000,
    priceInAda: 550,
    image: "https://ipfs.io/ipfs/QmPgiNFzGrhH5C6NPKcyxPRc8RS7wPGptzH2KoVLJbAvBj",
    ipfsUrl: "https://ipfs.io/ipfs/QmPgiNFzGrhH5C6NPKcyxPRc8RS7wPGptzH2KoVLJbAvBj",
    tokenId: "NFT-002",
    seller: "TechHubNG",
    isNew: true,
    isVerified: true
  },
  {
    id: 3,
    name: "Handcrafted Beaded Necklace",
    description: "Traditional Yoruba jewelry",
    price: 8500,
    priceInAda: 25,
    image: "https://ipfs.io/ipfs/QmPgiNFzGrhH5C6NPKcyxPRc8RS7wPGptzH2KoVLJbAvBj",
    ipfsUrl: "https://ipfs.io/ipfs/QmPgiNFzGrhH5C6NPKcyxPRc8RS7wPGptzH2KoVLJbAvBj",
    tokenId: "NFT-003",
    seller: "AfricanCrafts",
    isPopular: true
  },
  // Add more Nigerian products
];

function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border bg-green-50 text-card-foreground shadow-sm animate-pulse">
      <div className="aspect-square bg-green-100" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-green-200 rounded w-3/4" />
        <div className="h-3 bg-green-200 rounded w-1/2" />
        <div className="h-3 bg-green-200 rounded w-1/4" />
      </div>
      <div className="p-4 pt-0 flex justify-between items-center">
        <div className="h-8 w-24 bg-green-200 rounded" />
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-xl p-6 mb-8 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Marketplace</h1>
          <p className="text-green-100 mb-4">
            Buy authentic Nigerian products with blockchain verification. All transactions secured on Cardano.
          </p>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-green-300" />
              <Input 
                type="search" 
                placeholder="Search products..." 
                className="w-full pl-10 bg-green-800 border-green-700 text-white placeholder-green-300" 
              />
            </div>
            <Button className="bg-yellow-500 hover:bg-yellow-400 text-green-900">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <Filter className="h-4 w-4 mr-2 text-green-700" />
              Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2 text-green-800">Categories</h4>
                <div className="space-y-1">
                  {['All', 'Fashion', 'Electronics', 'Home Goods', 'Beauty', 'Arts'].map(category => (
                    <Button 
                      key={category}
                      variant="ghost" 
                      className="w-full justify-start text-green-700 hover:bg-green-100"
                      size="sm"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 text-green-800">Price Range (₦)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Min" className="bg-white" />
                  <Input placeholder="Max" className="bg-white" />
                </div>
                <Button className="w-full mt-2 bg-green-600 hover:bg-green-700">
                  Apply
                </Button>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 text-green-800">Verification</h4>
                <div className="space-y-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-green-700 hover:bg-green-100"
                    size="sm"
                  >
                    <BadgeCheck className="h-4 w-4 mr-2 text-green-600" />
                    Verified Only
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-green-700 hover:bg-green-100"
                    size="sm"
                  >
                    All Items
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h3 className="font-medium mb-3 text-yellow-800">Sell on smartBuy</h3>
            <p className="text-sm text-yellow-700 mb-3">
              Join our marketplace of verified Nigerian sellers
            </p>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Become a Seller
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="all">
            <TabsList className="bg-green-50 mb-6">
              <TabsTrigger value="all" className="flex items-center">
                All Products
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center">
                <Flame className="h-4 w-4 mr-1 text-orange-500" />
                Hot Deals
              </TabsTrigger>
              <TabsTrigger value="verified" className="flex items-center">
                <BadgeCheck className="h-4 w-4 mr-1 text-green-600" />
                Verified
              </TabsTrigger>
            </TabsList>

            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-green-700">
                Showing {products.length} products
              </p>
              <Select>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="all">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Suspense fallback={Array(6).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      description={product.description}
                      price={product.price}
                      priceInAda={product.priceInAda}
                      image={product.image}
                      isNew={product.isNew}
                      isVerified={product.isVerified}
                      seller={product.seller}
                      ipfsUrl={product.ipfsUrl}
                      tokenId={product.tokenId}
                    />
                  ))}
                </Suspense>
              </div>
            </TabsContent>

            <TabsContent value="new">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .filter(p => p.isNew)
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      {...product}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="verified">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .filter(p => p.isVerified)
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      {...product}
                    />
                  ))}
              </div>
            </TabsContent>

            <div className="flex justify-center mt-8 space-x-2">
              <Button variant="outline" className="border-green-300 text-green-700">
                Previous
              </Button>
              <Button variant="outline" className="border-green-300 text-green-700">
                Next
              </Button>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}