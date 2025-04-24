import { NextResponse } from "next/server";

const BLOCKFROST_API_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;
const BLOCKFROST_URL =
  process.env.NEXT_PUBLIC_BLOCKFROST_URL ||
  "https://cardano-preview.blockfrost.io/api/v0";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  console.log("Blockfrost API Request:", {
    path,
    hasApiKey: !!BLOCKFROST_API_KEY,
    url: `${BLOCKFROST_URL}${path}`,
  });

  if (!path) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 });
  }

  if (!BLOCKFROST_API_KEY) {
    return NextResponse.json(
      { error: "Blockfrost API key is not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${BLOCKFROST_URL}${path}`, {
      headers: {
        project_id: BLOCKFROST_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Blockfrost API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: `${BLOCKFROST_URL}${path}`,
        headers: response.headers,
      });
      return NextResponse.json(
        {
          error: `Blockfrost API error: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Blockfrost API Response:", data);

    // Ensure the response has the expected structure
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Invalid response format from Blockfrost" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Blockfrost proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Blockfrost" },
      { status: 500 }
    );
  }
}
