import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TRANSACTIONS_KEY = '@swap_transactions';

export default function Header() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [totalExchange, setTotalExchange] = useState<string>('0.00');

  useFocusEffect(
    useCallback(() => {
      loadTotalExchange();
    }, [])
  );

  const loadTotalExchange = async () => {
    try {
      const stored = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      if (!stored) {
        setTotalExchange('0.00');
        return;
      }
      const transactions = JSON.parse(stored);
      const total = transactions.reduce((sum: number, tx: { amount?: string; details?: { receiveAmount?: string } }) => {
        const amount = tx.details?.receiveAmount
          ? parseFloat(tx.details.receiveAmount)
          : parseFloat(tx.amount || '0');
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      setTotalExchange(total.toFixed(2));
    } catch {
      setTotalExchange('0.00');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        {/* Left: Profile Icon */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="person-outline" size={24} color={colors.secondaryText} />
        </TouchableOpacity>

        {/* Center: Balance Text and Amount */}
        <View style={styles.centerContent}>
          <Text style={[styles.balanceLabel, { color: colors.secondaryText }]}>Total Exchange</Text>
          <Text style={[styles.balanceAmount, { color: colors.tint }]}>USD {totalExchange}</Text>
        </View>

        {/* Right: Card/Wallet Icon */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="card-outline" size={24} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: '600',
  },
});
