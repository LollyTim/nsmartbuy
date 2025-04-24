import { NextResponse } from "next/server";

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
}

// Blockfrost configuration
const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY;
const BLOCKFROST_IPFS_URL = "https://ipfs.blockfrost.io/api/v0";

// Fallback IPFS gateways for redundancy
const FALLBACK_GATEWAYS = [
  {
    url: "https://ipfs.io/ipfs",
    timeout: 8000,
  },
  {
    url: "https://dweb.link/ipfs",
    timeout: 8000,
  },
  {
    url: "https://gateway.pinata.cloud/ipfs",
    timeout: 8000,
  },
];

// Helper function to create a timeout promise
const timeout = (ms: number) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
  );

// Helper function to fetch from Blockfrost IPFS
async function fetchFromBlockfrost(ipfsHash: string) {
  if (!BLOCKFROST_API_KEY) {
    throw new Error("Blockfrost API key not configured");
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `${BLOCKFROST_IPFS_URL}/ipfs/gateway/${ipfsHash}`,
      {
        headers: {
          project_id: BLOCKFROST_API_KEY,
          Accept: "*/*",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    // Handle Blockfrost specific error codes
    if (response.status === 402) {
      throw new Error(
        "IPFS quota exceeded. Please upgrade your plan or remove some pins."
      );
    }
    if (response.status === 403) {
      throw new Error("Invalid or missing Blockfrost API key");
    }
    if (response.status === 425) {
      throw new Error(
        "IPFS pin queue is full. Please wait before trying again."
      );
    }
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please wait before trying again.");
    }
    if (!response.ok) {
      throw new Error(`Blockfrost API error: ${response.status}`);
    }

    // Get content type and log it
    const contentType = response.headers.get("content-type") || "";
    console.log("Blockfrost content type:", contentType);

    // Determine how to process the response based on content type
    if (contentType.includes("application/json")) {
      const jsonData = await response.json();
      console.log("Blockfrost JSON data:", jsonData);
      return jsonData;
    } else if (contentType.includes("image/")) {
      // If this is an image, create metadata for it
      console.log("Blockfrost detected image with content type:", contentType);
      return createMetadataForImage(ipfsHash, contentType);
    } else {
      // For other content types, try to get the data as text first and log it
      const textData = await response.text();
      console.log(
        `Blockfrost content (${contentType}):`,
        textData.substring(0, 200)
      );

      // Try to parse as JSON if it looks like JSON
      if (textData.trim().startsWith("{") && textData.trim().endsWith("}")) {
        try {
          const jsonData = JSON.parse(textData);
          console.log("Successfully parsed text as JSON:", jsonData);
          return jsonData;
        } catch (e) {
          console.log("Failed to parse text as JSON:", e);
        }
      }

      throw new Error(`Unsupported content type: ${contentType}`);
    }
  } catch (error) {
    console.warn("Blockfrost fetch failed:", error);
    throw error;
  }
}

// Helper function to fetch from fallback gateway
async function fetchFromFallbackGateway(
  gateway: (typeof FALLBACK_GATEWAYS)[0],
  ipfsHash: string
) {
  try {
    console.log(`Trying gateway: ${gateway.url}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), gateway.timeout);

    // First make a HEAD request to check content type
    const headResponse = await fetch(`${gateway.url}/${ipfsHash}`, {
      method: "HEAD",
      signal: controller.signal,
    }).catch((err) => {
      console.log(`HEAD request to ${gateway.url} failed:`, err);
      return null;
    });

    let contentType = headResponse?.headers.get("content-type") || "";
    console.log(`Gateway ${gateway.url} content type (HEAD):`, contentType);

    // Now make the actual GET request
    const response = await fetch(`${gateway.url}/${ipfsHash}`, {
      headers: {
        Accept: "*/*",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get content type from the actual response
    contentType = response.headers.get("content-type") || contentType;
    console.log(`Gateway ${gateway.url} content type (GET):`, contentType);

    // Process based on content type
    if (contentType.includes("application/json")) {
      const jsonData = await response.json();
      console.log(`Gateway ${gateway.url} JSON data:`, jsonData);
      return jsonData;
    } else if (contentType.includes("image/")) {
      console.log(
        `Gateway ${gateway.url} detected image with content type:`,
        contentType
      );
      return createMetadataForImage(ipfsHash, contentType);
    } else {
      // For other content types, try to get as text first and log it
      const textData = await response.text();
      console.log(
        `Gateway ${gateway.url} content (${contentType}):`,
        textData.substring(0, 200)
      );

      // Try to parse as JSON if it looks like JSON
      if (textData.trim().startsWith("{") && textData.trim().endsWith("}")) {
        try {
          const jsonData = JSON.parse(textData);
          console.log(
            `Gateway ${gateway.url} successfully parsed text as JSON:`,
            jsonData
          );
          return jsonData;
        } catch (e) {
          console.log(
            `Gateway ${gateway.url} failed to parse text as JSON:`,
            e
          );
        }
      }

      // If all else fails, create metadata for the raw content
      return createMetadataForRawContent(
        ipfsHash,
        contentType,
        textData.substring(0, 100)
      );
    }
  } catch (error) {
    console.warn(`Failed to fetch from ${gateway.url}:`, error);
    throw error;
  }
}

// Helper function to create metadata for an image
function createMetadataForImage(
  ipfsHash: string,
  contentType: string
): NFTMetadata {
  // Extract image format from content type
  const format = contentType.split("/")[1] || "unknown";

  return {
    name: `IPFS Image Asset`,
    description: `Image asset stored on IPFS with hash ${ipfsHash}`,
    image: `ipfs://${ipfsHash}`,
    mediaType: contentType,
    metadata: {
      format,
      isDirectAsset: true,
    },
  };
}

// Helper function to create metadata for raw content
function createMetadataForRawContent(
  ipfsHash: string,
  contentType: string,
  preview: string
): NFTMetadata {
  return {
    name: `IPFS Content (${contentType.split("/")[1] || contentType})`,
    description: `Raw content stored on IPFS with hash ${ipfsHash}. Preview: ${preview}`,
    image: `/placeholder-document.png`, // You'll need to create this placeholder image
    mediaType: contentType,
    metadata: {
      contentType,
      ipfsHash,
      isRawContent: true,
      preview,
    },
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ipfsUrl = searchParams.get("url");

    if (!ipfsUrl) {
      return NextResponse.json(
        { error: "IPFS URL is required" },
        { status: 400 }
      );
    }

    // Extract IPFS hash from URL
    const ipfsHash = ipfsUrl.split("/ipfs/")[1];
    if (!ipfsHash) {
      return NextResponse.json({ error: "Invalid IPFS URL" }, { status: 400 });
    }

    console.log("Processing IPFS hash:", ipfsHash);

    let metadata: NFTMetadata | null = null;
    let error: Error | null = null;
    let source = "unknown";

    // First try Blockfrost if API key is available
    if (BLOCKFROST_API_KEY) {
      try {
        metadata = await fetchFromBlockfrost(ipfsHash);
        source = "blockfrost";
        console.log("Successfully fetched metadata from Blockfrost");
      } catch (blockfrostError) {
        error = blockfrostError as Error;
        console.warn(
          "Blockfrost fetch failed, trying fallback gateways:",
          blockfrostError
        );
      }
    } else {
      console.log("Skipping Blockfrost, no API key configured");
    }

    // Try fallback gateways if Blockfrost fails or no API key
    if (!metadata) {
      console.log("Trying fallback gateways");
      try {
        // Create an array to track individual gateway errors
        const gatewayErrors: Record<string, string> = {};

        // Try each gateway sequentially instead of racing them
        for (const gateway of FALLBACK_GATEWAYS) {
          try {
            metadata = await Promise.race([
              fetchFromFallbackGateway(gateway, ipfsHash),
              timeout(gateway.timeout),
            ]);

            if (metadata) {
              source = `fallback:${gateway.url}`;
              console.log(`Successfully fetched metadata from ${gateway.url}`);
              break; // Exit the loop if we get valid metadata
            }
          } catch (gatewayError) {
            gatewayErrors[gateway.url] =
              gatewayError instanceof Error
                ? gatewayError.message
                : "Unknown error";
            console.warn(`Failed with gateway ${gateway.url}:`, gatewayError);
            // Continue to the next gateway
          }
        }

        // If all gateways failed, throw a detailed error
        if (!metadata) {
          const errorDetails = Object.entries(gatewayErrors)
            .map(([url, msg]) => `${url}: ${msg}`)
            .join("; ");

          throw new Error(`All fallback gateways failed. ${errorDetails}`);
        }
      } catch (fallbackError) {
        error = fallbackError as Error;
        console.error("All fallback gateways failed:", fallbackError);
      }
    }

    if (!metadata) {
      throw error || new Error("Failed to fetch metadata from all sources");
    }

    // Log what we found
    console.log("Final metadata:", metadata);

    // For some files, we might not have all the required fields
    // Let's make sure we have at least name and description
    if (!metadata.name) {
      metadata.name = `IPFS Asset ${ipfsHash.substring(0, 8)}`;
    }

    if (!metadata.description) {
      metadata.description = `Content from IPFS with hash ${ipfsHash}`;
    }

    if (!metadata.image) {
      metadata.image = `/placeholder-asset.png`; // You'll need to create this placeholder
    }

    // Add additional metadata
    const enrichedMetadata = {
      ...metadata,
      ipfsHash,
      fetchedAt: new Date().toISOString(),
      source,
    };

    return NextResponse.json(enrichedMetadata);
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json(
          {
            error: "Request timeout",
            details: "All IPFS gateways timed out",
          },
          { status: 504 }
        );
      }

      if (error.name === "AggregateError") {
        return NextResponse.json(
          {
            error: "All gateways failed",
            details: "Unable to fetch metadata from any IPFS gateway",
          },
          { status: 503 }
        );
      }

      // Handle Blockfrost specific errors
      if (error.message.includes("Blockfrost")) {
        return NextResponse.json(
          {
            error: "Blockfrost API error",
            details: error.message,
          },
          { status: 500 }
        );
      }

      // Handle content type errors
      if (error.message.includes("Unsupported content type")) {
        return NextResponse.json(
          {
            error: "Unsupported content type",
            details: error.message,
          },
          { status: 415 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to fetch NFT metadata",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
