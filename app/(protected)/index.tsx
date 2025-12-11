// app/index.tsx
import { SignOutButton } from "@/app/components/SignOutButton";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import {Text, View } from "react-native";

export default function Home() {
  const { user } = useUser();

  return (
    <>
      <View>
        <SignedIn>
          <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
          <SignOutButton />
        </SignedIn>
        <SignedOut>
          <View className="flex flex-col gap-5 items-center justify-center">
          <Link href="/(auth)/signin">
            <Text style={{ color: "white" }}>Sign in</Text>
          </Link>
          <Link href="/(auth)/signup">
            <Text>Sign up</Text>
          </Link>
          <Link href="/(protected)/bluetooth/client"><Text className="text-4xl text-blue-300 underline">Client</Text></Link>
          <Link href="/(protected)/bluetooth/server"><Text className="text-4xl text-blue-300 underline">Server</Text></Link>
          </View>
        </SignedOut>
      </View>

    </>
  );
}


