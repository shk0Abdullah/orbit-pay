import { Slot } from "expo-router";
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

export default function RootLayout() {
  const [darkMode, setDarkMode] = useState(true);
  const [bleEnabled, setBleEnabled] = useState<null | boolean>(null);

  const enableBluetooth = async () => {
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      console.log("Enabled:", enabled);
      if (!enabled) {
        console.log("gonna wait for the await");
        await RNBluetoothClassic.requestBluetoothEnabled();
      }
      Alert.alert("Bluetooth Enabled");
    } catch  {
      Alert.alert("Enable the bluetooth");
    }
  };
  if (isSignedIn) {
    return (
      <SafeAreaView
        className={`flex-1 ${darkMode ? "bg-[#100C08]" : "bg-[#f5f5f5]"}`}
      >
        {/* Content wrapper keeps UI below status bar */}
        <View className="flex-1 px-4">
          {/* Layout */}
          <View className="flex-row justify-between items-center mb-3 pt-7 mt-6">
            <Text
              className={`${darkMode ? "text-[#f5f5f5]" : "text-[#100C08]"} text-xl font-semibold`}
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
