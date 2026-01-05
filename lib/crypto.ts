import * as Crypto from "expo-crypto";

export async function generateTxHash(data: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    data
  );
}
