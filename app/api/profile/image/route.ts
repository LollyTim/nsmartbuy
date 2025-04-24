import { NextResponse } from "next/server"

const BLOCKFROST_IPFS_URL = "https://ipfs.blockfrost.io/api/v0"
const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY || ""

export async function POST(request: Request) {
  try {
    // Check if Blockfrost API key is configured
    if (!BLOCKFROST_API_KEY) {
      return NextResponse.json({ error: "Blockfrost API key is not configured" }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const walletAddress = formData.get("walletAddress") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    // Upload file to IPFS via Blockfrost
    const buffer = Buffer.from(await file.arrayBuffer())

    const uploadResponse = await fetch(`${BLOCKFROST_IPFS_URL}/ipfs/add`, {
      method: "POST",
      headers: {
        project_id: BLOCKFROST_API_KEY,
      },
      body: buffer,
    })

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text()
      console.error("Blockfrost IPFS upload failed:", errorData)
      throw new Error(`Blockfrost IPFS upload failed: ${uploadResponse.status}`)
    }

    const uploadData = await uploadResponse.json()
    const ipfsHash = uploadData.ipfs_hash

    console.log(`Profile image uploaded to IPFS with hash: ${ipfsHash}`)

    // Pin the file to ensure it's not garbage collected
    try {
      const pinResponse = await fetch(`${BLOCKFROST_IPFS_URL}/ipfs/pin/add/${ipfsHash}`, {
        method: "POST",
        headers: {
          project_id: BLOCKFROST_API_KEY,
        },
      })

      if (!pinResponse.ok) {
        console.warn(`Failed to pin file: ${pinResponse.status}. File may be garbage collected.`)
      } else {
        console.log(`File pinned successfully: ${ipfsHash}`)
      }
    } catch (pinError) {
      console.warn("Error pinning file:", pinError)
      // Continue even if pinning fails
    }

    // In a real implementation, you would update the user's profile in your database
    // For example:
    // await convex.mutation('profiles.updateProfileImage', {
    //   walletAddress,
    //   profileImage: `ipfs://${ipfsHash}`
    // })

    return NextResponse.json({
      url: `ipfs://${ipfsHash}`,
      hash: ipfsHash,
      gateway_url: `https://ipfs.io/ipfs/${ipfsHash}`,
    })
  } catch (error) {
    console.error("Error uploading profile image:", error)
    return NextResponse.json(
      {
        error: "Failed to upload profile image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

