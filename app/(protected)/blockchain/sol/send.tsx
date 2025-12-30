import { balanceAtom, walletAtom } from "@/app/store/Atom";
import { loadWallet, sendSol } from "@/lib/Solana/walletCreate"; // adjust path if needed
import { PublicKey } from "@solana/web3.js";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const COLORS = {
  blue: "#4710cb",
  green: "#c0f667",
  black: "#100C08",
  white: "#f5f5f5",
};

const SendSol = () => {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const [balance, _] = useAtom(balanceAtom);
  const [wallet, setWallet] = useAtom(walletAtom);

  /* -------- Load wallet + balance -------- */
  useEffect(() => {
    (async () => {
      console.log(wallet);
      console.log(balance);
    })();
  }, []);

  /* -------- Validation -------- */
  const isValidAddress = (address: string) => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const handleSend = async () => {
    if (!toAddress || !amount) {
      Alert.alert("Missing fields", "Enter address and amount");
      return;
    }

    if (!isValidAddress(toAddress)) {
      Alert.alert("Invalid Address", "Please enter a valid Solana address");
      return;
    }

    const solAmount = Number(amount);
    if (isNaN(solAmount) || solAmount <= 0) {
      Alert.alert("Invalid Amount", "Amount must be greater than 0");
      return;
    }

    if (balance !== null && solAmount > balance) {
      Alert.alert("Insufficient Balance", "Not enough SOL");
      return;
    }

    try {
      setLoading(true);
      const sender = await loadWallet();
      if (!sender) throw new Error("Wallet not loaded");

      const signature = await sendSol(sender, toAddress, solAmount);

      Alert.alert(
        "Success 🎉",
        `Transaction sent!\n\nSignature:\n${signature}`
      );

      setAmount("");
      setToAddress("");
    } catch (err: any) {
      Alert.alert("Transaction Failed", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
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
        <Text
          style={{
            color: COLORS.green,
            fontSize: 26,
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          Send SOL
        </Text>

        <Text style={{ color: COLORS.white, opacity: 0.8 }}>
          Devnet • Secure Transfer
        </Text>

        {/* Balance */}
        {balance !== null && (
          <Text
            style={{
              marginTop: 16,
              color: COLORS.green,
              fontSize: 16,
            }}
          >
            Balance: {balance.toFixed(4)} SOL
          </Text>
        )}
      </View>

      {/* Inputs */}
      <View>
        <Text style={{ color: COLORS.white, marginBottom: 6 }}>
          Recipient Address
        </Text>
        <TextInput
          value={toAddress}
          onChangeText={setToAddress}
          placeholder="Enter Solana address"
          placeholderTextColor="#aaa"
          style={{
            backgroundColor: "#1a1a1a",
            color: COLORS.white,
            padding: 14,
            borderRadius: 12,
            marginBottom: 16,
          }}
        />

        <Text style={{ color: COLORS.white, marginBottom: 6 }}>
          Amount (SOL)
        </Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.01"
          keyboardType="decimal-pad"
          placeholderTextColor="#aaa"
          style={{
            backgroundColor: "#1a1a1a",
            color: COLORS.white,
            padding: 14,
            borderRadius: 12,
          }}
        />
      </View>

      {/* Send Button */}
      <TouchableOpacity
        onPress={handleSend}
        disabled={loading}
        style={{
          backgroundColor: COLORS.green,
          paddingVertical: 16,
          borderRadius: 14,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.black} />
        ) : (
          <Text
            style={{
              color: COLORS.black,
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            Send SOL
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SendSol;
