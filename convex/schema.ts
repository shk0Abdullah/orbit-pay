
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    phone: v.string(),
    cnic: v.string(),
    createdAt: v.number(),
    balance: v.number(),
  })
    .index("by_phone", ["phone"])
    .index("by_cnic", ["cnic"])
    .index("by_clerkId", ["clerkId"]),


    
  payments: defineTable({
    senderUserId: v.id("users"),
    receiverUserId: v.id("users"),

    amount: v.float64(),
    currency: v.literal("PKR"),

    bluetoothDeviceAddress: v.string(),
    bluetoothDeviceName: v.optional(v.string()),

    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),

    createdAt: v.float64(),
  })
    .index("by_sender", ["senderUserId"])
    .index("by_receiver", ["receiverUserId"]),
});