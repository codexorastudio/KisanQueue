import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  CalendarDays,
  UsersRound,
  PackageCheck,
  IndianRupee,
  UserRound,
  Leaf,
  Sprout,
  Languages,
  CircleHelp,
  Phone,
  PhoneCall,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Settings2,
  Sliders,
  LogOut,
  Sparkles,
  Building2,
  LogIn,
  KeyRound,
  ExternalLink,
  X,
} from "lucide-react";

import { useKisanQueue } from "@/lib/store";
import { useTranslation, t, SUPPORTED_LANGUAGES } from "@/lib/translations";
import { NotificationDrawer } from "@/components/common/NotificationDrawer";
import { AuthModal } from "@/components/auth/AuthModal";

import heroImage from "@/assets/smartprocure-home.jpg";
import splashImage from "@/assets/smartprocure-splash.jpg";

// Farmer components
import { FarmerDashboard } from "@/components/farmer/FarmerDashboard";
import { SlotBookingModal } from "@/components/farmer/SlotBookingModal";
import { AssistedBookingModal } from "@/components/farmer/AssistedBookingModal";
import { LiveQueueView } from "@/components/farmer/LiveQueueView";
import { MyBookingsView } from "@/components/farmer/MyBookingsView";
import { ProcurementTimelineView } from "@/components/farmer/ProcurementTimelineView";
import { PaymentTrackingView } from "@/components/farmer/PaymentTrackingView";
import { CentreMapView } from "@/components/farmer/CentreMapView";
import { KisanQueueAIChatbot } from "@/components/KisanQueueAIChatbot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KisanQueue — Fair & Fast Farmer Queue Management System" },
      {
        name: "description",
        content:
          "AI-driven procurement slot booking, live waiting time prediction, queue monitoring, and direct MSP payment tracking for farmers.",
      },
      { property: "og:title", content: "KisanQueue — Smart Agricultural Queue" },
      {
        property: "og:description",
        content: "Smart queue management for Kerala agricultural procurement centres.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: KisanQueueApp,
});

type FarmerScreen = "splash" | "onboarding" | "home" | "bookings" | "queue" | "timeline" | "payment" | "map" | "profile";

const FARMER_NAV_ITEMS: { id: FarmerScreen; label: string; navKey: any; icon: typeof Leaf }[] = [
  { id: "home", label: "Home", navKey: "navHome", icon: Sprout },
  { id: "bookings", label: "Bookings", navKey: "navBookings", icon: CalendarDays },
  { id: "map", label: "Map", navKey: "navMap", icon: MapPin },
  { id: "queue", label: "Queue", navKey: "navQueue", icon: UsersRound },
  { id: "profile", label: "Profile", navKey: "navProfile", icon: UserRound },
];

const ONBOARDING = [
  {
    eyebrow: "Your time matters",
    title: "Skip the Queue",
    copy: "Spend less time waiting at procurement centres.",
    focus: "queue",
  },
  {
    eyebrow: "Plan with confidence",
    title: "Book Your Slot",
    copy: "Choose the best time to bring your produce.",
    focus: "slot",
  },
  {
    eyebrow: "Arrive right on time",
    title: "Know When to Arrive",
    copy: "Track your queue and estimated waiting time.",
    focus: "arrival",
  },
] as const;

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={inverse ? "brand-mark brand-mark-inverse" : "brand-mark"}>
        <Leaf className="size-5" strokeWidth={2.2} />
        <span />
      </span>
      <span className={inverse ? "font-display text-2xl text-primary-foreground" : "font-display text-2xl text-foreground"}>
        KisanQueue
      </span>
    </div>
  );
}

