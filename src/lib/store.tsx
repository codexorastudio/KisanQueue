import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import {
  Role,
  Language,
  User,
  Crop,
  ProcurementCentre,
  Booking,
  QueueItem,
  NotificationItem,
  BottleneckAlert,
  DemandForecast,
  BookingStatus,
} from "./types";
import {
  fetchProcurementCentresFromDb,
  fetchCropsFromDb,
  fetchBookingsFromDb,
  insertDbBooking,
  updateDbBookingStatus,
  fetchQueueItemsFromDb,
  updateDbQueueStatus,
  updateDbCentreDelay,
  fetchNotificationsFromDb,
  subscribeToQueueChanges,
} from "./db";

interface KisanQueueContextType {
  role: Role;
  setRole: (role: Role) => void;
  user: User;
  setUser: (u: User | ((prev: User) => User)) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  logout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  largeText: boolean;
  setLargeText: (val: boolean | ((prev: boolean) => boolean)) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean | ((prev: boolean) => boolean)) => void;

  centres: ProcurementCentre[];
  crops: Crop[];
  bookings: Booking[];
  activeBooking: Booking | null;
  completedBooking: Booking | null;
  rejectedBooking: Booking | null;
  queue: QueueItem[];
  nowServing: number;
  notifications: NotificationItem[];
  bottlenecks: BottleneckAlert[];
  forecasts: DemandForecast[];

  // Smart Engine Functions
  predictWaitingTime: (centreId: string, userQueueNumber: number) => { timeStr: string; minutesLeft: number; delayMinutes: number };
  getRecommendedCentre: (cropId?: string) => ProcurementCentre;

  // Actions
  bookSlot: (
    centreId: string,
    cropName: string,
    quantityKg: number,
    date: string,
    slotTime: string,
    options?: {
      bookingSource?: "ivr" | "web" | "counter";
      farmerMobile?: string;
      alternatePhone?: string;
      qualityGrade?: string;
      farmerName?: string;
      languageUsed?: "ml" | "en";
    }
  ) => Booking;
  rescheduleBooking: (bookingId: string, newDate: string, newSlotTime: string, newCentreId?: string) => void;
  cancelBooking: (bookingId: string) => void;

  // Staff Queue Actions
  callNextFarmer: () => void;
  markFarmerArrived: (queueNumber: number) => void;
  verifyFarmer: (queueNumber: number) => void;
  completeProcurement: (queueNumber: number, weightKg?: number) => void;
  rejectFarmer: (queueNumber: number, reason?: string) => void;
  reportDelay: (centreId: string, minutes: number, reason: string) => void;
  clearDelay: (centreId: string) => void;

  // Notification Actions
  addNotification: (title: string, message: string, type: NotificationItem["type"]) => void;
  markAllNotificationsRead: () => void;
}

const KisanQueueContext = createContext<KisanQueueContextType | undefined>(undefined);

const INITIAL_CROPS: Crop[] = [
  {
    id: "paddy",
    name: "Paddy",
    localName: { ml: "നെല്ല് (Paddy)", hi: "धान (Paddy)" },
    mspPerKg: 32,
    icon: "🌾",
    description: "Kerala state procurement with incentive bonus",
  },
  {
    id: "coconut",
    name: "Raw Coconut",
    localName: { ml: "പച്ചത്തേങ്ങ (Raw Coconut)", hi: "कच्चा नारियल (Coconut)" },
    mspPerKg: 38,
    icon: "🥥",
    description: "KERAFED direct procurement rate",
  },
  {
    id: "rubber",
    name: "Rubber Sheet (RSS4)",
    localName: { ml: "റബ്ബർ ഷീറ്റ് (Rubber RSS4)", hi: "रबर शीट (Rubber)" },
    mspPerKg: 180,
    icon: "🪵",
    description: "Rubber board incentive price support scheme",
  },
  {
    id: "pepper",
    name: "Black Pepper",
    localName: { ml: "കുരുമുളക് (Black Pepper)", hi: "काली मिर्च (Black Pepper)" },
    mspPerKg: 520,
    icon: "🌿",
    description: "Spices Board certified grade procurement",
  },
  {
    id: "cardamom",
    name: "Green Cardamom",
    localName: { ml: "ഏലം (Cardamom)", hi: "इलायची (Cardamom)" },
    mspPerKg: 1850,
    icon: "🌱",
    description: "Spices Board Grade 8mm+ procurement",
  },
  {
    id: "arecanut",
    name: "Areca Nut",
    localName: { ml: "അടയ്ക്ക (Areca Nut)", hi: "सुपारी (Areca Nut)" },
    mspPerKg: 360,
    icon: "🌰",
    description: "CAMPCO & cooperative procurement support price",
  },
  {
    id: "nutmeg",
    name: "Nutmeg & Mace",
    localName: { ml: "ജാതിക്ക (Nutmeg)", hi: "जायफल (Nutmeg)" },
    mspPerKg: 280,
    icon: "🍂",
    description: "Sun-dried bold nutmeg with premium mace subsidy",
  },
  {
    id: "coffee",
    name: "Robusta Coffee",
    localName: { ml: "കാപ്പിക്കുരു (Coffee)", hi: "कॉफ़ी (Coffee)" },
    mspPerKg: 210,
    icon: "☕",
    description: "Wayanad GI Robusta Cherry A procurement",
  },
  {
    id: "banana",
    name: "Nendran Banana",
    localName: { ml: "നേന്ത്രക്കായ (Nendran)", hi: "केला (Banana)" },
    mspPerKg: 42,
    icon: "🍌",
    description: "VFPCK floor price procurement scheme",
  },
];

