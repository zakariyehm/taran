import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface AccountCard {
  icon: string;
  balance: string;
  label: string;
}

const localCards: AccountCard[] = [
  { icon: '📱', balance: '50.00', label: 'EvcPlus' },
  { icon: '📱', balance: '25.00', label: 'Zaad' },
  { icon: '📱', balance: '15.00', label: 'Sahal' },
];

const cryptoCards: AccountCard[] = [
  { icon: '₮', balance: '100.00', label: 'USDT (TRC20)' },
  { icon: '₮', balance: '50.00', label: 'USDT (BEP20)' },
  { icon: '◎', balance: '2.50', label: 'Solana' },
];

export default function AccountBalance() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Crypto'>('All');

  const cards = selectedFilter === 'Crypto' ? cryptoCards : localCards;

  return (
    <View style={styles.container}>
      {/* Account Title */}
      <Text style={[styles.title, { color: colors.text }]}>Account</Text>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['All', 'Crypto'] as const).map((filter) => {
          const isSelected = selectedFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                isSelected
                  ? { backgroundColor: colors.tint }
                  : {
                      backgroundColor: colorScheme === 'light' ? '#fff' : 'transparent',
                      borderWidth: 1,
                      borderColor: colors.tint,
                    },
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isSelected ? '#fff' : colors.tint },
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: colorScheme === 'light' ? '#fff' : 'transparent',
              borderWidth: 1,
              borderColor: colors.tint,
            },
          ]}
          onPress={() => router.push('/add-account')}
        >
          <Text style={[styles.filterText, { color: colors.tint }]}>
            Add Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Currency Cards - Horizontally Scrollable */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
      >
        {cards.map((card, index) => (
          <View
            key={index}
            style={[styles.currencyCard, { backgroundColor: colors.card }]}
          >
            <View style={styles.flagContainer}>
              <Text style={styles.flag}>{card.icon}</Text>
            </View>
            <Text style={[styles.balance, { color: colors.text }]}>
              {card.balance}
            </Text>
            <Text style={[styles.currencyName, { color: colors.text }]}>
              {card.label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardsContainer: {
    gap: 12,
    paddingRight: 16,
    paddingBottom: 8,
  },
  currencyCard: {
    width: 160,
    borderRadius: 16,
    padding: 16,
    aspectRatio: 1.2,
  },
  flagContainer: {
    marginBottom: 12,
  },
  flag: {
    fontSize: 32,
  },
  balance: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  currencyName: {
    fontSize: 14,
    fontWeight: '400',
  },
});
