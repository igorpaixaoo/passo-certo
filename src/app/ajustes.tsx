import * as Speech from 'expo-speech';
import { View } from 'react-native';

import { AppText, Button, Card, DifficultyBadge, OptionGroup, Screen, SectionTitle } from '../components/ui';
import { COLOR_VISION_LABELS, type ColorVision, type ThemeMode } from '../theme/palettes';
import { useSettings, type TextScale } from '../theme/SettingsContext';

export default function SettingsScreen() {
  const { settings, update, theme: t } = useSettings();

  return (
    <Screen title="Ajustes" home>
      {/* Prévia ao vivo */}
      <Card>
        <AppText variant="small" muted bold>
          PRÉVIA
        </AppText>
        <AppText variant="large" bold>
          Assim fica o texto
        </AppText>
        <AppText>As mudanças aparecem na hora e ficam salvas.</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <DifficultyBadge difficulty="facil" />
          <DifficultyBadge difficulty="medio" />
          <DifficultyBadge difficulty="dificil" />
        </View>
      </Card>

      <SectionTitle>Tamanho da letra</SectionTitle>
      <OptionGroup<TextScale>
        columns={3}
        value={settings.textScale}
        onChange={(v) => update({ textScale: v })}
        options={[
          { value: 1, title: 'Normal' },
          { value: 1.2, title: 'Grande' },
          { value: 1.4, title: 'Enorme' },
        ]}
      />

      <SectionTitle>Tema</SectionTitle>
      <OptionGroup<ThemeMode>
        columns={3}
        value={settings.themeMode}
        onChange={(v) => update({ themeMode: v })}
        options={[
          { value: 'claro', title: '☀️ Claro' },
          { value: 'escuro', title: '🌙 Escuro' },
          { value: 'sistema', title: '📱 Automático' },
        ]}
      />

      <SectionTitle>Cores (daltonismo)</SectionTitle>
      <OptionGroup<ColorVision>
        value={settings.colorVision}
        onChange={(v) => update({ colorVision: v })}
        options={(Object.keys(COLOR_VISION_LABELS) as ColorVision[]).map((v) => ({
          value: v,
          title: COLOR_VISION_LABELS[v].title,
          description: COLOR_VISION_LABELS[v].description,
        }))}
      />

      <SectionTitle>Voz</SectionTitle>
      <OptionGroup<'sim' | 'nao'>
        columns={2}
        value={settings.voiceEnabled ? 'sim' : 'nao'}
        onChange={(v) => update({ voiceEnabled: v === 'sim' })}
        options={[
          { value: 'sim', title: '🔊 Ler em voz alta' },
          { value: 'nao', title: '🔇 Sem voz' },
        ]}
      />

      {settings.voiceEnabled ? (
        <>
          <AppText bold>Velocidade da fala</AppText>
          <OptionGroup<number>
            columns={3}
            value={settings.speechRate}
            onChange={(v) => update({ speechRate: v })}
            options={[
              { value: 0.6, title: 'Devagar' },
              { value: 0.85, title: 'Calma' },
              { value: 1, title: 'Normal' },
            ]}
          />
          <Button
            label="Testar a voz"
            icon="▶"
            variant="secondary"
            onPress={() => {
              Speech.stop();
              Speech.speak('Olá! Eu sou o Passo Certo e vou te ajudar.', {
                language: 'pt-BR',
                rate: settings.speechRate,
              });
            }}
          />
        </>
      ) : null}
      <View style={{ height: t.spacing(2) }} />
    </Screen>
  );
}
