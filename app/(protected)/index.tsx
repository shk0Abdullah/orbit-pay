// app/index.tsx
import { SignOutButton } from "@/app/components/SignOutButton";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

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
          <Link href="/(auth)/sign-in">
            <Text style={{ color: "white" }}>Sign in</Text>
          </Link>
          <Link href="/(auth)/sign-up">
            <Text>Sign up</Text>
          </Link>
        </SignedOut>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Bluetooth MVP</Text>
        <Link href="/sender/devices" style={styles.link}>
          Sender (Scan & Send)
        </Link>
        <Link href="/receiver/listen" style={[styles.link, { marginTop: 12 }]}>
          Receiver (Listen & Accept)
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 22, marginBottom: 24 },
  link: { fontSize: 18, color: "blue" },
});
