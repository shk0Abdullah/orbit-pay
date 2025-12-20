import { ImageSourcePropType } from "react-native";

export type Activity = {
  id: number;
  icon: ImageSourcePropType;
  title: string;
  symbol: string;
  marketCap: string;
  percentageChange: number;
  amountBought: number;
  cost: number;
  type: "Buy" | "Sell";
  date: string;
};

export type Asset = {
  id: number;
  icon: ImageSourcePropType;
  title: string;
  symbol: string;
  marketCap: string;
};

export const MyKey = "bc1q9f73p0x8s4u2wz6v3d7lqahny5jtrmkcepgf9s";

export const defaultCoin: Activity = {
  id: 5,
  icon: require("@/assets/images/logos/binance-coin-bnb-logo.png"),
  title: "Binance Coin",
  symbol: "BNB",
  marketCap: "$90B",
  percentageChange: 3.4,
  amountBought: 4,
  cost: 2400,
  type: "Buy",
  date: "2025-10-11",
};

export const activitiesData: Activity[] = [
  { ...defaultCoin },
  {
    id: 1,
    icon: require("@/assets/images/logos/bitcoin-btc-logo.png"),
    title: "Bitcoin",
    symbol: "BTC",
    marketCap: "$1.2T",
    percentageChange: 2.8,
    amountBought: 0.02,
    cost: 1280,
    type: "Buy",
    date: "2025-10-10",
  },
  {
    id: 2,
    icon: require("@/assets/images/logos/ethereum-eth-logo.png"),
    title: "Ethereum",
    symbol: "ETH",
    marketCap: "$480B",
    percentageChange: 4.5,
    amountBought: 0.6,
    cost: 2050,
    type: "Buy",
    date: "2025-10-11",
  },
  {
    id: 3,
    icon: require("@/assets/images/logos/cardano-ada-logo.png"),
    title: "Cardano",
    symbol: "ADA",
    marketCap: "$55B",
    percentageChange: -1.3,
    amountBought: 800,
    cost: 210,
    type: "Buy",
    date: "2025-09-20",
  },
  {
    id: 4,
    icon: require("@/assets/images/logos/solana-sol-logo.png"),
    title: "Solana",
    symbol: "SOL",
    marketCap: "$95B",
    percentageChange: 6.2,
    amountBought: 10,
    cost: 900,
    type: "Buy",
    date: "2025-09-25",
  },
  {
    id: 8,
    icon: require("@/assets/images/logos/polygon-matic-logo.png"),
    title: "Polygon",
    symbol: "MATIC",
    marketCap: "$18B",
    percentageChange: 3.9,
    amountBought: 500,
    cost: 340,
    type: "Buy",
    date: "2025-10-05",
  },
  {
    id: 9,
    icon: require("@/assets/images/logos/dogecoin-doge-logo.png"),
    title: "Dogecoin",
    symbol: "DOGE",
    marketCap: "$22B",
    percentageChange: -0.8,
    amountBought: 1200,
    cost: 180,
    type: "Buy",
    date: "2025-10-09",
  },
  {
    id: 10,
    icon: require("@/assets/images/logos/avalanche-avax-logo.png"),
    title: "Avalanche",
    symbol: "AVAX",
    marketCap: "$35B",
    percentageChange: 2.3,
    amountBought: 15,
    cost: 450,
    type: "Buy",
    date: "2025-10-10",
  },
];

export const assets: Asset[] = [
  { ...defaultCoin },
  {
    id: 1,
    icon: require("@/assets/images/logos/bitcoin-btc-logo.png"),
    title: "Bitcoin",
    symbol: "BTC",
    marketCap: "$1.2T",
  },
  {
    id: 2,
    icon: require("@/assets/images/logos/ethereum-eth-logo.png"),
    title: "Ethereum",
    symbol: "ETH",
    marketCap: "$480B",
  },
  {
    id: 3,
    icon: require("@/assets/images/logos/cardano-ada-logo.png"),
    title: "Cardano",
    symbol: "ADA",
    marketCap: "$55B",
  },
  {
    id: 4,
    icon: require("@/assets/images/logos/solana-sol-logo.png"),
    title: "Solana",
    symbol: "SOL",
    marketCap: "$95B",
  },
  {
    id: 8,
    icon: require("@/assets/images/logos/polygon-matic-logo.png"),
    title: "Polygon",
    symbol: "MATIC",
    marketCap: "$18B",
  },
  {
    id: 9,
    icon: require("@/assets/images/logos/dogecoin-doge-logo.png"),
    title: "Dogecoin",
    symbol: "DOGE",
    marketCap: "$22B",
  },
  {
    id: 10,
    icon: require("@/assets/images/logos/avalanche-avax-logo.png"),
    title: "Avalanche",
    symbol: "AVAX",
    marketCap: "$35B",
  },
];
