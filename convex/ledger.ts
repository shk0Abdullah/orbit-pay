import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const getLastTransaction = query({
  args: { publicKey: v.string() },
  async handler(ctx, { publicKey }) {
    const txs = await ctx.db
      .query("ledger")
      .withIndex("by_fromPubkey", (q) => q.eq("fromPubkey", publicKey))
      .collect();

    return txs.sort((a, b) => b.timestamp - a.timestamp)[0] || null;
  },
});

export const getUserBalance = query({
  args: { publicKey: v.string() },
  async handler(ctx, { publicKey }) {
    // sum all ledger transactions for this user
    const incoming = await ctx.db
      .query("ledger")
      .withIndex("by_toPubkey", (q) => q.eq("toPubkey", publicKey))
      .collect();
    const outgoing = await ctx.db
      .query("ledger")
      .withIndex("by_fromPubkey", (q) => q.eq("fromPubkey", publicKey))
      .collect();

    const balance =
      incoming.reduce((sum, tx) => sum + tx.amount, 0) -
      outgoing.reduce((sum, tx) => sum + tx.amount, 0);
    return { balance };
  },
});

export const insertLedgerEntry = internalMutation({
  args: {
    txHash: v.string(),
    fromPubkey: v.string(),
    toPubkey: v.string(),
    amount: v.number(),
    parentHashes: v.array(v.string()),
    signature: v.string(),
    timestamp: v.number(),
    synced: v.boolean(),
  },
  async handler(ctx, args) {
    return await ctx.db.insert("ledger", args);
  },
});
