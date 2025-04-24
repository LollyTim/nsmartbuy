import { NextResponse } from "next/server";

// Use the correct IPFS endpoint for Blockfrost
const BLOCKFROST_IPFS_URL = "https://ipfs.blockfrost.io/api/v0/ipfs";
const BLOCKFROST_IPFS_API_KEY = process.env.BLOCKFROST_IPFS_API_KEY || "";

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const REQUEST_TIMEOUT = 30000; // 30 seconds
const PINNING_TIMEOUT = 45000; // 45 seconds

// Helper function to delay execution with exponential backoff
const delay = (ms: number, attempt: number) =>
  new Promise((resolve) => setTimeout(resolve, ms * Math.pow(1.5, attempt)));

// Helper function to create AbortController with timeout
const createTimeoutController = (timeout: number) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return { controller, timeoutId };
};

// Helper function to upload content to IPFS with retries
async function uploadToIPFS(
  content: Buffer | string | FormData,
  contentType: string,
  attempt = 0
): Promise<FormData> {
  if (!BLOCKFROST_IPFS_API_KEY) {
    throw new Error("IPFS API key not configured");
  }

  // Validate API key format
  if (!BLOCKFROST_IPFS_API_KEY.startsWith("ipfs")) {
    throw new Error(
      "Invalid IPFS API key format. Key should start with 'ipfs'"
    );
  }

  const formData = new FormData();
  if (content instanceof FormData) {
    return content;
  } else if (content instanceof Buffer) {
    formData.append("file", new Blob([content]), "file");
  } else {
    formData.append("file", new Blob([content]), "metadata.json");
  }

  return formData;
}

// Helper function to pin content with retries
async function pinContent(ipfsHash: string, attempt = 0): Promise<any> {
  if (!BLOCKFROST_IPFS_API_KEY) {
    throw new Error("IPFS API key not configured");
  }

  const { controller, timeoutId } = createTimeoutController(PINNING_TIMEOUT);

  try {
    const response = await fetch(`${BLOCKFROST_IPFS_URL}/pin/add/${ipfsHash}`, {
      method: "POST",
      headers: {
        project_id: BLOCKFROST_IPFS_API_KEY,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to pin content: ${error.message || "Unknown error"}`
      );
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Helper function to check pin status with retries
async function checkPinStatus(ipfsHash: string, attempt = 0): Promise<any> {
  if (!BLOCKFROST_IPFS_API_KEY) {
    throw new Error("IPFS API key not configured");
  }

  const { controller, timeoutId } = createTimeoutController(REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${BLOCKFROST_IPFS_URL}/pin/list`, {
      headers: {
        project_id: BLOCKFROST_IPFS_API_KEY,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to check pin status: ${error.message || "Unknown error"}`
      );
    }

    const pins = await response.json();
    return pins.find((pin: any) => pin.ipfs_hash === ipfsHash);
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function POST(request: Request) {
  let lastError: Error | null = null;

  try {
    if (!BLOCKFROST_IPFS_API_KEY) {
      return NextResponse.json(
        {
          error: "IPFS API key not configured",
          details:
            "Please configure BLOCKFROST_IPFS_API_KEY in your environment variables",
        },
        { status: 500 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const isFormData = contentType.includes("multipart/form-data");

    let content: Buffer | string | FormData;
    if (isJson) {
      content = await request.text();
    } else if (isFormData) {
      content = await request.formData();
    } else {
      const arrayBuffer = await request.arrayBuffer();
      content = Buffer.from(arrayBuffer);
    }

    // Upload to IPFS with retries
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const formData = await uploadToIPFS(content, contentType, attempt);
        const { controller, timeoutId } =
          createTimeoutController(REQUEST_TIMEOUT);

        const uploadResponse = await fetch(`${BLOCKFROST_IPFS_URL}/add`, {
          method: "POST",
          headers: {
            project_id: BLOCKFROST_IPFS_API_KEY,
          },
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(
            `Failed to upload to IPFS: ${error.message || "Unknown error"}`
          );
        }

        const uploadData = await uploadResponse.json();
        const ipfsHash = uploadData.ipfs_hash;

        // Pin the content with retries
        for (let pinAttempt = 0; pinAttempt <= MAX_RETRIES; pinAttempt++) {
          try {
            await pinContent(ipfsHash, pinAttempt);
            console.log(`Successfully pinned content with hash: ${ipfsHash}`);

            // Wait a bit and check pin status
            await delay(2000, pinAttempt);
            const pinStatus = await checkPinStatus(ipfsHash, pinAttempt);

            return NextResponse.json({
              hash: ipfsHash,
              url: `https://ipfs.io/ipfs/${ipfsHash}`,
              gatewayUrl: `https://ipfs.blockfrost.io/ipfs/${ipfsHash}`,
              pinStatus: pinStatus || { state: "queued" },
            });
          } catch (pinError) {
            lastError = pinError as Error;
            console.warn(`Pin attempt ${pinAttempt + 1} failed:`, pinError);

            if (pinAttempt < MAX_RETRIES) {
              await delay(RETRY_DELAY, pinAttempt);
              continue;
            }

            // If all pin attempts failed, return success with failed pin status
            return NextResponse.json({
              hash: ipfsHash,
              url: `https://ipfs.io/ipfs/${ipfsHash}`,
              gatewayUrl: `https://ipfs.blockfrost.io/ipfs/${ipfsHash}`,
              pinStatus: { state: "failed", error: lastError.message },
            });
          }
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`Upload attempt ${attempt + 1} failed:`, error);

        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY, attempt);
          continue;
        }
      }
    }

    // All attempts failed
    return NextResponse.json(
      {
        error: "IPFS service currently unavailable",
        details: lastError?.message || "All upload attempts failed",
        retryable: true,
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("IPFS upload error:", error);
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
  return NextResponse.json({ message: "IPFS API is running" }, { status: 200 });
}
