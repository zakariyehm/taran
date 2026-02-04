import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Transaction {
  id: string;
  name: string;
  status: string;
  amount: string;
  currency: string;
  icon: 'arrow-up' | 'arrow-down' | 'document-text' | 'card';
  iconColor: string;
}

const transactions: Transaction[] = [
  {
    id: '1',
    name: 'Swap: EvcPlus → Zaad',
    status: 'Completed · Today',
    amount: '98.90',
    currency: 'Zaad',
    icon: 'arrow-up',
    iconColor: '#3a3a3a',
  },
  {
    id: '2',
    name: 'Swap: Zaad → USDT (BEP20)',
    status: 'Completed · Feb 16th',
    amount: '98.00',
    currency: 'USDT-BEP20',
    icon: 'arrow-up',
    iconColor: '#3a3a3a',
  },
  {
    id: '3',
    name: 'Swap: USDT (TRC20) → EvcPlus',
    status: 'Completed · Feb 14th',
    amount: '97.00',
    currency: 'EvcPlus',
    icon: 'arrow-down',
    iconColor: '#3a3a3a',
  },
  {
    id: '4',
    name: 'Swap: Sahal → Solana',
    status: 'Completed · Feb 10th',
    amount: '12.88',
    currency: 'SOL',
    icon: 'card',
    iconColor: '#3a3a3a',
  },
  {
    id: '5',
    name: 'Swap: EvcPlus → Sahal',
    status: 'Completed · Feb 8th',
    amount: '49.45',
    currency: 'Sahal',
    icon: 'arrow-up',
    iconColor: '#3a3a3a',
  },
  {
    id: '6',
    name: 'Swap: Solana → Zaad',
    status: 'Completed · Feb 5th',
    amount: '73.25',
    currency: 'Zaad',
    icon: 'arrow-down',
    iconColor: '#3a3a3a',
  },
];

export default function RecipientsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={[styles.transactionItem, { borderBottomColor: colors.border }]}>
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Recipients</Text>
        </View>
      </SafeAreaView>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
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
});
