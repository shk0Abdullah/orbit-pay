import { balanceAtom, signupAtom, walletAtom } from "@/app/store/Atom";
import { useSignUp } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { Link, useRouter } from "expo-router";
import { useAtom } from "jotai";
import * as React from "react";
import { useEffect } from "react";
import {
  Alert,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../convex/_generated/api";

import {
  createWallet,
  getSolBalance,
  loadWallet,
} from "@/lib/Solana/walletCreate";
const phoneRegex = /^\d{4}-\d{7}$/;
const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [, setWallet] = useAtom(walletAtom);
  const [, setBalance] = useAtom(balanceAtom);
  const router = useRouter();
  const [signup, setSignup] = useAtom(signupAtom);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

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
  useEffect(() => {
    init();
  }, []);

  async function init() {
    const w = await loadWallet();
    if (w) {
      setWallet(w);
      refreshBalance(w.publicKey.toBase58());
    }
  }

  async function refreshBalance(pubKey: string) {
    const bal = await getSolBalance(pubKey);
    setBalance(bal);
  }

  async function onCreateWallet() {
    const pubKey = await createWallet();
    Alert.alert("Wallet Created", pubKey);
    init();
  }
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!phoneRegex.test(signup.phone)) {
      Alert.alert("Invalid phone", "Use format 0300-1234567");
      return;
    }

    if (!cnicRegex.test(signup.cnic)) {
      Alert.alert("Invalid CNIC", "Use format 12345-6789123-4");
      return;
    }
    console.log("Started to create the user");
    await signUp.create({
      emailAddress: signup.email,
      password: signup.password,
    });
    console.log("User created on Clerk");
    onCreateWallet();
    await signUp.prepareEmailAddressVerification({
      strategy: "email_code",
    });

    setPendingVerification(true);
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    const attempt = await signUp.attemptEmailAddressVerification({ code });

    if (attempt.status === "complete") {
      await setActive({ session: attempt.createdSessionId });
      console.log("Gonna create the User in Convex");
      await createUser({
        clerkId: attempt.createdUserId!,
        email: signup.email,
        phone: signup.phone,
        cnic: signup.cnic,
      });
      console.log("User Created on Convex");
      router.replace("/(protected)");
    }
  };

  if (pendingVerification) {
    return (
      <ImageBackground
        source={require("@/assets/bg.png")}
        resizeMode="cover"
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6 bg-black/30">
          <View className="bg-white/10 p-6 rounded-2xl">
            <Text className="text-2xl font-semibold text-[#dbd9d9] mb-6 text-center">
              Verify Email
            </Text>

            <TextInput
              value={code}
              placeholder="Verification code"
              placeholderTextColor="#000"
              onChangeText={setCode}
              className="bg-white/20 p-4 rounded-xl mb-6 text-white"
            />

            <TouchableOpacity
              onPress={onVerifyPress}
              className="bg-[#000] py-4 rounded-xl"
            >
              <Text className="text-[#dedede] text-center font-semibold text-lg">
                Verify
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }

  /* ---------------- Sign Up Screen ---------------- */
  return (
    <ImageBackground
      source={require("@/assets/bg.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 justify-center px-6 bg-black/30">
        <View className="w-full rounded-2xl p-6 bg-white/10">
          <Text className="text-2xl font-semibold text-[#dedcdc] mb-6 text-center">
            Sign Up
          </Text>

          <TextInput
            autoCapitalize="none"
            value={signup.email}
            placeholder="Email"
            placeholderTextColor="#000"
            onChangeText={(v) => setSignup((s) => ({ ...s, email: v }))}
            className="bg-white/20 p-4 rounded-xl mb-4 text-white"
          />

          <TextInput
            secureTextEntry
            value={signup.password}
            placeholder="Password"
            placeholderTextColor="#000"
            onChangeText={(v) => setSignup((s) => ({ ...s, password: v }))}
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
            className="bg-[#000000] py-4 rounded-xl"
          >
            <Text className="text-[#d0cfcf] text-center font-semibold text-lg">
              Continue
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-4">
            <Text className="text-[#4A90E2]">Already have an account? </Text>
            <Link href="/(auth)/signin">
              <Text className="text-[#4A90E2] underline">Sign in</Text>
            </Link>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}
