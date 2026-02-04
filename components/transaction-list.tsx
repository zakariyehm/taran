import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TRANSACTIONS_KEY = '@swap_transactions';
const LAST_N = 5;

interface Transaction {
  id: string;
  name: string;
  status: string;
  amount: string;
  currency: string;
  icon: 'arrow-up' | 'arrow-down' | 'document-text' | 'card' | 'swap-horizontal';
  iconColor: string;
}

function formatStatus(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Completed · Today';
    if (diffDays === 1) return 'Completed · Yesterday';
    if (diffDays < 7) return `Completed · ${diffDays} days ago`;
    return `Completed · ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } catch {
    return 'Completed';
  }
}

export default function TransactionList() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadLastTransactions();
    }, [])
  );

  const loadLastTransactions = async () => {
    try {
      const stored = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      if (!stored) {
        setTransactions([]);
        return;
      }
      const raw = JSON.parse(stored);
      const list: Transaction[] = (Array.isArray(raw) ? raw : []).slice(0, LAST_N).map((tx: any) => ({
        id: tx.id || '',
        name: tx.name || 'Swap',
        status: tx.status || formatStatus(tx.date || new Date().toISOString()),
        amount: tx.details?.receiveAmount ?? tx.amount ?? '0',
        currency: tx.details?.receiveCurrency ?? tx.currency ?? '',
        icon: tx.icon === 'swap-horizontal' ? 'swap-horizontal' : (tx.icon || 'arrow-up'),
        iconColor: tx.iconColor || '#3a3a3a',
      }));
      setTransactions(list);
    } catch {
      setTransactions([]);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={[styles.transactionItem, { borderBottomColor: colors.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.border }]}>
        <Ionicons name={item.icon} size={20} color={colors.text} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.transactionStatus, { color: colors.secondaryText }]}>{item.status}</Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {item.amount} {item.currency}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
        <TouchableOpacity onPress={() => router.push('/recipients' as any)}>
          <Text style={[styles.seeAll, { color: colors.tint }]}>See all</Text>
        </TouchableOpacity>
      </View>
      {transactions.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No transactions yet</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 14,
    fontWeight: '400',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
});
