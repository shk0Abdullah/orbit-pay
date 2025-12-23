import React, { useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

const PaymentChoice = () => {
  const [selectedMethod, setSelectedMethod] = useState<
    "OrbitPay" | "Solana" | null
  >(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { type } = useLocalSearchParams(); // "send" or "receive"

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleNext = () => {
    if (!selectedMethod) return;

    // Determine URLs based on type param and selected method
    if (type === "receive") {
      if (selectedMethod === "OrbitPay") {
        router.push("/(protected)/bluetooth/server");
      } else if (selectedMethod === "Solana") {
        router.push("/(protected)/blockchain/sol/receive");
      }
    } else {
      // Default send behavior
      if (selectedMethod === "OrbitPay") {
        router.push("/(protected)/bluetooth/client");
      } else if (selectedMethod === "Solana") {
        router.push("/(protected)/blockchain/sol/send");
      }
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(protected)");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#100C08] px-5 justify-between py-10">
      <View>
        <Text className="text-2xl font-bold text-[#c0f667] mb-2">
          Choose Payment Method
        </Text>
        <Text className="text-sm text-[#f5f5f5] mb-6">
          Select a method to proceed with your transaction
        </Text>

        {/* Dropdown */}
        <TouchableOpacity
          className="flex-row items-center justify-between bg-[#4710cb] px-4 py-4 rounded-xl mb-2 shadow-lg"
          onPress={toggleDropdown}
          activeOpacity={0.8}
        >
          <Text
            className={`text-lg font-bold ${
              selectedMethod ? "text-[#c0f667]" : "text-[#f5f5f5]"
            }`}
          >
            {selectedMethod || "Select Payment Method"}
          </Text>
          <ChevronDown color="#c0f667" size={20} />
        </TouchableOpacity>

        {/* Dropdown Options */}
        {dropdownOpen && (
          <View className="bg-[#4710cb]/90 rounded-xl mt-1 overflow-hidden">
            <TouchableOpacity
              className="px-4 py-3"
              onPress={() => {
                setSelectedMethod("OrbitPay");
                setDropdownOpen(false);
              }}
            >
              <Text className="text-[#c0f667] font-bold text-lg">OrbitPay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 py-3 border-t border-[#c0f667]/50"
              onPress={() => {
                setSelectedMethod("Solana");
                setDropdownOpen(false);
              }}
            >
              <Text className="text-[#c0f667] font-bold text-lg">Solana</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom Buttons */}
      <View className="flex-row justify-between mt-10">
        {/* Back Button */}
        <TouchableOpacity
          className="flex-1 bg-[#4710cb] px-6 py-4 rounded-xl mr-3 items-center justify-center shadow-lg"
          activeOpacity={0.8}
          onPress={handleBack}
        >
          <Text className="text-[#c0f667] font-bold text-lg">Back</Text>
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity
          className={`flex-1 px-6 py-4 rounded-xl items-center justify-center shadow-lg ${
            selectedMethod ? "bg-[#c0f667]" : "bg-[#c0f667]/50"
          }`}
          activeOpacity={0.8}
          onPress={handleNext}
          disabled={!selectedMethod}
        >
          <Text className="text-[#100C08] font-bold text-lg">Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaymentChoice;
