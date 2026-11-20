import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, Card, Screen, TextField } from '../../components/ui';
import { useAuth } from '../../services/AuthContext';
import { useTheme } from '../../theme/SettingsContext';

export default function AdminLogin() {
  const t = useTheme();
  const router = useRouter();
  const { login, isAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await login(username, password);
      router.replace('/admin/painel');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível entrar');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Administrador">
      <View style={{ gap: 6 }}>
        <AppText variant="title">Entrar como administrador</AppText>
        <AppText muted>Área para criar, editar e excluir tutoriais.</AppText>
      </View>

      {isAdmin ? (
        <Card>
          <AppText>Você já está conectado.</AppText>
          <Button label="Ir para o painel" onPress={() => router.replace('/admin/painel')} />
        </Card>
      ) : (
        <>
          <TextField
            label="Usuário"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
            returnKeyType="next"
          />
          <TextField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={submit}
          />
          {error ? (
            <View
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              style={{
                borderWidth: 2,
                borderColor: t.colors.danger,
                borderRadius: 14,
                padding: t.spacing(1.5),
              }}
            >
              <AppText bold color={t.colors.danger}>
                ⚠ {error}
              </AppText>
            </View>
          ) : null}
          <Button
            label={busy ? 'Entrando…' : 'Entrar'}
            disabled={busy || !username || !password}
            onPress={submit}
          />
        </>
      )}
    </Screen>
  );
}
