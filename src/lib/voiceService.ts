// Voice Synthesis & Telephony Audio Service for KisanQueue IVR
// Integrates Sarvam AI (https://api.sarvam.ai/text-to-speech) with browser TTS fallback

// Standard telephone DTMF dual frequencies (Hz)
const DTMF_FREQUENCIES: Record<string, [number, number]> = {
  "1": [697, 1209],
  "2": [697, 1336],
  "3": [697, 1477],
  "4": [770, 1209],
  "5": [770, 1336],
  "6": [770, 1477],
  "7": [852, 1209],
  "8": [852, 1336],
  "9": [852, 1477],
  "*": [941, 1209],
  "0": [941, 1336],
  "#": [941, 1477],
};

// In-memory cache for audio base64 generated via Sarvam AI
const audioCache = new Map<string, string>();

let currentAudio: HTMLAudioElement | null = null;
let currentRingtoneOscillators: { stop: () => void } | null = null;

/**
 * Retrieve the configured Sarvam AI API Key
 */
export function getSarvamApiKey(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("sarvam_api_key");
  if (stored && stored.trim().length > 0) return stored.trim();
  try {
    if (typeof process !== "undefined" && process.env) {
      const procKey = process.env["SARVAM_API_KEY"] || process.env["VITE_SARVAM_API_KEY"];
      if (procKey && typeof procKey === "string" && procKey.trim()) return procKey.trim();
    }
  } catch {
    // ignore
  }
  try {
    const envKey = import.meta.env["VITE_SARVAM_API_KEY"];
    if (envKey && typeof envKey === "string" && envKey.trim().length > 0) return envKey.trim();
  } catch {
    // ignore
  }
  return "";
}

/**
 * Store or remove the Sarvam AI API Key in localStorage
 */
export function setSarvamApiKey(key: string): void {
  if (typeof window === "undefined") return;
  if (key && key.trim().length > 0) {
    localStorage.setItem("sarvam_api_key", key.trim());
  } else {
    localStorage.removeItem("sarvam_api_key");
  }
}

/**
 * Play authentic DTMF dual-frequency tone
 */
export function playDTMFTone(digit: string) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const freqs = DTMF_FREQUENCIES[digit];
    if (!freqs) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.value = freqs[0];
    osc2.frequency.value = freqs[1];

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.16);
    osc2.stop(ctx.currentTime + 0.16);
  } catch (e) {
    // AudioContext blocked or unsupported
  }
}

/**
 * Play realistic telephone ringing tone (400Hz + 450Hz Indian/UK standard)
 * Returns a function to cancel the ringing.
 */
export function playRingtone(): () => void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return () => {};
    const ctx = new AudioCtx();

    let isPlaying = true;
    let timeoutId: any = null;

    const playBurst = () => {
      if (!isPlaying) return;
      try {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.value = 400;
        osc2.frequency.value = 450;

        // 0.4s ring, 0.2s pause, 0.4s ring, 2s pause
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.setValueAtTime(0.06, now + 0.4);
        gain.gain.setValueAtTime(0.001, now + 0.41);
        gain.gain.setValueAtTime(0.06, now + 0.6);
        gain.gain.setValueAtTime(0.06, now + 1.0);
        gain.gain.setValueAtTime(0.001, now + 1.01);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.05);
        osc2.stop(now + 1.05);

        timeoutId = setTimeout(() => {
          if (isPlaying) playBurst();
        }, 2500);
      } catch (e) {
        // Ignored
      }
    };

    playBurst();

    const stop = () => {
      isPlaying = false;
      if (timeoutId) clearTimeout(timeoutId);
      try {
        ctx.close();
      } catch (e) {}
    };

    currentRingtoneOscillators = { stop };
    return stop;
  } catch (e) {
    return () => {};
  }
}

/**
 * Play realistic SMS incoming alert chime
 */
export function playSMSChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.08); // A5
    osc.frequency.setValueAtTime(1174.66, now + 0.16); // D6

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {}
}

/**
 * Play successful booking confirmation chime
 */
