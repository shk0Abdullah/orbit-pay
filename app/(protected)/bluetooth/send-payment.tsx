// app/(protected)/bluetooth/send-payment.tsx
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle,
  Radio,
  Send,
  Wallet,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RNBluetoothClassic from "react-native-bluetooth-classic";

export default function SendPayment() {
  const { user } = useUser();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { deviceId, deviceName, deviceAddress } = params;

  const [amount, setAmount] = useState("");
  const [senderName, setSenderName] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const balanceData = useQuery(api.payments.getBalance, {
    clerkId: user?.id!,
  });

  const sendPayment = async () => {
    console.log(balanceData?.balance);
    console.log(parseFloat(amount) <= balanceData?.balance!);
    console.log(typeof balanceData?.balance);
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      setSuccess(false);
      return;
    }
    if (parseInt(amount) >= balanceData?.balance!) {
      Alert.alert("Insufficient Amount");
      setSuccess(false);

      return;
    }

    if (!senderName.trim()) {
      Alert.alert("Invalid Name", "Please enter your name");
      setSuccess(false);

      return;
    }

    if (!deviceId) {
      Alert.alert("Error", "Device not connected");
      setSuccess(false);

      return;
    }

    const payload = {
      amount: parseFloat(amount),
      currency: "PKR",
      senderName: senderName.trim(),
      senderClerkId: user?.id,
      time: Date.now(),
    };

    try {
      setSending(true);
      await RNBluetoothClassic.writeToDevice(
        deviceId as string,
        JSON.stringify(payload) + "\n"
      );

      setSuccess(true);

      // Show success for 2 seconds then go back
      setTimeout(async () => {
        try {
          const disconnect = await RNBluetoothClassic.disconnectFromDevice(
            deviceId as string
          );
          console.log("Gonna Disconnect", disconnect);
        } catch {
          console.log("Already Disconnected This promise is failing");
        }
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(protected)");
        }
      }, 5000);
    } catch (err) {
      console.error("WRITE ERROR", err);
      Alert.alert("Send Failed", "Could not send payment");
    } finally {
      setSending(false);
    }
  };

  if (success) {
    return (
      <>
        <View className="flex-1 bg-[#100C08] items-center justify-center px-6">
          <View className="items-center">
            <View className="w-24 h-24 rounded-full bg-[#c0f667] items-center justify-center mb-6">
              <CheckCircle size={48} color="#100C08" strokeWidth={3} />
            </View>
            <Text className="text-[#f5f5f5] text-3xl font-bold mb-2">
              Payment Sent!
            </Text>
            <Text className="text-[#c0f667] text-xl font-semibold mb-4">
              PKR {amount}
            </Text>
            <Text className="text-[#f5f5f5]/60 text-sm text-center">
              Successfully transferred to {deviceName}
            </Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#100C08]"
    >
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4 border-b border-[#f5f5f5]/10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#f5f5f5]/10 items-center justify-center mb-4"
          >
            <ArrowLeft size={20} color="#f5f5f5" />
          </TouchableOpacity>

          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 rounded-full bg-[#4710cb] items-center justify-center mr-3">
              <Send size={20} color="#c0f667" />
            </View>
            <Text className="text-[#f5f5f5] text-2xl font-bold">
              Send Payment
            </Text>
          </View>

          {/* Connected Device Info */}
          <View className="bg-[#4710cb]/10 border border-[#4710cb]/20 rounded-2xl p-4 mt-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-[#c0f667]/20 items-center justify-center mr-3">
                <Radio size={16} color="#c0f667" />
              </View>
              <View className="flex-1">
                <Text className="text-[#f5f5f5]/60 text-xs mb-1">
                  Sending to
                </Text>
                <Text className="text-[#f5f5f5] text-sm font-semibold">
                  {deviceName}
                </Text>
                <Text className="text-[#f5f5f5]/40 text-xs font-mono">
                  {deviceAddress}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Form Section */}
        <View className="flex-1 px-6 pt-8">
          {/* Amount Input */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <Wallet size={20} color="#c0f667" />
              <Text className="text-[#f5f5f5] text-sm font-semibold ml-2">
                Amount
              </Text>
            </View>
            <View className="bg-[#f5f5f5]/10 border-2 border-[#4710cb] rounded-2xl p-4">
              <View className="flex-row items-center">
                <Text className="text-[#f5f5f5] text-2xl font-bold mr-2">
                  PKR
                </Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#f5f5f5/40"
                  keyboardType="numeric"
                  className="flex-1 text-[#c0f667] text-3xl font-bold"
                />
              </View>
            </View>
          </View>

          {/* Sender Name Input */}
          <View className="mb-8">
            <Text className="text-[#f5f5f5] text-sm font-semibold mb-3">
              Your Name
            </Text>
            <View className="bg-[#f5f5f5]/10 border border-[#f5f5f5]/20 rounded-2xl p-4">
              <TextInput
                value={senderName}
                onChangeText={setSenderName}
                placeholder="Enter your name"
                placeholderTextColor="#f5f5f5/40"
                className="text-[#f5f5f5] text-base"
              />
            </View>
          </View>

          {/* Quick Amount Buttons */}
          <View className="mb-6">
            <Text className="text-[#f5f5f5]/60 text-xs mb-3">
              Quick amounts
            </Text>
            <View className="flex-row gap-2">
              {["100", "500", "1000", "5000"].map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  onPress={() => setAmount(quickAmount)}
                  className="flex-1 bg-[#f5f5f5]/5 border border-[#4710cb]/30 rounded-xl py-3 items-center"
                >
                  <Text className="text-[#4710cb] text-sm font-bold">
                    {quickAmount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Send Button */}
        <View className="px-6 pb-6">
          <TouchableOpacity
            onPress={sendPayment}
            disabled={sending}
            className={`rounded-2xl p-5 flex-row items-center justify-center ${
              sending ? "bg-[#4710cb]/50" : "bg-[#4710cb]"
            }`}
          >
            <Send size={20} color="#c0f667" />
            <Text className="text-[#f5f5f5] text-lg font-bold ml-2">
              {sending ? "Sending..." : "Send Payment"}
            </Text>
          </TouchableOpacity>

          <Text className="text-[#f5f5f5]/40 text-xs text-center mt-4">
            Payment will be sent via Bluetooth connection
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
