// import { Stack } from "expo-router";
// export default function RootLayout() {
//   return <Stack />;
// }
import { Slot } from "expo-router";
import { useState } from "react";

import {
  Alert,
  SafeAreaView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RNBluetoothClassic from "react-native-bluetooth-classic";
import "../../global.css";

export default function RootLayout() {
  const [darkMode, setDarkMode] = useState(true);
  // const { isSignedIn } = useAuth();
  const enableBluetooth = async () => {
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!enabled) {
        await RNBluetoothClassic.requestBluetoothEnabled();
      }
      Alert.alert("Bluetooth Enabled");
    } catch {
      Alert.alert("Enable the bluetooth");
    }
  };
  // if (!isSignedIn) {
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
            Orbit Pay
          </Text>

          <View className="flex-row items-center gap-3">
            {/* Dark mode toggle */}
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              thumbColor={darkMode ? "#c0f667" : "#4710cb"}
            />

            {/* Bluetooth icon button placeholder */}
            <TouchableOpacity
              onPress={enableBluetooth}
              className="bg-[#4710cb] p-2 rounded-full"
            >
              <View className="w-4 h-4 rounded-sm bg-[#f5f5f5]" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Slot of the app */}
        <Slot />
      </View>
    </SafeAreaView>
  );
}
// return <Redirect href={"/(auth)/signin"} />;
// }
