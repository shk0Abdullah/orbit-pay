import { useRouter } from "expo-router";
import {
  AlertCircle,
  Bluetooth,
  CheckCircle,
  Radio,
  Search,
  Wifi,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RNBluetoothClassic, {
  BluetoothDevice,
} from "react-native-bluetooth-classic";

export default function BluetoothClient() {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] =
    useState<BluetoothDevice | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const connectingRef = useRef(false);

  const scanPulse = useRef(new Animated.Value(1)).current;
  const scanRotate = useRef(new Animated.Value(0)).current;

  const enableBluetooth = async () => {
    const enabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (!enabled) {
      await RNBluetoothClassic.requestBluetoothEnabled();
    }
  };

  const scanAllDevices = async () => {
    try {
      setLoading(true);
      startScanAnimation();

      const paired = await RNBluetoothClassic.getBondedDevices();
      const discoveryPromise = RNBluetoothClassic.startDiscovery();

      setTimeout(() => {
        RNBluetoothClassic.cancelDiscovery();
      }, 4000);

      const unpaired = await discoveryPromise;

      const combined = [...paired];
      unpaired.forEach((d) => {
        if (!combined.find((p) => p.address === d.address)) {
          combined.push(d);
        }
      });

      setDevices(combined);
    } catch {
      Alert.alert("Scan failed");
    } finally {
      setLoading(false);
      stopScanAnimation();
    }
  };

  const connectTo = async (device: BluetoothDevice) => {
    if (connectingRef.current) {
      console.log("CLIENT: already connecting");
      return;
    }

    try {
      connectingRef.current = true;

      await RNBluetoothClassic.cancelDiscovery();

      console.log("CLIENT: connecting to", device.address);

      const d = await RNBluetoothClassic.connectToDevice(device.address);

      console.log("CLIENT: connected");

      setConnectedDevice(d);

      router.push({
        pathname: "/(protected)/bluetooth/send-payment",
        params: {
          deviceId: d.id,
          deviceName: d.name ?? "Unknown",
          deviceAddress: d.address,
        },
      });
    } catch (err) {
      console.log("CLIENT CONNECT ERROR:", err);
      Alert.alert("Connection failed");
    } finally {
      connectingRef.current = false;
    }
  };

  const pairDevice = async (device: BluetoothDevice) => {
    const paired = await RNBluetoothClassic.pairDevice(device.address);
    if (paired) scanAllDevices();
  };

  useEffect(() => {
    enableBluetooth();
  }, []);

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanPulse, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scanPulse, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(scanRotate, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopScanAnimation = () => {
    scanPulse.stopAnimation();
    scanRotate.stopAnimation();
    scanPulse.setValue(1);
    scanRotate.setValue(0);
  };

  const spin = scanRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View className="flex-1 bg-[#100C08]">
      {/* Header Section */}
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 rounded-full bg-[#4710cb] items-center justify-center mr-3">
            <Radio size={20} color="#c0f667" />
          </View>
          <View>
            <Text className="text-[#f5f5f5] text-2xl font-bold">
              Find Devices
            </Text>
            <Text className="text-[#f5f5f5]/60 text-sm">
              {devices.length} device{devices.length !== 1 ? "s" : ""} found
            </Text>
          </View>
        </View>

        {/* Scan Button */}
        <TouchableOpacity
          onPress={scanAllDevices}
          disabled={loading}
          className={`rounded-2xl p-4 flex-row items-center justify-center ${
            loading ? "bg-[#4710cb]/50" : "bg-[#4710cb]"
          }`}
        >
          {loading ? (
            <>
              <Animated.View
                style={{
                  transform: [{ scale: scanPulse }, { rotate: spin }],
                }}
                className="mr-3"
              >
                <Search size={20} color="#c0f667" />
              </Animated.View>
              <Text className="text-[#f5f5f5] text-base font-bold">
                Scanning...
              </Text>
            </>
          ) : (
            <>
              <Search size={20} color="#c0f667" className="mr-3" />
              <Text className="text-[#f5f5f5] text-base font-bold ml-2">
                Scan for Devices
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Device List */}
      <View className="flex-1 px-6">
        {devices.length === 0 && !loading ? (
          <View className="flex-1 items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-[#4710cb]/20 items-center justify-center mb-4">
              <Bluetooth size={32} color="#4710cb" />
            </View>
            <Text className="text-[#f5f5f5] text-lg font-semibold mb-2">
              No Devices Found
            </Text>
            <Text className="text-[#f5f5f5]/60 text-sm text-center">
              Tap the scan button to discover nearby devices
            </Text>
          </View>
        ) : (
          <FlatList
            data={devices}
            keyExtractor={(item) => item.address}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  item.bonded ? connectTo(item) : pairDevice(item)
                }
                className="bg-[#f5f5f5]/10 border border-[#f5f5f5]/20 rounded-2xl p-4 mb-3"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                        item.bonded ? "bg-[#c0f667]/20" : "bg-[#4710cb]/20"
                      }`}
                    >
                      {item.bonded ? (
                        <CheckCircle size={24} color="#c0f667" />
                      ) : (
                        <Wifi size={24} color="#4710cb" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-[#f5f5f5] text-base font-semibold mb-1">
                        {item.name || "Unknown Device"}
                      </Text>
                      <Text className="text-[#f5f5f5]/60 text-xs font-mono">
                        {item.address}
                      </Text>
                      {!item.bonded && (
                        <View className="flex-row items-center mt-2">
                          <AlertCircle size={12} color="#c0f667" />
                          <Text className="text-[#c0f667] text-xs ml-1 font-semibold">
                            Tap to Pair
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View
                    className={`px-3 py-1.5 rounded-full ${
                      item.bonded ? "bg-[#c0f667]/20" : "bg-[#4710cb]/20"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        item.bonded ? "text-[#c0f667]" : "text-[#4710cb]"
                      }`}
                    >
                      {item.bonded ? "PAIRED" : "NEW"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Connected Device Indicator */}
      {connectedDevice && (
        <View className="px-6 pb-6">
          <View className="bg-[#c0f667]/10 border border-[#c0f667]/30 rounded-2xl p-4 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-[#c0f667] items-center justify-center mr-3">
              <CheckCircle size={20} color="#100C08" />
            </View>
            <View className="flex-1">
              <Text className="text-[#f5f5f5] text-sm font-semibold mb-1">
                Connected to
              </Text>
              <Text className="text-[#c0f667] text-base font-bold">
                {connectedDevice.name || "Unknown Device"}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
