"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, ExternalLink, FileText, Image as ImageIcon } from "lucide-react"
import { useNFTMetadata } from "@/app/hooks/use-nft-metadata"
import { useState, useEffect } from "react";
import { PlaceholderAsset } from "./placeholder-asset";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWallet } from "@/context/wallet-context";

interface ProductCardProps {
    id: number;
    isNew?: boolean;
    ipfsUrl: string;
}

// Helper function to convert IPFS URL to HTTP URL
function convertIPFSUrl(ipfsUrl: string): string {
    if (!ipfsUrl) return '';

    // Handle ipfs:// URLs
    if (ipfsUrl.startsWith('ipfs://')) {
        const hash = ipfsUrl.replace('ipfs://', '');
        return `https://ipfs.io/ipfs/${hash}`;
    }

    // Handle https://ipfs.io/ipfs/ URLs
    if (ipfsUrl.startsWith('https://ipfs.io/ipfs/')) {
        return ipfsUrl;
    }

    // Handle raw IPFS hashes
    if (!ipfsUrl.includes('://')) {
        return `https://ipfs.io/ipfs/${ipfsUrl}`;
    }

    return ipfsUrl;
}

export function ProductCard({ id, isNew, ipfsUrl }: ProductCardProps) {
    const { metadata, isLoading, error } = useNFTMetadata(ipfsUrl)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [assetType, setAssetType] = useState<'image' | 'document' | 'unknown'>('unknown')
    const { address } = useWallet()

    // Get product data from Convex
    const product = useQuery(api.products.getProductByHash, {
        ipfsHash: ipfsUrl.replace('ipfs://', '')
    });

    // Generate a token ID for the NFT
    const tokenId = `token_${id.toString().padStart(6, "0")}`

    useEffect(() => {
        if (metadata?.image) {
            // Get asset type from metadata
            if (metadata.mediaType?.includes('image/')) {
                setAssetType('image');
            } else if (metadata.metadata?.isRawContent) {
                setAssetType('document');
            }

            // Convert IPFS URL to HTTP URL
            const httpUrl = convertIPFSUrl(metadata.image);
            setImageUrl(httpUrl);
        } else {
            setImageUrl(null);
        }
    }, [metadata]);

    const handlePurchase = async () => {
        if (!product || !address) return;

        // Here you would implement the purchase logic
        // This would typically involve:
        // 1. Creating a transaction
        // 2. Sending ADA to the seller's address (product.sellerAddress)
        // 3. Updating the product status in Convex
        console.log('Purchasing from seller:', product.sellerAddress);
    };

    return (
        <Card className="group relative overflow-hidden">
            {isNew && (
                <Badge className="absolute top-2 right-2 z-10">New</Badge>
            )}

            {metadata?.metadata?.isDirectAsset && (
                <Badge variant="outline" className="absolute top-2 left-2 z-10 bg-black/50 text-white">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Image
                </Badge>
            )}

            {metadata?.metadata?.isRawContent && (
                <Badge variant="outline" className="absolute top-2 left-2 z-10 bg-black/50 text-white">
                    <FileText className="h-3 w-3 mr-1" />
                    Document
                </Badge>
            )}

            <CardHeader className="p-0">
                <div className="aspect-square relative overflow-hidden">
                    {isLoading ? (
                        <div className="w-full h-full bg-muted animate-pulse" />
                    ) : error ? (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">Failed to load asset</span>
                        </div>
                    ) : !imageUrl ? (
                        <PlaceholderAsset type={assetType} />
                    ) : (
                        <img
                            src={imageUrl}
                            alt={metadata?.name || "NFT"}
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            onError={() => setImageUrl(null)}
                        />
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="space-y-2">
                    <h3 className="font-semibold">
                        {isLoading ? (
                            <div className="h-4 bg-muted animate-pulse rounded" />
                        ) : error ? (
                            "Failed to load name"
                        ) : (
                            metadata?.name || "Unnamed Asset"
                        )}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {isLoading ? (
                            <span className="h-3 bg-muted animate-pulse rounded" />
                        ) : error ? (
                            "Failed to load description"
                        ) : (
                            metadata?.description || "No description available"
                        )}
                    </p>
                    {product?.price && (
                        <p className="text-sm font-medium">
                            {product.price} ₳
                        </p>
                    )}
                    {metadata?.mediaType && (
                        <p className="text-xs text-muted-foreground">
                            {metadata.mediaType.split('/')[1]?.toUpperCase() || 'Unknown format'}
                        </p>
                    )}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                        <ShoppingCart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                        <a
                            href={`https://cardanoscan.io/token/${tokenId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                </div>
                {product && address && product.sellerAddress !== address && (
                    <Button onClick={handlePurchase}>Buy Now</Button>
                )}
            </CardFooter>
        </Card>
    )
}