import Button from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ONBOARDING_KEY = '@onboarding_complete';
const ADDED_ACCOUNTS_KEY = '@added_accounts';

export default function ChooseProviderScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const params = useLocalSearchParams();
  const [selectedProvider, setSelectedProvider] = useState<'merchant' | 'automatic' | null>(null);
  const [evcPlusNumber, setEvcPlusNumber] = useState<string>('');

  useEffect(() => {
    loadEvcPlusNumber();
  }, []);

  const loadEvcPlusNumber = async () => {
    try {
      console.log('=== Loading EvcPlus Number ===');
      
      // First, try to get from onboarding data
      const onboardRaw = await AsyncStorage.getItem(ONBOARDING_KEY);
      const onboard = onboardRaw ? JSON.parse(onboardRaw) : null;
      console.log('Onboarding account type:', onboard?.accountType);
      
      let evcNumber = '';
      
      // If onboarding account is EvcPlus, use that number
      if (onboard?.accountType === 'EvcPlus' && onboard?.number) {
        evcNumber = onboard.number;
        console.log('Found EvcPlus in onboarding:', evcNumber);
      } else {
        // Otherwise, check ADDED_ACCOUNTS for EvcPlus
        const addedRaw = await AsyncStorage.getItem(ADDED_ACCOUNTS_KEY);
        if (addedRaw) {
          const addedList = JSON.parse(addedRaw);
          const evcAccount = addedList.find((acc: any) => acc.label === 'EvcPlus');
          if (evcAccount?.number) {
            evcNumber = evcAccount.number;
            console.log('Found EvcPlus in added accounts:', evcNumber);
          }
        }
      }
      
      if (evcNumber) {
        // Clean the number: remove spaces, +, -, (), etc.
        let cleanNumber = evcNumber.replace(/[\s+\-()]/g, '');
        
        // Add country code if missing (Somalia = 252)
        if (cleanNumber.length === 9 && !cleanNumber.startsWith('252')) {
          cleanNumber = '252' + cleanNumber;
          console.log('Added country code 252 to number');
        }
        
        console.log('Final EvcPlus number:', cleanNumber);
        setEvcPlusNumber(cleanNumber);
      } else {
        console.warn('⚠️ No EvcPlus account found');
      }
      
      console.log('===========================');
    } catch (error) {
      console.error('Failed to load EvcPlus number:', error);
    }
  };

  const handleNext = () => {
    if (selectedProvider) {
      if (selectedProvider === 'merchant') {
        // Navigate to confirm payment screen for merchant selection
        router.push({
          pathname: '/confirm-payment',
          params: {
            amount: params.amount || '1',
            merchantNumber: params.merchantNumber || '600104',
          },
        });
      } else if (selectedProvider === 'automatic') {
        // Validate phone number before proceeding
        if (!evcPlusNumber || evcPlusNumber.length < 10) {
          Alert.alert(
            'Account Required',
            'Please add your EvcPlus account number in Settings > Manage Accounts before using automatic swap.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Navigate to automatic swap processing
        router.push({
          pathname: '/process-swap',
          params: {
            sendAmount: params.sendAmount || params.amount || '1',
            sendCurrency: params.sendCurrency || 'EvcPlus',
            receiveCurrency: params.receiveCurrency || 'USDT (BEP20)',
            receiveAmount: params.receiveAmount || params.amount || '1',
            evcPlusNumber: evcPlusNumber,
          },
        });
      }
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Choose Provider</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Provider Options */}
        <View style={styles.optionsContainer}>
          {/* Automatic Provider */}
          <TouchableOpacity
            style={[
              styles.providerCard,
              { 
                backgroundColor: colors.card,
                borderColor: selectedProvider === 'automatic' ? colors.tint : 'transparent',
                borderWidth: 2,
              },
            ]}
            onPress={() => setSelectedProvider('automatic')}
          >
            <View style={styles.providerHeader}>
              <Text style={[styles.providerTitle, { color: colors.text }]}>
                Automatic
              </Text>
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor: selectedProvider === 'automatic' ? colors.tint : colors.border,
                    },
                  ]}
                >
                  {selectedProvider === 'automatic' && (
                    <View style={[styles.radioInner, { backgroundColor: colors.tint }]} />
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Merchant Provider */}
          <TouchableOpacity
            style={[
              styles.providerCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedProvider === 'merchant' ? colors.tint : 'transparent',
                borderWidth: 2,
              },
            ]}
            onPress={() => setSelectedProvider('merchant')}
          >
            <View style={styles.providerHeader}>
              <Text style={[styles.providerTitle, { color: colors.text }]}>
                Merchant
              </Text>
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor: selectedProvider === 'merchant' ? colors.tint : colors.border,
                    },
                  ]}
                >
                  {selectedProvider === 'merchant' && (
                    <View style={[styles.radioInner, { backgroundColor: colors.tint }]} />
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.bottomContainer}>
        <Button
          title="Next"
          onPress={handleNext}
          disabled={!selectedProvider}
          style={styles.nextButton}
        />
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  optionsContainer: {
    gap: 16,
  },
  providerCard: {
    borderRadius: 16,
    padding: 20,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radioContainer: {
    padding: 4,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  providerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 60,
  },
  nextButton: {
    width: '100%',
  },
});
