import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    phone: v.string(),
    cnic: v.string(),
    createdAt: v.number(),
  })
    .index("by_phone", ["phone"])
    .index("by_cnic", ["cnic"])
    .index("by_clerkId", ["clerkId"]),
});
