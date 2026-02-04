import Button from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import BinanceService from '@/services/binance';
import { getBinanceConfig, getWaafiPayConfig, logCurrentConfig } from '@/services/config';
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

type SwapStep = 
  | 'initializing'
  | 'preauth'
  | 'confirming'
  | 'sending_crypto'
  | 'completed'
  | 'failed';

interface StepStatus {
  step: SwapStep;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export default function ProcessSwapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const params = useLocalSearchParams();

  // Parse params
  const sendAmount = params.sendAmount ? parseFloat(params.sendAmount as string) : 0;
  const sendCurrency = (params.sendCurrency as string) || '';
  const receiveCurrency = (params.receiveCurrency as string) || '';
  const receiveAmount = params.receiveAmount ? parseFloat(params.receiveAmount as string) : 0;
  const evcPlusNumber = (params.evcPlusNumber as string) || '';

  const [currentStep, setCurrentStep] = useState<SwapStep>('initializing');
  const [transactionId, setTransactionId] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [steps, setSteps] = useState<StepStatus[]>([
    { step: 'initializing', title: 'Initializing', description: 'Setting up your swap...', status: 'processing' },
    { step: 'preauth', title: 'Reserve Funds', description: 'Reserving funds from your EvcPlus account...', status: 'pending' },
    { step: 'confirming', title: 'Processing Payment', description: 'Completing the transaction...', status: 'pending' },
    { step: 'sending_crypto', title: 'Sending USDT', description: 'Transferring USDT to your address...', status: 'pending' },
    { step: 'completed', title: 'Completed', description: 'Swap completed successfully!', status: 'pending' },
  ]);

  const waafipay = new WaafiPayService(getWaafiPayConfig());
  const binance = new BinanceService(getBinanceConfig());

  useEffect(() => {
    // Log current API configuration
    logCurrentConfig();
    
    // Load recipient USDT address
    loadRecipientAddress();
  }, []);

  useEffect(() => {
    if (recipientAddress) {
      startSwapProcess();
    }
  }, [recipientAddress]);

  const loadRecipientAddress = async () => {
    try {
      const addedRaw = await AsyncStorage.getItem(ADDED_ACCOUNTS_KEY);
      if (!addedRaw) {
        throw new Error('No recipient address found');
      }

      const added = JSON.parse(addedRaw);
      const usdtAccount = added.find((a: any) => 
        a.type === 'crypto' && a.label === receiveCurrency && a.address
      );

      if (!usdtAccount || !usdtAccount.address) {
        throw new Error('USDT BEP20 address not found. Please add your address in settings.');
      }

      setRecipientAddress(usdtAccount.address);
    } catch (error) {
      setError('Failed to load recipient address');
      updateStepStatus('initializing', 'failed');
    }
  };

  const startSwapProcess = async () => {
    try {
      // Step 1: Initialize
      updateStepStatus('initializing', 'completed');
      await delay(500);

      // Step 2: PreAuthorize with WaafiPay
      setCurrentStep('preauth');
      updateStepStatus('preauth', 'processing');

      // Format phone number: Remove +, spaces, and ensure international format
      const formattedNumber = evcPlusNumber.replace(/[\s+\-()]/g, '');
      console.log('Formatted account number:', formattedNumber);

      if (!formattedNumber || formattedNumber.length < 10) {
        throw new Error('Invalid EvcPlus account number. Please add your account in settings.');
      }

      const referenceId = `SWAP_${Date.now()}`;
      const preAuthResponse = await waafipay.preAuthorize(
        formattedNumber,
        sendAmount,
        referenceId,
        `Swap ${sendAmount} ${sendCurrency} to ${receiveAmount} ${receiveCurrency}`
      );

      if (preAuthResponse.responseCode !== '2001') {
        // Handle specific error codes
        let errorMessage = preAuthResponse.responseMsg || 'PreAuthorization failed';
        
        // Make error more user-friendly for insufficient balance
        if (preAuthResponse.responseCode === '5206' || errorMessage.includes('not sufficient')) {
          errorMessage = 'Insufficient balance in your EvcPlus account. Please add funds and try again.';
        }
        
        throw new Error(errorMessage);
      }

      if (!preAuthResponse.params?.transactionId) {
        throw new Error('Transaction ID not received');
      }

      setTransactionId(preAuthResponse.params.transactionId);
      updateStepStatus('preauth', 'completed');
      await delay(1000);

      // Step 3: Automatically continue to confirm payment (no user action needed)
      setCurrentStep('confirming');
      updateStepStatus('confirming', 'processing');

      // Commit the transaction
      const commitResponse = await waafipay.commit(
        preAuthResponse.params.transactionId,
        'Payment confirmed'
      );

      if (commitResponse.responseCode !== '2001') {
        throw new Error(commitResponse.responseMsg || 'Payment confirmation failed');
      }

      updateStepStatus('confirming', 'completed');
      await delay(500);

      // Step 4: Send USDT via Binance
      setCurrentStep('sending_crypto');
      updateStepStatus('sending_crypto', 'processing');

      // Check if we're using testnet (skip actual API call)
      const isTestnet = getBinanceConfig().apiUrl.includes('testnet');
      
      let withdrawResponse;
      if (isTestnet) {
        // Simulate successful withdrawal for testing
        console.log('=== Binance Test Mode ===');
        console.log('Skipping actual API call (testnet mode)');
        console.log('Simulating successful withdrawal');
        console.log('To Address:', recipientAddress);
        console.log('Amount:', receiveAmount, 'USDT');
        console.log('========================');
        
        await delay(2000); // Simulate API delay
        withdrawResponse = {
          id: `TEST_${Date.now()}`,
          status: 'processing',
          amount: receiveAmount,
          coin: 'USDT',
          network: 'BEP20',
          address: recipientAddress,
          txId: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        };
      } else {
        // Real Binance API call
        withdrawResponse = await binance.withdrawUSDT(
          recipientAddress,
          receiveAmount
        );
      }

      if (!withdrawResponse.id) {
        throw new Error('Failed to initiate USDT transfer');
      }

      updateStepStatus('sending_crypto', 'completed');
      await delay(500);

      // Step 5: Complete
      setCurrentStep('completed');
      updateStepStatus('completed', 'completed');

      // Show success alert
      Alert.alert(
        'Swap Completed!',
        `Successfully swapped ${sendAmount} ${sendCurrency} to ${receiveAmount} ${receiveCurrency}`,
        [
          {
            text: 'Done',
            onPress: () => router.replace('/(tabs)' as any),
          },
        ]
      );

    } catch (error: any) {
      console.error('Swap Error:', error);
      setError(error.message || 'An error occurred');
      // Mark the preauth step as failed explicitly
      updateStepStatus('preauth', 'failed');
      setCurrentStep('failed');
    }
  };

