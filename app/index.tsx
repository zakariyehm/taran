import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

const ONBOARDING_KEY = '@onboarding_complete';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasOnboarded(!!value);
      } catch {
        setHasOnboarded(false);
      } finally {
        setIsReady(true);
      }
    };
    check();
  }, []);

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: '#1a1a1a' }} />;
  }

  if (hasOnboarded) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}
