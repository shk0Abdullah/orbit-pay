import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { PaymentPayload } from './types';

export class BluetoothClient {
  async enable() {
    const enabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (!enabled) {
      await RNBluetoothClassic.requestBluetoothEnabled();
    }
  }

  async scan() {
    const paired = await RNBluetoothClassic.getBondedDevices();

    let discovered: any[] = [];
    try {
      discovered = await RNBluetoothClassic.startDiscovery();
    } catch (e) {
      console.warn('Discovery failed:', e);
    } finally {
      try {
        await RNBluetoothClassic.cancelDiscovery();
      } catch (e) {
        console.warn("Failed to stop discovery:", e);
      }
    }


    // Filter out devices already in paired list
    const pairedAddresses = new Set(paired.map(d => d.address));

    const unpaired = discovered.filter(
      device => !pairedAddresses.has(device.address)
    );

    return { paired, unpaired };
  }

  async connect(deviceId: string) {
    const connection = await RNBluetoothClassic.connectToDevice(deviceId);
    return connection;
  }

  async sendJSON(deviceId: string, payload: PaymentPayload) {
    const msg = JSON.stringify(payload) + '\n';
    await RNBluetoothClassic.writeToDevice(deviceId, msg);
  }
}

