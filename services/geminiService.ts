
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DreamAnalysis } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- Audio Utility Functions ---
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const sampleRate = 24000;
  const numChannels = 1;
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


// --- Gemini API Calls ---

export async function analyzeDream(dreamText: string): Promise<DreamAnalysis> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Analyze the following dream description. Extract its core essence and return a JSON object with the specified schema. The visual_prompt should be a rich, artistic, and surreal prompt for an image generation model. The audio_prompt should be a short, whispered, ethereal phrase (5-10 words) that captures the dream's feeling. Dream: "${dreamText}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "A poetic and evocative title for the dream." },
                        mood: { type: Type.STRING, description: "The dominant mood or emotion of the dream (e.g., mysterious, anxious, joyful)." },
                        themes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 key themes or symbols." },
                        visual_prompt: { type: Type.STRING, description: "A detailed, artistic prompt for an image generator, focusing on surrealism and dreamlike qualities." },
                        audio_prompt: { type: Type.STRING, description: "A very short, whispered, ethereal phrase encapsulating the dream's core feeling." }
                    },
                    required: ["title", "mood", "themes", "visual_prompt", "audio_prompt"]
                },
            },
        });
        
        const jsonText = response.text.trim();
        const analysisResult = JSON.parse(jsonText) as DreamAnalysis;
        return analysisResult;
    } catch (error) {
        console.error("Error analyzing dream:", error);
        throw new Error("Failed to analyze dream. The AI may be experiencing high traffic.");
    }
}


export async function createDreamImage(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `${prompt}, ethereal, dreamlike, surrealist painting, high detail, cinematic lighting`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });
    
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error creating dream image:", error);
        throw new Error("Failed to create dream image. The AI may be experiencing high traffic.");
    }
}

export async function createDreamAudio(prompt: string): Promise<AudioBuffer> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Whisper softly and slowly: ${prompt}` }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' }, // A soft, ethereal voice
                  },
              },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data returned from API.");
        }
        
        // This is safe because window.AudioContext is standard in modern browsers
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedBytes = decodeBase64(base64Audio);
        return await decodeAudioData(decodedBytes, audioContext);
    } catch (error) {
        console.error("Error creating dream audio:", error);
        throw new Error("Failed to create dream audio. The AI may be experiencing high traffic.");
    }
}
