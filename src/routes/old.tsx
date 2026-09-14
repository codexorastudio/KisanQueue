import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import { useKisanQueue } from "@/lib/store";
import { Language, ProcurementCentre, Booking } from "@/lib/types";
import { SUPPORTED_LANGUAGES } from "@/lib/translations";
import {
  Volume2,
  VolumeX,
  Phone,
  ArrowLeft,
  Check,
  Plus,
  Minus,
  MapPin,
  Clock,
  AlertCircle,
  Ticket,
  ChevronRight,
  CheckCircle2,
  X,
  Building2,
  Languages,
  Sparkles,
  UserRound,
  CalendarDays,
  CreditCard,
  Sprout,
  ShieldCheck,
  Landmark,
  FileText,
  HelpCircle,
  LogOut,
  ExternalLink,
} from "lucide-react";

// Crop image assets
import cropPaddy from "@/assets/crop-paddy.jpg";
import cropCoconut from "@/assets/crop-coconut.jpg";
import cropRubber from "@/assets/crop-rubber.jpg";
import cropPepper from "@/assets/crop-pepper.jpg";
import cropCardamom from "@/assets/crop-cardamom.jpg";
import cropArecanut from "@/assets/crop-arecanut.jpg";
import cropNutmeg from "@/assets/crop-nutmeg.jpg";
import cropCoffee from "@/assets/crop-coffee.jpg";
import cropBanana from "@/assets/crop-banana.jpg";
import { KisanQueueAIChatbot } from "@/components/KisanQueueAIChatbot";

export const Route = createFileRoute("/old")({
  head: () => ({
    meta: [
      { title: "Accessible Farmer Mode — KisanQueue" },
      {
        name: "description",
        content:
          "Accessible farmer portal with token booking, bookings history, payments, profile, enlarged text, and voice assistance.",
      },
    ],
  }),
  component: SeniorCitizenModePage,
});

// Crop dictionary with 8 languages
const CROP_ITEMS = [
  {
    id: "paddy",
    names: {
      ml: "നെല്ല് (Paddy)",
      hi: "धान (Paddy)",
      ta: "நெல் (Paddy)",
      te: "వరి (Paddy)",
      kn: "ಭತ್ತ (Paddy)",
      bn: "ধান (Paddy)",
      mr: "भात (Paddy)",
      en: "Paddy",
    },
    msp: 32,
    image: cropPaddy,
    unit: "kg",
  },
  {
    id: "coconut",
    names: {
      ml: "തേങ്ങ (Coconut)",
      hi: "नारियल (Coconut)",
      ta: "தேங்காய் (Coconut)",
      te: "కొబ్బరి (Coconut)",
      kn: "ತೆಂಗಿನಕಾಯಿ (Coconut)",
      bn: "নারকেল (Coconut)",
      mr: "नारळ (Coconut)",
      en: "Raw Coconut",
    },
    msp: 38,
    image: cropCoconut,
    unit: "kg",
  },
  {
    id: "rubber",
    names: {
      ml: "റബ്ബർ (Rubber RSS4)",
      hi: "रबर (Rubber RSS4)",
      ta: "ரப்பர் (Rubber RSS4)",
      te: "రబ్బరు (Rubber RSS4)",
      kn: "ರಬ್ಬರ್ (Rubber RSS4)",
      bn: "রবার (Rubber RSS4)",
      mr: "रबर (Rubber RSS4)",
      en: "Rubber RSS4",
    },
    msp: 180,
    image: cropRubber,
    unit: "kg",
  },
  {
    id: "pepper",
    names: {
      ml: "കുരുമുളക് (Pepper)",
      hi: "काली मिर्च (Black Pepper)",
      ta: "மிளகு (Black Pepper)",
      te: "మిరియాలు (Black Pepper)",
      kn: "ಕಾಳುಮೆಣಸು (Black Pepper)",
      bn: "গোলমরিচ (Black Pepper)",
      mr: "काळी मिरी (Black Pepper)",
      en: "Black Pepper",
    },
    msp: 520,
    image: cropPepper,
    unit: "kg",
  },
  {
    id: "cardamom",
    names: {
      ml: "ഏലം (Cardamom)",
      hi: "इलायची (Cardamom)",
      ta: "ஏலக்காய் (Cardamom)",
      te: "యాలకులు (Cardamom)",
      kn: "ಏಲಕ್ಕಿ (Cardamom)",
      bn: "এলাচ (Cardamom)",
      mr: "वेलची (Cardamom)",
      en: "Cardamom",
    },
    msp: 1850,
    image: cropCardamom,
    unit: "kg",
  },
  {
    id: "arecanut",
    names: {
      ml: "അടയ്ക്ക (Areca Nut)",
      hi: "सुपारी (Areca Nut)",
      ta: "பாக்கு (Areca Nut)",
      te: "పోకచెక్క (Areca Nut)",
      kn: "ಅಡಿಕೆ (Areca Nut)",
      bn: "সুপারি (Areca Nut)",
      mr: "सुपारी (Areca Nut)",
      en: "Areca Nut",
    },
    msp: 360,
    image: cropArecanut,
    unit: "kg",
  },
  {
    id: "nutmeg",
    names: {
      ml: "ജാതിക്ക (Nutmeg)",
      hi: "जायफल (Nutmeg)",
      ta: "ஜாதிக்காய் (Nutmeg)",
      te: "జాజికాయ (Nutmeg)",
      kn: "ಜಾಯಿಕಾಯಿ (Nutmeg)",
      bn: "জায়ফল (Nutmeg)",
      mr: "जायफळ (Nutmeg)",
      en: "Nutmeg & Mace",
    },
    msp: 280,
    image: cropNutmeg,
    unit: "kg",
  },
  {
    id: "coffee",
    names: {
      ml: "കാപ്പി (Coffee)",
      hi: "कॉफ़ी (Coffee)",
      ta: "காபி (Coffee)",
      te: "కాఫీ (Coffee)",
      kn: "ಕಾಫಿ (Coffee)",
      bn: "কফি (Coffee)",
      mr: "कॉफी (Coffee)",
      en: "Robusta Coffee",
    },
    msp: 210,
    image: cropCoffee,
    unit: "kg",
  },
  {
    id: "banana",
    names: {
      ml: "നേന്ത്രക്കായ (Banana)",
      hi: "केला (Banana)",
      ta: "வாழைக்காய் (Banana)",
      te: "అరటికాయ (Banana)",
      kn: "ಬಾಳೆಹಣ್ಣು (Banana)",
      bn: "কলা (Banana)",
      mr: "केळी (Banana)",
      en: "Nendran Banana",
    },
    msp: 42,
    image: cropBanana,
    unit: "kg",
  },
];

const PRESET_QUANTITIES = [50, 100, 250, 500];

type SeniorTab = "token" | "bookings" | "payments" | "profile";

// Multilingual UI Strings
const UI_TEXTS: Record<
  Language,
  {
    tabToken: string;
    tabBookings: string;
    tabPayments: string;
    tabProfile: string;
    seniorBadge: string;
    simpleService: string;
    textSize: string;
    selectLanguage: string;
    listenAloud: string;
    stopVoice: string;
    greeting: string;
    appTitle: string;
    appSub: string;
    activeTokenTitle: string;
    tokenNumberLabel: string;
    nowServing: string;
    gateInfo: string;
    aheadOfYou: string;
    waitMin: string;
    listenTokenDetails: string;
    getDirections: string;
    cancelBtn: string;
    noTokenTitle: string;
    noTokenSub: string;
    step123: string;
    bookNewTokenTitle: string;
    helpVoiceBtn: string;
    step1Label: string;
    step2Label: string;
    by1kgBadge: string;
    decrease1: string;
    increase1: string;
    kgLabel: string;
    estimatedPayout: string;
    directDbt: string;
    step3Label: string;
    centresAvailable: string;
    fastQueue: string;
    normalQueue: string;
    busyQueue: string;
    waitingCount: string;
    confirmButton: string;
    todayIssuedSub: string;
    needAssistance: string;
    callForToken: string;
    freeHelpline: string;
    callNow: string;
    managerCall: string;
    returnBtn: string;
    modalSuccessTitle: string;
    modalOkBtn: string;
    modalCancelTitle: string;
    modalCancelSub: string;
    modalKeepBtn: string;
    modalConfirmCancelBtn: string;
    switchStandard: string;
    // Profile Strings
    profileTitle: string;
    aadhaarLinked: string;
    farmerIdLabel: string;
    mobileLabel: string;
    panchayatLabel: string;
    landholdingLabel: string;
    cropsLabel: string;
    bankLabel: string;
    ifscLabel: string;
    // Bookings Strings
    bookingsTitle: string;
    noBookings: string;
    // Payments Strings
    paymentsTitle: string;
    totalReceived: string;
    dbtVerified: string;
    txnHistory: string;
    // Extended UI & Voice keys
    farmRegistryTitle: string;
    farmLandDetail: string;
    farmCropsList: string;
    bankSectionTitle: string;
    bankBranchInfo: string;
    languageVoiceSub: string;
    listenBtn: string;
    successBadge: string;
    paddyProcurement: string;
    coconutProcurement: string;
    tokenCancelledSpeech: string;
    activeBadge: string;
    doneBadge: string;
    cancelledBadge: string;
  }
