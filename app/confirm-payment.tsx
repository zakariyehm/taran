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
  
  // Get amount and merchant info from params (with defaults)
  const amount = params.amount ? parseFloat(params.amount as string) : 1;
  const merchantNumber = (params.merchantNumber as string) || '600104';
  
  const ussdCode = `*789*${merchantNumber}*${amount}#`;

  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(ussdCode);
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
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header with Close Button */}
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
        {/* Payment Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={[styles.instructionText, { color: colors.text }]}>
            Please send ${amount.toFixed(2)} to the following number: {merchantNumber}
          </Text>
          <Text style={[styles.instructionSubtext, { color: colors.secondaryText }]}>
            Below you can find the instruction on how to send money to us.
          </Text>
        </View>

        {/* USSD Code Section */}
        <View style={styles.codeSection}>
          <Text style={[styles.codeLabel, { color: colors.secondaryText }]}>Code</Text>
          <View style={[styles.codeContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.codeText, { color: colors.text }]}>{ussdCode}</Text>
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
                <Ionicons 
                  name="call-outline" 
                  size={20} 
                  color={colors.tint} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <View style={[styles.qrWrapper, { backgroundColor: colors.card }]}>
            <View style={[styles.qrPlaceholder, { backgroundColor: '#fff' }]}>
              <Text style={styles.qrPlaceholderText}>QR Code</Text>
              <Text style={[styles.qrPlaceholderSubtext, { color: colors.secondaryText }]}>
                {merchantNumber} - ${amount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Confirmation Message */}
        <Text style={[styles.confirmationText, { color: colors.secondaryText }]}>
          Once you have made payment, come back and confirm using the button below
        </Text>
      </ScrollView>

      {/* Confirm Payment Button */}
      <View style={styles.bottomContainer}>
        <Button
          title={`I have paid $${amount.toFixed(2)}`}
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
