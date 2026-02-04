import Button from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConfirmPaymentScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const params = useLocalSearchParams();

  const isCryptoToLocal = params.flow === 'crypto-to-local';
  const sendAmount = params.sendAmount ? parseFloat(params.sendAmount as string) : 0;
  const sendCurrency = (params.sendCurrency as string) || '';
  const receiveAmount = params.receiveAmount ? parseFloat(params.receiveAmount as string) : 0;
  const receiveCurrency = (params.receiveCurrency as string) || '';

  const amount = params.amount ? parseFloat(params.amount as string) : 1;
  const merchantNumber = (params.merchantNumber as string) || '600104';
  const ussdCode = `*789*${merchantNumber}*${amount}#`;
  const depositAddress = '0x69be2364f0b9f42a957eba9c208bc7447c763fcf';
  const shortAddress = depositAddress.length > 16
    ? `${depositAddress.slice(0, 6)}...${depositAddress.slice(-8)}`
    : depositAddress;

  const codeOrAddress = isCryptoToLocal ? depositAddress : ussdCode;
  const codeLabel = isCryptoToLocal ? 'Address' : 'Code';

  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(codeOrAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDialCode = () => {
    // Open phone dialer with USSD code
    const dialUrl = `tel:${ussdCode}`;
    Linking.openURL(dialUrl).catch((err) => {
      Alert.alert('Error', 'Could not open dialer. Please dial manually.');
      console.error('Failed to open dialer:', err);
    });
  };

  const handleConfirmPayment = () => {
    if (isCryptoToLocal) {
      // Navigate to verification screen
      router.push({
        pathname: '/verify-crypto-payment' as any,
        params: {
          sendAmount: sendAmount.toString(),
          sendCurrency,
          receiveCurrency,
          receiveAmount: receiveAmount.toString(),
        },
      });
    } else {
      Alert.alert(
        'Payment Confirmed',
        `You have confirmed payment of $${amount.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  const instructionText = isCryptoToLocal
    ? `Please send ${sendAmount.toFixed(2)} ${sendCurrency} to receive ${receiveAmount.toFixed(2)} ${receiveCurrency}. Use the code below:`
    : `Please send $${amount.toFixed(2)} to the following number: ${merchantNumber}`;
  const instructionSubtext = isCryptoToLocal
    ? 'Below you can find the instruction on how to complete your swap.'
    : 'Below you can find the instruction on how to send money to us.';
  const confirmButtonTitle = isCryptoToLocal
    ? `I have paid ${sendAmount.toFixed(2)} ${sendCurrency}`
    : `I have paid $${amount.toFixed(2)}`;
  const qrSubtext = isCryptoToLocal
    ? `${sendAmount.toFixed(2)} ${sendCurrency} → ${receiveAmount.toFixed(2)} ${receiveCurrency}`
    : `${merchantNumber} - $${amount.toFixed(2)}`;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Confirm Your Payment
        </Text>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: colors.tint }]}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.instructionsContainer}>
          <Text style={[styles.instructionText, { color: colors.text }]}>
            {instructionText}
          </Text>
          <Text style={[styles.instructionSubtext, { color: colors.secondaryText }]}>
            {instructionSubtext}
          </Text>
        </View>

        <View style={styles.codeSection}>
          <Text style={[styles.codeLabel, { color: colors.secondaryText }]}>{codeLabel}</Text>
          {isCryptoToLocal ? (
            <View style={[styles.addressCard, { backgroundColor: colors.card }]}>
              <View style={styles.addressRow}>
                <Text style={[styles.shortAddressText, { color: colors.text }]}>
                  {shortAddress}
                </Text>
                <TouchableOpacity
                  style={[styles.copyButton, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}
                  onPress={handleCopyCode}
                >
                  <Ionicons
                    name={copied ? 'checkmark' : 'copy-outline'}
                    size={18}
                    color={copied ? colors.tint : colors.text}
                  />
                  <Text style={[styles.copyButtonText, { color: colors.tint }]}>
                    {copied ? 'Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.codeContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.codeText, { color: colors.text }]}>
                {ussdCode}
              </Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleCopyCode}
                >
                  <Ionicons
                    name={copied ? "checkmark" : "copy-outline"}
                    size={20}
                    color={copied ? colors.tint : colors.secondaryText}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleDialCode}
                >
                  <Ionicons name="call-outline" size={20} color={colors.tint} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.qrContainer}>
          <View style={[styles.qrWrapper, { backgroundColor: colors.card }]}>
            <View style={[styles.qrPlaceholder, { backgroundColor: '#fff' }]}>
              <Text style={styles.qrPlaceholderText}>QR Code</Text>
              <Text style={[styles.qrPlaceholderSubtext, { color: colors.secondaryText }]}>
                {qrSubtext}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.confirmationText, { color: colors.secondaryText }]}>
          Once you have made payment, come back and confirm using the button below
        </Text>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Button
          title={confirmButtonTitle}
          onPress={handleConfirmPayment}
          style={styles.confirmButton}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
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
  instructionsContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  instructionSubtext: {
    fontSize: 14,
    lineHeight: 20,
  },
  codeSection: {
    marginBottom: 32,
  },
  codeLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  addressCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shortAddressText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
    flex: 1,
    marginRight: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  codeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 12,
  },
  actionButton: {
    padding: 4,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrWrapper: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  qrPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  qrPlaceholderSubtext: {
    fontSize: 14,
  },
  confirmationText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },
  confirmButton: {
    width: '100%',
  },
});
