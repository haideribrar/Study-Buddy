import { Platform } from 'react-native';

const DEV_PORT = 5001;

// For Android emulator, use 10.0.2.2. For iOS simulator/web, use localhost.
// Replace with your local machine's LAN IP (e.g., 192.168.x.x) if testing on physical devices.
export const API_BASE_URL = Platform.select({
  ios: `http://localhost:${DEV_PORT}`,
  android: `http://10.0.2.2:${DEV_PORT}`,
  default: `http://localhost:${DEV_PORT}`
});

console.log(`[Client Config] API base url established as: ${API_BASE_URL}`);
