import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Cart item type
interface CartItem {
  productId: Id<"products">;
  quantity: number;
  price: number;
  sellerAddress: string;
}

// Get cart items for a user
export const getCartItems = query({
  args: { buyerAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cart")
      .filter((q) => q.eq(q.field("buyerAddress"), args.buyerAddress))
      .collect();
  },
});

// Add item to cart
export const addToCart = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    buyerAddress: v.string(),
  },
  handler: async (ctx, args) => {
    // Get product details
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");
    if (product.status !== "active")
      throw new Error("Product is not available");

    // Check if item already in cart
    const existingItem = await ctx.db
      .query("cart")
      .filter((q) =>
        q.and(
          q.eq(q.field("buyerAddress"), args.buyerAddress),
          q.eq(q.field("productId"), args.productId)
        )
      )
      .first();

    if (existingItem) {
      // Update quantity
      return await ctx.db.patch(existingItem._id, {
        quantity: existingItem.quantity + args.quantity,
      });
    }

    // Add new cart item
    return await ctx.db.insert("cart", {
      productId: args.productId,
      quantity: args.quantity,
      buyerAddress: args.buyerAddress,
      price: product.price,
      sellerAddress: product.sellerAddress,
      createdAt: Date.now(),
    });
  },
});

// Remove item from cart
export const removeFromCart = mutation({
  args: {
    cartItemId: v.id("cart"),
    buyerAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem) throw new Error("Cart item not found");
    if (cartItem.buyerAddress !== args.buyerAddress)
      throw new Error("Unauthorized");

    await ctx.db.delete(args.cartItemId);
  },
});

// Create escrow for purchase
export const createPurchaseEscrow = mutation({
  args: {
    cartItemIds: v.array(v.id("cart")),
    buyerAddress: v.string(),
    totalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    // Get cart items
    const cartItems = await Promise.all(
      args.cartItemIds.map((id) => ctx.db.get(id))
    );

    // Validate cart items
    cartItems.forEach((item) => {
      if (!item) throw new Error("Cart item not found");
      if (item.buyerAddress !== args.buyerAddress)
        throw new Error("Unauthorized");
    });

    // Calculate commission (2%)
    const commission = args.totalAmount * 0.02;
    const sellerAmount = args.totalAmount - commission;

    // Create escrow record
    const escrowId = await ctx.db.insert("escrow", {
      cartItems: args.cartItemIds,
      buyerAddress: args.buyerAddress,
      totalAmount: args.totalAmount,
      commission,
      sellerAmount,
      status: "pending",
      createdAt: Date.now(),
    });

    // Update cart items status
    await Promise.all(
      args.cartItemIds.map((id) =>
        ctx.db.patch(id, { status: "in_escrow", escrowId })
      )
    );

    return escrowId;
  },
});

// Confirm delivery and release funds
export const confirmDeliveryAndRelease = mutation({
  args: {
    escrowId: v.id("escrow"),
    buyerAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const escrow = await ctx.db.get(args.escrowId);
    if (!escrow) throw new Error("Escrow not found");
    if (escrow.buyerAddress !== args.buyerAddress)
      throw new Error("Unauthorized");
    if (escrow.status !== "pending") throw new Error("Invalid escrow status");

    // Update escrow status
    await ctx.db.patch(args.escrowId, {
      status: "completed",
      completedAt: Date.now(),
    });

    // Here you would trigger the actual fund transfer to seller
    // This would typically involve calling your blockchain/payment integration

    // Update cart items status
    await Promise.all(
      escrow.cartItems.map((id) => ctx.db.patch(id, { status: "completed" }))
    );

    return true;
  },
});
