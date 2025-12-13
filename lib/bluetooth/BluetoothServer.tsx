// import React, { useEffect, useState } from "react";
// import { Alert, Text, View } from "react-native";
// import RNBluetoothClassic, {
//   BluetoothDevice,
//   BluetoothEventSubscription,
// } from "react-native-bluetooth-classic";

// // const SPP_UUID = "00001101-0000-1000-8000-00805F9B34FB";

// export default function BluetoothServer() {
//   const [, setServerSocketId] = useState<string | null>(null);
//   const [connection, setConnection] = useState<BluetoothDevice | null>(null);
//   const [receivedPayment, setReceivedPayment] = useState<any>(null);

//   const [readSubscription, setReadSubscription] =
//     useState<BluetoothEventSubscription | null>(null);

//   /** STEP 1: Enable Bluetooth */
//   const enableBluetooth = async () => {
//     const enabled = await RNBluetoothClassic.isBluetoothEnabled();
//     if (!enabled) {
//       await RNBluetoothClassic.requestBluetoothEnabled();
//     }
//   };

//   /** STEP 2: Start Server / Accept Connection */
//   const startServer = async () => {
//     try {
//       console.log("Don't Click Again MF I am started");
//       const server = await RNBluetoothClassic.accept({});

//       setServerSocketId(server.id);
//       setConnection(server);

//       Alert.alert("Client Connected!");
//       listenForMessages(server);
//     } catch (e) {
//       console.error("ACCEPT ERROR", e);
//       Alert.alert("Error starting server");
//     }
//   };

//   /** STEP 3: Listen for incoming data */
//   const listenForMessages = (device: BluetoothDevice) => {
//     if (!device) {
//       console.log("I am not listening");
//       return;
//     }

//     const sub = RNBluetoothClassic.onDeviceRead(device.id, async (event) => {
//       try {
//         console.log("RAW DATA:", event.data);

//         const json = JSON.parse(event.data);
//         console.log("PARSED:", json);

//         setReceivedPayment(json);
//       } catch (err) {
//         console.log("JSON PARSE ERROR:", err);
//       }
//     });
//     console.log("Sir I am sub", sub);
//     setReadSubscription(sub);
//   };

//   /** Clean up */
//   useEffect(() => {
//     return () => {
//       readSubscription?.remove();
//     };
//   }, [readSubscription]);
//   useEffect(() => {
//     enableBluetooth();
//     startServer();
//   }, []);

//   return (
//     <View className="flex-1 px-6 justify-center">
//       {/* ===== LOADING / WAITING STATE ===== */}
//       {!connection && (
//         <View className="items-center justify-center">
//           {/* Orbital Loader */}
//           <View className="relative w-32 h-32 items-center justify-center">
//             {/* Core */}
//             <View className="w-6 h-6 rounded-full bg-[#4710cb]" />

//             {/* Orbit Ring */}
//             <View className="absolute w-32 h-32 rounded-full border border-[#4710cb]/40" />

//             {/* Orbiting Dot 1 */}
//             <View className="absolute top-0 left-1/2 -ml-2 w-4 h-4 rounded-full bg-[#c0f667] animate-spin-slow origin-[0px_64px]" />

//             {/* Orbiting Dot 2 */}
//             <View className="absolute bottom-0 left-1/2 -ml-2 w-3 h-3 rounded-full bg-[#f5f5f5] animate-spin-reverse origin-[0px_-64px]" />
//           </View>

//           <Text className="text-[#f5f5f5] text-lg font-semibold mt-8">
//             Waiting for payment…
//           </Text>

//           <Text className="text-[#f5f5f5]/60 text-sm mt-2 text-center">
//             OrbitPay is securely listening for nearby devices
//           </Text>
//         </View>
//       )}

//       {/* ===== CONNECTED STATE ===== */}
//       {connection && (
//         <View className="mt-6">
//           {/* Connection Card */}
//           <View className="bg-[#4710cb] rounded-3xl p-6 shadow-xl">
//             <Text className="text-[#f5f5f5] text-xs uppercase tracking-widest">
//               Connected Device
//             </Text>

//             <Text className="text-[#c0f667] text-xl font-bold mt-2">
//               {connection.name ?? "Unknown Device"}
//             </Text>

//             <Text className="text-[#f5f5f5]/80 text-sm mt-1">
//               MAC: {connection.address}
//             </Text>
//           </View>

