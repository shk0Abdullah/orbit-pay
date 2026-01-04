import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createBluetoothPayment = mutation({
  args: {
    senderClerkId: v.string(),
    receiverClerkId: v.string(),
    amount: v.float64(),
    bluetoothDeviceAddress: v.string(),
    bluetoothDeviceName: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const sender = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.senderClerkId))
      .first();

    const receiver = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.receiverClerkId))
      .first();

    if (!sender || !receiver) {
      throw new Error("User not found");
    }

    if (sender.balance < args.amount) {
      throw new Error("Insufficient balance");
    }

    await ctx.db.patch(sender._id, {
      balance: sender.balance - args.amount,
    });

    await ctx.db.patch(receiver._id, {
      balance: receiver.balance + args.amount,
    });

    return await ctx.db.insert("payments", {
      senderUserId: sender._id,
      receiverUserId: receiver._id,
      amount: args.amount,
      currency: "PKR",
      bluetoothDeviceAddress: args.bluetoothDeviceAddress,
      bluetoothDeviceName: args.bluetoothDeviceName,
      status: "completed",
      createdAt: Date.now(),
    });
  },
});

export const getBalance = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  async handler(ctx, args) {
    if (!args.clerkId || args.clerkId.trim() === "") {
      return { balance: 0, currency: "PKR" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId!))
      .first();

    if (!user) {
      return { balance: 0, currency: "PKR" };
    }

    return {
      balance: user.balance,
      currency: "PKR",
    };
  },
});

export const getRecentPayments = query({
  args: {
    clerkId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    if (!args.clerkId || args.clerkId.trim() === "") {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId!))
      .first();

    if (!user) {
      return [];
    }

    const limit = args.limit ?? 20;

    const sent = await ctx.db
      .query("payments")
      .withIndex("by_sender", (q) => q.eq("senderUserId", user._id))
      .collect();

    const received = await ctx.db
      .query("payments")
      .withIndex("by_receiver", (q) => q.eq("receiverUserId", user._id))
      .collect();

    const merged = sent.concat(received);
    merged.sort((a, b) => b.createdAt - a.createdAt);

    return merged.slice(0, limit);
  },
});

// Convenience query that returns recent payments along with sender/receiver user info
export const getRecentPaymentsWithUsers = query({
  args: {
    clerkId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    if (!args.clerkId || args.clerkId.trim() === "") {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId!))
      .first();

    if (!user) return [];

    const limit = args.limit ?? 20;

    const sent = await ctx.db
      .query("payments")
      .withIndex("by_sender", (q) => q.eq("senderUserId", user._id))
      .collect();

    const received = await ctx.db
      .query("payments")
      .withIndex("by_receiver", (q) => q.eq("receiverUserId", user._id))
      .collect();

    const merged = sent.concat(received);
    merged.sort((a, b) => b.createdAt - a.createdAt);

    const sliced = merged.slice(0, limit);

    const populated = await Promise.all(
      sliced.map(async (p) => {
        const sender = p.senderUserId ? await ctx.db.get(p.senderUserId) : null;
        const receiver = p.receiverUserId ? await ctx.db.get(p.receiverUserId) : null;
        return { ...p, sender, receiver };
      })
    );

    return populated;
  },
});
