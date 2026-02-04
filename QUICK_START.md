# Quick Start - Automatic Swap Setup

Waxaan ku sameynayaa swap ka EvcPlus → USDT (BEP20) oo isticmaala **real WaafiPay** iyo **test Binance**.

## Step 1: Get API Credentials

### WaafiPay Production (Real)
1. Go to: https://waafipay.net
2. Sign up and get verified
3. Get your credentials:
   - Merchant ID
   - API Key
4. Save them securely

### Binance Testnet (Test - FREE)
1. Go to: https://testnet.binance.vision
2. Sign up (no KYC needed for testnet)
3. Create API Key:
   - Enable "Spot & Margin Trading"
   - Enable "Withdrawals"
4. Get test USDT from faucet
5. Save:
   - API Key
   - API Secret

## Step 2: Configure .env File

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your credentials:
   ```bash
   # WaafiPay Production (Real)
   WAAFIPAY_MERCHANT_ID=your_actual_merchant_id
   WAAFIPAY_API_KEY=your_actual_api_key
   WAAFIPAY_API_URL=https://api.waafipay.net

   # Binance Testnet (Test)
   BINANCE_API_KEY=your_testnet_api_key
   BINANCE_API_SECRET=your_testnet_secret
   BINANCE_API_URL=https://testnet.binance.vision
   ```

3. Save the file

## Step 3: Restart Expo

After updating .env, restart the development server:

```bash
# Stop the current server (Ctrl+C)
# Then start again
npx expo start --clear
```

**Important:** You MUST restart Expo after changing .env!

## Step 4: Test the Swap

1. Open the app
2. Go to **Add Account**
3. Add your USDT (BEP20) address:
   - For testnet, use a BEP20 testnet address
   - Format: `0x...` (42 characters)
4. Go to **Swap** tab
5. Select:
   - Send: EvcPlus
   - Receive: USDT (BEP20)
   - Amount: e.g. $1
6. Click "**Swap**"
7. Choose "**Automatic**"

## The Flow

```
[1] Initialize ✓
    ↓
[2] WaafiPay PreAuth (Reserve $1 from EvcPlus) ✓
    ↓
[3] Dial *252# to confirm payment ⏳
    ↓
[4] Click "I have confirmed payment" ✓
    ↓
[5] WaafiPay Commit (Complete payment) ✓
    ↓
[6] Binance sends USDT to your address ✓
    ↓
[7] Success! Check your wallet 🎉
```

## Configuration Summary

Current setup:
- ✅ **WaafiPay**: Production (Real money)
- ✅ **Binance**: Testnet (Test USDT, no real money)

This is PERFECT for testing because:
- You test real EvcPlus payments (small amounts like $1)
- You receive test USDT (no cost)
- You verify the entire flow works
- No risk of losing money on Binance side

## Troubleshooting

### "Config not loaded"
- Check `.env` file exists
- Restart Expo: `npx expo start --clear`
- Check babel.config.js exists

### "WaafiPay error"
- Check Merchant ID is correct
- Check API Key is correct
- Verify account is active

### "Binance error"
- Check API Key has "Withdrawals" enabled
- Verify you have test USDT in testnet account
- Check BEP20 address is valid (0x...)

## Next Steps

After successful testing:

1. ✅ Test with $1
2. ✅ Test with $5
3. ✅ Test with $10
4. ✅ Verify USDT received (check on testnet explorer)

When ready for production Binance:

1. Get real Binance API credentials
2. Update .env:
   ```bash
   BINANCE_API_KEY=real_api_key
   BINANCE_API_SECRET=real_api_secret
   BINANCE_API_URL=https://api.binance.com
   ```
3. Restart Expo
4. Test with small amounts first!

## Security Reminders

- ⚠️ NEVER commit .env to git
- ⚠️ NEVER share your API secrets
- ⚠️ Enable 2FA on all accounts
- ⚠️ Use IP whitelist for production Binance
- ⚠️ Set daily withdrawal limits

## Support

Check logs for errors:
```bash
# In terminal where Expo is running
# Look for "=== API Configuration ===" 
# It will show which URLs are being used
```

Files to check:
- `.env` - Your credentials
- `services/config.ts` - Configuration logic
- `app/process-swap.tsx` - Swap flow
- Console logs - Error messages

---

**You're all set!** 🚀

The app will:
1. Take real EvcPlus money (via WaafiPay production)
2. Send test USDT (via Binance testnet)

This lets you test the complete flow safely!
