import { balanceAtom, walletAtom } from "@/app/store/Atom";
import { loadWallet, sendSol } from "@/lib/Solana/walletCreate";
import { PublicKey } from "@solana/web3.js";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useAtom } from "jotai";
import { QrCode, Send } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ESTIMATED_FEE = 0.00001;

const SendSol = () => {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  const [balance] = useAtom(balanceAtom);
  const [wallet] = useAtom(walletAtom);
  const [permission, requestPermission] = useCameraPermissions();

  /* -------- Validation -------- */
  const isValidAddress = (address: string) => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  /* -------- Handle QR Scan -------- */
  const handleScan = ({ data }: { data: string }) => {
    if (isValidAddress(data)) {
      setToAddress(data);
      setScanOpen(false);
    } else {
      Alert.alert("Invalid QR", "Not a valid Solana address");
    }
  };

  /* -------- Send -------- */
  const handleSend = async () => {
    if (!toAddress || !amount) {
      Alert.alert("Missing fields", "Enter address and amount");
      return;
    }

    if (!isValidAddress(toAddress)) {
      Alert.alert("Invalid Address");
      return;
    }

    const solAmount = Number(amount);
    if (isNaN(solAmount) || solAmount <= 0) {
      Alert.alert("Invalid Amount");
      return;
    }

    if (balance !== null && solAmount + ESTIMATED_FEE > balance) {
      Alert.alert("Insufficient Balance", "Amount + fees exceed balance");
      return;
    }

    try {
      setLoading(true);
      const sender = await loadWallet();
      if (!sender) throw new Error("Wallet not loaded");

      const sig = await sendSol(sender, toAddress, solAmount);

      Alert.alert("Success 🎉", `Transaction sent\n\n${sig}`);
      setAmount("");
      setToAddress("");
    } catch (e: any) {
      Alert.alert("Failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 px-5 py-6">
      <View className="flex-row items-center justify-center">
        <View>
          <Text className="text-white text-2xl font-bold ">Send SOL</Text>
          <Text className="text-[#86D2FF] text-sm mt-1">
            Solana • Secure Transfer
          </Text>
        </View>

        <TouchableOpacity
          onPress={async () => {
            if (!permission?.granted) await requestPermission();
            setScanOpen(true);
          }}
          className="w-11 h-11 rounded-xl bg-[#0B1E5B] items-center justify-center"
        >
          <QrCode size={22} color="#86D2FF" />
        </TouchableOpacity>
      </View>

      {/* ================= BALANCE ================= */}
      {balance !== null && (
        <View className="mt-6 items-center justify-center">
          <Text className="text-white/70 text-sm">Available Balance</Text>
          <Text className="text-white text-lg font-semibold mt-1">
            {balance.toFixed(4)} SOL
          </Text>
        </View>
      )}

      {/* ================= INPUTS ================= */}
      <View className="mt-8">
        <Text className="text-white font-bold mb-2">Recipient Address</Text>
        <TextInput
          value={toAddress}
          onChangeText={setToAddress}
          placeholder="Solana address"
          placeholderTextColor="#ccc"
          className="bg-[#000] text-white rounded-2xl px-4 py-4 mb-4"
        />

        <Text className="text-white font-bold mb-2">Amount (SOL)</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.01"
          placeholderTextColor="#ccc"
          className="bg-[#000] text-white rounded-2xl px-4 py-4"
        />
      </View>

      {/* ================= FEES ================= */}
      <View className="mt-4 flex-row justify-between">
        <Text className="text-white/60 text-sm">Estimated Fee</Text>
        <Text className="text-[#86D2FF] text-sm">{ESTIMATED_FEE} SOL</Text>
      </View>

      {/* ================= SEND BUTTON ================= */}
      <TouchableOpacity
        onPress={handleSend}
        disabled={loading}
        className="mt-10 bg-[#86D2FF] rounded-2xl py-4 items-center"
      >
        {loading ? (
          <ActivityIndicator color="#0B1E5B" />
        ) : (
          <View className="flex-row items-center gap-2">
            <Send size={18} color="#0B1E5B" />
            <Text className="text-[#0B1E5B] font-bold text-lg">Send SOL</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ================= QR MODAL ================= */}
      <Modal visible={scanOpen} animationType="slide">
        <View className="flex-1 bg-black">
          <CameraView
            style={{ flex: 1 }}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleScan}
          />

          <TouchableOpacity
            onPress={() => setScanOpen(false)}
            className="absolute bottom-10 self-center bg-white px-6 py-3 rounded-full"
          >
            <Text className="font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SendSol;
