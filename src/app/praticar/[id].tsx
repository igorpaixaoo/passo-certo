import * as Speech from 'expo-speech';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { AppText, Button, Card, Screen } from '../../components/ui';
import { useTutorials } from '../../data/TutorialsContext';
import { useSettings } from '../../theme/SettingsContext';

/** Modo "dentro do app": mostra um passo por vez, com voz. */
export default function Practice() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getById } = useTutorials();
  const { theme: t, settings } = useSettings();
  const tutorial = getById(id);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  const steps = tutorial?.steps ?? [];
  const step = steps[index];

  const speak = useCallback(
    (text: string) => {
      Speech.stop();
      Speech.speak(text, { language: 'pt-BR', rate: settings.speechRate });
    },
    [settings.speechRate],
  );

  const speakStep = useCallback(() => {
    if (!step) return;
    speak(
      `Passo ${index + 1} de ${steps.length}. ${step.title}. ${step.instruction}${step.tip ? ` Dica: ${step.tip}` : ''}`,
    );
  }, [step, index, steps.length, speak]);

  useEffect(() => {
    if (settings.voiceEnabled && !done) speakStep();
  }, [index, done]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => void Speech.stop(), []);

  if (!tutorial || !step) {
    return (
      <Screen title="Praticar">
        <AppText>Tutorial não encontrado.</AppText>
      </Screen>
    );
  }

  if (done) {
    return (
      <Screen
        title={tutorial.title}
        footer={<Button label="Voltar ao início" icon="🏠" onPress={() => router.dismissTo('/')} />}
      >
        <View style={{ alignItems: 'center', gap: t.spacing(2), paddingTop: t.spacing(6) }}>
          <Text style={{ fontSize: 80 }}>🎉</Text>
          <AppText variant="hero" center>
            Parabéns!
          </AppText>
          <AppText variant="large" center muted>
            Você concluiu “{tutorial.title}”. Pode repetir quantas vezes quiser.
          </AppText>
          <Button
            label="Repetir do começo"
            variant="secondary"
            onPress={() => {
              setIndex(0);
              setDone(false);
            }}
          />
        </View>
      </Screen>
    );
  }

  const isLast = index === steps.length - 1;

  return (
    <Screen
      title={tutorial.title}
      footer={
        <>
          <View style={{ flexDirection: 'row', gap: t.spacing(1.5) }}>
            <Button
              label="◀ Voltar"
              variant="secondary"
              disabled={index === 0}
              onPress={() => setIndex((i) => i - 1)}
              style={{ flex: 1 }}
            />
            <Button
              label={isLast ? '✔ Concluir' : 'Próximo ▶'}
              onPress={() => {
                if (isLast) {
                  setDone(true);
                  if (settings.voiceEnabled) speak('Parabéns! Você concluiu o tutorial.');
                } else setIndex((i) => i + 1);
              }}
              style={{ flex: 1.4 }}
            />
          </View>
          <Button label="Ouvir de novo" icon="🔊" variant="ghost" onPress={speakStep} />
        </>
      }
    >
      <AppText muted bold>
        Passo {index + 1} de {steps.length}
      </AppText>
      <View
        accessible
        accessibilityLabel={`Progresso: passo ${index + 1} de ${steps.length}`}
        style={{ flexDirection: 'row', gap: 6 }}
      >
        {steps.map((s, i) => (
          <View
            key={s.id}
            style={{
              flex: 1,
              height: 10,
              borderRadius: 5,
              backgroundColor: i <= index ? t.colors.primary : t.colors.border,
            }}
          />
        ))}
      </View>

      <Card style={{ gap: t.spacing(2), paddingVertical: t.spacing(3) }}>
        <AppText variant="hero">{step.title}</AppText>
        <AppText variant="large">{step.instruction}</AppText>
      </Card>

      {step.tip ? (
        <Card style={{ backgroundColor: t.colors.surfaceAlt, borderColor: t.colors.focus, borderWidth: 2 }}>
          <AppText bold>💡 Dica</AppText>
          <AppText>{step.tip}</AppText>
        </Card>
      ) : null}
    </Screen>
  );
}
