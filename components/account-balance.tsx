import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const ONBOARDING_KEY = '@onboarding_complete';
const ADDED_ACCOUNTS_KEY = '@added_accounts';

interface AccountCard {
  icon: string;
  balance: string;
  last4: string;
  address?: string;
  label: string;
}

const getIcon = (label: string) => {
  if (label.includes('USDT')) return '₮';
  if (label === 'Solana') return '◎';
  return '📱';
};

export default function AccountBalance() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Crypto'>('All');
  const [localCards, setLocalCards] = useState<AccountCard[]>([]);
  const [cryptoCards, setCryptoCards] = useState<AccountCard[]>([]);

  const loadAccounts = useCallback(async () => {
    try {
      const [onboardRaw, addedRaw] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        AsyncStorage.getItem(ADDED_ACCOUNTS_KEY),
      ]);
      const parsed = onboardRaw ? JSON.parse(onboardRaw) : null;
      const evcNumber = parsed?.number?.trim() || '';
      const local: AccountCard[] = [
        { icon: '📱', balance: '0.00', last4: evcNumber || '****', label: 'EvcPlus' },
      ];
      const crypto: AccountCard[] = [];
      const added: { label: string; type: string; number?: string; address?: string }[] = addedRaw ? JSON.parse(addedRaw) : [];
      added.forEach((a) => {
        const card: AccountCard = {
          icon: getIcon(a.label),
          balance: '0.00',
          last4: a.number || '',
          label: a.label,
        };
        if (a.type === 'local' && a.number) {
          card.last4 = a.number;
          local.push(card);
        } else if (a.type === 'crypto' && a.address) {
          card.address = a.address;
          card.last4 = '';
          crypto.push(card);
        }
      });
      setLocalCards(local);
      setCryptoCards(crypto);
    } catch {
      setLocalCards([{ icon: '📱', balance: '0.00', last4: '****', label: 'EvcPlus' }]);
      setCryptoCards([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [loadAccounts])
  );

  const cards = selectedFilter === 'Crypto' ? cryptoCards : localCards;

  const maskLast4 = (number: string) => {
    if (number.length <= 4) return '****';
    return number.slice(0, -4) + '****';
  };

  const shortAddress = (address: string, start = 6, end = 4) => {
    if (address.length <= start + end) return address;
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  };

  const getDisplayValue = (card: AccountCard, isCrypto: boolean) => {
    if (isCrypto && card.address) {
      return shortAddress(card.address);
    }
    return maskLast4(card.last4);
  };

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
            key={card.label + (card.address || card.last4) + index}
            style={[styles.currencyCard, { backgroundColor: colors.card }]}
          >
            <View style={styles.flagContainer}>
              <Text style={styles.flag}>{card.icon}</Text>
            </View>
            <Text style={[styles.balance, { color: colors.text }]}>
              {getDisplayValue(card, selectedFilter === 'Crypto')}
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
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  currencyName: {
    fontSize: 14,
    fontWeight: '400',
  },
});
