// app/index.tsx
import { useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Radio,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const { user } = useUser();

  return (
    <View className="flex-1 justify-between">
      {/* Header */}

      {/* Balance Card */}
      <View className="bg-[#4710cb] rounded-3xl p-5 mb-4 shadow-2xl">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Wallet size={14} color="#c0f667" />
            <Text className="text-[#f5f5f5]/80 text-xs uppercase tracking-widest ml-2 font-semibold">
              Total Balance
            </Text>
          </View>
          <View className="bg-[#c0f667]/20 px-2 py-1 rounded-full">
            <Text className="text-[#c0f667] text-xs font-bold">ACTIVE</Text>
          </View>
        </View>

        <Text className="text-[#c0f667] text-4xl font-extrabold mb-3">
          PKR 12,450
        </Text>

        <View className="bg-[#100C08]/20 rounded-2xl p-3">
          <Text className="text-[#f5f5f5]/60 text-xs mb-1">Account</Text>
          <Text className="text-[#f5f5f5] text-xs font-medium">
            {user?.emailAddresses[0].emailAddress}
          </Text>
        </View>
      </View>

      {/* Quick Actions - Send & Receive */}
      <View className="flex-row gap-3 mb-4">
        <Link href="/(protected)/bluetooth/client" asChild>
          <TouchableOpacity className="flex-1">
            <View className="bg-[#4710cb] rounded-2xl p-4 shadow-lg items-center">
              <View className="w-12 h-12 rounded-full bg-[#c0f667] items-center justify-center mb-2">
                <ArrowUpRight size={24} color="#100C08" strokeWidth={3} />
              </View>
              <Text className="text-[#f5f5f5] text-base font-bold">Send</Text>
              <Text className="text-[#f5f5f5]/60 text-xs mt-1">
                Transfer funds
              </Text>
            </View>
          </TouchableOpacity>
        </Link>

        <Link href="/(protected)/bluetooth/server" asChild>
          <TouchableOpacity className="flex-1">
            <View className="bg-[#f5f5f5] rounded-2xl p-4 shadow-lg items-center">
              <View className="w-12 h-12 rounded-full bg-[#4710cb] items-center justify-center mb-2">
                <ArrowDownLeft size={24} color="#c0f667" strokeWidth={3} />
              </View>
              <Text className="text-[#100C08] text-base font-bold">
                Receive
              </Text>
              <Text className="text-[#100C08]/60 text-xs mt-1">
                Accept payment
              </Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Features Grid */}
      <View className="mb-4">
        <Text className="text-[#f5f5f5] text-base font-bold mb-3">
          Features
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {/* Bluetooth Transfer */}
          <View className="w-[48%] bg-[#f5f5f5]/10 rounded-2xl p-3 border border-[#f5f5f5]/10">
            <View className="w-8 h-8 rounded-full bg-[#4710cb]/20 items-center justify-center mb-2">
              <Radio size={16} color="#c0f667" />
            </View>
            <Text className="text-[#f5f5f5] text-xs font-semibold mb-1">
              Bluetooth
            </Text>
            <Text className="text-[#f5f5f5]/60 text-xs">Offline transfers</Text>
          </View>

          {/* Instant Payment */}
          <View className="w-[48%] bg-[#f5f5f5]/10 rounded-2xl p-3 border border-[#f5f5f5]/10">
            <View className="w-8 h-8 rounded-full bg-[#c0f667]/20 items-center justify-center mb-2">
              <Zap size={16} color="#c0f667" />
            </View>
            <Text className="text-[#f5f5f5] text-xs font-semibold mb-1">
              Instant
            </Text>
            <Text className="text-[#f5f5f5]/60 text-xs">
              Real-time settlement
            </Text>
          </View>

          {/* Decentralized */}
          <View className="w-[48%] bg-[#f5f5f5]/10 rounded-2xl p-3 border border-[#f5f5f5]/10">
            <View className="w-8 h-8 rounded-full bg-[#4710cb]/20 items-center justify-center mb-2">
              <TrendingUp size={16} color="#4710cb" />
            </View>
            <Text className="text-[#f5f5f5] text-xs font-semibold mb-1">
              DeFi Ready
            </Text>
            <Text className="text-[#f5f5f5]/60 text-xs">Crypto enabled</Text>
          </View>

          {/* History */}
          <View className="w-[48%] bg-[#f5f5f5]/10 rounded-2xl p-3 border border-[#f5f5f5]/10">
            <View className="w-8 h-8 rounded-full bg-[#c0f667]/20 items-center justify-center mb-2">
              <Clock size={16} color="#f5f5f5" />
            </View>
            <Text className="text-[#f5f5f5] text-xs font-semibold mb-1">
              History
            </Text>
            <Text className="text-[#f5f5f5]/60 text-xs">
              Track all transactions
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View className="flex-1">
        <Text className="text-[#f5f5f5] text-base font-bold mb-3">
          Recent Activity
        </Text>

        {/* Activity Item */}
        <View className="bg-[#f5f5f5]/10 rounded-2xl p-3 mb-2 border border-[#f5f5f5]/10">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-[#c0f667]/20 items-center justify-center mr-3">
                <ArrowUpRight size={16} color="#c0f667" />
              </View>
              <View className="flex-1">
                <Text className="text-[#f5f5f5] text-xs font-semibold">
                  Payment Sent
                </Text>
                <Text className="text-[#f5f5f5]/60 text-xs">2 hours ago</Text>
              </View>
            </View>
            <Text className="text-[#f5f5f5] text-sm font-bold">-PKR 500</Text>
          </View>
        </View>

        <View className="bg-[#f5f5f5]/10 rounded-2xl p-3 border border-[#f5f5f5]/10">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-[#4710cb]/20 items-center justify-center mr-3">
                <ArrowDownLeft size={16} color="#4710cb" />
              </View>
              <View className="flex-1">
                <Text className="text-[#f5f5f5] text-xs font-semibold">
                  Payment Received
                </Text>
                <Text className="text-[#f5f5f5]/60 text-xs">Yesterday</Text>
              </View>
            </View>
            <Text className="text-[#c0f667] text-sm font-bold">+PKR 1,200</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
