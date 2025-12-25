import React, { useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Spacing } from "@/app/constants/Spacing";
import Colors from "@/app/constants/Colors";

export default function CreditScorePage() {
  const { user } = useUser();
  const performPrediction = useAction(api.predictions.predictCreditScore);

  const [age, setAge] = useState(21);
  const [monthly_inhand_salary, setSalary] = useState(0);
  const [num_credit_card, setNumCards] = useState(0);
  const [outstanding_debt, setOutstandingDebt] = useState(0);
  const [credit_utilization_ratio, setCreditUtil] = useState(0);
  const [monthly_balance, setMonthlyBalance] = useState(0);
  const [credit_mix, setCreditMix] = useState("Standard");
  const [customer_id, setCustomerId] = useState("");

  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const input = {
      age: Number(age),
      monthly_inhand_salary: Number(monthly_inhand_salary),
      num_credit_card: Number(num_credit_card),
      outstanding_debt: Number(outstanding_debt),
      credit_utilization_ratio: Number(credit_utilization_ratio),
      monthly_balance: Number(monthly_balance),
      credit_mix: credit_mix,
      customer_id: customer_id || null,
    };

    try {
      setLoading(true);
      const res = await performPrediction({ input, requesterClerkId: user?.id });
      setResult(res);
    } catch (err: any) {
      Alert.alert("Prediction failed", err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.black }}>
      <ScrollView contentContainerStyle={{ padding: Spacing * 2 }}>
        <Text style={{ color: Colors.text, fontSize: 24, marginBottom: Spacing }}>
          Credit Score Prediction
        </Text>

        <View style={{ marginBottom: Spacing }}>
          <Text style={{ color: Colors.text }}>Age</Text>
          <TextInput
            keyboardType="numeric"
            value={String(age)}
            onChangeText={(v) => setAge(Number(v) || 0)}
            style={{ backgroundColor: "#111", color: "#fff", padding: 12, borderRadius: 8, marginTop: 8 }}
          />
        </View>

        <View style={{ marginBottom: Spacing }}>
          <Text style={{ color: Colors.text }}>Monthly Inhand Salary</Text>
          <TextInput
            keyboardType="numeric"
            value={String(monthly_inhand_salary)}
            onChangeText={(v) => setSalary(Number(v) || 0)}
            style={{ backgroundColor: "#111", color: "#fff", padding: 12, borderRadius: 8, marginTop: 8 }}
          />
        </View>

        <View style={{ marginBottom: Spacing }}>
          <Text style={{ color: Colors.text }}>Number of Credit Cards</Text>
          <TextInput
            keyboardType="numeric"
            value={String(num_credit_card)}
            onChangeText={(v) => setNumCards(Number(v) || 0)}
            style={{ backgroundColor: "#111", color: "#fff", padding: 12, borderRadius: 8, marginTop: 8 }}
          />
        </View>

        <View style={{ marginBottom: Spacing }}>
          <Text style={{ color: Colors.text }}>Outstanding Debt</Text>
          <TextInput
            keyboardType="numeric"
            value={String(outstanding_debt)}
            onChangeText={(v) => setOutstandingDebt(Number(v) || 0)}
            style={{ backgroundColor: "#111", color: "#fff", padding: 12, borderRadius: 8, marginTop: 8 }}
          />
        </View>

        <View style={{ marginBottom: Spacing }}>
          <Text style={{ color: Colors.text }}>Credit Utilization Ratio (%)</Text>
          <TextInput
            keyboardType="numeric"
            value={String(credit_utilization_ratio)}
            onChangeText={(v) => setCreditUtil(Number(v) || 0)}
            style={{ backgroundColor: "#111", color: "#fff", padding: 12, borderRadius: 8, marginTop: 8 }}
          />
        </View>

        <View style={{ marginBottom: Spacing }}>
          <Text style={{ color: Colors.text }}>Monthly Balance</Text>
          <TextInput
            keyboardType="numeric"
            value={String(monthly_balance)}
            onChangeText={(v) => setMonthlyBalance(Number(v) || 0)}
            style={{ backgroundColor: "#111", color: "#fff", padding: 12, borderRadius: 8, marginTop: 8 }}
          />
        </View>

        <View style={{ marginBottom: Spacing }}>
          <Text style={{ color: Colors.text }}>Credit Mix (Standard / Good / Bad)</Text>
          <TextInput
            value={credit_mix}
            onChangeText={setCreditMix}
            style={{ backgroundColor: "#111", color: "#fff", padding: 12, borderRadius: 8, marginTop: 8 }}
          />
        </View>

        <View style={{ marginBottom: Spacing }}>
          <Text style={{ color: Colors.text }}>Customer ID (optional)</Text>
          <TextInput
            value={customer_id}
            onChangeText={setCustomerId}
            style={{ backgroundColor: "#111", color: "#fff", padding: 12, borderRadius: 8, marginTop: 8 }}
          />
        </View>

        <TouchableOpacity
          onPress={submit}
          disabled={loading}
          style={{ backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: "center", marginBottom: Spacing }}
        >
          <Text style={{ color: Colors.onPrimary }}>{loading ? "Predicting..." : "Predict"}</Text>
        </TouchableOpacity>

        {result && (
          <View style={{ backgroundColor: "#111", padding: 16, borderRadius: 12 }}>
            <Text style={{ color: Colors.text, fontWeight: "bold" }}>Result</Text>
            <Text style={{ color: Colors.text }}>Score: {result.predicted_score}</Text>
            <Text style={{ color: Colors.text }}>Confidence: {result.confidence}</Text>
            <Text style={{ color: Colors.text, marginTop: 8 }}>Model version: {result.model_version}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}