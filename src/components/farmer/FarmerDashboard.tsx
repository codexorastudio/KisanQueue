import React, { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useKisanQueue } from "@/lib/store";
import { t } from "@/lib/translations";
import {
  CalendarDays,
  UsersRound,
  PackageCheck,
  IndianRupee,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Clock,
  Wheat,
  MapPin,
  Headphones,
  Map,
  Bell,
  XCircle,
  X,
  Sun,
  Wind,
  Droplets,
  Sprout,
  Ticket,
  Plus,
  Check,
  Phone,
  PhoneCall,
  ArrowRight,
} from "lucide-react";
import heroImage from "@/assets/smartprocure-home.jpg";
import cropPaddy from "@/assets/crop-paddy.jpg";
import cropCoconut from "@/assets/crop-coconut.jpg";
import cropRubber from "@/assets/crop-rubber.jpg";
import cropPepper from "@/assets/crop-pepper.jpg";
import cropCardamom from "@/assets/crop-cardamom.jpg";
import cropArecanut from "@/assets/crop-arecanut.jpg";
import cropNutmeg from "@/assets/crop-nutmeg.jpg";
import cropCoffee from "@/assets/crop-coffee.jpg";
import cropBanana from "@/assets/crop-banana.jpg";

const CROPS_DATA = [
  {
    id: "paddy",
    name: "Paddy",
    nameMl: "നെല്ല് (Paddy)",
    timeframeKey: "readyHarvest" as const,
    msp: "₹32 / kg MSP",
    badgeKey: "healthy" as const,
    badgeClass: "bg-emerald-600 text-white",
    image: cropPaddy,
  },
  {
    id: "coconut",
    name: "Raw Coconut",
    nameMl: "തേങ്ങ (Raw Coconut)",
    timeframeKey: "oneMonthHarvest" as const,
    msp: "₹38 / kg MSP",
    badgeKey: "normal" as const,
    badgeClass: "bg-white/90 text-gray-800 border border-gray-200",
    image: cropCoconut,
  },
  {
    id: "rubber",
    name: "Rubber (RSS4)",
    nameMl: "റബ്ബർ (Rubber RSS4)",
    timeframeKey: "dailyTapping" as const,
    msp: "₹180 / kg MSP",
    badgeKey: "peakTap" as const,
    badgeClass: "bg-amber-500 text-white",
    image: cropRubber,
  },
  {
    id: "pepper",
    name: "Black Pepper",
    nameMl: "കുരുമുളക് (Black Pepper)",
    timeframeKey: "dryingStage" as const,
    msp: "₹520 / kg MSP",
    badgeKey: "gradeA" as const,
    badgeClass: "bg-emerald-700 text-white",
    image: cropPepper,
  },
  {
    id: "cardamom",
    name: "Cardamom",
    nameMl: "ഏലം (Cardamom)",
    timeframeKey: "curingStage" as const,
    msp: "₹1,850 / kg MSP",
    badgeKey: "gradeSpecial" as const,
    badgeClass: "bg-emerald-800 text-white",
    image: cropCardamom,
  },
  {
    id: "arecanut",
    name: "Areca Nut",
    nameMl: "അടയ്ക്ക (Areca Nut)",
    timeframeKey: "sunDrying" as const,
    msp: "₹360 / kg MSP",
    badgeKey: "gradeA" as const,
    badgeClass: "bg-amber-600 text-white",
    image: cropArecanut,
  },
  {
    id: "nutmeg",
    name: "Nutmeg",
    nameMl: "ജാതിക്ക (Nutmeg)",
    timeframeKey: "maceSeparation" as const,
    msp: "₹280 / kg MSP",
    badgeKey: "healthy" as const,
    badgeClass: "bg-orange-600 text-white",
    image: cropNutmeg,
  },
  {
    id: "coffee",
    name: "Robusta Coffee",
    nameMl: "കാപ്പി (Robusta Coffee)",
    timeframeKey: "cherryPicking" as const,
    msp: "₹210 / kg MSP",
    badgeKey: "gradeA" as const,
    badgeClass: "bg-rose-700 text-white",
    image: cropCoffee,
  },
  {
    id: "banana",
    name: "Nendran Banana",
    nameMl: "നേന്ത്രക്കായ (Banana)",
    timeframeKey: "matureBunch" as const,
    msp: "₹42 / kg MSP",
    badgeKey: "healthy" as const,
    badgeClass: "bg-emerald-600 text-white",
    image: cropBanana,
  },
];

