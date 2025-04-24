"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWallet } from "@/context/wallet-context";

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  mediaType?: string;
  metadata?: {
    format?: string;
    isDirectAsset?: boolean;
    isRawContent?: boolean;
  };
  ipfsHash: string;
  fetchedAt: string;
  source: string;
}

interface UseNFTMetadataResult {
  metadata: NFTMetadata | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useNFTMetadata(ipfsUrl: string): UseNFTMetadataResult {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const createProduct = useMutation(api.products.createProduct);
  const { address } = useWallet();

  const fetchMetadata = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Extract IPFS hash from URL
      let ipfsHash = ipfsUrl;
      if (ipfsUrl.startsWith("ipfs://")) {
        ipfsHash = ipfsUrl.replace("ipfs://", "");
      } else if (ipfsUrl.includes("/ipfs/")) {
        ipfsHash = ipfsUrl.split("/ipfs/")[1];
      }

      // Try multiple IPFS gateways
      const gateways = [
        `https://ipfs.io/ipfs/${ipfsHash}`,
        `https://ipfs.blockfrost.io/ipfs/${ipfsHash}`,
        `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
        `https://dweb.link/ipfs/${ipfsHash}`,
        `https://ipfs.filebase.io/ipfs/${ipfsHash}`,
      ];

      // Try each gateway until one succeeds
      for (const gateway of gateways) {
        try {
          const response = await fetch(gateway);
          if (!response.ok) continue;

          const data = await response.json();

          // Validate required fields
          if (!data.name || !data.description || !data.image) {
            throw new Error("Invalid metadata format");
          }

          // Enrich metadata with additional information
          const enrichedMetadata = {
            ...data,
            ipfsHash,
            fetchedAt: new Date().toISOString(),
            source: `gateway:${gateway}`,
          };

          setMetadata(enrichedMetadata);

          // Store in Convex if we have a wallet address
          if (address) {
            try {
              await createProduct({
                name: data.name,
                description: data.description,
                price: data.price || 0, // Default to 0 if not specified
                image: data.image,
                mediaType: data.mediaType || "image/png",
                ipfsHash,
                sellerAddress: address,
                metadata: data.metadata || {},
              });
            } catch (convexError) {
              console.error("Failed to store product in Convex:", convexError);
            }
          }

          return;
        } catch (e) {
          console.warn(`Failed to fetch from ${gateway}:`, e);
          continue;
        }
      }

      throw new Error("Failed to fetch metadata from all gateways");
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch metadata")
      );
      setMetadata(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ipfsUrl) {
      fetchMetadata();
    }
  }, [ipfsUrl]);

  return {
    metadata,
    isLoading,
    error,
    refetch: fetchMetadata,
  };
}
