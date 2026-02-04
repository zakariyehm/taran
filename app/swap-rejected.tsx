import Button from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SwapRejectedScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const params = useLocalSearchParams();

  const sendAmount = params.sendAmount ? parseFloat(params.sendAmount as string) : 0;
  const sendCurrency = (params.sendCurrency as string) || '';
  const receiveCurrency = (params.receiveCurrency as string) || '';
  const receiveAmount = params.receiveAmount ? parseFloat(params.receiveAmount as string) : 0;
  const errorMessage = (params.errorMessage as string) || 'Your swap could not be completed.';

  const handleDone = () => {
    router.replace('/(tabs)' as any);
  };

  const handleTryAgain = () => {
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Rejected Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.rejectedCircle, { backgroundColor: '#ff444420' }]}>
            <Ionicons name="close-circle" size={80} color="#ff4444" />
          </View>
        </View>

        {/* Rejected Message */}
        <Text style={[styles.title, { color: colors.text }]}>Swap Rejected</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          {errorMessage}
        </Text>

        {/* Details Card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Swap Details</Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Send:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {sendAmount} {sendCurrency}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Receive:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {receiveAmount} {receiveCurrency}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Date:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Try Again"
            onPress={handleTryAgain}
            variant="outline"
            style={styles.tryButton}
          />
          <Button
            title="Done"
            onPress={handleDone}
            style={styles.doneButton}
          />
        </View>
      </ScrollView>
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
    padding: 20,
    paddingTop: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  rejectedCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  detailsCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  tryButton: {
    width: '100%',
    marginBottom: 12,
  },
  doneButton: {
    width: '100%',
  },
});
