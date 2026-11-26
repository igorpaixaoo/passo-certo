import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, Text, View } from 'react-native';

import { Overlay } from '../../../modules/passo-certo-overlay';
import { TutorialVideo } from '../../components/TutorialVideo';
import { AppText, Button, Card, DifficultyBadge, Screen } from '../../components/ui';
import { useTutorials } from '../../data/TutorialsContext';
import { getVideo } from '../../data/videos';
import { isTargetAppInstalled, startOverlayTutorial } from '../../services/guide';
import { useSettings } from '../../theme/SettingsContext';

export default function TutorialDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getById } = useTutorials();
  const { theme: t, settings } = useSettings();
  const tutorial = getById(id);

  const [hasPermission, setHasPermission] = useState(Overlay.canDrawOverlays());
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);

  // Quando a pessoa volta da tela de permissões, verificamos de novo.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setHasPermission(Overlay.canDrawOverlays());
    });
    return () => sub.remove();
  }, []);

  if (!tutorial) {
    return (
      <Screen title="Tutorial" home>
        <AppText>Este tutorial não foi encontrado.</AppText>
        <Button label="Voltar ao início" onPress={() => router.dismissTo('/')} />
      </Screen>
    );
  }

  const video = getVideo(tutorial.video);
  // Tutoriais com vídeo não usam a ajuda flutuante por cima de outros apps.
  const canGuide = Overlay.isAvailable && !video;
  const installed = isTargetAppInstalled(tutorial);

  const startGuided = () => {
    const result = startOverlayTutorial(tutorial, t, settings);
    if (!result.ok) {
      if (result.reason === 'sem-permissao') setShowPermissionHelp(true);
      else router.push(`/praticar/${tutorial.id}`);
    }
  };

  return (
    <Screen
      title="Tutorial"
      home
      footer={
        <>
          {canGuide ? (
            <Button
              icon="▶"
              label="Começar com ajuda"
              accessibilityHint="Abre o aplicativo e mostra as instruções por cima dele"
              onPress={startGuided}
            />
          ) : null}
          <Button
            icon="📖"
            label={video ? 'Rever as dicas' : 'Ver os passos aqui'}
            variant={canGuide ? 'secondary' : 'primary'}
            onPress={() => router.push(`/praticar/${tutorial.id}`)}
          />
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: t.spacing(1.5), paddingVertical: t.spacing(1) }}>
        {video ? null : (
          <View
            style={{
              width: 104,
              height: 104,
              borderRadius: 28,
              backgroundColor: t.colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 56 }}>{tutorial.emoji}</Text>
          </View>
        )}
        <AppText variant="hero" center>
          {tutorial.title}
        </AppText>
        <DifficultyBadge difficulty={tutorial.difficulty} />
        <AppText variant="large" muted center>
          {tutorial.description}
        </AppText>
      </View>

      {video ? (
        <View style={{ gap: t.spacing(1) }}>
          <TutorialVideo source={video} />
          <AppText variant="small" muted center>
            Toque no vídeo para pausar. Use o botão de tela cheia para ver maior.
          </AppText>
        </View>
      ) : null}

      {tutorial.targetApp && canGuide ? (
        <Card>
          <AppText bold>Você vai usar: {tutorial.targetApp.name}</AppText>
          {installed === false ? (
            <AppText muted>
              Não encontrei este aplicativo no seu celular. O tutorial vai começar na tela inicial — abra o app
              quando puder.
            </AppText>
          ) : (
            <AppText muted>O Passo Certo vai abrir o aplicativo para você.</AppText>
          )}
        </Card>
      ) : null}

      {showPermissionHelp && !hasPermission ? (
        <Card style={{ borderColor: t.colors.focus, borderWidth: 3 }}>
          <AppText variant="large" bold>
            Falta uma permissão
          </AppText>
          <AppText>
            Para mostrar as instruções por cima dos outros aplicativos, o celular precisa da sua autorização.
          </AppText>
          <AppText>
            1. Toque no botão abaixo.{'\n'}2. Ligue a chave ao lado de “Passo Certo”.{'\n'}3. Volte para cá.
          </AppText>
          <Button label="Abrir permissão" icon="⚙️" onPress={() => Overlay.openOverlaySettings()} />
        </Card>
      ) : null}

      {showPermissionHelp && hasPermission ? (
        <Card style={{ borderColor: t.colors.easy, borderWidth: 3 }}>
          <AppText variant="large" bold>
            ✓ Tudo pronto!
          </AppText>
          <AppText>Agora toque em “Começar com ajuda”.</AppText>
        </Card>
      ) : null}

      <AppText variant="title">{video ? 'O que lembrar' : `${tutorial.steps.length} passos`}</AppText>
      {tutorial.steps.map((step, i) => (
        <View key={step.id} style={{ flexDirection: 'row', gap: t.spacing(1.5), alignItems: 'flex-start' }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: t.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text maxFontSizeMultiplier={1.2} style={{ color: t.colors.onPrimary, fontWeight: '700', fontSize: 18 }}>
              {i + 1}
            </Text>
          </View>
          <View style={{ flex: 1, paddingTop: 6 }}>
            <AppText bold>{step.title}</AppText>
          </View>
        </View>
      ))}
    </Screen>
  );
}
