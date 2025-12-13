// app/index.tsx
import { SignOutButton } from "@/app/components/SignOutButton";
import { useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Home() {
  const { user } = useUser();
  const [darkMode, setDarkMode] = useState(true);

  return (
    <SafeAreaView
      className={`flex-1 ${darkMode ? "bg-[#100C08]" : "bg-[#f5f5f5]"}`}
    >
      {/* Content wrapper keeps UI below status bar */}
      <View className="flex-1 px-4">
        {/* Header */}
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
            <TouchableOpacity className="bg-[#4710cb] p-2 rounded-full">
              <View className="w-4 h-4 rounded-sm bg-[#f5f5f5]" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <View className="rounded-3xl p-6 mb-6 bg-[#4710cb] shadow-lg">
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

        {/* Actions */}
        <View className="gap-4">
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
    </SafeAreaView>
  );
}
