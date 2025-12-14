import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
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
    } catch {
      console.log("There's something fishy");
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
    startServer();
  }, []);

  return (
    <View className="flex-1 px-6 justify-center">
      {/* ===== LOADING / WAITING STATE ===== */}
      {!connection && (
        <View className="items-center justify-center">
          {/* Orbital Loader */}
          <View className="relative w-32 h-32 items-center justify-center">
            {/* Core */}
            <View className="w-6 h-6 rounded-full bg-[#4710cb]" />

            {/* Orbit Ring */}
            <View className="absolute w-32 h-32 rounded-full border border-[#4710cb]/40" />

            {/* Orbiting Dot 1 */}
            <View className="absolute top-0 left-1/2 -ml-2 w-4 h-4 rounded-full bg-[#c0f667] animate-spin-slow origin-[0px_64px]" />

            {/* Orbiting Dot 2 */}
            <View className="absolute bottom-0 left-1/2 -ml-2 w-3 h-3 rounded-full bg-[#f5f5f5] animate-spin-reverse origin-[0px_-64px]" />
          </View>

          <Text className="text-[#f5f5f5] text-lg font-semibold mt-8">
            Waiting for payment…
          </Text>

          <Text className="text-[#f5f5f5]/60 text-sm mt-2 text-center">
            OrbitPay is securely listening for nearby devices
          </Text>
        </View>
      )}

      {/* ===== CONNECTED STATE ===== */}
      {connection && (
        <View className="mt-6">
          {/* Connection Card */}
          <View className="bg-[#4710cb] rounded-3xl p-6 shadow-xl">
            <Text className="text-[#f5f5f5] text-xs uppercase tracking-widest">
              Connected Device
            </Text>

            <Text className="text-[#c0f667] text-xl font-bold mt-2">
              {connection.name ?? "Unknown Device"}
            </Text>

            <Text className="text-[#f5f5f5]/80 text-sm mt-1">
              MAC: {connection.address}
            </Text>
          </View>

          {/* Payment Received */}
          {receivedPayment && (
            <View className="mt-6 bg-[#f5f5f5] rounded-3xl p-6">
              <Text className="text-[#100C08] text-xs uppercase tracking-widest">
                Payment Received
              </Text>

              <Text className="text-[#4710cb] text-3xl font-extrabold mt-2">
                PKR {receivedPayment.amount}
              </Text>

              <View className="mt-4 space-y-1">
                <Text className="text-[#100C08] text-sm">
                  Sender: {receivedPayment.sender}
                </Text>
                <Text className="text-[#100C08]/60 text-xs">
                  {new Date(receivedPayment.time).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
