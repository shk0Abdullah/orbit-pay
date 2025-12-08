// app/sender/send.tsx
import { bluetoothClient } from "@/lib/bluetooth/client";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function SendScreen() {
  const router = useRouter();
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const [name, setName] = useState("");
  const [payment, setPayment] = useState("");
  const [receiver, setReceiver] = useState("");
  const [status, setStatus] = useState<string>("");

  const send = async () => {
    setStatus("Connecting...");
    try {
      console.log("........");
      const device = await bluetoothClient.connect(deviceId as string);
      console.log(device);
      setStatus("Connected — sending request...");
      const payload = { name, payment, receiver };
      console.log(payload);
      await bluetoothClient.sendMessage(device, payload);

      setStatus("Waiting for response...");
      const unsub = bluetoothClient.subscribeToResponse(device, (resp) => {
        setStatus("Response: " + resp);
        unsub();
      });
    } catch (e: any) {
      console.error(e);
      setStatus("Error: " + (e?.message || e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send to: {deviceId}</Text>

      <TextInput
        placeholder="Your name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Amount"
        keyboardType="numeric"
        style={styles.input}
        value={payment}
        onChangeText={setPayment}
      />
      <TextInput
        placeholder="Receiver name"
        style={styles.input}
        value={receiver}
        onChangeText={setReceiver}
      />

      <Button title="Send Request" onPress={send} />
      <View style={{ height: 16 }} />
      <Text>Status: {status}</Text>

      <View style={{ height: 12 }} />
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18 },
  title: { fontSize: 18, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10 },
});
