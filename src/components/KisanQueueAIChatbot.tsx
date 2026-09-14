import React, { useState, useEffect, useRef } from "react";
import { useKisanQueue } from "@/lib/store";
import { Language } from "@/lib/types";
import { generateKisanChatResponse } from "@/lib/gemini";
import {
  Bot,
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";

interface KisanQueueAIChatbotProps {
  isSeniorMode?: boolean;
}

interface MessageItem {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

// Split speech text into concise chunks (<130 chars) along sentence boundaries
function splitSpeechChunks(text: string, maxLen: number = 130): string[] {
  if (!text) return [];
  // Clean markdown bold/bullet syntax for spoken audio
  const clean = text
    .replace(/[*#_`>]/g, "")
    .replace(/\n+/g, ". ")
    .trim();

  const rawSentences = clean
    .split(/(?<=[.!?|।:\n])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const sentence of rawSentences) {
    if ((current + " " + sentence).trim().length <= maxLen) {
      current = (current + " " + sentence).trim();
    } else {
      if (current) chunks.push(current);
      if (sentence.length > maxLen) {
        const subParts = sentence.split(/(?<=[,·،;])\s+/);
        let sub = "";
        for (const part of subParts) {
          if ((sub + " " + part).trim().length <= maxLen) {
            sub = (sub + " " + part).trim();
          } else {
            if (sub) chunks.push(sub);
            sub = part.trim();
          }
        }
        if (sub) chunks.push(sub);
        current = "";
      } else {
        current = sentence;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [clean.slice(0, maxLen)];
}

// Multilingual Quick Prompts
const QUICK_PROMPTS: Record<Language, { label: string; prompt: string }[]> = {
  ml: [
    { label: "🌾 ടോക്കൺ എടുക്കാൻ", prompt: "നെല്ല് സംഭരണത്തിന് ടോക്കൺ എങ്ങനെ എടുക്കാം?" },
    { label: "⏱️ ക്യൂ സമയം", prompt: "എന്റെ ക്യൂവിലെ കാത്തിരിപ്പ് സമയം എത്രയാണ്?" },
    { label: "💰 താങ്ങുവില (MSP)", prompt: "ഇന്നത്തെ പ്രധാന വിളകളുടെ താങ്ങുവില (MSP) എത്രയാണ്?" },
    { label: "🏦 DBT പണം", prompt: "വിള വിറ്റ പണം ബാങ്കിലേക്ക് എപ്പോൾ വരും?" },
  ],
  hi: [
    { label: "🌾 टोकन बुकिंग", prompt: "फसल खरीद के लिए टोकन कैसे बुक करें?" },
    { label: "⏱️ कतार का समय", prompt: "कतार में अनुमानित प्रतीक्षा समय कितना है?" },
    { label: "💰 न्यूनतम समर्थन मूल्य", prompt: "आज का न्यूनतम समर्थन मूल्य (MSP) क्या है?" },
    { label: "🏦 DBT भुगतान", prompt: "बैंक खाते में पैसे कब जमा होंगे?" },
  ],
  ta: [
    { label: "🌾 டோக்கன் பதிவு", prompt: "கொள்முதலுக்கு டோக்கன் எடுப்பது எப்படி?" },
    { label: "⏱️ வரிசை நேரம்", prompt: "வரிசையில் காத்திருக்கும் நேரம் எவ்வளவு?" },
    { label: "💰 ஆதார விலை (MSP)", prompt: "இன்றைய குறைந்தபட்ச ஆதார விலை எவ்வளவு?" },
    { label: "🏦 DBT பணம்", prompt: "வங்கி கணக்கில் பணம் எப்போது வரும்?" },
  ],
  te: [
    { label: "🌾 టోకెన్ బుకింగ్", prompt: "పంట కొనుగోలుకు టోకెన్ ఎలా బుక్ చేయాలి?" },
    { label: "⏱️ క్యూ సమయం", prompt: "క్యూలో నిరీక్షణ సమయం ఎంత?" },
    { label: "💰 మద్దతు ధర (MSP)", prompt: "ప్రస్తుత మద్దతు ధర ఎంత?" },
    { label: "🏦 DBT చెల్లింపు", prompt: "బ్యాంకు ఖాతాలో డబ్బులు ఎప్పుడు పడతాయి?" },
  ],
  kn: [
    { label: "🌾 ಟೋಕನ್ ಬುಕಿಂಗ್", prompt: "ಬೆಳೆ ಖರೀದಿಗೆ ಟೋಕನ್ ಹೇಗೆ ಪಡೆಯುವುದು?" },
    { label: "⏱️ ಕಾಯುವ ಸಮಯ", prompt: "ಸಾಲಿನಲ್ಲಿ ಎಷ್ಟು ಸಮಯ ಕಾಯಬೇಕು?" },
    { label: "💰 ಬೆಂಬಲ ಬೆಲೆ (MSP)", prompt: "ಇಂದಿನ ಕನಿಷ್ಠ ಬೆಂಬಲ ಬೆಲೆ ಎಷ್ಟು?" },
    { label: "🏦 DBT ಜಮೆ", prompt: "ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಹಣ ಯಾವಾಗ ಬರುತ್ತದೆ?" },
  ],
  bn: [
    { label: "🌾 টোকেন বুকিং", prompt: "ফসল বিক্রির টোকেন কীভাবে নেব?" },
    { label: "⏱️ অপেক্ষার সময়", prompt: "সারিতে অপেক্ষার সময় কত?" },
    { label: "💰 সহায়ক মূল্য", prompt: "আজকের সহায়ক মূল্য (MSP) কত?" },
    { label: "🏦 DBT টাকা", prompt: "ব্যাংক অ্যাকাউন্টে টাকা কখন ঢুকবে?" },
  ],
  mr: [
    { label: "🌾 टोकन बुकिंग", prompt: "खरेदीसाठी टोकन कसे बुक करावे?" },
    { label: "⏱️ रांगेची वेळ", prompt: "रांगेत किती वेळ थांबावे लागेल?" },
    { label: "💰 हमीभाव (MSP)", prompt: "आजचा हमीभाव किती आहे?" },
    { label: "🏦 बँक जमा", prompt: "बँक खात्यात पैसे कधी जमा होतील?" },
  ],
  en: [
    { label: "🌾 Book Token", prompt: "How do I book a procurement slot token?" },
    { label: "⏱️ Wait Time", prompt: "How long is the estimated wait time in queue?" },
    { label: "💰 Minimum Support Price", prompt: "What are the latest MSP rates for crops?" },
    { label: "🏦 DBT Payment", prompt: "When will the sale amount be credited to my bank?" },
  ],
};

const WELCOME_MESSAGES: Record<Language, string> = {
  ml: "നമസ്കാരം! ഞാൻ കിസാൻ ക്യൂ AI സഹായിയാണ് 🌾. വിള സംഭരണം, സ്ലോട്ട് ടോക്കൺ, ക്യൂ സമയം, താങ്ങുവില (MSP) എന്നിവയെക്കുറിച്ച് എന്നോട് ചോദിക്കാം. താഴെ ടൈപ്പ് ചെയ്യുകയോ മൈക്കിൽ സംസാരിക്കുകയോ ചെയ്യാം!",
  hi: "नमस्ते! मैं किसान कतार AI सहायक हूँ 🌾। फसल खरीद, टोकन बुकिंग, कतार प्रतीक्षा समय या समर्थन मूल्य (MSP) के बारे में कुछ भी पूछें। बोलकर या लिखकर प्रश्न पूछ सकते हैं!",
  ta: "வணக்கம்! நான் கிசான் வரிசை AI உதவியாளர் 🌾. கொள்முதல், டோக்கன் பதிவு, வரிசை நேரம் மற்றும் ஆதார விலை பற்றி என்னிடம் கேளுங்கள். பேசி அல்லது தட்டச்சு செய்து கேட்கலாம்!",
  te: "నమస్కారం! నేను కిసాన్ క్యూ AI సహాయకుడిని 🌾. టోకెన్ బుకింగ్, క్యూ సమయం, మద్దతు ధరల గురించి నన్ను అడగండి. మాట్లాడండి లేదా టైప్ చేయండి!",
  kn: "ನಮಸ್ಕಾರ! ನಾನು ಕಿಸಾನ್ ಕ್ಯೂ AI ಸಹಾಯಕ 🌾. ಬೆಳೆ ಖರೀದಿ, ಟೋಕನ್, ಕಾಯುವ ಸಮಯ ಮತ್ತು ಬೆಂಬಲ ಬೆಲೆ ಬಗ್ಗೆ ಕೇಳಿ. ಧ್ವನಿ ಮೂಲಕ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ ಪ್ರಶ್ನಿಸಿ!",
  bn: "নমস্কার! আমি কিষাণ কিউ AI সহকারী 🌾। ফসল সংগ্রহ, টোকেন ও সহায়ক মূল্য সম্পর্কে প্রশ্ন করতে পারেন।",
  mr: "नमस्कार! मी किसान रांगेत AI सहाय्यक आहे 🌾. पीक खरेदी, टोकन आणि हमीभावाबद्दल मला विचारा.",
  en: "Hello! I am Kisan Queue AI 🌾, your intelligent assistant. Ask me anything about crop procurement, slot booking, live queue wait times, or MSP rates. Type or speak via microphone!",
};

export function KisanQueueAIChatbot({ isSeniorMode = false }: KisanQueueAIChatbotProps) {
  const { user, language, activeBooking, centres } = useKisanQueue();
  const currentLang: Language = language || "ml";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechQueueRef = useRef<string[]>([]);
  const speechIndexRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          sender: "ai",
          text: WELCOME_MESSAGES[currentLang] || WELCOME_MESSAGES.en,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [currentLang]);

  // Scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Audio Playback Engine
  const stopAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
      audioRef.current = null;
    }
    speechQueueRef.current = [];
    speechIndexRef.current = 0;
    setActiveSpeakingId(null);
  };

  const playSpeechAudio = (text: string, messageId: string, langToUse?: Language) => {
    if (!text || typeof window === "undefined") return;

    // Toggle off if currently speaking the same message
    if (activeSpeakingId === messageId) {
      stopAudio();
      return;
    }

    stopAudio();
    setActiveSpeakingId(messageId);

    const targetLang = langToUse || currentLang;
    const chunks = splitSpeechChunks(text, 130);
    if (chunks.length === 0) {
      setActiveSpeakingId(null);
      return;
    }

    speechQueueRef.current = chunks;
    speechIndexRef.current = 0;

    const playNextChunk = (idx: number) => {
      if (idx >= speechQueueRef.current.length) {
        stopAudio();
        return;
      }

      speechIndexRef.current = idx;
      const chunkText = speechQueueRef.current[idx] || "";
      const directGoogleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
        targetLang
      )}&client=tw-ob&q=${encodeURIComponent(chunkText)}`;

      const audio = document.createElement("audio");
      audio.setAttribute("referrerpolicy", "no-referrer");
      audio.src = directGoogleUrl;
      audioRef.current = audio;

      audio.onended = () => {
        playNextChunk(idx + 1);
      };

      audio.onerror = () => {
        try {
          const fallback = document.createElement("audio");
          fallback.src = `/api/tts?tl=${encodeURIComponent(targetLang)}&text=${encodeURIComponent(chunkText)}`;
          audioRef.current = fallback;
          fallback.onended = () => playNextChunk(idx + 1);
          fallback.onerror = () => stopAudio();
          fallback.play().catch(() => stopAudio());
        } catch {
          stopAudio();
        }
      };

      audio.play().catch(() => {
        stopAudio();
      });
    };

    playNextChunk(0);
  };

  // Web Speech Recognition (Mic input)
  const toggleListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      const bcpMap: Record<Language, string> = {
        ml: "ml-IN",
        hi: "hi-IN",
        ta: "ta-IN",
        te: "te-IN",
        kn: "kn-IN",
        bn: "bn-IN",
        mr: "mr-IN",
        en: "en-IN",
      };

      recognition.lang = bcpMap[currentLang] || "ml-IN";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Send message to Kisan Queue AI
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    stopAudio();
    setInputText("");

    const userMessage: MessageItem = {
      id: "msg-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    const historyForAi = newMessages.map((m) => ({
      role: (m.sender === "user" ? "user" : "model") as "user" | "model",
      text: m.text,
    }));

    const activeCentre = activeBooking
      ? centres?.find((c) => c.id === activeBooking.centreId)
      : centres?.[0];

    const contextData = {
      farmerName: user?.name,
      activeToken: activeBooking?.queueNumber,
      crop: activeBooking?.crop || user?.primaryCrop || "Paddy",
      centreName: activeCentre?.name,
      language: currentLang,
    };

    let replyText = "";

    try {
      // 1. Try server API endpoint
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: historyForAi,
          contextData,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) replyText = data.reply;
      }
    } catch {
      // Fallback
    }

    // 2. Client direct fallback if server endpoint failed
    if (!replyText) {
      try {
        replyText = await generateKisanChatResponse(query, historyForAi, contextData);
      } catch (err: any) {
        replyText =
          currentLang === "ml"
            ? "ക്ഷമിക്കണം, താൽക്കാലികമായി മറുപടി നൽകാൻ സാധിച്ചില്ല. ദയവായി അല്പം കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക അല്ലെങ്കിൽ കിസാൻ കോൾ സെന്ററിലേക്ക് വിളിക്കുക: 1800-425-1661."
            : "Sorry, I could not generate a response right now. Please try again or call the Kisan Call Centre: 1800-425-1661.";
      }
    }

    const aiMessageId = "ai-" + Date.now();
    const aiMessage: MessageItem = {
      id: aiMessageId,
      sender: "ai",
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);

    // Auto speak reply if enabled
    if (autoSpeak) {
      playSpeechAudio(replyText, aiMessageId, currentLang);
    }
  };

  const quickPrompts = QUICK_PROMPTS[currentLang] || QUICK_PROMPTS.en;

  return (
    <>
      {/* 1. FLOATING ACTION BUTTON (TRIGGER) */}
      {!isOpen && (
        <aside aria-label="AI Assistant Quick Access" className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-50">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              stopAudio();
            }}
            className={`flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 bg-emerald-700 hover:bg-emerald-800 text-white ${
              isSeniorMode ? "size-14" : "size-12"
            }`}
            title="Kisan Queue AI"
            aria-label="Kisan Queue AI"
          >
            <Bot className={isSeniorMode ? "size-7 text-white" : "size-6 text-white"} />
          </button>
        </aside>
      )}

      {/* 2. CHATBOT MODAL DIALOG */}
      {isOpen && (
        <aside aria-label="Kisan Queue AI Chatbot Dialog" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className={`relative flex flex-col w-full bg-white shadow-2xl overflow-hidden transition-all ${
              isSeniorMode
                ? "h-[90vh] sm:h-[650px] sm:max-w-xl sm:rounded-[36px] rounded-t-[32px] border-4 border-emerald-600"
                : "h-[85vh] sm:h-[600px] sm:max-w-lg sm:rounded-3xl rounded-t-3xl border-2 border-emerald-500"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-emerald-900 text-white border-b border-emerald-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-inner border border-white/20">
                  🌾
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white leading-tight">
                      Kisan Queue AI
                    </h3>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-400/40">
                      🟢 Online
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200 font-medium">
                    {currentLang === "ml"
                      ? "കർഷക സഹായി · ശബ്ദത്തിൽ സംസാരിക്കാം"
                      : "Smart Agricultural Assistant · Voice Enabled"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                {/* Auto Speak Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (autoSpeak) stopAudio();
                    setAutoSpeak(!autoSpeak);
                  }}
                  className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                    autoSpeak
                      ? "bg-emerald-700 text-white border border-emerald-500"
                      : "bg-white/10 text-stone-300 hover:bg-white/20"
                  }`}
                  title={autoSpeak ? "Auto Voice is ON" : "Auto Voice is OFF"}
                >
                  {autoSpeak ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                  <span className="hidden sm:inline text-[11px]">
                    {autoSpeak ? "Voice ON" : "Muted"}
                  </span>
                </button>

                {/* Stop Audio Button if currently playing */}
                {activeSpeakingId && (
                  <button
                    type="button"
                    onClick={stopAudio}
                    className="flex items-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-600 px-2.5 py-1.5 text-xs font-black text-black shadow transition-all animate-pulse"
                    title="Stop Audio"
                  >
                    ⏹️ Stop
                  </button>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    stopAudio();
                  }}
                  className="flex size-9 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-90"
                  title="Close Chat"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Context Notice Bar */}
            <div className="bg-emerald-50 px-3.5 py-1.5 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-950 font-bold shrink-0">
              <span className="truncate">
                🧑‍🌾 {user?.name || "Farmer"} {activeBooking?.queueNumber ? `· Token #${activeBooking.queueNumber}` : ""}
              </span>
              <span className="shrink-0 bg-emerald-200 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase text-emerald-900">
                🌐 {currentLang.toUpperCase()}
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F9FAF8]">
              {messages.map((msg) => {
                const isAi = msg.sender === "ai";
                const isSpeakingThis = activeSpeakingId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isAi ? "justify-start" : "justify-end"}`}
                  >
                    {isAi && (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-white text-sm shadow">
                        🌾
                      </div>
                    )}

                    <div
                      className={`flex flex-col max-w-[85%] rounded-2xl p-3.5 shadow-sm ${
                        isAi
                          ? "bg-white text-stone-900 border-2 border-emerald-100 rounded-tl-sm"
                          : "bg-emerald-800 text-white rounded-tr-sm"
                      } ${isSeniorMode ? "text-base leading-relaxed" : "text-sm leading-relaxed"}`}
                    >
                      <div className="whitespace-pre-wrap font-medium">{msg.text}</div>

                      {/* Footer with Timestamp & Audio Controls */}
                      <div
                        className={`flex items-center justify-between gap-3 mt-2 pt-1 border-t text-[10px] ${
                          isAi
                            ? "border-stone-100 text-stone-600"
                            : "border-white/20 text-emerald-100"
                        }`}
                      >
                        <span>{msg.timestamp}</span>

                        {isAi && (
                          <div className="flex items-center gap-1.5">
                            {/* Read Aloud Button */}
                            <button
                              type="button"
                              onClick={() => playSpeechAudio(msg.text, msg.id, currentLang)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold transition-all active:scale-90 ${
                                isSpeakingThis
                                  ? "bg-emerald-700 text-white font-black"
                                  : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200"
                              }`}
                              title="Listen to this message"
                            >
                              {isSpeakingThis ? (
                                <>
                                  <span className="animate-bounce">🔊</span>
                                  <span>Speaking...</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="size-3 text-emerald-700" />
                                  <span>{currentLang === "ml" ? "ശബ്ദം കേൾക്കുക" : "Listen"}</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isAi && (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white font-bold text-xs shadow">
                        {user?.name ? user.name.slice(0, 2).toUpperCase() : "ME"}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-white text-sm">
                    🌾
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-white border-2 border-emerald-100 px-4 py-3 shadow-sm flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span className="size-2 rounded-full bg-emerald-600 animate-pulse delay-150"></span>
                    <span className="size-2 rounded-full bg-emerald-600 animate-pulse delay-300"></span>
                    <span className="text-xs font-bold text-stone-600 ml-1">
                      {currentLang === "ml" ? "ചിന്തിക്കുന്നു..." : "Kisan Queue AI is thinking..."}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Quick Prompts Chips */}
            <div className="px-3.5 py-2 bg-white border-t border-emerald-100 shrink-0 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-[10px] font-black text-emerald-800 uppercase shrink-0">
                  💡 {currentLang === "ml" ? "ചോദിക്കൂ:" : "Suggestions:"}
                </span>
                {quickPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.prompt)}
                    className="rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-950 transition-all active:scale-95 shrink-0 shadow-sm"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3.5 bg-white border-t border-stone-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* Voice Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all active:scale-90 shadow-md ${
                    isListening
                      ? "bg-red-600 text-white animate-pulse ring-4 ring-red-400"
                      : "bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-2 border-emerald-300"
                  }`}
                  title={isListening ? "Listening... Tap to stop" : "Speak via Microphone (Voice)"}
                >
                  {isListening ? <MicOff className="size-6 text-white" /> : <Mic className="size-6 text-emerald-800" />}
                </button>

                {/* Text Field */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isListening
                      ? currentLang === "ml" ? "സംസാരിക്കൂ, കേൾക്കുന്നു..." : "Listening... Speak now"
                      : currentLang === "ml"
                      ? "ഇവിടെ ചോദ്യം ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ മൈക്കിൽ ചോദിക്കുക..."
                      : "Type your query or speak with mic..."
                  }
                  className={`flex-1 rounded-2xl border-2 border-stone-300 bg-stone-50 px-4 py-3 text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all ${
                    isSeniorMode ? "text-base font-bold" : "text-sm font-medium"
                  }`}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl font-black text-white shadow-md transition-all active:scale-90 ${
                    !inputText.trim() || isLoading
                      ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                      : "bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/30"
                  }`}
                  title="Send Message"
                >
                  <Send className="size-5" />
                </button>
              </form>

              {/* Status Note */}
              <div className="flex items-center justify-between text-[10px] text-stone-500 mt-2 px-1 font-bold">
                <span>🌾 Powered by Gemini 3.6 Flash</span>
                <span>🎙️ 8 Indian Languages Supported</span>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
export default KisanQueueAIChatbot;
