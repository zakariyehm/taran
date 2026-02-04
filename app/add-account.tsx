import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ONBOARDING_KEY = '@onboarding_complete';
const ADDED_ACCOUNTS_KEY = '@added_accounts';

export interface AddedAccount {
  label: string;
  type: 'local' | 'crypto';
  number?: string;
  address?: string;
}

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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editNumber, setEditNumber] = useState('');
  const [editError, setEditError] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addOption, setAddOption] = useState<AccountOption | null>(null);
  const [addValue, setAddValue] = useState('');
  const [addError, setAddError] = useState('');
  const [addIsEdit, setAddIsEdit] = useState(false);
  const [existingLabels, setExistingLabels] = useState<Set<string>>(new Set(['EvcPlus']));

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const [onboard, added] = await Promise.all([
            AsyncStorage.getItem(ONBOARDING_KEY),
            AsyncStorage.getItem(ADDED_ACCOUNTS_KEY),
          ]);
          const labels = new Set<string>();
          if (onboard) labels.add('EvcPlus');
          if (added) {
            const list: AddedAccount[] = JSON.parse(added);
            list.forEach((a) => labels.add(a.label));
          }
          setExistingLabels(labels);
        } catch {
          setExistingLabels(new Set());
        }
      };
      load();
    }, [])
  );

  const handleAddAccount = async (option: AccountOption) => {
    if (option.label === 'EvcPlus') {
      try {
        const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        setEditNumber(parsed?.number?.trim() || '');
        setEditError('');
        setEditModalVisible(true);
      } catch {
        setEditNumber('');
        setEditModalVisible(true);
      }
    } else {
      try {
        const raw = await AsyncStorage.getItem(ADDED_ACCOUNTS_KEY);
        const list: AddedAccount[] = raw ? JSON.parse(raw) : [];
        const existing = list.find((a) => a.label === option.label);
        const prefill = existing?.type === 'local' ? existing.number ?? '' : existing?.address ?? '';
        setAddOption(option);
        setAddValue(prefill);
        setAddIsEdit(!!existing);
        setAddError('');
        setAddModalVisible(true);
      } catch {
        setAddOption(option);
        setAddValue('');
        setAddIsEdit(false);
        setAddError('');
        setAddModalVisible(true);
      }
    }
  };

  const handleSaveAdd = async () => {
    if (!addOption) return;
    const val = addValue.trim();
    const isLocal = addOption.type === 'local';
    if (!val) {
      setAddError(isLocal ? 'Please enter a number' : 'Please enter an address');
      return;
    }
    setAddError('');
    try {
      const raw = await AsyncStorage.getItem(ADDED_ACCOUNTS_KEY);
      const list: AddedAccount[] = raw ? JSON.parse(raw) : [];
      const existing = list.findIndex((a) => a.label === addOption.label);
      const newAcc: AddedAccount = isLocal
        ? { label: addOption.label, type: 'local', number: val }
        : { label: addOption.label, type: 'crypto', address: val };
      const updated = existing >= 0
        ? list.map((a, i) => (i === existing ? newAcc : a))
        : [...list, newAcc];
      await AsyncStorage.setItem(ADDED_ACCOUNTS_KEY, JSON.stringify(updated));
      setAddModalVisible(false);
      setAddOption(null);
      setAddIsEdit(false);
      router.back();
    } catch {
      setAddError('Failed to save');
    }
  };

  const handleCloseAdd = () => {
    setAddModalVisible(false);
    setAddOption(null);
    setAddIsEdit(false);
    setAddError('');
  };

  const handleSaveEdit = async () => {
    const num = editNumber.trim();
    if (!num) {
      setEditError('Please enter a number');
      return;
    }
    setEditError('');
    try {
      const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify({
        ...parsed,
        number: num,
      }));
      setEditModalVisible(false);
      router.back();
    } catch {
      setEditError('Failed to save');
    }
  };

  const handleCloseEdit = () => {
    setEditModalVisible(false);
    setEditError('');
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
              <Ionicons
                name={existingLabels.has(option.label) ? 'create-outline' : 'add-circle-outline'}
                size={24}
                color={colors.tint}
              />
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
              <Ionicons
                name={existingLabels.has(option.label) ? 'create-outline' : 'add-circle-outline'}
                size={24}
                color={colors.tint}
              />
            </TouchableOpacity>
          ))}
      </ScrollView>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseEdit}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseEdit}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.modalContent, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              EvcPlus
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.secondaryText }]}>
              {editNumber || 'No number'}
            </Text>
            <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>
              Number
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
              value={editNumber}
              onChangeText={(t) => { setEditNumber(t); setEditError(''); }}
              placeholder="e.g. 252612045488"
              placeholderTextColor={colors.secondaryText}
              keyboardType="phone-pad"
            />
            {editError ? <Text style={styles.errorText}>{editError}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={handleCloseEdit}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: colors.tint }]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalButtonPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseAdd}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseAdd}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.modalContent, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {addIsEdit ? 'Edit' : 'Add'} {addOption?.label}
            </Text>
            <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>
              {addOption?.type === 'local' ? 'Phone Number' : 'Wallet Address'}
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
              value={addValue}
              onChangeText={(t) => { setAddValue(t); setAddError(''); }}
              placeholder={
                addOption?.type === 'local'
                  ? 'e.g. 252612045488'
                  : 'e.g. TN3W4H6rK2ce4vX9YnFQ...'
              }
              placeholderTextColor={colors.secondaryText}
              keyboardType={addOption?.type === 'local' ? 'phone-pad' : 'default'}
            />
            {addError ? <Text style={styles.errorText}>{addError}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={handleCloseAdd}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: colors.tint }]}
                onPress={handleSaveAdd}
              >
                <Text style={styles.modalButtonPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalButtonPrimary: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonPrimaryText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
