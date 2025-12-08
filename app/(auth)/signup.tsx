import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(protected)");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  /* ---  ONLY the JSX part replaced;  state / handlers untouched  --- */
  if (pendingVerification) {
    return (
      <View className="flex-1 bg-[#4710cb] justify-center items-center px-6">
        <View className="bg-white/10 rounded-2xl px-6 py-8 w-full max-w-sm">
          <Text className="text-white text-2xl font-bold text-center mb-6">
            Verify your email
          </Text>

          <TextInput
            value={code}
            placeholder="Enter your verification code"
            placeholderTextColor="#ffffff80"
            onChangeText={setCode}
            className="bg-white/20 text-white rounded-lg px-4 py-3 mb-4"
          />

          <TouchableOpacity
            onPress={onVerifyPress}
            className="bg-[#c0f667] rounded-lg py-3 items-center"
          >
            <Text className="text-[#4710cb] font-bold">Verify</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#4710cb] justify-center items-center px-6">
      <View className="bg-white/10 rounded-2xl px-6 py-8 w-full max-w-sm">
        <Text className="text-white text-2xl font-bold text-center mb-6">
          Sign up
        </Text>

        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#ffffff80"
          onChangeText={setEmailAddress}
          className="bg-white/20 text-white rounded-lg px-4 py-3 mb-4"
        />

        <TextInput
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#ffffff80"
          secureTextEntry
          onChangeText={setPassword}
          className="bg-white/20 text-white rounded-lg px-4 py-3 mb-6"
        />

        <TouchableOpacity
          onPress={onSignUpPress}
          className="bg-[#c0f667] rounded-lg py-3 items-center mb-4"
        >
          <Text className="text-[#4710cb] font-bold">Continue</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center items-center gap-2">
          <Text className="text-white/80">Already have an account?</Text>
          <Link href="/(auth)/signin">
            <Text className="text-[#c0f667] font-semibold">Sign in</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
