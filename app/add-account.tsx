import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AccountOption {
  icon: string;
  label: string;
  type: 'local' | 'crypto';
}

const accountOptions: AccountOption[] = [
  { icon: '📱', label: 'EvcPlus', type: 'local' },
  { icon: '📱', label: 'Zaad', type: 'local' },
  { icon: '📱', label: 'Sahal', type: 'local' },
  { icon: '₮', label: 'USDT (TRC20)', type: 'crypto' },
  { icon: '₮', label: 'USDT (BEP20)', type: 'crypto' },
  { icon: '◎', label: 'Solana', type: 'crypto' },
];

export default function AddAccountScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const handleAddAccount = (option: AccountOption) => {
    // TODO: Navigate to account setup flow
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Add Account</Text>
      </View>

      {/* Account options list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: colors.secondaryText }]}>
          Local
        </Text>
        {accountOptions
          .filter((o) => o.type === 'local')
          .map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.optionCard, { backgroundColor: colors.card }]}
              onPress={() => handleAddAccount(option)}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                {option.label}
              </Text>
              <Ionicons name="add-circle-outline" size={24} color={colors.tint} />
            </TouchableOpacity>
          ))}

        <Text
          style={[
            styles.sectionLabel,
            styles.sectionLabelTop,
            { color: colors.secondaryText },
          ]}
        >
          Crypto
        </Text>
        {accountOptions
          .filter((o) => o.type === 'crypto')
          .map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.optionCard, { backgroundColor: colors.card }]}
              onPress={() => handleAddAccount(option)}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                {option.label}
              </Text>
              <Ionicons name="add-circle-outline" size={24} color={colors.tint} />
            </TouchableOpacity>
          ))}
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionLabelTop: {
    marginTop: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
});
