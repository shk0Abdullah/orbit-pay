// // app/sender/devices.tsx
// import { useEffect, useState } from "react";
// import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
// import type { Device } from "react-native-ble-plx";
// import { bluetoothClient } from "../../lib/bluetooth/client";
// import { useRouter } from "expo-router";

// export default function Devices() {
//   const [devices, setDevices] = useState<Device[]>([]);
//   const router = useRouter();

//   useEffect(() => {
//     setDevices([]);
//     bluetoothClient.startScan((device) => {
//       setDevices((prev) => (prev.find((d) => d.id === device.id) ? prev : [...prev, device]));
//     });

//     return () => bluetoothClient.stopScan();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Nearby Devices (tap to select)</Text>
//       <FlatList
//         data={devices}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             style={styles.item}
//             onPress={() => router.push({ pathname: "/sender/send", params: { deviceId: item.id } })}
//           >
//             <Text style={{ fontWeight: "600" }}>{item.name || "Unnamed"}</Text>
//             <Text style={{ color: "#666" }}>{item.id}</Text>
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 18 },
//   title: { fontSize: 18, marginBottom: 12 },
//   item: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
// });

// app/sender/devices.tsx
import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, PermissionsAndroid, Platform } from "react-native";
import type { Device } from "react-native-ble-plx";
import { bluetoothClient } from "../../lib/bluetooth/client";
import { useRouter } from "expo-router";

async function requestBlePermissions() {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);

    const allGranted = Object.values(granted).every(
      (status) => status === PermissionsAndroid.RESULTS.GRANTED
    );

    return allGranted;
  }
  return true; // iOS handles permissions differently
}


export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(true);
  const router = useRouter();

  // useEffect(() => {
  //   setDevices([]);
  //   setScanning(true);



  //   // Start scanning
  //   bluetoothClient.startScan((device) => {
  //     setDevices((prev) => (prev.find((d) => d.id === device.id) ? prev : [...prev, device]));
  //   });

  //   // Auto-stop after 8 seconds
  //   const timeout = setTimeout(() => {
  //     bluetoothClient.stopScan();
  //     setScanning(false);
  //   }, 8000);

  //   return () => {
  //     clearTimeout(timeout);
  //     bluetoothClient.stopScan();
  //   };
  // }, []);


  useEffect(() => {
    async function startScanning() {
      // Request permissions first
      const granted = await requestBlePermissions();
      if (!granted) {
        console.warn("Bluetooth permissions not granted");
        setScanning(false);
        return;
      }

      setDevices([]);
      setScanning(true);

      // Start scanning
      bluetoothClient.startScan((device) => {
        setDevices((prev) =>
          prev.find((d) => d.id === device.id) ? prev : [...prev, device]
        );
      });

      // Auto-stop after 8 seconds
      const timeout = setTimeout(() => {
        bluetoothClient.stopScan();
        setScanning(false);
      }, 8000);

      return () => {
        clearTimeout(timeout);
        bluetoothClient.stopScan();
      };
    }

    startScanning();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Devices (tap to select)</Text>

      {scanning && devices.length === 0 ? (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" />
          <Text style={styles.loaderText}>Scanning for devices...</Text>
        </View>
      ) : devices.length === 0 ? (
        <Text style={styles.noDevicesText}>No devices found</Text>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => router.push({ pathname: "/sender/send", params: { deviceId: item.id } })}
            >
              <Text style={{ fontWeight: "600" }}>{item.name || "Unnamed"}</Text>
              <Text style={{ color: "#666" }}>{item.id}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18 },
  title: { fontSize: 18, marginBottom: 12 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },

  loaderWrapper: { marginTop: 40, alignItems: "center" },
  loaderText: { marginTop: 10, color: "#555" },
  noDevicesText: { marginTop: 40, textAlign: "center", color: "#777" },
});
