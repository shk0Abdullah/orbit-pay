// lib/bluetooth/server.ts
import { BleManager, Device } from "react-native-ble-plx";
import { encodeToBase64, decodeFromBase64 } from "../utils/encoding";
import { SERVICE_UUID, MESSAGE_UUID, RESPONSE_UUID } from "./constants";

export class BluetoothServer {
  private manager = new BleManager();

  // On Android, creating a full GATT server + advertising entirely in JS
  // can be limited. This file uses the common pattern: receiver scans as well
  // and listens for incoming writes by connecting to central device's characteristics.
  //
  // For an MVP, the receiver will:
  //  - Start scanning (to get devices).
  //  - Connect when a device wants to send (we call connectFromUI).
  //  - After connecting, monitor the MESSAGE_UUID to receive data.
  //
  // This keeps the pattern symmetric and avoids more fragile JS advertising.

  async connect(deviceId: string): Promise<Device> {
    const device = await this.manager.connectToDevice(deviceId, { timeout: 10000 });
    await device.discoverAllServicesAndCharacteristics();
    return device;
  }

  // Listen to incoming message characteristic -- returns unsubscribe
  listenForMessages(device: Device, onMessage: (jsonText: string) => void) {
    const sub = device.monitorCharacteristicForService(
      SERVICE_UUID,
      MESSAGE_UUID,
      (error, char) => {
        if (error) {
          console.warn("listenForMessages error", error);
          return;
        }
        const decoded = decodeFromBase64(char?.value || null);
        onMessage(decoded);
      }
    );

    return () => sub.remove();
  }

  // Send response back to sender by writing to the response characteristic
  async sendResponse(device: Device, message: string) {
    const base64 = encodeToBase64(message);
    await device.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      RESPONSE_UUID,
      base64
    );
  }
}

export const bluetoothServer = new BluetoothServer();
