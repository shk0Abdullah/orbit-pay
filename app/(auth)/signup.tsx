import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAtom } from "jotai";
import { signupAtom } from "../store/signup";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const phoneRegex = /^\d{4}-\d{7}$/;
const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [signup, setSignup] = useAtom(signupAtom);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  const createUser = useMutation(api.users.createOrGetUser);

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

  /* ---------------- Verification Screen ---------------- */
  if (pendingVerification) {
    return (
      <View className="flex-1 bg-[#c0f667] justify-center items-center px-6">
        <Text className="text-3xl font-bold text-black mb-10">OrbitPay</Text>

        <View className="w-full">
          <Text className="text-2xl font-semibold text-black mb-4">
            Verify Email
          </Text>

          <TextInput
            value={code}
            placeholder="Verification code"
            placeholderTextColor="#444"
            onChangeText={setCode}
            className="w-full bg-white/80 p-4 rounded-xl mb-6 text-black"
          />

          <TouchableOpacity
            onPress={onVerifyPress}
            className="bg-black py-4 rounded-xl w-full"
          >
            <Text className="text-center text-white font-semibold text-lg">
              Verify
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ---------------- Sign Up Screen ---------------- */
  return (
    <View className="flex-1 bg-[#c0f667] justify-center items-center px-6">
      <Text className="text-3xl font-bold text-black mb-10">OrbitPay</Text>

      <View className="w-full">
        <Text className="text-2xl font-semibold text-black mb-4">Sign Up</Text>

        <TextInput
          autoCapitalize="none"
          value={signup.email}
          placeholder="Enter email"
          placeholderTextColor="#444"
          onChangeText={(v) => setSignup((s) => ({ ...s, email: v }))}
          className="w-full bg-white/80 p-4 rounded-xl mb-4 text-black"
        />

        <TextInput
          secureTextEntry
          value={signup.password}
          placeholder="Enter password"
          placeholderTextColor="#444"
          onChangeText={(v) => setSignup((s) => ({ ...s, password: v }))}
          className="w-full bg-white/80 p-4 rounded-xl mb-4 text-black"
        />

        <TextInput
          value={signup.phone}
          placeholder="Phone (0300-1234567)"
          placeholderTextColor="#444"
          onChangeText={(v) => setSignup((s) => ({ ...s, phone: v }))}
          className="w-full bg-white/80 p-4 rounded-xl mb-4 text-black"
        />

        <TextInput
          value={signup.cnic}
          placeholder="CNIC (12345-6789123-4)"
          placeholderTextColor="#444"
          onChangeText={(v) => setSignup((s) => ({ ...s, cnic: v }))}
          className="w-full bg-white/80 p-4 rounded-xl mb-6 text-black"
        />

        <TouchableOpacity
          onPress={onSignUpPress}
          className="bg-black py-4 rounded-xl w-full"
        >
          <Text className="text-center text-white font-semibold text-lg">
            Continue
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4">
          <Text className="text-black">Already have an account? </Text>
          <Link href="/(auth)/signin">
            <Text className="text-black underline">Sign in</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
