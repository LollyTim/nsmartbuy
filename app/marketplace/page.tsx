import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Search } from "lucide-react"
import { ProductCard } from "./components/product-card"
import { Suspense } from "react"

// Define the product type
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  isNew?: boolean;
  ipfsUrl: string;
}

// Sample products data - in a real app, this would come from your database
const products: Product[] = [
  {
    id: 1,
    name: "Digital Art #1",
    description: "Unique digital artwork on the blockchain",
    price: 25,
    image: "https://ipfs.io/ipfs/QmPgiNFzGrhH5C6NPKcyxPRc8RS7wPGptzH2KoVLJbAvBj",
    ipfsUrl: "https://ipfs.io/ipfs/QmPgiNFzGrhH5C6NPKcyxPRc8RS7wPGptzH2KoVLJbAvBj",
  },
  {
    id: 2,
    name: "Digital Art #2",
    description: "Another unique digital artwork",
    price: 30,
    image: "https://ipfs.io/ipfs/QmPgiNFzGrhH5C6NPKcyxPRc8RS7wPGptzH2KoVLJbAvBj",
    ipfsUrl: "https://ipfs.io/ipfs/QmPgiNFzGrhH5C6NPKcyxPRc8RS7wPGptzH2KoVLJbAvBj",
    isNew: true,
  },
  // Add more products as needed
];

// Loading skeleton for product cards
function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-1/4" />
      </div>
      <div className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded" />
        </div>
        <div className="h-8 w-24 bg-muted rounded" />
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">Browse verified products on the blockchain</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search products..." className="w-full md:w-[300px] pl-8" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="hidden md:block space-y-6">
          <div>
            <h3 className="font-medium mb-2">Categories</h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                All Categories
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                Electronics
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                Collectibles
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                Fashion
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                Art
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Price Range</h3>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Min" />
              <Input type="number" placeholder="Max" />
            </div>
            <Button className="w-full mt-2" size="sm">
              Apply
            </Button>
          </div>

          <div>
            <h3 className="font-medium mb-2">Verification Status</h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                All Items
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                Verified Only
              </Button>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="new">New Arrivals</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Showing {products.length} products</p>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[180px]">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Suspense fallback={
                  <>
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                  </>
                }>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      isNew={product.isNew}
                      ipfsUrl={product.ipfsUrl}
                    />
                  ))}
                </Suspense>
              </div>

              <div className="flex justify-center mt-8">
                <Button variant="outline" className="mx-2">
                  Previous
                </Button>
                <Button variant="outline" className="mx-2">
                  Next
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="new">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Suspense fallback={
                  <>
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                  </>
                }>
                  {products
                    .filter((product) => product.isNew)
                    .map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        isNew={product.isNew}
                        ipfsUrl={product.ipfsUrl}
                      />
                    ))}
                </Suspense>
              </div>
            </TabsContent>
            <TabsContent value="popular">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Suspense fallback={
                  <>
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                  </>
                }>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      ipfsUrl={product.ipfsUrl}
                    />
                  ))}
                </Suspense>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

