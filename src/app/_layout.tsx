import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TutorialsProvider } from '../data/TutorialsContext';
import { AuthProvider } from '../services/AuthContext';
import { SettingsProvider, useSettings } from '../theme/SettingsContext';

function ThemedStack() {
  const { theme, ready } = useSettings();
  // Evita "piscar" o tema errado enquanto as preferências carregam.
  if (!ready) return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AuthProvider>
          <TutorialsProvider>
            <ThemedStack />
          </TutorialsProvider>
        </AuthProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
