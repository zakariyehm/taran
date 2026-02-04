import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ModalScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [selectedTab, setSelectedTab] = useState<'International' | 'Same currency'>('International');
  const [sendAmount, setSendAmount] = useState('1,000');
  const [receiveAmount, setReceiveAmount] = useState('1,151');
  const [sendCurrency, setSendCurrency] = useState('GBP');
  const [receiveCurrency, setReceiveCurrency] = useState('EUR');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setSelectedTab('International')}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.text },
                selectedTab === 'International' && styles.tabTextSelected,
              ]}
            >
              International
            </Text>
            {selectedTab === 'International' && (
              <View style={[styles.tabUnderline, { backgroundColor: colors.tint }]} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setSelectedTab('Same currency')}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.secondaryText },
                selectedTab === 'Same currency' && styles.tabTextSelected,
              ]}
            >
              Same currency
            </Text>
            {selectedTab === 'Same currency' && (
              <View style={[styles.tabUnderline, { backgroundColor: colors.tint }]} />
            )}
          </TouchableOpacity>
        </View>

        {/* You send exactly section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.secondaryText }]}>
            You send exactly
          </Text>
          
          <View style={styles.amountContainer}>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={sendAmount}
              onChangeText={setSendAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.secondaryText}
            />
            
            <TouchableOpacity style={[styles.currencySelector, { backgroundColor: colors.border }]}>
              <Text style={styles.flag}>🇬🇧</Text>
              <Text style={[styles.currencyText, { color: colors.text }]}>{sendCurrency}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>

          {/* Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <View style={[styles.bulletPoint, { backgroundColor: colors.secondaryText }]} />
              <Text style={[styles.detailLeft, { color: colors.secondaryText }]}>8.65 GBP</Text>
              <Text style={[styles.detailRight, { color: colors.tint }]}>Fast & Easy transfer fee</Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={[styles.bulletPoint, { backgroundColor: colors.secondaryText }]} />
              <Text style={[styles.detailLeft, { color: colors.secondaryText }]}>991.35 GBP</Text>
              <Text style={[styles.detailRight, { color: colors.secondaryText }]}>Total amount we'll convert</Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={[styles.bulletPoint, { backgroundColor: colors.secondaryText }]} />
              <Text style={[styles.detailLeft, { color: colors.secondaryText }]}>1.16104</Text>
              <Text style={[styles.detailRight, { color: colors.tint }]}>Guaranteed exchange rate (2h)</Text>
            </View>
          </View>
        </View>

        {/* Recipient gets section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.secondaryText }]}>
            Recipient gets
          </Text>
          
          <View style={styles.amountContainer}>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={receiveAmount}
              onChangeText={setReceiveAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.secondaryText}
            />
            
            <TouchableOpacity style={[styles.currencySelector, { backgroundColor: colors.border }]}>
              <View style={[styles.euroIcon, { backgroundColor: '#6366F1' }]}>
                <Text style={styles.euroSymbol}>€</Text>
              </View>
              <Text style={[styles.currencyText, { color: colors.text }]}>{receiveCurrency}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <Text style={[styles.summaryText, { color: colors.secondaryText }]}>
            You save up to 21.45 GBP
          </Text>
          <Text style={[styles.summaryText, { color: colors.secondaryText }]}>
            Should arrive in 3 hours
          </Text>
        </View>

        {/* Price comparison button */}
        <TouchableOpacity
          style={[
            styles.priceComparisonButton,
            { borderColor: colors.tint },
          ]}
        >
          <Text style={[styles.priceComparisonText, { color: colors.tint }]}>
            Price comparison
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Continue button */}
      <View style={[styles.bottomContainer, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.tint }]}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 32,
  },
  tab: {
    position: 'relative',
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabTextSelected: {
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '300',
    flex: 1,
    letterSpacing: -1,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  flag: {
    fontSize: 20,
  },
  euroIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  euroSymbol: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  detailLeft: {
    fontSize: 14,
    minWidth: 80,
  },
  detailRight: {
    fontSize: 14,
    flex: 1,
  },
  summaryContainer: {
    marginTop: 8,
    marginBottom: 24,
    gap: 4,
  },
  summaryText: {
    fontSize: 14,
  },
  priceComparisonButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  priceComparisonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