> = {
  ml: {
    tabToken: "ടോക്കൺ",
    tabBookings: "ബുക്കിംഗ്",
    tabPayments: "പെയ്‌മെന്റ്",
    tabProfile: "പ്രൊഫൈൽ",
    seniorBadge: "🌾 സുഗമ കിസാൻ (Easy Access)",
    simpleService: "ലളിതമായ സേവനം (Accessible Mode)",
    textSize: "അക്ഷരങ്ങൾ:",
    selectLanguage: "ഭാഷ തിരഞ്ഞെടുക്കുക:",
    listenAloud: "ശബ്ദത്തിൽ കേൾക്കുക",
    stopVoice: "ശബ്ദം നിർത്തുക",
    greeting: "നമസ്കാരം, കർഷക സുഹൃത്തേ",
    appTitle: "കിസാൻ ക്യൂ സഹായി",
    appSub: "വരിനിൽക്കാതെ എളുപ്പത്തിൽ ടോക്കൺ എടുക്കാം",
    activeTokenTitle: "നിങ്ങളുടെ ടോക്കൺ സജീവം (Active)",
    tokenNumberLabel: "നിങ്ങളുടെ ടോക്കൺ നമ്പർ",
    nowServing: "ഇപ്പോൾ വിളിക്കുന്നത്",
    gateInfo: "(ഗേറ്റ് 1 ൽ)",
    aheadOfYou: "നിങ്ങളുടെ മുന്നിൽ",
    waitMin: "മിനിറ്റ് കാത്തിരിപ്പ്",
    listenTokenDetails: "ഈ വിവരങ്ങൾ ശബ്ദത്തിൽ കേൾക്കുക",
    getDirections: "വഴി അറിയുക (Map)",
    cancelBtn: "റദ്ദാക്കുക",
    noTokenTitle: "ഇപ്പോൾ നിങ്ങളുടെ പക്കൽ ടോക്കൺ ഇല്ല",
    noTokenSub: "താഴെ നിങ്ങളുടെ വിളയും, തൂക്കവും, സംഭരണ കേന്ദ്രവും തിരഞ്ഞെടുത്ത് പച്ച ബട്ടൺ അമർത്തുക.",
    step123: "സ്റ്റെപ്പ് 1, 2 & 3",
    bookNewTokenTitle: "🌾 പുതിയ ടോക്കൺ എടുക്കുക",
    helpVoiceBtn: "സഹായം കേൾക്കുക",
    step1Label: "1. വിള തിരഞ്ഞെടുക്കുക:",
    step2Label: "2. തൂക്കം എത്ര കിലോഗ്രാം?:",
    by1kgBadge: "+1 kg വീതം കൂട്ടാം",
    decrease1: "1 കിലോ കുറയ്ക്കുക (-1 kg)",
    increase1: "1 കിലോ കൂട്ടുക (+1 kg)",
    kgLabel: "കിലോഗ്രാം (കിലോ)",
    estimatedPayout: "കണക്കാക്കിയ തുക (Estimated MSP Bank Credit)",
    directDbt: "നേരിട്ട് ബാങ്കിലേക്ക് (DBT)",
    step3Label: "3. സംഭരണ കേന്ദ്രം തിരഞ്ഞെടുക്കുക:",
    centresAvailable: "കേന്ദ്രങ്ങൾ ലഭ്യമാണ്",
    fastQueue: "🟢 വേഗത്തിൽ",
    normalQueue: "🟡 സാധാരണ",
    busyQueue: "🟠 തിരക്ക്",
    waitingCount: "പേർ ക്യൂവിൽ",
    confirmButton: "✅ ടോക്കൺ എടുക്കുക (CONFIRM)",
    todayIssuedSub: "ഇന്നത്തെ തീയതിയിൽ തൽക്ഷണം ടോക്കൺ നമ്പർ നൽകും",
    needAssistance: "സഹായം വേണോ? (Need Assistance?)",
    callForToken: "ഫോണിൽ വിളിച്ച് ടോക്കൺ എടുക്കാം",
    freeHelpline: "കിസാൻ കോൾ സെന്ററിലേക്ക് സൗജന്യമായി വിളിക്കാം",
    callNow: "1800-425-1661 (വിളിക്കുക)",
    managerCall: "കേന്ദ്ര മാനേജർ: 9447123456",
    returnBtn: "സാധാരണ മോഡിലേക്ക് മാറുക",
    modalSuccessTitle: "ടോക്കൺ ലഭിച്ചു! (Success)",
    modalOkBtn: "ശരി, മനസ്സിലായി (OK)",
    modalCancelTitle: "ടോക്കൺ റദ്ദാക്കണമോ?",
    modalCancelSub: "ടോക്കൺ ഒഴിവാക്കിയാൽ ക്യൂവിൽ നിങ്ങളുടെ സ്ഥാനം നഷ്ടപ്പെടും.",
    modalKeepBtn: "വേണ്ട (Keep)",
    modalConfirmCancelBtn: "അതെ, റദ്ദാക്കുക",
    switchStandard: "സാധാരണ മോഡിലേക്ക് മാറുക (Switch View)",
    profileTitle: "കർഷക പ്രൊഫൈൽ",
    aadhaarLinked: "ആധാർ ലിങ്ക് ചെയ്ത പ്രൊഫൈൽ",
    farmerIdLabel: "കിസാൻ ഐഡി",
    mobileLabel: "ഫോൺ നമ്പർ",
    panchayatLabel: "ഗ്രാമപഞ്ചായത്ത്",
    landholdingLabel: "കൃഷിഭൂമി",
    cropsLabel: "പ്രധാന വിളകൾ",
    bankLabel: "ബാങ്ക് അക്കൗണ്ട്",
    ifscLabel: "ഐ.എഫ്.എസ്.സി",
    bookingsTitle: "എന്റെ ടോക്കണുകൾ & ബുക്കിംഗുകൾ",
    noBookings: "ബുക്കിംഗുകൾ ഒന്നും കണ്ടെത്തിയില്ല",
    paymentsTitle: "ബാങ്ക് താങ്ങുവില പെയ്‌മെന്റ് (MSP DBT)",
    totalReceived: "നേരിട്ട് അക്കൗണ്ടിലെത്തിയ ആകെ തുക",
    dbtVerified: "പി.എഫ്.എം.എസ് വഴി ബാങ്കിലേക്ക് കൈമാറി",
    txnHistory: "കഴിഞ്ഞ പേയ്മെന്റുകൾ",
    farmRegistryTitle: "കാർഷിക വിവരങ്ങൾ (Farm Registry)",
    farmLandDetail: "2.4 ഏക്കർ (കുമരകം)",
    farmCropsList: "നെല്ല്, തേങ്ങ, റബ്ബർ",
    bankSectionTitle: "ബാങ്ക് അക്കൗണ്ട് വിവരങ്ങൾ (PFMS DBT)",
    bankBranchInfo: "ശാഖ: തിരുനക്കര, കോട്ടയം",
    languageVoiceSub: "പോർട്ടൽ ഭാഷയും ശബ്ദവും മാറ്റുക (Language & Voice)",
    listenBtn: "കേൾക്കുക",
    successBadge: "വിജയകരം",
    paddyProcurement: "നെല്ല് സംഭരണം",
    coconutProcurement: "പച്ചത്തേങ്ങ സംഭരണം",
    tokenCancelledSpeech: "ടോക്കൺ വിജയകരമായി റദ്ദാക്കി.",
    activeBadge: "സജീവം",
    doneBadge: "പൂർത്തിയായി",
    cancelledBadge: "റദ്ദാക്കി",
  },
  hi: {
    tabToken: "टोकन",
    tabBookings: "बुकिंग",
    tabPayments: "भुगतान",
    tabProfile: "प्रोफाइल",
    seniorBadge: "🌾 सुगम किसान (Easy Access)",
    simpleService: "सरल सेवा (Accessible Mode)",
    textSize: "अक्षर आकार:",
    selectLanguage: "भाषा चुनें:",
    listenAloud: "आवाज़ में सुनें",
    stopVoice: "आवाज़ रोकें",
    greeting: "नमस्ते, किसान साथी",
    appTitle: "किसान कतार सहायक",
    appSub: "बिना लंबी कतार के आसानी से टोकन प्राप्त करें",
    activeTokenTitle: "आपका टोकन सक्रिय है (Active)",
    tokenNumberLabel: "आपका टोकन नंबर",
    nowServing: "अभी बुलाया जा रहा है",
    gateInfo: "(गेट 1 पर)",
    aheadOfYou: "आपके आगे",
    waitMin: "मिनट प्रतीक्षा",
    listenTokenDetails: "यह जानकारी आवाज़ में सुनें",
    getDirections: "रास्ता देखें (Map)",
    cancelBtn: "रद्द करें",
    noTokenTitle: "वर्तमान में आपके पास कोई टोकन नहीं है",
    noTokenSub: "नीचे अपनी फसल, वज़न और खरीद केंद्र चुनें और हरा बटन दबाएं।",
    step123: "स्टेप 1, 2 और 3",
    bookNewTokenTitle: "🌾 नया टोकन प्राप्त करें",
    helpVoiceBtn: "मदद सुनें",
    step1Label: "1. फसल चुनें:",
    step2Label: "2. वज़न कितने किलोग्राम?:",
    by1kgBadge: "+1 kg जोड़ सकते हैं",
    decrease1: "1 किलो घटाएं (-1 kg)",
    increase1: "1 किलो बढ़ाएं (+1 kg)",
    kgLabel: "किलोग्राम (किलो)",
    estimatedPayout: "अनुमानित राशि (MSP Bank Transfer)",
    directDbt: "सीधे बैंक खाते में (DBT)",
    step3Label: "3. खरीद केंद्र चुनें:",
    centresAvailable: "केंद्र उपलब्ध हैं",
    fastQueue: "🟢 तेज़ गति",
    normalQueue: "🟡 सामान्य",
    busyQueue: "🟠 भीड़",
    waitingCount: "किसान कतार में",
    confirmButton: "✅ टोकन बुक करें (CONFIRM)",
    todayIssuedSub: "आज की तारीख में तुरंत टोकन नंबर जारी होगा",
    needAssistance: "मदद चाहिए? (Need Assistance?)",
    callForToken: "फोन करके टोकन प्राप्त करें",
    freeHelpline: "किसान कॉल सेंटर पर टोल-फ्री कॉल करें",
    callNow: "1800-425-1661 (कॉल करें)",
    managerCall: "केंद्र प्रबंधक: 9447123456",
    returnBtn: "सामान्य मोड में जाएं",
    modalSuccessTitle: "टोकन प्राप्त हुआ! (Success)",
    modalOkBtn: "ठीक है, समझ गया (OK)",
    modalCancelTitle: "टोकन रद्द करना चाहते हैं?",
    modalCancelSub: "टोकन रद्द करने पर कतार में आपका स्थान समाप्त हो जाएगा।",
    modalKeepBtn: "नहीं, रखें (Keep)",
    modalConfirmCancelBtn: "हाँ, रद्द करें",
    switchStandard: "सामान्य मोड पर स्विच करें",
    profileTitle: "किसान प्रोफाइल",
    aadhaarLinked: "आधार लिंक सत्यापित",
    farmerIdLabel: "किसान आईडी",
    mobileLabel: "मोबाइल नंबर",
    panchayatLabel: "ग्राम पंचायत",
    landholdingLabel: "कृषि भूमि",
    cropsLabel: "मुख्य फसलें",
    bankLabel: "बैंक खाता",
    ifscLabel: "आईएफएससी कोड",
    bookingsTitle: "मेरी बुकिंग और टोकन",
    noBookings: "कोई बुकिंग उपलब्ध नहीं है",
    paymentsTitle: "न्यूनतम समर्थन मूल्य भुगतान (DBT)",
    totalReceived: "सीधे खाते में प्राप्त कुल राशि",
    dbtVerified: "PFMS द्वारा सीधे बैंक में जमा",
    txnHistory: "हालिया लेन-देन विवरण",
    farmRegistryTitle: "कृषि विवरण (Farm Registry)",
    farmLandDetail: "2.4 एकड़ (कुमरकम)",
    farmCropsList: "धान, नारियल, रबर",
    bankSectionTitle: "बैंक खाता विवरण (PFMS DBT)",
    bankBranchInfo: "शाखा: तिरुनक्करा, कोट्टायम",
    languageVoiceSub: "पोर्टल भाषा और आवाज़ बदलें (Language & Voice)",
    listenBtn: "सुनें",
    successBadge: "सफल",
    paddyProcurement: "धान खरीद",
    coconutProcurement: "नारियल खरीद",
    tokenCancelledSpeech: "टोकन सफलतापूर्वक रद्द कर दिया गया है।",
    activeBadge: "सक्रिय",
    doneBadge: "पूर्ण",
    cancelledBadge: "रद्द",
  },
  ta: {
    tabToken: "டோக்கன்",
    tabBookings: "பதிவுகள்",
    tabPayments: "கொடுப்பனவு",
    tabProfile: "சுயவிவரம்",
    seniorBadge: "🌾 எளிய விவசாயி (Easy Access)",
    simpleService: "எளிய சேவை (Accessible Mode)",
    textSize: "எழுத்து அளவு:",
    selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்:",
    listenAloud: "குரலில் கேட்கவும்",
    stopVoice: "குரலை நிறுத்தவும்",
    greeting: "வணக்கம், விவசாய நண்பரே",
    appTitle: "விவசாயி வரிசை உதவியாளர்",
    appSub: "நீண்ட வரிசையின்றி எளிதாக டோக்கன் பெறுங்கள்",
    activeTokenTitle: "உங்கள் டோக்கன் செயலில் உள்ளது (Active)",
    tokenNumberLabel: "உங்கள் டோக்கன் எண்",
    nowServing: "இப்போது அழைக்கப்படுவது",
    gateInfo: "(கேட் 1 இல்)",
    aheadOfYou: "உங்கள் முன்",
    waitMin: "நிமிட காத்திருப்பு",
    listenTokenDetails: "இத்தகவலை குரலில் கேட்கவும்",
    getDirections: "வழி காட்டு (Map)",
    cancelBtn: "ரத்து செய்",
    noTokenTitle: "தற்போது உங்களிடம் டோக்கன் இல்லை",
    noTokenSub: "கீழே பயிர், எடை மற்றும் மையத்தைத் தேர்ந்தெடுத்து பச்சை பொத்தானை அழுத்தவும்.",
    step123: "படி 1, 2 மற்றும் 3",
    bookNewTokenTitle: "🌾 புதிய டோக்கன் எடுக்கவும்",
    helpVoiceBtn: "உதவி கேட்கவும்",
    step1Label: "1. பயிரைத் தேர்ந்தெடுக்கவும்:",
    step2Label: "2. எடை எத்தனை கிலோகிராம்?:",
    by1kgBadge: "+1 kg வீதம் கூட்டலாம்",
    decrease1: "1 கிலோ குறைக்கவும் (-1 kg)",
    increase1: "1 கிலோ கூட்டவும் (+1 kg)",
    kgLabel: "கிலோகிராம் (கிலோ)",
    estimatedPayout: "மதிப்பிடப்பட்ட தொகை (MSP Bank Credit)",
    directDbt: "நேரடி வங்கி பரிமாற்றம் (DBT)",
    step3Label: "3. கொள்முதல் மையத்தைத் தேர்ந்தெடுக்கவும்:",
    centresAvailable: "மையங்கள் உள்ளன",
    fastQueue: "🟢 விரைவானது",
    normalQueue: "🟡 இயல்பானது",
    busyQueue: "🟠 கூட்டம்",
    waitingCount: "விவசாயிகள் வரிசையில்",
    confirmButton: "✅ டோக்கன் எடுக்கவும் (CONFIRM)",
    todayIssuedSub: "இன்றைய தேதியில் உடனடியாக டோக்கன் வழங்கப்படும்",
    needAssistance: "உதவி தேவையா? (Need Assistance?)",
    callForToken: "போன் செய்து டோக்கன் பெறலாம்",
    freeHelpline: "கிசான் கால் சென்டருக்கு இலவச அழைப்பு",
    callNow: "1800-425-1661 (அழைக்கவும்)",
    managerCall: "மைய மேலாளர்: 9447123456",
    returnBtn: "சாதாரண பயன்முறைக்கு செல்லவும்",
    modalSuccessTitle: "டோக்கன் கிடைத்தது! (Success)",
    modalOkBtn: "சரி, புரிந்தது (OK)",
    modalCancelTitle: "டோக்கனை ரத்து செய்யவா?",
    modalCancelSub: "டோக்கனை ரத்து செய்தால் வரிசையில் இடம் இழக்கப்படும்.",
    modalKeepBtn: "வேண்டாம் (Keep)",
    modalConfirmCancelBtn: "ஆம், ரத்து செய்",
    switchStandard: "சாதாரண பயன்முறைக்கு மாறவும்",
    profileTitle: "விவசாயி சுயவிவரம்",
    aadhaarLinked: "ஆதார் இணைக்கப்பட்ட கணக்கு",
    farmerIdLabel: "விவசாயி ஐடி",
    mobileLabel: "கைபேசி எண்",
    panchayatLabel: "கிராம பஞ்சாயத்து",
    landholdingLabel: "விவசாய நிலம்",
    cropsLabel: "முதன்மை பயிர்கள்",
    bankLabel: "வங்கி கணக்கு",
    ifscLabel: "IFSC குறியீடு",
    bookingsTitle: "என் பதிவுகள் & டோக்கன்கள்",
    noBookings: "பதிவுகள் எதுவும் இல்லை",
    paymentsTitle: "வங்கி ஆதரவு விலை கொடுப்பனவு (DBT)",
    totalReceived: "நேரடியாக வங்கியில் பெறப்பட்ட தொகை",
    dbtVerified: "PFMS வழியாக வங்கிக்கு மாற்றப்பட்டது",
    txnHistory: "பரிவர்த்தனை வரலாறு",
    farmRegistryTitle: "விவசாய பதிவேடு (Farm Registry)",
    farmLandDetail: "2.4 ஏக்கர் (குமரகம்)",
    farmCropsList: "நெல், தேங்காய், ரப்பர்",
    bankSectionTitle: "வங்கி கணக்கு விவரங்கள் (PFMS DBT)",
    bankBranchInfo: "கிளை: திருநக்கரா, கோட்டயம்",
    languageVoiceSub: "போர்டல் மொழி மற்றும் குரலை மாற்றவும் (Language & Voice)",
    listenBtn: "கேட்கவும்",
    successBadge: "வெற்றி",
    paddyProcurement: "நெல் கொள்முதல்",
    coconutProcurement: "தேங்காய் கொள்முதல்",
    tokenCancelledSpeech: "டோக்கன் வெற்றிகரமாக ரத்து செய்யப்பட்டது.",
    activeBadge: "செயலில்",
    doneBadge: "முடிந்தது",
    cancelledBadge: "ரத்து செய்யப்பட்டது",
  },
  te: {
    tabToken: "టోకెన్",
    tabBookings: "బుకింగ్‌లు",
    tabPayments: "చెల్లింపులు",
    tabProfile: "ప్రొఫైల్",
    seniorBadge: "🌾 సులభ కిసాన్ (Easy Access)",
    simpleService: "సరళ సేవ (Accessible Mode)",
    textSize: "అక్షర పరిమాణం:",
    selectLanguage: "భాషను ఎంచుకోండి:",
    listenAloud: "వాయిస్‌లో వినండి",
    stopVoice: "వాయిస్ ఆపండి",
    greeting: "నమస్కారం, రైతు మిత్రమా",
    appTitle: "రైతు క్యూ సహాయకుడు",
    appSub: "పొడవైన వరుసలు లేకుండా సులభంగా టోకెన్ పొందండి",
    activeTokenTitle: "మీ టోకెన్ సక్రియంగా ఉంది (Active)",
    tokenNumberLabel: "మీ టోకెన్ సంఖ్య",
    nowServing: "ప్రస్తుతం పిలుస్తున్న సంఖ్య",
    gateInfo: "(గేట్ 1 వద్ద)",
    aheadOfYou: "మీ ముందు",
    waitMin: "నిమిషాల నిరీక్షణ",
    listenTokenDetails: "ఈ వివరాలను వాయిస్‌లో వినండి",
    getDirections: "మార్గం చూడండి (Map)",
    cancelBtn: "రద్దు చేయండి",
    noTokenTitle: "ప్రస్తుతం మీ వద్ద టోకెన్ లేదు",
    noTokenSub: "కింద పంట, బరువు మరియు కేంద్రాన్ని ఎంచుకుని పచ్చ బటన్ నొక్కండి.",
    step123: "దశ 1, 2 మరియు 3",
    bookNewTokenTitle: "🌾 కొత్త టోకెన్ పొందండి",
    helpVoiceBtn: "సహాయం వినండి",
    step1Label: "1. పంటను ఎంచుకోండి:",
    step2Label: "2. బరువు ఎన్ని కిలోగ్రాములు?:",
    by1kgBadge: "+1 kg చొప్పున పెంచవచ్చు",
    decrease1: "1 కిలో తగ్గించండి (-1 kg)",
    increase1: "1 కిలో పెంచండి (+1 kg)",
    kgLabel: "కిలోగ్రాములు (కేజీ)",
    estimatedPayout: "అంచనా మొత్తం (MSP Bank Credit)",
    directDbt: "నేరుగా బ్యాంక్ ఖాతాకు (DBT)",
    step3Label: "3. కొనుగోలు కేంద్రాన్ని ఎంచుకోండి:",
    centresAvailable: "కేంద్రాలు అందుబాటులో ఉన్నాయి",
    fastQueue: "🟢 వేగంగా",
    normalQueue: "🟡 సాధారణం",
    busyQueue: "🟠 రద్దీ",
    waitingCount: "రైతులు క్యూలో ఉన్నారు",
    confirmButton: "✅ టోకెన్ పొందండి (CONFIRM)",
    todayIssuedSub: "నేటి తేదీలో వెంటనే టోకెన్ సంఖ్య జారీ చేయబడుతుంది",
    needAssistance: "సహాయం కావాలా? (Need Assistance?)",
    callForToken: "ఫోన్ చేసి టోకెన్ పొందండి",
    freeHelpline: "కిసాన్ కాల్ సెంటర్‌కు ఉచిత కాల్ చేయండి",
    callNow: "1800-425-1661 (కాల్ చేయండి)",
    managerCall: "కేంద్ర మేనేజర్: 9447123456",
    returnBtn: "సాధారణ మోడ్‌కు మారండి",
    modalSuccessTitle: "టోకెన్ లభించింది! (Success)",
    modalOkBtn: "సరే, అర్థమైంది (OK)",
    modalCancelTitle: "టోకెన్ రద్దు చేయాలనుకుంటున్నారా?",
    modalCancelSub: "టోకెన్ రద్దు చేస్తే క్యూలో మీ స్థానం కోల్పోతారు.",
    modalKeepBtn: "వద్దు (Keep)",
    modalConfirmCancelBtn: "అవును, రద్దు చేయండి",
    switchStandard: "సాధారణ మోడ్‌కు మారండి",
    profileTitle: "రైతు ప్రొఫైల్",
    aadhaarLinked: "ఆధార్ అనుసంధాన ధృవీకరణ",
    farmerIdLabel: "రైతు ఐడి",
    mobileLabel: "ఫోన్ నంబర్",
    panchayatLabel: "గ్రామ పంచాయతీ",
    landholdingLabel: "వ్యవసాయ భూమి",
    cropsLabel: "ప్రధాన పంటలు",
    bankLabel: "బ్యాంక్ ఖాతా",
    ifscLabel: "IFSC కోడ్",
    bookingsTitle: "నా బుకింగ్‌లు మరియు టోకెన్లు",
    noBookings: "బుకింగ్‌లు ఏవీ కనుగొనబడలేదు",
    paymentsTitle: "మద్దతు ధర చెల్లింపులు (DBT)",
    totalReceived: "బ్యాంక్ ఖాతాలో జమ అయిన మొత్తం",
    dbtVerified: "PFMS ద్వారా నేరుగా బదిలీ",
    txnHistory: "లావాదేవీల చరిత్ర",
    farmRegistryTitle: "వ్యవసాయ వివరాలు (Farm Registry)",
    farmLandDetail: "2.4 ఎకరాలు (కుమరకం)",
    farmCropsList: "వరి, కొబ్బరి, రబ్బరు",
    bankSectionTitle: "బ్యాంక్ ఖాతా వివరాలు (PFMS DBT)",
    bankBranchInfo: "శాఖ: తిరునక్కర, కొట్టాయం",
    languageVoiceSub: "పోర్టల్ భాష మరియు వాయిస్ మార్చండి (Language & Voice)",
    listenBtn: "వినండి",
    successBadge: "విజయవంతం",
    paddyProcurement: "వరి కొనుగోలు",
    coconutProcurement: "కొబ్బరి కొనుగోలు",
    tokenCancelledSpeech: "టోకెన్ విజయవంతంగా రద్దు చేయబడింది.",
    activeBadge: "యాక్టివ్",
    doneBadge: "పూర్తయింది",
    cancelledBadge: "రద్దు చేయబడింది",
  },
  kn: {
    tabToken: "ಟೋಕನ್",
    tabBookings: "ಬುಕಿಂಗ್",
    tabPayments: "ಪಾವತಿ",
    tabProfile: "ಪ್ರೊಫೈಲ್",
    seniorBadge: "🌾 ಸುಲಭ ಕಿಸಾನ್ (Easy Access)",
    simpleService: "ಸರಳ ಸೇವೆ (Accessible Mode)",
    textSize: "ಅಕ್ಷರ ಗಾತ್ರ:",
    selectLanguage: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:",
    listenAloud: "ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ",
    stopVoice: "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ",
    greeting: "ನಮಸ್ಕಾರ, ರೈತ ಮಿತ್ರರೇ",
    appTitle: "ರೈತ ಸರತಿ ಸಾಲು ಸಹಾಯಕ",
    appSub: "ಉದ್ದನೆಯ ಸಾಲುಗಳಿಲ್ಲದೆ ಸುಲಭವಾಗಿ ಟೋಕನ್ ಪಡೆಯಿರಿ",
    activeTokenTitle: "ನಿಮ್ಮ ಟೋಕನ್ ಸಕ್ರಿಯವಾಗಿದೆ (Active)",
    tokenNumberLabel: "ನಿಮ್ಮ ಟೋಕನ್ ಸಂಖ್ಯೆ",
    nowServing: "ಈಗ ಕರೆಯುತ್ತಿರುವ ಸಂಖ್ಯೆ",
    gateInfo: "(ಗೇಟ್ 1 ರಲ್ಲಿ)",
    aheadOfYou: "ನಿಮ್ಮ ಮುಂದೆ",
    waitMin: "ನಿಮಿಷಗಳ ಕಾಯುವಿಕೆ",
    listenTokenDetails: "ಈ ವಿವರಗಳನ್ನು ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ",
    getDirections: "ಮಾರ್ಗ ನೋಡಿ (Map)",
    cancelBtn: "ರದ್ದುಮಾಡಿ",
    noTokenTitle: "ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಬಳಿ ಟೋಕನ್ ಇಲ್ಲ",
    noTokenSub: "ಕೆಳಗೆ ಬೆಳೆ, ತೂಕ ಮತ್ತು ಖರೀದಿ ಕೇಂದ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಹಸಿರು ಬಟನ್ ಒತ್ತಿ.",
    step123: "ಹಂತ 1, 2 ಮತ್ತು 3",
    bookNewTokenTitle: "🌾 ಹೊಸ ಟೋಕನ್ ಪಡೆಯಿರಿ",
    helpVoiceBtn: "ಸಹಾಯ ಆಲಿಸಿ",
    step1Label: "1. ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ:",
    step2Label: "2. ತೂಕ ಎಷ್ಟು ಕಿಲೋಗ್ರಾಂ?:",
    by1kgBadge: "+1 kg ಯಂತೆ ಹೆಚ್ಚಿಸಬಹುದು",
    decrease1: "1 ಕೆಜಿ ಕಡಿಮೆ ಮಾಡಿ (-1 kg)",
    increase1: "1 ಕೆಜಿ ಹೆಚ್ಚಿಸಿ (+1 kg)",
    kgLabel: "ಕಿಲೋಗ್ರಾಂ (ಕೆಜಿ)",
    estimatedPayout: "ಅಂದಾಜು ಮೊತ್ತ (MSP Bank Credit)",
    directDbt: "ನೇರವಾಗಿ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ (DBT)",
    step3Label: "3. ಖರೀದಿ ಕೇಂದ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ:",
    centresAvailable: "ಕೇಂದ್ರಗಳು ಲಭ್ಯವಿದೆ",
    fastQueue: "🟢 ವೇಗವಾಗಿ",
    normalQueue: "🟡 ಸಾಮಾನ್ಯ",
    busyQueue: "🟠 ರದ್ದಿ",
    waitingCount: "ರೈತರು ಸಾಲಿನಲ್ಲಿದ್ದಾರೆ",
    confirmButton: "✅ ಟೋಕನ್ ಪಡೆಯಿರಿ (CONFIRM)",
    todayIssuedSub: "ಇಂದಿನ ದಿನಾಂಕದಲ್ಲಿ ತಕ್ಷಣವೇ ಟೋಕನ್ ನೀಡಲಾಗುವುದು",
    needAssistance: "ಸಹಾಯ ಬೇಕೇ? (Need Assistance?)",
    callForToken: "ಕರೆ ಮಾಡಿ ಟೋಕನ್ ಪಡೆಯಿರಿ",
    freeHelpline: "ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್‌ಗೆ ಉಚಿತ ಕರೆ ಮಾಡಿ",
    callNow: "1800-425-1661 (ಕರೆ ಮಾಡಿ)",
    managerCall: "ಕೇಂದ್ರ ವ್ಯವಸ್ಥಾಪಕ: 9447123456",
    returnBtn: "ಸಾಮಾನ್ಯ ಮೋಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    modalSuccessTitle: "ಟೋಕನ್ ದೊರೆತಿದೆ! (Success)",
    modalOkBtn: "ಸರಿ, ಅರ್ಥವಾಯಿತು (OK)",
    modalCancelTitle: "ಟೋಕನ್ ರದ್ದುಮಾಡಬೇಕೇ?",
    modalCancelSub: "ಟೋಕನ್ ರದ್ದುಮಾಡಿದರೆ ಸರದಿಯಲ್ಲಿ ನಿಮ್ಮ ಸ್ಥಾನ ಕಳೆದುಕೊಳ್ಳುವಿರಿ.",
    modalKeepBtn: "ಬೇಡ (Keep)",
    modalConfirmCancelBtn: "ಹೌದು, ರದ್ದುಮಾಡಿ",
    switchStandard: "ಸಾಮಾನ್ಯ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ",
    profileTitle: "ರೈತ ಪ್ರೊಫೈಲ್",
    aadhaarLinked: "ಆಧಾರ್ ಲಿಂಕ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ",
    farmerIdLabel: "ಕಿಸಾನ್ ಐಡಿ",
    mobileLabel: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    panchayatLabel: "ಗ್ರಾಮ ಪಂಚಾಯತ್",
    landholdingLabel: "ಕೃಷಿ ಜಮೀನು",
    cropsLabel: "ಪ್ರಮುಖ ಬೆಳೆಗಳು",
    bankLabel: "ಬ್ಯಾಂಕ್ ಖಾತೆ",
    ifscLabel: "IFSC ಕೋಡ್",
    bookingsTitle: "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು ಮತ್ತು ಟೋಕನ್‌ಗಳು",
    noBookings: "ಯಾವುದೇ ಬುಕಿಂಗ್ ಲಭ್ಯವಿಲ್ಲ",
    paymentsTitle: "ಬೆಂಬಲ ಬೆಲೆ ಪಾವತಿಗಳು (DBT)",
    totalReceived: "ಖಾತೆಗೆ ನೇರವಾಗಿ ಜಮೆಯಾದ ಮೊತ್ತ",
    dbtVerified: "PFMS ಮೂಲಕ ವರ್ಗಾಯಿಸಲಾಗಿದೆ",
    txnHistory: "ಹಿಂದಿನ ಪಾವತಿಗಳ ವಿವರ",
    farmRegistryTitle: "ಕೃಷಿ ವಿವರಗಳು (Farm Registry)",
    farmLandDetail: "2.4 ಎಕರೆ (ಕುಮರಕಂ)",
    farmCropsList: "ಭತ್ತ, ತೆಂಗಿನಕಾಯಿ, ರಬ್ಬರ್",
    bankSectionTitle: "ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರಗಳು (PFMS DBT)",
    bankBranchInfo: "ಶಾಖೆ: ತಿರುನಕ್ಕರ, ಕೊಟ್ಟಾಯಂ",
    languageVoiceSub: "ಪೋರ್ಟಲ್ ಭಾಷೆ ಮತ್ತು ಧ್ವನಿ ಬದಲಾಯಿಸಿ (Language & Voice)",
    listenBtn: "ಕೇಳಿ",
    successBadge: "ಯಶಸ್ವಿ",
    paddyProcurement: "ಭತ್ತ ಖರೀದಿ",
    coconutProcurement: "ತೆಂಗಿನಕಾಯಿ ಖರೀದಿ",
    tokenCancelledSpeech: "ಟೋಕನ್ ಯಶಸ್ವಿಯಾಗಿ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.",
    activeBadge: "ಸಕ್ರಿಯ",
    doneBadge: "ಪೂರ್ಣಗೊಂಡಿದೆ",
    cancelledBadge: "ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ",
  },
  bn: {
    tabToken: "টোকেন",
    tabBookings: "বুকিং",
    tabPayments: "পেমেন্ট",
    tabProfile: "প্রোফাইল",
    seniorBadge: "🌾 সহজ কিষাণ (Easy Access)",
    simpleService: "সহজ পরিষেবা (Accessible Mode)",
    textSize: "হরফের আকার:",
    selectLanguage: "ভাষা নির্বাচন করুন:",
    listenAloud: "শব্দে শুনুন",
    stopVoice: "শব্দ থামান",
    greeting: "নমস্কার, কৃষক ভাই",
    appTitle: "কিষাণ কিউ সহকারী",
    appSub: "লম্বা লাইন ছাড়াই সহজে টোকেন সংগ্রহ করুন",
    activeTokenTitle: "আপনার টোকেন সক্রিয় আছে (Active)",
    tokenNumberLabel: "আপনার টোকেন নম্বর",
    nowServing: "এখন ডাকা হচ্ছে",
    gateInfo: "(গেট ১-এ)",
    aheadOfYou: "আপনার আগে",
    waitMin: "মিনিট অপেক্ষা",
    listenTokenDetails: "এই তথ্য শব্দে শুনুন",
    getDirections: "মানচিত্র দেখুন (Map)",
    cancelBtn: "বাতিল করুন",
    noTokenTitle: "বর্তমানে আপনার কাছে কোনো টোকেন নেই",
    noTokenSub: "নিচে ফসল, ওজন ও সংগ্রহ কেন্দ্র বেছে নিয়ে সবুজ বোতাম টিপুন।",
    step123: "ধাপ ১, ২ এবং ৩",
    bookNewTokenTitle: "🌾 নতুন টোকেন নিন",
    helpVoiceBtn: "সাহায্য শুনুন",
    step1Label: "১. ফসল নির্বাচন করুন:",
    step2Label: "২. ওজন কত কিলোগ্রাম?:",
    by1kgBadge: "+১ kg করে বাড়ানো যাবে",
    decrease1: "১ কেজি কমান (-১ kg)",
    increase1: "১ কেজি বাড়ান (+১ kg)",
    kgLabel: "কিলোগ্রাম (কেজি)",
    estimatedPayout: "আনুমানিক মোট টাকা (MSP Bank Transfer)",
    directDbt: "সরাসরি ব্যাংক অ্যাকাউন্টে (DBT)",
    step3Label: "৩. সংগ্রহ কেন্দ্র নির্বাচন করুন:",
    centresAvailable: "কেন্দ্র উপলব্ধ আছে",
    fastQueue: "🟢 দ্রুত গতি",
    normalQueue: "🟡 স্বাভাবিক",
    busyQueue: "🟠 ভিড়",
    waitingCount: "জন কৃষক লাইনে আছেন",
    confirmButton: "✅ টোকেন নিন (CONFIRM)",
    todayIssuedSub: "আজকের তারিখে অবিলম্বে টোকেন নম্বর জারি হবে",
    needAssistance: "সাহায্য প্রয়োজন? (Need Assistance?)",
    callForToken: "ফোন করে টোকেন নিন",
    freeHelpline: "কিষাণ কল সেন্টারে টোল-ফ্রি কল করুন",
    callNow: "1800-425-1661 (কল করুন)",
    managerCall: "কেন্দ্র ম্যানেজার: 9447123456",
    returnBtn: "সাধারণ মোডে ফিরে যান",
    modalSuccessTitle: "টোকেন পাওয়া গেছে! (Success)",
    modalOkBtn: "ঠিক আছে, বুঝেছি (OK)",
    modalCancelTitle: "টোকেন বাতিল করতে চান?",
    modalCancelSub: "টোকেন বাতিল করলে লাইনে আপনার স্থান নষ্ট হবে।",
    modalKeepBtn: "না (Keep)",
    modalConfirmCancelBtn: "হ্যাঁ, বাতিল করুন",
    switchStandard: "সাধারণ মোডে যান",
    profileTitle: "কৃষক প্রোফাইল",
    aadhaarLinked: "আধার যুক্ত ব্যাংক হিসাব",
    farmerIdLabel: "কিষাণ আইডি",
    mobileLabel: "মোবাইল নম্বর",
    panchayatLabel: "গ্রাম পঞ্চায়েত",
    landholdingLabel: "কৃষিজমি",
    cropsLabel: "প্রধান ফসল",
    bankLabel: "ব্যাংক অ্যাকাউন্ট",
    ifscLabel: "আইএফএসসি কোড",
    bookingsTitle: "আমার বুকিং ও টোকেন",
    noBookings: "কোনো বুকিং পাওয়া যায়নি",
    paymentsTitle: "সহায়তা মূল্য ব্যাংক পেমেন্ট (DBT)",
    totalReceived: "ব্যাংক অ্যাকাউন্টে প্রাপ্ত মোট অর্থ",
    dbtVerified: "PFMS মারফত সরাসরি স্থানান্তর",
    txnHistory: "লেনদেন ইতিহাস",
    farmRegistryTitle: "কৃষি বিবরণ (Farm Registry)",
    farmLandDetail: "2.4 একর (কুমরকম)",
    farmCropsList: "ধান, নারকেল, রবার",
    bankSectionTitle: "ব্যাংক অ্যাকাউন্ট বিবরণ (PFMS DBT)",
    bankBranchInfo: "শাখা: তিরুনাক্কারা, কোট্টায়াম",
    languageVoiceSub: "পোর্টাল ভাষা ও ভয়েস পরিবর্তন করুন (Language & Voice)",
    listenBtn: "শুনুন",
    successBadge: "সফল",
    paddyProcurement: "ধান সংগ্রহ",
    coconutProcurement: "নারকেল সংগ্রহ",
    tokenCancelledSpeech: "টোকেন সফলভাবে বাতিল করা হয়েছে।",
    activeBadge: "সক্রিয়",
    doneBadge: "সম্পন্ন",
    cancelledBadge: "বাতিল",
  },
  mr: {
    tabToken: "टोकन",
    tabBookings: "बुकिंग",
    tabPayments: "पेमेंट",
    tabProfile: "प्रोफाइल",
    seniorBadge: "🌾 सुलभ किसान (Easy Access)",
    simpleService: "सरल सेवा (Accessible Mode)",
    textSize: "अक्षरांचा आकार:",
    selectLanguage: "भाषा निवडा:",
    listenAloud: "आवाजात ऐका",
    stopVoice: "आवाज थांबवा",
    greeting: "नमस्कार, शेतकरी मित्र",
    appTitle: "किसान रांग मदतनीस",
    appSub: "लांब रांगांशिवाय सहज टोकन मिळवा",
    activeTokenTitle: "तुमचा टोकन सक्रिय आहे (Active)",
    tokenNumberLabel: "तुमचा टोकन नंबर",
    nowServing: "सध्या सुरू असलेला नंबर",
    gateInfo: "(गेट १ वर)",
    aheadOfYou: "तुमच्या पुढे",
    waitMin: "मिनिटे प्रतीक्षा",
    listenTokenDetails: "ही माहिती आवाजात ऐका",
    getDirections: "मार्ग पहा (Map)",
    cancelBtn: "रद्द करा",
    noTokenTitle: "सध्या तुमच्याकडे टोकन नाही",
    noTokenSub: "खाली पीक, वजन आणि खरेदी केंद्र निवडून हिरवे बटण दाबा.",
    step123: "पायरी १, २ आणि ३",
    bookNewTokenTitle: "🌾 नवीन टोकन मिळवा",
    helpVoiceBtn: "मदत ऐका",
    step1Label: "१. पीक निवडा:",
    step2Label: "२. वजन किती किलोग्रॅम?:",
    by1kgBadge: "+१ kg प्रमाणे वाढवू शकता",
    decrease1: "१ किलो कमी करा (-१ kg)",
    increase1: "१ किलो वाढवा (+१ kg)",
    kgLabel: "किलोग्रॅम (किलो)",
    estimatedPayout: "अंदाजे रक्कम (MSP Bank Transfer)",
    directDbt: "थेट बँक खात्यात (DBT)",
    step3Label: "३. खरेदी केंद्र निवडा:",
    centresAvailable: "खरेदी केंद्रे उपलब्ध आहेत",
    fastQueue: "🟢 जलद गती",
    normalQueue: "🟡 सामान्य",
    busyQueue: "🟠 गर्दी",
    waitingCount: "शेतकरी रांगेत",
    confirmButton: "✅ टोकन मिळवा (CONFIRM)",
    todayIssuedSub: "आजच्या तारखेत लगेच टोकन नंबर जारी केला जाईल",
    needAssistance: "मदत हवी आहे? (Need Assistance?)",
    callForToken: "फोन करून टोकन मिळवा",
    freeHelpline: "किसान कॉल सेंटरवर मोफत कॉल करा",
    callNow: "1800-425-1661 (कॉल करा)",
    managerCall: "केंद्र व्यवस्थापक: 9447123456",
    returnBtn: "सामान्य मोडवर जा",
    modalSuccessTitle: "टोकन मिळाले! (Success)",
    modalOkBtn: "ठीक आहे, समजले (OK)",
    modalCancelTitle: "टोकन रद्द करायचे आहे का?",
    modalCancelSub: "टोकन रद्द केल्यास रांगेतील स्थान समाप्त होईल.",
    modalKeepBtn: "नको (Keep)",
    modalConfirmCancelBtn: "होय, रद्द करा",
    switchStandard: "सामान्य मोडवर जा",
    profileTitle: "शेतकरी प्रोफाइल",
    aadhaarLinked: "आधार लिंक बँक खाते",
    farmerIdLabel: "किसान आयडी",
    mobileLabel: "मोबाईल नंबर",
    panchayatLabel: "ग्रामपंचायत",
    landholdingLabel: "शेती जमीन",
    cropsLabel: "प्रमुख पिके",
    bankLabel: "बँक खाते",
    ifscLabel: "आयएफएससी कोड",
    bookingsTitle: "माझे टोकन्स आणि बुकिंग्ज",
    noBookings: "कोणतेही बुकिंग उपलब्ध नाही",
    paymentsTitle: "हमीभाव बँक जमा रक्कम (DBT)",
    totalReceived: "थेट खात्यात प्राप्त झालेली रक्कम",
    dbtVerified: "PFMS द्वारे थेट हस्तांतरित",
    txnHistory: "मागील व्यवहार",
    farmRegistryTitle: "शेती तपशील (Farm Registry)",
    farmLandDetail: "2.4 एकर (कुमरकम)",
    farmCropsList: "भात, नारळ, रबर",
    bankSectionTitle: "बँक खाते तपशील (PFMS DBT)",
    bankBranchInfo: "शाखा: तिरुनक्करा, कोट्टायम",
    languageVoiceSub: "पोर्टल भाषा आणि आवाज बदला (Language & Voice)",
    listenBtn: "ऐका",
    successBadge: "यशस्वी",
    paddyProcurement: "भात खरेदी",
    coconutProcurement: "नारळ खरेदी",
    tokenCancelledSpeech: "टोकन यशस्वीपणे रद्द केले आहे.",
    activeBadge: "सक्रिय",
    doneBadge: "पूर्ण",
    cancelledBadge: "रद्द",
  },
  en: {
    tabToken: "Token",
    tabBookings: "Bookings",
    tabPayments: "Payments",
    tabProfile: "Profile",
    seniorBadge: "🌾 Easy Access Mode",
    simpleService: "Large Text & Audio Guidance",
    textSize: "Text Size:",
    selectLanguage: "Select Language:",
    listenAloud: "Listen Aloud",
    stopVoice: "Stop Audio",
    greeting: "Hello, Respected Farmer",
    appTitle: "KisanQueue Easy Assistant",
    appSub: "Get slot tokens easily without standing in physical queues",
    activeTokenTitle: "Your Active Token",
    tokenNumberLabel: "Your Token Number",
    nowServing: "Now Serving",
    gateInfo: "(At Gate 1)",
    aheadOfYou: "Ahead of You",
    waitMin: "min wait",
    listenTokenDetails: "Read details aloud",
    getDirections: "Get Directions (Map)",
    cancelBtn: "Cancel Token",
    noTokenTitle: "You currently have no active token",
    noTokenSub: "Select your crop, quantity in kilograms, and centre below, then tap the green button.",
    step123: "Step 1, 2 & 3",
    bookNewTokenTitle: "🌾 Book a New Slot Token",
    helpVoiceBtn: "Listen Help",
    step1Label: "1. Select Harvest Crop:",
    step2Label: "2. Quantity in Kilograms (kg):",
    by1kgBadge: "+1 kg adjustment",
    decrease1: "Decrease 1 kg (-1 kg)",
    increase1: "Increase 1 kg (+1 kg)",
    kgLabel: "Kilograms (kg)",
    estimatedPayout: "Estimated Bank Credit (MSP Direct Payment)",
    directDbt: "Direct Benefit Transfer (DBT)",
    step3Label: "3. Select Procurement Centre:",
    centresAvailable: "Centres Available",
    fastQueue: "🟢 Fast Flow",
    normalQueue: "🟡 Normal",
    busyQueue: "🟠 Busy",
    waitingCount: "farmers in queue",
    confirmButton: "✅ BOOK TOKEN NOW (CONFIRM)",
    todayIssuedSub: "Token pass is issued immediately for today's date",
    needAssistance: "Need Assistance?",
    callForToken: "Call by phone to book a token",
    freeHelpline: "Call Kisan Call Centre Toll-Free",
    callNow: "1800-425-1661 (Call Now)",
    managerCall: "Centre Manager: 9447123456",
    returnBtn: "Switch to Standard View",
    modalSuccessTitle: "Token Booked! (Success)",
    modalOkBtn: "OK, Understood",
    modalCancelTitle: "Cancel this token?",
    modalCancelSub: "Cancelling will release your place in the live queue.",
    modalKeepBtn: "Keep Token",
    modalConfirmCancelBtn: "Yes, Cancel Token",
    switchStandard: "Switch to Standard View",
    profileTitle: "Farmer Profile",
    aadhaarLinked: "Aadhaar Linked & Verified",
    farmerIdLabel: "Farmer ID",
    mobileLabel: "Mobile Number",
    panchayatLabel: "Village Panchayat",
    landholdingLabel: "Agricultural Land",
    cropsLabel: "Primary Crops",
    bankLabel: "Bank Account",
    ifscLabel: "IFSC Code",
    bookingsTitle: "My Bookings & Digital Passes",
    noBookings: "No bookings found",
    paymentsTitle: "Direct MSP Bank Settlements (DBT)",
    totalReceived: "Total MSP Settled Directly to Bank",
    dbtVerified: "PFMS Direct Benefit Transfer Verified",
    txnHistory: "Settlement History",
    farmRegistryTitle: "Farm Registry Details",
    farmLandDetail: "2.4 Acres (Kumarakom)",
    farmCropsList: "Paddy, Coconut, Rubber",
    bankSectionTitle: "Bank Account Details (PFMS DBT)",
    bankBranchInfo: "Branch: Thirunakkara, Kottayam",
    languageVoiceSub: "Select portal language and audio voice",
    listenBtn: "Listen",
    successBadge: "Success",
    paddyProcurement: "Paddy Procurement",
    coconutProcurement: "Raw Coconut Procurement",
    tokenCancelledSpeech: "Token has been cancelled successfully.",
    activeBadge: "Active",
    doneBadge: "Completed",
    cancelledBadge: "Cancelled",
  },
};

