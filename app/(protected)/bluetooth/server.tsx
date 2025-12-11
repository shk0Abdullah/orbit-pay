import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BluetoothServer } from '@/lib/bluetooth/BluetoothServer';
import { PaymentPayload } from '@/lib/bluetooth/types';

export default function ServerScreen() {
  const [server] = useState(new BluetoothServer());
  const [received, setReceived] = useState<PaymentPayload | null>(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    server.enable();
  }, [server]);

  const startListening = async () => {
    const device = await server.listenForConnections();
    setListening(true);

    server.onData(device, (data) => {
      setReceived(data);
    });
  };

  return (
    <View className="flex-1 bg-white p-5">
      <TouchableOpacity
        className="bg-blue-600 py-3 px-4 rounded-lg"
        onPress={startListening}
      >
        <Text className="text-white text-center font-semibold">
          Start Server (Receiver)
        </Text>
      </TouchableOpacity>

      {listening && (
        <View className="mt-5 p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <Text className="text-blue-800 font-semibold">
            Listening for connections...
          </Text>
        </View>
      )}

      {received && (
        <View className="mt-7 p-5 bg-gray-100 rounded-lg border border-gray-300">
          <Text className="text-gray-800 font-semibold mb-2">
            Received Payment:
          </Text>

          <Text className="text-gray-700">
            Sender: <Text className="font-medium">{received.sender}</Text>
          </Text>

          <Text className="text-gray-700 mt-1">
            Amount: <Text className="font-medium">{received.amount}</Text>
          </Text>

          <Text className="text-gray-700 mt-1">
            Time:{' '}
            <Text className="font-medium">
              {new Date(received.timestamp).toLocaleString()}
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
}
