import { useCallback, useRef, useState } from "react";
import type { Lang } from "../types";

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// ElevenLabs voice IDs - you can customize these
const VOICE_IDS = {
  'hi-IN': 'pNInz6obpgDQGcFmaJgB', // Adam - multilingual
  'en-IN': 'pNInz6obpgDQGcFmaJgB', // Adam
  'ta-IN': 'pNInz6obpgDQGcFmaJgB', // Adam
  'te-IN': 'pNInz6obpgDQGcFmaJgB', // Adam
};

export function useElevenLabsTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    // Stop audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    // Abort any pending fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // Stop browser speech synthesis
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string, lang: Lang = 'hi-IN') => {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

    // If no API key, use browser TTS as fallback
    if (!apiKey) {
      stop();
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utteranceRef.current = utterance;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };
      
      window.speechSynthesis.speak(utterance);
      return;
    }

    stop();
    setError(null);
    setIsSpeaking(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const voiceId = VOICE_IDS[lang] || VOICE_IDS['en-IN'];

    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.message || `ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setError('Audio playback failed');
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('[ElevenLabs TTS] Error:', err);
      setError(err instanceof Error ? err.message : 'TTS failed');
      setIsSpeaking(false);

      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utteranceRef.current = utterance;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  }, [stop]);

  return {
    speak,
    stop,
    isSpeaking,
    error,
  };
}
