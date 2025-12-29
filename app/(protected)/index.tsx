import CoinInfo from "@/app/components/HomeUI/CoinInfo";
import Colors from "@/app/constants/Colors";
import Font from "@/app/constants/Fonts";
import FontSize from "@/app/constants/FontSize";
import { Spacing } from "@/app/constants/Spacing";
import { activitiesData, defaultCoin } from "@/app/data";
import { balanceAtom, walletAtom } from "@/app/store/Atom";
import { api } from "@/convex/_generated/api";
import { getSolBalance, loadWallet } from "@/lib/Solana/walletCreate"; // adjust path if needed
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useAtom } from "jotai";
import React, { useEffect } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Home = () => {
  const { userId } = useAuth();
  const [balance, setBalance] = useAtom(balanceAtom);
  const [wlt, setWalletAddress] = useAtom(walletAtom);

  const dbUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };
  useEffect(() => {
    (async () => {
      const wallet = await loadWallet();
      console.log(wallet);
      console.log(wallet?.publicKey.toBase58());
      console.log(balance);

      if (!wallet) {
        Alert.alert("Wallet not found", "Create a wallet first.");
        return;
      }

      setWalletAddress(wallet.publicKey.toBase58());
      const bal = await getSolBalance(wallet.publicKey.toBase58());
      setBalance(bal);
    })();
  }, []);
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
                {wlt}
              </Text>

              <TouchableOpacity
                onPress={() => copyToClipboard(wlt)}
                style={{ marginLeft: 8 }}
              >
                <Ionicons
                  name="copy-outline"
                  size={16}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", alignSelf: "center" }}>
              <Text
                style={{
                  color: Colors.text,
                  fontSize: FontSize.xxLarge * 2,
                  fontFamily: Font["poppins-regular"],
                }}
              >
                $ {dbUser?.balance}
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
              {/* Send Button */}
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(protected)/Distinguisher/selector",
                    params: { type: "send" },
                  })
                }
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

              {/* Receive Button */}
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(protected)/Distinguisher/selector",
                    params: { type: "receive" },
                  })
                }
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
