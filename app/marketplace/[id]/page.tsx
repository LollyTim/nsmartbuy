"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Gavel, User, Calendar, Tag } from "lucide-react";
import { formatDistance } from "date-fns";
import { useWallet } from "@/context/wallet-context";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "convex/react";

export default function ProductPage({ params }: { params: { id: string } }) {
    const { toast } = useToast();
    const { address } = useWallet();
    const addToCart = useMutation(api.cart.addToCart);

    // Get product details
    const product = useQuery(api.products.getProduct, {
        id: params.id as Id<"products">,
    });

    // Get auction details if it exists
    const auction = useQuery(api.products.getAuction, {
        productId: params.id as Id<"products">,
    });

    // Loading state
    if (!product) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-8">
                    <div className="h-96 bg-muted rounded-lg" />
                    <div className="space-y-4">
                        <div className="h-8 bg-muted rounded w-1/3" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    // 404 if product not found
    if (!product || product.status !== "active") {
        notFound();
    }

    const handleAddToCart = async () => {
        if (!address) {
            toast({
                title: "Please connect your wallet",
                description: "You need to connect your wallet to add items to cart.",
                variant: "destructive",
            });
            return;
        }

        try {
            await addToCart({
                productId: params.id as Id<"products">,
                quantity: 1,
                buyerAddress: address,
            });

            toast({
                title: "Added to cart",
                description: "The item has been added to your cart.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add item to cart",
                variant: "destructive",
            });
        }
    };

    // Format price with commas and 2 decimal places
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const isAuction = !!auction;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                    />
                </div>

                {/* Product Details */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl">{product.name}</CardTitle>
                            <Badge variant={isAuction ? "destructive" : "secondary"}>
                                {isAuction ? (
                                    <><Gavel className="mr-1 h-3 w-3" /> Auction</>
                                ) : (
                                    <><ShoppingCart className="mr-1 h-3 w-3" /> Fixed Price</>
                                )}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-muted-foreground">{product.description}</p>

                        <div className="space-y-4">
                            {/* Price/Bid Information */}
                            {isAuction && auction ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-lg font-semibold">
                                        <Tag className="h-5 w-5" />
                                        Current Bid: {formatPrice(auction.currentBid)} {product.currency}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        Ends: {formatDistance(new Date(auction.endTime), new Date(), { addSuffix: true })}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-lg font-semibold">
                                    <Tag className="h-5 w-5" />
                                    Price: {formatPrice(product.price)} {product.currency}
                                </div>
                            )}

                            {/* Seller Information */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                Seller: {product.sellerAddress}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-4">
                        {!isAuction && (
                            <Button
                                onClick={handleAddToCart}
                                variant="outline"
                                className="flex-1"
                                disabled={!address || product.sellerAddress === address}
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                            </Button>
                        )}
                        {isAuction && (
                            <Button className="flex-1" variant="destructive">
                                <Gavel className="mr-2 h-4 w-4" />
                                Place Bid
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
} 