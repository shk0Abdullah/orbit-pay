import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { PaymentPayload } from './types';


export class BluetoothClient {
  async enable() {
    const enabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (!enabled) await RNBluetoothClassic.requestBluetoothEnabled();
  }

  async scan() {
    const devices = await RNBluetoothClassic.getBondedDevices();
    return devices;
  }

  async connect(deviceId: string) {
    const connection = await RNBluetoothClassic.connectToDevice(deviceId);
    return connection;
  }

  async sendJSON(deviceId: string, payload: PaymentPayload) {
    const msg = JSON.stringify(payload);
    await RNBluetoothClassic.writeToDevice(deviceId, msg);
  }
}
