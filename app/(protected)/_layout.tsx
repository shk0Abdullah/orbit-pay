import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Slot, usePathname, useRouter } from "expo-router";
import {
  Bluetooth,
  BluetoothOff,
  CreditCard,
  Home,
  Moon,
  QrCode,
  Radio,
  SmartphoneNfc,
  Sun,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import RNBluetoothClassic from "react-native-bluetooth-classic";

import "../../global.css";

export default function RootLayout() {
  const [darkMode, setDarkMode] = useState(true);
  const [bleEnabled, setBleEnabled] = useState<null | boolean>(null);
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const enableBluetooth = async () => {
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      console.log("Enabled:", enabled);
      if (!enabled) {
        console.log("gonna wait for the await");
        await RNBluetoothClassic.requestBluetoothEnabled();
      }

      const updatedStatus = await RNBluetoothClassic.isBluetoothEnabled();
      console.log(updatedStatus);
      setBleEnabled(updatedStatus);

      Alert.alert(updatedStatus ? "Bluetooth Enabled" : "Bluetooth Disabled");
    } catch {
      Alert.alert("Failed to enable Bluetooth");
    }
  };

  useEffect(() => {
    const checkBluetooth = async () => {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      setBleEnabled(enabled);
    };

    checkBluetooth();
  }, []);

  if (!isSignedIn) {
    return <Redirect href="/(auth)/signin" />;
  }

  const navItems = [
    { name: "Home", icon: Home, route: "/(protected)" },
    { name: "Cards", icon: CreditCard, route: "/(app)/cards" },
    { name: "QR", icon: QrCode, route: "/(scan)/", isCenter: true },
    { name: "Activity", icon: SmartphoneNfc, route: "/(app)/activity" },
    { name: "Profile", icon: User, route: "/(protected)/profile" },
  ];

  const handleNavigation = (route: any) => {
    router.push(route);
  };

  const isActive = (route: string) => pathname === route;

  return (
    <View className={`flex-1 ${darkMode ? "bg-[#100C08]" : "bg-[#f5f5f5]"}`}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        className="flex-1"
      >
        <View className="flex-1 px-4 mt-4 pt-6 m-2 p-3 pb-24">
          {/* Enhanced Header */}
          <View className="flex-row justify-between items-center pt-4 pb-3 border-b border-[#f5f5f5]/10">
            {/* Logo & Brand */}
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-full bg-[#4710cb] items-center justify-center mr-2.5 shadow-lg">
                <Radio size={18} color="#c0f667" />
              </View>
              <View>
                <Text
                  className={`text-xl font-bold ${
                    darkMode ? "text-[#f5f5f5]" : "text-[#100C08]"
                  }`}
                >
                  OrbitPay
                </Text>
                <Text
                  className={`text-xs ${
                    darkMode ? "text-[#f5f5f5]/40" : "text-[#100C08]/40"
                  }`}
                >
                  Secure Payments
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row items-center gap-2">
              {/* Dark mode toggle */}
              <TouchableOpacity
                onPress={() => setDarkMode((prev) => !prev)}
                className={`p-2.5 rounded-full ${
                  darkMode ? "bg-[#f5f5f5]/10" : "bg-[#100C08]/10"
                }`}
              >
                {darkMode ? (
                  <Sun size={20} color="#c0f667" />
                ) : (
                  <Moon size={20} color="#4710cb" />
                )}
              </TouchableOpacity>

              {/* Bluetooth toggle */}
              <TouchableOpacity
                onPress={enableBluetooth}
                className={`p-2.5 rounded-full shadow-lg ${
                  bleEnabled ? "bg-[#4710cb]" : "bg-[#f5f5f5]/20"
                }`}
              >
                {bleEnabled ? (
                  <Bluetooth size={20} color="#c0f667" />
                ) : (
                  <BluetoothOff size={20} color="#f5f5f5" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Bluetooth Status Indicator */}
          {bleEnabled !== null && (
            <View className="py-2">
              <View className="flex-row items-center justify-center">
                <View
                  className={`w-2 h-2 rounded-full mr-2 ${
                    bleEnabled ? "bg-[#c0f667]" : "bg-[#4710cb]"
                  }`}
                />
                <Text
                  className={`text-xs ${
                    darkMode ? "text-[#f5f5f5]/60" : "text-[#100C08]/60"
                  }`}
                >
                  Bluetooth {bleEnabled ? "Connected" : "Disconnected"}
                </Text>
              </View>
            </View>
          )}

          {/* App content */}
          <View className="flex-1">
            <Slot />
          </View>
        </View>
      </ScrollView>

      {/* Custom Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8">
        <View
          className="bg-[#9c9c9c] rounded-3xl px-6 py-5"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 12,
          }}
        >
          <View className="flex-row justify-around items-center">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.route);

              if (item.isCenter) {
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleNavigation(item.route)}
                    className="items-center justify-center -mt-10"
                  >
                    <View
                      className={`w-16 h-16 rounded-full items-center justify-center shadow-lg ${
                        active ? "bg-[#4710cb]" : "bg-[#4710cb]/90"
                      }`}
                      style={{
                        shadowColor: "#4710cb",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 10,
                        elevation: 10,
                      }}
                    >
                      <Icon size={28} color="#c0f667" />
                    </View>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleNavigation(item.route)}
                  className="items-center justify-center py-1"
                >
                  <View className="items-center justify-center">
                    <Icon
                      size={26}
                      color="#4710cb"
                      fill={active ? "#4710cb" : "transparent"}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}
