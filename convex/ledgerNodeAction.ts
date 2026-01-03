"use node";
import { v } from "convex/values";
import * as crypto from "crypto";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

export function generateTxHash(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

// The main action: creates a ledger entry
export const createLedgerTxAction = action({
  args: {
    fromPubkey: v.string(),
    toPubkey: v.string(),
    amount: v.number(),
    signature: v.string(),
    parentHashes: v.array(v.string()),
  },
  async handler(ctx, args): Promise<string> {
    const txData = `${args.fromPubkey}:${args.toPubkey}:${args.amount}:${Date.now()}:${args.parentHashes.join(",")}`;
    const txHash = generateTxHash(txData);

    await ctx.runMutation(internal.ledger.insertLedgerEntry, {
      txHash,
      fromPubkey: args.fromPubkey,
      toPubkey: args.toPubkey,
      amount: args.amount,
      parentHashes: args.parentHashes,
      signature: args.signature,
      timestamp: Date.now(),
      synced: false,
    });

    return txHash;
  },
});
