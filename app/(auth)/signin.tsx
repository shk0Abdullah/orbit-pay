import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const attempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/(protected)");
        return;
      }

      if (attempt.status === "needs_second_factor") {
        await signIn.prepareSecondFactor({
          strategy: "email_code",
        });
        setPendingVerification(true);
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(protected)");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/bg.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 justify-center px-6 bg-black/20">
        <View className="w-full rounded-2xl p-6 bg-white/10 backdrop-blur-md">
          {pendingVerification ? (
            <View>
              <TextInput
                placeholder="Enter verification code"
                value={code}
                onChangeText={setCode}
                placeholderTextColor="#86D2FF"
                className="w-full bg-white/20 p-4 rounded-xl mb-4 text-white"
              />

              <TouchableOpacity
                onPress={onVerifyPress}
                className="bg-[#1A459D] py-4 rounded-xl"
              >
                <Text className="text-center text-white font-semibold text-lg">
                  Verify
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text className="text-2xl font-semibold text-[#d5d1d1] mb-4 text-center">
                Sign In
              </Text>

              <TextInput
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Email"
                placeholderTextColor="#000"
                className="w-full bg-white/20 p-4 rounded-xl mb-2 text-white"
                onChangeText={setEmailAddress}
              />

              <TextInput
                value={password}
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="#000"
                className="w-full bg-white/20 p-4 rounded-xl mb-6 text-white"
                onChangeText={setPassword}
              />

              <TouchableOpacity
                onPress={onSignInPress}
                className="bg-[#000000] py-3 rounded-xl w-full"
              >
                <Text className="text-center text-[#bdbdbd] font-semibold text-lg">
                  Continue
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center mt-4">
                <Link href="/(auth)/signup">
                  <Text className="text-[#4A90E2] underline">Sign up</Text>
                </Link>
              </View>
            </View>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}
