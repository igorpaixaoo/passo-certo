import { useVideoPlayer, VideoView, type VideoSource } from 'expo-video';
import { View } from 'react-native';

import { useTheme } from '../theme/SettingsContext';

/** Vídeo do tutorial com os controles do próprio celular (play, pausa, tela cheia). */
export function TutorialVideo({ source }: { source: VideoSource }) {
  const t = useTheme();
  const player = useVideoPlayer(source);

  return (
    <View
      style={{
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: t.radius,
        overflow: 'hidden',
        backgroundColor: '#000',
        borderWidth: 1.5,
        borderColor: t.colors.border,
      }}
    >
      <VideoView
        player={player}
        style={{ flex: 1 }}
        contentFit="contain"
        nativeControls
        fullscreenOptions={{ enable: true }}
        accessibilityLabel="Vídeo do tutorial. Toque para mostrar os controles."
      />
    </View>
  );
}
