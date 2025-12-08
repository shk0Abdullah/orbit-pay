import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(protected)");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View className="flex-1 bg-[#c0f667] justify-center items-center px-6">
      {/* App Title */}
      <Text className="text-3xl font-bold text-black mb-10">OrbitPay</Text>

      <View className="w-full">
        {/* Sign In Heading */}
        <Text className="text-2xl font-semibold text-black mb-4">Sign In</Text>

        {/* Email */}
        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#444"
          className="w-full bg-white/80 p-4 rounded-xl mb-4 text-black"
          onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        />

        {/* Password */}
        <TextInput
          value={password}
          placeholder="Enter password"
          secureTextEntry={true}
          placeholderTextColor="#444"
          className="w-full bg-white/80 p-4 rounded-xl mb-6 text-black"
          onChangeText={(password) => setPassword(password)}
        />

        {/* Continue Button */}
        <TouchableOpacity
          onPress={onSignInPress}
          className="bg-black py-4 rounded-xl w-full"
        >
          <Text className="text-center text-white font-semibold text-lg">
            Continue
          </Text>
        </TouchableOpacity>

        {/* Signup Link */}
        <View className="flex flex-row justify-center mt-4">
          <Link href="/(auth)/signup">
            <Text className="text-black underline">Sign up</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
