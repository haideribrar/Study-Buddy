const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredEnv = [
  'GEMINI_API_KEY',
  'OPENROUTER_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

// Verify variables and warn if placeholders are present
const config = {
  port: process.env.PORT || 5001,
  geminiApiKey: process.env.GEMINI_API_KEY,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
};

const missing = requiredEnv.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.warn(`[Config Warning] Missing required environment variables in .env: ${missing.join(', ')}`);
}

// Simple helper to check if a value is a placeholder
const isPlaceholder = (val) => {
  return !val || val.includes('your_') || val.includes('_here');
};

config.isConfigured = () => {
  return requiredEnv.every(key => process.env[key] && !isPlaceholder(process.env[key]));
};

module.exports = config;
