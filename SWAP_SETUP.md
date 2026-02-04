# Automatic Swap Integration Setup

This document explains how to set up the automatic swap feature that integrates WaafiPay and Binance for EvcPlus to USDT (BEP20) swaps.

## Overview

The automatic swap flow works as follows:

1. **User initiates swap** - Selects send currency (EvcPlus), receive currency (USDT BEP20), and amount
2. **Choose provider** - User selects "Automatic" provider
3. **PreAuthorization** - System reserves funds from user's EvcPlus account via WaafiPay
4. **User confirms payment** - User dials USSD code to confirm the payment
5. **Commit transaction** - System commits the WaafiPay transaction
6. **Send USDT** - System sends USDT via Binance to user's BEP20 address
7. **Complete** - User receives USDT in their wallet

## Prerequisites

### 1. WaafiPay Merchant Account

You need a WaafiPay merchant account to process EvcPlus payments.

1. Visit [WaafiPay](https://waafipay.net/) and sign up for a merchant account
2. Complete the verification process
3. Get your API credentials:
   - Merchant UID
   - API User ID
   - API Key

#### Testing WaafiPay

WaafiPay provides a sandbox environment for testing:
- Sandbox URL: `https://sandbox.waafipay.net`
- Production URL: `https://api.waafipay.net`

### 2. Binance Account with API Access

You need a Binance account with API access and withdrawal permissions.

1. Create a Binance account at [binance.com](https://www.binance.com/)
2. Complete KYC verification
3. Enable 2FA (required for API)
4. Create API keys:
   - Go to Account > API Management
   - Create new API key
   - **Enable "Enable Withdrawals"** (required for USDT transfers)
   - Save your API Key and API Secret securely
   - Whitelist your server IP (if applicable)

#### Important Security Notes for Binance API

- **Never share your API Secret**
- **Enable IP whitelist** for production
- **Set withdrawal limits** to minimize risk
- **Use a dedicated API key** for this application
- **Store credentials securely** (use environment variables or secure storage)

#### Testing Binance

Binance provides a testnet for testing:
- Testnet URL: `https://testnet.binance.vision`
- Production URL: `https://api.binance.com`
- Get testnet API keys at [testnet.binance.vision](https://testnet.binance.vision/)

### 3. Fund Your Accounts

#### For Testing:
- WaafiPay: Use test credentials provided by WaafiPay
- Binance Testnet: Get test USDT from testnet faucet

#### For Production:
- Ensure your Binance wallet has sufficient USDT balance
- Consider network fees (BEP20 fees are typically low, ~0.5 USDT)

## Configuration

### Step 1: Update API Credentials

Edit `/services/config.ts` and add your credentials:

\`\`\`typescript
export const WAAFIPAY_CONFIG = {
  merchantId: 'YOUR_MERCHANT_ID', // Your WaafiPay Merchant UID
  apiKey: 'YOUR_API_KEY', // Your WaafiPay API Key
  apiUrl: 'https://api.waafipay.net', // Production URL
};

export const BINANCE_CONFIG = {
  apiKey: 'YOUR_BINANCE_API_KEY', // Your Binance API Key
  apiSecret: 'YOUR_BINANCE_API_SECRET', // Your Binance API Secret
  apiUrl: 'https://api.binance.com', // Production URL
};
\`\`\`

### Step 2: Test Configuration

For testing, update the test configurations:

\`\`\`typescript
export const WAAFIPAY_TEST_CONFIG = {
  merchantId: 'TEST_MERCHANT_ID',
  apiKey: 'TEST_API_KEY',
  apiUrl: 'https://sandbox.waafipay.net',
};

export const BINANCE_TEST_CONFIG = {
  apiKey: 'TEST_API_KEY',
  apiSecret: 'TEST_API_SECRET',
  apiUrl: 'https://testnet.binance.vision',
};

// Set to true for testing, false for production
export const USE_TEST_MODE = true;
\`\`\`

### Step 3: Security Best Practices

**NEVER commit API keys to version control!**

For production, use environment variables:

1. Create a `.env` file (already in .gitignore):
   \`\`\`
   WAAFIPAY_MERCHANT_ID=your_merchant_id
   WAAFIPAY_API_KEY=your_api_key
   BINANCE_API_KEY=your_binance_key
   BINANCE_API_SECRET=your_binance_secret
   \`\`\`

2. Install dotenv: `npm install react-native-dotenv`

3. Update `config.ts` to use environment variables:
   \`\`\`typescript
   import { WAAFIPAY_MERCHANT_ID, WAAFIPAY_API_KEY } from '@env';
   
   export const WAAFIPAY_CONFIG = {
     merchantId: WAAFIPAY_MERCHANT_ID,
     apiKey: WAAFIPAY_API_KEY,
     apiUrl: 'https://api.waafipay.net',
   };
   \`\`\`

## Testing the Flow

### 1. Test Mode (Recommended First)

1. Set `USE_TEST_MODE = true` in `/services/config.ts`
2. Add your test API credentials
3. Run the app and try a swap:
   - Go to Swap tab
   - Select EvcPlus → USDT (BEP20)
   - Enter amount
   - Click "Swap"
   - Select "Automatic"
   - Follow the process

### 2. Production Testing

Before going live:

1. Test with small amounts first (e.g., $1-5)
2. Verify the entire flow works:
   - EvcPlus payment successful
   - USDT received in wallet
   - Transaction IDs logged
3. Monitor the first few transactions closely
4. Check Binance withdrawal history
5. Verify BEP20 transactions on BSCScan

## Monitoring and Logs

### Transaction Logging

All transactions are logged to console. In production, you should:

1. Implement proper logging (e.g., Sentry, LogRocket)
2. Store transaction records in a database
3. Send confirmation emails/SMS to users
4. Track transaction IDs for support

### Error Handling

The system handles various errors:

- WaafiPay PreAuth fails → Cancel and notify user
- Payment confirmation fails → Cancel PreAuth
- Binance withdrawal fails → Refund via WaafiPay
- Network errors → Retry mechanism

## API Documentation

### WaafiPay

- Documentation: https://docs.waafipay.com/
- PreAuthorization: https://docs.waafipay.com/preauthorization
- Support: support@waafipay.net

### Binance

- API Documentation: https://binance-docs.github.io/apidocs/spot/en/
- Withdraw Endpoint: https://binance-docs.github.io/apidocs/spot/en/#withdraw
- Support: https://www.binance.com/en/support

## Troubleshooting

### Common Issues

#### WaafiPay PreAuth Fails

- Check API credentials are correct
- Verify merchant account is active
- Check account has sufficient balance
- Ensure phone number format is correct (252...)

#### Binance Withdrawal Fails

- Check API key has withdrawal permissions enabled
- Verify sufficient USDT balance + network fees
- Check BEP20 address is valid (0x... format)
- Verify IP whitelist settings
- Check daily withdrawal limits

#### Transaction Stuck

If a transaction gets stuck:

1. Check WaafiPay transaction status
2. Check Binance withdrawal history
3. Use transaction IDs to debug
4. Contact support if needed

## Production Checklist

Before going live:

- [ ] All API credentials configured
- [ ] Test mode disabled (`USE_TEST_MODE = false`)
- [ ] Tested with real small amounts
- [ ] Error handling tested
- [ ] Logging implemented
- [ ] Support contact info added
- [ ] Terms & conditions added
- [ ] Transaction limits set
- [ ] Security review completed
- [ ] Backup plan for failed transactions

## Support

For issues with this integration, check:

1. Console logs for error messages
2. API response codes
3. Transaction IDs
4. Network connectivity

## License

This integration code is part of the Taran app.
