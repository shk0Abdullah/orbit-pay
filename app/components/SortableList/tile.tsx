import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SIZE } from "./Config";

const styles = StyleSheet.create({
  container: {
    width: SIZE - 40,
    height: 110,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
});
interface TileProps {
  id: string;
  onLongPress: () => void;
}

const Tile = ({ id }: TileProps) => {
  if (id === "spent") {
    return (
      <View style={styles.container} pointerEvents="none">
        <Text
          style={{
            color: "#6B7280", // gray
            fontWeight: "500",
            fontSize: 16,
          }}
        >
          Spent this Month
        </Text>

        <Text
          style={{
            color: "#000",
            fontWeight: "bold",
            fontSize: 26,
            paddingTop: 10,
          }}
        >
          $100
        </Text>
      </View>
    );
  }

  if (id === "cashback") {
    return (
      <View style={styles.container} pointerEvents="none">
        <Text
          style={{
            color: "#6B7280", // gray
            fontWeight: "500",
            fontSize: 16,
          }}
        >
          Cashback
        </Text>

        <Text
          style={{
            color: "#000",
            fontWeight: "bold",
            fontSize: 26,
            paddingTop: 10,
          }}
        >
          %5
        </Text>
      </View>
    );
  }
  if (id === "recent") {
    return (
      <View style={styles.container} pointerEvents="none">
        <Text
          style={{
            color: "#6B7280", // gray
            fontWeight: "500",
            fontSize: 16,
          }}
        >
          Recent Transaction
        </Text>

        <Text
          style={{
            color: "#000",
            fontWeight: "bold",
            fontSize: 26,
            paddingTop: 10,
          }}
        >
          $100
        </Text>
      </View>
    );
  }
};

export default Tile;
