import { useAuth } from "@clerk/clerk-expo";
import {
  Redirect,
  RelativePathString,
  Slot,
  useRouter,
  useSegments,
} from "expo-router";
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import "@/global.css";
import {
  Bluetooth,
  BluetoothOff,
  CreditCard,
  Home,
  QrCode,
  SmartphoneNfc,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";

import { useAtom } from "jotai";
import RNBluetoothClassic from "react-native-bluetooth-classic";
import { indexActionSheet, intentAtom } from "../store/Atom";

export default function RootLayout() {
  const segments = useSegments();
  const [intent] = useAtom(intentAtom);
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [indexSheet, setindexActionSheet] = useAtom(indexActionSheet);
  const [bleEnabled, setBleEnabled] = useState<boolean | null>(null);
  const [showActivitySheet, setShowActivitySheet] = useState(false);

  const enableBluetooth = async () => {
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!enabled) {
        await RNBluetoothClassic.requestBluetoothEnabled();
      }
      const updated = await RNBluetoothClassic.isBluetoothEnabled();
      setBleEnabled(updated);
      Alert.alert(updated ? "Bluetooth Enabled" : "Bluetooth Disabled");
    } catch {
      Alert.alert("Failed to enable Bluetooth");
    }
  };

  useEffect(() => {
    RNBluetoothClassic.isBluetoothEnabled().then(setBleEnabled);
  }, []);

  if (!isSignedIn) {
    return <Redirect href="/(auth)/signin" />;
  }

  const navItems = [
    {
      name: "Home",
      icon: Home,
      route: "/(protected)",
      segments: ["(protected)"],
    },
    {
      name: "Activity",
      icon: SmartphoneNfc,
      isAction: true,
    },
    {
      name: "QR",
      icon: QrCode,
      route: "/(scan)",
      segments: ["(scan)"],
      isCenter: true,
    },
    {
      name: "Credit",
      icon: CreditCard,
      route: "/(protected)/credit-score",
      segments: ["(protected)", "credit-score"],
    },
    {
      name: "Profile",
      icon: User,
      route: "/(protected)/profile",
      segments: ["(protected)", "profile"],
    },
  ];

  const isActive = (target?: string[]) => {
    if (!target) return false;
    if (segments.length < target.length) return false;
    return target.every((seg, i) => segments[i] === seg);
  };

  return (
    <ImageBackground
      source={require("@/assets/screens/dashboard-bg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <View className="flex-1">
        {/* ================= CONTENT ================= */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 pt-6 pb-28">
            {/* Header */}
            <View className="flex-row justify-between items-center pb-4 border-b border-white/10">
              <Image
                source={require("@/assets/images/withoutbg.png")}
                className="w-10 h-10"
                resizeMode="contain"
              />

              <TouchableOpacity
                onPress={enableBluetooth}
                className={`p-2.5 rounded-full ${
                  bleEnabled ? "bg-[#001C71]" : "bg-[#99838395]"
                }`}
              >
                {bleEnabled ? (
                  <Bluetooth size={20} color="#86D2FF" />
                ) : (
                  <BluetoothOff size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            {/* Screens */}
            <Slot />
          </View>
        </ScrollView>

        {/* ================= BOTTOM NAV ================= */}
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-6">
          <View className="bg-[#86D2FF] rounded-3xl px-6 py-4">
            <View className="flex-row justify-around items-center">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.segments);

                /* -------- Center QR -------- */
                if (item.isCenter) {
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() =>
                        router.push(item.route as RelativePathString)
                      }
                      className="-mt-10"
                    >
                      <View className="w-16 h-16 rounded-full bg-[#001C71] items-center justify-center">
                        <Icon size={30} color="#86D2FF" />
                      </View>
                    </TouchableOpacity>
                  );
                }

                /* -------- Activity (Action Sheet) -------- */
                if (item.isAction) {
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setShowActivitySheet(true)}
                      className="items-center"
                    >
                      <Icon size={26} color="#001C71" strokeWidth={2} />
                    </TouchableOpacity>
                  );
                }

                /* -------- Normal Tabs -------- */
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      router.push(item.route as RelativePathString)
                    }
                    className="items-center"
                  >
                    <Icon
                      size={26}
                      color="#001C71"
                      strokeWidth={active ? 3 : 2}
                    />

                    {/* Active underline */}
                    <View
                      className={`mt-1 h-[3px] rounded-full ${
                        active ? "w-6 bg-[#001C71]" : "w-0"
                      }`}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ================= ACTIVITY SHEET ================= */}
        {showActivitySheet && (
          <View className="absolute inset-0 justify-end">
            {/* Overlay */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setShowActivitySheet(false)}
              className="absolute inset-0 bg-black/40"
            />

            {/* Sheet */}
            <View className="bg-[#ffffff] rounded-t-3xl px-6 py-5">
              <View className="items-center mb-4">
                <View className="w-10 h-1.5 bg-gray-600 rounded-full" />
              </View>

              <Text className="text-lg font-bold text-gray-900 mb-4">
                Wallet Actions
              </Text>

              {/* RECEIVE */}
              <TouchableOpacity
                onPress={() => {
                  setShowActivitySheet(false);
                  router.push("/(protected)/bluetooth/receive");
                }}
                className="border border-gray-200 rounded-2xl p-4 mb-3 flex-row items-center"
              >
                <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center">
                  <QrCode size={20} color="#2563EB" />
                </View>
                <View className="ml-4">
                  <Text className="font-semibold text-gray-900">
                    Receive Tokens
                  </Text>
                  <Text className="text-gray-500 text-sm">Via Bluetooth</Text>
                </View>
              </TouchableOpacity>

              {/* SEND */}
              <TouchableOpacity
                onPress={() => {
                  setShowActivitySheet(false);
                  router.push("/(protected)/bluetooth/send");
                }}
                className="border border-gray-200 rounded-2xl p-4 flex-row items-center"
              >
                <View className="w-10 h-10 bg-green-100 rounded-xl items-center justify-center">
                  <SmartphoneNfc size={20} color="#16A34A" />
                </View>
                <View className="ml-4">
                  <Text className="font-semibold text-gray-900">
                    Send Tokens
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Transfer Money via Bluetooth
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {indexSheet && (
          <View className="absolute inset-0 justify-end">
            {/* Overlay */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setindexActionSheet(false)}
              className="absolute inset-0 bg-black/40"
            />

            {/* Sheet */}
            <View className="bg-[#ffffff] rounded-t-3xl px-6 py-5">
              {/* Handle */}
              <View className="items-center mb-4">
                <View className="w-10 h-1.5 bg-gray-600 rounded-full" />
              </View>

              <Text className="text-lg font-bold text-gray-900 mb-4">
                Choose Transfer Method
              </Text>

              {/* ================= ORBITPAY ================= */}
              <TouchableOpacity
                onPress={() => {
                  // setRail("bluetooth");
                  setindexActionSheet(false);
                  router.push(
                    `/(protected)/bluetooth/${intent}` as RelativePathString
                  );
                }}
                className="border border-gray-200 rounded-2xl p-4 mb-3 flex-row items-center"
              >
                <View className="w-10 h-10 rounded-xl items-center justify-center">
                  <Image
                    source={require("@/assets/images/withoutbg.png")}
                    className="w-8 h-8"
                    resizeMode="contain"
                  />
                </View>

                <View className="ml-4">
                  <Text className="font-semibold text-gray-900">
                    Via OrbitPay
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Instant transfer using Bluetooth
                  </Text>
                </View>
              </TouchableOpacity>

              {/* ================= SOLANA ================= */}
              <TouchableOpacity
                onPress={() => {
                  setindexActionSheet(false);
                  router.push(
                    `/(protected)/blockchain/sol/${intent}` as RelativePathString
                  );
                }}
                className="border border-gray-200 rounded-2xl p-4 flex-row items-center"
              >
                <View className="w-10 h-10 rounded-xl items-center justify-center">
                  <Image
                    source={require("@/assets/images/logos/solana-sol-logo.png")}
                    className="w-8 h-8"
                    resizeMode="contain"
                  />
                </View>

                <View className="ml-4">
                  <Text className="font-semibold text-gray-900">
                    Via Solana
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    On-chain blockchain transfer
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}
