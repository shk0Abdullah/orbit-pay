import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createWallet = mutation({
  args: {
    userId: v.id("users"),
    publicKey: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("wallets", {
      userId: args.userId,
      publicKey: args.publicKey,
      curve: "ed25519",
      createdAt: Date.now(),
    });
  },
});
