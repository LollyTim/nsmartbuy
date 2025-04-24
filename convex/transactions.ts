import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Query to get transactions by wallet address
export const getByWalletAddress = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("walletAddress"), args.walletAddress))
      .order("desc")
      .collect()
  },
})

// Mutation to create a new transaction
export const create = mutation({
  args: {
    type: v.string(),
    amount: v.number(),
    ngnAmount: v.optional(v.number()),
    recipient: v.optional(v.string()),
    sender: v.optional(v.string()),
    txHash: v.optional(v.string()),
    reference: v.optional(v.string()),
    status: v.string(),
    walletAddress: v.string(),
    timestamp: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("transactions", args)
  },
})

// Mutation to update a transaction
export const update = mutation({
  args: {
    id: v.id("transactions"),
    status: v.optional(v.string()),
    txHash: v.optional(v.string()),
    error: v.optional(v.string()),
    completedAt: v.optional(v.string()),
    failedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    return await ctx.db.patch(id, updates)
  },
})

// Query to get a transaction by reference
export const getByReference = query({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("reference"), args.reference))
      .first()
  },
})

// Query to get a transaction by txHash
export const getByTxHash = query({
  args: { txHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("txHash"), args.txHash))
      .first()
  },
})

