import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import * as SecureStore from "expo-secure-store";
import "react-native-get-random-values";
import nacl from "tweetnacl";

const RPC_URL = "https://api.devnet.solana.com";
export const connection = new Connection(RPC_URL, "confirmed");

const KEY_NAME = "SOL_PRIVATE_KEY";

export async function createWallet(
  userId: string,
  createWalletMutation: any
): Promise<string> {
  const keypair = nacl.sign.keyPair();

  const secretKey = bs58.encode(keypair.secretKey);
  const publicKey = bs58.encode(keypair.publicKey);

  await SecureStore.setItemAsync(KEY_NAME, secretKey);

  await createWalletMutation({
    userId,
    publicKey,
  });

  return publicKey;
}

export async function loadWallet(): Promise<Keypair | null> {
  const secretKey = await SecureStore.getItemAsync(KEY_NAME);
  if (!secretKey) return null;

  return Keypair.fromSecretKey(bs58.decode(secretKey));
}

export async function getSolBalance(address: string): Promise<number> {
  const balance = await connection.getBalance(new PublicKey(address));
  return balance / 1e9;
}

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