interface FarmerDashboardProps {
  onOpenBooking: (cropName?: string) => void;
  onOpenLiveQueue: () => void;
  onOpenBookingsList: () => void;
  onOpenPayments: () => void;
  onOpenAssisted: () => void;
  onOpenMap: () => void;
  onSelectCentre: (centreName: string) => void;
  onOpenNotifications: () => void;
}

export function FarmerDashboard({
  onOpenBooking,
  onOpenLiveQueue,
  onOpenBookingsList,
  onOpenPayments,
  onOpenAssisted,
  onOpenMap,
  onSelectCentre,
  onOpenNotifications,
}: FarmerDashboardProps) {
  const {
    user,
    setUser,
    activeBooking,
    completedBooking,
    rejectedBooking,
    centres,
    crops,
    language,
    nowServing,
    predictWaitingTime,
    getRecommendedCentre,
    notifications,
    cancelBooking,
    bookSlot,
    addNotification,
  } = useKisanQueue();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [tempSelectedCrops, setTempSelectedCrops] = useState<string[]>([]);
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Crops displayed in "My Crops & Fields"
  const displayedCrops = useMemo(() => {
    if (user?.crops && user.crops.length > 0) {
      return CROPS_DATA.filter((c) => user.crops?.includes(c.id));
    }
    if (user?.primaryCrop) {
      const lower = user.primaryCrop.toLowerCase();
      const matched = CROPS_DATA.filter((c) => lower.includes(c.id));
      if (matched.length > 0) return matched;
    }
    return CROPS_DATA.slice(0, 2);
  }, [user?.crops, user?.primaryCrop]);

  const handleOpenAddCropModal = () => {
    const initialSelected =
      user?.crops && user.crops.length > 0
        ? user.crops
        : displayedCrops.map((c) => c.id);
    setTempSelectedCrops(initialSelected);
    setShowAddCropModal(true);
  };

  const recommendedCentre = getRecommendedCentre();
  const currentCentre = centres.find((c) => c.id === activeBooking?.centreId) || recommendedCentre || centres[0];
  const userQueueNumber = activeBooking ? activeBooking.queueNumber : null;
  const prediction = (activeBooking && currentCentre?.id)
    ? predictWaitingTime(currentCentre.id, activeBooking.queueNumber)
    : { timeStr: "Immediate", minutesLeft: 0, delayMinutes: 0 };
  const farmersAhead = activeBooking ? Math.max(0, activeBooking.queueNumber - nowServing) : 0;

  return (
    <div className="content-stack pt-2 space-y-4">
      {/* LANDSCAPE HERO CARD (Matches Reference Design: Golden Hour Field + Weather + 3 Frosted Metric Cards) */}
      <section className="relative overflow-hidden rounded-[32px] shadow-xl text-white">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        />
        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/85" />

        <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-between">
          {/* Top Bar inside Hero */}
          <div className="flex items-center justify-between">
            {/* Left: Farm / Avatar circle */}
            <div className="flex size-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-md">
              <Sprout className="size-6 text-emerald-400" />
            </div>

            {/* Center: Greeting & Date */}
            <div className="text-center">
              <p className="text-base font-extrabold text-white drop-shadow-sm leading-tight">
                {t(language, "goodMorning")}, {user?.name && user.name !== "Guest Farmer" ? user.name.split(" ")[0] : "Farmer"}
              </p>
              <p className="text-[11px] sm:text-xs text-white/80 font-medium leading-tight mt-0.5">
                Friday, 10 Sep 2026
              </p>
            </div>

            {/* Right: Notifications & Assisted */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenNotifications}
                className="relative flex size-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-colors shadow-md"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex size-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>
              <button
                type="button"
                onClick={onOpenAssisted}
                className="flex size-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-colors shadow-md"
                title="Toll-Free IVR Call Booking (1800-425-1661)"
                aria-label="Toll-Free IVR Call Booking"
              >
                <Headphones className="size-4" />
              </button>
            </div>
          </div>

          {/* 3 Frosted Metric Cards (Matching reference image with robust font sizing & no overflow) */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 mt-3">
            {/* Metric 1: Now Serving */}
            <div className="min-w-0 overflow-hidden rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 p-2 sm:p-2.5 text-white shadow-md flex flex-col justify-between">
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-white/90 font-semibold min-w-0">
                <Wind className="size-3 shrink-0 text-emerald-400" />
                <span className="truncate">{t(language, "nowServing")}</span>
              </div>
              <p className="text-lg sm:text-xl font-black mt-1 text-[#F5B544] tracking-tight tabular-nums truncate leading-tight">
                #{nowServing}
              </p>
              <p className="text-[9px] sm:text-[10px] text-white/70 truncate mt-0.5">{t(language, "weighBay")}</p>
            </div>

            {/* Metric 2: Your Token */}
            <div
              onClick={() => {
                if (!activeBooking && completedBooking) {
                  onOpenPayments();
                } else {
                  onOpenBooking();
                }
              }}
              className="min-w-0 overflow-hidden rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 p-2 sm:p-2.5 text-white shadow-md cursor-pointer hover:bg-black/50 transition-all flex flex-col justify-between"
              title={
                activeBooking
                  ? `Your active token #${userQueueNumber}`
                  : completedBooking
                  ? `Token #${completedBooking.queueNumber} completed! View advice.`
                  : t(language, "tapToGenerate")
              }
            >
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-white font-bold min-w-0">
                <Sparkles className="size-3 shrink-0 text-amber-300" />
                <span className="truncate">{t(language, "yourToken")}</span>
              </div>
              <p className="text-lg sm:text-xl font-black mt-1 text-white tracking-tight tabular-nums truncate leading-tight">
                {userQueueNumber ? `#${userQueueNumber}` : completedBooking ? `#${completedBooking.queueNumber}` : "—"}
              </p>
              {activeBooking ? (
                farmersAhead === 0 && nowServing === userQueueNumber ? (
                  <p className="text-[9px] sm:text-[10px] text-amber-300 font-extrabold truncate mt-0.5 animate-pulse">
                    ⚡ {t(language, "servingNow") || "It's Your Turn!"}
                  </p>
                ) : userQueueNumber !== null && nowServing > userQueueNumber ? (
                  <p className="text-[9px] sm:text-[10px] text-emerald-300 font-bold truncate mt-0.5">
                    ✓ Done
                  </p>
                ) : (
                  <p className="text-[9px] sm:text-[10px] text-emerald-400 font-bold truncate mt-0.5">
                    {farmersAhead} {t(language, "farmersAhead")}
                  </p>
                )
              ) : completedBooking ? (
                <p className="text-[9px] sm:text-[10px] text-emerald-300 font-bold truncate mt-0.5">
                  ✓ Turn Done (Paid)
                </p>
              ) : (
                <p className="text-[9px] sm:text-[10px] text-emerald-300 font-semibold truncate mt-0.5">
                  {user?.farmerId && user.farmerId !== "GUEST" ? "Tap to Book" : "Login to Book"}
                </p>
              )}
            </div>

            {/* Metric 3: Wait Turn */}
            <div className="min-w-0 overflow-hidden rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 p-2 sm:p-2.5 text-white shadow-md flex flex-col justify-between">
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-white/90 font-semibold min-w-0">
                <Droplets className="size-3 shrink-0 text-blue-300" />
                <span className="truncate">{t(language, "waitTurn")}</span>
              </div>
              <p className="text-lg sm:text-xl font-black mt-1 text-white tracking-tight tabular-nums truncate leading-tight">
                {activeBooking ? (
                  nowServing === userQueueNumber ? "0m" :
                  userQueueNumber !== null && nowServing > userQueueNumber ? "0m" :
                  prediction.minutesLeft > 0 ? `~${prediction.minutesLeft}m` : "Ready"
                ) : completedBooking ? (
                  "0m"
                ) : "—"}
              </p>
              <p className="text-[9px] sm:text-[10px] text-white/70 truncate mt-0.5">
                {activeBooking ? (
                  nowServing === userQueueNumber ? "At Bay 1 Now" :
                  userQueueNumber !== null && nowServing > userQueueNumber ? "Completed" :
                  prediction.timeStr || "05:16"
                ) : completedBooking ? (
                  "Completed at Bay 1"
                ) : "No active booking"}
              </p>
            </div>
          </div>

          {/* Hero Action Buttons */}
          <div className="grid grid-cols-[1.3fr_1fr] gap-2 sm:gap-2.5 mt-3">
            <button
              type="button"
              onClick={onOpenLiveQueue}
              className="flex items-center justify-between rounded-2xl bg-white text-[#123D35] px-3.5 py-3 text-xs sm:text-sm font-extrabold shadow-lg hover:bg-white/95 active:scale-95 transition-all min-w-0"
            >
              <span className="truncate">{t(language, "trackLiveQueue")}</span>
              <ChevronRight className="size-4 shrink-0 stroke-[3]" />
            </button>
            {activeBooking ? (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/20 bg-black/45 backdrop-blur-md px-3 py-3 text-xs sm:text-sm font-bold text-white hover:bg-black/60 active:scale-95 transition-all shadow-md min-w-0"
              >
                <XCircle className="size-4 shrink-0" />
                <span className="truncate">{t(language, "cancelSlot")}</span>
              </button>
            ) : completedBooking ? (
              <button
                type="button"
                onClick={() => onOpenBooking()}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/20 bg-black/45 backdrop-blur-md px-3 py-3 text-xs sm:text-sm font-bold text-white hover:bg-black/60 active:scale-95 transition-all shadow-md min-w-0"
              >
                <Plus className="size-4 shrink-0" />
                <span className="truncate">Book Next Lot</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenBooking()}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/20 bg-black/45 backdrop-blur-md px-3 py-3 text-xs sm:text-sm font-bold text-white hover:bg-black/60 active:scale-95 transition-all shadow-md min-w-0"
              >
                <CalendarDays className="size-4 shrink-0" />
                <span className="truncate">{t(language, "customSlot")}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Turn Announcement Banner (When staff calls farmer's token) */}
      {activeBooking && nowServing === userQueueNumber && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white shadow-lg animate-pulse">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-white text-emerald-800 font-extrabold text-xl shadow-md shrink-0">
                ⚡
              </span>
              <div>
                <h3 className="font-display text-sm sm:text-base font-extrabold text-white">
                  IT'S YOUR TURN! (TOKEN #{userQueueNumber})
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Officer is waiting for you at <strong>Weighing Bay 1</strong>. Please drive in with your vehicle!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenLiveQueue}
              className="rounded-xl bg-white px-3.5 py-2 text-xs font-black text-emerald-800 shadow-md hover:bg-emerald-50 active:scale-95 transition-all shrink-0"
            >
              Open Bay →
            </button>
          </div>
        </div>
      )}

      {/* Active Booking Card (Shows Token, Centre & IVR/Web source) */}
      {activeBooking && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/70 p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-700 text-white font-mono font-black text-base shadow-sm shrink-0">
              #{activeBooking.queueNumber}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-bold text-stone-900">
                  Active Booking: {activeBooking.crop} ({activeBooking.quantityKg} kg)
                </h4>
                {activeBooking.bookingSource === "ivr" ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold flex items-center gap-1">
                    <Phone className="size-2.5" /> Booked via Toll-Free Call
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-semibold">
                    Web Booking
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5">
                {activeBooking.centreName} · {activeBooking.date}, {activeBooking.slotTime}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenLiveQueue}
            className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            Track Queue
          </button>
        </div>
      )}

      {/* Turn Completed & Verified Banner (Post-turn celebratory state) */}
      {!activeBooking && completedBooking && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-4 text-white shadow-lg animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-white text-emerald-800 font-extrabold text-xl shadow-md shrink-0">
                🎉
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-sm sm:text-base font-extrabold text-white">
                    TURN COMPLETED &amp; VERIFIED! (TOKEN #{completedBooking.queueNumber})
                  </h3>
                  <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-100 border border-emerald-300/30">
                    Grade A Approved
                  </span>
                </div>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Your lot of <strong>{completedBooking.crop} ({completedBooking.quantityKg} kg)</strong> was verified at Weighing Bay 1. MSP payment advice is ready.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={onOpenPayments}
                className="rounded-xl bg-white px-3.5 py-2 text-xs font-black text-emerald-900 shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <IndianRupee className="size-3.5" /> View Payment Advice
              </button>
              <button
                type="button"
                onClick={() => onOpenBooking()}
                className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20 active:scale-95 transition-all"
              >
                + Book Next Lot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lot Rejected Banner (If staff rejected the lot) */}
      {!activeBooking && !completedBooking && rejectedBooking && (
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-foreground shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-600">
              <XCircle className="size-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Procurement Lot Not Accepted — Token #{rejectedBooking.queueNumber}
                </h4>
                <span className="text-[10px] font-medium text-muted-foreground">{rejectedBooking.date}</span>
              </div>
              <p className="mt-1 text-xs text-foreground/90 font-medium">
                Reason: {rejectedBooking.cancellationReason || "Moisture content or quality parameters exceeded allowable threshold."}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                You can rectify the lot (e.g. sun drying or cleaning) and book a new appointment.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onOpenBooking()}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors"
                >
                  Book New Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delay Alert Broadcast Banner (if operational delay exists) */}
      {currentCentre && currentCentre.activeDelayMinutes > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-amber-500/15 p-4 text-foreground shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/25 text-amber-700">
              <AlertTriangle className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  ⚠️ Operational Delay at {currentCentre.name}
                </h3>
                <span className="rounded-full bg-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:text-amber-200">
                  +{currentCentre.activeDelayMinutes} mins
                </span>
              </div>
              <p className="mt-1 text-xs text-amber-950/80 dark:text-amber-100/90 leading-relaxed">
                {currentCentre.delayReason || "Moisture testing meter calibration in progress."}
              </p>
              <p className="mt-1.5 text-xs font-semibold text-amber-950 dark:text-amber-100">
                🔄 Smart Queue Engine recalculated your expected turn:{" "}
                <strong className="underline">{prediction.timeStr}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* My Crops & Harvest Section (Horizontal Scrollable Cards matching reference image) */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t(language, "myCrops")} ({displayedCrops.length})
            </h3>
            <button
              type="button"
              onClick={handleOpenAddCropModal}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-0.5 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs border border-primary/20"
              title="Add / Manage Crops"
            >
              <Plus className="size-3.5 stroke-[2.5]" />
              <span>{language === "ml" ? "ചേർക്കുക" : "Add"}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={handleOpenAddCropModal}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            {language === "ml" ? "മാറ്റുക" : "Manage"}
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {displayedCrops.map((crop) => (
            <div
              key={crop.id}
              onClick={() => onOpenBooking(crop.name)}
              className="group min-w-[145px] max-w-[155px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <div className="relative h-20 w-full overflow-hidden bg-muted">
                <img
                  src={crop.image}
                  alt={crop.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className={`absolute top-1.5 left-1.5 rounded-full px-2 py-0.5 text-[8px] font-bold shadow-sm ${crop.badgeClass}`}>
                  {t(language, crop.badgeKey)}
                </span>
              </div>
              <div className="p-2.5">
                <h4 className="text-xs font-bold truncate text-foreground">
                  {language === "ml" ? crop.nameMl : crop.name}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t(language, crop.timeframeKey)}</p>
              </div>
            </div>
          ))}

          {/* Quick "+ Add Crop" Card at the end of the scroll list */}
          <button
            type="button"
            onClick={handleOpenAddCropModal}
            className="min-w-[120px] max-w-[130px] shrink-0 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary transition-all p-3 cursor-pointer group active:scale-95"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-background shadow-xs border border-primary/20 group-hover:scale-110 transition-transform mb-1.5">
              <Plus className="size-5 text-primary stroke-[2.5]" />
            </span>
            <span className="text-xs font-bold text-foreground">
              {language === "ml" ? "വിള ചേർക്കുക" : "Add Crop"}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {language === "ml" ? "+ വിള ചേർക്കുക" : "Tap to add"}
            </span>
          </button>
        </div>
      </section>



      {/* Quick Actions (SIH Priority 1-4) */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t(language, "quickActions")}
          </h3>
          <button
            onClick={onOpenMap}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <Map className="size-3.5" /> {t(language, "mapView")}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => onOpenBooking()}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-2 sm:p-2.5 text-foreground transition-all hover:border-primary/50 hover:shadow-sm active:scale-95 min-w-0"
          >
            <span className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Ticket className="size-4 sm:size-5" />
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-center leading-tight line-clamp-2 w-full break-words">{t(language, "generateToken")}</span>
          </button>

          <button
            type="button"
            onClick={onOpenLiveQueue}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-2 sm:p-2.5 text-foreground transition-all hover:border-primary/50 hover:shadow-sm active:scale-95 min-w-0"
          >
            <span className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <UsersRound className="size-4 sm:size-5" />
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-center leading-tight line-clamp-2 w-full break-words">{t(language, "liveQueue")}</span>
          </button>

          <button
            type="button"
            onClick={onOpenBookingsList}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-2 sm:p-2.5 text-foreground transition-all hover:border-primary/50 hover:shadow-sm active:scale-95 min-w-0"
          >
            <span className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <PackageCheck className="size-4 sm:size-5" />
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-center leading-tight line-clamp-2 w-full break-words">{t(language, "myBookings")}</span>
          </button>

          <button
            type="button"
            onClick={onOpenPayments}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-2 sm:p-2.5 text-foreground transition-all hover:border-primary/50 hover:shadow-sm active:scale-95 min-w-0"
          >
            <span className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <IndianRupee className="size-4 sm:size-5" />
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-center leading-tight line-clamp-2 w-full break-words">{t(language, "paymentStatus")}</span>
          </button>
        </div>
      </section>

      {/* Toll-Free IVR Phone Call Simulation Banner (Digital Inclusion for Keypad Phones) */}
      <section className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-emerald-500/10 to-primary/5 p-3.5 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shrink-0">
              <PhoneCall className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-foreground">
                  {language === "ml"
                    ? "സ്മാർട്ട്ഫോൺ ഇല്ലേ? ടോൾ-ഫ്രീ വിളിക്കുക"
                    : "No Smartphone? Book via Toll-Free Call"}
                </span>
                <span className="rounded-full bg-primary/20 text-primary px-1.5 py-0.5 text-[9.5px] font-mono font-bold">
                  1800-425-1661
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                {language === "ml"
                  ? "സാധാരണ കീപാഡ് ഫോണിലൂടെ IVR / ശബ്ദ ബുക്കിംഗ് നടത്താം."
                  : "Interactive Voice Response (IVR) & keypad booking for feature phones."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAssisted}
            className="shrink-0 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
          >
            <span>{language === "ml" ? "വിളിക്കുക" : "Simulate Call"}</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </section>

      {/* Smart Centre Recommendation Card (SIH Strong Differentiator) */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
              <Sparkles className="size-3.5" />
            </span>
            <h3 className="font-display text-sm font-bold">{t(language, "recommendedCentre")}</h3>
          </div>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            AI / Multi-Factor Engine
          </span>
        </div>

        <div className="rounded-xl bg-muted/40 p-3 border border-border/80">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-xs">{recommendedCentre.name}</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                <span>📍 {recommendedCentre.distanceKm} km</span>
                <span>👥 {recommendedCentre.currentQueueLength} {t(language, "farmersAhead")}</span>
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/15 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
              ⭐ {t(language, "fastestTurn")}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs border-t border-border/60 pt-2">
            <span className="text-muted-foreground text-[11px]">
              {t(language, "estWait")}: <strong>~{recommendedCentre.currentQueueLength * recommendedCentre.avgProcessingMinutes} mins</strong>
            </span>
            <button
              type="button"
              onClick={() => onSelectCentre(recommendedCentre.name)}
              className="font-bold text-primary hover:underline inline-flex items-center gap-1 text-xs"
            >
              {t(language, "bookHere")} <ChevronRight className="size-3" />
            </button>
          </div>
        </div>
      </section>

      {/* Nearby Procurement Centres List */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t(language, "nearbyCentres")} ({centres.length})
          </h3>
          <button
            onClick={onOpenMap}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {t(language, "viewOnMap")}
          </button>
        </div>

        {centres.map((centre) => (
          <div
            key={centre.id}
            onClick={() => onSelectCentre(centre.name)}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/50 cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                <Wheat className="size-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold truncate">{centre.name}</h4>
                <p className="text-[11px] text-muted-foreground">
                  {centre.distanceKm} km · {centre.currentQueueLength} waiting · {centre.workingHours}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  centre.status === "normal"
                    ? "bg-emerald-500/15 text-emerald-700"
                    : centre.status === "busy"
                    ? "bg-amber-500/15 text-amber-700"
                    : "bg-destructive/15 text-destructive"
                }`}
              >
                {centre.status === "normal" ? t(language, "congestionLow") : centre.status === "busy" ? t(language, "congestionMed") : t(language, "delayReported")}
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                ~{centre.currentQueueLength * centre.avgProcessingMinutes + centre.activeDelayMinutes}m wait
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm overflow-hidden rounded-[24px] border border-border bg-card p-5 text-foreground shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="size-5" />
                <h3 className="font-display font-bold text-base text-foreground">
                  {language === "ml" ? "ബുക്കിംഗ് റദ്ദാക്കണോ?" : language === "hi" ? "बुकिंग रद्द करें?" : "Cancel Booking?"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to cancel your slot for <strong>Token #{activeBooking.queueNumber}</strong> at <strong>{activeBooking.centreName}</strong>? This slot will be released for other waiting farmers.
            </p>
            <div className="rounded-xl bg-muted/40 p-3 text-xs space-y-1 font-mono">
              <p>Booking ID: <strong>{activeBooking.id}</strong></p>
              <p>Crop: <strong>{activeBooking.crop} ({activeBooking.quantityKg} kg)</strong></p>
              <p>Slot: <strong>{activeBooking.date} · {activeBooking.slotTime}</strong></p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="rounded-xl border border-border bg-background py-2.5 text-xs font-semibold hover:bg-muted"
              >
                {t(language, "keepSpot")}
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelBooking(activeBooking.id);
                  setShowCancelModal(false);
                }}
                className="rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition-colors"
              >
                {t(language, "yesCancelSlot")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Manage Crops Modal */}
      {showAddCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-background rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sprout className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {language === "ml" ? "എന്റെ വിളകൾ ക്രമീകരിക്കുക" : "Manage My Crops & Fields"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {tempSelectedCrops.length} {language === "ml" ? "വിളകൾ തിരഞ്ഞെടുത്തു" : "crops selected"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCropModal(false)}
                className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body - Crop Selection Grid */}
            <div className="p-4 overflow-y-auto space-y-3">
              <p className="text-xs text-muted-foreground">
                {language === "ml"
                  ? "നിങ്ങൾ കൃഷി ചെയ്യുന്ന വിളകൾ തിരഞ്ഞെടുക്കുക. ഇതനുസരിച്ച് താങ്ങുവിലയും സംഭരണ സ്ലോട്ടുകളും ലഭിക്കും."
                  : "Select all the crops you cultivate. This personalizes your MSP rates, booking quotas, and harvest procurement alerts."}
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                {CROPS_DATA.map((crop) => {
                  const isSelected = tempSelectedCrops.includes(crop.id);
                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => {
                        setTempSelectedCrops((prev) =>
                          prev.includes(crop.id)
                            ? prev.filter((id) => id !== crop.id)
                            : [...prev, crop.id]
                        );
                      }}
                      className={`relative flex flex-col items-center rounded-2xl p-2 text-center transition-all border cursor-pointer active:scale-95 ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                          : "border-border bg-card hover:border-muted-foreground/30 opacity-70"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                          <Check className="size-3 stroke-[3]" />
                        </span>
                      )}
                      <img
                        src={crop.image}
                        alt={crop.name}
                        className="size-14 rounded-xl object-cover shadow-xs"
                      />
                      <span className="mt-1.5 text-[11px] font-bold text-foreground leading-tight line-clamp-1">
                        {language === "ml" ? crop.nameMl.split(" ")[0] : crop.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {crop.msp.split(" ")[0]}/kg
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddCropModal(false)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                {language === "ml" ? "റദ്ദാക്കുക" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={tempSelectedCrops.length === 0}
                onClick={() => {
                  if (tempSelectedCrops.length === 0) return;
                  const cropNames = tempSelectedCrops
                    .map((id) => {
                      const c = CROPS_DATA.find((item) => item.id === id);
                      return c ? (language === "ml" ? c.nameMl.split(" ")[0] : c.name) : "";
                    })
                    .filter(Boolean)
                    .join(" & ");
                  setUser((prev) => ({
                    ...prev,
                    crops: tempSelectedCrops,
                    primaryCrop: cropNames || prev.primaryCrop || "Paddy",
                  }));
                  addNotification(
                    language === "ml" ? "വിളകൾ പുതുക്കി" : "Crops Updated",
                    language === "ml"
                      ? `നിങ്ങളുടെ വിളകൾ പുതുക്കി (${tempSelectedCrops.length} എണ്ണം തിരഞ്ഞെടുത്തു).`
                      : `Your crops have been updated (${tempSelectedCrops.length} selected).`,
                    "success"
                  );
                  setShowAddCropModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {language === "ml"
                  ? `സംരക്ഷിക്കുക (${tempSelectedCrops.length})`
                  : `Save Crops (${tempSelectedCrops.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
