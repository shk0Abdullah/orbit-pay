import RNBluetoothClassic, {
  BluetoothEventSubscription
} from 'react-native-bluetooth-classic';
import { PaymentPayload } from './types';

export class BluetoothServer {
  private connectionSub?: BluetoothEventSubscription;
  private dataSub?: BluetoothEventSubscription;

  async enable() {
    const enabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (!enabled) await RNBluetoothClassic.requestBluetoothEnabled();
  }

  async listenForConnections() {
    const server = await RNBluetoothClassic.accept({
      // No options or use the correct property if needed, e.g. 'service'
      // service: '00001101-0000-1000-8000-00805F9B34FB', // Uncomment if 'service' is valid
    });

    return server;
  }

  onData(device: any, callback: (data: PaymentPayload) => void) {
    this.dataSub = RNBluetoothClassic.onDeviceRead(device, (event) => {
      try {
        const parsed = JSON.parse(event.data);
        callback(parsed);
      } catch  {
        console.warn('Invalid JSON received:', event.data);
      }
    });
  }

  stop() {
    this.connectionSub?.remove();
    this.dataSub?.remove();
  }
}
