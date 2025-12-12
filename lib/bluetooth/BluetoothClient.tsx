import React, { useState } from "react";
import { Button, FlatList, Text, TouchableOpacity, View } from "react-native";
import RNBluetoothClassic, {
  BluetoothDevice,
} from "react-native-bluetooth-classic";

// const SPP_UUID = "00001101-0000-1000-8000-00805F9B34FB";

export default function BluetoothClient() {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] =
    useState<BluetoothDevice | null>(null);

  const enableBluetooth = async () => {
    const enabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (!enabled) {
      await RNBluetoothClassic.requestBluetoothEnabled();
    }
  };

  /** STEP 1: Scan paired devices */
  const scanDevices = async () => {
    const paired = await RNBluetoothClassic.getBondedDevices();
    setDevices(paired);
  };

  /** STEP 2: Connect to selected device */
  const connectTo = async (device: BluetoothDevice) => {
    try {
      // First create connection instance
      console.log(device);
      const d = await RNBluetoothClassic.connectToDevice(device.address);
      console.log(d);
      // Then open RFCOMM socket (THIS WAS MISSING)
      await d.connect();

      setConnectedDevice(d);
      alert("Connected to Server");
    } catch (e) {
      console.error("CONNECT ERROR", e);
      alert("Connection Failed");
    }
  };

  /** STEP 3: Send JSON */
  const sendPayment = async () => {
    if (!connectedDevice) return alert("Not connected");

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

      alert("Payment Sent!");
      console.log("Sended from Client", msg);
    } catch (err) {
      console.error("WRITE ERROR", err);
      alert("Send Failed");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>CLIENT DEVICE</Text>

      <Button title="Enable Bluetooth" onPress={enableBluetooth} />
      <Button title="Scan Paired Devices" onPress={scanDevices} />

      <FlatList
        data={devices}
        keyExtractor={(item) => item.address}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => connectTo(item)}
            style={{ padding: 10, backgroundColor: "#eee", marginVertical: 5 }}
          >
            <Text>{item.name}</Text>
            <Text>{item.address}</Text>
          </TouchableOpacity>
        )}
      />

      <Button title="Send Payment" onPress={sendPayment} />
    </View>
  );
}
