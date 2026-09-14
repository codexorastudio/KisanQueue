import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { useKisanQueue } from "@/lib/store";
import { User, Language } from "@/lib/types";
import { SUPPORTED_LANGUAGES } from "@/lib/translations";
import { fetchUserByMobile, createDbUser } from "@/lib/db";
import {
  Phone,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Languages,
  Type,
  UserRound,
  Check,
  Sparkles,
  ArrowRight,
  Sprout,
  Wheat,
} from "lucide-react";

// Kerala Crop Image Assets
import cropPaddy from "@/assets/crop-paddy.jpg";
import cropCoconut from "@/assets/crop-coconut.jpg";
import cropRubber from "@/assets/crop-rubber.jpg";
import cropPepper from "@/assets/crop-pepper.jpg";
import cropCardamom from "@/assets/crop-cardamom.jpg";
import cropArecanut from "@/assets/crop-arecanut.jpg";
import cropNutmeg from "@/assets/crop-nutmeg.jpg";
import cropCoffee from "@/assets/crop-coffee.jpg";
import cropBanana from "@/assets/crop-banana.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login & Setup — KisanQueue" },
      {
        name: "description",
        content: "Sign in with Phone & OTP, configure language, age, font size, and select your primary harvest crops.",
      },
    ],
  }),
  component: FarmerOnboardingLoginPage,
});

interface CropOption {
  id: string;
  name: string;
  localNames: Record<string, string>;
  image: string;
  msp: number;
}

const CROPS_LIST: CropOption[] = [
  {
    id: "paddy",
    name: "Paddy",
    localNames: { ml: "നെല്ല് (Paddy)", hi: "धान", ta: "நெல்", te: "వరి", kn: "ಭತ್ತ", bn: "ধান", mr: "भात" },
    image: cropPaddy,
    msp: 32,
  },
  {
    id: "coconut",
    name: "Raw Coconut",
    localNames: { ml: "നാളികേരം (Coconut)", hi: "नारियल", ta: "தேங்காய்", te: "కొబ్బరి", kn: "ತೆಂಗಿನಕಾಯಿ", bn: "নারকেল", mr: "नारळ" },
    image: cropCoconut,
    msp: 38,
  },
  {
    id: "rubber",
    name: "Rubber RSS4",
    localNames: { ml: "റബ്ബർ (Rubber)", hi: "रबर", ta: "ரப்பர்", te: "రబ్బరు", kn: "ರಬ್ಬರ್", bn: "রবার", mr: "रबर" },
    image: cropRubber,
    msp: 180,
  },
  {
    id: "pepper",
    name: "Black Pepper",
    localNames: { ml: "കുരുമുളക് (Pepper)", hi: "काली मिर्च", ta: "மிளகு", te: "మిరియాలు", kn: "ಮೆಣಸು", bn: "গোলমরিচ", mr: "काळी मिरी" },
    image: cropPepper,
    msp: 520,
  },
  {
    id: "cardamom",
    name: "Cardamom",
    localNames: { ml: "ഏലക്ക (Cardamom)", hi: "इलायची", ta: "ஏலக்காய்", te: "ఏలకులు", kn: "ಏಲಕ್ಕಿ", bn: "এলাচ", mr: "वेलची" },
    image: cropCardamom,
    msp: 1850,
  },
  {
    id: "arecanut",
    name: "Areca Nut",
    localNames: { ml: "അടയ്ക്ക (Arecanut)", hi: "सुपारी", ta: "பாக்கு", te: "పోకచెక్క", kn: "ಅಡಿಕೆ", bn: "সুপারি", mr: "सुपारी" },
    image: cropArecanut,
    msp: 360,
  },
  {
    id: "nutmeg",
    name: "Nutmeg & Mace",
    localNames: { ml: "ജാതിക്ക (Nutmeg)", hi: "जायफल", ta: "ஜாதிக்காய்", te: "జాజికాయ", kn: "ಜಾಯಿಕಾಯಿ", bn: "জায়ফল", mr: "जायफळ" },
    image: cropNutmeg,
    msp: 280,
  },
  {
    id: "coffee",
    name: "Robusta Coffee",
    localNames: { ml: "കാപ്പി (Coffee)", hi: "कॉफ़ी", ta: "காபி", te: "కాఫీ", kn: "ಕಾಫಿ", bn: "কফি", mr: "कॉफी" },
    image: cropCoffee,
    msp: 210,
  },
  {
    id: "banana",
    name: "Nendran Banana",
    localNames: { ml: "നേന്ത്രപ്പഴം (Banana)", hi: "केला", ta: "வாழைப்பழம்", te: "అరటిపండు", kn: "ಬಾಳೆಹಣ್ಣು", bn: "কলা", mr: "केळी" },
    image: cropBanana,
    msp: 42,
  },
];

