import Button from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { checkBEP20PaymentReceived } from '@/services/bscscan';
import { getWaafiPayConfig } from '@/services/config';
import WaafiPayService from '@/services/waafipay';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ADDED_ACCOUNTS_KEY = '@added_accounts';
const ONBOARDING_KEY = '@onboarding_complete';
const TRANSACTIONS_KEY = '@swap_transactions';
const SYSTEM_BEP20_ADDRESS = '0x69be2364f0b9f42a957eba9c208bc7447c763fcf';

type VerifyStep = 
  | 'loading_account'
  | 'checking_payment'
  | 'payment_verified'
  | 'sending_local'
  | 'completed'
  | 'failed';

interface StepStatus {
  step: VerifyStep;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export default function VerifyCryptoPaymentScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const params = useLocalSearchParams();

  const sendAmount = params.sendAmount ? parseFloat(params.sendAmount as string) : 0;
  const sendCurrency = (params.sendCurrency as string) || '';
  const receiveAmount = params.receiveAmount ? parseFloat(params.receiveAmount as string) : 0;
  const receiveCurrency = (params.receiveCurrency as string) || '';

  const [currentStep, setCurrentStep] = useState<VerifyStep>('loading_account');
  const [error, setError] = useState<string>('');
  const [userBEP20Address, setUserBEP20Address] = useState<string>('');
  const [userLocalNumber, setUserLocalNumber] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [steps, setSteps] = useState<StepStatus[]>([
    { step: 'loading_account', title: 'Loading Account', description: 'Reading your account details...', status: 'processing' },
    { step: 'checking_payment', title: 'Checking Payment', description: 'Verifying crypto payment received...', status: 'pending' },
    { step: 'payment_verified', title: 'Payment Verified', description: 'Crypto payment confirmed!', status: 'pending' },
    { step: 'sending_local', title: 'Sending Payment', description: `Sending ${receiveAmount} ${receiveCurrency}...`, status: 'pending' },
    { step: 'completed', title: 'Completed', description: 'Swap completed successfully!', status: 'pending' },
  ]);

  const waafipay = new WaafiPayService(getWaafiPayConfig());

  useEffect(() => {
    startVerification();
  }, []);

