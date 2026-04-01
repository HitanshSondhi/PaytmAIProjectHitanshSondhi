import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { BottomNav } from "../components/BottomNav";
import { Header } from "../components/Header";
import { ResponseCard } from "../components/ResponseCard";
import { TranscriptBar } from "../components/TranscriptBar";
import { VoiceOrb } from "../components/VoiceOrb";
import { api } from "../lib/api";
import { useElevenLabsTTS } from "../lib/useElevenLabsTTS";
import { useSpeechRecognition } from "../lib/useSpeechRecognition";
import type { Lang, OrbState, PendingUdhaar, VoiceResponse } from "../types";

const DEMO_COMMANDS = [
  { label: "Collection", transcript: "aaj ka collection batao" },
  { label: "Madhur ₹2K", transcript: "madhur kumar ke account main 2000 rupees add kardo" },
  { label: "Rahul ₹5K", transcript: "rahul ke khata mein 5000 daal do" },
  { label: "Due List", transcript: "kal ke due payments" },
  { label: "Score", transcript: "Rahul ka credit score batao" },
  { label: "Total Due", transcript: "Rahul ka total due kitna hai" },
];

const CONFIRMATION_TIMEOUT_MS = 20000;

export default function Home() {
  const [lang, setLang] = useState<Lang>("hi-IN");
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [response, setResponse] = useState<VoiceResponse | null>(null);
  const [demoMode, setDemoMode] = useState(true);
  const [pendingUdhaar, setPendingUdhaar] = useState<PendingUdhaar | null>(null);

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    toggleListening,
  } = useSpeechRecognition(lang);
  const { speak, stop, isSpeaking } = useElevenLabsTTS();

  const requestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastProcessedRef = useRef<string>("");
  const isProcessingRef = useRef<boolean>(false);
  const confirmationExpiresAtRef = useRef<number | null>(null);

  const handleTranscriptComplete = useCallback(
    async (transcriptText: string) => {
      const trimmedText = transcriptText.trim().toLowerCase();
      
      // Prevent duplicate processing
      if (!trimmedText) return;
      if (isProcessingRef.current) return;
      if (trimmedText === lastProcessedRef.current) return;
      
      // Mark as processing
      isProcessingRef.current = true;
      lastProcessedRef.current = trimmedText;

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const requestId = ++requestIdRef.current;

      setOrbState("responding");
      stop();

      try {
        const result = await api.voice(trimmedText, lang, controller.signal);
        if (requestId !== requestIdRef.current) return;

        // Handle confirmation responses when we have pending udhaar
        if (pendingUdhaar) {
          if (result.responseType === 'confirm_yes') {
            // User confirmed - proceed with udhaar
            const confirmResult = await api.confirmUdhaar(
              pendingUdhaar.customerId,
              pendingUdhaar.amount,
              pendingUdhaar.dueDays,
              lang
            );
            setResponse(confirmResult);
            speak(confirmResult.responseText, lang);
            confirmationExpiresAtRef.current = null;
          } else {
            if (result.responseType === 'confirm_no') {
              // User cancelled
              setResponse(result);
              speak(result.responseText, lang);
              confirmationExpiresAtRef.current = null;
            } else {
              // Keep confirmation flow active until explicit yes/no.
              const retryResponse: VoiceResponse = {
                ...result,
                responseType: 'confirmation_retry',
                responseText: lang === 'en-IN'
                  ? 'Please say yes to continue or no to cancel.'
                  : 'Please sirf haan ya na boliye. Haan se continue hoga, na se cancel hoga.',
              };
              setResponse(retryResponse);
              speak(retryResponse.responseText, lang);
              setOrbState("awaiting_confirmation");
              return;
            }
          }
          setPendingUdhaar(null);
          return;
        }

        // Check if this is a credit score warning for udhaar
        if (result.responseType === 'credit_score' && result.responseData?.warning === true) {
          // Store pending udhaar for confirmation
          setPendingUdhaar({
            customerId: result.responseData.customerId as number,
            customerName: result.responseData.customer as string,
            amount: result.responseData.amount as number,
            dueDays: (result.responseData.dueDays as number) ?? 7,
          });
          confirmationExpiresAtRef.current = Date.now() + CONFIRMATION_TIMEOUT_MS;
          setOrbState("awaiting_confirmation");
        }

        setResponse(result);
        speak(result.responseText, lang);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        if (err instanceof Error && err.name === "AbortError") return;
        setOrbState("idle");
      } finally {
        isProcessingRef.current = false;
      }
    },
    [lang, speak, stop, pendingUdhaar]
  );

  useEffect(() => {
    if (!isSpeaking && orbState === "responding") {
      const t = setTimeout(() => setOrbState(pendingUdhaar ? "awaiting_confirmation" : "idle"), 400);
      return () => clearTimeout(t);
    }
  }, [isSpeaking, orbState, pendingUdhaar]);

  useEffect(() => {
    if (!pendingUdhaar) return;
    if (isSpeaking || isListening || isProcessingRef.current) return;

    const expiresAt = confirmationExpiresAtRef.current ?? (Date.now() + CONFIRMATION_TIMEOUT_MS);
    confirmationExpiresAtRef.current = expiresAt;

    if (Date.now() >= expiresAt) {
      const timeoutResponse: VoiceResponse = {
        intent: "CONFIRMATION_TIMEOUT",
        entities: {},
        responseType: "confirm_no",
        responseData: {},
        orbState: "warning",
        responseText:
          lang === "en-IN"
            ? "No confirmation received, so I cancelled this udhaar request."
            : "Aapka confirmation nahi mila, isliye ye udhaar request cancel kar di gayi hai.",
      };
      setResponse(timeoutResponse);
      setPendingUdhaar(null);
      confirmationExpiresAtRef.current = null;
      setOrbState("responding");
      speak(timeoutResponse.responseText, lang);
      return;
    }

    setOrbState("awaiting_confirmation");
    const t = window.setTimeout(() => {
      if (!isListening && !isSpeaking) {
        setOrbState("listening");
        startListening();
      }
    }, 350);

    return () => window.clearTimeout(t);
  }, [pendingUdhaar, isSpeaking, isListening, startListening, speak, lang]);

  useEffect(() => {
    if (!isListening && transcript && transcript.trim()) {
      // Only process if we have a new transcript
      const trimmed = transcript.trim().toLowerCase();
      if (trimmed !== lastProcessedRef.current && !isProcessingRef.current) {
        handleTranscriptComplete(transcript);
      }
    }
  }, [isListening, transcript, handleTranscriptComplete]);

  useEffect(() => {
    if (isListening) {
      setOrbState("listening");
      setResponse(null);
      // Reset last processed when starting to listen again
      lastProcessedRef.current = "";
    }
  }, [isListening]);

  const handleOrbClick = () => {
    if (orbState === "responding") return;
    toggleListening();
  };

  const handleDemoCommand = (transcriptText: string) => {
    if (orbState === "responding" || isProcessingRef.current) return;
    // Reset for demo commands to allow re-testing same command
    lastProcessedRef.current = "";
    handleTranscriptComplete(transcriptText);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, #0a0a14 0%, #0d0d1a 50%, #080812 100%)",
        }}
      />

      {/* Animated background blobs */}
      <motion.div
        className="fixed pointer-events-none z-0"
        style={{
          width: "500px",
          height: "500px",
          top: "-150px",
          left: "-100px",
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="fixed pointer-events-none z-0"
        style={{
          width: "400px",
          height: "400px",
          top: "40%",
          right: "-100px",
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="fixed pointer-events-none z-0"
        style={{
          width: "350px",
          height: "350px",
          bottom: "10%",
          left: "15%",
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{
          x: [0, 25, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col pb-24">
        {/* Header */}
        <Header
          lang={lang}
          onLangChange={setLang}
          demoMode={demoMode}
          onDemoToggle={() => setDemoMode(!demoMode)}
        />

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
          {/* Voice Orb */}
          <VoiceOrb
            state={orbState}
            onClick={handleOrbClick}
            size={window.innerWidth < 640 ? 180 : 220}
          />

          {/* Tap to speak bar */}
          <TranscriptBar
            transcript={transcript}
            interimTranscript={interimTranscript}
            isListening={isListening}
            isResponding={orbState === "responding"}
            onClick={handleOrbClick}
          />

          {/* AI Response Card */}
          <div className="w-full px-4">
            <AnimatePresence mode="wait">
              {response && (
                <ResponseCard key={response.responseText} response={response} />
              )}
            </AnimatePresence>
          </div>

          {/* Demo mode commands */}
          <AnimatePresence>
            {demoMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex flex-wrap justify-center gap-2 max-w-md px-4"
              >
                {DEMO_COMMANDS.map((cmd) => (
                  <motion.button
                    key={cmd.label}
                    onClick={() => handleDemoCommand(cmd.transcript)}
                    disabled={orbState === "responding"}
                    className="px-4 py-2 rounded-full text-sm transition-all disabled:opacity-40"
                    style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "rgba(255, 255, 255, 0.7)",
                    }}
                    whileHover={{
                      background: "rgba(255, 255, 255, 0.1)",
                      scale: 1.02,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {cmd.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
