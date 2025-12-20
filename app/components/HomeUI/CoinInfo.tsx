import Colors from "@/app/constants/Colors";
import Font from "@/app/constants/Fonts";
import { Spacing } from "@/app/constants/Spacing";
import { Activity } from "@/app/data";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  info: Activity;
  theme?: "light" | "dark";
};

const CoinInfo: React.FC<Props> = ({ info, theme = "dark" }) => {
  return (
    <TouchableOpacity
      style={{ flexDirection: "row", justifyContent: "space-between" }}
    >
      <View style={{ flexDirection: "row" }}>
        <Image
          style={{
            height: Spacing * 4,
            width: Spacing * 4,
            borderRadius: Spacing * 10,
            marginRight: Spacing,
          }}
          source={info.icon}
        />
        <View>
          <Text
            style={{
              color: theme === "dark" ? Colors.text : Colors.blackText,
              fontFamily: Font["poppins-regular"],
            }}
          >
            {info.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                color: Colors.lightText,
                fontFamily: Font["poppins-regular"],
                marginRight: Spacing * 2,
              }}
            >
              {info.marketCap}
            </Text>
            <Text
              style={{
                color:
                  info.percentageChange > 0 ? Colors.seccuess : Colors.danger,
                fontFamily: Font["poppins-regular"],
              }}
            >
              {info.percentageChange > 0 ? "+" : "+"}
              {info.percentageChange}%
            </Text>
            <Ionicons
              name="arrow-up"
              size={16}
              color={
                info.percentageChange > 0 ? Colors.seccuess : Colors.danger
              }
            />
          </View>
        </View>
      </View>
      <View>
        <Text
          style={{
            color: theme === "dark" ? Colors.text : Colors.blackText,
            fontFamily: Font["poppins-regular"],
          }}
        >
          {info.amountBought}
        </Text>
        <Text
          style={{
            color: Colors.lightText,
            fontFamily: Font["poppins-regular"],
          }}
        >
          ${info.cost}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CoinInfo;
