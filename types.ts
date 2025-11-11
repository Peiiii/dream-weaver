
export interface DreamAnalysis {
  title: string;
  mood: string;
  themes: string[];
  visual_prompt: string;
  audio_prompt: string;
}

export interface DreamscapeData {
  analysis: DreamAnalysis;
  imageUrl: string;
  audioBuffer: AudioBuffer;
  originalText: string;
}
