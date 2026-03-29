import { useCallback, useRef, useState } from "react";
import type { Lang } from "../types";

const SARVAM_API_URL = 'https://api.sarvam.ai/text-to-speech';

const LANG_TO_VOICE: Record<Lang, string> = {
  'hi-IN': 'meera',
  'ta-IN': 'meera',
  'te-IN': 'meera',
  'en-IN': 'meera',
};

export function useSarvamTTS() {
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
    const apiKey = import.meta.env.VITE_SARVAM_API_KEY;

    // If no API key, use browser TTS as fallback
    if (!apiKey || apiKey === 'your_sarvam_key_here') {
      stop(); // Ensure previous speech is stopped
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

    try {
      const response = await fetch(SARVAM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey,
        },
        body: JSON.stringify({
          inputs: [text],
          target_language_code: lang.split('-')[0],
          speaker: LANG_TO_VOICE[lang] || 'meera',
          pitch: 0,
          pace: 1.1,
          loudness: 1.5,
          speech_sample_rate: 22050,
          enable_preprocessing: true,
          model: 'bulbul:v1',
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Sarvam API error: ${response.status}`);
      }

      const data = await response.json();
      const audioBase64 = data.audios?.[0];

      if (!audioBase64) {
        throw new Error('No audio in response');
      }

      const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setError('Audio playback failed');
        setIsSpeaking(false);
        audioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('[Sarvam TTS] Error:', err);
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
