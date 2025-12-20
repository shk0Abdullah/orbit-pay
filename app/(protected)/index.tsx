// // app/index.tsx
// import { SignOutButton } from "@/app/components/SignOutButton";
// import { api } from "@/convex/_generated/api";
// import { useAuth, useUser } from "@clerk/clerk-expo";
// import { useQuery } from "convex/react";
// import { Link } from "expo-router";
// import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react-native";
// import { Text, TouchableOpacity, View } from "react-native";
// import Widget from "../components/SortableList/Widget";

// export default function Home() {
//   const { user } = useUser();
//   const { userId } = useAuth();

//   const dbUser = useQuery(
//     api.users.getUserByClerkId,
//     userId ? { clerkId: userId } : "skip"
//   );

//   return (
//     <View className="flex-1 justify-between">
//       {/* Header */}
//       <SignOutButton />

//       {/* Balance Card */}
//       <View className=" rounded-3xl p-5 mb-4 shadow-2xl">
//         <View className="flex-row items-center justify-between mb-3">
//           <View className="flex-row items-center">
//             <Wallet size={14} color="#c0f667" />
//             <Text className="text-[#f5f5f5]/80 text-xs uppercase tracking-widest ml-2 font-semibold">
//               Total Balance
//             </Text>
//           </View>
//           <View className="bg-[#c0f667]/20 px-2 py-1 rounded-full">
//             <Text className="text-[#c0f667] text-xs font-bold">ACTIVE</Text>
//           </View>
//         </View>

//         <Text className="text-[#c0f667] text-4xl font-extrabold mb-3">
//           PKR {dbUser?.balance}
//         </Text>

//         <View className="bg-[#100C08]/20 rounded-2xl p-3">
//           <Text className="text-[#f5f5f5]/60 text-xs mb-1">Account</Text>
//           <Text className="text-[#f5f5f5] text-xs font-medium">
//             {user?.emailAddresses[0].emailAddress}
//           </Text>
//         </View>
//       </View>

//       {/* Quick Actions - Send & Receive */}
//       <View className="flex-row gap-3 mb-4">
//         <Link href="/(protected)/bluetooth/client" asChild>
//           <TouchableOpacity className="flex-1">
//             <View className="bg-[#4710cb] rounded-2xl p-4 shadow-lg items-center">
//               <View className="w-12 h-12 rounded-full bg-[#c0f667] items-center justify-center mb-2">
//                 <ArrowUpRight size={24} color="#100C08" strokeWidth={3} />
//               </View>
//               <Text className="text-[#f5f5f5] text-base font-bold">Send</Text>
//               <Text className="text-[#f5f5f5]/60 text-xs mt-1">
//                 Transfer funds
//               </Text>
//             </View>
//           </TouchableOpacity>
//         </Link>

//         <Link href="/(protected)/bluetooth/server" asChild>
//           <TouchableOpacity className="flex-1">
//             <View className="bg-[#f5f5f5] rounded-2xl p-4 shadow-lg items-center">
//               <View className="w-12 h-12 rounded-full bg-[#4710cb] items-center justify-center mb-2">
//                 <ArrowDownLeft size={24} color="#c0f667" strokeWidth={3} />
//               </View>
//               <Text className="text-[#100C08] text-base font-bold">
//                 Receive
//               </Text>
//               <Text className="text-[#100C08]/60 text-xs mt-1">
//                 Accept payment
//               </Text>
//             </View>
//           </TouchableOpacity>
//         </Link>
//       </View>

//       {/* Features Grid */}
//       <View className="mb-4">
//         <Text className="text-[#f5f5f5] text-base font-bold mb-3">
//           Features
//         </Text>
//         <Widget />
//         {/* <View className="flex-row flex-wrap gap-2">
//           <View className="w-[48%] bg-[#f5f5f5]/10 rounded-2xl p-3 border border-[#f5f5f5]/10">
//             <View className="w-8 h-8 rounded-full bg-[#4710cb]/20 items-center justify-center mb-2">
//               <Radio size={16} color="#c0f667" />
//             </View>
//             <Text className="text-[#f5f5f5] text-xs font-semibold mb-1">
//               Bluetooth
//             </Text>
//             <Text className="text-[#f5f5f5]/60 text-xs">Offline transfers</Text>
//           </View>

