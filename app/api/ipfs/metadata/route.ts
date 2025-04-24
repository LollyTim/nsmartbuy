import { NextResponse } from "next/server";

const BLOCKFROST_IPFS_URL = "https://ipfs.blockfrost.io/api/v0";
const BLOCKFROST_IPFS_API_KEY = process.env.BLOCKFROST_IPFS_API_KEY || "";

// Shorter timeout and fewer retries for faster failure detection
const MAX_RETRIES = 2;
const RETRY_DELAY = 1500; // 1.5 seconds
const REQUEST_TIMEOUT = 10000; // 10 seconds (much shorter)

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simplified upload function with short timeout
async function uploadMetadata(metadata: any): Promise<Response> {
  const metadataString = JSON.stringify(metadata);
  const buffer = Buffer.from(metadataString);

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${BLOCKFROST_IPFS_URL}/ipfs/add`, {
      method: "POST",
      headers: {
        project_id: BLOCKFROST_IPFS_API_KEY,
        "Content-Type": "application/json",
      },
      body: buffer,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // Check if Blockfrost IPFS API key is configured
    if (!BLOCKFROST_IPFS_API_KEY) {
      return NextResponse.json(
        {
          error: "Blockfrost IPFS API key is not configured",
          details:
            "Please add BLOCKFROST_IPFS_API_KEY to your environment variables",
        },
        { status: 500 }
      );
    }

    // Validate API key format
    if (!BLOCKFROST_IPFS_API_KEY.startsWith("ipfs")) {
      return NextResponse.json(
        {
          error: "Invalid IPFS API key format",
          details:
            "IPFS API key must start with 'ipfs'. Please generate a new key from the Blockfrost IPFS dashboard.",
        },
        { status: 500 }
      );
    }

    const metadata = await request.json();

    if (!metadata) {
      return NextResponse.json(
        { error: "No metadata provided" },
        { status: 400 }
      );
    }

    // Attempt uploads with a simple retry approach
    let lastError: any = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      console.log(
        `IPFS metadata upload attempt ${attempt + 1}/${MAX_RETRIES + 1}`
      );

      try {
        const response = await uploadMetadata(metadata);

        if (response.ok) {
          // Success! Process the response
          const data = await response.json();
          const ipfsHash = data.ipfs_hash;

          console.log(`Metadata uploaded to IPFS with hash: ${ipfsHash}`);

          // Attempt to pin but don't wait for it
          try {
            fetch(`${BLOCKFROST_IPFS_URL}/ipfs/pin/add/${ipfsHash}`, {
              method: "POST",
              headers: {
                project_id: BLOCKFROST_IPFS_API_KEY,
              },
            })
              .then((pinResp) => {
                if (pinResp.ok) {
                  console.log(`Successfully pinned hash: ${ipfsHash}`);
                } else {
                  console.warn(
                    `Failed to pin, but upload succeeded for hash: ${ipfsHash}`
                  );
                }
              })
              .catch((e) => {
                console.warn(`Pin request failed for hash: ${ipfsHash}`, e);
              });
          } catch (e) {
            // Ignore pinning errors
          }

          // Return successful response
          return NextResponse.json({
            ipfsHash,
            url: `ipfs://${ipfsHash}`,
            gateway_url: `https://ipfs.io/ipfs/${ipfsHash}`,
          });
        }

        // Handle error responses
        const errorText = await response.text();
        console.warn(
          `IPFS upload failed (attempt ${attempt + 1}): ${
            response.status
          } - ${errorText}`
        );

        // If it's not a server error, don't retry
        if (response.status < 500) {
          return NextResponse.json(
            {
              error: "IPFS upload failed",
              details: errorText,
              status: response.status,
            },
            { status: response.status }
          );
        }

        lastError = new Error(`HTTP error ${response.status}: ${errorText}`);
      } catch (error) {
        console.warn(`IPFS upload attempt ${attempt + 1} failed:`, error);
        lastError = error;
      }

      // If we're not on the last attempt, wait before retrying
      if (attempt < MAX_RETRIES) {
        const waitTime = RETRY_DELAY * Math.pow(1.5, attempt);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
      }
    }

    // All attempts failed
    console.error("All IPFS upload attempts failed");

    // Fallback to local caching or alternative solution
    // This is where you would implement a backup approach

    return NextResponse.json(
      {
        error: "IPFS service currently unavailable",
        details:
          "All upload attempts failed. The service may be experiencing high load.",
        retryable: true,
        technical_details:
          lastError instanceof Error ? lastError.message : "Unknown error",
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("Error in IPFS metadata upload:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "IPFS metadata API is running" },
    { status: 200 }
  );
}
