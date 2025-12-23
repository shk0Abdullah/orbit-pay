import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import "react-native-get-random-values";

import bs58 from "bs58";
import * as SecureStore from "expo-secure-store";
import nacl from "tweetnacl";

const RPC_URL = "https://api.devnet.solana.com";
export const connection = new Connection(RPC_URL, "confirmed");

const KEY_NAME = "SOL_PRIVATE_KEY";

/* ---------------- WALLET ---------------- */

export async function createWallet(): Promise<string> {
  const keypair = nacl.sign.keyPair();
  console.log("RAW SECRET KEY:", keypair.secretKey);
  console.log("RAW PUBLIC KEY:", keypair.publicKey);
  const secretKey = bs58.encode(keypair.secretKey);
  const publicKey = bs58.encode(keypair.publicKey);
  console.log("SECRET KEY (base58):", secretKey);
  console.log("PUBLIC KEY (address):", publicKey);
  await SecureStore.setItemAsync(KEY_NAME, secretKey);

  return publicKey;
}

export async function loadWallet(): Promise<Keypair | null> {
  const secretKey = await SecureStore.getItemAsync(KEY_NAME);
  if (!secretKey) return null;

  return Keypair.fromSecretKey(bs58.decode(secretKey));
}

/* ---------------- BALANCE ---------------- */

export async function getSolBalance(address: string): Promise<number> {
  const balance = await connection.getBalance(new PublicKey(address));
  return balance / 1e9;
}

/* ---------------- SEND SOL ---------------- */

export async function sendSol(
  sender: Keypair,
  toAddress: string,
  amountSol: number
): Promise<string> {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender.publicKey,
      toPubkey: new PublicKey(toAddress),
      lamports: amountSol * 1e9,
    })
  );

  return await connection.sendTransaction(tx, [sender]);
}
