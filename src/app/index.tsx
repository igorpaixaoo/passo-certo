import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Card, DifficultyBadge, useDifficultyColor } from '../components/ui';
import { useTutorials } from '../data/TutorialsContext';
import { DIFFICULTIES, DIFFICULTY_INFO, type Difficulty, type Tutorial } from '../data/types';
import { useTheme } from '../theme/SettingsContext';

type Filter = 'todos' | Difficulty;

export default function Home() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tutorials, loading } = useTutorials();
  const [filter, setFilter] = useState<Filter>('todos');

  const sections = useMemo(
    () =>
      DIFFICULTIES.filter((d) => filter === 'todos' || filter === d)
        .map((d) => ({ difficulty: d, data: tutorials.filter((tu) => tu.difficulty === d) }))
        .filter((s) => s.data.length > 0),
    [tutorials, filter],
  );

  const header = (
    <View style={{ gap: t.spacing(2), paddingBottom: t.spacing(1) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: t.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 26 }}>👣</Text>
          </View>
          <AppText variant="title">Passo Certo</AppText>
        </View>
        <Button
          label="Ajustes ⚙️"
          variant="ghost"
          compact
          accessibilityHint="Mudar tamanho da letra, cores e voz"
          onPress={() => router.push('/ajustes')}
        />
      </View>
      <View style={{ gap: 4, marginTop: 15 }}>
        <AppText variant="hero">Olá!</AppText>
        <AppText variant="large" muted>
          O que você quer aprender hoje? Escolha um tutorial e eu te guio passo a passo.
        </AppText>
      </View>

      <View accessibilityRole="tablist" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {(['todos', ...DIFFICULTIES] as Filter[]).map((f) => (
          <FilterChip
            key={f}
            label={f === 'todos' ? 'Todos' : DIFFICULTY_INFO[f].label}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.background }}>
        <ActivityIndicator size="large" color={t.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background, paddingTop: insets.top }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ padding: t.spacing(2.5), paddingBottom: insets.bottom + t.spacing(4), gap: 0 }}
        ListHeaderComponent={header}
        renderSectionHeader={({ section }) => <DifficultyHeader difficulty={section.difficulty} />}
        renderItem={({ item }) => (
          <TutorialCard tutorial={item} onPress={() => router.push(`/tutorial/${item.id}`)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: t.spacing(1.5) }} />}
        ListEmptyComponent={
          <Card>
            <AppText>Nenhum tutorial aqui ainda.</AppText>
          </Card>
        }
        ListFooterComponent={
          <View style={{ marginTop: t.spacing(5), alignItems: 'center' }}>
            <Button
              label="🔒 Área do administrador"
              variant="ghost"
              compact
              onPress={() => router.push('/admin/login')}
            />
          </View>
        }
      />
    </View>
  );
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      style={{
        minHeight: 52,
        paddingHorizontal: 20,
        borderRadius: 999,
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: selected ? t.colors.primary : t.colors.border,
        backgroundColor: selected ? t.colors.primary : t.colors.surface,
      }}
    >
      <Text
        maxFontSizeMultiplier={1.3}
        style={{ fontSize: t.font.body, fontWeight: '700', color: selected ? t.colors.onPrimary : t.colors.text }}
      >
        {selected ? '✓ ' : ''}
        {label}
      </Text>
    </Pressable>
  );
}

function DifficultyHeader({ difficulty }: { difficulty: Difficulty }) {
  const t = useTheme();
  const color = useDifficultyColor(difficulty);
  const info = DIFFICULTY_INFO[difficulty];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: t.spacing(3),
        marginBottom: t.spacing(1.5),
      }}
    >
      <View style={{ width: 6, alignSelf: 'stretch', borderRadius: 3, backgroundColor: color }} />
      <View>
        <AppText variant="title">{info.label}</AppText>
        <AppText muted>{info.subtitle}</AppText>
      </View>
    </View>
  );
}

function TutorialCard({ tutorial, onPress }: { tutorial: Tutorial; onPress: () => void }) {
  const t = useTheme();
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${tutorial.title}. ${tutorial.steps.length} passos. Dificuldade ${DIFFICULTY_INFO[tutorial.difficulty].label}`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing(2) }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          backgroundColor: t.colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 34 }}>{tutorial.emoji}</Text>
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <AppText variant="large" bold>
          {tutorial.title}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <DifficultyBadge difficulty={tutorial.difficulty} />
          <AppText variant="small" muted>
            {tutorial.steps.length} passos
          </AppText>
        </View>
      </View>
      <AppText variant="title" color={t.colors.primary}>
        ›
      </AppText>
    </Card>
  );
}
