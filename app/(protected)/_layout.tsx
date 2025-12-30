import { useAuth } from "@clerk/clerk-expo";
import {
  Redirect,
  RelativePathString,
  Slot,
  useRouter,
  useSegments,
} from "expo-router";
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import "@/global.css";
import {
  Bluetooth,
  BluetoothOff,
  CreditCard,
  Home,
  QrCode,
  SmartphoneNfc,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";

import RNBluetoothClassic from "react-native-bluetooth-classic";

export default function RootLayout() {
  const segments = useSegments();
  const [bleEnabled, setBleEnabled] = useState<null | boolean>(null);
  const { isSignedIn } = useAuth();
  const router = useRouter();
  // const pathname = usePathname();

  const enableBluetooth = async () => {
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      console.log("Enabled:", enabled);
      if (!enabled) {
        console.log("gonna wait for the await");
        await RNBluetoothClassic.requestBluetoothEnabled();
      }

      const updatedStatus = await RNBluetoothClassic.isBluetoothEnabled();
      console.log(updatedStatus);
      setBleEnabled(updatedStatus);

      Alert.alert(updatedStatus ? "Bluetooth Enabled" : "Bluetooth Disabled");
    } catch {
      Alert.alert("Failed to enable Bluetooth");
    }
  };

  useEffect(() => {
    const checkBluetooth = async () => {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      setBleEnabled(enabled);
    };

    checkBluetooth();
  }, []);

  if (!isSignedIn) {
    return <Redirect href="/(auth)/signin" />;
  }

  const navItems = [
    {
      name: "Home",
      icon: Home,
      route: "/(protected)",
      segments: ["(protected)"],
    },
    {
      name: "Activity",
      icon: SmartphoneNfc,
      route: "/(app)/activity",
      segments: ["(app)", "activity"],
    },
    {
      name: "QR",
      icon: QrCode,
      route: "/(scan)",
      segments: ["(scan)"],
      isCenter: true,
    },
    {
      name: "Wallet",
      icon: CreditCard,
      route: "/(wallet)",
      segments: ["(wallet)"],
    },
    {
      name: "Profile",
      icon: User,
      route: "/(protected)/profile",
      segments: ["(protected)", "profile"],
    },
  ];

  const isActive = (target: string[]) => {
    if (segments.length !== target.length) return false;
    return target.every((seg, i) => segments[i] === seg);
  };

  return (
    <ImageBackground
      source={require("@/assets/screens/dashboard-bg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <View className={"flex-1"}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          className="flex-1"
        >
          <View className="flex-1 px-4 mt-4 pt-6 m-2 p-3 pb-24">
            {/* Enhanced Header */}
            <View className="flex-row justify-between items-center pt-4 pb-3 border-b border-[#f5f5f5]/10">
              {/* Logo */}
              <View className="flex-row items-center">
                <Image
                  source={require("@/assets/images/withoutbg.png")}
                  style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row items-center gap-2">
                {/* Bluetooth toggle */}
                <TouchableOpacity
                  onPress={enableBluetooth}
                  className={`p-2.5 rounded-full shadow-lg ${
                    bleEnabled ? "bg-[#001C71]" : "bg-[#99838395]"
                  }`}
                >
                  {bleEnabled ? (
                    <Bluetooth size={20} color="#86D2FF" />
                  ) : (
                    <BluetoothOff size={20} color="#f5f5f5" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* App content */}
            <View className="flex-1">
              <Slot />
            </View>
          </View>
        </ScrollView>

        {/* Custom Bottom Navigation */}
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-6">
          <View className="bg-[#86D2FF] rounded-3xl px-6 py-5">
            <View className="flex-row justify-around items-center">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.segments);

                if (item.isCenter) {
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() =>
                        router.push(item.route as RelativePathString)
                      }
                      className="-mt-10"
                    >
                      <View className="w-16 h-16 rounded-full bg-[#001C71] items-center justify-center">
                        <Icon size={30} color="#86D2FF" />
                      </View>
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      router.push(item.route as RelativePathString)
                    }
                    className="items-center"
                  >
                    <Icon
                      size={26}
                      color={active ? "#001C71" : "#001C71"}
                      strokeWidth={active ? 3 : 2}
                    />

                    {/* ACTIVE UNDERLINE */}
                    <View
                      className={`mt-1 h-[3px] rounded-full ${
                        active ? "w-6 bg-[#001C71]" : "w-0"
                      }`}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}
