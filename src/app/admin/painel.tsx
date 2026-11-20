import { Redirect, useRouter } from 'expo-router';
import { Alert, Text, View } from 'react-native';

import { AppText, Button, Card, DifficultyBadge, Screen } from '../../components/ui';
import { useTutorials } from '../../data/TutorialsContext';
import { DIFFICULTIES } from '../../data/types';
import { useAuth } from '../../services/AuthContext';
import { useTheme } from '../../theme/SettingsContext';

export default function AdminPanel() {
  const t = useTheme();
  const router = useRouter();
  const { isAdmin, logout } = useAuth();
  const { tutorials, remove, resetToDefaults } = useTutorials();

  if (!isAdmin) return <Redirect href="/admin/login" />;

  const sorted = [...tutorials].sort(
    (a, b) =>
      DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty) || a.title.localeCompare(b.title),
  );

  const confirmDelete = (id: string, title: string) =>
    Alert.alert('Excluir tutorial?', `"${title}" será apagado. Isso não pode ser desfeito.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => remove(id) },
    ]);

  const confirmReset = () =>
    Alert.alert(
      'Restaurar tutoriais originais?',
      'Todos os tutoriais criados ou editados serão substituídos pelos originais do app.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Restaurar', style: 'destructive', onPress: () => resetToDefaults() },
      ],
    );

  return (
    <Screen
      title="Painel"
      back={false}
      right={
        <Button
          label="Sair"
          variant="ghost"
          compact
          onPress={() => {
            logout();
            router.dismissTo('/');
          }}
        />
      }
      footer={<Button label="Novo tutorial" icon="＋" onPress={() => router.push('/admin/editor')} />}
    >
      <View style={{ flexDirection: 'row', gap: t.spacing(1.5) }}>
        {DIFFICULTIES.map((d) => (
          <Card key={d} style={{ flex: 1, alignItems: 'center', padding: t.spacing(1.5) }}>
            <AppText variant="title">{tutorials.filter((x) => x.difficulty === d).length}</AppText>
            <DifficultyBadge difficulty={d} />
          </Card>
        ))}
      </View>

      <AppText variant="large" bold>
        Tutoriais ({tutorials.length})
      </AppText>

      {sorted.map((tu) => (
        <Card key={tu.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing(1.5) }}>
            <Text style={{ fontSize: 32 }}>{tu.emoji}</Text>
            <View style={{ flex: 1, gap: 4 }}>
              <AppText bold>{tu.title}</AppText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                <DifficultyBadge difficulty={tu.difficulty} />
                <AppText variant="small" muted>
                  {tu.steps.length} passos · {tu.category}
                </AppText>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: t.spacing(1), marginTop: t.spacing(1) }}>
            <Button
              label="Editar"
              icon="✏️"
              variant="secondary"
              compact
              style={{ flex: 1 }}
              onPress={() => router.push({ pathname: '/admin/editor', params: { id: tu.id } })}
            />
            <Button
              label="Excluir"
              icon="🗑"
              variant="danger"
              compact
              style={{ flex: 1 }}
              onPress={() => confirmDelete(tu.id, tu.title)}
            />
          </View>
        </Card>
      ))}

      <Button label="Restaurar tutoriais originais" variant="ghost" compact onPress={confirmReset} />
    </Screen>
  );
}
