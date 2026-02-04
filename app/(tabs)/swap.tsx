import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Currency {
  code: string;
  name: string;
  icon: string;
  type: 'fiat' | 'local' | 'crypto';
}

const currencies: Currency[] = [
  // Local
  { code: 'EvcPlus', name: 'EvcPlus', icon: '📱', type: 'local' },
  { code: 'Zaad', name: 'Zaad', icon: '📱', type: 'local' },
  { code: 'Sahal', name: 'Sahal', icon: '📱', type: 'local' },
  // Crypto
  { code: 'USDT-TRC20', name: 'USDT (TRC20)', icon: '₮', type: 'crypto' },
  { code: 'USDT-BEP20', name: 'USDT (BEP20)', icon: '₮', type: 'crypto' },
  { code: 'SOL', name: 'Solana', icon: '◎', type: 'crypto' },
];

export default function SwapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [sendAmount, setSendAmount] = useState('100');
  const [sendCurrency, setSendCurrency] = useState('EvcPlus');
  const [receiveCurrency, setReceiveCurrency] = useState('Zaad');
  const [currencyPickerType, setCurrencyPickerType] = useState<'send' | 'receive' | null>(null);
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['70%'], []);

  const getCurrencyIcon = (code: string) => {
    const currency = currencies.find((c) => c.code === code);
    return currency?.icon || '💰';
  };

  const isLocalCurrency = (code: string) => {
    return ['EvcPlus', 'Zaad', 'Sahal'].includes(code);
  };

  const calculateSwapAmounts = useCallback(() => {
    const sendAmountNum = parseFloat(sendAmount.replace(/,/g, '')) || 0;
    
    // Check if both are local currencies
    if (isLocalCurrency(sendCurrency) && isLocalCurrency(receiveCurrency)) {
      const serviceFeeRate = 0.011; // 1.1%
      const serviceFee = sendAmountNum * serviceFeeRate;
      const receiveAmountNum = sendAmountNum - serviceFee;
      
      return {
        sendAmount: sendAmountNum,
        serviceFee,
        receiveAmount: receiveAmountNum,
        feeRate: 1.1,
        swapType: 'local-to-local',
      };
    }
    
    // Local currency to crypto: 2% fee
    if (isLocalCurrency(sendCurrency) && !isLocalCurrency(receiveCurrency)) {
      const serviceFeeRate = 0.02; // 2%
      const serviceFee = sendAmountNum * serviceFeeRate;
      const receiveAmountNum = sendAmountNum - serviceFee;
      
      return {
        sendAmount: sendAmountNum,
        serviceFee,
        receiveAmount: receiveAmountNum,
        feeRate: 2,
        swapType: 'local-to-crypto',
      };
    }
    
    // Crypto to local currency: 3% fee
    if (!isLocalCurrency(sendCurrency) && isLocalCurrency(receiveCurrency)) {
      const serviceFeeRate = 0.03; // 3%
      const serviceFee = sendAmountNum * serviceFeeRate;
      const receiveAmountNum = sendAmountNum - serviceFee;
      
      return {
        sendAmount: sendAmountNum,
        serviceFee,
        receiveAmount: receiveAmountNum,
        feeRate: 3,
        swapType: 'crypto-to-local',
      };
    }
    
    // Default calculation for crypto to crypto (no fee for now)
    return {
      sendAmount: sendAmountNum,
      serviceFee: 0,
      receiveAmount: sendAmountNum,
      feeRate: 0,
      swapType: 'crypto-to-crypto',
    };
  }, [sendAmount, sendCurrency, receiveCurrency]);

  const swapAmounts = calculateSwapAmounts();

  const handleOpenCurrencyPicker = useCallback((type: 'send' | 'receive') => {
    setCurrencyPickerType(type);
    bottomSheetRef.current?.expand();
  }, []);

  const handleCurrencySelect = useCallback((currency: Currency) => {
    if (currencyPickerType === 'send') {
      setSendCurrency(currency.code);
    } else if (currencyPickerType === 'receive') {
      setReceiveCurrency(currency.code);
    }
    bottomSheetRef.current?.close();
  }, [currencyPickerType]);

  const formatAmount = (amount: number) => {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setCurrencyPickerType(null);
    }
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* You send exactly section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.secondaryText }]}>
            You send exactly
          </Text>
          
          <View style={[styles.amountContainer, { backgroundColor: colors.card, borderRadius: 4 }]}>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={sendAmount}
              onChangeText={(text) => {
                // Remove commas and allow only numbers and decimal point
                const cleaned = text.replace(/[^0-9.]/g, '');
                setSendAmount(cleaned);
              }}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.secondaryText}
            />
            
            <TouchableOpacity
              style={[styles.currencySelector, { backgroundColor: colors.border }]}
              onPress={() => handleOpenCurrencyPicker('send')}
            >
              <Text style={styles.flag}>{getCurrencyIcon(sendCurrency)}</Text>
              <Text style={[styles.currencyText, { color: colors.text }]}>{sendCurrency}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>

          {/* Details */}
          {swapAmounts.serviceFee > 0 && (
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <View style={[styles.bulletPoint, { backgroundColor: colors.secondaryText }]} />
                <Text style={[styles.detailLeft, { color: colors.secondaryText }]}>
                  {formatAmount(swapAmounts.serviceFee)} {sendCurrency}
                </Text>
                <Text style={[styles.detailRight, { color: colors.tint }]}>
                  Service fee ({swapAmounts.feeRate}%)
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <View style={[styles.bulletPoint, { backgroundColor: colors.secondaryText }]} />
                <Text style={[styles.detailLeft, { color: colors.secondaryText }]}>
                  {formatAmount(swapAmounts.receiveAmount)} {receiveCurrency}
                </Text>
                <Text style={[styles.detailRight, { color: colors.secondaryText }]}>
                  Amount recipient will receive
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Recipient gets section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.secondaryText }]}>
            Recipient gets
          </Text>
          
          <View style={[styles.amountContainer, { backgroundColor: colors.card, borderRadius: 4 }]}>
            <Text style={[styles.amountInput, { color: colors.text }]}>
              {formatAmount(swapAmounts.receiveAmount)}
            </Text>
            
            <TouchableOpacity
              style={[styles.currencySelector, { backgroundColor: colors.border }]}
              onPress={() => handleOpenCurrencyPicker('receive')}
            >
              <Text style={styles.flag}>{getCurrencyIcon(receiveCurrency)}</Text>
              <Text style={[styles.currencyText, { color: colors.text }]}>{receiveCurrency}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}
        {swapAmounts.serviceFee > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={[styles.summaryText, { color: colors.text }]}>
              Service fee: {formatAmount(swapAmounts.serviceFee)} {sendCurrency} ({swapAmounts.feeRate}%)
            </Text>
            <Text style={[styles.summaryText, { color: colors.text }]}>
              {swapAmounts.swapType === 'local-to-local' 
                ? 'Should arrive instantly'
                : 'Should arrive in a few minutes'}
            </Text>
          </View>
        )}

        {/* Price comparison button */}
        <TouchableOpacity
          style={[
            styles.priceComparisonButton,
            { borderColor: colors.tint, borderRadius: 4 },
          ]}
        >
          <Text style={[styles.priceComparisonText, { color: colors.tint }]}>
            Swap
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Currency Picker Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.secondaryText }}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Currency</Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <BottomSheetScrollView 
            style={styles.currencyList} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.currencyListContent}
          >
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyItem,
                  {
                    backgroundColor: colors.background,
                    borderBottomColor: colors.border,
                  },
                  (currencyPickerType === 'send' && sendCurrency === currency.code) ||
                  (currencyPickerType === 'receive' && receiveCurrency === currency.code)
                    ? { backgroundColor: colors.border }
                    : {},
                ]}
                onPress={() => handleCurrencySelect(currency)}
              >
                <Text style={styles.currencyItemIcon}>{currency.icon}</Text>
                <View style={styles.currencyItemInfo}>
                  <Text style={[styles.currencyItemCode, { color: colors.text }]}>
                    {currency.code}
                  </Text>
                  <Text style={[styles.currencyItemName, { color: colors.secondaryText }]}>
                    {currency.name}
                  </Text>
                </View>
                {(currencyPickerType === 'send' && sendCurrency === currency.code) ||
                (currencyPickerType === 'receive' && receiveCurrency === currency.code) ? (
                  <Ionicons name="checkmark" size={20} color={colors.tint} />
                ) : null}
              </TouchableOpacity>
            ))}
            <View style={{ height: 40 }} />
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 32,
  },
  tab: {
    position: 'relative',
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabTextSelected: {
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '300',
    flex: 1,
    letterSpacing: -1,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  flag: {
    fontSize: 20,
  },
  euroIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  euroSymbol: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  detailLeft: {
    fontSize: 14,
    minWidth: 80,
  },
  detailRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  detailRight: {
    fontSize: 14,
    flex: 1,
  },
  summaryContainer: {
    marginTop: 8,
    marginBottom: 24,
    gap: 4,
  },
  summaryText: {
    fontSize: 14,
  },
  priceComparisonButton: {
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  priceComparisonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSheetContent: {
    flex: 1,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  currencyList: {
    flex: 1,
  },
  currencyListContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  currencyItemIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  currencyItemInfo: {
    flex: 1,
  },
  currencyItemCode: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  currencyItemName: {
    fontSize: 14,
  },
});
