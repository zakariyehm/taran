import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
    name: 'Jonny Pease',
    status: 'Cancelled · Today',
    amount: '1,156.10',
    currency: 'EUR',
    icon: 'arrow-up',
    iconColor: '#3a3a3a',
  },
  {
    id: '2',
    name: 'Assets fee',
    status: 'Mar 1st',
    amount: '0.01',
    currency: 'GBP',
    icon: 'document-text',
    iconColor: '#3a3a3a',
  },
  {
    id: '3',
    name: 'Jonathan Pease',
    status: 'Sent · Feb 16th',
    amount: '99.76',
    currency: 'GBP',
    icon: 'arrow-up',
    iconColor: '#3a3a3a',
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    status: 'Received · Feb 14th',
    amount: '250.00',
    currency: 'EUR',
    icon: 'arrow-down',
    iconColor: '#3a3a3a',
  },
  {
    id: '5',
    name: 'Monthly subscription',
    status: 'Feb 10th',
    amount: '12.99',
    currency: 'GBP',
    icon: 'card',
    iconColor: '#3a3a3a',
  },
];

export default function TransactionList() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

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
        <TouchableOpacity onPress={() => router.push('/recipients')}>
          <Text style={[styles.seeAll, { color: colors.tint }]}>See all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
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
});
