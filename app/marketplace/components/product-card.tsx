"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Gavel } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWallet } from "@/context/wallet-context";
import { useToast } from "@/components/ui/use-toast";

interface ProductCardProps {
    id: Id<"products">;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    currency: string;
    seller: string;
    isAuction?: boolean;
    auction?: {
        endTime: number;
        currentBid: number;
        highestBidder: string;
    };
}

export function ProductCard({
    id,
    name,
    description,
    price,
    imageUrl,
    currency,
    seller,
    isAuction,
    auction,
}: ProductCardProps) {
    const router = useRouter();
    const { address } = useWallet();
    const { toast } = useToast();
    const addToCart = useMutation(api.cart.addToCart);

    const handleClick = () => {
        router.push(`/marketplace/${id}`);
    };

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
                productId: id,
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

    return (

        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="relative h-48 w-full">
                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-2 right-2">
                    <Badge variant={isAuction ? "destructive" : "secondary"}>
                        {isAuction ? (
                            <><Gavel className="mr-1 h-3 w-3" /> Auction</>
                        ) : (
                            <><ShoppingCart className="mr-1 h-3 w-3" /> Fixed Price</>
                        )}
                    </Badge>
                </div>
            </div>
            <CardHeader>
                <CardTitle className="line-clamp-1">{name}</CardTitle>
                <CardDescription className="line-clamp-2">{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {isAuction && auction ? (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Current Bid: {formatPrice(auction.currentBid)} {currency}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Ends: {formatDistance(auction.endTime, new Date(), { addSuffix: true })}
                        </p>
                    </div>
                ) : (
                    <p className="text-lg font-semibold">{formatPrice(price)} {currency}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                    Seller: {seller}
                </p>
            </CardContent>
            <CardFooter className="flex gap-2">
                {!isAuction && (
                    <Button
                        onClick={handleAddToCart}
                        variant="outline"
                        className="flex-1"
                        disabled={!address || seller === address}
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                    </Button>
                )}
                <Button
                    onClick={handleClick}
                    className="flex-1"
                    variant={isAuction ? "destructive" : "default"}
                >
                    {isAuction ? "View Auction" : "View Details"}
                </Button>
            </CardFooter>
        </Card>
    );
}