//           {/* Payment Received */}
//           {receivedPayment && (
//             <View className="mt-6 bg-[#f5f5f5] rounded-3xl p-6">
//               <Text className="text-[#100C08] text-xs uppercase tracking-widest">
//                 Payment Received
//               </Text>

//               <Text className="text-[#4710cb] text-3xl font-extrabold mt-2">
//                 PKR {receivedPayment.amount}
//               </Text>

//               <View className="mt-4 space-y-1">
//                 <Text className="text-[#100C08] text-sm">
//                   Sender: {receivedPayment.sender}
//                 </Text>
//                 <Text className="text-[#100C08]/60 text-xs">
//                   {new Date(receivedPayment.time).toLocaleString()}
//                 </Text>
//               </View>
//             </View>
//           )}
//         </View>
//       )}
//     </View>
//   );
// }

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
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
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

  return (
    <View className="flex-1 px-6 justify-center bg-[#100C08]">
      {/* ===== LOADING / WAITING STATE ===== */}
      {!connection && (
        <View className="items-center justify-center">
          {/* Orbital Loader */}
          <View className="relative w-40 h-40 items-center justify-center mb-8">
            {/* Pulse Core */}
            <Animated.View
              style={{
                transform: [{ scale: pulseValue }],
              }}
              className="w-8 h-8 rounded-full bg-[#4710cb] shadow-lg"
            />

            {/* Orbit Ring */}
            <View className="absolute w-40 h-40 rounded-full border-2 border-[#4710cb]/30" />

            {/* Orbiting Dot 1 - Green */}
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                marginLeft: -8,
                transform: [{ rotate: spin1 }, { translateY: -80 }],
              }}
            >
              <View className="w-5 h-5 rounded-full bg-[#c0f667] shadow-lg" />
            </Animated.View>

            {/* Orbiting Dot 2 - White */}
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                marginLeft: -6,
                transform: [{ rotate: spin2 }, { translateY: -80 }],
              }}
            >
              <View className="w-4 h-4 rounded-full bg-[#f5f5f5] shadow-lg" />
            </Animated.View>
          </View>

          <Text className="text-[#f5f5f5] text-2xl font-bold text-center">
            Waiting for payment…
          </Text>

          <Text className="text-[#f5f5f5]/60 text-base mt-3 text-center px-8">
            OrbitPay is securely listening for nearby devices
          </Text>

          <View className="mt-8 px-8">
            <View className="flex-row items-center justify-center space-x-2">
              <View className="w-2 h-2 rounded-full bg-[#4710cb]" />
              <Text className="text-[#f5f5f5]/40 text-sm">
                Bluetooth Server Active
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* ===== CONNECTED STATE ===== */}
      {connection && (
        <View className="mt-6">
          {/* Connection Card */}
          <View className="bg-[#4710cb] rounded-3xl p-6 shadow-2xl">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[#f5f5f5] text-xs uppercase tracking-widest font-semibold">
                Connected Device
              </Text>
              <View className="w-3 h-3 rounded-full bg-[#c0f667]" />
            </View>

            <Text className="text-[#c0f667] text-2xl font-bold mt-1">
              {connection.name ?? "Unknown Device"}
            </Text>

            <Text className="text-[#f5f5f5]/70 text-sm mt-2">
              {connection.address}
            </Text>
          </View>

          {/* Payment Received */}
          {receivedPayment && (
            <View className="mt-6 bg-[#f5f5f5] rounded-3xl p-6 shadow-2xl">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[#100C08] text-xs uppercase tracking-widest font-semibold">
                  Payment Received
                </Text>
                <View className="bg-[#c0f667] px-3 py-1 rounded-full">
                  <Text className="text-[#100C08] text-xs font-bold">
                    SUCCESS
                  </Text>
                </View>
              </View>

              <Text className="text-[#4710cb] text-4xl font-extrabold mt-2">
                PKR {receivedPayment.amount}
              </Text>

              <View className="mt-6 pt-4 border-t border-[#100C08]/10">
                <View className="mb-3">
                  <Text className="text-[#100C08]/60 text-xs uppercase tracking-wide mb-1">
                    Sender
                  </Text>
                  <Text className="text-[#100C08] text-base font-semibold">
                    {receivedPayment.sender}
                  </Text>
                </View>

                <View>
                  <Text className="text-[#100C08]/60 text-xs uppercase tracking-wide mb-1">
                    Time
                  </Text>
                  <Text className="text-[#100C08] text-sm">
                    {new Date(receivedPayment.time).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