const INITIAL_CENTRES: ProcurementCentre[] = [
  {
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
    slots: [
      { id: "s1", time: "09:00 – 10:00 AM", available: 2, capacity: 20, status: "almost_full" },
      { id: "s2", time: "10:00 – 11:00 AM", available: 0, capacity: 20, status: "full" },
      { id: "s3", time: "11:00 – 12:00 PM", available: 6, capacity: 20, status: "available" },
      { id: "s4", time: "12:00 – 01:00 PM", available: 11, capacity: 20, status: "available" },
      { id: "s5", time: "02:00 – 03:00 PM", available: 15, capacity: 20, status: "available" },
    ],
  },
  {
    id: "centre-pala",
    name: "Pala Procurement Centre",
    district: "Kottayam",
    location: "Main Road, Pala",
    distanceKm: 14.2,
    workingHours: "08:00 AM – 04:00 PM",
    dailyCapacityKg: 18000,
    todayBookingsCount: 98,
    currentQueueLength: 26,
    avgProcessingMinutes: 9,
    activeDelayMinutes: 25,
    delayReason: "Moisture meter calibration & high paddy volume",
    status: "delayed",
    slots: [
      { id: "s1", time: "09:00 – 10:00 AM", available: 0, capacity: 15, status: "full" },
      { id: "s2", time: "10:00 – 11:00 AM", available: 1, capacity: 15, status: "almost_full" },
      { id: "s3", time: "11:00 – 12:00 PM", available: 3, capacity: 15, status: "almost_full" },
      { id: "s4", time: "01:00 – 02:00 PM", available: 7, capacity: 15, status: "available" },
    ],
  },
  {
    id: "centre-cgry",
    name: "Changanassery Procurement Centre",
    district: "Kottayam",
    location: "Market Road, Changanassery",
    distanceKm: 5.8,
    workingHours: "09:00 AM – 05:00 PM",
    dailyCapacityKg: 22000,
    todayBookingsCount: 165,
    currentQueueLength: 34,
    avgProcessingMinutes: 7,
    activeDelayMinutes: 0,
    status: "busy",
    slots: [
      { id: "s1", time: "09:00 – 10:00 AM", available: 0, capacity: 20, status: "full" },
      { id: "s2", time: "10:00 – 11:00 AM", available: 2, capacity: 20, status: "almost_full" },
      { id: "s3", time: "12:00 – 01:00 PM", available: 4, capacity: 20, status: "almost_full" },
      { id: "s4", time: "02:00 – 03:00 PM", available: 8, capacity: 20, status: "available" },
    ],
  },
  {
    id: "centre-alpy",
    name: "Alappuzha Lake Border Centre",
    district: "Alappuzha",
    location: "Kuttanad Canal Road, Alappuzha",
    distanceKm: 18.5,
    workingHours: "08:00 AM – 04:30 PM",
    dailyCapacityKg: 30000,
    todayBookingsCount: 110,
    currentQueueLength: 8,
    avgProcessingMinutes: 5,
    activeDelayMinutes: 0,
    status: "normal",
    slots: [
      { id: "s1", time: "09:00 – 10:00 AM", available: 12, capacity: 25, status: "available" },
      { id: "s2", time: "10:00 – 11:00 AM", available: 15, capacity: 25, status: "available" },
      { id: "s3", time: "11:00 – 12:00 PM", available: 18, capacity: 25, status: "available" },
    ],
  },
];

