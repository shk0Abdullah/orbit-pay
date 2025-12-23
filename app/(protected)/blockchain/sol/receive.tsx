import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import { Copy, Wallet } from "lucide-react-native";

const COLORS = {
  blue: "#4710cb",
  green: "#c0f667",
  black: "#100C08",
  white: "#f5f5f5",
};

// 🔹 Dummy address for now
const DUMMY_SOL_ADDRESS = "7YkQ9FvFZ4WcX4Yp8gD7mP6s9uR2A9kB4ZxV8sEoFh2M";

const ReceiveSol = () => {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(DUMMY_SOL_ADDRESS);
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
        <QRCode
          value={DUMMY_SOL_ADDRESS}
          size={220}
          backgroundColor="transparent"
          color={COLORS.green}
        />

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
            {DUMMY_SOL_ADDRESS}
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
