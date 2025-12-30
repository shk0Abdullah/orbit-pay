import { getSolBalance, loadWallet } from "@/lib/Solana/walletCreate";
import * as Clipboard from "expo-clipboard";
import { Copy, Wallet } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

const ReceiveSol = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [receiver, setReceiver] = useState<string>("");

  useEffect(() => {
    (async () => {
      const wallet = await loadWallet();
      if (!wallet) {
        Alert.alert("Wallet not found", "Create a wallet first.");
        return;
      }

      const address = wallet.publicKey.toBase58();
      setReceiver(address);

      const bal = await getSolBalance(address);
      setBalance(bal);
    })();
  }, []);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(receiver);
  };

  return (
    <SafeAreaView className="flex-1  px-5 py-6">
      {/* ================= HEADER ================= */}
      <View>
        <View className="flex-row items-center justify-center gap-3">
          <View className="w-11 h-11 rounded-xl items-center justify-center">
            <Wallet size={24} color="#86D2FF" />
          </View>

          <View>
            <Text className="text-white text-2xl font-bold">Receive SOL</Text>
            <Text className="text-[#dfdfdf] text-sm mt-0.5">
              Solana blockchain
            </Text>
          </View>
        </View>

        <View className="mt-4 items-center justify-center">
          <Text className="text-white/70 text-sm">Available Balance</Text>
          <Text className="text-white text-xl font-semibold mt-1">
            {balance !== null ? `${balance} SOL` : "--"}
          </Text>
        </View>
      </View>

      {/* ================= QR CARD ================= */}
      <View className="mt-10 rounded-3xl py-8 items-center">
        {receiver ? (
          <QRCode
            value={receiver}
            size={240}
            backgroundColor="transparent"
            color="#86D2FF"
          />
        ) : (
          <Text className="text-white mt-6">Generating QR…</Text>
        )}

        <Text className="text-white/70 text-sm mt-4">Scan to receive SOL</Text>
      </View>

      {/* ================= ADDRESS ================= */}
      <View className="mt-8">
        <View className="bg-[#000000] rounded-2xl px-4 py-4 flex-row items-center justify-between">
          <Text className="text-white text-sm w-[85%]" numberOfLines={1}>
            {receiver}
          </Text>

          <TouchableOpacity onPress={handleCopy}>
            <Copy size={20} color="#86D2FF" />
          </TouchableOpacity>
        </View>

        <Text className="text-white/60 text-xs mt-2 text-center">
          Tap to copy your Solana address
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default ReceiveSol;