export function FarmerOnboardingLoginPage() {
  const navigate = useNavigate();
  const {
    setUser,
    language,
    setLanguage,
    largeText,
    setLargeText,
    addNotification,
    setIsLoggedIn,
  } = useKisanQueue();

  // Steps: "phone" -> "otp" -> "preferences" -> "crops"
  const [step, setStep] = useState<"phone" | "otp" | "preferences" | "crops">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [matchedDbUser, setMatchedDbUser] = useState<User | null>(null);

  // User Profile
  const [pendingUser, setPendingUser] = useState<Partial<User>>({
    name: "",
    mobile: "",
    farmerId: "",
    village: "",
    district: "Kottayam",
  });

  // Step 2: Preferences
  const [age, setAge] = useState<string>("");
  const [fontSizeChoice, setFontSizeChoice] = useState<"normal" | "large" | "xlarge">(
    largeText ? "large" : "normal"
  );

  // Step 3: Crops selection (multiple - starts empty, selected on click)
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);

  // Toggle crop selection
  const toggleCrop = (cropId: string) => {
    setSelectedCrops((prev) =>
      prev.includes(cropId) ? prev.filter((id) => id !== cropId) : [...prev, cropId]
    );
  };

  // STEP 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    if (cleanNumber.length < 10) {
      setFeedback("Please enter a valid 10-digit mobile number");
      return;
    }

    setFeedback(null);
    setIsLoading(true);

    try {
      const existing = await fetchUserByMobile(cleanNumber);
      if (existing) {
        setMatchedDbUser(existing);
        setPendingUser(existing);
        if (existing.crops && existing.crops.length > 0) {
          setSelectedCrops(existing.crops);
        }
        setFeedback(`Welcome back ${existing.name}! (Demo OTP: 2604)`);
      } else {
        setMatchedDbUser(null);
        setPendingUser({
          name: "",
          mobile: "+91 " + cleanNumber,
          farmerId: `KL-KTM-${Math.floor(10000 + Math.random() * 90000)}`,
          village: "Kumarakom",
          district: "Kottayam",
          role: "farmer",
        });
        setFeedback(`New Farmer verification code sent to +91 ${cleanNumber} (Demo: 2604)`);
      }
    } catch {
      setMatchedDbUser(null);
    } finally {
      setIsLoading(false);
      setStep("otp");
      setOtpCode("2604");
    }
  };

  // STEP 2: Verify OTP -> Moves to Preferences or Dashboard
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setFeedback("Please enter the 4-digit verification code");
      return;
    }

    setFeedback(null);

    if (matchedDbUser) {
      // Existing User! Instant login
      setIsLoading(true);
      setUser(matchedDbUser);
      setIsLoggedIn(true);
      addNotification(
        "Welcome Back! 👨‍🌾",
        `Logged in as ${matchedDbUser.name} (${matchedDbUser.farmerId}).`,
        "booking"
      );
      setTimeout(() => {
        setIsLoading(false);
        navigate({ to: "/" });
      }, 300);
      return;
    }

    // New User! Proceed to setup profile & preferences
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("preferences");
    }, 200);
  };

  // Font Size Selection
  const handleSelectFontSize = (size: "normal" | "large" | "xlarge") => {
    setFontSizeChoice(size);
    if (size === "normal") {
      setLargeText(false);
    } else {
      setLargeText(true);
    }
  };

  // Complete Onboarding & Save to Supabase
  const handleCompleteSetup = async () => {
    setIsLoading(true);

    const cropNames = selectedCrops
      .map((id) => CROPS_LIST.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join(" & ");

    const userProfile: Partial<User> = {
      ...pendingUser,
      name: pendingUser.name?.trim() || "Farmer",
      village: pendingUser.village?.trim() || "Kumarakom",
      district: pendingUser.district?.trim() || "Kottayam",
      crops: selectedCrops.length > 0 ? selectedCrops : ["paddy"],
      primaryCrop: cropNames || "Paddy",
      role: "farmer",
    };

    let savedUser = await createDbUser(userProfile);
    const finalUser = savedUser || (userProfile as User);

    setUser(finalUser);
    setIsLoggedIn(true);

    addNotification(
      "Registration Complete 🎉",
      `Welcome ${finalUser.name}! Your verified Farmer ID is ${finalUser.farmerId}.`,
      "booking"
    );

    const isSenior = Number(age) >= 60;

    setTimeout(() => {
      setIsLoading(false);
      if (isSenior) {
        navigate({ to: "/old" });
      } else {
        navigate({ to: "/" });
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between p-4 sm:p-6 font-sans antialiased text-stone-900 selection:bg-emerald-200">
      
      {/* Top Bar Navigation & Step Indicator */}
      <header className="w-full max-w-sm mx-auto flex items-center justify-between py-2">
        <button
          type="button"
          onClick={() => {
            if (step === "crops") {
              setStep("preferences");
            } else if (step === "preferences") {
              setStep("otp");
            } else if (step === "otp") {
              setStep("phone");
              setFeedback(null);
            } else {
              navigate({ to: "/" });
            }
          }}
          className="flex size-10 items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
          title="Go back"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" />
        </button>

        {/* Step Progress Dots */}
        <div className="flex items-center gap-1.5">
          <div className={`size-2 rounded-full transition-all ${step === "phone" ? "w-6 bg-[#183917]" : "bg-stone-300"}`} />
          <div className={`size-2 rounded-full transition-all ${step === "otp" ? "w-6 bg-[#183917]" : "bg-stone-300"}`} />
          <div className={`size-2 rounded-full transition-all ${step === "preferences" ? "w-6 bg-[#183917]" : "bg-stone-300"}`} />
          <div className={`size-2 rounded-full transition-all ${step === "crops" ? "w-6 bg-[#183917]" : "bg-stone-300"}`} />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
          KisanQueue
        </span>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-sm mx-auto my-auto py-4 space-y-5">

        {/* ============================================================== */}
        {/* STEP 1: PHONE NUMBER INPUT */}
        {/* ============================================================== */}
        {step === "phone" && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1C3E1B]">
                Login
              </h1>
              <p className="mt-1 text-xs text-stone-500 font-medium">
                Enter your mobile number to receive OTP
              </p>
            </div>

            {feedback && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-700" />
                <span>{feedback}</span>
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none text-stone-400 flex items-center gap-1.5">
                  <Phone className="size-4" />
                  <span className="text-xs font-bold text-stone-500 pl-1 border-r border-stone-200 pr-2">
                    +91
                  </span>
                </div>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  maxLength={10}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-12 rounded-2xl border border-stone-200 bg-white pl-20 pr-4 text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition-all shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || phoneNumber.length < 10}
                className="w-full h-12 rounded-full bg-[#183917] hover:bg-[#132d12] active:scale-[0.98] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Send Verification Code</span>
                )}
              </button>

              <div className="pt-2 flex flex-col items-center gap-1.5 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  Quick Demo Accounts
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPhoneNumber("8281251299")}
                    className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    8281251299 (Existing)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhoneNumber("9847" + Math.floor(100000 + Math.random() * 900000))}
                    className="text-[11px] font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    + New Farmer Number
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: OTP VERIFICATION */}
        {/* ============================================================== */}
        {step === "otp" && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1C3E1B]">
                Verify Code
              </h1>
              <p className="mt-1 text-xs text-stone-500 font-medium">
                Enter the 4-digit code sent to +91 {phoneNumber}
              </p>
            </div>

            {feedback && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-700" />
                <span>{feedback}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none text-stone-400">
                  <KeyRound className="size-4" />
                </div>
                <input
                  type="text"
                  placeholder="Enter 4-digit OTP"
                  maxLength={4}
                  value={otpCode}
                  autoFocus
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-12 rounded-2xl border border-stone-200 bg-white pl-11 pr-24 text-sm font-bold tracking-widest text-stone-800 placeholder:text-stone-400 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setOtpCode("2604")}
                  className="absolute right-2 px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>

              <div className="flex items-center justify-between text-xs px-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setFeedback(null);
                  }}
                  className="text-stone-500 hover:text-stone-800 underline underline-offset-4 cursor-pointer font-medium"
                >
                  Change Number
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFeedback("New OTP sent to +91 " + phoneNumber + " (Demo Code: 2604)");
                    setOtpCode("2604");
                  }}
                  className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
                >
                  <RotateCcw className="size-3" /> Resend OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 4}
                className="w-full h-12 rounded-full bg-[#183917] hover:bg-[#132d12] active:scale-[0.98] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Verify & Continue</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: PREFERENCES (AGE, LANGUAGE, FONT SIZE) */}
        {/* ============================================================== */}
        {step === "preferences" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tight text-[#1C3E1B]">
                Preferences
              </h1>
              <p className="mt-1 text-xs text-stone-500 font-medium">
                Select your age, language, and font size
              </p>
            </div>

            <div className="space-y-4">
              {/* Farmer Profile Fields */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 px-1">
                  <UserRound className="size-3.5 text-[#183917]" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Suresh Pillai"
                  value={pendingUser.name || ""}
                  onChange={(e) => setPendingUser((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 px-1">
                    Village / Bhavan
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kumarakom"
                    value={pendingUser.village || ""}
                    onChange={(e) => setPendingUser((prev) => ({ ...prev, village: e.target.value }))}
                    className="w-full h-11 rounded-2xl border border-stone-200 bg-white px-3 text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 px-1">
                    District
                  </label>
                  <select
                    value={pendingUser.district || "Kottayam"}
                    onChange={(e) => setPendingUser((prev) => ({ ...prev, district: e.target.value }))}
                    className="w-full h-11 rounded-2xl border border-stone-200 bg-white px-3 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition-all shadow-sm"
                  >
                    <option value="Kottayam">Kottayam</option>
                    <option value="Alappuzha">Alappuzha</option>
                    <option value="Idukki">Idukki</option>
                    <option value="Palakkad">Palakkad</option>
                    <option value="Ernakulam">Ernakulam</option>
                  </select>
                </div>
              </div>

              {/* 1. Age Input */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 px-1">
                  <UserRound className="size-3.5 text-[#183917]" />
                  <span>Age</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min={18}
                    max={110}
                    placeholder="Enter Age (e.g. 52)"
                    value={age}
                    onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))}
                    className="w-full h-12 rounded-2xl border border-stone-200 bg-white px-4 text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition-all shadow-sm"
                  />
                  {age && Number(age) >= 60 && (
                    <span className="absolute right-3 px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 rounded-lg">
                      Accessible Mode Enabled 🌾
                    </span>
                  )}
                </div>
              </div>

              {/* 2. Language Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700 px-1">
                  <div className="flex items-center gap-1.5">
                    <Languages className="size-3.5 text-[#183917]" />
                    <span>Language</span>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-bold">
                    {SUPPORTED_LANGUAGES.find((l) => l.id === language)?.native}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {SUPPORTED_LANGUAGES.map((l) => {
                    const isSelected = language === l.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLanguage(l.id as Language)}
                        className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#183917] bg-[#183917] text-white font-bold shadow-sm"
                            : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium"
                        }`}
                      >
                        <span className="block text-[11px] leading-tight font-bold truncate">
                          {l.native}
                        </span>
                        <span className={`block text-[8.5px] mt-0.5 ${isSelected ? "text-white/80" : "text-stone-400"}`}>
                          {l.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Font Size Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 px-1">
                  <Type className="size-3.5 text-[#183917]" />
                  <span>Font Size</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectFontSize("normal")}
                    className={`py-2 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                      fontSizeChoice === "normal"
                        ? "border-[#183917] bg-[#183917]/5 ring-2 ring-[#183917]/20 font-bold"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-600"
                    }`}
                  >
                    <span className="text-xs block font-bold text-stone-900">A Normal</span>
                    <span className="text-[9.5px] text-stone-400 block">Default (14px)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectFontSize("large")}
                    className={`py-2 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                      fontSizeChoice === "large"
                        ? "border-[#183917] bg-[#183917]/5 ring-2 ring-[#183917]/20 font-bold"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-600"
                    }`}
                  >
                    <span className="text-xs block font-bold text-stone-900">A+ Large</span>
                    <span className="text-[9.5px] text-emerald-800 font-medium block">Recommended</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectFontSize("xlarge")}
                    className={`py-2 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                      fontSizeChoice === "xlarge"
                        ? "border-[#183917] bg-[#183917]/5 ring-2 ring-[#183917]/20 font-bold"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-600"
                    }`}
                  >
                    <span className="text-xs block font-black text-stone-900">A++ Extra</span>
                    <span className="text-[9.5px] text-stone-400 block">Senior Friendly</span>
                  </button>
                </div>
              </div>

              {/* Next Step Button */}
              <button
                type="button"
                onClick={() => setStep("crops")}
                className="w-full h-12 mt-3 rounded-full bg-[#183917] hover:bg-[#132d12] active:scale-[0.98] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Next: Select Crops</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: CROP SELECTION */}
        {/* ============================================================== */}
        {step === "crops" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tight text-[#1C3E1B]">
                Your Crops
              </h1>
              <p className="mt-1 text-xs text-stone-500 font-medium">
                {language === "ml"
                  ? "നിങ്ങൾ വിളവെടുക്കുന്ന പ്രധാന വിളകൾ തിരഞ്ഞെടുക്കുക"
                  : "Select the primary crops you harvest for procurement"}
              </p>
            </div>

            {/* Selected Count Indicator */}
            <div className="flex items-center justify-between px-1 text-xs font-bold text-stone-600">
              <span className="flex items-center gap-1 text-emerald-800">
                <Sprout className="size-3.5" />
                <span>{selectedCrops.length} Crops Selected</span>
              </span>
              <span className="text-[11px] text-stone-400 font-normal">Tap to choose</span>
            </div>

            {/* Crops Grid */}
            <div className="grid grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-0.5 -mr-0.5">
              {CROPS_LIST.map((crop) => {
                const isSelected = selectedCrops.includes(crop.id);
                const localName = crop.localNames[language] || crop.name;
                return (
                  <button
                    key={crop.id}
                    type="button"
                    onClick={() => toggleCrop(crop.id)}
                    className={`relative flex flex-col items-center rounded-2xl p-2.5 text-center transition-all border cursor-pointer active:scale-95 ${
                      isSelected
                        ? "border-[#183917] bg-[#183917]/5 ring-2 ring-[#183917]/30 shadow-sm"
                        : "border-stone-200 bg-white hover:border-stone-300 opacity-80"
                    }`}
                  >
                    {/* Checkmark indicator */}
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-[#183917] text-white shadow">
                        <Check className="size-3 stroke-[3]" />
                      </span>
                    )}

                    <img
                      src={crop.image}
                      alt={crop.name}
                      className="size-14 rounded-xl object-cover shadow-sm"
                    />

                    <span className="mt-1.5 text-xs font-bold text-stone-900 leading-tight line-clamp-1">
                      {localName}
                    </span>

                    <span className="mt-0.5 text-[10px] font-extrabold text-emerald-800">
                      ₹{crop.msp}/kg
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Complete Setup Button */}
            <button
              type="button"
              onClick={handleCompleteSetup}
              disabled={isLoading || selectedCrops.length === 0}
              className="w-full h-12 mt-2 rounded-full bg-[#183917] hover:bg-[#132d12] active:scale-[0.98] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {language === "ml"
                      ? selectedCrops.length === 0
                        ? "ഒരു വിള തിരഞ്ഞെടുക്കുക"
                        : "പൂർത്തിയാക്കി പ്രവേശിക്കുക"
                      : selectedCrops.length === 0
                      ? "Select at least 1 crop"
                      : "Complete Setup & Enter"}
                  </span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
        )}

      </main>

      {/* Minimal Footer */}
      <footer className="text-center py-2 text-[11px] text-stone-400">
        © 2026 KisanQueue · Kerala Agriculture Department
      </footer>

    </div>
  );
}
