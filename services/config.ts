// API Configuration
// IMPORTANT: Configure in .env file (never commit .env to git!)

import {
    BINANCE_API_KEY,
    BINANCE_API_SECRET,
    BINANCE_API_URL,
    WAAFIPAY_API_KEY,
    WAAFIPAY_API_URL,
    WAAFIPAY_API_USER_ID,
    WAAFIPAY_MERCHANT_ID,
} from '@env';

export const WAAFIPAY_CONFIG = {
  merchantId: WAAFIPAY_MERCHANT_ID || 'YOUR_MERCHANT_ID',
  apiUserId: WAAFIPAY_API_USER_ID || 'YOUR_API_USER_ID',
  apiKey: WAAFIPAY_API_KEY || 'YOUR_API_KEY',
  apiUrl: WAAFIPAY_API_URL || 'https://api.waafipay.net',
};

export const BINANCE_CONFIG = {
  apiKey: BINANCE_API_KEY || 'YOUR_BINANCE_API_KEY',
  apiSecret: BINANCE_API_SECRET || 'YOUR_BINANCE_API_SECRET',
  apiUrl: BINANCE_API_URL || 'https://testnet.binance.vision',
};

// Fallback test configurations (if .env not configured)
export const WAAFIPAY_TEST_CONFIG = {
  merchantId: 'TEST_MERCHANT_ID',
  apiUserId: 'TEST_API_USER_ID',
  apiKey: 'TEST_API_KEY',
  apiUrl: 'https://sandbox.waafipay.net',
};

export const BINANCE_TEST_CONFIG = {
  apiKey: 'TEST_API_KEY',
  apiSecret: 'TEST_API_SECRET',
  apiUrl: 'https://testnet.binance.vision',
};

// Helper functions to get configs
export const getWaafiPayConfig = () => {
  // Check if environment variables are configured
  if (WAAFIPAY_MERCHANT_ID && WAAFIPAY_API_USER_ID && WAAFIPAY_API_KEY) {
    return WAAFIPAY_CONFIG;
  }
  // Fallback to test config
  console.warn('WaafiPay credentials not found in .env, using test config');
  return WAAFIPAY_TEST_CONFIG;
};

export const getBinanceConfig = () => {
  // Check if environment variables are configured
  if (BINANCE_API_KEY && BINANCE_API_SECRET) {
    return BINANCE_CONFIG;
  }
  // Fallback to test config
  console.warn('Binance credentials not found in .env, using test config');
  return BINANCE_TEST_CONFIG;
};

// Log current configuration (for debugging)
export const logCurrentConfig = () => {
  console.log('=== API Configuration ===');
  console.log('WaafiPay URL:', getWaafiPayConfig().apiUrl);
  console.log('WaafiPay Merchant ID:', getWaafiPayConfig().merchantId ? '✓ Configured' : '✗ Not configured');
  console.log('WaafiPay API User ID:', getWaafiPayConfig().apiUserId ? '✓ Configured' : '✗ Not configured');
  console.log('Binance URL:', getBinanceConfig().apiUrl);
  console.log('Binance API Key:', getBinanceConfig().apiKey ? '✓ Configured' : '✗ Not configured');
  console.log('========================');
};