function AppButton({
  children,
  tone = "primary",
  onClick,
  className = "",
}: {
  children: ReactNode;
  tone?: "primary" | "soft" | "ghost" | "danger";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button className={`app-button app-button-${tone} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Splash({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const { language, setLanguage } = useKisanQueue();
  const navigate = useNavigate();
  return (
    <main className="splash-screen">
      <img
        src={splashImage}
        alt="Farmer with harvested grain at a procurement centre"
        width={1088}
        height={1600}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="splash-shade" />
      <div className="relative z-10 flex min-h-dvh flex-col px-6 pb-8 pt-10 sm:mx-auto sm:max-w-md">
        <div className="flex items-center justify-between">
          <Logo inverse />
          <button
            onClick={onSkip}
            className="rounded-full bg-black/30 border border-white/25 px-4 py-1.5 text-xs font-bold text-white hover:bg-black/50 backdrop-blur-md transition-all active:scale-95 shadow-sm"
          >
            Skip →
          </button>
        </div>
        <div className="mt-auto">
          <p className="eyebrow text-secondary font-semibold">Kerala Agricultural Department</p>
          <h1 className="mt-2 font-display text-6xl leading-[0.92] text-primary-foreground">
            Kisan<br />Queue
          </h1>
          <p className="mt-4 text-sm leading-6 text-primary-foreground/85">
            {t(language, "subTagline")}
          </p>
          <AppButton
            tone="soft"
            className="mt-7 w-full flex items-center justify-center gap-2 py-3.5 font-bold text-base shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            onClick={() => navigate({ to: "/login" })}
          >
            <LogIn className="size-4" />
            <span>{language === "ml" ? "ലോഗിൻ ചെയ്യുക" : "Login"}</span>
            <ChevronRight className="size-4" />
          </AppButton>
          <button
            type="button"
            onClick={onSkip}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-white/30 bg-white/10 text-white font-semibold text-xs hover:bg-white/20 backdrop-blur-md transition-all active:scale-[0.99] cursor-pointer"
          >
            <span>{language === "ml" ? "ലോഗിൻ ചെയ്യാതെ തുടരുക (Guest)" : "Continue as Guest"}</span>
          </button>
        </div>
      </div>
    </main>
  );
}

function Onboarding({
  step,
  onNext,
  onBack,
  onSkip,
}: {
  step: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const item = ONBOARDING[step] ?? ONBOARDING[0];
  return (
    <main className="min-h-dvh bg-background p-4 sm:grid sm:place-items-center">
      <section className="relative mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-[2rem] bg-primary p-5 text-primary-foreground shadow-float sm:min-h-[760px]">
        <div className="pointer-events-none absolute inset-0 bg-dots text-white/10" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="flex size-8 items-center justify-center rounded-full bg-white/15 text-primary-foreground hover:bg-white/25 transition-all"
              aria-label="Previous step"
              title="Go Back"
            >
              <ChevronLeft className="size-4" />
            </button>
            <Logo inverse />
          </div>
          <button
            className="text-xs font-semibold text-primary-foreground/75 hover:text-white transition-colors"
            onClick={onSkip}
          >
            Skip
          </button>
        </div>
        <div className="onboarding-visual mt-8">
          <img
            src={heroImage}
            alt="Farmers arriving at a procurement centre"
            width={1600}
            height={912}
            className="h-full w-full object-cover"
          />
          <div className="queue-ticket">
            <span>YOUR TOKEN</span>
            <strong>#47</strong>
            <small>24 min</small>
          </div>
        </div>
        <div className="mt-auto pt-8">
          <p className="eyebrow text-secondary">{item.eyebrow}</p>
          <h1 className="mt-3 font-display text-5xl leading-none">{item.title}</h1>
          <p className="mt-4 max-w-xs text-sm leading-6 text-primary-foreground/75">{item.copy}</p>
          <div className="mt-8 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 rounded-xl border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-white/20 transition-all active:scale-95"
            >
              <ChevronLeft className="size-4" /> Back
            </button>

            <div className="flex gap-1.5">
              {ONBOARDING.map((_, index) => (
                <span
                  key={index}
                  className={index === step ? "pager-dot pager-dot-active" : "pager-dot"}
                />
              ))}
            </div>

            <AppButton
              tone="soft"
              onClick={onNext}
              className="flex items-center gap-1 font-semibold text-xs py-2 px-4 shadow-md"
            >
              {step === 2 ? "Open KisanQueue" : "Next"}
              <ChevronRight className="size-4" />
            </AppButton>
          </div>
        </div>
      </section>
    </main>
  );
}

function KisanQueueApp() {
  const {
    role,
    setRole,
    language,
    setLanguage,
    user,
    activeBooking,
    nowServing,
    largeText,
    highContrast,
    isLoggedIn,
    logout,
    addNotification,
  } = useKisanQueue();
  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  // Initialize cleanly as splash to match SSR 100%; restore login or URL param on mount
  const [farmerScreen, setFarmerScreen] = useState<FarmerScreen>("splash");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedCentreForBooking, setSelectedCentreForBooking] = useState<string | null>(null);
  const [selectedCropForBooking, setSelectedCropForBooking] = useState<string | null>(null);
  const [assistedModalOpen, setAssistedModalOpen] = useState(false);

  // Read URL search params and login state safely on mount AFTER hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLogin = localStorage.getItem("kisanqueue_logged_in") === "true";
      const params = new URLSearchParams(window.location.search);
      const screenParam = params.get("screen") as FarmerScreen | null;

      if (
        screenParam &&
        ["home", "bookings", "queue", "timeline", "payment", "map", "profile"].includes(screenParam)
      ) {
        setFarmerScreen(screenParam);
      } else if (storedLogin) {
        setFarmerScreen("home");
      }
    }
  }, []);

  useEffect(() => {
    setRole("farmer");
  }, [setRole]);

  // Keep user on home dashboard if logged in
  useEffect(() => {
    if (isLoggedIn) {
      if (farmerScreen === "splash" || farmerScreen === "onboarding") {
        setFarmerScreen("home");
      }
    }
  }, [isLoggedIn]);

  // If user is on pure Splash screen
  if (farmerScreen === "splash") {
    return (
      <div
        className={`min-h-screen bg-background text-foreground ${
          largeText ? "text-lg" : ""
        } ${highContrast ? "contrast-125" : ""}`}
      >
        <Splash
          onNext={() => {
            navigate({ to: "/login" });
          }}
          onSkip={() => setFarmerScreen("home")}
        />
      </div>
    );
  }

  // If user is on Onboarding walkthrough
  if (farmerScreen === "onboarding") {
    return (
      <div
        className={`min-h-screen bg-background text-foreground ${
          largeText ? "text-lg" : ""
        } ${highContrast ? "contrast-125" : ""}`}
      >
        <Onboarding
          step={onboardingStep}
          onBack={() => {
            if (onboardingStep > 0) {
              setOnboardingStep((v) => v - 1);
            } else {
              setFarmerScreen("splash");
            }
          }}
          onSkip={() => setFarmerScreen("home")}
          onNext={() => {
            if (onboardingStep < 2) {
              setOnboardingStep((v) => v + 1);
            } else {
              setFarmerScreen("home");
            }
          }}
        />
      </div>
    );
  }


  // Main Farmer App
  return (
    <div
      className={`min-h-screen flex flex-col bg-background text-foreground ${
        largeText ? "text-lg" : ""
      } ${highContrast ? "contrast-125" : ""}`}
    >
      <div className="app-canvas flex-1">
        {/* Desktop Sidebar Rail */}
        <aside className="desktop-rail">
          <Logo />
          <div className="mt-8">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              👨‍🌾 Farmer Portal
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight">
              Fair & Fast<br />Procurement
            </h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Skip long road queues. Book optimal slots, monitor live queue status, and track MSP DBT payments.
            </p>
          </div>

          <nav className="mt-8 space-y-1.5" aria-label="Desktop navigation">
            {FARMER_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = farmerScreen === item.id;
              const translatedLabel = t(language, item.navKey) || item.label;
              return (
                <button
                  key={item.id}
                  onClick={() => setFarmerScreen(item.id)}
                  className={`rail-item ${active ? "rail-item-active" : ""}`}
                >
                  <Icon className="size-5" />
                  <span>{translatedLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* Official Portals & Accessibility Hub in Rail */}
          <div className="mt-6 border-t border-border/50 pt-4 space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/90">
                Official Portals & Modes
              </p>
              <span className="text-[9px] font-bold text-primary/90 uppercase tracking-widest bg-primary/10 px-1.5 py-0.5 rounded-md">
                New Tab ↗
              </span>
            </div>

            <div className="space-y-1.5">
              {/* Farmer Onboarding / Login */}
              <a
                href="/login"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-border/70 bg-card/50 p-2 text-xs font-semibold text-foreground hover:bg-card hover:border-primary/50 hover:shadow-xs transition-all"
                title="Open Farmer Login & Onboarding in a new tab"
              >
                <span className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <LogIn className="size-3.5" />
                  </span>
                  <span>Farmer Login</span>
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground group-hover:text-primary transition-colors">
                  /login <ExternalLink className="size-3" />
                </span>
              </a>

              {/* Accessible / Senior Mode */}
              <a
                href="/old"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-emerald-300/80 bg-emerald-50/60 p-2 text-xs font-bold text-emerald-950 hover:bg-emerald-100/80 transition-all dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/80 hover:shadow-xs"
                title="Open Accessible Mode (Enlarged text & audio guidance) in a new tab"
              >
                <span className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs">
                    🌾
                  </span>
                  <span>Accessible Mode (Large Text)</span>
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                  /old <ExternalLink className="size-3" />
                </span>
              </a>

              {/* IVR Toll-Free Phone Call Simulator */}
              <a
                href="/call"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-amber-300/80 bg-amber-50/60 p-2 text-xs font-bold text-amber-950 hover:bg-amber-100/80 transition-all dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/80 hover:shadow-xs"
                title="Open Toll-Free IVR Phone Hotline Simulator in a new tab"
              >
                <span className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-amber-600 text-white">
                    <PhoneCall className="size-3" />
                  </span>
                  <span>IVR Phone Booking</span>
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-amber-700 dark:text-amber-400">
                  /call <ExternalLink className="size-3" />
                </span>
              </a>

              {/* Staff Yard Terminal */}
              <a
                href="/staff"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-border/70 bg-card/50 p-2 text-xs font-semibold text-foreground hover:bg-card hover:border-indigo-400 hover:shadow-xs transition-all"
                title="Open Staff Yard Inspection & Verification Portal in a new tab"
              >
                <span className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                    <Building2 className="size-3.5" />
                  </span>
                  <span>Staff Portal</span>
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground group-hover:text-indigo-600 transition-colors">
                  /staff <ExternalLink className="size-3" />
                </span>
              </a>

              {/* Admin Directorate */}
              <a
                href="/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-border/70 bg-card/50 p-2 text-xs font-semibold text-foreground hover:bg-card hover:border-purple-400 hover:shadow-xs transition-all"
                title="Open Directorate Admin & Quotas in a new tab"
              >
                <span className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
                    <ShieldCheck className="size-3.5" />
                  </span>
                  <span>Admin Directorate</span>
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground group-hover:text-purple-600 transition-colors">
                  /admin <ExternalLink className="size-3" />
                </span>
              </a>

              {/* Logout button (only shows if logged in) */}
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setFarmerScreen("splash");
                    addNotification("Logged Out", "You have been logged out of KisanQueue.", "info");
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="size-4" /> {language === "ml" ? "ലോഗ് ഔട്ട്" : "Log Out"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Live Token Snapshot in Rail */}
          <div className="relative mt-auto overflow-hidden rounded-2xl bg-primary p-4 text-primary-foreground shadow-md">
            <div className="pointer-events-none absolute inset-0 bg-dots text-white/10" />
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">
                Active Booking
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-300">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-red-500" />
                </span>
                Live
              </span>
            </div>
            <p className="relative mt-1 font-display text-3xl font-black text-secondary">
              {activeBooking ? `Token #${activeBooking.queueNumber}` : "No Token"}
            </p>
            <p className="relative mt-1 text-xs text-primary-foreground/80 truncate">
              {activeBooking ? activeBooking.centreName : "Procurement Portal Ready"}
            </p>
            <p className="relative mt-0.5 text-[11px] text-primary-foreground/60">
              {activeBooking
                ? `Now serving: #${nowServing} · ${Math.max(0, activeBooking.queueNumber - nowServing)} ahead`
                : `Now serving: #${nowServing} · Ready to issue token`}
            </p>
          </div>
        </aside>

        {/* Farmer Phone / Mobile View Shell */}
        <main className="phone-shell">
          <div className="phone-content">
            {farmerScreen === "home" && (
              <FarmerDashboard
                onOpenBooking={(cropName) => {
                  setSelectedCentreForBooking(null);
                  setSelectedCropForBooking(cropName || null);
                  setBookingModalOpen(true);
                }}
                onOpenLiveQueue={() => setFarmerScreen("queue")}
                onOpenBookingsList={() => setFarmerScreen("bookings")}
                onOpenPayments={() => setFarmerScreen("payment")}
                onOpenAssisted={() => setAssistedModalOpen(true)}
                onOpenMap={() => setFarmerScreen("map")}
                onSelectCentre={(centreName) => {
                  setSelectedCentreForBooking(centreName);
                  setBookingModalOpen(true);
                }}
                onOpenNotifications={() => setNotificationsOpen(true)}
              />
            )}

            {farmerScreen === "queue" && (
              <LiveQueueView
                onBack={() => setFarmerScreen("home")}
                onOpenReschedule={() => {
                  setSelectedCentreForBooking(null);
                  setBookingModalOpen(true);
                }}
                onOpenDirections={() => setFarmerScreen("map")}
              />
            )}

            {farmerScreen === "bookings" && (
              <MyBookingsView
                onBack={() => setFarmerScreen("home")}
                onOpenReschedule={(booking) => {
                  setSelectedCentreForBooking(booking?.centreName || null);
                  setBookingModalOpen(true);
                }}
              />
            )}

            {farmerScreen === "timeline" && (
              <ProcurementTimelineView onBack={() => setFarmerScreen("home")} />
            )}

            {farmerScreen === "payment" && (
              <PaymentTrackingView onBack={() => setFarmerScreen("home")} />
            )}

            {farmerScreen === "map" && (
              <CentreMapView
                onBack={() => setFarmerScreen("home")}
                onSelectCentre={(centreName) => {
                  setSelectedCentreForBooking(centreName);
                  setBookingModalOpen(true);
                }}
              />
            )}

            {farmerScreen === "profile" && (
              <FarmerProfileView
                onBack={() => setFarmerScreen("home")}
                onLogout={() => setFarmerScreen("splash")}
              />
            )}
          </div>

          {/* Mobile Bottom Navigation Pill */}
          <FarmerBottomNav screen={farmerScreen} onNavigate={setFarmerScreen} />
        </main>
      </div>

      {/* Global Modals */}
      <NotificationDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <SlotBookingModal
        isOpen={bookingModalOpen}
        initialCentreName={selectedCentreForBooking}
        initialCropName={selectedCropForBooking}
        onNavigateToQueue={() => setFarmerScreen("queue")}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedCentreForBooking(null);
          setSelectedCropForBooking(null);
        }}
      />
      <AssistedBookingModal isOpen={assistedModalOpen} onClose={() => setAssistedModalOpen(false)} />
      <KisanQueueAIChatbot />
    </div>
  );
}

