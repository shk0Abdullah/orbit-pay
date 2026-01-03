// app/(protected)/bluetooth/send-payment.tsx
import { walletAtom } from "@/app/store/Atom";
import { api } from "@/convex/_generated/api";
import { showToast } from "@/lib/toast";
import { useUser } from "@clerk/clerk-expo";
import { useAction, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtom } from "jotai";
import { CheckCircle, Send, Wallet } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import RNBluetoothClassic from "react-native-bluetooth-classic";

// Theme Colors
const COLORS = {
  deepMidnight: "#0B1E5B",
  royalBlue: "#1A459D",
  azureSky: "#4A90E2",
  electricCyan: "#86D2FF",
  pureWhite: "#FFFFFF",
  greenAccent: "#c0f667",
};
export default function SendPayment() {
  const { user } = useUser();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { deviceId, deviceName, deviceAddress } = params;
  const [userWalletPublicKey] = useAtom(walletAtom);
  const [amount, setAmount] = useState<number>(0);
  // const [balance] = useAtom(balanceAtom);//Sol

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch balance from ledger
  const balance = useQuery(api.users.getBalance, {
    clerkId: user?.id!,
  });

  // Helper: get last transaction hash for Merkle DAG polyfill
  const lastTx = useQuery(api.ledger.getLastTransaction, {
    publicKey: userWalletPublicKey as string,
  });

  // Action hook for creating ledger transaction
  const createLedgerTx = useAction(api.ledgerNodeAction.createLedgerTxAction);

  const listenForAck = (
    deviceId: string
  ): Promise<{
    type: string;
    toPubkey: string;
    accepted: boolean;
  }> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        sub?.remove();
        reject(new Error("ACK_TIMEOUT"));
      }, 15000);

      const sub = RNBluetoothClassic.onDeviceRead(deviceId, (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type !== "PAYMENT_ACK") return;
          if (!msg.accepted) return;
          if (!msg.toPubkey) {
            console.log("Client: No Receiver Wallet ACK Found");
          }

          clearTimeout(timeout);
          sub.remove();

          resolve(msg);
        } catch (e) {
          console.log("CLIENT ACK PARSE ERROR", e);
        }
      });
    });
  };

  const sendPayment = async () => {
    console.log(balanceData?.balance);
    console.log(parseFloat(amount) <= balanceData?.balance!);
    console.log(typeof balanceData?.balance);
    if (amount <= 0) {
      showToast({ type: "error", title: "Invalid amount", message: "Invalid amount" });

      setSuccess(false);
      return;
    }
    if (amount > balance?.balance!) {
      showToast({ type: "error", title: "Insufficient amount", message: "Insufficient amount" });
      setSuccess(false);

      return;
    }

 
      setSuccess(false);
      return;
    }
    if (!deviceId) {
      showToast({ type: "error", title: "Connection Error", message: "Device not connected" });
      setSuccess(false);
      return;
    }
    const payload = {
      amount: amount,
      currency: "PKR",
      senderName: user?.primaryEmailAddress,
      senderClerkId: user?.id,
      time: Date.now(),
    };
    const ledgerPayload = {
      fromPubkey: userWalletPublicKey,
      amount: amount,
      timestamp: Date.now(),
    };

    try {
      setSending(true);

      console.log("Writing From Client");
      await RNBluetoothClassic.writeToDevice(
        deviceId as string,
        JSON.stringify(payload) + "\n"
      );

      const ack = await listenForAck(deviceId as string);
      console.log("ACK received:", ack);

      // Insert into ledger (offline-first)
      const ledgerEntry = await createLedgerTx({
        fromPubkey: ledgerPayload.fromPubkey as string,
        toPubkey: ack.toPubkey as string,
        amount: payload.amount,
        parentHashes: lastTx ? [lastTx.txHash] : [],
        signature: "offline-simulated-signature",
      });

      console.log("Ledger entry created:", ledgerEntry);

      setSuccess(true);

      // Auto-disconnect after 2 seconds and go back
      setTimeout(async () => {
        try {
          await RNBluetoothClassic.disconnectFromDevice(deviceId as string);
        } catch {}
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(protected)");
        }
      }, 2000);
    } catch (err) {
      console.error("WRITE ERROR", err);
      showToast({ type: "error", title: "Payment Failed", message: "Could not send your payment" });

    } finally {
      setSending(false);
    }
  };

  if (success) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: COLORS.deepMidnight }}
      >
        <View className="items-center">
          <View className="w-24 h-24 rounded-full bg-greenAccent items-center justify-center mb-6">
            <CheckCircle
              size={48}
              color={COLORS.deepMidnight}
              strokeWidth={3}
            />
          </View>
          <Text className="text-pureWhite text-3xl font-bold mb-2">
            Payment Sent!
          </Text>
          <Text className="text-greenAccent text-xl font-semibold mb-4">
            PKR {amount}
          </Text>
          <Text className="text-pureWhite/60 text-sm text-center">
            Successfully transferred to {deviceName}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white/10 rounded-full mt-24
      "
    >
      <View className="flex-1 px-6 pt-6">
        <View className="flex-row items-center justify-center mb-4">
          <View className="w-10 h-10 rounded-full bg-royalBlue items-center justify-center mr-3">
            <Send size={20} color="#86D2FF" />
          </View>
          <Text className="text-white text-2xl font-bold">Send Payment</Text>
        </View>

        {/* Connected Device Info */}
        <View className="bg-royalBlue/10 border border-royalBlue/20 rounded-2xl p-4 mb-8">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full  items-center justify-center mr-3">
              <Image
                source={require("@/assets/images/withoutbg.png")}
                className="w-12 h-12"
                resizeMode="contain"
              />
            </View>
            <View className="flex-1">
              <Text className="text-white/60 text-xs mb-1">Sending to</Text>
              <Text className="text-white text-sm font-semibold">
                {deviceName}
              </Text>
              <Text className="text-white/40 text-xs font-mono">
                {deviceAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* Amount Input */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Wallet size={20} color="#86D2FF" />
            <Text className="text-white text-sm font-semibold ml-2">
              Amount
            </Text>
          </View>
          <View className="bg-pureWhite/10 border-2 border-royalBlue rounded-2xl p-4">
            <View className="flex-row items-center">
              <Text className="text-white text-2xl font-bold mr-2">PKR</Text>
              <TextInput
                value={amount.toString()}
                onChangeText={(text) => setAmount(Number(text))}
                placeholder="0.00"
                placeholderTextColor="#FFF/40"
                keyboardType="numeric"
                className="flex-1 text-white text-3xl font-bold"
              />
            </View>
          </View>
        </View>

        {/* Quick Amount Buttons */}
        <View className="mb-6">
          <Text className="text-white/60 text-xs mb-3">Quick amounts</Text>
          <View className="flex-row gap-2">
            {[100, 500, 1000, 5000].map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                onPress={() => setAmount(quickAmount)}
                className="flex-1 bg-white/5 border border-royalBlue/30 rounded-xl py-3 items-center"
              >
                <Text className="text-white/80 text-sm font-bold">
                  {quickAmount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Send Button */}
        <View className="pb-6">
          <TouchableOpacity
            onPress={sendPayment}
            disabled={sending}
            className="rounded-2xl p-5 flex-row items-center justify-center"
            style={{
              backgroundColor: sending ? "#0B1E5B" + "80" : "#0B1E5B",
            }}
          >
            <Send size={20} color="#86D2FF" />
            <Text className="text-white text-lg font-bold ml-2">
              {sending ? "Sending..." : "Send Payment"}
            </Text>
          </TouchableOpacity>
          <Text className="text-white/40 text-xs text-center mt-4">
            Payment will be sent via Bluetooth connection
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
