import { getSolBalance, loadWallet } from "@/lib/Solana/walletCreate"; // adjust path if needed
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

const COLORS = {
  blue: "#4710cb",
  green: "#c0f667",
  black: "#100C08",
  white: "#f5f5f5",
};

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

      setReceiver(wallet.publicKey.toBase58());
      const bal = await getSolBalance(wallet.publicKey.toBase58());
      setBalance(bal);
    })();
  }, []);
  const handleCopy = async () => {
    await Clipboard.setStringAsync(receiver);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.black,
        padding: 20,
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Wallet color={COLORS.green} size={28} />
          <Text
            style={{
              color: COLORS.green,
              fontSize: 26,
              fontWeight: "bold",
            }}
          >
            Receive SOL
          </Text>
        </View>

        <Text
          style={{
            color: COLORS.white,
            opacity: 0.8,
            marginTop: 6,
          }}
        >
          Share your address or scan QR
        </Text>
        <Text
          style={{
            color: COLORS.white,
            opacity: 0.8,
            marginTop: 6,
          }}
        >
          {balance}
        </Text>
      </View>

      {/* QR Code */}
      <View
        style={{
          backgroundColor: "#1a1a1a",
          padding: 20,
          borderRadius: 20,
          alignItems: "center",
        }}
      >
        {receiver ? (
          <QRCode
            value={receiver}
            size={220}
            backgroundColor="transparent"
            color={COLORS.green}
          />
        ) : (
          <Text style={{ color: COLORS.white, marginTop: 16 }}>
            Loading QR...
          </Text>
        )}

        <Text
          style={{
            color: COLORS.white,
            marginTop: 16,
            fontSize: 14,
            opacity: 0.8,
          }}
        >
          Scan to receive SOL
        </Text>
      </View>

      {/* Address + Copy */}
      <View>
        <View
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: 14,
            paddingVertical: 14,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              color: COLORS.white,
              fontSize: 14,
              width: "85%",
            }}
            numberOfLines={1}
          >
            {receiver}
          </Text>

          <TouchableOpacity onPress={handleCopy}>
            <Copy color={COLORS.green} size={20} />
          </TouchableOpacity>
        </View>

        <Text
          style={{
            color: COLORS.white,
            opacity: 0.6,
            fontSize: 12,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          Tap the icon to copy address
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default ReceiveSol;
