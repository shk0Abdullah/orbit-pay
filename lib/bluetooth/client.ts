// lib/bluetooth/client.ts
import { BleManager, Device } from "react-native-ble-plx";
import { encodeToBase64, decodeFromBase64 } from "../utils/encoding";
import { SERVICE_UUID, MESSAGE_UUID, RESPONSE_UUID } from "./constants";

export class BluetoothClient {
  private manager = new BleManager();

  // Start scanning and call `onDeviceFound` for each device
  startScan(onDeviceFound: (device: Device) => void) {
    // stop previous scans
    this.manager.stopDeviceScan();

    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.warn("BLE scan error", error);
        return;
      }
      if (device && device.name) {
        onDeviceFound(device);
      }
    });
  }

  stopScan() {
    try {
      this.manager.stopDeviceScan();
    } catch  {
      // ignore
    }
  }

  // Connect to deviceId and return connected Device
  async connect(deviceId: string): Promise<Device> {
    const device = await this.manager.connectToDevice(deviceId, { timeout: 10000 });
    await device.discoverAllServicesAndCharacteristics();
    return device;
  }

  // Write JSON message (JS object or string) to target device
  async sendMessage(device: Device, json: object | string) {
    const text = typeof json === "string" ? json : JSON.stringify(json);
    const base64 = encodeToBase64(text);

    // writeCharacteristicWithResponseForService throws if characteristic not found
    await device.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      MESSAGE_UUID,
      base64
    );
  }

  // Subscribe to response notifications from device.
  // returns unsubscribe function
  subscribeToResponse(device: Device, onResponse: (payload: string) => void) {
    const sub = device.monitorCharacteristicForService(
      SERVICE_UUID,
      RESPONSE_UUID,
      (error, characteristic) => {
        if (error) {
          console.warn("monitorCharacteristic error:", error);
          return;
        }
        const value = characteristic?.value || null;
        const decoded = decodeFromBase64(value);
        onResponse(decoded);
      }
    );

    return () => sub.remove();
  }
}

export const bluetoothClient = new BluetoothClient();