//           <View className="w-[48%] bg-[#f5f5f5]/10 rounded-2xl p-3 border border-[#f5f5f5]/10">
//             <View className="w-8 h-8 rounded-full bg-[#c0f667]/20 items-center justify-center mb-2">
//               <Zap size={16} color="#c0f667" />
//             </View>
//             <Text className="text-[#f5f5f5] text-xs font-semibold mb-1">
//               Instant
//             </Text>
//             <Text className="text-[#f5f5f5]/6=0 text-xs">
//               Real-time settlement
//             </Text>
//           </View>

//           <View className="w-[48%] bg-[#f5f5f5]/10 rounded-2xl p-3 border border-[#f5f5f5]/10">
//             <View className="w-8 h-8 rounded-full bg-[#4710cb]/20 items-center justify-center mb-2">
//               <TrendingUp size={16} color="#4710cb" />
//             </View>
//             <Text className="text-[#f5f5f5] text-xs font-semibold mb-1">
//               DeFi Ready
//             </Text>
//             <Text className="text-[#f5f5f5]/60 text-xs">Crypto enabled</Text>
//           </View>

//           <View className="w-[48%] bg-[#f5f5f5]/10 rounded-2xl p-3 border border-[#f5f5f5]/10">
//             <View className="w-8 h-8 rounded-full bg-[#c0f667]/20 items-center justify-center mb-2">
//               <Clock size={16} color="#f5f5f5" />
//             </View>
//             <Text className="text-[#f5f5f5] text-xs font-semibold mb-1">
//               History
//             </Text>
//             <Text className="text-[#f5f5f5]/60 text-xs">
//               Track all transactions
//             </Text>
//           </View>
//         </View> */}
//       </View>

//       {/* Recent Activity */}
//       <View className="flex-1">
//         <Text className="text-[#f5f5f5] text-base font-bold mb-3">
//           Recent Activity
//         </Text>

//         {/* Activity Item */}
//         <View className="bg-[#f5f5f5]/10 rounded-2xl p-3 mb-2 border border-[#f5f5f5]/10">
//           <View className="flex-row items-center justify-between">
//             <View className="flex-row items-center flex-1">
//               <View className="w-8 h-8 rounded-full bg-[#c0f667]/20 items-center justify-center mr-3">
//                 <ArrowUpRight size={16} color="#c0f667" />
//               </View>
//               <View className="flex-1">
//                 <Text className="text-[#f5f5f5] text-xs font-semibold">
//                   Payment Sent
//                 </Text>
//                 <Text className="text-[#f5f5f5]/60 text-xs">2 hours ago</Text>
//               </View>
//             </View>
//             <Text className="text-[#f5f5f5] text-sm font-bold">-PKR 500</Text>
//           </View>
//         </View>