export function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    [
      { freq: 523.25, time: 0 }, // C5
      { freq: 659.25, time: 0.1 }, // E5
      { freq: 783.99, time: 0.2 }, // G5
      { freq: 1046.5, time: 0.3 }, // C6
    ].forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + 0.25);
    });
  } catch (e) {}
}

/**
 * Stop any ongoing audio playback and speech synthesis
 */
export function stopSpeaking() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    } catch (e) {}
  }
  if (currentRingtoneOscillators) {
    currentRingtoneOscillators.stop();
    currentRingtoneOscillators = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

/**
 * Test a Sarvam AI API subscription key by synthesizing a short test greeting
 */
export async function testSarvamKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || apiKey.trim().length === 0) {
    return { success: false, message: "API key is empty." };
  }
  try {
    const res = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey.trim(),
      },
      body: JSON.stringify({
        inputs: ["നമസ്കാരം, കിസാൻ ക്യൂവിലേക്ക് സ്വാഗതം."],
        target_language_code: "ml-IN",
        speaker: "meera",
        pitch: 0,
        pace: 1.0,
        loudness: 1.5,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: "bulbul:v1",
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, message: `Sarvam AI returned error (${res.status}): ${errorText.slice(0, 100)}` };
    }

    const data = await res.json();
    if (data.audios && data.audios.length > 0) {
      return { success: true, message: "Valid API key! Native Malayalam voice is ready." };
    }
    return { success: false, message: "No audio data received from Sarvam AI." };
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to reach Sarvam AI endpoint." };
  }
}

/**
 * Speak text using Sarvam AI TTS (with memory cache) or browser SpeechSynthesis fallback
 */
export async function speakText(
  text: string,
  lang: "ml" | "en",
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  stopSpeaking();
  if (!text || text.trim().length === 0) {
    onEnd?.();
    return;
  }

  const apiKey = getSarvamApiKey();

  // If Sarvam AI API key is configured, call Sarvam AI
  if (apiKey) {
    const cacheKey = `${lang}:::${text.trim()}`;
    let audioBase64 = audioCache.get(cacheKey);

    if (!audioBase64) {
      try {
        const response = await fetch("https://api.sarvam.ai/text-to-speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-subscription-key": apiKey,
          },
          body: JSON.stringify({
            inputs: [text.trim()],
            target_language_code: lang === "ml" ? "ml-IN" : "en-IN",
            speaker: "meera",
            pitch: 0,
            pace: 1.0,
            loudness: 1.5,
            speech_sample_rate: 22050,
            enable_preprocessing: true,
            model: "bulbul:v1",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.audios && data.audios.length > 0) {
            audioBase64 = data.audios[0];
            audioCache.set(cacheKey, audioBase64!);
          }
        }
      } catch (e) {
        // Fallback to browser below
      }
    }

    if (audioBase64) {
      try {
        const audio = new Audio("data:audio/wav;base64," + audioBase64);
        currentAudio = audio;
        audio.onplay = () => onStart?.();
        audio.onended = () => {
          currentAudio = null;
          onEnd?.();
        };
        audio.onerror = () => {
          currentAudio = null;
          speakWithBrowser(text, lang, onStart, onEnd);
        };
        await audio.play();
        return;
      } catch (e) {
        // Fallback to browser
      }
    }
  }

  // Fallback: Browser Web Speech API
  speakWithBrowser(text, lang, onStart, onEnd);
}

/**
 * Browser SpeechSynthesis fallback with chunking & Indic voice detection
 */
function speakWithBrowser(
  text: string,
  lang: "ml" | "en",
  onStart?: () => void,
  onEnd?: () => void
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "ml" ? "ml-IN" : "en-IN";
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    // Search for best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match =
        voices.find((v) => v.lang.toLowerCase().startsWith(lang === "ml" ? "ml" : "en-in")) ||
        voices.find((v) => v.lang.toLowerCase().includes("in")) ||
        voices.find((v) => v.lang.toLowerCase().startsWith("en"));
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    onEnd?.();
  }
}
