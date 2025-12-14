import { Redirect, Slot } from "expo-router";
import { Bluetooth, BluetoothOff, Moon, Radio, Sun } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RNBluetoothClassic from "react-native-bluetooth-classic";
import "../../global.css";
import { useAuth } from "@clerk/clerk-expo";

export default function RootLayout() {
  const [darkMode, setDarkMode] = useState(true);
  const [bleEnabled, setBleEnabled] = useState<null | boolean>(null);
  const {isSignedIn}  = useAuth()

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

  if (!isSignedIn){
    return <Redirect href="/(auth)/signin"/>
  }

  return (
    <SafeAreaView
      className={`flex-1 ${darkMode ? "bg-[#100C08]" : "bg-[#f5f5f5]"}`}
    >
      <View className="flex-1 px-4 mt-4 pt-6 m-2 p-3">
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
                  bleEnabled ? "bg-[#c0f667]" : "bg-red-500"
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
    </SafeAreaView>
  );
}