//         <View className="bg-[#f5f5f5]/10 rounded-2xl p-3 border border-[#f5f5f5]/10">
//           <View className="flex-row items-center justify-between">
//             <View className="flex-row items-center flex-1">
//               <View className="w-8 h-8 rounded-full bg-[#4710cb]/20 items-center justify-center mr-3">
//                 <ArrowDownLeft size={16} color="#4710cb" />
//               </View>
//               <View className="flex-1">
//                 <Text className="text-[#f5f5f5] text-xs font-semibold">
//                   Payment Received
//                 </Text>
//                 <Text className="text-[#f5f5f5]/60 text-xs">Yesterday</Text>
//               </View>
//             </View>
//             <Text className="text-[#c0f667] text-sm font-bold">+PKR 1,200</Text>
//           </View>
//         </View>
//       </View>
//     </View>
//   );
// }
import CoinInfo from "@/app/components/HomeUI/CoinInfo";
import Colors from "@/app/constants/Colors";
import Font from "@/app/constants/Fonts";
import FontSize from "@/app/constants/FontSize";
import { Spacing } from "@/app/constants/Spacing";
import { activitiesData, defaultCoin, MyKey } from "@/app/data";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Home = () => {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SafeAreaView>
        <View style={{ paddingHorizontal: Spacing * 2 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Ionicons name="search" size={24} color={Colors.text} />
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: Colors.text,
                  fontSize: FontSize.medium,
                  fontFamily: Font["poppins-semiBold"],
                  marginRight: Spacing / 2,
                }}
              >
                Wallet1
              </Text>
              <Ionicons name="chevron-down" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Ionicons name="scan" size={24} color={Colors.text} />
          </View>
          <View style={{ marginVertical: Spacing * 3 }}>
            <View
              style={{
                marginTop: Spacing * 3,
                flexDirection: "row",
                backgroundColor: Colors.lightBackground,
                paddingVertical: Spacing / 2,
                borderRadius: Spacing * 4,
                width: Spacing * 15,
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "center",
              }}
            >
              <Text
                style={{
                  color: Colors.text,
                  fontSize: FontSize.small,
                  fontFamily: Font["poppins-regular"],
                  width: Spacing * 10,
                }}
                numberOfLines={1}
              >
                {MyKey}
              </Text>
              <Ionicons name="copy-outline" size={16} color={Colors.primary} />
            </View>

            <View style={{ flexDirection: "row", alignSelf: "center" }}>
              <Text
                style={{
                  color: Colors.text,
                  fontSize: FontSize.xxLarge * 2,
                  fontFamily: Font["poppins-regular"],
                }}
              >
                $
              </Text>
              <TextInput
                style={{
                  color: Colors.text,
                  fontSize: FontSize.xxLarge * 2,
                  fontFamily: Font["poppins-regular"],
                }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: Spacing * 2,
              }}
            >
              <TouchableOpacity
                onPress={() => router.push("/")}
                style={{
                  backgroundColor: Colors.primary,
                  paddingHorizontal: Spacing * 3,
                  paddingVertical: Spacing * 2,
                  borderRadius: Spacing * 10,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "45%",
                }}
              >
                <Text
                  style={{
                    fontSize: FontSize.large,
                    color: Colors.onPrimary,
                    marginRight: Spacing,
                  }}
                >
                  Send
                </Text>
                <MaterialIcons
                  name="arrow-outward"
                  size={24}
                  color={Colors.onPrimary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.secondary,
                  paddingHorizontal: Spacing * 3,
                  paddingVertical: Spacing * 2,
                  borderRadius: Spacing * 10,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "45%",
                }}
              >
                <Text
                  style={{
                    fontSize: FontSize.large,
                    color: Colors.onSecondary,
                    marginRight: Spacing,
                  }}
                >
                  Receive
                </Text>
                <MaterialIcons
                  name="arrow-outward"
                  size={24}
                  color={Colors.onSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View
          style={{
            backgroundColor: Colors.lightBackground,
            paddingHorizontal: Spacing * 2,
            paddingTop: Spacing * 3,
            paddingBottom: Spacing * 6,
            borderTopRightRadius: Spacing * 3,
            borderTopLeftRadius: Spacing * 3,
          }}
        >
          <CoinInfo info={defaultCoin} />
        </View>
        <View
          style={{
            paddingHorizontal: Spacing * 2,
            paddingVertical: Spacing * 3,
            backgroundColor: Colors.white,
            marginTop: -Spacing * 4,
            borderTopRightRadius: Spacing * 3,
            borderTopLeftRadius: Spacing * 3,
          }}
        >
          <Text
            style={{
              color: Colors.blackText,
              fontFamily: Font["poppins-semiBold"],
              fontSize: FontSize.large,
              marginBottom: Spacing * 2,
            }}
          >
            Activity
          </Text>
          {activitiesData.map((activity) => (
            <View
              style={{
                borderTopWidth: 0.2,
                borderColor: Colors.lightText,
                paddingVertical: Spacing,
              }}
              key={activity.id}
            >
              <CoinInfo theme="light" info={activity} />
            </View>
          ))}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Home;
