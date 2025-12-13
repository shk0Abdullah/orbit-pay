// app/index.tsx
import { SignOutButton } from "@/app/components/SignOutButton";
import { useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
// import { Bluetooth } from "lucide-react-native";
import { useState } from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const { user } = useUser();
  const [darkMode, setDarkMode] = useState(true);

  return (
    <View className={`flex-1 ${darkMode ? "bg-[#100C08]" : "bg-[#f5f5f5]"}`}>
      {/* Safe padding wrapper */}
      <View className="px-4 pt-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
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

            {/* Bluetooth icon button */}
            <TouchableOpacity className="bg-[#4710cb] p-2 rounded-full">
              {/* <Bluetooth color="#f5f5f5" size={18} /> */}
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card (glass / real wallet style) */}
        <View className="rounded-3xl p-6 mb-6 bg-gradient-to-br from-[#4710cb] to-[#2e0aa3] shadow-lg">
          <Text className="text-[#f5f5f5] text-xs uppercase tracking-widest">
            Wallet Balance
          </Text>
          <Text className="text-[#c0f667] text-4xl font-extrabold mt-2">
            PKR 12,450
          </Text>
          <View className="mt-4">
            <Text className="text-[#f5f5f5] text-xs opacity-80">Account</Text>
            <Text className="text-[#f5f5f5] text-sm">
              {user?.emailAddresses[0].emailAddress}
            </Text>
          </View>
        </View>

        {/* Action Widgets */}
        <View className="gap-4">
          {/* Send */}
          <Link href="/(protected)/bluetooth/client">
            <View className="rounded-2xl p-5 bg-[#f5f5f5] shadow">
              <Text className="text-[#100C08] text-lg font-semibold">
                Send Payment
              </Text>
              <Text className="text-gray-600 mt-1">
                Bluetooth transfer to nearby device
              </Text>
            </View>
          </Link>

          {/* Receive */}
          <Link href="/(protected)/bluetooth/server">
            <View className="rounded-2xl p-5 bg-[#f5f5f5] shadow">
              <Text className="text-[#100C08] text-lg font-semibold">
                Receive Payment
              </Text>
              <Text className="text-gray-600 mt-1">
                Accept money via Bluetooth
              </Text>
            </View>
          </Link>
        </View>

        {/* Footer */}
        <View className="mt-8">
          <SignOutButton />
        </View>
      </View>
    </View>
  );
}
