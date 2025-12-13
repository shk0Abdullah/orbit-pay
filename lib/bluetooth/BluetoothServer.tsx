import React, { useEffect, useState } from "react";
import { Alert, Button, Text, View } from "react-native";
import RNBluetoothClassic, {
  BluetoothDevice,
  BluetoothEventSubscription,
} from "react-native-bluetooth-classic";

// const SPP_UUID = "00001101-0000-1000-8000-00805F9B34FB";

export default function BluetoothServer() {
  const [, setServerSocketId] = useState<string | null>(null);
  const [connection, setConnection] = useState<BluetoothDevice | null>(null);
  const [receivedPayment, setReceivedPayment] = useState<any>(null);

  const [readSubscription, setReadSubscription] =
    useState<BluetoothEventSubscription | null>(null);

  /** STEP 1: Enable Bluetooth */
  const enableBluetooth = async () => {
    const enabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (!enabled) {
      await RNBluetoothClassic.requestBluetoothEnabled();
    }
  };

  /** STEP 2: Start Server / Accept Connection */
  const startServer = async () => {
    try {
      console.log("Don't Click Again MF I am started");
      const server = await RNBluetoothClassic.accept({});

      setServerSocketId(server.id);
      setConnection(server);

      Alert.alert("Client Connected!");
      listenForMessages(server);
    } catch (e) {
      console.error("ACCEPT ERROR", e);
      Alert.alert("Error starting server");
    }
  };

  /** STEP 3: Listen for incoming data */
  const listenForMessages = (device: BluetoothDevice) => {
    if (!device) {
      console.log("I am not listening");
      return;
    }

    const sub = RNBluetoothClassic.onDeviceRead(device.id, async (event) => {
      try {
        console.log("RAW DATA:", event.data);

        const json = JSON.parse(event.data);
        console.log("PARSED:", json);

        setReceivedPayment(json);
      } catch (err) {
        console.log("JSON PARSE ERROR:", err);
      }
    });
    console.log("Sir I am sub", sub);
    setReadSubscription(sub);
  };

  /** Clean up */
  useEffect(() => {
    return () => {
      readSubscription?.remove();
    };
  }, [readSubscription]);
  useEffect(() => {
    enableBluetooth();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>SERVER DEVICE</Text>

      {/* <Button title="Enable Bluetooth" onPress={enableBluetooth} /> */}
      <Button title="Start Server (Accept)" onPress={startServer} />

      {receivedPayment && (
        <View style={{ marginTop: 20 }}>
          <Text>Received Payment:</Text>
          <Text>{JSON.stringify(receivedPayment, null, 2)}</Text>
        </View>
      )}
      {connection && (
        <Text>Connected Device: {connection.name ?? connection.id}</Text>
      )}
    </View>
  );
}
