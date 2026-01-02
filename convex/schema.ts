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

  // Ledger
  ledger: defineTable({
    txHash: v.string(),
    fromPubkey: v.string(),
    toPubkey: v.string(),
    amount: v.float64(),
    parentHashes: v.array(v.string()),
    signature: v.string(),
    timestamp: v.float64(),
    synced: v.boolean(),
  })
    .index("by_fromPubkey", ["fromPubkey"])
    .index("by_toPubkey", ["toPubkey"]),

  credit_predictions: defineTable({
    prediction_id: v.string(),
    predicted_score: v.string(),
    confidence: v.float64(),
    probabilities: v.any(),
    input_data: v.any(),
    model_version: v.string(),
    timestamp: v.string(),
    clerkId: v.optional(v.string()),
    customer_id: v.optional(v.string()),
    createdAt: v.float64(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_customer_id", ["customer_id"])
    .index("by_prediction_id", ["prediction_id"]),

  wallets: defineTable({
    userId: v.id("users"),

    publicKey: v.string(),
    curve: v.literal("ed25519"),

    createdAt: v.float64(),
  })
    .index("by_user", ["userId"])
    .index("by_public_key", ["publicKey"]),
});