  const updateStepStatus = (step: VerifyStep, status: 'pending' | 'processing' | 'completed' | 'failed') => {
    setSteps((prevSteps) =>
      prevSteps.map((s) => (s.step === step ? { ...s, status } : s))
    );
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const startVerification = async () => {
    try {
      // Step 1: Load user's accounts
      setCurrentStep('loading_account');
      updateStepStatus('loading_account', 'processing');

      const [addedRaw, onboardRaw] = await Promise.all([
        AsyncStorage.getItem(ADDED_ACCOUNTS_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
      ]);

      console.log('=== Loading User Accounts ===');

      // Get user's BEP20 address
      let bep20Address = '';
      if (addedRaw) {
        const accounts = JSON.parse(addedRaw);
        const bep20Account = accounts.find((acc: any) => acc.label === 'USDT (BEP20)');
        if (bep20Account?.address) {
          bep20Address = bep20Account.address;
          console.log('Found user BEP20 address:', bep20Address);
        }
      }

      if (!bep20Address) {
        throw new Error('No BEP20 address found. Please add your USDT (BEP20) account first.');
      }

      // User must add THEIR wallet address (where they send FROM), not the system deposit address
      const sysLower = SYSTEM_BEP20_ADDRESS.toLowerCase();
      if (bep20Address.toLowerCase() === sysLower) {
        throw new Error(
          'Use your own BEP20 wallet address in Add Account, not the system deposit address. ' +
          'You send USDT from your wallet to the system address shown on the confirm screen.'
        );
      }

      setUserBEP20Address(bep20Address);

      // Get user's local account number (for receiving payment)
      let localNumber = '';
      const onboard = onboardRaw ? JSON.parse(onboardRaw) : null;
      if (onboard?.accountType === receiveCurrency && onboard?.number) {
        localNumber = onboard.number;
        console.log(`Found ${receiveCurrency} in onboarding:`, localNumber);
      } else if (addedRaw) {
        const accounts = JSON.parse(addedRaw);
        const localAccount = accounts.find((acc: any) => acc.label === receiveCurrency);
        if (localAccount?.number) {
          localNumber = localAccount.number;
          console.log(`Found ${receiveCurrency} in added accounts:`, localNumber);
        }
      }

      if (!localNumber) {
        throw new Error(`No ${receiveCurrency} account found. Please add your account first.`);
      }

      // Clean the number
      let cleanNumber = localNumber.replace(/[\s+\-()]/g, '');
      if (cleanNumber.length === 9 && !cleanNumber.startsWith('252')) {
        cleanNumber = '252' + cleanNumber;
      }
      setUserLocalNumber(cleanNumber);
      console.log(`Final ${receiveCurrency} number:`, cleanNumber);
      console.log('============================');

      updateStepStatus('loading_account', 'completed');
      await delay(500);

      // Step 2: Check if payment was received
      setCurrentStep('checking_payment');
      updateStepStatus('checking_payment', 'processing');

      console.log('=== Checking Crypto Payment ===');
      console.log('System address:', SYSTEM_BEP20_ADDRESS);
      console.log('User address:', bep20Address);
      console.log('Expected amount:', sendAmount, sendCurrency);

      // Always verify on-chain: user said "I have paid" – we check blockchain, we do not trust word alone.
      // BSCScan: did system address receive sendAmount USDT from user's BEP20 address?
      const maxAttempts = 3;
      const retryDelayMs = 15000;
      let paymentReceived = false;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`Verifying on-chain (BSCScan) attempt ${attempt}/${maxAttempts}...`);
        const result = await checkBEP20PaymentReceived(
          SYSTEM_BEP20_ADDRESS,
          bep20Address,
          sendAmount
        );
        if (result.found) {
          paymentReceived = true;
          console.log('✅ Payment verified on-chain. User did send', sendAmount, sendCurrency, '– Tx:', result.txHash);
          break;
        }
        if (attempt < maxAttempts) {
          console.log('Transfer not found yet. Ask user to confirm they sent; retrying in 15s...');
          await delay(retryDelayMs);
        }
      }

      if (!paymentReceived) {
        throw new Error(
          'Payment not received yet. We checked the blockchain and did not find a transfer of ' +
          sendAmount + ' ' + sendCurrency + ' from your address to our system address. ' +
          'Please send the amount and try again, or wait a few minutes if you already sent.'
        );
      }

      updateStepStatus('checking_payment', 'completed');
      await delay(500);

      // Step 3: Payment verified
      setCurrentStep('payment_verified');
      updateStepStatus('payment_verified', 'completed');
      await delay(500);

      // Step 4: Send local payment to user (merchant pays customer)
      // NOTE: WaafiPay PreAuthorize CHARGES the customer (takes money from accountNo). For
      // crypto-to-local we need to PAY the user. If your provider has a payout/transfer API
      // (merchant → customer), use that here instead. PreAuth is used here as a placeholder;
      // 5206 "insufficient balance" means we tried to debit the user's EvcPlus - wrong direction.
      setCurrentStep('sending_local');
      updateStepStatus('sending_local', 'processing');

      console.log('=== Sending Local Payment ===');
      console.log('To:', cleanNumber);
      console.log('Amount:', receiveAmount, receiveCurrency);
      console.log('(Crypto received at system address; now paying user local currency)');

      const referenceId = `CRYPTO_SWAP_${Date.now()}`;
      const preAuthResponse = await waafipay.preAuthorize(
        cleanNumber,
        receiveAmount,
        referenceId,
        `Crypto swap: ${sendAmount} ${sendCurrency} to ${receiveAmount} ${receiveCurrency}`
      );

      console.log('WaafiPay response code:', preAuthResponse.responseCode);
      console.log('WaafiPay response message:', preAuthResponse.responseMsg);

      if (preAuthResponse.responseCode !== '2001') {
        const msg = preAuthResponse.responseMsg || 'Failed to send local payment';
        if (preAuthResponse.responseCode === '5206') {
          throw new Error(
            'Could not complete EvcPlus payout. Your EvcPlus number could not be credited. ' +
            'Please contact support with reference: ' + referenceId
          );
        }
        throw new Error(msg);
      }

      const txId = preAuthResponse.params?.transactionId || '';
      setTransactionId(txId);

      const commitResponse = await waafipay.commit(txId, 'Crypto swap completed');
      if (commitResponse.responseCode !== '2001') {
        await waafipay.cancel(txId, 'Commit failed');
        throw new Error(commitResponse.responseMsg || 'Failed to complete payment');
      }

      updateStepStatus('sending_local', 'completed');
      await delay(500);

      // Step 5: Complete
      setCurrentStep('completed');
      updateStepStatus('completed', 'completed');

      // Save transaction
      await saveTransaction();

      // Navigate to swap complete
      router.replace({
        pathname: '/swap-complete' as any,
        params: {
          sendAmount: sendAmount.toString(),
          sendCurrency,
          receiveCurrency,
          receiveAmount: receiveAmount.toString(),
          transactionId: txId,
        },
      });

    } catch (error: any) {
      console.error('Verification Error:', error);
      const errMsg = error.message || 'An error occurred';
      setError(errMsg);
      updateStepStatus(currentStep, 'failed');
      setCurrentStep('failed');

      // Navigate to swap rejected
      router.replace({
        pathname: '/swap-rejected' as any,
        params: {
          sendAmount: sendAmount.toString(),
          sendCurrency,
          receiveCurrency,
          receiveAmount: receiveAmount.toString(),
          errorMessage: errMsg,
        },
      });
    }
  };

