# Sida Loo Bilaabo - Automatic Swap

## Talaabooyinka Degdega ah

### 1️⃣ Hel API Credentials

**WaafiPay (Production - Real)**
- Website: https://waafipay.net
- Sign up → Get verified
- Hel: Merchant ID + API Key

**Binance (Testnet - Test)**
- Website: https://testnet.binance.vision
- Sign up (bilaash, ma aha lacag dhab ah)
- Create API Key + Enable "Withdrawals"
- Hel test USDT (free)

### 2️⃣ Buuxi .env File-ka

```bash
# Copy example file
cp .env.example .env

# Open iyo edit
# Gali credentials-kaaga
```

File-ka `.env`:
```bash
WAAFIPAY_MERCHANT_ID=merchant_id_kaaga_halkan_gali
WAAFIPAY_API_KEY=api_key_kaaga_halkan_gali
WAAFIPAY_API_URL=https://api.waafipay.net

BINANCE_API_KEY=binance_testnet_key_halkan_gali
BINANCE_API_SECRET=binance_testnet_secret_halkan_gali
BINANCE_API_URL=https://testnet.binance.vision
```

### 3️⃣ Restart Expo

```bash
# Stop (Ctrl+C)
# Bilow mar labaad
npx expo start --clear
```

**Muhiim:** Waa in aad restart gareysaa Expo marka aad .env beddesho!

### 4️⃣ Test Swap-ka

1. Open app
2. **Add Account** → Ku dar USDT BEP20 address (testnet address)
3. **Swap tab**:
   - Send: EvcPlus
   - Receive: USDT (BEP20)
   - Amount: $1 (test)
4. Click "**Swap**"
5. Dooro "**Automatic**"
6. System reserves $1 (WaafiPay)
7. Dial *252# → Confirm
8. Click "I have confirmed payment"
9. System sends test USDT
10. ✅ Success!

## Configuration Hadda

- ✅ **WaafiPay**: Production (lacag dhab ah)
- ✅ **Binance**: Testnet (test USDT, lacag ma aha)

Tani waa **PERFECT** for testing:
- Real EvcPlus payment (e.g. $1)
- Test USDT helaysaa (bilaash)
- Dhammaan flow-ka test gareeysaa
- Ma khatar gelin lacag Binance-ka

## Hadii Khalad Jiro

### ".env ma shaqeynayo"
```bash
# Check file jiro
ls -la .env

# Restart Expo
npx expo start --clear
```

### "WaafiPay qalad"
- Check Merchant ID sax ma ah
- Check API Key sax ma ah
- Verify account active yahay

### "Binance qalad"
- Check API Key "Withdrawals" enabled yahay
- Check test USDT haysatid
- Check address BEP20 valid ah (0x...)

## Kadib Testing-ka

Marka test successful noqoto:

### Test amounts:
1. ✅ $1 (first test)
2. ✅ $5 (second test)
3. ✅ $10 (third test)

### Verify:
- EvcPlus ka lacag baxday ✓
- Test USDT soo gashay wallet-ka ✓
- Transaction IDs logged ✓

### Real Binance (production):
Marka diyaar tahay:
1. Get Binance production API
2. Update .env → `https://api.binance.com`
3. Restart Expo
4. Test amounts yaryar oo bilow!

## Security ⚠️

- Ma sheegin API secrets
- .env NEVER commit to git
- Enable 2FA dhammaan accounts
- Set withdrawal limits

## Files Muhiim ah

```
taran/
├── .env                    ← Your credentials (SECRET!)
├── .env.example            ← Template
├── QUICK_START.md          ← English guide
├── BILAABID.md            ← This file (Somali)
├── services/config.ts      ← Configuration
└── app/process-swap.tsx    ← Swap logic
```

## Console Logs

Expo terminal-ka check:
```
=== API Configuration ===
WaafiPay URL: https://api.waafipay.net
WaafiPay Merchant ID: ✓ Configured
Binance URL: https://testnet.binance.vision
Binance API Key: ✓ Configured
========================
```

Hadii "✓ Configured" aad aragto = Waa hagaag! ✅

---

**Waxaad diyaar u tahay!** 🚀

Talow:
1. Real EvcPlus → WaafiPay production
2. Test USDT → Binance testnet

Safe testing! 🎉