const INITIAL_QUEUE: QueueItem[] = [
  { queueNumber: 38, farmerName: "K. R. Varghese", farmerId: "KL-KTM-21045", crop: "Paddy", quantityKg: 650, status: "completed" },
  { queueNumber: 39, farmerName: "Suresh Pillai", farmerId: "KL-KTM-24012", crop: "Paddy", quantityKg: 420, status: "completed" },
  { queueNumber: 40, farmerName: "Mathew Joseph", farmerId: "KL-KTM-19034", crop: "Paddy", quantityKg: 800, status: "serving" },
  { queueNumber: 41, farmerName: "P. N. Shaji", farmerId: "KL-KTM-27891", crop: "Coconut", quantityKg: 300, status: "waiting" },
  { queueNumber: 42, farmerName: "Thomas Kurian", farmerId: "KL-KTM-23456", crop: "Rubber", quantityKg: 150, status: "waiting" },
  { queueNumber: 43, farmerName: "Radhakrishnan M.", farmerId: "KL-KTM-18970", crop: "Paddy", quantityKg: 500, status: "waiting" },
  { queueNumber: 44, farmerName: "Sebastian Luke", farmerId: "KL-KTM-29001", crop: "Paddy", quantityKg: 720, status: "waiting" },
  { queueNumber: 45, farmerName: "V. A. Jacob", farmerId: "KL-KTM-15672", crop: "Coconut", quantityKg: 250, status: "waiting" },
  { queueNumber: 46, farmerName: "Anil Kumar B.", farmerId: "KL-KTM-22319", crop: "Pepper", quantityKg: 90, status: "waiting" },
  { queueNumber: 47, farmerName: "K. N. Raghavan", farmerId: "KL-KTM-26047", crop: "Rice · 420 kg", quantityKg: 420, status: "waiting" },
  { queueNumber: 48, farmerName: "Devasia V.", farmerId: "KL-KTM-29401", crop: "Paddy", quantityKg: 380, status: "waiting" },
  { queueNumber: 49, farmerName: "Manoj Chacko", farmerId: "KL-KTM-31002", crop: "Rubber", quantityKg: 200, status: "waiting" },
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "BK-26047-01",
    farmerId: "KL-KTM-26047",
    farmerName: "Arun Kumar",
    farmerMobile: "+91 82812 51299",
    centreId: "centre-ktm",
    centreName: "Kottayam Procurement Centre",
    crop: "Paddy",
    quantityKg: 420,
    mspPerKg: 32,
    totalAmount: 13440,
    date: "10 September 2026",
    slotTime: "10:30 AM",
    queueNumber: 47,
    status: "confirmed",
    currentStepIndex: 1, // Arrived/Queue stage
    bookedAt: "08 Sep 2026, 04:15 PM",
    transactionId: "TXN80472291",
    paymentStatus: "processing",
  },
  {
    id: "BK-26047-02",
    farmerId: "KL-KTM-26047",
    farmerName: "Arun Kumar",
    farmerMobile: "+91 82812 51299",
    centreId: "centre-ktm",
    centreName: "Kottayam Procurement Centre",
    crop: "Paddy",
    quantityKg: 280,
    mspPerKg: 32,
    totalAmount: 8960,
    date: "22 August 2026",
    slotTime: "11:00 AM",
    queueNumber: 28,
    status: "completed",
    currentStepIndex: 5, // Payment completed
    bookedAt: "20 Aug 2026, 10:30 AM",
    transactionId: "TXN79311204",
    paymentStatus: "completed",
  },
  {
    id: "BK-26047-03",
    farmerId: "KL-KTM-26047",
    farmerName: "Arun Kumar",
    farmerMobile: "+91 82812 51299",
    centreId: "centre-cgry",
    centreName: "Changanassery Procurement Centre",
    crop: "Raw Coconut",
    quantityKg: 190,
    mspPerKg: 38,
    totalAmount: 7220,
    date: "03 August 2026",
    slotTime: "02:00 PM",
    queueNumber: 15,
    status: "completed",
    currentStepIndex: 5,
    bookedAt: "01 Aug 2026, 02:45 PM",
    transactionId: "TXN77109845",
    paymentStatus: "completed",
  },
];

const INITIAL_BOTTLENECKS: BottleneckAlert[] = [
  {
    centreId: "centre-pala",
    centreName: "Pala Procurement Centre",
    severity: "high",
    title: "Moisture Testing Bottleneck Detected",
    message: "Average farmer wait time has jumped by +32% above baseline.",
    increasePercentage: 32,
    bottleneckArea: "Moisture Content & Quality Grading Station",
    recommendedAction: "Deploy 1 additional quality testing officer to Gate 2.",
  },
  {
    centreId: "centre-cgry",
    centreName: "Changanassery Procurement Centre",
    severity: "medium",
    title: "Yard Vehicle Queuing Congestion",
    message: "Trailer unloading queue is exceeding the front holding bay.",
    increasePercentage: 18,
    bottleneckArea: "Unloading Platform B",
    recommendedAction: "Activate auxiliary weighing scale #2 for small pickup vehicles.",
  },
];

const INITIAL_FORECASTS: DemandForecast[] = [
  {
    centreId: "centre-ktm",
    centreName: "Kottayam Procurement Centre",
    expectedDemand: "high",
    projectedBookings: 185,
    recommendedStaffCount: 8,
    recommendedSlotCapacity: 25,
    reason: "Clear weather forecast post-harvest in Kumarakom and Aymanam paddy clusters.",
  },
  {
    centreId: "centre-alpy",
    centreName: "Alappuzha Lake Border Centre",
    expectedDemand: "high",
    projectedBookings: 160,
    recommendedStaffCount: 7,
    recommendedSlotCapacity: 30,
    reason: "Kuttanad second-crop harvesting season peak beginning this weekend.",
  },
];

export const DEFAULT_GUEST_USER: User = {
  id: "guest-user",
  name: "Guest Farmer",
  role: "farmer",
  mobile: "",
  farmerId: "GUEST",
  village: "",
  district: "Kottayam",
  state: "Kerala",
  primaryCrop: "Paddy",
  crops: ["paddy"],
  bankAccount: "Not Linked",
  ifsc: "",
};

