import React from 'react';
import Player from '@/components/Player';
import type { AudioFile } from '../api/types';

type Props = {
  src: string | null;
  timestamp?: number;
  transcription: any;
  steps?: Array<any>;
};

// Lightweight wrapper to render the audio player from a central place.
export const UnifiedAudioPlayer: React.FC<Props> = ({ src, timestamp = 0, transcription, steps = [] }) => {
  if (!src) return null;
  const playlist = [{ src, timestamp }];
  return <Player steps={steps} playlist={playlist} transcription={transcription} />;
};

export default UnifiedAudioPlayer;
