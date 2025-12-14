import { Slot } from "expo-router";
import { Bluetooth, BluetoothOff, Moon, Sun } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RNBluetoothClassic from "react-native-bluetooth-classic";
import { useAuth } from "@clerk/clerk-expo";
import "../../global.css";

export default function RootLayout() {
  const { isSignedIn } = useAuth();

  const [darkMode, setDarkMode] = useState(true);
  const [bleEnabled, setBleEnabled] = useState<boolean | null>(null);

  // Sync bluetooth status
  useEffect(() => {
    (async () => {
      try {
        const enabled = await RNBluetoothClassic.isBluetoothEnabled();
        setBleEnabled(enabled);
      } catch {
        setBleEnabled(false);
      }
    })();
  }, []);

  const enableBluetooth = async () => {
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!enabled) {
        await RNBluetoothClassic.requestBluetoothEnabled();
        setBleEnabled(true);
      } else {
        setBleEnabled(true);
      }
    } catch {
      Alert.alert("Bluetooth Error", "Unable to enable Bluetooth");
    }
  };

  if (!isSignedIn) {
    return <Slot />;
  }

  return (
    <SafeAreaView
      className={`flex-1 ${darkMode ? "bg-[#100C08]" : "bg-[#f5f5f5]"}`}
    >
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-3 pt-7 mt-6">
          {/* Theme toggle */}
          <TouchableOpacity onPress={() => setDarkMode(!darkMode)}>
            {darkMode ? (
              <Sun size={22} color="#c0f667" />
            ) : (
              <Moon size={22} color="#4710cb" />
            )}
          </TouchableOpacity>

          {/* Bluetooth toggle */}
          <TouchableOpacity
            onPress={enableBluetooth}
            className={`p-2.5 rounded-full ${
              bleEnabled ? "bg-[#4710cb]" : "bg-[#ffffff30]"
            }`}
          >
            {bleEnabled ? (
              <Bluetooth size={20} color="#c0f667" />
            ) : (
              <BluetoothOff size={20} color="#f5f5f5" />
            )}
          </TouchableOpacity>
        </View>

        {/* Bluetooth status */}
        {bleEnabled !== null && (
          <View className="items-center mb-2">
            <View className="flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full mr-2 ${
                  bleEnabled ? "bg-[#c0f667]" : "bg-red-500"
                }`}
              />
              <Text
                className={`text-xs ${
                  darkMode ? "text-white/60" : "text-black/60"
                }`}
              >
                Bluetooth {bleEnabled ? "Enabled" : "Disabled"}
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
