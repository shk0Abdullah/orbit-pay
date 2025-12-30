import React from "react";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SafeAreaView, View, Text, FlatList } from "react-native";
import Colors from "@/app/constants/Colors";
import { Spacing } from "@/app/constants/Spacing";

export default function PredictionHistory() {
  const { user } = useUser();
  const data = useQuery(api.predictions.getPredictionsForClerk, {
    clerkId: user?.id!,
    limit: 50,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.black, padding: Spacing * 2 }}>
      <Text style={{ color: Colors.text, fontSize: 22, marginBottom: Spacing }}>Prediction History</Text>
      <FlatList
        data={data ?? []}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }: any) => (
          <View style={{ backgroundColor: "#111", padding: 12, borderRadius: 10, marginBottom: 12 }}>
            <Text style={{ color: Colors.text }}>Score: {item.predicted_score}</Text>
            <Text style={{ color: Colors.text }}>Confidence: {item.confidence}</Text>
            <Text style={{ color: Colors.text }}>Customer ID: {item.customer_id ?? "-"}</Text>
            <Text style={{ color: Colors.text }}>At: {new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}