function FarmerBottomNav({
  screen,
  onNavigate,
}: {
  screen: FarmerScreen;
  onNavigate: (s: FarmerScreen) => void;
}) {
  const { language } = useKisanQueue();
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <div className="bottom-nav-pill">
        {FARMER_NAV_ITEMS.map(({ id, label, navKey, icon: Icon }) => {
          const active = screen === id;
          const translatedLabel = t(language, navKey) || label;
          return (
            <button
              key={id}
              type="button"
              className={`bottom-nav-item ${active ? "bottom-nav-item-active" : ""}`}
              onClick={() => onNavigate(id)}
              aria-label={translatedLabel}
              title={translatedLabel}
            >
              <Icon className="bottom-nav-icon" strokeWidth={active ? 2.5 : 2} />
              <span className="bottom-nav-label">{translatedLabel}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function FarmerProfileView({
  onBack,
  onLogout,
}: {
  onBack: () => void;
  onLogout?: () => void;
}) {
  const { user, language, setLanguage, setRole, logout, addNotification } = useKisanQueue();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="content-stack pt-2 space-y-4">
      {/* Profile Cover Card */}
      <div className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-dots text-white/10" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="eyebrow text-secondary font-bold">Verified Farmer Profile</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold">
              <ShieldCheck className="size-3" /> Aadhaar Linked
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/25 hover:bg-rose-500/40 border border-rose-200/30 text-white px-3 py-1 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Log Out"
          >
            <LogOut className="size-3.5 text-rose-200" />
            <span>{language === "ml" ? "ലോഗ് ഔട്ട്" : "Log Out"}</span>
          </button>
        </div>

        <div className="relative z-10 mt-6 flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-secondary font-display text-2xl font-black text-primary shadow">
            {user.name
              ? user.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "KQ"}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{user.name}</h1>
            <p className="text-xs text-primary-foreground/80 font-mono">ID: {user.farmerId}</p>
            <p className="text-xs text-primary-foreground/70">{user.mobile}</p>
          </div>
        </div>
      </div>

      {/* Account Action Buttons: Switch Account & Log Out */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => navigate({ to: "/login" })}
          className="flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-card hover:bg-primary/5 p-3 text-xs font-bold text-foreground transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LogIn className="size-3.5" />
          </div>
          <span>{language === "ml" ? "അക്കൗണ്ട് മാറുക" : "Switch Account"}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 p-3 text-xs font-bold text-rose-700 dark:text-rose-300 transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-rose-200/60 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
            <LogOut className="size-3.5" />
          </div>
          <span>{language === "ml" ? "ലോഗ് ഔട്ട് ചെയ്യുക" : "Log Out"}</span>
        </button>
      </div>

      {/* Land & Crop Registry */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Agricultural Registry
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-muted/40 p-2.5">
            <span className="text-muted-foreground block text-[10px]">Village Panchayat</span>
            <strong className="text-foreground">{user.village}, {user.district}</strong>
          </div>
          <div className="rounded-xl bg-muted/40 p-2.5">
            <span className="text-muted-foreground block text-[10px]">Primary Crops</span>
            <strong className="text-foreground">{user.primaryCrop}</strong>
          </div>
          <div className="rounded-xl bg-muted/40 p-2.5 col-span-2">
            <span className="text-muted-foreground block text-[10px]">PFMS Direct Benefit Bank Account</span>
            <strong className="text-foreground font-mono">{user.bankAccount} ({user.ifsc})</strong>
          </div>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="size-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground">
              {t(language, "appLanguage")} / Indian Languages (8)
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {SUPPORTED_LANGUAGES.map((item) => (
            <button
              key={item.id}
              onClick={() => setLanguage(item.id)}
              className={`flex flex-col items-center justify-center rounded-xl border py-2.5 px-2 transition-all text-center ${
                language === item.id
                  ? "border-primary bg-primary text-primary-foreground shadow font-bold"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              <span className="text-xs font-bold leading-snug">{item.native}</span>
              <span className="text-[10px] opacity-75">{item.label}</span>
            </button>
          ))}
        </div>
      </div>


      {/* Support & Helpline */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t(language, "supportAssistance")}
        </h3>
        <a
          href="tel:18004251661"
          className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs font-semibold hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Phone className="size-4 text-primary" />
            <div>
              <p className="text-foreground">{t(language, "kisanCallCentre")}</p>
              <span className="text-[10px] text-muted-foreground font-mono">1800-180-1551 / 1800-425-1661</span>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </a>
      </div>

      {/* Official Government Portals & Accessibility Hub */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card to-muted/30 p-4.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs">
              🏛️
            </span>
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider">
              {t(language, "govPortals")} & Access Modes
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            <span>New Tab</span>
            <ExternalLink className="size-2.5" />
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug">
          Dedicated standalone portals for all stakeholders. Click any portal to launch in a new window without disrupting your active queue session.
        </p>

        <div className="grid grid-cols-1 gap-2.5 pt-1">
          {/* Farmer Login */}
          <a
            href="/login"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl border border-primary/25 bg-primary/5 p-3 hover:bg-primary/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <LogIn className="size-4" />
              </span>
              <div>
                <strong className="block text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                  {language === "ml" ? "കർഷക ലോഗിൻ പോർട്ടൽ" : "Farmer Login & Sign-Up"}
                </strong>
                <span className="block text-[10px] text-muted-foreground">
                  OTP verification & profile setup
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
              <span>/login</span>
              <ExternalLink className="size-3" />
            </div>
          </a>

          {/* Senior Mode */}
          <a
            href="/old"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl border border-emerald-300/80 bg-emerald-50/70 p-3 hover:bg-emerald-100 transition-all dark:bg-emerald-950/30 dark:border-emerald-800/80"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-700 text-white text-base shadow-xs">
                🌾
              </span>
              <div>
                <strong className="block text-xs font-extrabold text-emerald-950 dark:text-emerald-200">
                  {language === "ml"
                    ? "സുഗമ മോഡ് (Accessible & Large Text Mode)"
                    : "Accessible & Large Text Mode"}
                </strong>
                <span className="block text-[10px] text-emerald-800/80 dark:text-emerald-400/80">
                  Ultra-large typography & Malayalam voice
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-200/60 dark:bg-emerald-900/50 px-2 py-1 rounded-lg">
              <span>/old</span>
              <ExternalLink className="size-3" />
            </div>
          </a>

          {/* IVR Call */}
          <a
            href="/call"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl border border-amber-300/80 bg-amber-50/70 p-3 hover:bg-amber-100 transition-all dark:bg-amber-950/30 dark:border-amber-800/80"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
                <PhoneCall className="size-4" />
              </span>
              <div>
                <strong className="block text-xs font-extrabold text-amber-950 dark:text-amber-200">
                  {language === "ml"
                    ? "IVR ടോൾ-ഫ്രീ ഫോൺ കോൾ ബുക്കിംഗ്"
                    : "Toll-Free IVR Call Booking (1800-425-1661)"}
                </strong>
                <span className="block text-[10px] text-amber-800/80 dark:text-amber-400/80">
                  Dial-in telephone voice booking simulation
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/50 px-2 py-1 rounded-lg">
              <span>/call</span>
              <ExternalLink className="size-3" />
            </div>
          </a>

          {/* Staff Dashboard */}
          <a
            href="/staff"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 hover:bg-muted/60 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-xs">
                <Building2 className="size-4" />
              </span>
              <div>
                <strong className="block text-xs font-extrabold text-foreground group-hover:text-indigo-600 transition-colors">
                  {t(language, "staffDashboard")}
                </strong>
                <span className="block text-[10px] text-muted-foreground">
                  Moisture testing, weighment & queue calling
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg">
              <span>/staff</span>
              <ExternalLink className="size-3" />
            </div>
          </a>

          {/* Admin Directorate */}
          <a
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 hover:bg-muted/60 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 shadow-xs">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <strong className="block text-xs font-extrabold text-foreground group-hover:text-purple-600 transition-colors">
                  {t(language, "adminDashboard")}
                </strong>
                <span className="block text-[10px] text-muted-foreground">
                  MSP disbursements, quotas & bottleneck AI
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg">
              <span>/admin</span>
              <ExternalLink className="size-3" />
            </div>
          </a>
        </div>
      </div>

      {/* Log Out Action */}
      <div className="pt-2 pb-6">
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 py-3.5 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/60 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <LogOut className="size-4" />
          <span>{language === "ml" ? "ലോഗ് ഔട്ട് ചെയ്യുക" : "Log Out of KisanQueue"}</span>
        </button>
      </div>

      {/* Log Out Confirmation Dialog Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 text-foreground shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-rose-600">
                <span className="flex size-9 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600">
                  <LogOut className="size-4.5" />
                </span>
                <h3 className="font-display font-bold text-base text-foreground">
                  {language === "ml" ? "ലോഗ് ഔട്ട് ചെയ്യണോ?" : "Log Out of KisanQueue?"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted cursor-pointer"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {language === "ml"
                ? "നിങ്ങൾ ലോഗ് ഔട്ട് ചെയ്യുകയാണോ? വീണ്ടും പ്രവേശിക്കാൻ ഫോൺ നമ്പറും ഒടിപിയും നൽകേണ്ടിവരും."
                : "Are you sure you want to log out? You will need your phone number and OTP to sign in again."}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-xl border border-border bg-background py-2.5 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
              >
                {language === "ml" ? "റദ്ദാക്കുക (Cancel)" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                  addNotification(
                    "Logged Out",
                    language === "ml"
                      ? "നിങ്ങൾ വിജയകരമായി ലോഗ് ഔട്ട് ചെയ്തു."
                      : "You have been logged out of KisanQueue.",
                    "info"
                  );
                  if (onLogout) onLogout();
                }}
                className="rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-colors cursor-pointer"
              >
                {language === "ml" ? "അതെ, ലോഗ് ഔട്ട്" : "Yes, Log Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}