// Multilingual centre names
function getCentreTranslatedName(centreName: string, lang: Language) {
  const isKtm = centreName.includes("Kottayam");
  const isPala = centreName.includes("Pala");
  const isCgry = centreName.includes("Changanassery");
  const isAlpy = centreName.includes("Alappuzha");

  const titles: Record<string, Record<Language, string>> = {
    ktm: {
      ml: "കോട്ടയം സംഭരണ കേന്ദ്രം",
      hi: "कोट्टायम खरीद केंद्र",
      ta: "கோட்டயம் கொள்முதல் மையம்",
      te: "కొట్టాయం కొనుగోలు కేంద్రం",
      kn: "ಕೊಟ್ಟಾಯಂ ಖರೀದಿ ಕೇಂದ್ರ",
      bn: "কোট্টায়াম সংগ্রহ কেন্দ্র",
      mr: "कोट्टायम खरेदी केंद्र",
      en: "Kottayam Procurement Centre",
    },
    pala: {
      ml: "പാലാ സംഭരണ കേന്ദ്രം",
      hi: "पाला खरीद केंद्र",
      ta: "பாலா கொள்முதல் மையம்",
      te: "పాలా కొనుగోలు కేంద్రం",
      kn: "ಪಾಲಾ ಖರೀದಿ ಕೇಂದ್ರ",
      bn: "পালা সংগ্রহ কেন্দ্র",
      mr: "पाला खरेदी केंद्र",
      en: "Pala Procurement Centre",
    },
    cgry: {
      ml: "ചങ്ങനാശ്ശേരി സംഭരണ കേന്ദ്രം",
      hi: "चंगनास्सेरी खरीद केंद्र",
      ta: "சங்கனாச்சேரி கொள்முதல் மையம்",
      te: "చంగనాస్సేరి కొనుగోలు కేంద్రం",
      kn: "ಚಂಗನಾಶ್ಶೇರಿ ಖರೀದಿ ಕೇಂದ್ರ",
      bn: "চঙ্গনাচেরি সংগ্রহ কেন্দ্র",
      mr: "चंगनास्सेरी खरेदी केंद्र",
      en: "Changanassery Procurement Centre",
    },
    alpy: {
      ml: "ആലപ്പുഴ സംഭരണ കേന്ദ്രം",
      hi: "अलप्पुझा खरीद केंद्र",
      ta: "ஆலப்புழா கொள்முதல் மையம்",
      te: "ఆలప్పుళా కొనుగోలు కేంద్రం",
      kn: "ಆಲಪ್ಪುಳ ಖರೀದಿ ಕೇಂದ್ರ",
      bn: "আলাপ্পুঝা সংগ্রহ কেন্দ্র",
      mr: "अलप्पुळा खरेदी केंद्र",
      en: "Alappuzha Procurement Centre",
    },
  };

  const key = isKtm ? "ktm" : isPala ? "pala" : isCgry ? "cgry" : isAlpy ? "alpy" : null;
  if (key && titles[key]?.[lang]) {
    return titles[key][lang];
  }
  return centreName;
}

