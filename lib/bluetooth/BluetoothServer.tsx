import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { Radio } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";
import RNBluetoothClassic, {
  BluetoothDevice,
  BluetoothEventSubscription,
} from "react-native-bluetooth-classic";

export default function BluetoothServer() {
  const { user } = useUser();
  const router = useRouter();

  const [connection, setConnection] = useState<BluetoothDevice | null>(null);
  const [receivedPayment, setReceivedPayment] = useState<any>(null);
  const [readSubscription, setReadSubscription] =
    useState<BluetoothEventSubscription | null>(null);

  const createBluetoothPayment = useMutation(
    api.payments.createBluetoothPayment
  );

  /** 🔒 SERVER STATE LOCKS (CRITICAL) */
  const acceptingRef = useRef(false);
  const connectedRef = useRef(false);

  /** Enable Bluetooth */
  const enableBluetooth = async () => {
    const enabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (!enabled) {
      await RNBluetoothClassic.requestBluetoothEnabled();
    }
  };

  /** START SERVER (SAFE) */
  const startServer = async () => {
    if (acceptingRef.current || connectedRef.current) {
      console.log("SERVER: already accepting or connected");
      return;
    }

    try {
      acceptingRef.current = true;
      console.log("SERVER: waiting for connection...");

      const device = await RNBluetoothClassic.accept({});

      acceptingRef.current = false;
      connectedRef.current = true;

      console.log("SERVER: client connected", device.address);

      setConnection(device);
      listenForMessages(device);
    } catch (err) {
      acceptingRef.current = false;
      console.log("SERVER ACCEPT ERROR:", err);
    }
  };

  /** LISTEN FOR DATA */
  const listenForMessages = (device: BluetoothDevice) => {
    const sub = RNBluetoothClassic.onDeviceRead(device.id, async (event) => {
      try {
        console.log("SERVER RAW:", event.data);

        const json = JSON.parse(event.data);
        setReceivedPayment(json);

        if (!user) return;

        await createBluetoothPayment({
          senderClerkId: json.senderClerkId,
          receiverClerkId: user.id,
          amount: json.amount,
          bluetoothDeviceAddress: device.address,
          bluetoothDeviceName: device.name ?? undefined,
        });

        console.log("SERVER: payment saved");

        /** ⏱️ graceful disconnect AFTER payment */
        setTimeout(async () => {
          await cleanup(device);

          if (router.canGoBack()) router.back();
          else router.replace("/(protected)");
        }, 3000);
      } catch (err) {
        console.log("SERVER JSON ERROR:", err);
      }
    });

    setReadSubscription(sub);
  };

  /** CLEANUP */
  const cleanup = async (device?: BluetoothDevice) => {
    try {
      readSubscription?.remove();
      setReadSubscription(null);

      if (device) {
        await RNBluetoothClassic.disconnectFromDevice(device.id);
        console.log("SERVER: disconnected");
      }
    } catch (err) {
      console.log("SERVER CLEANUP ERROR:", err);
    } finally {
      connectedRef.current = false;
      setConnection(null);
    }
  };

  /** INIT */
  useEffect(() => {
    enableBluetooth();
    startServer();

    return () => {
      cleanup(connection ?? undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= UI (UNCHANGED) ================= */

  const spinValue1 = useRef(new Animated.Value(0)).current;
  const spinValue2 = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue1, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(spinValue2, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin1 = spinValue1.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const spin2 = spinValue2.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });

  return (
    <View className="flex-1 justify-center bg-[#100C08]">
      {!connection && (
        <View className="items-center">
          <Animated.View
            style={{ transform: [{ rotate: spin1 }, { scale: pulseValue }] }}
          >
            <Radio size={48} color="#c0f667" />
          </Animated.View>
          <Text className="text-white mt-6 text-lg">Waiting for payment…</Text>
        </View>
      )}

      {connection && (
        <View className="px-6">
          <Text className="text-[#c0f667] text-xl font-bold mb-4">
            Connected: {connection.name ?? "Unknown"}
          </Text>

          {receivedPayment && (
            <View className="bg-white p-6 rounded-2xl">
              <Text className="text-4xl font-black text-[#4710cb]">
                PKR {receivedPayment.amount}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