export function KisanQueueProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("farmer");
  const [language, setLanguage] = useState<Language>("en");
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Authentication & Session Persistence
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("kisanqueue_logged_in") === "true";
    }
    return false;
  });

  const setIsLoggedIn = (val: boolean) => {
    setIsLoggedInState(val);
    if (typeof window !== "undefined") {
      if (val) {
        localStorage.setItem("kisanqueue_logged_in", "true");
      } else {
        localStorage.removeItem("kisanqueue_logged_in");
      }
    }
  };

  const [user, setUserState] = useState<User>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("kisanqueue_user");
        const isLoggedInStored = localStorage.getItem("kisanqueue_logged_in") === "true";
        if (stored && isLoggedInStored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.farmerId && parsed.farmerId !== "GUEST") {
            return parsed;
          }
        }
      } catch {}
    }
    return DEFAULT_GUEST_USER;
  });

  const setUser = (u: User | ((prev: User) => User)) => {
    setUserState((prev) => {
      const next = typeof u === "function" ? u(prev) : u;
      if (typeof window !== "undefined") {
        localStorage.setItem("kisanqueue_user", JSON.stringify(next));
      }
      return next;
    });
  };

  const logout = () => {
    setIsLoggedInState(false);
    setUserState(DEFAULT_GUEST_USER);
    if (typeof window !== "undefined") {
      localStorage.removeItem("kisanqueue_user");
      localStorage.removeItem("kisanqueue_logged_in");
    }
  };

  // Unique instance ID for this tab/window to prevent echo loops
  const tabInstanceId = useMemo(() => {
    return typeof window !== "undefined" ? Math.random().toString(36).substring(2, 9) : "server";
  }, []);

  const [centres, setCentresState] = useState<ProcurementCentre[]>(INITIAL_CENTRES);
  const [crops, setCropsState] = useState<Crop[]>(INITIAL_CROPS);

  const [bookings, setBookingsState] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [queue, setQueueState] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [nowServing, setNowServingState] = useState<number>(40);
  const [bottlenecks] = useState<BottleneckAlert[]>(INITIAL_BOTTLENECKS);
  const [forecasts] = useState<DemandForecast[]>(INITIAL_FORECASTS);

  const [notifications, setNotificationsState] = useState<NotificationItem[]>([
    {
      id: "n-1",
      title: "Booking Confirmed #47",
      message: "Your slot at Kottayam Procurement Centre is locked for 10 Sep, 10:30 AM.",
      timestamp: "Today, 09:15 AM",
      type: "booking",
      read: false,
    },
    {
      id: "n-2",
      title: "Queue Moving Smoothly",
      message: "Now serving token #40. 7 farmers ahead of you. Estimated turn: 24 mins.",
      timestamp: "10 mins ago",
      type: "queue",
      read: false,
    },
  ]);

  // Central Broadcast Channel for Instant Cross-Tab Synchronization
  const broadcastSync = (patch: {
    nowServing?: number;
    centres?: ProcurementCentre[];
    bookings?: Booking[];
    queue?: QueueItem[];
    notifications?: NotificationItem[];
  }) => {
    if (typeof window === "undefined") return;
    try {
      if (patch.nowServing !== undefined) {
        localStorage.setItem("kisanqueue_now_serving", patch.nowServing.toString());
      }
      if (patch.centres !== undefined) {
        localStorage.setItem("kisanqueue_centres", JSON.stringify(patch.centres));
      }
      if (patch.bookings !== undefined) {
        localStorage.setItem("kisanqueue_bookings", JSON.stringify(patch.bookings));
      }
      if (patch.queue !== undefined) {
        localStorage.setItem("kisanqueue_queue", JSON.stringify(patch.queue));
      }
      if (patch.notifications !== undefined) {
        localStorage.setItem("kisanqueue_notifications", JSON.stringify(patch.notifications));
      }

      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel("kisanqueue_realtime_sync");
        channel.postMessage({
          type: "STATE_SYNC",
          senderId: tabInstanceId,
          payload: patch,
        });
        channel.close();
      }
    } catch (e) {
      console.error("KisanQueue broadcastSync error:", e);
    }
  };

  // Hydrate all stored state safely on client mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hydrateFromStorage = () => {
      try {
        const storedNowServing = localStorage.getItem("kisanqueue_now_serving");
        if (storedNowServing) {
          const parsed = parseInt(storedNowServing, 10);
          if (!isNaN(parsed)) setNowServingState(parsed);
        }

        const storedCentres = localStorage.getItem("kisanqueue_centres");
        if (storedCentres) {
          const parsed = JSON.parse(storedCentres);
          if (Array.isArray(parsed) && parsed.length > 0) setCentresState(parsed);
        }

        const storedBookings = localStorage.getItem("kisanqueue_bookings");
        if (storedBookings) {
          const parsed = JSON.parse(storedBookings);
          if (Array.isArray(parsed) && parsed.length > 0) setBookingsState(parsed);
        }

        const storedQueue = localStorage.getItem("kisanqueue_queue");
        if (storedQueue) {
          const parsed = JSON.parse(storedQueue);
          if (Array.isArray(parsed) && parsed.length > 0) setQueueState(parsed);
        }

        const storedNotifications = localStorage.getItem("kisanqueue_notifications");
        if (storedNotifications) {
          const parsed = JSON.parse(storedNotifications);
          if (Array.isArray(parsed) && parsed.length > 0) setNotificationsState(parsed);
        }
      } catch (e) {
        console.error("Hydration error:", e);
      }
    };

    hydrateFromStorage();

    // BroadcastChannel message listener
    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel("kisanqueue_realtime_sync");
      channel.onmessage = (event) => {
        if (event.data?.type === "STATE_SYNC" && event.data.senderId !== tabInstanceId) {
          const p = event.data.payload;
          if (p.nowServing !== undefined) setNowServingState(p.nowServing);
          if (p.centres) setCentresState(p.centres);
          if (p.bookings) setBookingsState(p.bookings);
          if (p.queue) setQueueState(p.queue);
          if (p.notifications) setNotificationsState(p.notifications);
        }
      };
    }

    // Storage event listener fallback (fires in other tabs when localStorage is modified)
    const handleStorageEvent = (e: StorageEvent) => {
      try {
        if (e.key === "kisanqueue_now_serving" && e.newValue) {
          const val = parseInt(e.newValue, 10);
          if (!isNaN(val)) setNowServingState(val);
        } else if (e.key === "kisanqueue_centres" && e.newValue) {
          setCentresState(JSON.parse(e.newValue));
        } else if (e.key === "kisanqueue_bookings" && e.newValue) {
          setBookingsState(JSON.parse(e.newValue));
        } else if (e.key === "kisanqueue_queue" && e.newValue) {
          setQueueState(JSON.parse(e.newValue));
        } else if (e.key === "kisanqueue_notifications" && e.newValue) {
          setNotificationsState(JSON.parse(e.newValue));
        }
      } catch (err) {}
    };

    // Re-sync on window focus to ensure freshness
    const handleFocus = () => {
      hydrateFromStorage();
    };

    window.addEventListener("storage", handleStorageEvent);
    window.addEventListener("focus", handleFocus);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorageEvent);
      window.removeEventListener("focus", handleFocus);
    };
  }, [tabInstanceId]);

  // Load data from Supabase and subscribe to Realtime changes
  useEffect(() => {
    let unsubscribeQueue: (() => void) | null = null;

    const loadSupabaseData = async () => {
      try {
        const [dbCentres, dbCrops, dbQueue] = await Promise.all([
          fetchProcurementCentresFromDb(),
          fetchCropsFromDb(),
          fetchQueueItemsFromDb("centre-ktm"),
        ]);

        if (dbCentres && dbCentres.length > 0) {
          setCentresState(dbCentres);
        }
        if (dbCrops && dbCrops.length > 0) {
          setCropsState(dbCrops);
        }
        if (dbQueue && dbQueue.length > 0) {
          setQueueState(dbQueue);
        }

        if (user.farmerId || user.mobile) {
          const dbBookings = await fetchBookingsFromDb(user.farmerId, user.mobile);
          if (dbBookings && dbBookings.length > 0) {
            setBookingsState(dbBookings);
          }
        }

        if (user.id) {
          const dbNotifs = await fetchNotificationsFromDb(user.id);
          if (dbNotifs && dbNotifs.length > 0) {
            setNotificationsState(dbNotifs);
          }
        }
      } catch (err) {
        console.warn("Supabase initial sync:", err);
      }
    };

    loadSupabaseData();

    unsubscribeQueue = subscribeToQueueChanges(
      async () => {
        const updatedQueue = await fetchQueueItemsFromDb("centre-ktm");
        if (updatedQueue && updatedQueue.length > 0) {
          setQueueState(updatedQueue);
        }
      },
      async () => {
        if (user.farmerId || user.mobile) {
          const updatedBookings = await fetchBookingsFromDb(user.farmerId, user.mobile);
          if (updatedBookings && updatedBookings.length > 0) {
            setBookingsState(updatedBookings);
          }
        }
      }
    );

    return () => {
      if (unsubscribeQueue) unsubscribeQueue();
    };
  }, [user.farmerId, user.mobile, user.id]);

  // Synchronized state setters
  const setNowServing = (val: number | ((prev: number) => number)) => {
    setNowServingState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      broadcastSync({ nowServing: next });
      return next;
    });
  };

  const setCentres = (val: ProcurementCentre[] | ((prev: ProcurementCentre[]) => ProcurementCentre[])) => {
    setCentresState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      broadcastSync({ centres: next });
      return next;
    });
  };

  const setBookings = (val: Booking[] | ((prev: Booking[]) => Booking[])) => {
    setBookingsState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      broadcastSync({ bookings: next });
      return next;
    });
  };

  const setQueue = (val: QueueItem[] | ((prev: QueueItem[]) => QueueItem[])) => {
    setQueueState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      broadcastSync({ queue: next });
      return next;
    });
  };

  const setNotifications = (val: NotificationItem[] | ((prev: NotificationItem[]) => NotificationItem[])) => {
    setNotificationsState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      broadcastSync({ notifications: next });
      return next;
    });
  };

  const addNotification = (title: string, message: string, type: NotificationItem["type"]) => {
    const newItem: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: "Just now",
      type,
      read: false,
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const activeBooking = useMemo(() => {
    if (!isLoggedIn || !user || !user.farmerId || user.farmerId === "GUEST") return null;
    return (
      bookings.find(
        (b) =>
          b.status !== "completed" &&
          b.status !== "cancelled" &&
          (b.farmerId === user.farmerId || (user.mobile && b.farmerMobile === user.mobile))
      ) ?? null
    );
  }, [bookings, isLoggedIn, user]);

  const completedBooking = useMemo(() => {
    if (!isLoggedIn || !user || !user.farmerId || user.farmerId === "GUEST") return null;
    return (
      bookings.find(
        (b) =>
          b.status === "completed" &&
          (b.farmerId === user.farmerId || (user.mobile && b.farmerMobile === user.mobile))
      ) ?? null
    );
  }, [bookings, isLoggedIn, user]);

  const rejectedBooking = useMemo(() => {
    if (!isLoggedIn || !user || !user.farmerId || user.farmerId === "GUEST") return null;
    return (
      bookings.find(
        (b) =>
          b.status === "cancelled" &&
          (b.farmerId === user.farmerId || (user.mobile && b.farmerMobile === user.mobile))
      ) ?? null
    );
  }, [bookings, isLoggedIn, user]);

  const DEFAULT_CENTRE: ProcurementCentre = INITIAL_CENTRES[0]!;
  const DEFAULT_CROP: Crop = INITIAL_CROPS[0]!;

  const getCentre = (id?: string): ProcurementCentre => {
    return centres.find((c) => c.id === id) ?? centres[0] ?? DEFAULT_CENTRE;
  };

  const getCrop = (name: string): Crop => {
    return (
      crops.find((c) => c.name.toLowerCase().includes(name.toLowerCase())) ??
      crops[0] ??
      DEFAULT_CROP
    );
  };

  // Smart Engine: Waiting-time prediction
  const predictWaitingTime = (centreId: string, userQueueNumber: number) => {
    const centre = getCentre(centreId);
    const farmersAhead = Math.max(0, userQueueNumber - nowServing);
    const rawMinutes = farmersAhead * centre.avgProcessingMinutes;
    const totalMinutes = rawMinutes + (centre.activeDelayMinutes || 0);

    const arrival = new Date(Date.now() + totalMinutes * 60 * 1000);
    const timeStr = arrival.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return {
      timeStr,
      minutesLeft: totalMinutes,
      delayMinutes: centre.activeDelayMinutes || 0,
    };
  };

  // Smart Engine: Centre Recommendation algorithm (Multi-factor ranking)
  const getRecommendedCentre = (_cropId?: string): ProcurementCentre => {
    let bestCentre: ProcurementCentre = centres[0] ?? DEFAULT_CENTRE;
    let bestScore = Infinity;

    centres.forEach((centre) => {
      const waitTime = centre.currentQueueLength * centre.avgProcessingMinutes + (centre.activeDelayMinutes || 0);
      const score = centre.distanceKm * 2.5 + waitTime * 1.5 - (centre.status === "normal" ? 10 : 0);
      if (score < bestScore) {
        bestScore = score;
        bestCentre = centre;
      }
    });

    return bestCentre;
  };

  // Farmer Actions
  const bookSlot = (
    centreId: string,
    cropName: string,
    quantityKg: number,
    date: string,
    slotTime: string,
    options?: {
      bookingSource?: "ivr" | "web" | "counter";
      farmerMobile?: string;
      alternatePhone?: string;
      qualityGrade?: string;
      farmerName?: string;
      languageUsed?: "ml" | "en";
    }
  ): Booking => {
    const centre = getCentre(centreId);
    const newQueueNum = nowServing + queue.length + 1;
    const cropObj = getCrop(cropName);

    const finalFarmerId =
      user.farmerId && user.farmerId !== "GUEST"
        ? user.farmerId
        : `KL-KTM-${Math.floor(10000 + Math.random() * 90000)}`;
    const farmerMobile = options?.farmerMobile || user.mobile || "+91 94470 00000";
    const farmerName =
      options?.farmerName || (user.name && user.name !== "Guest Farmer" ? user.name : "Farmer");
    const bookingSource = options?.bookingSource || "web";

    const newBooking: Booking = {
      id: `KQ-${Math.floor(10000 + Math.random() * 90000)}`,
      farmerId: finalFarmerId,
      farmerName,
      farmerMobile,
      centreId: centre.id,
      centreName: centre.name,
      crop: cropName,
      quantityKg,
      mspPerKg: cropObj.mspPerKg,
      totalAmount: quantityKg * cropObj.mspPerKg,
      date,
      slotTime,
      queueNumber: newQueueNum,
      status: "confirmed",
      currentStepIndex: 0,
      bookedAt: "Just now",
      transactionId: `TXN${Math.floor(10000000 + Math.random() * 90000000)}`,
      paymentStatus: "processing",
      bookingSource,
      alternatePhone: options?.alternatePhone,
      qualityGrade: options?.qualityGrade,
      languageUsed: options?.languageUsed,
    };

    const nextBookings = [newBooking, ...bookings];
    setBookingsState(nextBookings);

    // Update centre today's bookings and queue length
    const nextCentres = centres.map((c) =>
      c.id === centreId
        ? { ...c, todayBookingsCount: c.todayBookingsCount + 1, currentQueueLength: c.currentQueueLength + 1 }
        : c
    );
    setCentresState(nextCentres);

    // Add to queue and ensure newest token is marked for current farmer
    const nextQueue: QueueItem[] = [
      ...queue.map((item) => (item.isCurrentFarmer ? { ...item, isCurrentFarmer: false } : item)),
      {
        queueNumber: newQueueNum,
        farmerName,
        farmerId: finalFarmerId,
        crop: cropName,
        quantityKg,
        status: "waiting",
        isCurrentFarmer: true,
        bookingSource,
      },
    ];
    setQueueState(nextQueue);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: bookingSource === "ivr" ? "IVR Hotline Slot Booked! 📞" : "Slot Booked Successfully! 🎟️",
      message: `Assigned Token #${newQueueNum} at ${centre.name} for ${cropName} (${quantityKg}kg) on ${date} (${slotTime}).`,
      timestamp: "Just now",
      type: "booking",
      read: false,
    };
    const nextNotifications = [newNotif, ...notifications];
    setNotificationsState(nextNotifications);

    // Broadcast all updated state atomically
    broadcastSync({
      bookings: nextBookings,
      centres: nextCentres,
      queue: nextQueue,
      notifications: nextNotifications,
    });

    // Persist to Supabase asynchronously
    insertDbBooking(newBooking, user.id).catch((e) =>
      console.warn("Supabase booking insert error:", e)
    );

    return newBooking;
  };

  const rescheduleBooking = (bookingId: string, newDate: string, newSlotTime: string, newCentreId?: string) => {
    const nextBookings = bookings.map((b) => {
      if (b.id === bookingId) {
        const centre = getCentre(newCentreId || b.centreId);
        return {
          ...b,
          date: newDate,
          slotTime: newSlotTime,
          centreId: centre.id,
          centreName: centre.name,
          queueNumber: b.queueNumber + 2,
        };
      }
      return b;
    });
    setBookings(nextBookings);

    addNotification(
      "Booking Rescheduled 🔄",
      `Your booking was moved to ${newDate} at ${newSlotTime}. Queue recalculated.`,
      "booking"
    );
  };

  const cancelBooking = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    const nextBookings = bookings.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" as const } : b));
    setBookingsState(nextBookings);

    let nextQueue = queue;
    if (target) {
      nextQueue = queue.filter((item) => item.queueNumber !== target.queueNumber);
      setQueueState(nextQueue);
    }

    const nextCentres = target
      ? centres.map((c) => (c.id === target.centreId ? { ...c, currentQueueLength: Math.max(0, c.currentQueueLength - 1) } : c))
      : centres;
    setCentresState(nextCentres);

    const cancelNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Booking Cancelled ✕",
      message: `Slot for Token #${target?.queueNumber || bookingId} at ${target?.centreName || "Procurement Centre"} has been cancelled and released.`,
      timestamp: "Just now",
      type: "booking",
      read: false,
    };
    const nextNotifications = [cancelNotif, ...notifications];
    setNotificationsState(nextNotifications);

    broadcastSync({
      bookings: nextBookings,
      queue: nextQueue,
      centres: nextCentres,
      notifications: nextNotifications,
    });

    updateDbBookingStatus(bookingId, "cancelled").catch((e) =>
      console.warn("Supabase cancel booking error:", e)
    );
  };

  // Staff Queue Actions
  const callNextFarmer = () => {
    const nextToken = nowServing + 1;
    setNowServingState(nextToken);

    const nextQueue = queue.map((item) => {
      if (item.queueNumber === nextToken) {
        return { ...item, status: "serving" as const };
      }
      if (item.queueNumber < nextToken) {
        return { ...item, status: "completed" as const };
      }
      return item;
    });
    setQueueState(nextQueue);

    updateDbQueueStatus(nextToken, "serving", "centre-ktm").catch((e) =>
      console.warn("Supabase queue status update error:", e)
    );

    // Decrement current queue length on Kottayam centre (default staff centre)
    const nextCentres = centres.map((c, idx) =>
      idx === 0 ? { ...c, currentQueueLength: Math.max(0, c.currentQueueLength - 1) } : c
    );
    setCentresState(nextCentres);

    let nextNotif: NotificationItem;
    if (activeBooking && activeBooking.queueNumber === nextToken) {
      nextNotif = {
        id: `notif-${Date.now()}`,
        title: "⚡ It's Your Turn! (Token #" + nextToken + ")",
        message: `Token #${nextToken} is now called! Please proceed immediately to Weighing Bay 1 with your vehicle.`,
        timestamp: "Just now",
        type: "queue",
        read: false,
      };
    } else if (activeBooking && activeBooking.queueNumber - nextToken <= 3 && activeBooking.queueNumber > nextToken) {
      nextNotif = {
        id: `notif-${Date.now()}`,
        title: "⚡ Your Turn Approaching!",
        message: `Now serving #${nextToken}. You are Token #${activeBooking.queueNumber} (${activeBooking.queueNumber - nextToken} farmers ahead). Please stand near Gate 1.`,
        timestamp: "Just now",
        type: "queue",
        read: false,
      };
    } else {
      nextNotif = {
        id: `notif-${Date.now()}`,
        title: "Queue Advanced 📢",
        message: `Now calling Token #${nextToken} to weighing bay.`,
        timestamp: "Just now",
        type: "queue",
        read: false,
      };
    }

    const nextNotifications = [nextNotif, ...notifications];
    setNotificationsState(nextNotifications);

    // Atomically broadcast all 4 state pieces across tabs
    broadcastSync({
      nowServing: nextToken,
      queue: nextQueue,
      centres: nextCentres,
      notifications: nextNotifications,
    });
  };

  const markFarmerArrived = (queueNumber: number) => {
    const nextBookings = bookings.map((b) => (b.queueNumber === queueNumber ? { ...b, status: "arrived" as const, currentStepIndex: 1 } : b));
    setBookings(nextBookings);
    addNotification("Farmer Arrival Verified", `Token #${queueNumber} checked in at procurement yard gate.`, "queue");
    updateDbQueueStatus(queueNumber, "waiting", "centre-ktm").catch((e) =>
      console.warn("Supabase arrival error:", e)
    );
  };

  const verifyFarmer = (queueNumber: number) => {
    const nextBookings = bookings.map((b) => (b.queueNumber === queueNumber ? { ...b, status: "verified" as const, currentStepIndex: 2 } : b));
    setBookings(nextBookings);
    addNotification("Moisture & Quality Passed ✓", `Token #${queueNumber} verification completed. Approved for weighing.`, "procurement");
    updateDbQueueStatus(queueNumber, "verified", "centre-ktm").catch((e) =>
      console.warn("Supabase verify error:", e)
    );
  };

  const completeProcurement = (queueNumber: number, weightKg?: number) => {
    let completedFarmerName = "Farmer";
    let completedPayout = 13440;
    let targetBookingId: string | undefined;

    const nextBookings = bookings.map((b) => {
      if (b.queueNumber === queueNumber) {
        const finalWeight = weightKg || b.quantityKg;
        const total = finalWeight * b.mspPerKg;
        completedFarmerName = b.farmerName;
        completedPayout = total;
        targetBookingId = b.id;
        return {
          ...b,
          quantityKg: finalWeight,
          totalAmount: total,
          status: "completed" as const,
          currentStepIndex: 5,
          paymentStatus: "completed" as const,
        };
      }
      return b;
    });
    setBookingsState(nextBookings);

    const nextQueue = queue.map((item) => (item.queueNumber === queueNumber ? { ...item, status: "completed" as const } : item));
    setQueueState(nextQueue);

    updateDbQueueStatus(queueNumber, "completed", "centre-ktm").catch((e) =>
      console.warn("Supabase complete error:", e)
    );
    if (targetBookingId) {
      updateDbBookingStatus(targetBookingId, "completed", 5).catch((e) =>
        console.warn("Supabase booking complete error:", e)
      );
    }

    const nextCentres = centres.map((c, idx) =>
      idx === 0 ? { ...c, currentQueueLength: Math.max(0, c.currentQueueLength - 1) } : c
    );
    setCentresState(nextCentres);

    const payoutNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Payment Initiated! 💰",
      message: `Procurement for Token #${queueNumber} (${completedFarmerName}) completed. ₹${completedPayout.toLocaleString()} credited to registered bank account via PFMS DBT.`,
      timestamp: "Just now",
      type: "payment",
      read: false,
    };
    const nextNotifications = [payoutNotif, ...notifications];
    setNotificationsState(nextNotifications);

    broadcastSync({
      bookings: nextBookings,
      queue: nextQueue,
      centres: nextCentres,
      notifications: nextNotifications,
    });
  };

  const rejectFarmer = (queueNumber: number, reason?: string) => {
    const rejectionReason = reason || "Moisture content exceeded allowable threshold (>14.0%)";
    let targetBookingId: string | undefined;
    let targetFarmerName = "Farmer";

    const nextBookings = bookings.map((b) => {
      if (b.queueNumber === queueNumber) {
        targetBookingId = b.id;
        targetFarmerName = b.farmerName;
        return {
          ...b,
          status: "cancelled" as const,
          cancellationReason: rejectionReason,
        };
      }
      return b;
    });
    setBookingsState(nextBookings);

    const nextQueue = queue.map((item) =>
      item.queueNumber === queueNumber ? { ...item, status: "rejected" as const } : item
    );
    setQueueState(nextQueue);

    updateDbQueueStatus(queueNumber, "rejected", "centre-ktm").catch((e) =>
      console.warn("Supabase reject error:", e)
    );
    if (targetBookingId) {
      updateDbBookingStatus(targetBookingId, "cancelled", 0).catch((e) =>
        console.warn("Supabase booking cancel error:", e)
      );
    }

    const nextCentres = centres.map((c, idx) =>
      idx === 0 ? { ...c, currentQueueLength: Math.max(0, c.currentQueueLength - 1) } : c
    );
    setCentresState(nextCentres);

    const rejectNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Consignment Rejected ⚠️",
      message: `Token #${queueNumber} (${targetFarmerName}) was rejected at the inspection bay. Reason: ${rejectionReason}.`,
      timestamp: "Just now",
      type: "procurement",
      read: false,
    };
    const nextNotifications = [rejectNotif, ...notifications];
    setNotificationsState(nextNotifications);

    broadcastSync({
      bookings: nextBookings,
      queue: nextQueue,
      centres: nextCentres,
      notifications: nextNotifications,
    });
  };

  const reportDelay = (centreId: string, minutes: number, reason: string) => {
    const targetCentre = getCentre(centreId);
    const nextCentres = centres.map((c) =>
      c.id === centreId
        ? {
            ...c,
            activeDelayMinutes: minutes,
            delayReason: reason,
            status: minutes > 0 ? ("delayed" as const) : ("normal" as const),
          }
        : c
    );
    setCentresState(nextCentres);

    updateDbCentreDelay(centreId, minutes, reason).catch((e) =>
      console.warn("Supabase delay error:", e)
    );

    const delayNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: minutes > 0 ? `Operational Delay Reported (+${minutes}m)` : "Delay Cleared",
      message: minutes > 0 ? reason : `Normal operations resumed at ${targetCentre.name}.`,
      timestamp: "Just now",
      type: "delay",
      read: false,
    };
    const nextNotifications = [delayNotif, ...notifications];
    setNotificationsState(nextNotifications);

    broadcastSync({
      centres: nextCentres,
      notifications: nextNotifications,
    });
  };

  const clearDelay = (centreId: string) => {
    reportDelay(centreId, 0, "Delay resolved");
  };

  return (
    <KisanQueueContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        user,
        setUser,
        isLoggedIn,
        setIsLoggedIn,
        logout,
        largeText,
        setLargeText,
        highContrast,
        setHighContrast,
        centres,
        crops,
        bookings,
        activeBooking,
        completedBooking,
        rejectedBooking,
        queue,
        nowServing,
        notifications,
        bottlenecks,
        forecasts,
        predictWaitingTime,
        getRecommendedCentre,
        bookSlot,
        rescheduleBooking,
        cancelBooking,
        callNextFarmer,
        markFarmerArrived,
        verifyFarmer,
        completeProcurement,
        rejectFarmer,
        reportDelay,
        clearDelay,
        addNotification,
        markAllNotificationsRead,
      }}
    >
      {children}
    </KisanQueueContext.Provider>
  );
}

export function useKisanQueue() {
  const context = useContext(KisanQueueContext);
  if (!context) {
    throw new Error("useKisanQueue must be used within a KisanQueueProvider");
  }
  return context;
}
