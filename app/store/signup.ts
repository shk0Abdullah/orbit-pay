// app/store/signup.ts
import { atom } from "jotai";

export const signupAtom = atom({
  email: "",
  password: "",
  phone: "",
  cnic: "",
});
