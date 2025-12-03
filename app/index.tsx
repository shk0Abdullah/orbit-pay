// app/index.tsx
import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth MVP</Text>
      <Link href="/sender/devices" style={styles.link}>Sender (Scan & Send)</Link>
      <Link href="/receiver/listen" style={[styles.link, { marginTop: 12 }]}>Receiver (Listen & Accept)</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, marginBottom: 24 },
  link: { fontSize: 18, color: "blue" },
});
