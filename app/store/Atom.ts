// app/store/signup.ts
import { atom } from "jotai";

import type { Keypair } from "@solana/web3.js";

export const walletAtom = atom<Keypair | string>("");
export const intentAtom = atom<"send" | "receive" | null>(null);
export const balanceAtom = atom<number>(0);
export const indexActionSheet = atom<boolean>(false);
export const signupAtom = atom({
  email: "",
  password: "",
  phone: "",
  cnic: "",
});