// Spoken greetings when changing language
const LANG_WELCOME: Record<Language, string> = {
  ml: "മലയാളം തിരഞ്ഞെടുത്തു. സുഗമ കിസാൻ സേവനത്തിലേക്ക് സ്വാഗതം.",
  hi: "हिन्दी चुनी गई है। सुगम किसान सेवा में आपका स्वागत है।",
  ta: "தமிழ் தேர்ந்தெடுக்கப்பட்டது. எளிய விவசாயி சேவைக்கு வருக.",
  te: "తెలుగు ఎంపిక చేయబడింది. సులభ కిసాన్ సేవకు స్వాగతం.",
  kn: "ಕನ್ನಡ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ. ಸುಲಭ ಕಿಸಾನ್ ಸೇವೆಗೆ ಸುಸ್ವಾಗತ.",
  bn: "বাংলা নির্বাচিত হয়েছে। সহজ কৃষক সেবায় স্বাগতম।",
  mr: "मराठी निवडली आहे. सुलभ किसान सेवेत आपले स्वागत आहे.",
  en: "English selected. Welcome to KisanQueue Accessible Assistance.",
};

// Voice speech announcement generator for crop selection
function getCropAnnouncement(crop: (typeof CROP_ITEMS)[0], lang: Language) {
  const cropName = crop.names[lang] || crop.names.en;
  switch (lang) {
    case "ml":
      return `${cropName}, കിലോയ്ക്ക് ${crop.msp} രൂപ താങ്ങുവില.`;
    case "hi":
      return `${cropName}, ${crop.msp} रुपये प्रति किलो समर्थन मूल्य।`;
    case "ta":
      return `${cropName}, கிலோவுக்கு ${crop.msp} ரூபாய் ஆதரவு விலை.`;
    case "te":
      return `${cropName}, కిలోకు ${crop.msp} రూపాయల మద్దతు ధర.`;
    case "kn":
      return `${cropName}, ಪ್ರತಿ ಕೆಜಿಗೆ ${crop.msp} ರೂಪಾಯಿ ಬೆಂಬಲ ಬೆಲೆ.`;
    case "bn":
      return `${cropName}, প্রতি কেজি ${crop.msp} টাকা সহায়ক মূল্য।`;
    case "mr":
      return `${cropName}, प्रति किलो ${crop.msp} रुपये हमीभाव.`;
    default:
      return `${cropName}, Minimum Support Price ${crop.msp} rupees per kilogram.`;
  }
}

