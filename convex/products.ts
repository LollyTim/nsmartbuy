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
        isRawContent: false,
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
      format: v.optional(v.string()),
      isDirectAsset: v.optional(v.boolean()),
      isRawContent: v.optional(v.boolean()),
    }),
    sellerAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("products", {
      ...args,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
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
