import { Transaction, ForgeScript, type AssetMetadata, resolvePaymentKeyHash } from "@meshsdk/core"
import type { Wallet } from "@meshsdk/core"

// Generate a policy ID for NFT minting
export const generatePolicyId = async (wallet: Wallet): Promise<string> => {
  try {
    // Get wallet payment key hash
    const address = await wallet.getUsedAddresses()
    const keyHash = await resolvePaymentKeyHash(address[0])

    // Create a forge script with the key hash
    const forgingScript = ForgeScript.withOneSignature(keyHash)

    return forgingScript.policyId
  } catch (error) {
    console.error("Error generating policy ID:", error)
    throw error
  }
}

// Format metadata for Cardano NFT
export const formatNFTMetadata = (
  name: string,
  description: string,
  image: string,
  attributes: Record<string, any>,
): Record<string, any> => {
  // Format according to CIP-25 standard
  return {
    721: {
      // This will be replaced with the actual policy ID
      "<policy_id>": {
        // This will be replaced with the asset name
        "<asset_name>": {
          name,
          description,
          image,
          ...attributes,
        },
      },
    },
  }
}

// Mint an NFT with metadata
export const mintNFTWithMetadata = async (
  wallet: Wallet,
  metadata: AssetMetadata,
  address: string,
): Promise<string> => {
  try {
    // Generate a policy ID
    const policyId = await generatePolicyId(wallet)

    // Create a forge script
    const forgingScript = ForgeScript.withOneSignature(await resolvePaymentKeyHash(address))

    // Generate a unique asset name
    const assetName = `${metadata.name.replace(/\s+/g, "")}_${Date.now()}`
    const assetNameHex = Buffer.from(assetName).toString("hex")

    // Create a transaction
    const tx = new Transaction({ initiator: wallet })

    // Add the mint to the transaction using mintAsset method
    tx.mintAsset(forgingScript, assetName, {
      name: metadata.name,
      image: metadata.image,
      mediaType: metadata.mediaType || "image/png",
      description: metadata.description,
      ...metadata,
    })

    // Send the minted asset to the wallet address
    tx.sendAssets(address, [
      {
        unit: `${policyId}.${assetNameHex}`,
        quantity: "1",
      },
    ])

    // Sign and submit the transaction
    const signedTx = await tx.sign()
    const txHash = await tx.submit()

    // Return the asset ID
    return `${policyId}.${assetNameHex}`
  } catch (error) {
    console.error("Error minting NFT:", error)
    throw error
  }
}

// Verify NFT ownership
export const verifyNFTOwnership = async (wallet: Wallet, assetId: string): Promise<boolean> => {
  try {
    // Get wallet assets
    const balance = await wallet.getBalance()

    // Check if the asset exists in the wallet
    return balance.assets.some((asset) => asset.unit === assetId && Number.parseInt(asset.quantity) > 0)
  } catch (error) {
    console.error("Error verifying NFT ownership:", error)
    throw error
  }
}

// Get NFT transaction history
export const getNFTHistory = async (
  assetId: string,
): Promise<Array<{ txHash: string; action: string; address: string; timestamp: number }>> => {
  // In a real implementation, this would:
  // 1. Query the blockchain for all transactions involving this NFT
  // 2. Format the results

  // For this demo, we'll return mock data
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  return [
    {
      txHash: `tx${Math.random().toString(36).substring(2, 15)}`,
      action: "Minted",
      address: `addr1${Math.random().toString(36).substring(2, 15)}`,
      timestamp: now - 30 * day,
    },
    {
      txHash: `tx${Math.random().toString(36).substring(2, 15)}`,
      action: "Transferred",
      address: `addr1${Math.random().toString(36).substring(2, 15)}`,
      timestamp: now - 20 * day,
    },
    {
      txHash: `tx${Math.random().toString(36).substring(2, 15)}`,
      action: "Listed",
      address: `addr1${Math.random().toString(36).substring(2, 15)}`,
      timestamp: now - 10 * day,
    },
  ]
}

// Get NFT metadata
export const getNFTMetadata = async (assetId: string): Promise<AssetMetadata | null> => {
  try {
    // In a real implementation, you would fetch this from a Cardano blockchain explorer API
    // For demo purposes, we'll return mock data
    return {
      name: "Sample NFT",
      image: "https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
      mediaType: "image/png",
      description: "This is a sample NFT for demonstration purposes",
    }
  } catch (error) {
    console.error("Error getting NFT metadata:", error)
    return null
  }
}