// Voice speech announcement generator for procurement centre selection
function getCentreAnnouncement(centreTitle: string, distanceKm: number, queueCount: number, lang: Language) {
  switch (lang) {
    case "ml":
      return `${centreTitle} തിരഞ്ഞെടുത്തു. ദൂരം ${distanceKm} കിലോമീറ്റർ. ക്യൂവിൽ ${queueCount} കർഷകർ.`;
    case "hi":
      return `${centreTitle} चुना गया। दूरी ${distanceKm} किलोमीटर। कतार में ${queueCount} किसान हैं।`;
    case "ta":
      return `${centreTitle} தேர்ந்தெடுக்கப்பட்டது. தொலைவு ${distanceKm} கிலோமீட்டர். வரிசையில் ${queueCount} விவசாயிகள்.`;
    case "te":
      return `${centreTitle} ఎంపిక చేయబడింది. దూరం ${distanceKm} కిలోమీటర్లు. క్యూలో ${queueCount} మంది రైతులు.`;
    case "kn":
      return `${centreTitle} ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ. ದೂರ ${distanceKm} ಕಿಲೋಮೀಟರ್. ಸಾಲಿನಲ್ಲಿ ${queueCount} ರೈತರು.`;
    case "bn":
      return `${centreTitle} নির্বাচিত হয়েছে। দূরত্ব ${distanceKm} কিলোমিটার। সারিতে ${queueCount} জন কৃষক আছেন।`;
    case "mr":
      return `${centreTitle} निवडले. अंतर ${distanceKm} किलोमीटर. रांगेत ${queueCount} शेतकरी आहेत.`;
    default:
      return `${centreTitle} selected. Distance ${distanceKm} kilometers. ${queueCount} farmers currently in queue.`;
  }
}

// Voice speech announcement generator for active token
function getActiveTokenSpeech(
  tokenNumber: number,
  centreTitle: string,
  nowServing: number,
  farmersAhead: number,
  waitMinutes: number,
  lang: Language
) {
  switch (lang) {
    case "ml":
      return `നിങ്ങളുടെ ടോക്കൺ നമ്പർ ${tokenNumber} ആണ്. കേന്ദ്രം: ${centreTitle}. ഇപ്പോൾ വിളിക്കുന്നത് ${nowServing}. നിങ്ങളുടെ മുന്നിൽ ${farmersAhead} കർഷകരുണ്ട്. പ്രതീക്ഷിക്കുന്ന കാത്തിരിപ്പ് സമയം ${waitMinutes} മിനിറ്റ്.`;
    case "hi":
      return `आपका टोकन नंबर ${tokenNumber} है। खरीद केंद्र: ${centreTitle}। अभी टोकन नंबर ${nowServing} बुलाया जा रहा है। आपके आगे ${farmersAhead} किसान हैं। अनुमानित प्रतीक्षा समय ${waitMinutes} मिनट है।`;
    case "ta":
      return `உங்கள் டோக்கன் எண் ${tokenNumber}. கொள்முதல் மையம்: ${centreTitle}. இப்போது அழைக்கப்படும் எண் ${nowServing}. உங்கள் முன் ${farmersAhead} விவசாயிகள் உள்ளனர். காத்திருப்பு நேரம் சுமார் ${waitMinutes} நிமிடங்கள்.`;
    case "te":
      return `మీ టోకెన్ సంఖ్య ${tokenNumber}. కొనుగోలు కేంద్రం: ${centreTitle}. ప్రస్తుతం పిలుస్తున్న సంఖ్య ${nowServing}. మీ ముందు ${farmersAhead} మంది రైతులు ఉన్నారు. నిరీక్షణ సమయం ${waitMinutes} నిమిషాలు.`;
    case "kn":
      return `ನಿಮ್ಮ ಟೋಕನ್ ಸಂಖ್ಯೆ ${tokenNumber}. ಖರೀದಿ ಕೇಂದ್ರ: ${centreTitle}. ಈಗ ಕರೆಯುತ್ತಿರುವ ಸಂಖ್ಯೆ ${nowServing}. ನಿಮ್ಮ ಮುಂದೆ ${farmersAhead} ರೈತರಿದ್ದಾರೆ. ಕಾಯುವ ಸಮಯ ${waitMinutes} ನಿಮಿಷಗಳು.`;
    case "bn":
      return `আপনার টোকেন নম্বর ${tokenNumber}। সংগ্রহ কেন্দ্র: ${centreTitle}। এখন ডাকা হচ্ছে নম্বর ${nowServing}। আপনার সামনে ${farmersAhead} জন কৃষক আছেন। অপেক্ষার সময় ${waitMinutes} মিনিট।`;
    case "mr":
      return `तुमचा टोकन नंबर ${tokenNumber} आहे. खरेदी केंद्र: ${centreTitle}. सध्या सुरू असलेला नंबर ${nowServing}. तुमच्या पुढे ${farmersAhead} शेतकरी आहेत. अंदाजे प्रतीक्षा वेळ ${waitMinutes} मिनिटे.`;
    default:
      return `Your Token Number is ${tokenNumber} at ${centreTitle}. Currently serving number is ${nowServing}. There are ${farmersAhead} farmers ahead of you. Estimated wait is ${waitMinutes} minutes.`;
  }
}

// Voice speech announcement generator for single booking pass
function getSingleBookingSpeech(
  b: Booking,
  centreTitle: string,
  cropName: string,
  lang: Language
) {
  switch (lang) {
    case "ml":
      return `ടോക്കൺ #${b.queueNumber}. ${centreTitle}. വിള: ${cropName}, ${b.quantityKg} കിലോ. തീയതി: ${b.date}.`;
    case "hi":
      return `टोकन #${b.queueNumber}। ${centreTitle}। फसल: ${cropName}, ${b.quantityKg} किलो। तारीख: ${b.date}।`;
    case "ta":
      return `டோக்கன் #${b.queueNumber}. ${centreTitle}. பயிர்: ${cropName}, ${b.quantityKg} கிலோ. தேதி: ${b.date}.`;
    case "te":
      return `టోకెన్ #${b.queueNumber}. ${centreTitle}. పంట: ${cropName}, ${b.quantityKg} కిలోలు. తేదీ: ${b.date}.`;
    case "kn":
      return `ಟೋಕನ್ #${b.queueNumber}. ${centreTitle}. ಬೆಳೆ: ${cropName}, ${b.quantityKg} ಕೆಜಿ. ದಿನಾಂಕ: ${b.date}.`;
    case "bn":
      return `টোকেন #${b.queueNumber}। ${centreTitle}। ফসল: ${cropName}, ${b.quantityKg} কেজি। তারিখ: ${b.date}।`;
    case "mr":
      return `टोकन #${b.queueNumber}. ${centreTitle}. पीक: ${cropName}, ${b.quantityKg} किलो. दिनांक: ${b.date}.`;
    default:
      return `Token #${b.queueNumber} at ${centreTitle} for ${cropName}, ${b.quantityKg} kilograms on ${b.date}.`;
  }
}

// Helper to split long speech text into concise chunks (<130 chars) along sentence boundaries
function splitSpeechChunks(text: string, maxLen: number = 130): string[] {
  if (!text) return [];
  const rawSentences = text
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
  return chunks.length > 0 ? chunks : [text.slice(0, maxLen)];
}

