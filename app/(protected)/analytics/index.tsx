import Colors from "@/app/constants/Colors";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { ArrowDown, ArrowUp, Search } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Dimensions, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

type TimeRange = "D" | "W" | "M" | "Y";

type PaymentRow = {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: number;
  type: "credit" | "debit";
};

type ChartDataPoint = {
  name: string;
  credit: number;
  debit: number;
  total: number;
  maxValue: number;
};

const TIME_RANGES: Record<TimeRange, { days: number; groupBy: string }> = {
  D: { days: 7, groupBy: "day" },
  W: { days: 35, groupBy: "week" },
  M: { days: 150, groupBy: "week" },
  Y: { days: 365, groupBy: "month" }
};

// Custom Chart Component
const CustomBarChart = ({ data }: { data: ChartDataPoint[] }) => {
  const chartHeight = 250;
  const barWidth = (Dimensions.get('window').width - 80) / Math.max(data.length, 1);
  const maxValue = data[0]?.maxValue || 1;

  return (
    <View className="flex-row h-[250px] relative">
      {/* Y-axis labels */}
      <View className="justify-between pr-2 py-2.5">
        {[4, 3, 2, 1, 0].map((i) => (
          <Text key={i} className="text-[11px] text-[#C4DBF7]">
            {((maxValue * i) / 4 / 1000).toFixed(1)}k
          </Text>
        ))}
      </View>

      {/* Bars with horizontal gridlines */}
      <View className="flex-1">
        <View className="absolute left-0 right-0 top-2.5 bottom-7.5 justify-between" pointerEvents="none">
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} className="h-px bg-[#575886] opacity-20" />
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 z-[1]">
          <View className="flex-row items-end h-[250px] pb-7.5">
            {data.map((item, index) => {
              const creditHeight = Math.max((item.credit / maxValue) * (chartHeight - 40), 4);
              const debitHeight = Math.max((item.debit / maxValue) * (chartHeight - 40), 4);

              return (
                <View key={index} className="items-center px-1.5" style={{ width: barWidth }}>
                  <View className="flex-1 justify-end" style={{ width: '60%' }}>
                    <View className="w-full rounded-lg overflow-hidden" style={{ height: debitHeight, backgroundColor: Colors.portfolio.chartSecondary, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 2 }} />
                    <View className="w-full rounded-lg overflow-hidden" style={{ height: creditHeight, backgroundColor: Colors.portfolio.chartPrimary, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderTopLeftRadius: 0, borderTopRightRadius: 0 }} />
                  </View>
                  <Text className="text-[10px] text-[#C4DBF7] mt-2 text-center">{item.name}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

// Transaction Item Component
const TransactionItem = ({ txn }: { txn: PaymentRow }) => (
  <View className="flex-row justify-between items-center bg-[#1D1856] rounded-2xl p-4 mb-3">
    <View className="flex-row items-center gap-3 flex-1">
      <View className={`w-10 h-10 rounded-full justify-center items-center ${txn.type === 'credit' ? 'bg-blue-500' : 'bg-red-500'}`}>
        {txn.type === 'credit' ? (
          <ArrowDown size={18} color="#fff" />
        ) : (
          <ArrowUp size={18} color="#fff" />
        )}
      </View>
      <View>
        <Text className="text-sm font-semibold text-[#EFF3FE]">
          {txn.sender === "You" ? `To ${txn.receiver}` : `From ${txn.sender}`}
        </Text>
        <Text className="text-[11px] text-[#C4DBF7] mt-0.5">
          {new Date(txn.createdAt).toLocaleDateString()} • {txn.status}
        </Text>
      </View>
    </View>
    <View className="items-end">
      <Text className="text-sm font-semibold text-[#EFF3FE]">
        Rs. {txn.amount.toLocaleString()}
      </Text>
      <Text className="text-[11px] text-[#C4DBF7] mt-0.5">{txn.status}</Text>
    </View>
  </View>
);

export default function TransactionAnalytics() {
  const { userId } = useAuth();
  const dbUser = useQuery(api.users.getUserByClerkId, userId ? { clerkId: userId } : "skip");
  const paymentsData = useQuery(api.payments.getRecentPaymentsWithUsers, userId ? { clerkId: userId, limit: 100 } : "skip");

  const [timeRange, setTimeRange] = useState<TimeRange>("M");
  const [searchQuery, setSearchQuery] = useState("");

  // Transform payments data into transactions
  const transactions: PaymentRow[] = useMemo(() => {
    const mapped = (paymentsData || []).map((p: any) => {
      const currentUserId = dbUser?._id;
      const isSender = p.sender?._id === currentUserId;
      const senderName = p.sender?.clerkId || (isSender ? "You" : "Unknown");
      const receiverName = p.receiver?.clerkId || (!isSender ? "You" : "Unknown");
      
      return {
        id: p._id,
        sender: senderName,
        receiver: receiverName,
        amount: p.amount,
        currency: p.currency || "PKR",
        status: p.status || "completed",
        createdAt: p.createdAt,
        type: isSender ? "debit" : "credit",
      } as PaymentRow;
    });

    return mapped.sort((a, b) => b.createdAt - a.createdAt);
  }, [paymentsData, dbUser]);

  // Generate chart data based on time range
  const chartData = useMemo(() => {
    const now = Date.now();
    const { days, groupBy } = TIME_RANGES[timeRange];
    const cutoff = now - (days * 24 * 60 * 60 * 1000);
    const filtered = transactions.filter(t => t.createdAt >= cutoff);

    const grouped = new Map<string, { credit: number; debit: number }>();

    filtered.forEach(txn => {
      const date = new Date(txn.createdAt);
      let key: string;

      if (groupBy === "day") {
        key = `${date.getMonth() + 1}/${date.getDate()}`;
      } else if (groupBy === "week") {
        const weekNum = Math.floor((now - txn.createdAt) / (7 * 24 * 60 * 60 * 1000));
        const weekStart = new Date(now - (weekNum * 7 * 24 * 60 * 60 * 1000));
        key = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      } else {
        key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      }

      if (!grouped.has(key)) grouped.set(key, { credit: 0, debit: 0 });
      const entry = grouped.get(key)!;
      if (txn.type === "credit") entry.credit += txn.amount;
      else entry.debit += txn.amount;
    });

    const result = Array.from(grouped.entries()).map(([name, values]) => ({
      name,
      credit: Math.round(values.credit),
      debit: Math.round(values.debit),
      total: Math.round(values.credit + values.debit)
    })).slice(-12);

    const maxValue = Math.max(...result.map(d => d.total), 1);
    return result.map(d => ({ ...d, maxValue }));
  }, [transactions, timeRange]);

  // Filter transactions based on search query
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions.slice(0, 20);
    const q = searchQuery.toLowerCase();
    return transactions.filter(t => 
      t.sender.toLowerCase().includes(q) || 
      t.receiver.toLowerCase().includes(q) ||
      t.amount.toString().includes(q)
    ).slice(0, 20);
  }, [transactions, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Title */}
        <View className="px-6 py-4">
          <Text className="text-2xl font-bold text-[#EFF3FE]">Transactions</Text>
        </View>

        {/* Time Range Selector */}
        <View className="flex-row px-6 py-4 gap-2">
          {(["D", "W", "M", "Y"] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setTimeRange(range)}
              className={`flex-1 py-3 rounded-2xl items-center ${timeRange === range ? 'bg-[#575886]' : 'bg-transparent'}`}
            >
              <Text className={`${timeRange === range ? 'text-[#EFF3FE]' : 'text-[#C4DBF7]'} font-medium`}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <View className="px-6 py-4 h-[280px]">
          <CustomBarChart data={chartData} />
        </View>

        {/* Search */}
        <View className="flex-row items-center mx-6 my-2 bg-[#1D1856] rounded-2xl px-4 gap-2">
          <Search size={20} color="#666" />
          <TextInput
            placeholder="Search transactions..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 py-3 text-[#EFF3FE] text-base"
          />
        </View>

        {/* Transaction List */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold text-[#EFF3FE] mb-4">Recent Transactions</Text>
          {filteredTransactions.map((txn) => (
            <TransactionItem key={txn.id} txn={txn} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
