import React, { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Search, ArrowDown, ArrowUp } from "lucide-react-native";
import Colors from "@/app/constants/Colors";
import Fonts from "@/app/constants/Fonts";
import FontSize from "@/app/constants/FontSize";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/clerk-expo";

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
    <View style={styles.customChart}>
      {/* Y-axis labels */}
      <View style={styles.yAxisLabels}>
        {[4, 3, 2, 1, 0].map((i) => (
          <Text key={i} style={styles.yAxisLabel}>
            {((maxValue * i) / 4 / 1000).toFixed(1)}k
          </Text>
        ))}
      </View>

      {/* Bars with horizontal gridlines */}
      <View style={{ flex: 1 }}>
        <View style={styles.gridLines} pointerEvents="none">
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.gridLine} />
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
          <View style={styles.barsContainer}>
            {data.map((item, index) => {
              const creditHeight = Math.max((item.credit / maxValue) * (chartHeight - 40), 4);
              const debitHeight = Math.max((item.debit / maxValue) * (chartHeight - 40), 4);

              return (
                <View key={index} style={[styles.barGroup, { width: barWidth }]}>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, styles.barDebit, { height: debitHeight }]} />
                    <View style={[styles.bar, styles.barCredit, { height: creditHeight }]} />
                  </View>
                  <Text style={styles.xAxisLabel}>{item.name}</Text>
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
  <View style={styles.transactionItem}>
    <View style={styles.transactionLeft}>
      <View style={[
        styles.transactionIcon,
        txn.type === 'credit' ? styles.transactionIconCredit : styles.transactionIconDebit
      ]}>
        {txn.type === 'credit' ? (
          <ArrowDown size={18} color="#fff" />
        ) : (
          <ArrowUp size={18} color="#fff" />
        )}
      </View>
      <View>
        <Text style={styles.transactionTitle}>
          {txn.sender === "You" ? `To ${txn.receiver}` : `From ${txn.sender}`}
        </Text>
        <Text style={styles.transactionMeta}>
          {new Date(txn.createdAt).toLocaleDateString()} • {txn.status}
        </Text>
      </View>
    </View>
    <View style={styles.transactionRight}>
      <Text style={styles.transactionAmount}>
        Rs. {txn.amount.toLocaleString()}
      </Text>
      <Text style={styles.transactionStatus}>{txn.status}</Text>
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Transactions</Text>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(["D", "W", "M", "Y"] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setTimeRange(range)}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive
              ]}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === range && styles.timeRangeTextActive
              ]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <CustomBarChart data={chartData} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            placeholder="Search transactions..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* Transaction List */}
        <View style={styles.transactionList}>
          <Text style={styles.transactionListTitle}>Recent Transactions</Text>
          {filteredTransactions.map((txn) => (
            <TransactionItem key={txn.id} txn={txn} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: FontSize.xxLarge,
    fontFamily: Fonts["poppins-bold"],
    color: Colors.portfolio.textPrimary,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.portfolio.cardSecondary,
  },
  timeRangeText: {
    color: Colors.portfolio.textSecondary,
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: Colors.portfolio.textPrimary,
  },
  chartContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    height: 280,
  },
  customChart: {
    flexDirection: 'row',
    height: 250,
    position: 'relative',
  },
  yAxisLabels: {
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingVertical: 10,
  },
  yAxisLabel: {
    fontSize: 11,
    color: Colors.portfolio.textSecondary,
  },
  chartScroll: {
    flex: 1,
    zIndex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 250,
    paddingBottom: 30,
  },
  barGroup: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '60%',
  },
  bar: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  barCredit: {
    backgroundColor: Colors.portfolio.chartPrimary,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  barDebit: {
    backgroundColor: Colors.portfolio.chartSecondary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 2,
  },
  xAxisLabel: {
    fontSize: 10,
    color: Colors.portfolio.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  gridLines: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 10,
    bottom: 30,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: Colors.portfolio.cardSecondary,
    opacity: 0.16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginVertical: 8,
    backgroundColor: Colors.portfolio.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: Colors.portfolio.textPrimary,
    fontSize: FontSize.medium,
  },
  transactionList: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  transactionListTitle: {
    fontSize: FontSize.large,
    fontFamily: Fonts["poppins-semiBold"],
    color: Colors.portfolio.textPrimary,
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.portfolio.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionIconCredit: {
    backgroundColor: '#3b82f6',
  },
  transactionIconDebit: {
    backgroundColor: '#ef4444',
  },
  transactionTitle: {
    fontSize: 14,
    fontFamily: Fonts["poppins-semiBold"],
    color: Colors.portfolio.textPrimary,
  },
  transactionMeta: {
    fontSize: 11,
    color: Colors.portfolio.textSecondary,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontFamily: Fonts["poppins-semiBold"],
    color: Colors.portfolio.textPrimary,
  },
  transactionStatus: {
    fontSize: 11,
    color: Colors.portfolio.textSecondary,
    marginTop: 2,
  },
});