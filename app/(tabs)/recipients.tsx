import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TRANSACTIONS_KEY = '@swap_transactions';

interface Transaction {
  id: string;
  name: string;
  status: string;
  amount: string;
  currency: string;
  icon: 'arrow-up' | 'arrow-down' | 'document-text' | 'card' | 'swap-horizontal';
  iconColor: string;
  date: string;
  details?: {
    sendAmount: string;
    sendCurrency: string;
    receiveAmount: string;
    receiveCurrency: string;
    transactionId?: string;
    timestamp?: string;
  };
}

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    name: 'Swap: EvcPlus → Zaad',
    status: 'Completed · Today',
    amount: '98.90',
    currency: 'Zaad',
    icon: 'arrow-up',
    iconColor: '#3a3a3a',
    date: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Swap: Zaad → USDT (BEP20)',
    status: 'Completed · Feb 16th',
    amount: '98.00',
    currency: 'USDT-BEP20',
    icon: 'arrow-up',
    iconColor: '#3a3a3a',
    date: '2026-02-16T10:30:00.000Z',
  },
  {
    id: '3',
    name: 'Swap: USDT (TRC20) → EvcPlus',
    status: 'Completed · Feb 14th',
    amount: '97.00',
    currency: 'EvcPlus',
    icon: 'arrow-down',
    iconColor: '#3a3a3a',
    date: '2026-02-14T14:20:00.000Z',
  },
  {
    id: '4',
    name: 'Swap: Sahal → Solana',
    status: 'Completed · Feb 10th',
    amount: '12.88',
    currency: 'SOL',
    icon: 'card',
    iconColor: '#3a3a3a',
    date: '2026-02-10T09:15:00.000Z',
  },
  {
    id: '5',
    name: 'Swap: EvcPlus → Sahal',
    status: 'Completed · Feb 8th',
    amount: '49.45',
    currency: 'Sahal',
    icon: 'arrow-up',
    iconColor: '#3a3a3a',
    date: '2026-02-08T16:45:00.000Z',
  },
  {
    id: '6',
    name: 'Swap: Solana → Zaad',
    status: 'Completed · Feb 5th',
    amount: '73.25',
    currency: 'Zaad',
    icon: 'arrow-down',
    iconColor: '#3a3a3a',
    date: '2026-02-05T11:00:00.000Z',
  },
];

export default function RecipientScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const loadTransactions = async () => {
    try {
      const stored = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setTransactions(parsed);
      } else {
        // Show sample data if no transactions yet
        setTransactions(sampleTransactions);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions(sampleTransactions);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleTransactionPress = (item: Transaction) => {
    let message = `\n${item.name}\n${item.status}\n\n`;
    
    if (item.details) {
      message += `Sent: ${item.details.sendAmount} ${item.details.sendCurrency}\n`;
      message += `Received: ${item.details.receiveAmount} ${item.details.receiveCurrency}\n`;
      if (item.details.transactionId) {
        message += `\nTransaction ID:\n${item.details.transactionId}\n`;
      }
      message += `\nDate: ${formatDate(item.date)}`;
      if (item.details.timestamp) {
        message += `\nTime: ${formatTime(item.details.timestamp)}`;
      }
    } else {
      message += `Amount: ${item.amount} ${item.currency}\n`;
      message += `Date: ${formatDate(item.date)}`;
    }

    Alert.alert(
      'Transaction Details',
      message,
      [{ text: 'OK' }]
    );
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={[styles.transactionItem, { borderBottomColor: colors.border }]}
      onPress={() => handleTransactionPress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.border }]}>
        <Ionicons name={item.icon} size={20} color={colors.text} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.transactionStatus, { color: colors.secondaryText }]}>
          {item.status}
        </Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {item.amount} {item.currency}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Recent Swaps</Text>
          </View>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Recent Swaps</Text>
        </View>
      </SafeAreaView>
      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="swap-horizontal" size={64} color={colors.secondaryText} />
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            No swap transactions yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
            Complete your first swap to see it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