  const saveTransaction = async () => {
    try {
      const transaction = {
        id: `SWAP_${Date.now()}`,
        name: `Swap: ${sendCurrency} → ${receiveCurrency}`,
        status: 'Completed · Today',
        amount: receiveAmount.toString(),
        currency: receiveCurrency,
        icon: 'swap-horizontal' as const,
        iconColor: '#3a3a3a',
        date: new Date().toISOString(),
        details: {
          sendAmount: sendAmount.toString(),
          sendCurrency,
          receiveAmount: receiveAmount.toString(),
          receiveCurrency,
          transactionId,
          timestamp: new Date().toISOString(),
        },
      };

      const stored = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      const existing = stored ? JSON.parse(stored) : [];
      const updated = [transaction, ...existing];
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
      
      console.log('✅ Transaction saved to history');
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };

  const getStepIcon = (status: 'pending' | 'processing' | 'completed' | 'failed') => {
    if (status === 'processing') {
      return <ActivityIndicator size="small" color={colors.tint} />;
    } else if (status === 'completed') {
      return <Ionicons name="checkmark-circle" size={24} color={colors.tint} />;
    } else if (status === 'failed') {
      return <Ionicons name="close-circle" size={24} color="#ff4444" />;
    }
    return <View style={[styles.pendingDot, { borderColor: colors.border }]} />;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Verifying Payment</Text>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: colors.tint }]}
          onPress={() => {
            if (currentStep === 'completed' || currentStep === 'failed') {
              router.back();
            } else {
              Alert.alert(
                'Cancel Verification',
                'Are you sure you want to cancel?',
                [
                  { text: 'No', style: 'cancel' },
                  { text: 'Yes', style: 'destructive', onPress: () => router.back() },
                ]
              );
            }
          }}
        >
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Swap Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Swap Details</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>You send:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {sendAmount} {sendCurrency}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>You receive:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {receiveAmount} {receiveCurrency}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>System Address:</Text>
            <Text style={[styles.summaryValueSmall, { color: colors.text }]} numberOfLines={1}>
              {SYSTEM_BEP20_ADDRESS.slice(0, 6)}...{SYSTEM_BEP20_ADDRESS.slice(-8)}
            </Text>
          </View>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={step.step} style={styles.stepItem}>
              <View style={styles.stepIconContainer}>
                {getStepIcon(step.status)}
                {index < steps.length - 1 && (
                  <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                <Text style={[styles.stepDescription, { color: colors.secondaryText }]}>
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Error Message */}
        {error ? (
          <View style={[styles.errorCard, { backgroundColor: '#ff4444' + '20' }]}>
            <Ionicons name="alert-circle" size={24} color="#ff4444" />
            <Text style={[styles.errorText, { color: '#ff4444' }]}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Action Buttons */}
      {error && (
        <View style={styles.bottomContainer}>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryValueSmall: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '60%',
  },
  stepsContainer: {
    marginTop: 8,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
  },
  pendingDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },
  actionButton: {
    width: '100%',
  },
});
