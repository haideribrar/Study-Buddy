import { Platform } from 'react-native';

const DEV_PORT = 5001;

// Replace this URL with your deployed backend URL (e.g., https://study-buddy-backend.onrender.com)
// once you host your backend online.
export const PRODUCTION_API_URL = 'https://study-buddy-seven-weld.vercel.app';


const getLocalApiUrl = () => Platform.select({
  ios: `http://localhost:${DEV_PORT}`,
  android: `http://10.0.2.2:${DEV_PORT}`,
  default: `http://localhost:${DEV_PORT}`
});

export const API_BASE_URL = PRODUCTION_API_URL || getLocalApiUrl();

console.log(`[Client Config] API base url established as: ${API_BASE_URL}`);

