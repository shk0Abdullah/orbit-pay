// app/receiver/listen.tsx
import { bluetoothClient } from "@/lib/bluetooth/client"; // reuse scanning
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Device } from "react-native-ble-plx";

export default function ReceiverList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const router = useRouter();

  useEffect(() => {
    setDevices([]);
    // For the receiver UI we scan to show nearby devices that can be connected to.
    // In a more advanced approach, receiver advertises; here we show a simple UI
    // where receiver picks a device to connect to and listen for a request.
    bluetoothClient.startScan((device) => {
      setDevices((prev) =>
        prev.find((d) => d.id === device.id) ? prev : [...prev, device]
      );
    });

    return () => bluetoothClient.stopScan();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Senders (tap to listen)</Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              router.push({
                pathname: "/receiver/incoming",
                params: { deviceId: item.id },
              })
            }
          >
            <Text style={{ fontWeight: "600" }}>{item.name || "Unnamed"}</Text>
            <Text style={{ color: "#666" }}>{item.id}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18 },
  title: { fontSize: 18, marginBottom: 12 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
});
