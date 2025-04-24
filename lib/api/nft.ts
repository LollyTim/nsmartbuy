import { BlockfrostProvider } from "@meshsdk/core";

const BLOCKFROST_API_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;
const BLOCKFROST_URL =
  process.env.NEXT_PUBLIC_BLOCKFROST_URL ||
  "https://cardano-preview.blockfrost.io/api/v0";
const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

if (!BLOCKFROST_API_KEY) {
  throw new Error("Blockfrost API key is not configured");
}

const blockfrostProvider = new BlockfrostProvider(BLOCKFROST_API_KEY);

const headers = {
  project_id: BLOCKFROST_API_KEY,
  "Content-Type": "application/json",
} as const;

// Helper function to convert IPFS URL to HTTP URL
function convertIPFStoHTTP(ipfsUrl: string): string {
  if (!ipfsUrl) return "/placeholder.png";
  if (ipfsUrl.startsWith("ipfs://")) {
    return `${IPFS_GATEWAY}${ipfsUrl.replace("ipfs://", "")}`;
  }
  if (ipfsUrl.startsWith("Qm") || ipfsUrl.startsWith("bafy")) {
    return `${IPFS_GATEWAY}${ipfsUrl}`;
  }
  return ipfsUrl;
}

// Helper function to format policy ID
function formatPolicyId(policyId: string): string {
  if (!policyId) {
    throw new Error("Policy ID is not configured");
  }
  // Remove any whitespace and convert to lowercase
  return policyId.trim().toLowerCase();
}

export async function getNFTsByPolicy() {
  try {
    const policyId = process.env.NEXT_PUBLIC_POLICY_ID;
    if (!policyId) {
      throw new Error("Policy ID not configured");
    }

    const formattedPolicyId = formatPolicyId(policyId);
    const response = await fetch(
      `${BLOCKFROST_URL}/assets/policy/${formattedPolicyId}`,
      {
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Blockfrost API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        policyId: formattedPolicyId,
      });
      throw new Error(
        `Failed to fetch NFTs: ${response.status} ${response.statusText} - ${
          errorData.message || "Unknown error"
        }`
      );
    }

    const assets = await response.json();
    if (!Array.isArray(assets)) {
      console.error("Unexpected response format:", assets);
      return [];
    }

    // Fetch metadata for each asset
    const nftsWithMetadata = await Promise.all(
      assets.map(async (asset) => {
        try {
          const metadata = asset.onchain_metadata || asset.metadata || {};

          // Convert IPFS URLs to HTTP URLs
          if (metadata.image) {
            metadata.image = convertIPFStoHTTP(metadata.image);
          }

          return {
            ...asset,
            metadata,
          };
        } catch (error) {
          console.error(
            `Error fetching metadata for asset ${asset.asset}:`,
            error
          );
          return {
            ...asset,
            metadata: {
              name: "Unknown NFT",
              description: "No description available",
              image: "/placeholder.png",
              mediaType: "image/png",
            },
          };
        }
      })
    );

    return nftsWithMetadata;
  } catch (error) {
    console.error("Error in getNFTsByPolicy:", error);
    throw error;
  }
}

export async function getNFTById(assetId: string) {
  try {
    const response = await fetch(`${BLOCKFROST_URL}/assets/${assetId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch NFT: ${response.statusText}`);
    }

    const asset = await response.json();
    return {
      ...asset,
      metadata: asset.onchain_metadata || asset.metadata || {},
    };
  } catch (error) {
    console.error("Error in getNFTById:", error);
    throw error;
  }
}

// Function to get NFT metadata directly from IPFS
export async function getNFTMetadataFromIPFS(ipfsUrl: string) {
  try {
    const httpUrl = convertIPFStoHTTP(ipfsUrl);
    const response = await fetch(httpUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch IPFS metadata: ${response.statusText}`);
    }

    const metadata = await response.json();

    // Convert any IPFS URLs in the metadata to HTTP URLs
    if (metadata.image) {
      metadata.image = convertIPFStoHTTP(metadata.image);
    }
    if (metadata.media) {
      metadata.media = convertIPFStoHTTP(metadata.media);
    }

    return metadata;
  } catch (error) {
    console.error("Error fetching IPFS metadata:", error);
    throw error;
  }
}

export async function getNFTTransactions(assetId: string) {
  try {
    const response = await fetch(
      `${BLOCKFROST_URL}/assets/${assetId}/transactions`,
      {
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch NFT transactions: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getNFTTransactions:", error);
    throw error;
  }
}
