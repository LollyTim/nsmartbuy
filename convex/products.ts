import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query to get all products
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("status"), "active" as const))
      .order("desc")
      .collect();
  },
});

// Query to get products by seller address
export const getBySeller = query({
  args: { sellerAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("sellerAddress"), args.sellerAddress))
      .order("desc")
      .collect();
  },
});

// Mutation to create a new product
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.string(),
    image: v.string(),
    metadataUrl: v.optional(v.string()),
    tokenId: v.optional(v.string()),
    sellerAddress: v.string(),
    isAuction: v.optional(v.boolean()),
    auctionDuration: v.optional(v.number()),
    quantity: v.optional(v.number()),
    category: v.string(),
    status: v.string(),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("products", {
      ...args,
      createdAt: now,
      updatedAt: now,
      mediaType: "image",
      ipfsHash: "",
      metadata: {
        format: "",
        isDirectAsset: false,
      },
    });
  },
});

// Mutation to update a product
export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    image: v.optional(v.string()),
    metadataUrl: v.optional(v.string()),
    tokenId: v.optional(v.string()),
    status: v.optional(v.string()),
    quantity: v.optional(v.number()),
    updatedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = Date.now();
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
    });
  },
});

// Mutation to delete a product
export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.string(),
    image: v.string(),
    mediaType: v.string(),
    ipfsHash: v.string(),
    metadata: v.object({
      format: v.string(),
      isDirectAsset: v.boolean(),
    }),
    sellerAddress: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate required fields
    if (!args.name.trim()) {
      throw new Error("Product name is required");
    }
    if (!args.description.trim()) {
      throw new Error("Product description is required");
    }
    if (args.price <= 0) {
      throw new Error("Product price must be greater than 0");
    }
    if (!args.ipfsHash.trim()) {
      throw new Error("IPFS hash is required");
    }
    if (!args.sellerAddress.trim()) {
      throw new Error("Seller address is required");
    }

    console.log("📝 Creating product with data:", args);
    const now = Date.now();

    const productId = await ctx.db.insert("products", {
      name: args.name,
      description: args.description,
      price: args.price,
      currency: args.currency,
      image: args.image,
      mediaType: args.mediaType,
      ipfsHash: args.ipfsHash,
      metadata: {
        format: args.metadata.format,
        isDirectAsset: args.metadata.isDirectAsset,
      },
      sellerAddress: args.sellerAddress,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    console.log("✅ Product created with ID:", productId);
    return productId;
  },
});

export const getProducts = query({
  args: {
    status: v.optional(v.string()),
    sellerAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status && args.sellerAddress) {
      return await ctx.db
        .query("products")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .filter((q) => q.eq(q.field("sellerAddress"), args.sellerAddress!))
        .collect();
    }

    if (args.status) {
      return await ctx.db
        .query("products")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    }

    if (args.sellerAddress) {
      return await ctx.db
        .query("products")
        .withIndex("by_seller", (q) =>
          q.eq("sellerAddress", args.sellerAddress!)
        )
        .collect();
    }

    return await ctx.db.query("products").collect();
  },
});

export const getProductByHash = query({
  args: { ipfsHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_ipfsHash", (q) => q.eq("ipfsHash", args.ipfsHash))
      .first();
  },
});

export const getProductsBySeller = query({
  args: { sellerAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerAddress", args.sellerAddress))
      .collect();
  },
});

export const saveNFTMetadata = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.string(),
    price: v.number(),
    currency: v.string(),
    image: v.string(),
    metadataUrl: v.string(),
    ipfsHash: v.string(),
    sellerAddress: v.string(),
    isAuction: v.boolean(),
    auctionDuration: v.union(v.number(), v.null()),
    quantity: v.number(),
    status: v.string(),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const productId = await ctx.db.insert("products", {
      name: args.name,
      description: args.description,
      price: args.price,
      currency: args.currency,
      image: args.image,
      ipfsHash: args.ipfsHash,
      sellerAddress: args.sellerAddress,
      status: args.status,
      mediaType: "image/jpeg",
      metadata: {
        format: "jpeg",
        isDirectAsset: true,
      },
      createdAt: new Date(args.createdAt).getTime(),
      updatedAt: Date.now(),
    });

    return productId;
  },
});

export const saveAuctionData = mutation({
  args: {
    productId: v.id("products"),
    startingPrice: v.number(),
    sellerAddress: v.string(),
    status: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    startTime: v.string(),
    endTime: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate required fields
    if (args.startingPrice <= 0) {
      throw new Error("Starting price must be greater than 0");
    }
    if (!args.sellerAddress.trim()) {
      throw new Error("Seller address is required");
    }

    // Validate dates
    const startTime = new Date(args.startTime).getTime();
    const endTime = new Date(args.endTime).getTime();
    if (endTime <= startTime) {
      throw new Error("End time must be after start time");
    }

    console.log("📝 Creating auction with data:", args);

    const auctionId = await ctx.db.insert("auctions", {
      productId: args.productId,
      startingPrice: args.startingPrice,
      sellerAddress: args.sellerAddress,
      status: args.status,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
      currentBid: args.startingPrice,
      highestBidder: undefined,
      startTime: args.startTime,
      endTime: args.endTime,
    });

    console.log("✅ Auction created with ID:", auctionId);
    return auctionId;
  },
});

export const getActiveAuctions = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("auctions")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

// Get a single product by ID
export const getProduct = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get auction details for a product
export const getAuction = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auctions")
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});
