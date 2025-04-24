// Blockfrost IPFS configuration
const BLOCKFROST_PROJECT_ID = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || ""
const BLOCKFROST_URL = process.env.NEXT_PUBLIC_BLOCKFROST_URL || "https://ipfs.blockfrost.io/api/v0"

// Function to upload file to IPFS using Blockfrost
export const uploadFileToIPFS = async (file: File): Promise<string> => {
  if (!BLOCKFROST_PROJECT_ID) {
    throw new Error("Blockfrost API key not found. Please set NEXT_PUBLIC_BLOCKFROST_API_KEY environment variable.")
  }

  try {
    console.log(`Uploading file: ${file.name} (${file.size} bytes)`)

    // Convert file to FormData
    const formData = new FormData()
    formData.append("file", file)

    // Upload to Blockfrost IPFS
    const response = await fetch(`${BLOCKFROST_URL}/ipfs/add`, {
      method: "POST",
      headers: {
        project_id: BLOCKFROST_PROJECT_ID,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Blockfrost API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const ipfsHash = data.ipfs_hash

    // Pin the file to prevent garbage collection
    await pinFileToIPFS(ipfsHash)

    // Return the IPFS URL
    return `ipfs://${ipfsHash}`
  } catch (error) {
    console.error("Error uploading file to IPFS:", error)

    let errorMessage = "Failed to upload file to IPFS"
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`
    }

    throw new Error(errorMessage)
  }
}

// Function to pin a file on IPFS to prevent garbage collection
export const pinFileToIPFS = async (ipfsHash: string): Promise<void> => {
  if (!BLOCKFROST_PROJECT_ID) {
    throw new Error("Blockfrost API key not found. Please set NEXT_PUBLIC_BLOCKFROST_API_KEY environment variable.")
  }

  try {
    const response = await fetch(`${BLOCKFROST_URL}/ipfs/pin/add/${ipfsHash}`, {
      method: "POST",
      headers: {
        project_id: BLOCKFROST_PROJECT_ID,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Blockfrost API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    console.log(`File pinned to IPFS: ${ipfsHash}`)
  } catch (error) {
    console.error("Error pinning file to IPFS:", error)
    throw error
  }
}

// Upload JSON metadata to IPFS
export const uploadJSONToIPFS = async (jsonData: any): Promise<string> => {
  if (!BLOCKFROST_PROJECT_ID) {
    throw new Error("Blockfrost API key not found. Please set NEXT_PUBLIC_BLOCKFROST_API_KEY environment variable.")
  }

  try {
    // Convert JSON to Blob
    const blob = new Blob([JSON.stringify(jsonData)], { type: "application/json" })
    const file = new File([blob], "metadata.json", { type: "application/json" })

    // Upload using the file upload function
    return await uploadFileToIPFS(file)
  } catch (error) {
    console.error("Error uploading JSON to IPFS:", error)
    throw new Error(`Failed to upload JSON to IPFS: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Get data from IPFS
export const getFromIPFS = async (cid: string): Promise<any> => {
  // Initialize client if not already initialized
  // if (!ipfsClient) {
  //   ipfsClient = initIPFSClient()
  // }

  // if (!ipfsClient) {
  //   throw new Error("IPFS client not initialized. Check your Infura credentials.")
  // }

  try {
    // const stream = ipfsClient.cat(cid)
    // let data = ""

    // for await (const chunk of stream) {
    //   data += new TextDecoder().decode(chunk)
    // }

    // return JSON.parse(data)
    return {}
  } catch (error) {
    console.error("Error getting data from IPFS:", error)
    throw new Error(`Failed to get data from IPFS: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Create product metadata and upload to IPFS
export const createProductMetadata = async (
  productData: any,
  imageFile: File,
): Promise<{ metadataUrl: string; imageUrl: string }> => {
  try {
    // Upload image first
    const imageUrl = await uploadFileToIPFS(imageFile)

    // Create metadata with image URL
    const metadata = {
      name: productData.name,
      description: productData.description,
      image: imageUrl,
      attributes: [
        { trait_type: "Category", value: productData.category },
        { trait_type: "Price", value: productData.price },
        { trait_type: "Seller", value: productData.seller },
        { trait_type: "Created", value: new Date().toISOString() },
      ],
      // Additional product details
      details: {
        ...productData,
      },
    }

    // Upload metadata to IPFS
    const metadataUrl = await uploadJSONToIPFS(metadata)

    return { metadataUrl, imageUrl }
  } catch (error) {
    console.error("Error creating product metadata:", error)
    throw new Error(`Failed to create product metadata: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

