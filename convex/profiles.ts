import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Query to get a profile by wallet address
export const getByWalletAddress = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("walletAddress"), args.walletAddress))
      .first()
  },
})

// Mutation to create or update a profile
export const upsert = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("walletAddress"), args.walletAddress))
      .first()

    if (existingProfile) {
      // Update existing profile
      return await ctx.db.patch(existingProfile._id, {
        ...args,
        updatedAt: new Date().toISOString(),
      })
    } else {
      // Create new profile
      return await ctx.db.insert("profiles", {
        ...args,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  },
})

// Mutation to update profile image
export const updateProfileImage = mutation({
  args: {
    walletAddress: v.string(),
    profileImage: v.string(),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("walletAddress"), args.walletAddress))
      .first()

    if (existingProfile) {
      return await ctx.db.patch(existingProfile._id, {
        profileImage: args.profileImage,
        updatedAt: new Date().toISOString(),
      })
    } else {
      return await ctx.db.insert("profiles", {
        walletAddress: args.walletAddress,
        profileImage: args.profileImage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  },
})

