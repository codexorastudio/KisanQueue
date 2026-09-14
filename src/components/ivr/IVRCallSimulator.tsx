import React, { useState, useEffect, useRef } from "react";
import { useKisanQueue } from "@/lib/store";
import { ProcurementCentre } from "@/lib/types";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Radio,
  MessageSquare,
  KeyRound,
  Settings2,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Hash,
  X,
} from "lucide-react";
import {
  playDTMFTone,
  playRingtone,
  playSMSChime,
  playSuccessChime,
  speakText,
  stopSpeaking,
  getSarvamApiKey,
  setSarvamApiKey,
  testSarvamKey,
} from "@/lib/voiceService";

interface IVRCallSimulatorProps {
  onClose?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToQueue?: () => void;
  isModal?: boolean;
}

export function IVRCallSimulator({
  onClose,
  onNavigateToDashboard,
  onNavigateToQueue,
  isModal = false,
}: IVRCallSimulatorProps) {
  const { user, centres, crops, bookSlot, addNotification } = useKisanQueue();

  // Call State
  const [callStatus, setCallStatus] = useState<"idle" | "dialing" | "connected" | "ended">("idle");
  const [dialedNumber, setDialedNumber] = useState("1800-425-1661");
  const [callDuration, setCallDuration] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sarvam AI API Key configuration state
  const [sarvamKey, setSarvamKeyState] = useState<string>(() => getSarvamApiKey());
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(sarvamKey);
  const [keyTestStatus, setKeyTestStatus] = useState<{ testing: boolean; message: string; success?: boolean } | null>(null);

  // Script & Booking Steps (1 to 6)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [subStep, setSubStep] = useState<number>(0);
  const [selectedLang, setSelectedLang] = useState<"ml" | "en">("en");
  const [callerName, setCallerName] = useState(user?.name && user.name !== "Guest Farmer" ? user.name : "Farmer");
  const [confirmedPhone, setConfirmedPhone] = useState(user?.mobile || "+91 94470 12345");
  const [selectedCentre, setSelectedCentre] = useState<ProcurementCentre>((centres[0] || ({} as ProcurementCentre))!);
  const [selectedCrop, setSelectedCrop] = useState("Paddy");
  const [selectedQuantity, setSelectedQuantity] = useState(420);
  const [qualityGrade, setQualityGrade] = useState("Grade A (<14% Moisture)");
  const [selectedDate, setSelectedDate] = useState("11 Sep 2026");
  const [selectedSlot, setSelectedSlot] = useState("10:00 AM – 11:00 AM");
  const [backupSlot, setBackupSlot] = useState("11 Sep 2026, 02:00 PM – 03:00 PM");
  const [alternatePhone, setAlternatePhone] = useState("None (Primary used)");

  // Multi-digit DTMF buffer (for entering phone numbers or custom quantities)
  const [currentBuffer, setCurrentBuffer] = useState<string>("");

  // Completed Booking Details
  const [createdToken, setCreatedToken] = useState<number | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Simulated SMS Toast
  const [incomingSMS, setIncomingSMS] = useState<{
    sender: string;
    text: string;
    time: string;
  } | null>(null);

  // Live transcript log
  const [transcript, setTranscript] = useState<
    Array<{ speaker: "IVR" | "FARMER"; text: string; time: string }>
  >([]);

  const timerRef = useRef<any>(null);
  const ringtoneStopRef = useRef<(() => void) | null>(null);

  // Call Duration Timer
  useEffect(() => {
    if (callStatus === "connected") {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const addTranscript = (speaker: "IVR" | "FARMER", text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setTranscript((prev) => [...prev, { speaker, text, time: timeStr }]);
  };

  // Safe voice speaker helper
  const speak = (text: string, lang: "ml" | "en") => {
    if (!soundEnabled) return;
    speakText(
      text,
      lang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  // Save API Key
  const handleSaveApiKey = () => {
    setSarvamApiKey(tempKey);
    setSarvamKeyState(tempKey.trim());
    setShowKeyModal(false);
    setKeyTestStatus(null);
  };

  // Test API Key
  const handleTestApiKey = async () => {
    setKeyTestStatus({ testing: true, message: "Testing connection with Sarvam AI voice engine..." });
    const res = await testSarvamKey(tempKey);
    setKeyTestStatus({ testing: false, message: res.message, success: res.success });
  };

  // Start Call Handler (Ringing simulation -> Connect)
  const handleStartCall = () => {
    stopSpeaking();
    setCallStatus("dialing");
    setCallDuration(0);
    setTranscript([]);
    setStep(1);
    setSubStep(0);
    setCurrentBuffer("");
    setIncomingSMS(null);
    setCreatedToken(null);
    setIsSpeaking(false);

    // Play ringing tone
    if (soundEnabled) {
      ringtoneStopRef.current = playRingtone();
    }

    // Connect after realistic ringing delay (~1.8 seconds)
    setTimeout(() => {
      if (ringtoneStopRef.current) {
        ringtoneStopRef.current();
        ringtoneStopRef.current = null;
      }
      setCallStatus("connected");

      // Initial Bilingual Greeting
      const greeting =
        "കേരള കാർഷിക വികസന വകുപ്പ് കിസാൻ ക്യൂവിലേക്ക് സ്വാഗതം. മലയാളത്തിനായി 1 അമർത്തുക. For English, press 2.";
      addTranscript("IVR", greeting);
      speak(greeting, "ml");
    }, 1800);
  };

  // End Call Handler
  const handleEndCall = () => {
    stopSpeaking();
    if (ringtoneStopRef.current) {
      ringtoneStopRef.current();
      ringtoneStopRef.current = null;
    }
    setCallStatus("ended");
    setIsSpeaking(false);
  };

  // Reset entire phone demo
  const handleReset = () => {
    stopSpeaking();
    if (ringtoneStopRef.current) {
      ringtoneStopRef.current();
      ringtoneStopRef.current = null;
    }
    setCallStatus("idle");
    setCallDuration(0);
    setStep(1);
    setSubStep(0);
    setCurrentBuffer("");
    setSelectedLang("en");
    setIncomingSMS(null);
    setCreatedToken(null);
    setTranscript([]);
    setIsSpeaking(false);
  };

  // Repeat current prompt
  const handleRepeatPrompt = () => {
    if (transcript.length === 0) return;
    const lastIVR = [...transcript].reverse().find((t) => t.speaker === "IVR");
    if (lastIVR) {
      speak(lastIVR.text, selectedLang);
    }
  };

  // DTMF Keypad Press Logic (Supports Single Digit & Multi-digit Buffers)
  const handleKeyPress = (digit: string) => {
    playDTMFTone(digit);

    // If dialing before call starts
    if (callStatus !== "connected") {
      setDialedNumber((prev) => (prev.length < 15 ? prev + digit : prev));
      return;
    }

    // Global Key: * key repeats current prompt
    if (digit === "*") {
      addTranscript("FARMER", "Pressed * [Repeat Prompt]");
      handleRepeatPrompt();
      return;
    }

    // ==============================================================
    // STEP 1: IDENTITY & LANGUAGE VERIFICATION
    // ==============================================================
    if (step === 1) {
      if (subStep === 0) {
        // Substep 0: Language choice
        if (digit === "1") {
          setSelectedLang("ml");
          addTranscript("FARMER", "Pressed 1 [മലയാളം തിരഞ്ഞെടുത്തു]");
          const prompt = `നിങ്ങൾ മലയാളം തിരഞ്ഞെടുത്തു. നിങ്ങളുടെ കോളർ ഐഡി മൊബൈൽ നമ്പർ ${confirmedPhone}, കർഷകൻ: ${callerName}. ഈ നമ്പറിൽ തുടരാൻ 1 അമർത്തുക. പുതിയ നമ്പർ നൽകാൻ 2 അമർത്തുക.`;
          addTranscript("IVR", prompt);
          speak(prompt, "ml");
          setSubStep(1);
        } else if (digit === "2") {
          setSelectedLang("en");
          addTranscript("FARMER", "Pressed 2 [English Selected]");
          const prompt = `English selected. Your caller ID mobile is ${confirmedPhone}, Farmer: ${callerName}. Press 1 to confirm, or press 2 to enter a new mobile number.`;
          addTranscript("IVR", prompt);
          speak(prompt, "en");
          setSubStep(1);
        }
      } else if (subStep === 1) {
        // Substep 1: Confirm registered phone or change
        if (digit === "1") {
          addTranscript("FARMER", `Pressed 1 [Confirmed Phone ${confirmedPhone}]`);
          setStep(2);
          setSubStep(0);
          const centrePrompt =
            selectedLang === "ml"
              ? `ഫോൺ സ്ഥിരീകരിച്ചു. ഘട്ടം 2: നിങ്ങളുടെ അടുത്തുള്ള സംഭരണ കേന്ദ്രം തിരഞ്ഞെടുക്കുക. ${centres
                  .slice(0, 5)
                  .map((c, idx) => `${c.name} നായി ${idx + 1}`)
                  .join(", ")} അമർത്തുക.`
              : `Phone confirmed. Step 2: Select nearest procurement centre. ${centres
                  .slice(0, 5)
                  .map((c, idx) => `Press ${idx + 1} for ${c.name}`)
                  .join(", ")}.`;
          addTranscript("IVR", centrePrompt);
          speak(centrePrompt, selectedLang);
        } else if (digit === "2") {
          addTranscript("FARMER", "Pressed 2 [Enter New Mobile Number]");
          setSubStep(2);
          setCurrentBuffer("");
          const prompt =
            selectedLang === "ml"
              ? "ദയവായി നിങ്ങളുടെ 10 അക്ക മൊബൈൽ നമ്പർ കീപാഡിൽ നൽകി ഹാഷ് (#) അമർത്തുക."
              : "Please enter your 10-digit mobile number on the keypad followed by the hash (#) key.";
          addTranscript("IVR", prompt);
          speak(prompt, selectedLang);
        }
      } else if (subStep === 2) {
        // Substep 2: Typing 10-digit phone number
        if (digit === "#") {
          const cleanPhone = currentBuffer.trim();
          if (cleanPhone.length >= 10) {
            const formatted = cleanPhone.startsWith("+91") ? cleanPhone : `+91 ${cleanPhone}`;
            setConfirmedPhone(formatted);
            addTranscript("FARMER", `Entered Phone: ${formatted}`);
            setCurrentBuffer("");
            setStep(2);
            setSubStep(0);
            const centrePrompt =
              selectedLang === "ml"
                ? `മൊബൈൽ നമ്പർ ${formatted} രേഖപ്പെടുത്തി. ഘട്ടം 2: നിങ്ങളുടെ സംഭരണ കേന്ദ്രം തിരഞ്ഞെടുക്കുക. കോട്ടയത്തിനായി 1, ചങ്ങനാശ്ശേരിക്ക് 2, പാലക്കാടിന് 3, തൃശ്ശൂരിന് 4 അമർത്തുക.`
                : `Mobile number ${formatted} recorded. Step 2: Select nearest procurement centre. Press 1 for Kottayam, 2 for Changanassery, 3 for Palakkad, 4 for Thrissur.`;
            addTranscript("IVR", centrePrompt);
            speak(centrePrompt, selectedLang);
          } else {
            const prompt =
              selectedLang === "ml"
                ? "നമ്പർ അപൂർണ്ണമാണ്. ദയവായി 10 അക്ക മൊബൈൽ നമ്പർ നൽകി # അമർത്തുക."
                : "Number incomplete. Please enter valid 10-digit mobile followed by hash key.";
            addTranscript("IVR", prompt);
            speak(prompt, selectedLang);
          }
        } else {
          setCurrentBuffer((prev) => (prev.length < 10 ? prev + digit : prev));
        }
      }
      return;
    }

    // ==============================================================
    // STEP 2: LOCATION & PROCUREMENT CENTRE
    // ==============================================================
    if (step === 2) {
      let chosenCentre: ProcurementCentre = selectedCentre;
      const index = parseInt(digit, 10) - 1;
      if (!isNaN(index) && index >= 0 && index < centres.length && centres[index]) {
        chosenCentre = centres[index]!;
      }

      setSelectedCentre(chosenCentre);
      addTranscript("FARMER", `Pressed ${digit} [${chosenCentre.name}]`);

      setStep(3);
      setSubStep(0);
      setCurrentBuffer("");

      const prompt =
        selectedLang === "ml"
          ? `${chosenCentre.name} തിരഞ്ഞെടുത്തു. ഘട്ടം 3: വിള തിരഞ്ഞെടുക്കുക. നെല്ലിനായി 1 അമർത്തുക. പച്ചത്തേങ്ങയ്ക്കായി 2. റബ്ബർ RSS4 നായി 3. കുരുമുളകിനായി 4. ഏലത്തിനായി 5.`
          : `Selected ${chosenCentre.name}. Step 3: Select Produce. Press 1 for Paddy, Press 2 for Raw Coconut, Press 3 for Rubber RSS4, Press 4 for Black Pepper, Press 5 for Cardamom.`;
      addTranscript("IVR", prompt);
      speak(prompt, selectedLang);
      return;
    }

    // ==============================================================
    // STEP 3: CROP, CUSTOM QUANTITY & QUALITY MOISTURE CHECK
    // ==============================================================
    if (step === 3) {
      if (subStep === 0) {
        // Choose crop
        let cropName = "Paddy";
        if (digit === "1") cropName = "Paddy";
        if (digit === "2") cropName = "Raw Coconut";
        if (digit === "3") cropName = "Rubber (RSS4)";
        if (digit === "4") cropName = "Black Pepper";
        if (digit === "5") cropName = "Cardamom";

        setSelectedCrop(cropName);
        addTranscript("FARMER", `Pressed ${digit} [${cropName}]`);

        setSubStep(1);
        setCurrentBuffer("");

        const prompt =
          selectedLang === "ml"
            ? `${cropName} തിരഞ്ഞെടുത്തു. നിങ്ങളുടെ സംഭരണ അളവ് കിലോഗ്രാമിൽ നൽകി ഹാഷ് (#) അമർത്തുക. അല്ലെങ്കിൽ 250 കിലോയ്ക്ക് 1, 420 കിലോയ്ക്ക് 2, 500 കിലോയ്ക്ക് 3, 1000 കിലോയ്ക്ക് 4 അമർത്തുക.`
            : `Selected ${cropName}. Enter quantity in kilograms on the keypad followed by the hash (#) key, or press 1 for 250 kg, press 2 for 420 kg, press 3 for 500 kg, or press 4 for 1000 kg.`;
        addTranscript("IVR", prompt);
        speak(prompt, selectedLang);
      } else if (subStep === 1) {
        // Quantity choice: Supports shortcut 1-4 OR custom typing followed by #
        if (digit === "#") {
          const qty = parseInt(currentBuffer, 10);
          if (!isNaN(qty) && qty > 0) {
            setSelectedQuantity(qty);
            addTranscript("FARMER", `Entered Quantity: ${qty} kg [#]`);
            setCurrentBuffer("");
            setSubStep(2);
            const prompt =
              selectedLang === "ml"
                ? `${qty} കിലോഗ്രാം രേഖപ്പെടുത്തി. ഈർപ്പത്തിന്റെ അളവ് 14 ശതമാനത്തിൽ താഴെയാണോ? അതെ എങ്കിൽ 1 അമർത്തുക. സാധാരണ ഗ്രേഡിന് 2 അമർത്തുക.`
                : `Recorded ${qty} kg. Quality Check: Is moisture content tested below 14%? Press 1 for Yes (Grade A), Press 2 for Standard grade.`;
            addTranscript("IVR", prompt);
            speak(prompt, selectedLang);
          } else {
            const prompt =
              selectedLang === "ml"
                ? "ദയവായി അളവ് കിലോഗ്രാമിൽ നൽകി # അമർത്തുക."
                : "Please enter harvest weight in kilograms followed by the hash key.";
            addTranscript("IVR", prompt);
            speak(prompt, selectedLang);
          }
        } else if (currentBuffer.length === 0 && ["1", "2", "3", "4"].includes(digit)) {
          // Shortcut presets
          const presets: Record<string, number> = { "1": 250, "2": 420, "3": 500, "4": 1000 };
          const qty = presets[digit] || 420;
          setSelectedQuantity(qty);
          addTranscript("FARMER", `Pressed ${digit} [Preset ${qty} kg]`);
          setSubStep(2);
          const prompt =
            selectedLang === "ml"
              ? `${qty} കിലോ രേഖപ്പെടുത്തി. ഈർപ്പത്തിന്റെ അളവ് 14 ശതമാനത്തിൽ താഴെയാണോ? അതെ എങ്കിൽ 1 അമർത്തുക. സാധാരണ ഗ്രേഡിന് 2 അമർത്തുക.`
              : `Recorded ${qty} kg. Quality Check: Is moisture content tested below 14%? Press 1 for Yes (Grade A), Press 2 for Standard grade.`;
          addTranscript("IVR", prompt);
          speak(prompt, selectedLang);
        } else {
          // Accumulate custom digits
          setCurrentBuffer((prev) => (prev.length < 5 ? prev + digit : prev));
        }
      } else if (subStep === 2) {
        // Moisture / Grade check
        const grade = digit === "1" ? "Grade A (<14% Moisture)" : "Standard Grade";
        setQualityGrade(grade);
        addTranscript("FARMER", `Pressed ${digit} [${grade}]`);

        setStep(4);
        setSubStep(0);
        setCurrentBuffer("");

        const prompt =
          selectedLang === "ml"
            ? `ഗുണനിലവാരം ഉറപ്പുവരുത്തി: ${grade}. ഘട്ടം 4: സ്ലോട്ട് തിരഞ്ഞെടുക്കുക. നാളെ രാവിലെ 10 മണിക്ക് 1 അമർത്തുക. നാളെ ഉച്ചയ്ക്ക് 2 മണിക്ക് 2 അമർത്തുക. മറ്റന്നാൾ രാവിലെ 11 മണിക്ക് 3 അമർത്തുക.`
            : `Quality approved: ${grade}. Step 4: Preferred Slot. Press 1 for Tomorrow 10:00 AM, Press 2 for Tomorrow 02:00 PM, Press 3 for Day after tomorrow 11:00 AM.`;
        addTranscript("IVR", prompt);
        speak(prompt, selectedLang);
      }
      return;
    }

    // ==============================================================
    // STEP 4: PREFERRED SLOT & BACKUP WINDOW
    // ==============================================================
    if (step === 4) {
      let slotTime = "10:00 AM – 11:00 AM";
      let slotDate = "11 Sep 2026";
      let backup = "11 Sep 2026, 02:00 PM – 03:00 PM";

      if (digit === "1") {
        slotTime = "10:00 AM – 11:00 AM";
        slotDate = "11 Sep 2026";
        backup = "11 Sep 2026, 02:00 PM – 03:00 PM";
      } else if (digit === "2") {
        slotTime = "02:00 PM – 03:00 PM";
        slotDate = "11 Sep 2026";
        backup = "12 Sep 2026, 10:00 AM – 11:00 AM";
      } else if (digit === "3") {
        slotTime = "11:00 AM – 12:00 PM";
        slotDate = "12 Sep 2026";
        backup = "12 Sep 2026, 02:00 PM – 03:00 PM";
      }

      setSelectedSlot(slotTime);
      setSelectedDate(slotDate);
      setBackupSlot(backup);
      addTranscript("FARMER", `Pressed ${digit} [${slotDate}, ${slotTime}]`);

      setStep(5);
      setSubStep(0);
      setCurrentBuffer("");

      const prompt =
        selectedLang === "ml"
          ? `സ്ലോട്ട് രേഖപ്പെടുത്തി: ${slotDate}, ${slotTime}. ബാക്കപ്പ് സ്ലോട്ടും സൂക്ഷിച്ചിട്ടുണ്ട്. ഘട്ടം 5: അടിയന്തര സാഹചര്യങ്ങൾക്കായി രണ്ടാമത്തെ ഫോൺ നമ്പർ നൽകാൻ 1 അമർത്തുക, അല്ലെങ്കിൽ ഈ നമ്പറിൽ തുടരാൻ 2 അമർത്തുക.`
          : `Slot locked: ${slotDate} at ${slotTime}. Contingency backup recorded. Step 5: Alternate contact. Press 1 to add a secondary mobile number, or Press 2 to continue with primary number.`;
      addTranscript("IVR", prompt);
      speak(prompt, selectedLang);
      return;
    }

    // ==============================================================
    // STEP 5: ALTERNATE CONTACT NUMBER
    // ==============================================================
    if (step === 5) {
      if (subStep === 0) {
        if (digit === "1") {
          addTranscript("FARMER", "Pressed 1 [Add Alternate Contact]");
          setSubStep(1);
          setCurrentBuffer("");
          const prompt =
            selectedLang === "ml"
              ? "രണ്ടാമത്തെ 10 അക്ക മൊബൈൽ നമ്പർ നൽകി ഹാഷ് (#) അമർത്തുക."
              : "Please enter the secondary 10-digit mobile number followed by the hash (#) key.";
          addTranscript("IVR", prompt);
          speak(prompt, selectedLang);
        } else {
          setAlternatePhone(`Primary (${confirmedPhone})`);
          addTranscript("FARMER", "Pressed 2 [Use Primary Phone]");
          proceedToStep6();
        }
      } else if (subStep === 1) {
        if (digit === "#") {
          const clean = currentBuffer.trim();
          const altNum = clean.length >= 10 ? `+91 ${clean} (Secondary)` : "+91 98470 11223 (Secondary)";
          setAlternatePhone(altNum);
          addTranscript("FARMER", `Entered Alternate: ${altNum}`);
          setCurrentBuffer("");
          proceedToStep6();
        } else {
          setCurrentBuffer((prev) => (prev.length < 10 ? prev + digit : prev));
        }
      }
      return;
    }

    // ==============================================================
    // STEP 6: CONFIRMATION READBACK, REAL DATABASE COMMIT & SMS
    // ==============================================================
    if (step === 6) {
      if (digit === "1") {
        addTranscript("FARMER", "Pressed 1 [Confirm Final Booking]");

        // Save REAL booking in store and localStorage
        const booking = bookSlot(
          selectedCentre.id,
          selectedCrop,
          selectedQuantity,
          selectedDate,
          selectedSlot,
          {
            bookingSource: "ivr",
            farmerMobile: confirmedPhone,
            alternatePhone,
            qualityGrade,
            farmerName: callerName,
            languageUsed: selectedLang,
          }
        );

        setCreatedToken(booking.queueNumber);
        setBookingId(booking.id);

        playSuccessChime();

        const successPrompt =
          selectedLang === "ml"
            ? `നിങ്ങളുടെ ബുക്കിംഗ് വിജയകരമായി പൂർത്തിയായി! നിങ്ങളുടെ ഔദ്യോഗിക ടോക്കൺ നമ്പർ ${booking.queueNumber} ആണ്. സ്ഥിരീകരണ എസ്എംഎസ് നിങ്ങളുടെ ഫോണിലേക്ക് അയച്ചിട്ടുണ്ട്. കിസാൻ ക്യൂവിലേക്ക് വിളിച്ചതിന് നന്ദി.`
            : `Booking confirmed! Your official token number is #${booking.queueNumber}. Confirmation SMS has been dispatched. Thank you for calling KisanQueue.`;

        addTranscript("IVR", successPrompt);
        speak(successPrompt, selectedLang);

        // Realistic incoming SMS alert on handset after 1.5 seconds
        setTimeout(() => {
          playSMSChime();
          setIncomingSMS({
            sender: "KL-AGRI-GOV",
            text: `Dear ${callerName}, Token #${booking.queueNumber} confirmed for ${selectedCrop} (${selectedQuantity}kg) at ${selectedCentre.name} on ${selectedDate}, ${selectedSlot}. Alt: ${alternatePhone}. Toll-Free: 1800-425-1661`,
            time: "Just now",
          });
        }, 1500);
      } else {
        addTranscript("FARMER", "Pressed 2 [Cancelled]");
        const cancelPrompt =
          selectedLang === "ml"
            ? "ബുക്കിംഗ് റദ്ദാക്കി. കിസാൻ ക്യൂവിലേക്ക് വിളിച്ചതിന് നന്ദി."
            : "Booking cancelled. Thank you for calling KisanQueue.";
        addTranscript("IVR", cancelPrompt);
        speak(cancelPrompt, selectedLang);
        handleEndCall();
      }
      return;
    }
  };

  const proceedToStep6 = () => {
    setStep(6);
    setSubStep(0);
    const prompt =
      selectedLang === "ml"
        ? `ഘട്ടം 6: സ്ഥിരീകരണം. സംഭരണ കേന്ദ്രം: ${selectedCentre.name}. വിള: ${selectedCrop}, ${selectedQuantity} കിലോ, ${qualityGrade}. സമയം: ${selectedDate}, ${selectedSlot}. മൊബൈൽ: ${confirmedPhone}. ബുക്കിംഗ് ഉറപ്പാക്കാൻ 1 അമർത്തുക. റദ്ദാക്കാൻ 2 അമർത്തുക.`
        : `Step 6: Confirmation Readback. Centre: ${selectedCentre.name}. Produce: ${selectedCrop}, ${selectedQuantity} kg, ${qualityGrade}. Slot: ${selectedDate}, ${selectedSlot}. Mobile: ${confirmedPhone}. Press 1 to confirm and commit booking, or Press 2 to cancel.`;
    addTranscript("IVR", prompt);
    speak(prompt, selectedLang);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className={`flex flex-col items-center justify-center ${isModal ? "p-0" : "min-h-[88vh] p-4 sm:p-6"}`}>
      {/* Outer Shell / Realistic Handset Card */}
      <div className="relative w-full max-w-md bg-stone-100 text-stone-900 rounded-[38px] p-5 shadow-xl border-4 border-stone-300 flex flex-col items-center">

        {/* Handset Top Bezel: Speaker Grill + Status + Sarvam AI Key Button */}
        <div className="w-full flex items-center justify-between px-2 pt-1 pb-2 border-b border-stone-200/60 mb-2">
          <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-mono">
            <Radio className="size-3 text-emerald-600 animate-pulse" />
            <span>BSNL 4G</span>
          </div>

          {/* Earpiece speaker slot */}
          <div className="w-16 h-1.5 bg-stone-300 rounded-full" />

          {/* Sarvam AI Key Config Button */}
          <button
            type="button"
            onClick={() => {
              setTempKey(sarvamKey);
              setKeyTestStatus(null);
              setShowKeyModal(true);
            }}
            className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-stone-300 bg-white hover:bg-emerald-50 hover:border-emerald-400 transition-colors shadow-2xs cursor-pointer"
            title="Configure Sarvam AI Voice Engine API Key"
          >
            <span className={`size-1.5 rounded-full ${sarvamKey ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span className={sarvamKey ? "text-emerald-800" : "text-amber-800"}>
              {sarvamKey ? "Sarvam AI" : "AI Voice Key"}
            </span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* SIMULATED INCOMING SMS TOAST NOTIFICATION BANNER */}
        {/* ============================================================== */}
        {incomingSMS && (
          <div className="w-full mb-3 animate-in slide-in-from-top-4 duration-300">
            <div className="rounded-2xl border border-emerald-200 bg-white/95 backdrop-blur-md p-3 text-stone-900 shadow-lg ring-2 ring-emerald-500/10 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-emerald-600" />
                  <span>SMS from {incomingSMS.sender}</span>
                </span>
                <span className="text-[10px] text-stone-400">{incomingSMS.time}</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed font-sans font-medium">
                {incomingSMS.text}
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px]">
                <span className="text-stone-500 font-mono">Token stored in app database</span>
                <span className="text-emerald-700 font-bold">✓ Confirmed</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PHONE SCREEN (LCD Display Area) */}
        {/* ============================================================== */}
        <div className="w-full rounded-2xl bg-white border border-stone-200 p-4 mb-3 text-stone-900 flex flex-col justify-between min-h-[280px] shadow-xs relative overflow-hidden">
          {/* Screen Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-2 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${callStatus === "connected" ? "bg-emerald-500 animate-ping" : "bg-stone-400"}`} />
              <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-800 font-mono">
                Toll-Free IVR System
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-stone-500">
              {callStatus === "connected" ? formatTimer(callDuration) : callStatus === "dialing" ? "Connecting..." : "Standby"}
            </span>
          </div>

          {/* Screen Content Based on Call Status */}
          <div className="py-2.5 relative z-10 space-y-2">
            {/* IDLE STATE */}
            {callStatus === "idle" && (
              <div className="text-center py-4 space-y-2">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                  <PhoneCall className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">KisanQueue Voice Hotline</h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">Government Toll-Free Slot Booking</p>
                </div>
                <div className="font-mono text-xl font-black text-emerald-700 tracking-wider">
                  {dialedNumber}
                </div>
                <p className="text-[10px] text-stone-500 px-4">
                  For farmers with keypad phones. Dial or tap Call below to start the interactive voice call.
                </p>
                {sarvamKey ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                    <Sparkles className="size-3 text-emerald-600" /> Sarvam AI Malayalam Engine Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-medium border border-stone-200">
                    Browser Voice Active · Tap "AI Voice Key" to add Sarvam Key
                  </span>
                )}
              </div>
            )}

            {/* DIALING & RINGING STATE */}
            {callStatus === "dialing" && (
              <div className="text-center py-6 space-y-3">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 animate-bounce">
                  <Phone className="size-6" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 font-medium">Ringing Toll-Free Server...</p>
                  <p className="font-mono text-lg font-bold text-emerald-700">{dialedNumber}</p>
                </div>
                <div className="flex justify-center gap-1 pt-1">
                  <span className="size-2 bg-emerald-600 rounded-full animate-pulse" />
                  <span className="size-2 bg-emerald-600 rounded-full animate-pulse delay-150" />
                  <span className="size-2 bg-emerald-600 rounded-full animate-pulse delay-300" />
                </div>
              </div>
            )}

            {/* CONNECTED STATE */}
            {callStatus === "connected" && (
              <div className="space-y-2">
                {/* Step Badge & Language Indicator */}
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    Step {step} of 6: {
                      step === 1 ? "Identity & Language" :
                      step === 2 ? "Procurement Centre" :
                      step === 3 ? "Crop & Quantity" :
                      step === 4 ? "Slot Window" :
                      step === 5 ? "Alternate Contact" : "Confirmation"
                    }
                  </span>
                  <span className="text-[10px] font-mono font-bold text-stone-600 uppercase bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                    {selectedLang === "ml" ? "മലയാളം" : "English"}
                  </span>
                </div>

                {/* Animated Voice Audio Equalizer Waveform */}
                <div className="flex items-center justify-center gap-1 py-1">
                  <span className={`w-1 bg-emerald-600 rounded-full transition-all duration-150 ${isSpeaking ? "h-4 animate-pulse" : "h-2"}`} />
                  <span className={`w-1 bg-emerald-500 rounded-full transition-all duration-150 ${isSpeaking ? "h-6 animate-pulse delay-75" : "h-1.5"}`} />
                  <span className={`w-1 bg-emerald-600 rounded-full transition-all duration-150 ${isSpeaking ? "h-5 animate-pulse delay-150" : "h-2"}`} />
                  <span className={`w-1 bg-emerald-500 rounded-full transition-all duration-150 ${isSpeaking ? "h-7 animate-pulse delay-200" : "h-1.5"}`} />
                  <span className={`w-1 bg-emerald-600 rounded-full transition-all duration-150 ${isSpeaking ? "h-4 animate-pulse delay-100" : "h-2"}`} />
                  <span className="text-[10px] text-stone-500 font-mono ml-2">
                    {isSpeaking ? (sarvamKey ? "Sarvam AI Speaking..." : "Speaking Prompt...") : "Listening for DTMF..."}
                  </span>
                </div>

                {/* Automated Voice Prompt Display Box */}
                <div className="rounded-xl bg-stone-50 border border-stone-200 p-2.5 space-y-1 shadow-2xs">
                  <span className="text-[9.5px] font-bold tracking-wider uppercase text-stone-500 block">
                    Automated Voice Prompt:
                  </span>
                  <p className="text-xs text-stone-800 font-medium leading-relaxed">
                    {transcript[transcript.length - 1]?.text || "Listening for keypad tone input..."}
                  </p>
                </div>

                {/* Live Buffer Display if typing multi-digit numbers */}
                {currentBuffer && (
                  <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-center font-mono text-xs text-emerald-900 font-bold flex items-center justify-between">
                    <span>Input: {currentBuffer}</span>
                    <span className="text-[10px] text-emerald-700">Press # to Submit</span>
                  </div>
                )}

                {/* Interactive Action Touch Shortcuts for current menu step */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-stone-500">
                    Options (Tap or Dial on Keypad):
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Step 1: Language */}
                    {step === 1 && subStep === 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("1")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">1.</strong> മലയാളം (ML)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("2")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">2.</strong> English (EN)
                        </button>
                      </>
                    )}

                    {/* Step 1: Phone Verification */}
                    {step === 1 && subStep === 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("1")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">1.</strong> Confirm {confirmedPhone}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("2")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">2.</strong> Change Phone Number
                        </button>
                      </>
                    )}

                    {/* Step 1: Custom Phone Entry */}
                    {step === 1 && subStep === 2 && (
                      <div className="col-span-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleKeyPress("#")}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs text-center"
                        >
                          Submit Number (#)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentBuffer("")}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs cursor-pointer border border-stone-200"
                        >
                          Clear
                        </button>
                      </div>
                    )}

                    {/* Step 2: Centres */}
                    {step === 2 && (
                      <>
                        {centres.slice(0, 4).map((c, i) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleKeyPress(String(i + 1))}
                            className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors truncate"
                          >
                            <strong className="text-emerald-700 font-mono">{i + 1}.</strong> {c.name.replace("Procurement Centre", "Yard")}
                          </button>
                        ))}
                      </>
                    )}

                    {/* Step 3 Substep 0: Crops */}
                    {step === 3 && subStep === 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("1")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">1.</strong> Paddy (₹32/kg)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("2")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">2.</strong> Raw Coconut (₹38/kg)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("3")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">3.</strong> Rubber RSS4 (₹180/kg)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("4")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">4.</strong> Pepper (₹520/kg)
                        </button>
                      </>
                    )}

                    {/* Step 3 Substep 1: Quantity */}
                    {step === 3 && subStep === 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("1")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">1.</strong> 250 kg
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("2")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">2.</strong> 420 kg
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("3")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">3.</strong> 500 kg
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("4")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">4.</strong> 1,000 kg
                        </button>
                      </>
                    )}

                    {/* Step 3 Substep 2: Moisture Quality */}
                    {step === 3 && subStep === 2 && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("1")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">1.</strong> Yes (&lt;14% Moisture)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("2")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">2.</strong> Standard Grade
                        </button>
                      </>
                    )}

                    {/* Step 4: Slots */}
                    {step === 4 && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("1")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">1.</strong> Tomorrow 10:00 AM
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("2")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">2.</strong> Tomorrow 02:00 PM
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("3")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer col-span-2 shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">3.</strong> Day After 11:00 AM
                        </button>
                      </>
                    )}

                    {/* Step 5: Alternate Contact */}
                    {step === 5 && subStep === 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("1")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">1.</strong> Add 2nd Contact
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("2")}
                          className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 text-left text-[11px] cursor-pointer shadow-xs transition-colors"
                        >
                          <strong className="text-emerald-700 font-mono">2.</strong> Use Primary Number
                        </button>
                      </>
                    )}

                    {step === 5 && subStep === 1 && (
                      <div className="col-span-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleKeyPress("#")}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs text-center"
                        >
                          Confirm 2nd Number (#)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentBuffer("")}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs cursor-pointer border border-stone-200"
                        >
                          Clear
                        </button>
                      </div>
                    )}

                    {/* Step 6: Confirmation Commit */}
                    {step === 6 && !createdToken && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("1")}
                          className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center text-xs cursor-pointer shadow-xs col-span-1 transition-colors"
                        >
                          1. Confirm &amp; Book
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeyPress("2")}
                          className="px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-center text-xs cursor-pointer border border-stone-200 col-span-1 transition-colors"
                        >
                          2. Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Live Confirmation Badge when Token is Generated */}
                {createdToken && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-center space-y-1.5 shadow-xs animate-in zoom-in-95 duration-200">
                    <span className="inline-flex items-center gap-1 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="size-4 text-emerald-600" /> Official Token Generated
                    </span>
                    <p className="font-mono text-2xl font-black text-emerald-950">
                      #{createdToken}
                    </p>
                    <p className="text-[10px] text-stone-600 font-mono">
                      Booking ID: {bookingId}
                    </p>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      {selectedCrop} · {selectedQuantity} kg · {selectedCentre.name}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ENDED STATE */}
            {callStatus === "ended" && (
              <div className="text-center py-4 space-y-2.5">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                  <PhoneOff className="size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Call Ended</h4>
                  <p className="text-xs text-stone-500">Duration: {formatTimer(callDuration)}</p>
                </div>

                {createdToken && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium space-y-1">
                    <p className="font-bold flex items-center justify-center gap-1 text-emerald-900">
                      <CheckCircle2 className="size-4 text-emerald-600" /> Token #{createdToken} Stored in App
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      Produce: {selectedCrop} ({selectedQuantity}kg) at {selectedCentre.name}.
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <button
                    type="button"
                    onClick={handleStartCall}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-all cursor-pointer shadow-xs"
                  >
                    Call Again
                  </button>
                  {onNavigateToDashboard && (
                    <button
                      type="button"
                      onClick={onNavigateToDashboard}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-xs font-bold hover:bg-stone-50 transition-all cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <span>Farmer Dashboard</span>
                      <ChevronRight className="size-3.5" />
                    </button>
                  )}
                  {onNavigateToQueue && (
                    <button
                      type="button"
                      onClick={onNavigateToQueue}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer shadow-xs"
                    >
                      Track Live Queue
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Screen Bottom Status Bar */}
          <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-[10px] text-stone-500 relative z-10">
            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              className="flex items-center gap-1 hover:text-stone-800 cursor-pointer"
              title="Toggle Audio"
            >
              {soundEnabled ? <Volume2 className="size-3.5 text-emerald-600" /> : <VolumeX className="size-3.5 text-stone-400" />}
              <span>{soundEnabled ? "Audio On" : "Muted"}</span>
            </button>
            <span className="font-mono font-semibold text-stone-600">1800-425-1661</span>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 hover:text-stone-800 cursor-pointer"
              title="Reset Call"
            >
              <RotateCcw className="size-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TELEPHONE PHYSICAL KEYPAD (DTMF 1-9, *, 0, #) */}
        {/* ============================================================== */}
        <div className="w-full bg-stone-200/70 rounded-2xl p-3 border border-stone-300 shadow-inner space-y-2.5">
          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "1", sub: selectedLang === "ml" ? "മലയാളം" : "EN / ML" },
              { key: "2", sub: "ABC" },
              { key: "3", sub: "DEF" },
              { key: "4", sub: "GHI" },
              { key: "5", sub: "JKL" },
              { key: "6", sub: "MNO" },
              { key: "7", sub: "PQRS" },
              { key: "8", sub: "TUV" },
              { key: "9", sub: "WXYZ" },
              { key: "*", sub: "Repeat" },
              { key: "0", sub: "+" },
              { key: "#", sub: "Enter" },
            ].map((btn) => (
              <button
                key={btn.key}
                type="button"
                onClick={() => handleKeyPress(btn.key)}
                className="flex flex-col items-center justify-center rounded-xl bg-white hover:bg-stone-50 active:bg-emerald-50 active:border-emerald-500 active:scale-95 transition-all py-2 border border-stone-300/80 shadow-xs cursor-pointer group select-none"
              >
                <span className="font-mono text-base sm:text-lg font-bold text-stone-900 group-hover:text-emerald-800">
                  {btn.key}
                </span>
                <span className="text-[8.5px] uppercase font-bold text-stone-400 group-hover:text-stone-600">
                  {btn.sub}
                </span>
              </button>
            ))}
          </div>

          {/* Call & End Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {callStatus === "connected" || callStatus === "dialing" ? (
              <button
                type="button"
                onClick={handleEndCall}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer col-span-2"
              >
                <PhoneOff className="size-4" />
                <span>End Call</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartCall}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer col-span-2"
              >
                <Phone className="size-4" />
                <span>Call Toll-Free (1800-425-1661)</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Close button if presented in dialog */}
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-3 text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
          >
            Close Call Simulator
          </button>
        )}
      </div>

      {/* Transcript Log & SIH Digital Inclusion Card */}
      <div className="w-full max-w-md mt-4 space-y-2">
        <details className="rounded-2xl border border-stone-200 bg-white p-3 text-xs text-stone-900 shadow-xs">
          <summary className="font-bold cursor-pointer text-emerald-800 flex items-center justify-between">
            <span>📜 Live Call Transcript &amp; DTMF Log ({transcript.length} events)</span>
            <span className="text-[10px] text-stone-500 font-mono">View Log</span>
          </summary>
          <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px] pr-1">
            {transcript.length === 0 ? (
              <p className="text-stone-400 italic">No call in progress. Press Call to start.</p>
            ) : (
              transcript.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-1.5 rounded-lg ${
                    item.speaker === "IVR"
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                      : "bg-stone-100 text-stone-800 border border-stone-200"
                  }`}
                >
                  <span className="font-bold mr-1">[{item.time}] {item.speaker}:</span>
                  <span>{item.text}</span>
                </div>
              ))
            )}
          </div>
        </details>

        <div className="rounded-2xl border border-stone-200 bg-white p-3 text-[11px] text-stone-600 space-y-1 leading-relaxed shadow-xs">
          <p className="font-bold text-stone-900 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-emerald-700" /> Digital Inclusion Innovation:
          </p>
          <p>
            Keypad phone farmers dial toll-free, pick their language, enter quantity, and receive official queue tokens synced directly with the central database.
          </p>
        </div>
      </div>

      {/* SARVAM AI API KEY CONFIGURATION MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-stone-200 shadow-2xl p-5 text-stone-900 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="size-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <KeyRound className="size-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">Sarvam AI Speech API Key</h3>
                  <p className="text-[11px] text-stone-500">Native Malayalam &amp; Indian English Voice TTS</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="size-7 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="text-xs text-stone-600 space-y-2">
              <p>
                Provide your <strong>Sarvam AI Subscription Key</strong> (<a href="https://dashboard.sarvam.ai" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold inline-flex items-center gap-0.5">dashboard.sarvam.ai <ExternalLink className="size-3" /></a>) for studio-quality Malayalam speech synthesis without browser limits.
              </p>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  API Subscription Key:
                </label>
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="e.g. sk_live_..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {keyTestStatus && (
                <div
                  className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                    keyTestStatus.testing
                      ? "bg-stone-50 border-stone-200 text-stone-600"
                      : keyTestStatus.success
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{keyTestStatus.message}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={keyTestStatus?.testing || !tempKey.trim()}
                className="px-3 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {keyTestStatus?.testing ? "Testing..." : "Test Voice"}
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer shadow-xs transition-colors text-center"
              >
                Save &amp; Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
