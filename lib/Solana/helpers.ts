import crypto from "crypto";

import bs58 from "bs58";
import nacl from "tweetnacl";

export function computeTxHash({
  fromPubkey,
  toPubkey,
  amount,
  parentHashes,
  timestamp,
}: {
  fromPubkey: string;
  toPubkey: string;
  amount: number;
  parentHashes: string[];
  timestamp: number;
}): string {
  const payload = `${fromPubkey}|${toPubkey}|${amount}|${parentHashes.join(",")}|${timestamp}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function signTxHash(txHash: string, privateKeyBase58: string): string {
  const privateKey = bs58.decode(privateKeyBase58);
  const signature = nacl.sign.detached(Buffer.from(txHash), privateKey);
  return bs58.encode(signature);
}
