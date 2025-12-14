import { CheckCircle, Clock, Radio, Wallet } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Easing, Text, View } from "react-native";
import RNBluetoothClassic, {
  BluetoothDevice,
  BluetoothEventSubscription,
} from "react-native-bluetooth-classic";

export default function BluetoothServer() {
  const [, setServerSocketId] = useState<string | null>(null);
  const [connection, setConnection] = useState<BluetoothDevice | null>(null);
  const [receivedPayment, setReceivedPayment] = useState<any>(null);

  const [readSubscription, setReadSubscription] =
    useState<BluetoothEventSubscription | null>(null);

  // Animation values
  const spinValue1 = useRef(new Animated.Value(0)).current;
  const spinValue2 = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const glowValue = useRef(new Animated.Value(0)).current;

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
    } catch {}
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

  /** Start animations */
  useEffect(() => {
    // Orbiting animation 1 (clockwise)
    Animated.loop(
      Animated.timing(spinValue1, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Orbiting animation 2 (counter-clockwise)
    Animated.loop(
      Animated.timing(spinValue2, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation for core
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

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowValue, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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

  // Interpolate rotation values
  const spin1 = spinValue1.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const spin2 = spinValue2.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });

  const glowOpacity = glowValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.6],
  });

  return (
    <View className="flex-1 justify-center bg-[#100C08]">
      {/* ===== LOADING / WAITING STATE ===== */}
      {!connection && (
        <View className="items-center justify-center px-6">
          {/* Enhanced Orbital Loader */}
          <View className="relative w-48 h-48 items-center justify-center mb-12">
            {/* Outer Glow Ring */}
            <Animated.View
              style={{
                position: "absolute",
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: "#4710cb",
                opacity: glowOpacity,
              }}
            />

            {/* Main Orbit Ring */}
            <View className="absolute w-48 h-48 rounded-full border-2 border-[#4710cb]/40" />

            {/* Secondary Orbit Ring */}
            <View className="absolute w-40 h-40 rounded-full border border-[#c0f667]/20" />

            {/* Pulsing Core with Icon */}
            <Animated.View
              style={{
                transform: [{ scale: pulseValue }],
              }}
              className="w-12 h-12 rounded-full bg-[#4710cb] items-center justify-center shadow-2xl"
            >
              <Radio size={24} color="#c0f667" />
            </Animated.View>

            {/* Orbiting Dot 1 - Large Green */}
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                marginLeft: -10,
                transform: [{ rotate: spin1 }, { translateY: -96 }],
              }}
            >
              <View className="w-6 h-6 rounded-full bg-[#c0f667] shadow-2xl" />
            </Animated.View>

            {/* Orbiting Dot 2 - Medium White */}
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                marginLeft: -8,
                transform: [{ rotate: spin2 }, { translateY: -96 }],
              }}
            >
              <View className="w-5 h-5 rounded-full bg-[#f5f5f5] shadow-2xl" />
            </Animated.View>

            {/* Orbiting Dot 3 - Small Blue (on inner ring) */}
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                marginLeft: -6,
                transform: [
                  { rotate: spin1 },
                  { translateY: -80 },
                  { rotate: spin2 },
                ],
              }}
            >
              <View className="w-4 h-4 rounded-full bg-[#4710cb] shadow-xl" />
            </Animated.View>
          </View>

          {/* Status Text */}
          <View className="items-center mb-8">
            <Text className="text-[#f5f5f5] text-3xl font-bold text-center mb-3">
              Waiting for Payment
            </Text>
            <Text className="text-[#c0f667] text-base font-medium text-center">
              Listening for nearby devices...
            </Text>
          </View>

          {/* Info Cards */}
          <View className="w-full space-y-3">
            <View className="bg-[#f5f5f5]/5 border border-[#f5f5f5]/10 rounded-2xl p-4 flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#4710cb]/20 items-center justify-center mr-3">
                <Radio size={20} color="#c0f667" />
              </View>
              <View className="flex-1">
                <Text className="text-[#f5f5f5] text-sm font-semibold mb-1">
                  Bluetooth Server Active
                </Text>
                <Text className="text-[#f5f5f5]/60 text-xs">
                  Ready to accept connections
                </Text>
              </View>
            </View>

            <View className="bg-[#4710cb]/10 border border-[#4710cb]/20 rounded-2xl p-4 flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#c0f667]/20 items-center justify-center mr-3">
                <Wallet size={20} color="#c0f667" />
              </View>
              <View className="flex-1">
                <Text className="text-[#f5f5f5] text-sm font-semibold mb-1">
                  Secure Connection
                </Text>
                <Text className="text-[#f5f5f5]/60 text-xs">
                  End-to-end encrypted transfer
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* ===== CONNECTED STATE ===== */}
      {connection && (
        <View className="px-6">
          {/* Connection Success Card */}
          <View className="bg-[#4710cb] rounded-3xl p-6 mb-6 shadow-2xl border border-[#4710cb]/30">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-[#c0f667] items-center justify-center mr-3">
                  <CheckCircle size={20} color="#100C08" />
                </View>
                <Text className="text-[#f5f5f5] text-xs uppercase tracking-widest font-bold">
                  Connected
                </Text>
              </View>
              <View className="w-3 h-3 rounded-full bg-[#c0f667]" />
            </View>

            <Text className="text-[#c0f667] text-2xl font-bold mb-2">
              {connection.name ?? "Unknown Device"}
            </Text>

            <View className="bg-[#100C08]/20 rounded-xl p-3">
              <Text className="text-[#f5f5f5]/60 text-xs mb-1">
                Device Address
              </Text>
              <Text className="text-[#f5f5f5] text-sm font-mono">
                {connection.address}
              </Text>
            </View>
          </View>

          {/* Payment Received */}
          {receivedPayment && (
            <View className="bg-[#f5f5f5] rounded-3xl p-6 shadow-2xl">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-[#c0f667] items-center justify-center mr-3">
                    <CheckCircle size={20} color="#100C08" />
                  </View>
                  <Text className="text-[#100C08] text-xs uppercase tracking-widest font-bold">
                    Payment Received
                  </Text>
                </View>
                <View className="bg-[#c0f667] px-3 py-1.5 rounded-full">
                  <Text className="text-[#100C08] text-xs font-black">
                    SUCCESS
                  </Text>
                </View>
              </View>

              {/* Amount */}
              <Text className="text-[#4710cb] text-5xl font-black mb-6">
                PKR {receivedPayment.amount}
              </Text>

              {/* Details */}
              <View className="space-y-4 pt-4 border-t border-[#100C08]/10">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-[#4710cb]/10 items-center justify-center mr-3">
                    <Wallet size={16} color="#4710cb" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#100C08]/60 text-xs uppercase tracking-wide mb-1">
                      Sender
                    </Text>
                    <Text className="text-[#100C08] text-base font-bold">
                      {receivedPayment.sender}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-[#4710cb]/10 items-center justify-center mr-3">
                    <Clock size={16} color="#4710cb" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#100C08]/60 text-xs uppercase tracking-wide mb-1">
                      Time
                    </Text>
                    <Text className="text-[#100C08] text-sm font-semibold">
                      {new Date(receivedPayment.time).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
