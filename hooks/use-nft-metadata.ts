import { useState, useEffect } from "react";

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  mediaType?: string;
  policyId?: string;
  assetName?: string;
  fingerprint?: string;
  initialMintTxHash?: string;
  metadata?: Record<string, any>;
  ipfsHash?: string;
  fetchedAt?: string;
}

interface UseNFTMetadataResult {
  metadata: NFTMetadata | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useNFTMetadata(ipfsUrl: string | null): UseNFTMetadataResult {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetadata = async () => {
    if (!ipfsUrl) {
      setMetadata(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/nft/metadata?url=${encodeURIComponent(ipfsUrl)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch metadata");
      }

      const data = await response.json();
      setMetadata(data);
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
    fetchMetadata();
  }, [ipfsUrl]);

  return {
    metadata,
    isLoading,
    error,
    refetch: fetchMetadata,
  };
}
