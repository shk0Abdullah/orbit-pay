import { walletAtom } from "@/app/store/Atom";
import { useAuth, useUser } from "@clerk/clerk-expo";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import { useAtom } from "jotai";
import { Copy, Lock, LogOut, Trash2 } from "lucide-react-native";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const { signOut } = useAuth();
  const { user } = useUser();

  const email = user?.primaryEmailAddress?.emailAddress;
  const avatar = user?.imageUrl;

  // stored from your wallet creation flow
  const walletObj = useAtom(walletAtom);
  const walletAddress = walletObj[0];

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const copyWallet = async () => {
    if (!walletAddress) return;
    await Clipboard.setStringAsync(walletAddress as string);
    // Alert.alert("Copied", "Wallet address copied");
  };

  const handleDeactivate = () => {
    Alert.alert("Deactivate account", "This action is permanent", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Deactivate",
        style: "destructive",
        onPress: async () => {
          await user?.delete();
        },
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 px-4 pt-6"
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* ================= CURRENT ACCOUNT ================= */}
      <View className="bg-[#0B1624] rounded-3xl p-5 mb-6">
        <Text className="text-white text-xl font-bold mb-4">
          Current Account
        </Text>

        <View className="flex-row items-center">
          <Image source={{ uri: avatar }} className="w-14 h-14 rounded-full" />

          <View className="ml-4 flex-1">
            <Text className="text-white text-base">{email}</Text>

            {walletAddress && (
              <View className="flex-row items-center mt-1">
                <Text className="text-[#8FA3BF] text-sm">
                  {walletAddress.slice(0, 8)}...
                  {walletAddress.slice(-6)}
                </Text>

                <TouchableOpacity onPress={copyWallet} className="ml-3">
                  <Copy size={16} color="#1E90FF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity className="mt-5 bg-[#1E90FF] py-3 rounded-full">
          <Text className="text-center text-white font-semibold">
            Manage account
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= SETTINGS ================= */}
      <View className="bg-[#0B1624] rounded-3xl p-5 mb-6">
        <Text className="text-white text-xl font-bold mb-2">Settings</Text>

        <Row
          label="Change password"
          icon={<Lock size={20} color="#1E90FF" />}
          onPress={() => Alert.alert("Password", "Use Clerk security settings")}
        />

        <Row
          label="Logout"
          icon={<LogOut size={20} color="#FF6B6B" />}
          onPress={() => signOut()}
        />

        <Row
          label="Deactivate account"
          danger
          icon={<Trash2 size={20} color="#FF4D4D" />}
          onPress={handleDeactivate}
        />
      </View>

      {/* ================= ABOUT ================= */}
      <View className="bg-[#0B1624] rounded-3xl p-5">
        <Text className="text-white text-xl font-bold mb-3">About</Text>

        <Text className="text-[#8FA3BF] text-sm mb-2">
          Version {appVersion}
        </Text>

        <Text className="text-[#8FA3BF] text-sm">User ID: {user?.id}</Text>
      </View>
    </ScrollView>
  );
}

/* ================= REUSABLE ROW ================= */

function Row({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center py-4">
      {icon}
      <Text
        className={`ml-4 text-base ${danger ? "text-red-400" : "text-white"}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
