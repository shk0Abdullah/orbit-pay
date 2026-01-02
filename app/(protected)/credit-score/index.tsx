import CreditScoreGauge from "@/app/components/CreditScoreGauge";
import Colors from "@/app/constants/Colors";
import { Spacing } from "@/app/constants/Spacing";
import { api } from "@/convex/_generated/api";
import { showToast } from "@/lib/toast";
import { useUser } from "@clerk/clerk-expo";
import { useAction, useQuery } from "convex/react";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreditScorePage() {
  const { user } = useUser();
  const performPrediction = useAction(api.predictions.predictCreditScore);
  const latestPrediction = useQuery(
    api.predictions.getLatestPredictionForClerk,
    user?.id ? { clerkId: user.id } : "skip"
  );

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

  // Use latest prediction from DB if available, otherwise use the new result
  const displayResult = result || (latestPrediction ? {
    predicted_score: latestPrediction.predicted_score,
    confidence: latestPrediction.confidence,
    model_version: latestPrediction.model_version,
  } : null);

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
      showToast({ type: "error", title: "Transaction Failed", message: `${err.message}` || String(err) });

    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <ScrollView contentContainerStyle={{ padding: Spacing * 2 }}>
        <Text style={{ color: Colors.portfolio.textPrimary, fontSize: 24, marginBottom: Spacing }}>
          Credit Score Prediction
        </Text>

        {/* Gauge Display */}
        {displayResult && displayResult.predicted_score && (
          <View style={{ backgroundColor: Colors.portfolio.card, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: Spacing * 2 }}>
            <CreditScoreGauge score={displayResult.predicted_score} size={220} strokeWidth={24} />
            <View style={{ marginTop: Spacing, width: '100%', alignItems: 'center' }}>
              <Text style={{ color: Colors.portfolio.textSecondary, marginTop: Spacing }}>
                Confidence: {displayResult.confidence}
              </Text>
              <Text style={{ color: Colors.portfolio.textSecondary, marginTop: 4, fontSize: 12 }}>
                Model version: {displayResult.model_version}
              </Text>
            </View>
          </View>
        )}

        <View style={{ backgroundColor: 'rgba(29,24,86,0.72)', borderRadius: 16, padding: Spacing * 1.5, marginBottom: Spacing }}>
          <View style={{ marginBottom: Spacing }}>
            <Text style={{ color: Colors.portfolio.textSecondary }}>Age</Text>
            <TextInput
              keyboardType="numeric"
              value={String(age)}
              onChangeText={(v) => setAge(Number(v) || 0)}
              style={{ backgroundColor: 'rgba(29,24,86,0.20)', color: Colors.portfolio.textPrimary, padding: 12, borderRadius: 8, marginTop: 8 }}
            />
          </View>

          <View style={{ marginBottom: Spacing }}>
            <Text style={{ color: Colors.portfolio.textSecondary }}>Monthly Inhand Salary</Text>
            <TextInput
              keyboardType="numeric"
              value={String(monthly_inhand_salary)}
              onChangeText={(v) => setSalary(Number(v) || 0)}
              style={{ backgroundColor: 'rgba(29,24,86,0.20)', color: Colors.portfolio.textPrimary, padding: 12, borderRadius: 8, marginTop: 8 }}
            />
          </View>

          <View style={{ marginBottom: Spacing }}>
            <Text style={{ color: Colors.portfolio.textSecondary }}>Number of Credit Cards</Text>
            <TextInput
              keyboardType="numeric"
              value={String(num_credit_card)}
              onChangeText={(v) => setNumCards(Number(v) || 0)}
              style={{ backgroundColor: 'rgba(29,24,86,0.20)', color: Colors.portfolio.textPrimary, padding: 12, borderRadius: 8, marginTop: 8 }}
            />
          </View>

          <View style={{ marginBottom: Spacing }}>
            <Text style={{ color: Colors.portfolio.textSecondary }}>Outstanding Debt</Text>
            <TextInput
              keyboardType="numeric"
              value={String(outstanding_debt)}
              onChangeText={(v) => setOutstandingDebt(Number(v) || 0)}
              style={{ backgroundColor: 'rgba(29,24,86,0.20)', color: Colors.portfolio.textPrimary, padding: 12, borderRadius: 8, marginTop: 8 }}
            />
          </View>

          <View style={{ marginBottom: Spacing }}>
            <Text style={{ color: Colors.portfolio.textSecondary }}>Credit Utilization Ratio (%)</Text>
            <TextInput
              keyboardType="numeric"
              value={String(credit_utilization_ratio)}
              onChangeText={(v) => setCreditUtil(Number(v) || 0)}
              style={{ backgroundColor: 'rgba(29,24,86,0.20)', color: Colors.portfolio.textPrimary, padding: 12, borderRadius: 8, marginTop: 8 }}
            />
          </View>

          <View style={{ marginBottom: Spacing }}>
            <Text style={{ color: Colors.portfolio.textSecondary }}>Monthly Balance</Text>
            <TextInput
              keyboardType="numeric"
              value={String(monthly_balance)}
              onChangeText={(v) => setMonthlyBalance(Number(v) || 0)}
              style={{ backgroundColor: 'rgba(29,24,86,0.20)', color: Colors.portfolio.textPrimary, padding: 12, borderRadius: 8, marginTop: 8 }}
            />
          </View>

          <View style={{ marginBottom: Spacing }}>
            <Text style={{ color: Colors.portfolio.textSecondary }}>Credit Mix (Standard / Good / Bad)</Text>
            <TextInput
              value={credit_mix}
              onChangeText={setCreditMix}
              style={{ backgroundColor: 'rgba(29,24,86,0.20)', color: Colors.portfolio.textPrimary, padding: 12, borderRadius: 8, marginTop: 8 }}
            />
          </View>

          <View style={{ marginBottom: Spacing }}>
            <Text style={{ color: Colors.portfolio.textSecondary }}>Customer ID (optional)</Text>
            <TextInput
              value={customer_id}
              onChangeText={setCustomerId}
              style={{ backgroundColor: 'rgba(29,24,86,0.20)', color: Colors.portfolio.textPrimary, padding: 12, borderRadius: 8, marginTop: 8 }}
            />
          </View>

          <TouchableOpacity
            onPress={submit}
            disabled={loading}
            style={{ backgroundColor: Colors.portfolio.accent, padding: 16, borderRadius: 12, alignItems: "center", marginBottom: Spacing }}
          >
            <Text style={{ color: Colors.portfolio.textPrimary }}>{loading ? "Predicting..." : "Predict"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}