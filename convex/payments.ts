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

    // Atomic balance update
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
