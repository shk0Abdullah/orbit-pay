import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { BluetoothClient } from '@/lib/bluetooth/BluetoothClient';
import { PaymentPayload } from '@/lib/bluetooth/types';

export default function ClientScreen() {
  const [client] = useState(new BluetoothClient());
  const [devices, setDevices] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [connectedDeviceId, setConnectedDeviceId] = useState<string>('');

  const scan = async () => {
    await client.enable();
    const list = await client.scan();
    setDevices(list);
  };
  const connectTo = async (id: string) => {
    await client.connect(id);
    setConnected(true);
    setConnectedDeviceId(id);
  };
  const sendPayment = async () => {
    const payload: PaymentPayload = {
      sender: 'Essam',
      amount: 200,
      timestamp: Date.now(),
    };
    await client.sendJSON(connectedDeviceId, payload);
  };

  return (
    <View className="flex-1 bg-white p-5">
      <TouchableOpacity
        className="bg-blue-600 py-3 px-4 rounded-lg"
        onPress={scan}
      >
        <Text className="text-white text-center font-semibold">Scan Devices</Text>
      </TouchableOpacity>

      <ScrollView className="mt-5">
        {devices.map((d) => (
          <TouchableOpacity
            key={d.id}
            className="bg-gray-100 p-4 rounded-lg mb-3 border border-gray-300"
            onPress={() => connectTo(d.id)}
          >
            <Text className="text-gray-800 font-medium">{d.name}</Text>
            <Text className="text-gray-600 text-xs">{d.id}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {connected && (
        <TouchableOpacity
          className="bg-green-600 py-3 px-4 rounded-lg mt-4"
          onPress={sendPayment}
        >
          <Text className="text-white text-center font-semibold">
            Send Payment
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