function SeniorCitizenModePage() {
  const navigate = useNavigate();
  const queueContext = useKisanQueue();
  const user = queueContext?.user;
  const language = queueContext?.language || "ml";
  const setLanguage = queueContext?.setLanguage;
  const activeBooking = queueContext?.activeBooking;
  const bookings = Array.isArray(queueContext?.bookings) ? queueContext.bookings : [];
  const nowServing = queueContext?.nowServing ?? 40;
  const predictWaitingTime = queueContext?.predictWaitingTime;
  const centres = Array.isArray(queueContext?.centres) && queueContext.centres.length > 0 ? queueContext.centres : [];
  const bookSlot = queueContext?.bookSlot;
  const cancelBooking = queueContext?.cancelBooking;
  const logout = queueContext?.logout;

  const fallbackCentre: ProcurementCentre = {
    id: "centre-ktm",
    name: "Kottayam Procurement Centre",
    district: "Kottayam",
    location: "Near Nagampadam Bus Station, Kottayam",
    distanceKm: 2.4,
    workingHours: "08:30 AM – 04:30 PM",
    dailyCapacityKg: 25000,
    todayBookingsCount: 142,
    currentQueueLength: 12,
    avgProcessingMinutes: 6,
    activeDelayMinutes: 0,
    status: "normal",
    slots: [],
  };

  const safeCentres = centres.length > 0 ? centres : [fallbackCentre];
  const safeUser = (user && user.name && user.name !== "Guest Farmer") ? user : {
    id: user?.id || "usr-01",
    name: user?.name || "Farmer",
    role: "farmer" as const,
    mobile: user?.mobile || "+91 94470 12345",
    farmerId: user?.farmerId && user.farmerId !== "GUEST" ? user.farmerId : "KL-KTM-00000",
    village: user?.village || "Kumarakom",
    district: user?.district || "Kottayam",
    primaryCrop: user?.primaryCrop || "Paddy (നെല്ല്)",
    bankAccount: user?.bankAccount || "State Bank of India **** 4891",
    ifsc: user?.ifsc || "SBIN0070123",
  };

  // Active tab state
  const [currentTab, setCurrentTab] = useState<SeniorTab>("token");

  // Accessibility state
  const [fontScale, setFontScale] = useState<"normal" | "large" | "huge">("large");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string>("");

  // Refs for seamless audio queue playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechQueueRef = useRef<string[]>([]);
  const speechIndexRef = useRef<number>(0);
  const activeLangRef = useRef<Language>("ml");

  // Booking selection state
  const [selectedCrop, setSelectedCrop] = useState(
    CROP_ITEMS[0] || { id: "paddy", names: { en: "Paddy", ml: "നെല്ല്" }, msp: 32, unit: "kg" }
  );
  const [quantity, setQuantity] = useState<number>(100);
  const [selectedCentre, setSelectedCentre] = useState<ProcurementCentre>(safeCentres[0] || fallbackCentre);

  const [bookingSuccessModal, setBookingSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const activeCentreForDisplay =
    (activeBooking ? safeCentres.find((c) => c.id === activeBooking.centreId) : null) ||
    selectedCentre ||
    safeCentres[0] ||
    fallbackCentre;

  let prediction = { timeStr: "Immediate", minutesLeft: 0, delayMinutes: 0 };
  if (activeBooking && typeof predictWaitingTime === "function") {
    try {
      const p = predictWaitingTime(
        activeBooking.centreId || selectedCentre?.id || "centre-ktm",
        activeBooking.queueNumber || 40
      );
      if (p) prediction = p;
    } catch {
      // Graceful fallback
    }
  }

  const farmersAhead = activeBooking
    ? Math.max(0, (activeBooking.queueNumber || 0) - (nowServing || 0))
    : 0;

  const currentLang: Language = (language && UI_TEXTS[language]) ? language : "ml";
  const ui = UI_TEXTS[currentLang] || UI_TEXTS.ml || UI_TEXTS.en;

  // Immediate audio stopper
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
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setIsSpeaking(false);
    setSpeechNotice("");
  };

  // Browser Web Speech API fallback (only activated if network audio fails or offline)
  const tryWebSpeechFallback = (remainingText: string, lang: Language) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setTimeout(() => {
        setIsSpeaking(false);
        setSpeechNotice("");
      }, 3000);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(remainingText);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;

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
      const targetCode = bcpMap[lang] || "en-IN";
      utterance.lang = targetCode;

      const voices = window.speechSynthesis.getVoices();
      const matched = voices.find(
        (v) =>
          v.lang.toLowerCase().replace("_", "-").startsWith(targetCode.toLowerCase()) ||
          v.lang.toLowerCase().startsWith(lang.toLowerCase())
      );

      // ONLY use browser voice if it actually supports this language (never pronounce Malayalam in English voice)
      if (matched || lang === "en") {
        if (matched) utterance.voice = matched;
        utterance.onend = () => {
          setIsSpeaking(false);
          setSpeechNotice("");
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          setSpeechNotice("");
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => {
          setIsSpeaking(false);
          setSpeechNotice("");
        }, 3500);
      }
    } catch {
      setIsSpeaking(false);
      setSpeechNotice("");
    }
  };

  // High-fidelity multilingual audio engine supporting all 8 Indian languages
  const speakInLanguage = (text: string, langToUse?: Language) => {
    if (!text || typeof window === "undefined") return;

    // Toggle off if user clicked the same speech button while it is active
    if (isSpeaking && speechNotice === text) {
      stopAudio();
      return;
    }

    // Stop previous audio before starting new announcement
    stopAudio();

    const targetLang: Language = langToUse || language || "ml";
    activeLangRef.current = targetLang;

    const chunks = splitSpeechChunks(text, 130);
    if (chunks.length === 0) return;

    speechQueueRef.current = chunks;
    speechIndexRef.current = 0;
    setIsSpeaking(true);
    setSpeechNotice(text);

    const playNextChunk = (idx: number) => {
      if (idx >= speechQueueRef.current.length) {
        setIsSpeaking(false);
        setSpeechNotice("");
        if (audioRef.current) {
          audioRef.current = null;
        }
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
        // Fallback to local /api/tts endpoint
        try {
          const fallbackAudio = document.createElement("audio");
          fallbackAudio.src = `/api/tts?tl=${encodeURIComponent(targetLang)}&text=${encodeURIComponent(chunkText)}`;
          audioRef.current = fallbackAudio;

          fallbackAudio.onended = () => {
            playNextChunk(idx + 1);
          };

          fallbackAudio.onerror = () => {
            tryWebSpeechFallback(speechQueueRef.current.slice(idx).join(" "), targetLang);
          };

          fallbackAudio.play().catch(() => {
            tryWebSpeechFallback(speechQueueRef.current.slice(idx).join(" "), targetLang);
          });
        } catch {
          tryWebSpeechFallback(speechQueueRef.current.slice(idx).join(" "), targetLang);
        }
      };

      audio.play().catch(() => {
        tryWebSpeechFallback(speechQueueRef.current.slice(idx).join(" "), targetLang);
      });
    };

    playNextChunk(0);
  };

  // Preload voices and clean up audio on unmount
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    return () => {
      stopAudio();
    };
  }, []);

  // Handle language switch with audio confirmation in the newly selected language
  const handleLanguageChange = (newLang: Language) => {
    if (typeof setLanguage === "function") {
      setLanguage(newLang);
    }
    const welcomeMsg = LANG_WELCOME[newLang] || LANG_WELCOME.en;
    speakInLanguage(welcomeMsg, newLang);
  };

  // Handle instant 1-tap booking
  const handleInstantBook = () => {
    if (typeof bookSlot !== "function") return;
    const todayStr = "Today";
    const slotStr = "Immediate Slot";

    const newBooking = bookSlot(
      selectedCentre?.id || "centre-ktm",
      selectedCrop?.names?.en || "Paddy",
      quantity,
      todayStr,
      slotStr
    );

    if (!newBooking) return;
    setBookingSuccessModal(true);

    const centreTitle = getCentreTranslatedName(selectedCentre.name, language);
    const cropName = (selectedCrop.names as Record<string, string>)[language] || selectedCrop.names.en || selectedCrop.id;

    let confirmationSpeech = "";
    switch (language) {
      case "ml":
        confirmationSpeech = `നിങ്ങളുടെ ടോക്കൺ നമ്പർ ${newBooking.queueNumber} വിജയകരമായി എടുത്തു. കേന്ദ്രം: ${centreTitle}. വിള: ${cropName}, ${quantity} കിലോ. ഇപ്പോൾ വിളിക്കുന്നത് ${nowServing}. നിങ്ങളുടെ ഊഴത്തിനായി കാത്തിരിക്കുക.`;
        break;
      case "hi":
        confirmationSpeech = `आपका टोकन नंबर ${newBooking.queueNumber} सफलतापूर्वक बुक हो गया है। केंद्र: ${centreTitle}। फसल: ${cropName}, ${quantity} किलो। अभी टोकन ${nowServing} बुलाया जा रहा है।`;
        break;
      case "ta":
        confirmationSpeech = `உங்கள் டோக்கன் எண் ${newBooking.queueNumber} வெற்றிகரமாக பதிவு செய்யப்பட்டது. மையம்: ${centreTitle}. பயிர்: ${cropName}, ${quantity} கிலோ. இப்போது அழைக்கப்படுவது ${nowServing}.`;
        break;
      case "te":
        confirmationSpeech = `మీ టోకెన్ సంఖ్య ${newBooking.queueNumber} విజయవంతంగా బుక్ చేయబడింది. కేంద్రం: ${centreTitle}. పంట: ${cropName}, ${quantity} కిలోలు. ప్రస్తుతం పిలుస్తున్న సంఖ్య ${nowServing}.`;
        break;
      case "kn":
        confirmationSpeech = `ನಿಮ್ಮ ಟೋಕನ್ ಸಂಖ್ಯೆ ${newBooking.queueNumber} ಯಶಸ್ವಿಯಾಗಿ ಬುಕ್ ಆಗಿದೆ. ಕೇಂದ್ರ: ${centreTitle}. ಬೆಳೆ: ${cropName}, ${quantity} ಕೆಜಿ. ಈಗ ಕರೆಯುತ್ತಿರುವ ಸಂಖ್ಯೆ ${nowServing}.`;
        break;
      case "bn":
        confirmationSpeech = `আপনার টোকেন নম্বর ${newBooking.queueNumber} সফলভাবে বুক হয়েছে। কেন্দ্র: ${centreTitle}। ফসল: ${cropName}, ${quantity} কেজি। এখন ডাকা হচ্ছে ${nowServing}।`;
        break;
      case "mr":
        confirmationSpeech = `तुमचा टोकन नंबर ${newBooking.queueNumber} यशस्वीपणे बुक झाला आहे. केंद्र: ${centreTitle}। पीक: ${cropName}, ${quantity} किलो। सध्या सुरू असलेला नंबर ${nowServing}।`;
        break;
      default:
        confirmationSpeech = `Your Token Number ${newBooking.queueNumber} is booked successfully at ${centreTitle} for ${cropName}, ${quantity} kilograms. Now serving is ${nowServing}.`;
        break;
    }

    speakInLanguage(confirmationSpeech);
  };

  // Font scale class
  const scaleClass =
    fontScale === "huge"
      ? "text-2xl leading-relaxed"
      : fontScale === "large"
      ? "text-xl leading-relaxed"
      : "text-base leading-normal";

  return (
    // STRICT PURE LIGHT THEME ONLY (no dark mode classes)
    <div className={`min-h-screen bg-[#F7FAF6] text-stone-900 pb-28 ${scaleClass}`}>
      {/* Top Header: Clean, Dignified Senior Header with Subtle Portal Switch */}
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          {/* Brand & Senior Title */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-700 text-white font-black shadow-md text-lg">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-lg font-black text-emerald-950 tracking-tight">
                  KisanQueue
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                  {ui.seniorBadge}
                </span>
              </div>
              <p className="text-[11px] font-bold text-stone-600">
                {ui.simpleService}
              </p>
            </div>
          </div>
        </div>

        {/* Real-time speaking banner with Stop button */}
        {speechNotice && (
          <div className="mx-auto mt-2 max-w-2xl flex items-center justify-between gap-2 rounded-2xl bg-emerald-100 border-2 border-emerald-400 px-3.5 py-2 text-xs font-black text-emerald-950 shadow-md">
            <span className="truncate flex items-center gap-1.5 min-w-0">
              <span className="animate-bounce shrink-0">🔊</span>
              <span className="truncate">{speechNotice}</span>
            </span>
            <button
              type="button"
              onClick={stopAudio}
              className="shrink-0 flex items-center gap-1 rounded-xl bg-emerald-800 px-3 py-1 text-xs font-black text-white hover:bg-emerald-900 active:scale-95 shadow transition-all"
            >
              <span>⏹️</span>
              <span>{ui.stopVoice || "ശബ്ദം നിർത്തുക"}</span>
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-4 space-y-6">
        {/* ============================================================ */}
        {/* TAB 1: TOKEN / BOOKING & LIVE QUEUE */}
        {/* ============================================================ */}
        {currentTab === "token" && (
          <>
            {/* Welcome Greeting Banner */}
            <section className="rounded-3xl bg-emerald-800 p-5 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    {ui.greeting}
                  </span>
                  <h1 className="text-2xl font-black sm:text-3xl text-white">
                    {ui.appTitle}
                  </h1>
                  <p className="text-sm text-emerald-100 font-medium">
                    {ui.appSub}
                  </p>
                </div>
                <div className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-white/20 text-3xl shadow-inner backdrop-blur-md">
                  🌾
                </div>
              </div>
            </section>

            {/* ACTIVE TOKEN STATUS CARD */}
            {activeBooking ? (
              <section className="relative overflow-hidden rounded-[32px] border-4 border-emerald-500 bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between border-b pb-4 border-stone-200">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-sm font-black text-emerald-800">
                    <CheckCircle2 className="size-5 text-emerald-700" />
                    {ui.activeTokenTitle}
                  </span>
                  <span className="text-sm font-bold text-stone-600 font-mono">
                    {activeBooking.date}
                  </span>
                </div>

                {/* Giant Token Metric */}
                <div className="my-6 text-center">
                  <p className="text-base font-bold text-stone-600">
                    {ui.tokenNumberLabel}
                  </p>
                  <div className="my-2 inline-block rounded-3xl bg-emerald-50 border-3 border-emerald-500 px-8 py-4 shadow-md">
                    <p className="font-display text-6xl font-black text-emerald-800 tracking-tight sm:text-7xl">
                      #{activeBooking.queueNumber}
                    </p>
                  </div>
                  <p className="text-sm font-black text-stone-800">
                    {activeBooking.crop} · {activeBooking.quantityKg} kg
                  </p>
                </div>

                {/* Queue Metrics Comparison */}
                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-200">
                  <div className="text-center border-r border-amber-300 pr-2">
                    <span className="text-xs font-black text-stone-600 block">
                      {ui.nowServing}
                    </span>
                    <span className="font-display text-3xl font-black text-amber-900">
                      #{nowServing}
                    </span>
                    <span className="text-[11px] font-bold text-stone-600 block">
                      {ui.gateInfo}
                    </span>
                  </div>
                  <div className="text-center pl-2">
                    <span className="text-xs font-black text-stone-600 block">
                      {ui.aheadOfYou}
                    </span>
                    <span className="font-display text-3xl font-black text-stone-900">
                      {farmersAhead} {ui.waitingCount}
                    </span>
                    <span className="text-[11px] font-bold text-stone-600 block">
                      ~{prediction.minutesLeft} {ui.waitMin}
                    </span>
                  </div>
                </div>

                {/* Centre Location */}
                <div className="mt-4 flex items-start gap-3 rounded-2xl bg-stone-100 p-3.5 text-stone-900">
                  <Building2 className="size-6 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-base font-black">
                      {getCentreTranslatedName(activeBooking.centreName, language)}
                    </strong>
                    <p className="text-xs text-stone-600">
                      {activeCentreForDisplay?.location || (activeCentreForDisplay as any)?.address || "Kottayam"}
                    </p>
                  </div>
                </div>

                {/* Voice & Action Buttons */}
                <div className="mt-5 space-y-3">
                  <button
                    onClick={() => {
                      const centreTitle = getCentreTranslatedName(activeBooking.centreName, language);
                      const speech = getActiveTokenSpeech(
                        activeBooking.queueNumber,
                        centreTitle,
                        nowServing,
                        farmersAhead,
                        prediction.minutesLeft,
                        language
                      );
                      speakInLanguage(speech);
                    }}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-700 py-4 font-black text-white shadow-lg hover:bg-emerald-800 active:scale-95 transition-all text-lg"
                  >
                    <Volume2 className="size-6" />
                    <span>{ui.listenTokenDetails}</span>
                  </button>

                  <div className="flex gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        activeBooking.centreName + " Kerala"
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-stone-300 bg-white py-3.5 font-bold text-stone-800 hover:bg-stone-50 shadow-sm"
                    >
                      <MapPin className="size-5 text-emerald-700" />
                      <span>{ui.getDirections}</span>
                    </a>

                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3.5 font-bold text-red-700 hover:bg-red-100 transition-colors"
                    >
                      <X className="size-5" />
                      <span>{ui.cancelBtn}</span>
                    </button>
                  </div>
                </div>
              </section>
            ) : (
              /* NO TOKEN NOTICE */
              <div className="rounded-3xl border-2 border-dashed border-stone-300 bg-white p-5 text-center shadow-sm">
                <Ticket className="mx-auto size-12 text-stone-400" />
                <h2 className="mt-2 text-xl font-black text-stone-800">
                  {ui.noTokenTitle}
                </h2>
                <p className="mt-1 text-sm font-medium text-stone-600">
                  {ui.noTokenSub}
                </p>
              </div>
            )}

            {/* INSTANT TOKEN BOOKING FORM */}
            <section className="rounded-[32px] border-2 border-emerald-200 bg-white p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-stone-200">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                    {ui.step123}
                  </span>
                  <h2 className="text-2xl font-black text-stone-900">
                    {ui.bookNewTokenTitle}
                  </h2>
                </div>
                <button
                  onClick={() => speakInLanguage(ui.noTokenSub)}
                  className="flex items-center gap-1.5 rounded-2xl bg-amber-100 border border-amber-300 px-3 py-2 text-xs font-black text-amber-900 hover:bg-amber-200"
                >
                  <Volume2 className="size-4" />
                  <span>{ui.helpVoiceBtn}</span>
                </button>
              </div>

              {/* STEP 1: CROP SELECTOR */}
              <div className="space-y-2.5">
                <label className="block text-base font-black text-stone-800">
                  {ui.step1Label}
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {CROP_ITEMS.map((crop) => {
                    const isSelected = selectedCrop.id === crop.id;
                    const localizedCropName = crop.names[language] || crop.names.en;
                    return (
                      <button
                        key={crop.id}
                        type="button"
                        onClick={() => {
                          setSelectedCrop(crop);
                          const cropNotice = getCropAnnouncement(crop, language);
                          speakInLanguage(cropNotice);
                        }}
                        className={`relative flex flex-col items-center rounded-2xl p-3 text-left transition-all border-2 active:scale-95 ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50 ring-4 ring-emerald-500/20 shadow-md"
                            : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
                            <Check className="size-4 stroke-[3]" />
                          </span>
                        )}
                        <img
                          src={crop.image}
                          alt={crop.names.en}
                          className="size-16 rounded-xl object-cover shadow-sm"
                        />
                        <span className="mt-2 text-center text-sm font-black text-stone-900 leading-tight">
                          {localizedCropName}
                        </span>
                        <span className="mt-0.5 text-xs font-extrabold text-emerald-700">
                          ₹{crop.msp} / {crop.unit}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: QUANTITY SELECTOR (+1 / -1) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-base font-black text-stone-800">
                    {ui.step2Label}
                  </label>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    {ui.by1kgBadge}
                  </span>
                </div>

                {/* Clean, Giant +1 / -1 Stepper Controls */}
                <div className="flex items-center justify-between gap-4 rounded-3xl bg-emerald-50/70 border-2 border-emerald-300 p-3 shadow-inner">
                  {/* -1 kg Main Button */}
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex size-16 items-center justify-center rounded-2xl bg-white text-emerald-800 shadow-md border-3 border-emerald-400 hover:bg-emerald-50 active:scale-90 font-black text-3xl"
                    title={ui.decrease1}
                  >
                    <Minus className="size-8 stroke-[3]" />
                  </button>

                  {/* Number Value Display & Edit */}
                  <div className="text-center px-2">
                    <div className="flex items-baseline justify-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="50000"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val > 0) setQuantity(val);
                          else if (e.target.value === "") setQuantity(1);
                        }}
                        className="w-28 text-center font-display text-5xl font-black text-emerald-950 bg-transparent border-b-2 border-emerald-500 focus:outline-none focus:border-emerald-700"
                      />
                      <span className="text-2xl font-black text-stone-600">kg</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                      {ui.kgLabel}
                    </span>
                  </div>

                  {/* +1 kg Main Button */}
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex size-16 items-center justify-center rounded-2xl bg-white text-emerald-800 shadow-md border-3 border-emerald-400 hover:bg-emerald-50 active:scale-90 font-black text-3xl"
                    title={ui.increase1}
                  >
                    <Plus className="size-8 stroke-[3]" />
                  </button>
                </div>

                {/* Fast Preset Chips */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {PRESET_QUANTITIES.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setQuantity(val)}
                      className={`rounded-2xl py-3 text-center text-sm font-black border transition-all active:scale-95 ${
                        quantity === val
                          ? "bg-emerald-700 text-white border-emerald-800 shadow"
                          : "bg-white text-stone-800 border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      {val} kg
                    </button>
                  ))}
                </div>

                {/* Calculated Estimated MSP Payout */}
                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 block">
                      {ui.estimatedPayout}
                    </span>
                    <p className="text-xs text-stone-600">
                      {quantity} kg × ₹{selectedCrop.msp} / kg
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-2xl font-black text-emerald-800">
                      ₹{(quantity * selectedCrop.msp).toLocaleString("en-IN")}
                    </span>
                    <span className="block text-[10px] font-bold text-stone-500">
                      {ui.directDbt}
                    </span>
                  </div>
                </div>
              </div>

              {/* STEP 3: CENTRE SELECTOR */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-base font-black text-stone-800">
                    {ui.step3Label}
                  </label>
                  <span className="text-xs font-bold text-emerald-800">
                    {centres.length} {ui.centresAvailable}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {centres.map((centre) => {
                    const isSelected = selectedCentre.id === centre.id;
                    const centreTitle = getCentreTranslatedName(centre.name, language);
                    return (
                      <div
                        key={centre.id}
                        onClick={() => {
                          setSelectedCentre(centre);
                          speakInLanguage(`${centreTitle}, ${centre.distanceKm} km`);
                        }}
                        className={`flex items-start justify-between gap-3 rounded-2xl p-4 border-2 cursor-pointer transition-all active:scale-98 ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50 ring-4 ring-emerald-500/20 shadow-md"
                            : "border-stone-200 bg-stone-50 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-sm ${
                              isSelected
                                ? "bg-emerald-700 text-white"
                                : "bg-white text-stone-600 border border-stone-300"
                            }`}
                          >
                            {isSelected ? <Check className="size-5 stroke-[3]" /> : <Building2 className="size-5" />}
                          </div>

                          <div className="min-w-0">
                            <strong className="block text-sm font-black text-stone-900 leading-tight">
                              {centreTitle}
                            </strong>
                            <p className="text-xs text-stone-600 mt-0.5">
                              {centre.location || centre.address}
                            </p>
                            <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-2">
                              <span>📍 {centre.distanceKm} km</span>
                              <span>·</span>
                              <span>⏰ {centre.workingHours}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase shadow-sm ${
                              centre.status === "normal"
                                ? "bg-emerald-200 text-emerald-900 border border-emerald-300"
                                : centre.status === "busy"
                                ? "bg-amber-200 text-amber-900 border border-amber-300"
                                : "bg-red-200 text-red-900 border border-red-300"
                            }`}
                          >
                            {centre.status === "normal"
                              ? ui.fastQueue
                              : centre.status === "busy"
                              ? ui.normalQueue
                              : ui.busyQueue}
                          </span>
                          <p className="text-[11px] font-bold text-stone-600 mt-1">
                            {centre.currentQueueLength} {ui.waitingCount}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* GIANT 1-TAP CONFIRM BUTTON */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleInstantBook}
                  className="flex w-full items-center justify-center gap-3 rounded-3xl bg-emerald-700 py-5 px-6 font-black text-white shadow-2xl hover:bg-emerald-800 active:scale-95 transition-all text-xl sm:text-2xl border-4 border-emerald-500/60"
                >
                  <Ticket className="size-8" />
                  <span>{ui.confirmButton}</span>
                </button>
                <p className="mt-2 text-center text-xs font-bold text-stone-600">
                  {getCentreTranslatedName(selectedCentre.name, language)} - {ui.todayIssuedSub}
                </p>
              </div>
            </section>

            {/* DIRECT TOLL-FREE CALL HELPLINE CARD */}
            <section className="rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-5 shadow-md space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow">
                  <Phone className="size-7" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                    {ui.needAssistance}
                  </span>
                  <h3 className="text-xl font-black text-stone-900">
                    {ui.callForToken}
                  </h3>
                  <p className="text-xs text-stone-600 font-medium">
                    {ui.freeHelpline}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 pt-2 sm:grid-cols-2">
                <a
                  href="tel:18004251661"
                  className="flex items-center justify-center gap-3 rounded-2xl bg-emerald-700 py-4 px-4 font-black text-white shadow hover:bg-emerald-800 active:scale-95 transition-all text-base"
                >
                  <Phone className="size-6" />
                  <span>{ui.callNow}</span>
                </a>

                <a
                  href="tel:+919447123456"
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-stone-300 bg-white py-4 px-4 font-black text-stone-800 shadow-sm hover:bg-stone-50 active:scale-95 transition-all text-base"
                >
                  <Phone className="size-5 text-emerald-700" />
                  <span>{ui.managerCall}</span>
                </a>
              </div>
            </section>
          </>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MY BOOKINGS & PASSES */}
        {/* ============================================================ */}
        {currentTab === "bookings" && (
          <section className="space-y-4 animate-in fade-in">
            <div className="rounded-3xl bg-white p-5 border-2 border-emerald-200 shadow-md">
              <div className="flex items-center justify-between border-b pb-3 border-stone-200">
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="size-6 text-emerald-700" />
                  <h2 className="text-xl font-black text-stone-900">
                    {ui.bookingsTitle}
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                  {bookings.length} {ui.waitingCount}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {bookings.length === 0 ? (
                  <p className="text-center text-stone-500 py-8 font-bold">
                    {ui.noBookings}
                  </p>
                ) : (
                  bookings.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-2xl border-2 border-stone-200 bg-stone-50 p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-2xl font-black text-emerald-900">
                          #{b.queueNumber}
                        </span>
                        <span
                          className={`rounded-full px-3 py-0.5 text-xs font-black ${
                            b.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-stone-200 text-stone-700"
                          }`}
                        >
                          {b.status === "confirmed" ? ui.activeBadge : b.status === "completed" ? ui.doneBadge : ui.cancelledBadge}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs font-bold text-stone-700">
                        <p className="text-sm font-black text-stone-900">
                          {b.crop} · {b.quantityKg} kg
                        </p>
                        <p className="flex items-center gap-1.5 text-stone-600">
                          <Building2 className="size-3.5 text-emerald-700" />
                          <span>{getCentreTranslatedName(b.centreName, language)}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-stone-600">
                          <Clock className="size-3.5 text-emerald-700" />
                          <span>{b.date} · {b.slotTime}</span>
                        </p>
                        <p className="font-mono text-[11px] text-stone-500 pt-1">
                          ID: {b.id} · MSP: ₹{b.mspPerKg}/kg · Total: ₹{(b.totalAmount != null ? b.totalAmount : 0).toLocaleString("en-IN")}
                        </p>
                      </div>

                      {b.status === "confirmed" && (
                        <div className="pt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const centreTitle = getCentreTranslatedName(b.centreName, language);
                              const cropObj = CROP_ITEMS.find(
                                (c) => c.names.en.toLowerCase() === (b.crop || "").toLowerCase() || c.id === (b.crop || "").toLowerCase()
                              );
                              const cropName = cropObj?.names[language] || b.crop;
                              const bSpeech = getSingleBookingSpeech(b, centreTitle, cropName, language);
                              speakInLanguage(bSpeech);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 py-2 text-xs font-black text-white shadow-sm"
                          >
                            <Volume2 className="size-4" />
                            <span>{ui.listenBtn}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              cancelBooking(b.id);
                              speakInLanguage(ui.tokenCancelledSpeech);
                            }}
                            className="px-3 rounded-xl border border-red-300 bg-red-50 text-xs font-bold text-red-700 hover:bg-red-100"
                          >
                            {ui.cancelBtn}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* TAB 3: MSP PAYMENTS & SETTLEMENT */}
        {/* ============================================================ */}
        {currentTab === "payments" && (
          <section className="space-y-4 animate-in fade-in">
            {/* Giant Settlement Card */}
            <div className="rounded-3xl bg-emerald-800 p-6 text-white shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
                  {ui.dbtVerified}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-black">
                  <ShieldCheck className="size-4" /> PFMS DBT
                </span>
              </div>

              <div>
                <span className="text-xs text-emerald-100 font-bold block">
                  {ui.totalReceived}
                </span>
                <p className="font-display text-5xl font-black text-white mt-1">
                  ₹13,440
                </p>
                <p className="text-xs text-emerald-200 mt-1 font-medium">
                  {ui.paddyProcurement} · 420 kg @ ₹32/kg MSP
                </p>
              </div>

              <div className="border-t border-white/20 pt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-emerald-200 text-[10px] block">{ui.bankLabel}</span>
                  <strong className="font-mono">{safeUser.bankAccount || "SBI **** 4891"}</strong>
                </div>
                <div>
                  <span className="text-emerald-200 text-[10px] block">{ui.ifscLabel}</span>
                  <strong className="font-mono">{safeUser.ifsc || "SBIN0070123"}</strong>
                </div>
              </div>
            </div>

            {/* Past Transactions List */}
            <div className="rounded-3xl bg-white p-5 border-2 border-emerald-200 shadow-md space-y-3">
              <h3 className="text-base font-black text-stone-900">
                {ui.txnHistory}
              </h3>

              <div className="space-y-2">
                <div className="rounded-2xl bg-stone-50 p-3.5 border border-stone-200 flex items-center justify-between">
                  <div>
                    <strong className="block text-sm font-black text-stone-900">
                      {ui.paddyProcurement} (Paddy)
                    </strong>
                    <span className="text-xs text-stone-600 block">
                      {getCentreTranslatedName("Kottayam Procurement Centre", language)} · 420 kg
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">
                      TXN80472291 · 08 Sep 2026
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-800 block">
                      +₹13,440
                    </span>
                    <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                      {ui.successBadge}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-stone-50 p-3.5 border border-stone-200 flex items-center justify-between">
                  <div>
                    <strong className="block text-sm font-black text-stone-900">
                      {ui.coconutProcurement} (Raw Coconut)
                    </strong>
                    <span className="text-xs text-stone-600 block">
                      {getCentreTranslatedName("Changanassery Procurement Centre", language)} · 250 kg
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">
                      TXN74198205 · 14 Aug 2026
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-800 block">
                      +₹9,500
                    </span>
                    <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                      {ui.successBadge}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* TAB 4: FARMER PROFILE (USER REQUESTED FEATURE) */}
        {/* ============================================================ */}
        {currentTab === "profile" && (
          <section className="space-y-4 animate-in fade-in">
            {/* Farmer Card */}
            <div className="rounded-3xl bg-emerald-800 p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
                  {ui.profileTitle}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-black">
                  <ShieldCheck className="size-4" /> {ui.aadhaarLinked}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-950 font-display text-2xl font-black text-emerald-200 shadow-inner">
                  {(safeUser.name || "Farmer").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white leading-tight">
                    {safeUser.name || "Farmer"}
                  </h2>
                  <p className="text-xs text-emerald-200 font-mono mt-0.5">
                    {ui.farmerIdLabel}: {safeUser.farmerId || "KL-KTM-26047"}
                  </p>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    {safeUser.mobile || "+91 82812 51299"}
                  </p>
                </div>
              </div>
            </div>

            {/* 8 Indian Languages Selection Card (Moved from header into Profile) */}
            <div className="rounded-3xl bg-white p-5 border-2 border-emerald-200 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b pb-2.5 border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-black">
                    <Languages className="size-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-stone-900">
                      {ui.selectLanguage}
                    </h3>
                    <p className="text-xs text-stone-500 font-bold">
                      {ui.languageVoiceSub}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 border border-emerald-300">
                  {SUPPORTED_LANGUAGES.find((l) => l.id === language)?.native}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {SUPPORTED_LANGUAGES.map((langItem) => {
                  const isSelected = language === langItem.id;
                  return (
                    <button
                      key={langItem.id}
                      type="button"
                      onClick={() => handleLanguageChange(langItem.id)}
                      className={`relative flex flex-col items-center justify-center rounded-2xl py-3 px-2 text-center transition-all active:scale-95 ${
                        isSelected
                          ? "bg-emerald-700 text-white font-black shadow-md ring-2 ring-emerald-500"
                          : "bg-stone-50 border-2 border-stone-200 text-stone-800 font-bold hover:bg-emerald-50 hover:border-emerald-300 shadow-sm"
                      }`}
                      title={`${langItem.label} - Tap to listen voice`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs opacity-75">🔊</span>
                        <span className="block text-base leading-tight font-black">
                          {langItem.native}
                        </span>
                      </div>
                      <span
                        className={`block text-xs mt-0.5 ${
                          isSelected ? "text-emerald-100" : "text-stone-500"
                        }`}
                      >
                        {langItem.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text Size / Accessibility Settings (Moved from header to Profile) */}
            <div className="rounded-3xl bg-white p-5 border-2 border-emerald-200 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b pb-2.5 border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-black">
                    <Sparkles className="size-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-stone-900">
                      {ui.textSize}
                    </h3>
                    <p className="text-xs text-stone-500 font-bold">
                      വലിയ അക്ഷരങ്ങൾ തിരഞ്ഞെടുക്കുക (Font Scale)
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 border border-emerald-300">
                  {fontScale === "huge" ? "A++" : fontScale === "large" ? "A+" : "A"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setFontScale("normal")}
                  className={`flex flex-col items-center justify-center rounded-2xl py-3 px-2 text-center transition-all active:scale-95 ${
                    fontScale === "normal"
                      ? "bg-emerald-700 text-white font-black shadow-md ring-2 ring-emerald-500"
                      : "bg-stone-50 border-2 border-stone-200 text-stone-800 font-bold hover:bg-emerald-50 shadow-sm"
                  }`}
                >
                  <span className="text-base font-black">A</span>
                  <span className={`text-xs mt-0.5 ${fontScale === "normal" ? "text-emerald-100" : "text-stone-500"}`}>
                    Normal
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFontScale("large")}
                  className={`flex flex-col items-center justify-center rounded-2xl py-3 px-2 text-center transition-all active:scale-95 ${
                    fontScale === "large"
                      ? "bg-emerald-700 text-white font-black shadow-md ring-2 ring-emerald-500"
                      : "bg-stone-50 border-2 border-stone-200 text-stone-800 font-bold hover:bg-emerald-50 shadow-sm"
                  }`}
                >
                  <span className="text-xl font-black">A+</span>
                  <span className={`text-xs mt-0.5 ${fontScale === "large" ? "text-emerald-100" : "text-stone-500"}`}>
                    Large
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFontScale("huge")}
                  className={`flex flex-col items-center justify-center rounded-2xl py-3 px-2 text-center transition-all active:scale-95 ${
                    fontScale === "huge"
                      ? "bg-emerald-700 text-white font-black shadow-md ring-2 ring-emerald-500"
                      : "bg-stone-50 border-2 border-stone-200 text-stone-800 font-bold hover:bg-emerald-50 shadow-sm"
                  }`}
                >
                  <span className="text-2xl font-black">A++</span>
                  <span className={`text-xs mt-0.5 ${fontScale === "huge" ? "text-emerald-100" : "text-stone-500"}`}>
                    Huge
                  </span>
                </button>
              </div>

              {/* Profile Voice Reading Trigger */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const profileSpeech = `${safeUser.name || "Farmer"}. ${ui.farmerIdLabel}: ${safeUser.farmerId || "KL-KTM-26047"}. ${ui.panchayatLabel}: ${safeUser.village || "Kumarakom"}, ${safeUser.district || "Kottayam"}. ${ui.landholdingLabel}: ${ui.farmLandDetail}. ${ui.cropsLabel}: ${ui.farmCropsList}. ${ui.bankLabel}: ${safeUser.bankAccount || "State Bank of India 4891"}. ${ui.aadhaarLinked}.`;
                    speakInLanguage(profileSpeech);
                  }}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 font-black text-white shadow-md transition-all active:scale-95 text-sm ${
                    isSpeaking ? "bg-red-600 animate-pulse" : "bg-emerald-700 hover:bg-emerald-800"
                  }`}
                >
                  {isSpeaking ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                  <span>{isSpeaking ? ui.stopVoice : ui.listenAloud}</span>
                </button>
              </div>
            </div>

            {/* Agricultural Registry Details */}
            <div className="rounded-3xl bg-white p-5 border-2 border-emerald-200 shadow-md space-y-3">
              <h3 className="text-base font-black text-stone-900 border-b pb-2 border-stone-200">
                {ui.farmRegistryTitle}
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-stone-50 p-3 border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-500 block">
                    {ui.panchayatLabel}
                  </span>
                  <strong className="text-sm font-black text-stone-900">
                    {safeUser.village || "Kumarakom"}, {safeUser.district || "Kottayam"}
                  </strong>
                </div>

                <div className="rounded-2xl bg-stone-50 p-3 border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-500 block">
                    {ui.landholdingLabel}
                  </span>
                  <strong className="text-sm font-black text-stone-900">
                    {ui.farmLandDetail}
                  </strong>
                </div>

                <div className="rounded-2xl bg-stone-50 p-3 border border-stone-200 col-span-2">
                  <span className="text-[11px] font-bold text-stone-500 block">
                    {ui.cropsLabel}
                  </span>
                  <strong className="text-sm font-black text-stone-900">
                    {safeUser.primaryCrop || ui.farmCropsList}
                  </strong>
                </div>
              </div>
            </div>

            {/* Direct Benefit Transfer Bank Account */}
            <div className="rounded-3xl bg-white p-5 border-2 border-emerald-200 shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <Landmark className="size-5 text-emerald-700" />
                <h3 className="text-base font-black text-stone-900">
                  {ui.bankSectionTitle}
                </h3>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 space-y-1 text-xs">
                <span className="text-[11px] font-bold text-emerald-800 block">
                  {ui.bankLabel}
                </span>
                <p className="text-base font-black font-mono text-emerald-950">
                  {safeUser.bankAccount || "State Bank of India **** 4891"}
                </p>
                <p className="text-xs font-mono text-stone-600">
                  IFSC: {safeUser.ifsc || "SBIN0070123"} · {ui.bankBranchInfo}
                </p>
              </div>
            </div>

            {/* Switch to Standard View button inside profile */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => navigate({ to: "/login" })}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-300 bg-emerald-50 py-3.5 font-black text-emerald-950 shadow-sm hover:bg-emerald-100 active:scale-95 transition-all text-sm"
              >
                <span>🌾 {language === "ml" ? "കർഷക ലോഗിൻ / അക്കൗണ്ട് മാറുക" : "Farmer Login / Switch Account"}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/" })}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-stone-300 bg-white py-4 font-black text-stone-800 shadow-sm hover:bg-stone-50 active:scale-95 transition-all text-base cursor-pointer"
              >
                <span>{ui.switchStandard}</span>
                <ExternalLink className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (logout) logout();
                  navigate({ to: "/" });
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-rose-300 bg-rose-50 py-3.5 font-black text-rose-800 shadow-sm hover:bg-rose-100 active:scale-95 transition-all text-sm cursor-pointer"
              >
                <LogOut className="size-4" />
                <span>{language === "ml" ? "ലോഗ് ഔട്ട് ചെയ്യുക" : "Log Out of KisanQueue"}</span>
              </button>
            </div>
          </section>
        )}
      </main>

      {/* ============================================================ */}
      {/* SENIOR TACTILE BOTTOM NAVIGATION BAR (USER REQUESTED FEATURE) */}
      {/* ============================================================ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-emerald-200 bg-white/98 px-2 py-2 shadow-2xl backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-around gap-1">
          {/* Tab 1: Token */}
          <button
            type="button"
            onClick={() => setCurrentTab("token")}
            className={`flex flex-1 flex-col items-center justify-center rounded-2xl py-2.5 transition-all active:scale-95 ${
              currentTab === "token"
                ? "bg-emerald-700 text-white font-black shadow-md ring-2 ring-emerald-600"
                : "text-stone-600 hover:bg-emerald-50 font-bold"
            }`}
          >
            <Ticket className="size-6" strokeWidth={currentTab === "token" ? 2.5 : 2} />
            <span className="text-xs font-black mt-0.5">{ui.tabToken}</span>
          </button>

          {/* Tab 2: Bookings */}
          <button
            type="button"
            onClick={() => setCurrentTab("bookings")}
            className={`flex flex-1 flex-col items-center justify-center rounded-2xl py-2.5 transition-all active:scale-95 ${
              currentTab === "bookings"
                ? "bg-emerald-700 text-white font-black shadow-md ring-2 ring-emerald-600"
                : "text-stone-600 hover:bg-emerald-50 font-bold"
            }`}
          >
            <CalendarDays className="size-6" strokeWidth={currentTab === "bookings" ? 2.5 : 2} />
            <span className="text-xs font-black mt-0.5">{ui.tabBookings}</span>
          </button>

          {/* Tab 3: Payments */}
          <button
            type="button"
            onClick={() => setCurrentTab("payments")}
            className={`flex flex-1 flex-col items-center justify-center rounded-2xl py-2.5 transition-all active:scale-95 ${
              currentTab === "payments"
                ? "bg-emerald-700 text-white font-black shadow-md ring-2 ring-emerald-600"
                : "text-stone-600 hover:bg-emerald-50 font-bold"
            }`}
          >
            <CreditCard className="size-6" strokeWidth={currentTab === "payments" ? 2.5 : 2} />
            <span className="text-xs font-black mt-0.5">{ui.tabPayments}</span>
          </button>

          {/* Tab 4: Profile */}
          <button
            type="button"
            onClick={() => setCurrentTab("profile")}
            className={`flex flex-1 flex-col items-center justify-center rounded-2xl py-2.5 transition-all active:scale-95 ${
              currentTab === "profile"
                ? "bg-emerald-700 text-white font-black shadow-md ring-2 ring-emerald-600"
                : "text-stone-600 hover:bg-emerald-50 font-bold"
            }`}
          >
            <UserRound className="size-6" strokeWidth={currentTab === "profile" ? 2.5 : 2} />
            <span className="text-xs font-black mt-0.5">{ui.tabProfile}</span>
          </button>
        </div>
      </nav>

      {/* MODAL 1: BOOKING CONFIRMATION SUCCESS */}
      {bookingSuccessModal && activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-[32px] border-4 border-emerald-500 bg-white p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-inner">
              <CheckCircle2 className="size-12 stroke-[2.5]" />
            </div>

            <span className="inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-black text-emerald-800">
              {ui.modalSuccessTitle}
            </span>

            <h3 className="text-2xl font-black text-stone-900">
              #{activeBooking.queueNumber}
            </h3>

            <div className="rounded-2xl bg-emerald-50 p-3 border border-emerald-200 text-xs font-bold text-emerald-950 space-y-1">
              <p>{getCentreTranslatedName(activeBooking.centreName, language)}</p>
              <p>{activeBooking.crop} · {activeBooking.quantityKg} kg</p>
            </div>

            <div className="rounded-2xl bg-amber-50 p-3 border border-amber-200 text-xs font-bold text-amber-900">
              {ui.nowServing} #{nowServing}
            </div>

            <button
              onClick={() => setBookingSuccessModal(false)}
              className="w-full rounded-2xl bg-emerald-700 py-4 text-lg font-black text-white shadow-lg hover:bg-emerald-800 active:scale-95 transition-all"
            >
              {ui.modalOkBtn}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: CANCEL TOKEN CONFIRMATION */}
      {showCancelModal && activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-[32px] border-4 border-red-500 bg-white p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-inner">
              <AlertCircle className="size-10" />
            </div>

            <h3 className="text-xl font-black text-stone-900">
              {ui.modalCancelTitle}
            </h3>

            <p className="text-sm font-bold text-stone-600">
              #{activeBooking.queueNumber} - {ui.modalCancelSub}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 rounded-2xl border-2 border-stone-300 bg-white py-3 font-bold text-stone-800 hover:bg-stone-100"
              >
                {ui.modalKeepBtn}
              </button>
              <button
                onClick={() => {
                  cancelBooking(activeBooking.id);
                  setShowCancelModal(false);
                  speakInLanguage(ui.tokenCancelledSpeech);
                }}
                className="flex-1 rounded-2xl bg-red-600 py-3 font-black text-white shadow hover:bg-red-700 active:scale-95"
              >
                {ui.modalConfirmCancelBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kisan Queue AI Voice Chatbot */}
      <KisanQueueAIChatbot isSeniorMode={true} />
    </div>
  );
}
