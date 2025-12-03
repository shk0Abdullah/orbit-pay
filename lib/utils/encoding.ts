// lib/utils/encoding.ts
import { Buffer } from "buffer";

export function encodeToBase64(text: string): string {
  return Buffer.from(text, "utf8").toString("base64");
}

export function decodeFromBase64(b64?: string | null): string {
  if (!b64) return "";
  return Buffer.from(b64, "base64").toString("utf8");
}
