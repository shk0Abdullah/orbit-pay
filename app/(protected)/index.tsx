// app/index.tsx
import { useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Home() {
  const { user } = useUser();

  return (
    <>
      <View>
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
      </View>
    </>
  );
}
