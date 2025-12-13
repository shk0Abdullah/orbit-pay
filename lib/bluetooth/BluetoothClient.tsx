import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RNBluetoothClassic, {
  BluetoothDevice,
} from "react-native-bluetooth-classic";

export default function BluetoothClient() {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] =
    useState<BluetoothDevice | null>(null);
  const [loading, setLoading] = useState(false); // loader state

  const enableBluetooth = async () => {
    const enabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (!enabled) {
      await RNBluetoothClassic.requestBluetoothEnabled();
    }
  };

  const scanAllDevices = async () => {
    try {
      setLoading(true);
      const paired = await RNBluetoothClassic.getBondedDevices();
      const unpaired = await RNBluetoothClassic.startDiscovery();

      // Combine without spreading into plain objects
      const combined: BluetoothDevice[] = [...paired];

      // Add unpaired devices that are not already in the list
      unpaired.forEach((d) => {
        if (!combined.find((pd) => pd.address === d.address)) {
          combined.push(d);
        }
      });

      setDevices(combined);
    } catch (err) {
      console.error("Scan failed", err);
      Alert.alert("Error", "Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  };

  /** STEP 1c: Pair with unpaired device */
  const pairDevice = async (device: BluetoothDevice) => {
    try {
      const paired = await RNBluetoothClassic.pairDevice(device.address);
      if (paired) {
        Alert.alert("Paired", `${device.name} paired successfully`);
        scanAllDevices(); // refresh all devices
      } else {
        Alert.alert("Failed", "Pairing failed");
      }
    } catch (err) {
      console.error("Pairing error", err);
      Alert.alert("Error", "Pairing failed");
    }
  };

  /** STEP 2: Connect to selected device */
  const connectTo = async (device: BluetoothDevice) => {
    try {
      console.log(device);
      const d = await RNBluetoothClassic.connectToDevice(device.address);
      await d.connect();
      setConnectedDevice(d);
      Alert.alert("Connected", "Connected to Server");
    } catch (e) {
      console.error("CONNECT ERROR", e);
      Alert.alert("Connection Failed", "Could not connect to device");
    }
  };

  /** STEP 3: Send JSON */
  const sendPayment = async () => {
    if (!connectedDevice) return Alert.alert("Error", "Not connected");

    const payload = {
      amount: 120,
      currency: "pkr",
      sender: "abdullah",
      time: Date.now(),
    };

    try {
      const msg = await RNBluetoothClassic.writeToDevice(
        connectedDevice.id,
        JSON.stringify(payload) + "\n"
      );
      Alert.alert("Success", "Payment Sent!");
      console.log("Sent from Client", msg);
    } catch (err) {
      console.error("WRITE ERROR", err);
      Alert.alert("Send Failed", "Could not send payment");
    }
  };

  useEffect(() => {
    enableBluetooth();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      {/* Combined scan button */}
      <Button
        title={loading ? "Scanning..." : "Scan All Devices"}
        onPress={scanAllDevices}
        disabled={loading} // prevent multiple clicks
      />

      {/* Show loader */}
      {loading && (
        <ActivityIndicator
          size="large"
          color="#4710cb"
          style={{ marginVertical: 10 }}
        />
      )}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.address}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => (item.bonded ? connectTo(item) : pairDevice(item))}
            style={{ padding: 10, backgroundColor: "#eee", marginVertical: 5 }}
          >
            <Text>{item.name}</Text>
            <Text>{item.address}</Text>
            {!item.bonded && <Text style={{ color: "red" }}>Tap to Pair</Text>}
          </TouchableOpacity>
        )}
      />

      <Button title="Send Payment" onPress={sendPayment} />
    </View>
  );
}
