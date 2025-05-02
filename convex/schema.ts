import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Existing tables...

  // Profiles table to store user profiles
  profiles: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    businessName: v.optional(v.string()),
    businessDescription: v.optional(v.string()),
    website: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    walletAddress: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }),

  // Transactions table to store all ADA transactions
  transactions: defineTable({
    type: v.string(), // "buy_ada", "sell_ada", "send", "receive", "nft_mint"
    amount: v.number(),
    ngnAmount: v.optional(v.number()),
    recipient: v.optional(v.string()),
    sender: v.optional(v.string()),
    txHash: v.optional(v.string()),
    reference: v.optional(v.string()),
    status: v.string(), // "pending", "processing", "completed", "failed"
    walletAddress: v.string(),
    timestamp: v.string(),
    error: v.optional(v.string()),
    completedAt: v.optional(v.string()),
    failedAt: v.optional(v.string()),
  }),

  // Products table to store all marketplace products
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.string(),
    image: v.string(),
    ipfsHash: v.string(),
    sellerAddress: v.string(),
    status: v.string(),
    mediaType: v.string(),
    metadata: v.object({
      format: v.string(),
      isDirectAsset: v.boolean(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_seller", ["sellerAddress"])
    .index("by_ipfsHash", ["ipfsHash"]),

  // Auctions table to store all auction data
  auctions: defineTable({
    productId: v.id("products"),
    startingPrice: v.number(),
    sellerAddress: v.string(),
    status: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    currentBid: v.number(),
    highestBidder: v.optional(v.string()),
    startTime: v.string(),
    endTime: v.string(),
  })
    .index("by_product", ["productId"])
    .index("by_seller", ["sellerAddress"])
    .index("by_status", ["status"]),

  // Bids table to store all auction bids
  bids: defineTable({
    auctionId: v.id("auctions"),
    bidAmount: v.number(),
    bidderAddress: v.string(),
    timestamp: v.string(),
    txHash: v.optional(v.string()),
  }),

  // NFTs table to store all NFT data
  nfts: defineTable({
    tokenId: v.string(),
    name: v.string(),
    description: v.string(),
    image: v.string(),
    metadataUrl: v.string(),
    ownerAddress: v.string(),
    creatorAddress: v.string(),
    mintTxHash: v.string(),
    createdAt: v.string(),
    attributes: v.optional(
      v.array(
        v.object({
          trait_type: v.string(),
          value: v.any(),
        })
      )
    ),
  }),

  cart: defineTable({
    productId: v.id("products"),
    quantity: v.number(),
    buyerAddress: v.string(),
    price: v.number(),
    sellerAddress: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("in_escrow"),
      v.literal("completed")
    ),
    escrowId: v.optional(v.id("escrow")),
    createdAt: v.number(),
  })
    .index("by_buyer", ["buyerAddress"])
    .index("by_status", ["status"]),

  escrow: defineTable({
    cartItems: v.array(v.id("cart")),
    buyerAddress: v.string(),
    totalAmount: v.number(),
    commission: v.number(),
    sellerAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_buyer", ["buyerAddress"])
    .index("by_status", ["status"]),
});
