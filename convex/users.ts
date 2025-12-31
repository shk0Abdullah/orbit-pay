import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function hashCNIC(cnic: string): Promise<string> {
  const data = new TextEncoder().encode(cnic);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/-/g, "");
  return `+92${digits.slice(1)}`;
}

export const createOrGetUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    phone: v.string(),
    cnic: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) return existingUser;

    const phone = normalizePhone(args.phone);
    const cnicHash = await hashCNIC(args.cnic);

    const phoneExists = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .first();

    if (phoneExists) {
      console.log(" phone number pehle kisi k pas hai");

      return;
    }

    const cnicExists = await ctx.db
      .query("users")
      .withIndex("by_cnic", (q) => q.eq("cnic", cnicHash))
      .first();

    if (cnicExists) {
      console.log("cnic pehle kisi k pas hai");
      return;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      phone,
      cnic: cnicHash,
      createdAt: Date.now(),
      balance: 0,
    });

    return await ctx.db.get(userId);
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  async handler(ctx, { clerkId }) {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});
