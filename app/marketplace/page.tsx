"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState, useMemo } from "react"
import { useWallet } from "@/context/wallet-context"
import { ImageIcon } from "lucide-react"
import { ProductCard } from "./components/product-card"
import { MarketplaceSidebar } from "./components/marketplace-sidebar"
import { Id } from "@/convex/_generated/dataModel"

interface ProductWithAuction {
  _id: Id<"products">;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  sellerAddress: string;
  status: string;
  createdAt: number;
  isAuction?: boolean;
  currentBid?: number;
  endTime?: string;
  metadata?: {
    category?: string;
    [key: string]: any;
  };
}

export default function MarketplacePage() {
  const { address } = useWallet()
  const [filters, setFilters] = useState({
    category: "all",
    priceRange: [0, 10000] as [number, number],
    listingType: "all" as "all" | "fixed" | "auction",
    sortBy: "newest",
  });

  // Fetch all products
  const products = useQuery(api.products.getProducts, {
    status: "active",
  });

  // Fetch active auctions
  const auctions = useQuery(api.products.getActiveAuctions);

  // Combine products with auction data
  const productsWithAuctions = useMemo(() => {
    if (!products || !auctions) return [];

    const auctionMap = new Map(auctions.map(auction => [auction.productId, auction]));

    return products.map(product => {
      const auction = auctionMap.get(product._id);
      return {
        ...product,
        isAuction: !!auction,
        currentBid: auction?.currentBid,
        endTime: auction?.endTime,
      } as ProductWithAuction;
    });
  }, [products, auctions]);

  // Calculate categories and counts
  const categories = useMemo(() => {
    if (!productsWithAuctions) return [];

    const categoryCounts = productsWithAuctions.reduce((acc, product) => {
      const category = product.metadata?.category || "other";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts).map(([id, count]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      count,
    }));
  }, [productsWithAuctions]);

  // Calculate max price
  const maxPrice = useMemo(() => {
    if (!productsWithAuctions) return 10000;
    return Math.max(...productsWithAuctions.map(p => p.isAuction ? (p.currentBid || p.price) : p.price));
  }, [productsWithAuctions]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!productsWithAuctions) return [];

    return productsWithAuctions
      .filter(product => {
        // Category filter
        if (filters.category !== "all") {
          const productCategory = product.metadata?.category || "other";
          if (productCategory !== filters.category) return false;
        }

        // Price filter
        const productPrice = product.isAuction ? (product.currentBid || product.price) : product.price;
        if (productPrice < filters.priceRange[0] || productPrice > filters.priceRange[1]) {
          return false;
        }

        // Listing type filter
        if (filters.listingType !== "all") {
          if (filters.listingType === "auction" && !product.isAuction) return false;
          if (filters.listingType === "fixed" && product.isAuction) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "newest":
            return b.createdAt - a.createdAt;
          case "oldest":
            return a.createdAt - b.createdAt;
          case "price-low":
            return (a.isAuction ? (a.currentBid || a.price) : a.price) -
              (b.isAuction ? (b.currentBid || b.price) : b.price);
          case "price-high":
            return (b.isAuction ? (b.currentBid || b.price) : b.price) -
              (a.isAuction ? (a.currentBid || a.price) : a.price);
          default:
            return 0;
        }
      });
  }, [productsWithAuctions, filters]);

  // Loading state
  if (!products || !auctions) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="h-[600px] bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[400px] bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <MarketplaceSidebar
            onFilterChange={setFilters}
            categories={categories}
            maxPrice={maxPrice}
          />
        </div>
        <div className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or check back later for new listings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id.toString()}
                  id={product._id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  imageUrl={product.image}
                  currency={product.currency}
                  seller={product.sellerAddress}
                  isAuction={product.isAuction}
                  auction={product.isAuction ? {
                    endTime: new Date(product.endTime || '').getTime(),
                    currentBid: product.currentBid || product.price,
                    highestBidder: product.sellerAddress // This should be updated with actual highest bidder
                  } : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

