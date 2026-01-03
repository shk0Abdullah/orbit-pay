/* eslint-disable react-hooks/exhaustive-deps */

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Bluetooth, CheckCircle, Radio } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Text, View } from "react-native";
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

  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id ?? "",
  });

  const receiverWallet = useQuery(
    api.wallets.getWalletByClerkId,
    convexUser?._id ? { userID: convexUser._id } : "skip"
  );

  const acceptingRef = useRef(false);
  const connectedRef = useRef(false);

  /* ==========  NEW  ––  deduplication flag  ========== */
  const handledRef = useRef(false);

  /* ---------- animations – always declared ---------- */
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  /* ---------- helpers ---------- */
  const enableBluetooth = async () => {
    const enabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (!enabled) await RNBluetoothClassic.requestBluetoothEnabled();
  };

  const cleanup = async (device?: BluetoothDevice) => {
    try {
      readSubscription?.remove();
      setReadSubscription(null);
      if (device) await RNBluetoothClassic.disconnectFromDevice(device.id);
    } catch {
      /* ignore */
    } finally {
      connectedRef.current = false;
      setConnection(null);
    }
  };

  /* ---------- bluetooth server ---------- */
  const startServer = async () => {
    if (acceptingRef.current || connectedRef.current) return;
    try {
      acceptingRef.current = true;
      const device = await RNBluetoothClassic.accept({});
      acceptingRef.current = false;
      connectedRef.current = true;

      setConnection(device);
      await Promise.resolve(); // <-- NEW – flush React setState
      listenForMessages(device);
    } catch (err) {
      acceptingRef.current = false;
      console.log("SERVER ACCEPT ERROR:", err);
    }
  };

  /* ---------- message handler ---------- */
  const listenForMessages = (device: BluetoothDevice) => {
    const sub = RNBluetoothClassic.onDeviceRead(device.id, async (event) => {
      try {
        const json = JSON.parse(event.data);

        /* ==========  NEW  ––  skip duplicates  ========== */
        if (handledRef.current) return;
        handledRef.current = true;

        setReceivedPayment(json);
        if (!user) return;

        if (receiverWallet) {
          await createBluetoothPayment({
            senderClerkId: json.senderClerkId ?? json.fromPubkey, // fallback
            receiverClerkId: user.id,
            amount: json.amount,
            bluetoothDeviceAddress: device.address,
            bluetoothDeviceName: device.name ?? undefined,
          });
          const ack = {
            type: "PAYMENT_ACK",
            toPubkey: receiverWallet,
            accepted: true,
          };
          await RNBluetoothClassic.writeToDevice(
            device.id,
            JSON.stringify(ack) + "\n"
          );
          await new Promise((res) => setTimeout(res, 500));
          await cleanup(device);
          router.canGoBack() ? router.back() : router.replace("/(protected)");
        }
      } catch (e) {
        handledRef.current = false; // allow retry on real error
        console.log("SERVER MESSAGE ERROR:", e);
      }
    });
    setReadSubscription(sub);
  };

  /* ---------- effects ---------- */
  useEffect(() => {
    if (!convexUser || !receiverWallet) return;

    enableBluetooth().then(() => startServer());

    return () => {
      cleanup(connection ?? undefined);
    };
  }, [convexUser, receiverWallet]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.3,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* ---------- loading guard ---------- */
  if (!convexUser || !receiverWallet) {
    return (
      <View className="flex-1 justify-center items-center bg-[#0B1E5B]">
        <Text className="text-white">Preparing server…</Text>
      </View>
    );
  }

  /* ---------- render ---------- */
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View className="flex-1 justify-center mt-40">
      {!connection && (
        <View className="items-center">
          <Animated.View
            style={{ transform: [{ rotate: spin }, { scale: pulseValue }] }}
          >
            <Radio size={48} color="#4A90E2" />
          </Animated.View>
          <Text className="text-white font-bold pt-10 text-lg">
            Waiting for Connection....
          </Text>
        </View>
      )}

      {connection && (
        <View className="px-6 mt-8">
          <View className="bg-[#0B1E5B] border border-[#4A90E2]/30 rounded-2xl p-5 mb-6">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#4A90E2]/20 items-center justify-center mr-4">
                <Bluetooth size={18} color="#4A90E2" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-sm font-semibold">
                  Device Connected
                </Text>
                <Text className="text-[#86D2FF] text-base font-bold">
                  {connection.name ?? "Unknown Device"}
                </Text>
                <Text className="text-white/60 text-sm font-bold">
                  {connection.address}
                </Text>
              </View>
              <View className="px-3 py-1 rounded-full bg-[#86D2FF]/20">
                <Text className="text-[#86D2FF] text-xs font-semibold">
                  Connected
                </Text>
              </View>
            </View>
          </View>

          {!receivedPayment && (
            <View className="bg-[#1A459D]/20 border pb-10 border-[#1A459D]/40 rounded-3xl p-8 items-center">
              <View className="w-16 h-16 rounded-full bg-[#4A90E2]/20 items-center justify-center mb-4">
                <Image
                  source={require("@/assets/images/withoutbg.png")}
                  className="w-20 h-20"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-white text-xl font-bold mb-2">
                Waiting for Payment
              </Text>
              <Text className="text-white/60 text-sm text-center">
                Ask the sender to confirm the payment on their device.
              </Text>
            </View>
          )}

          {receivedPayment && (
            <View className="bg-white rounded-3xl p-6 shadow-xl items-center">
              <View className="w-20 h-20 rounded-full bg-[#86D2FF]/20 items-center justify-center mb-4">
                <CheckCircle size={44} color="#4A90E2" strokeWidth={2.5} />
              </View>
              <Text className="text-[#0B1E5B] text-2xl font-extrabold mb-2">
                Payment Received
              </Text>
              <Text className="text-[#4A90E2] text-4xl font-black mb-4">
                PKR {receivedPayment.amount}
              </Text>
              <View className="h-px bg-[#0B1E5B]/10 w-full mb-4" />
              <Text className="text-[#0B1E5B]/60 text-sm">
                Received via Bluetooth
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
