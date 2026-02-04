import Button from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SwapCompleteScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const params = useLocalSearchParams();

  const sendAmount = params.sendAmount ? parseFloat(params.sendAmount as string) : 0;
  const sendCurrency = (params.sendCurrency as string) || '';
  const receiveCurrency = (params.receiveCurrency as string) || '';
  const receiveAmount = params.receiveAmount ? parseFloat(params.receiveAmount as string) : 0;
  const transactionId = (params.transactionId as string) || '';

  const handleDone = () => {
    router.replace('/(tabs)' as any);
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
        <View style={styles.iconContainer}>
          <View style={[styles.successCircle, { backgroundColor: colors.tint + '20' }]}>
            <Ionicons name="checkmark-circle" size={80} color={colors.tint} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Swap Completed!</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          You received {receiveAmount} {receiveCurrency}
        </Text>

        <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Transaction Details</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Sent:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {sendAmount} {sendCurrency}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Received:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {receiveAmount} {receiveCurrency}
            </Text>
          </View>
          {transactionId ? (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Transaction ID:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
                {transactionId}
              </Text>
            </View>
          ) : null}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Date:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        <Button title="Done" onPress={handleDone} style={styles.doneButton} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  iconContainer: { alignItems: 'center', marginTop: 40, marginBottom: 24 },
  successCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
  detailsCard: { borderRadius: 16, padding: 20, marginBottom: 32 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: '600', maxWidth: '60%' },
  doneButton: { width: '100%' },
});
