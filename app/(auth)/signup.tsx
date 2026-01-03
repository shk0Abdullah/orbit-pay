import { balanceAtom, signupAtom, walletAtom } from "@/app/store/Atom";
import { api } from "@/convex/_generated/api";
import {
  createWallet,
  getSolBalance,
  loadWallet,
} from "@/lib/Solana/walletCreate";
import { useSignUp } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { Link, useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  createWallet,
  getSolBalance,
  loadWallet,
} from "@/lib/Solana/walletCreate";
import { showToast } from "@/lib/toast";
const phoneRegex = /^\d{4}-\d{7}$/;
const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [, setWallet] = useAtom(walletAtom);
  const [, setBalance] = useAtom(balanceAtom);
  const [signup, setSignup] = useAtom(signupAtom);

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  };

  const formatCNIC = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 13);

    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;

    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  };

  const createUser = useMutation(api.users.createOrGetUser);
  const createWalletMutation = useMutation(api.wallets.createWallet);

  useEffect(() => {
    init();
  });

  async function init() {
    const wallet = await loadWallet();
    if (!wallet) return;

    setWallet(wallet);
    const bal = await getSolBalance(wallet.publicKey.toBase58());
    setBalance(bal);
  }

  async function onCreateWallet() {
    const pubKey = await createWallet();
    showToast({type : "success", title: "Wallet Created", message: `{pubKey}` });

    init();
  }
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!phoneRegex.test(signup.phone)) {
      showToast({ type: "error", title: "Invalid phone", message: "Use format 0300-1234567" });
      return;
    }

    if (!cnicRegex.test(signup.cnic)) {
      showToast({ type: "error", title: "Invalid CNIC", message: "Use format 12345-6789123-4" });
      return;
    }

    await signUp.create({
      emailAddress: signup.email,
      password: signup.password,
    });

    await signUp.prepareEmailAddressVerification({
      strategy: "email_code",
    });

    setPendingVerification(true);
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    const attempt = await signUp.attemptEmailAddressVerification({ code });

    if (attempt.status !== "complete") return;

    await setActive({ session: attempt.createdSessionId });

    // Create user in Convex
    const userId = await createUser({
      clerkId: attempt.createdUserId!,
      email: signup.email,
      phone: signup.phone,
      cnic: signup.cnic,
    });

    // Create wallet AFTER user exists
    if (!userId || !userId._id) {
      Alert.alert("Error", "Failed to create user or missing user ID");
      return;
    }
    const publicKey = await createWallet(userId._id, createWalletMutation);

    Alert.alert("Wallet Created", publicKey);

    await init();

    router.replace("/(protected)");
  };

  if (pendingVerification) {
    return (
      <ImageBackground source={require("@/assets/bg.png")} className="flex-1">
        <View className="flex-1 justify-center px-6 bg-black/30">
          <View className="bg-white/10 p-6 rounded-2xl">
            <Text className="text-2xl text-center mb-6 text-white">
              Verify Email
            </Text>

            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Verification code"
              className="bg-white/20 p-4 rounded-xl mb-6 text-white"
            />

            <TouchableOpacity
              onPress={onVerifyPress}
              className="bg-black py-4 rounded-xl"
            >
              <Text className="text-center text-white text-lg">Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require("@/assets/bg.png")} className="flex-1">
      <View className="flex-1 justify-center px-6 bg-black/30">
        <View className="bg-white/10 p-6 rounded-2xl">
          <Text className="text-2xl text-center mb-6 text-white">Sign Up</Text>

          <TextInput
            value={signup.email}
            onChangeText={(v) => setSignup((s) => ({ ...s, email: v }))}
            placeholder="Email"
            className="bg-white/20 p-4 rounded-xl mb-4 text-white"
          />

          <TextInput
            secureTextEntry
            value={signup.password}
            onChangeText={(v) => setSignup((s) => ({ ...s, password: v }))}
            placeholder="Password"
            className="bg-white/20 p-4 rounded-xl mb-4 text-white"
          />

          <TextInput
            keyboardType="number-pad"
            value={signup.phone}
            placeholder="Phone (0300-1234567)"
            placeholderTextColor="#000"
            onChangeText={(v) =>
              setSignup((s) => ({
                ...s,
                phone: formatPhone(v),
              }))
            }
            className="bg-white/20 p-4 rounded-xl mb-4 text-white"
          />

          <TextInput
            keyboardType="number-pad"
            value={signup.cnic}
            placeholder="CNIC (12345-6789123-4)"
            placeholderTextColor="#000"
            onChangeText={(v) =>
              setSignup((s) => ({
                ...s,
                cnic: formatCNIC(v),
              }))
            }
            className="bg-white/20 p-4 rounded-xl mb-6 text-white"
          />

          <TouchableOpacity
            onPress={onSignUpPress}
            className="bg-black py-4 rounded-xl"
          >
            <Text className="text-center text-white text-lg">Continue</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-4">
            <Text className="text-blue-400">Already have an account? </Text>
            <Link href="/(auth)/signin">
              <Text className="text-blue-400 underline">Sign in</Text>
            </Link>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}
