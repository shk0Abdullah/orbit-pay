import { balanceAtom, indexActionSheet, walletAtom } from "@/app/store/Atom";
import { api } from "@/convex/_generated/api";
import { getSolBalance, loadWallet } from "@/lib/Solana/walletCreate";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useAtom } from "jotai";
import React, { useEffect } from "react";

import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Home() {
  const { userId } = useAuth();
  const [solBalance, setSolBalance] = useAtom(balanceAtom);
  const [, setWalletAddress] = useAtom(walletAtom);
  const [, setindexActionSheet] = useAtom(indexActionSheet);
  const dbUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  useEffect(() => {
    (async () => {
      const wallet = await loadWallet();
      if (!wallet) return;
      const address = wallet.publicKey.toBase58();
      setWalletAddress(address);
      setSolBalance(await getSolBalance(address));
    })();
  }, []);

  const total = Number(dbUser?.balance || 0) + solBalance;

  return (
    <>
      <SafeAreaView className="flex-1 p-1 justify-center">
        <View className="bg-[#030d29] rounded-3xl p-6 pt-10 mt-10 items-center">
          <Text className="text-white/80 font-semibold">Total portfolio</Text>

          <Text className="text-white text-4xl font-extrabold my-2">
            ${total.toFixed(2)}
          </Text>

          <Text className="text-green-300 font-bold">+ $12.61</Text>

          {/* Balances */}
          <View className="flex-row justify-between w-full mt-6">
            <BalanceBox label="Coins" value={`$${solBalance}`} />
            <BalanceBox label="Cash" value={`$${dbUser?.balance || 0}`} />
          </View>

          {/* Widgets */}
          <View className="flex-row justify-between w-full mt-6">
            <Widget icon="swap-horizontal" label="Buy/Sell" />
            <Widget
              icon="download"
              label="Receive"
              onPress={() => setindexActionSheet(true)}
            />
            <Widget
              icon="send"
              label="Send"
              disabled={solBalance <= 0}
              onPress={() => setindexActionSheet(true)}
            />
            <Widget icon="repeat" label="Swap" />
          </View>
        </View>

        <View className="bg-[#020a20] rounded-3xl p-5 mt-6 flex-row items-center">
          <Image
            source={require("@/assets/images/logos/solana-sol-logo.png")}
            className="w-10 h-10 mr-4"
            resizeMode="contain"
          />

          <View className="flex-1">
            <Text className="text-white font-bold">Solana</Text>
            <Text className="text-green-300 font-semibold mt-1">
              $4.75 +3.54%
            </Text>
          </View>

          <Text className="text-white font-bold text-lg">
            ${solBalance.toFixed(2)}
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const BalanceBox = ({ label, value }: any) => (
  <View className="w-[48%] bg-[#0B1E5B] p-4 rounded-3xl items-center">
    <Text className="text-white font-bold opacity-80">{label}</Text>
    <Text className="text-white text-lg font-bold mt-1">{value}</Text>
    <Text className="text-green-400 font-bold mt-1">+ $12.61</Text>
  </View>
);

const Widget = ({ icon, label, disabled, onPress }: any) => (
  <TouchableOpacity
    disabled={disabled}
    className={`w-20 h-20 rounded-2xl items-center justify-center ${
      disabled ? "bg-[#46484c]" : "bg-[#0B1E5B]"
    }`}
    onPress={onPress}
  >
    <Ionicons name={icon} size={26} color="white" />
    <Text className="text-white text-xs font-extrabold mt-1">{label}</Text>
  </TouchableOpacity>
);
