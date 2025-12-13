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
import "../../global.css";

export default function RootLayout() {
  const [darkMode, setDarkMode] = useState(true);
  const [bleEnabled, setBleEnabled] = useState<null | boolean>(null);
  // const { isSignedIn } = useAuth();
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
  return (
    <SafeAreaView
      className={`flex-1 ${darkMode ? "bg-[#100C08]" : "bg-[#f5f5f5]"}`}
    >
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-3 pt-7 mt-6">
          <Text
            className={`text-xl font-semibold ${
              darkMode ? "text-[#f5f5f5]" : "text-[#100C08]"
            }`}
          >
            Orbit Pay
          </Text>

          <View className="flex-row items-center gap-4">
            {/* Dark mode toggle icon */}
            <TouchableOpacity
              onPress={() => setDarkMode((prev) => !prev)}
              className="p-2 rounded-full"
            >
              {darkMode ? (
                <Sun size={22} color="#c0f667" />
              ) : (
                <Moon size={22} color="#4710cb" />
              )}
            </TouchableOpacity>

            {/* Bluetooth toggle icon */}
            <TouchableOpacity
              onPress={enableBluetooth}
              className="bg-[#4710cb] p-2 rounded-full"
            >
              {bleEnabled ? (
                <Bluetooth size={20} color="#f5f5f5" />
              ) : (
                <BluetoothOff size={20} color="#f5f5f5" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* App content */}
        <Slot />
      </View>
    </SafeAreaView>
  );
}
