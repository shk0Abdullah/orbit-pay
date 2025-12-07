// app/receiver/incoming.tsx
import { bluetoothServer } from "@/lib/bluetooth/server";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

export default function Incoming() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const router = useRouter();
  const [incoming, setIncoming] = useState<string>("");
  const [setConnectedDevice] = useState<any>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    (async () => {
      try {
        const device = await bluetoothServer.connect(deviceId as string);
        setConnectedDevice(device);

        unsub = bluetoothServer.listenForMessages(device, (msg) => {
          setIncoming(msg);
          // show accept/reject
          Alert.alert("Incoming request", msg, [
            {
              text: "Reject",
              onPress: async () => {
                await bluetoothServer.sendResponse(
                  device,
                  JSON.stringify({ status: "rejected" })
                );
              },
              style: "cancel",
            },
            {
              text: "Accept",
              onPress: async () => {
                await bluetoothServer.sendResponse(
                  device,
                  JSON.stringify({ status: "accepted" })
                );
              },
            },
          ]);
        });
      } catch (e) {
        console.warn(e);
      }
    })();

    return () => unsub?.();
  }, [deviceId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listening to: {deviceId}</Text>
      <Text style={{ marginTop: 10 }}>Last incoming: {incoming}</Text>
      <View style={{ height: 12 }} />
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18 },
  title: { fontSize: 18, marginBottom: 10 },
});
