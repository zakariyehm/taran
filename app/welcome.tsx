import Button from '@/components/ui/button';
import { AppColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const handleRegister = () => {
    router.push('/onboarding');
  };

  const handleLogin = () => {
    router.push('/onboarding');
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'light' ? AppColors.welcomeBackground : colors.background },
      ]}
      edges={['top', 'bottom']}
    >
      <View style={styles.content}>
        {/* Illustration placeholder - globe with avatars */}
        <View style={styles.illustration}>
          <Text style={styles.globeEmoji}>🌍</Text>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: '#F5D76E' }]} />
            <View style={[styles.avatar, { backgroundColor: '#5D6D7E' }]} />
            <View style={[styles.avatar, { backgroundColor: '#F8BBD9' }]} />
          </View>
        </View>

        <Text
          style={[
            styles.title,
            { color: colorScheme === 'light' ? '#fff' : colors.text },
          ]}
        >
          Trusted by millions
        </Text>
        <Text
          style={[
            styles.body,
            { color: colorScheme === 'light' ? 'rgba(255,255,255,0.9)' : colors.secondaryText },
          ]}
        >
          Just look us up on Google or Facebook to see our happy reviews. We're
          fully regulated, so your money's safe and secure.
        </Text>

        <TouchableOpacity style={styles.link}>
          <Text style={[styles.linkText, { color: colors.primary }]}>Check our rates</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons at bottom */}
      <View style={styles.buttonsBottom}>
        <View style={styles.buttonRow}>
          <Button title="Log in" onPress={handleLogin} variant="light" flex />
          <Button title="Register" onPress={handleRegister} flex />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
  },
  buttonsBottom: {
    paddingTop: 24,
  },
  illustration: {
    alignItems: 'center',
    marginBottom: 32,
  },
  globeEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  link: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  linkText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
});