  const confirmPayment = async () => {
    try {
      // Step 4: Commit the transaction
      setCurrentStep('confirming');
      updateStepStatus('confirming', 'processing');

      const commitResponse = await waafipay.commit(
        transactionId,
        'Payment confirmed'
      );

      if (commitResponse.responseCode !== '2001') {
        throw new Error(commitResponse.responseMsg || 'Payment confirmation failed');
      }

      updateStepStatus('confirming', 'completed');
      await delay(500);

      // Step 5: Send USDT via Binance
      setCurrentStep('sending_crypto');
      updateStepStatus('sending_crypto', 'processing');

      // Check if we're using testnet (skip actual API call)
      const isTestnet = getBinanceConfig().apiUrl.includes('testnet');
      
      let withdrawResponse;
      if (isTestnet) {
        // Simulate successful withdrawal for testing
        console.log('=== Binance Test Mode ===');
        console.log('Skipping actual API call (testnet mode)');
        console.log('Simulating successful withdrawal');
        console.log('To Address:', recipientAddress);
        console.log('Amount:', receiveAmount, 'USDT');
        console.log('========================');
        
        await delay(2000); // Simulate API delay
        withdrawResponse = {
          id: `TEST_${Date.now()}`,
          status: 'processing',
          amount: receiveAmount,
          coin: 'USDT',
          network: 'BEP20',
          address: recipientAddress,
          txId: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        };
      } else {
        // Real Binance API call
        withdrawResponse = await binance.withdrawUSDT(
          recipientAddress,
          receiveAmount
        );
      }

      if (!withdrawResponse.id) {
        throw new Error('Failed to initiate USDT transfer');
      }

      updateStepStatus('sending_crypto', 'completed');
      await delay(500);

      // Step 6: Complete
      setCurrentStep('completed');
      updateStepStatus('completed', 'completed');

      // Show success alert
      Alert.alert(
        'Swap Completed!',
        `Successfully swapped ${sendAmount} ${sendCurrency} to ${receiveAmount} ${receiveCurrency}`,
        [
          {
            text: 'Done',
            onPress: () => router.replace('/(tabs)' as any),
          },
        ]
      );

    } catch (error: any) {
      console.error('Confirm Payment Error:', error);
      setError(error.message || 'Payment confirmation failed');
      updateStepStatus(currentStep, 'failed');

      // Cancel the preauth if payment confirmation fails
      if (transactionId) {
        try {
          await waafipay.cancel(transactionId, 'Payment failed');
        } catch (cancelError) {
          console.error('Cancel Error:', cancelError);
        }
      }
    }
  };

  const updateStepStatus = (step: SwapStep, status: 'pending' | 'processing' | 'completed' | 'failed') => {
    setSteps((prevSteps) =>
      prevSteps.map((s) => (s.step === step ? { ...s, status } : s))
    );
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const getStepIcon = (status: 'pending' | 'processing' | 'completed' | 'failed') => {
    switch (status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
      case 'failed':
        return <Ionicons name="close-circle" size={24} color="#ff4444" />;
      case 'processing':
        return <ActivityIndicator size="small" color={colors.tint} />;
      default:
        return <View style={[styles.pendingDot, { backgroundColor: colors.border }]} />;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Processing Swap
        </Text>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: colors.tint }]}
          onPress={() => {
            if (currentStep === 'completed' || currentStep === 'failed') {
              router.back();
            } else {
              Alert.alert(
                'Cancel Swap?',
                'Are you sure you want to cancel this swap?',
                [
                  { text: 'No', style: 'cancel' },
                  {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: () => router.back(),
                  },
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
            <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Send:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {sendAmount} {sendCurrency}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Receive:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {receiveAmount} {receiveCurrency}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>To Address:</Text>
            <Text style={[styles.summaryValueSmall, { color: colors.text }]} numberOfLines={1}>
              {recipientAddress || 'Loading...'}
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

      {/* Action Button */}
      {currentStep === 'completed' && (
        <View style={styles.bottomContainer}>
          <Button
            title="Done"
            onPress={() => router.replace('/(tabs)' as any)}
            style={styles.actionButton}
          />
        </View>
      )}

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
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 200,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  stepLine: {
    position: 'absolute',
    top: 28,
    bottom: -24,
    width: 2,
    left: 11,
  },
  pendingDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  actionButton: {
    width: '100%',
  },
});
