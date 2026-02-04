import Button from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ONBOARDING_KEY = '@onboarding_complete';

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    const first = firstName.trim();
    const last = lastName.trim();
    const num = number.trim();

    if (!first || !last || !num) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify({
        firstName: first,
        lastName: last,
        number: num,
      }));
      router.replace('/(tabs)');
    } catch (e) {
      setError('Failed to save. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.text }]}>Welcome</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Please enter your details to get started
          </Text>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>First Name</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
              ]}
              value={firstName}
              onChangeText={(t) => { setFirstName(t); setError(''); }}
              placeholder="Enter first name"
              placeholderTextColor={colors.secondaryText}
              autoCapitalize="words"
            />

            <Text style={[styles.label, { color: colors.secondaryText }]}>Last Name</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
              ]}
              value={lastName}
              onChangeText={(t) => { setLastName(t); setError(''); }}
              placeholder="Enter last name"
              placeholderTextColor={colors.secondaryText}
              autoCapitalize="words"
            />

            <Text style={[styles.label, { color: colors.secondaryText }]}>Phone Number</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
              ]}
              value={number}
              onChangeText={(t) => { setNumber(t); setError(''); }}
              placeholder="e.g. 252612045488"
              placeholderTextColor={colors.secondaryText}
              keyboardType="phone-pad"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title="Save"
              onPress={handleSave}
              variant="primary"
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
  },
  saveButton: {
    marginTop: 16,
  },
});
