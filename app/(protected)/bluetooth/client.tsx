// import { useState } from 'react';
// import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
// import { BluetoothClient } from '@/lib/bluetooth/BluetoothClient';
// import { PaymentPayload } from '@/lib/bluetooth/types';

// export default function ClientScreen() {
//   const [client] = useState(new BluetoothClient());
//   const [paireddevices, setPairedDevices] = useState<any[]>([]);
//   const [unpaireddevices, setUnpairedDevices] = useState<any[]>([]);
//   const [connected, setConnected] = useState(false);
//   const [connectedDeviceId, setConnectedDeviceId] = useState<string>('');

//   const scan = async () => {
//     await client.enable();
//     const allDevices = await client.scan();
//     setPairedDevices(allDevices.paired)
//     setUnpairedDevices(allDevices.unpaired)
//   };
//   const connectTo = async (id: string) => {
//     console.log(id)
//     await client.connect(id);
//     console.log("got id")
//     setConnected(true);
//     setConnectedDeviceId(id);
//   };
//   const sendPayment = async () => {
//     const payload: PaymentPayload = {
//       sender: 'Essam',
//       amount: 200,
//       timestamp: Date.now(),
//     };
//     await client.sendJSON(connectedDeviceId, payload);
//   };

//   return (
//     <View className="flex-1 bg-white p-5">
//       <TouchableOpacity
//         className="bg-blue-600 py-3 px-4 rounded-lg"
//         onPress={scan}
//       >
//         <Text className="text-white text-center font-semibold">Scan Devices</Text>
//       </TouchableOpacity>

//       <ScrollView className="mt-5">
//         <Text className='text-3xl'>Paired Devices</Text>
//         {paireddevices.map((d) => (
//           <TouchableOpacity
//             key={d.id}
//             className="bg-gray-100 p-4 rounded-lg mb-3 border border-gray-300"
//             onPress={() => connectTo(d.id)}
//           >
//             <Text className="text-gray-800 font-medium">{d.name}</Text>
//             <Text className="text-gray-600 text-xs">{d.id}</Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>
//       <ScrollView className="mt-5">
//         <Text className='text-3xl'>Other Devices</Text>
//         {unpaireddevices.map((d) => (
//           <TouchableOpacity
//             key={d.id}
//             className="bg-gray-100 p-4 rounded-lg mb-3 border border-gray-300"
//             onPress={() => connectTo(d.id)}
//           >
//             <Text className="text-gray-800 font-medium">{d.name}</Text>
//             <Text className="text-gray-600 text-xs">{d.id}</Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {connected && (
//         <TouchableOpacity
//           className="bg-green-600 py-3 px-4 rounded-lg mt-4"
//           onPress={sendPayment}
//         >
//           <Text className="text-white text-center font-semibold">
//             Send Payment
//           </Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }


import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { BluetoothClient } from '@/lib/bluetooth/BluetoothClient';
import { PaymentPayload } from '@/lib/bluetooth/types';

export default function ClientScreen() {
  const [client] = useState(new BluetoothClient());
  const [pairedDevices, setPairedDevices] = useState<any[]>([]);
  const [unpairedDevices, setUnpairedDevices] = useState<any[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);

  const scanDevices = async () => {
    await client.enable();
    const { paired, unpaired } = await client.scan();
    setPairedDevices(paired);
    setUnpairedDevices(unpaired);
  };

  const connectToDevice = async (address: string) => {
    try {
      await client.connect(address);
      setConnectedDevice(address);
      Alert.alert('Connected', `Connected to device ${address}`);
    } catch (err) {
      console.warn(err);
      Alert.alert('Connection Failed', 'Make sure the device is paired and server is running');
    }
  };

  const sendPayment = async () => {
    if (!connectedDevice) return;
    const payload: PaymentPayload = {
      sender: 'Essam',
      amount: 200,
      timestamp: Date.now(),
    };
    try {
      await client.sendJSON(connectedDevice, payload);
      Alert.alert('Success', 'Payment sent');
    } catch (err) {
      console.warn(err);
      Alert.alert('Failed', 'Could not send payment');
    }
  };

  return (
    <View className="flex-1 bg-white p-5">
      <TouchableOpacity className="bg-blue-600 py-3 px-4 rounded-lg" onPress={scanDevices}>
        <Text className="text-white text-center font-semibold">Scan Devices</Text>
      </TouchableOpacity>

      <ScrollView className="mt-5">
        <Text className='text-2xl font-bold'>Paired Devices</Text>
        {pairedDevices.map((d) => (
          <TouchableOpacity
            key={d.address}
            className="bg-gray-100 p-4 rounded-lg mb-3 border border-gray-300"
            onPress={() => connectToDevice(d.address)}
          >
            <Text className="text-gray-800 font-medium">{d.name}</Text>
            <Text className="text-gray-600 text-xs">{d.address}</Text>
          </TouchableOpacity>  
        ))}
      </ScrollView>

      <ScrollView className="mt-5">
        <Text className='text-2xl font-bold'>Nearby Devices</Text>
        {unpairedDevices.map((d) => (
          <TouchableOpacity
            key={d.address}
            className="bg-gray-100 p-4 rounded-lg mb-3 border border-gray-300"
            onPress={() => connectToDevice(d.address)}
          >
            <Text className="text-gray-800 font-medium">{d.name}</Text>
            <Text className="text-gray-600 text-xs">{d.address}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {connectedDevice && (
        <TouchableOpacity className="bg-green-600 py-3 px-4 rounded-lg mt-4" onPress={sendPayment}>
          <Text className="text-white text-center font-semibold">Send Payment</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
