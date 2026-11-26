import type { VideoSource } from 'expo-video';

/**
 * Vídeos que vêm junto com o aplicativo. O campo `video` de um tutorial guarda
 * a chave deste mapa (o `require` precisa ser estático para o Metro empacotar).
 */
export const VIDEOS: Record<string, VideoSource> = {
  pix_com_seguranca: require('../../assets/pix_com_seguranca.mp4'),
};

export function getVideo(key: string | undefined): VideoSource | null {
  return key ? (VIDEOS[key] ?? null) : null;
}
