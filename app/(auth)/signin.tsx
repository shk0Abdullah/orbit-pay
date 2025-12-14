import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  // Handle the submission of the sign-in form
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
    <View className="flex-1 bg-[#c0f667] justify-center items-center px-6">
      {/* App Title */}
      <Text className="text-3xl font-bold text-black mb-10">OrbitPay</Text>

      <View className="w-full">
        {pendingVerification ?
          <View>
            <TextInput
              placeholder="Enter verification code"
              value={code}
              onChangeText={setCode}
              placeholderTextColor="#444"
              className="w-full bg-white/80 p-4 rounded-xl mb-4 text-black"
            />
            <TouchableOpacity onPress={onVerifyPress}>
              <Text>Verify</Text>
            </TouchableOpacity>
          </View> :
          <View>
            <Text className="text-2xl font-semibold text-black mb-4">Sign In</Text>

            <TextInput
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter email"
              placeholderTextColor="#444"
              className="w-full bg-white/80 p-4 rounded-xl mb-4 text-black"
              onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
            />


            <TextInput
              value={password}
              placeholder="Enter password"
              secureTextEntry={true}
              placeholderTextColor="#444"
              className="w-full bg-white/80 p-4 rounded-xl mb-6 text-black"
              onChangeText={(password) => setPassword(password)}
            />

            <TouchableOpacity
              onPress={onSignInPress}
              className="bg-black py-4 rounded-xl w-full"
            >
              <Text className="text-center text-white font-semibold text-lg">
                Continue
              </Text>
            </TouchableOpacity>


            <View className="flex flex-row justify-center mt-4">
              <Link href="/(auth)/signup">
                <Text className="text-black underline">Sign up</Text>
              </Link>
            </View>
          </View>
        }</View></View>

  );
}
