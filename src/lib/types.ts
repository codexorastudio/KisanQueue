export type Role = "farmer" | "staff" | "admin";

export type Language = "en" | "ml" | "hi" | "ta" | "te" | "kn" | "bn" | "mr";

export interface User {
  id: string;
  name: string;
  role: Role;
  mobile: string;
  farmerId?: string | undefined;
  staffId?: string | undefined;
  village?: string | undefined;
  district?: string | undefined;
  state?: string | undefined;
  primaryCrop?: string | undefined;
  crops?: string[] | undefined;
  bankAccount?: string | undefined;
  ifsc?: string | undefined;
}

export interface Crop {
  id: string;
  name: string;
  localName: {
    ml: string;
    hi: string;
    [key: string]: string;
  };
  mspPerKg: number;
  icon: string;
  description: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: number;
  capacity: number;
  status: "available" | "almost_full" | "full";
}

export interface ProcurementCentre {
  id: string;
  name: string;
  district: string;
  location: string;
  address?: string | undefined;
  distanceKm: number;
  workingHours: string;
  dailyCapacityKg: number;
  todayBookingsCount: number;
  currentQueueLength: number;
  avgProcessingMinutes: number;
  activeDelayMinutes: number;
  delayReason?: string | undefined;
  status: "normal" | "busy" | "delayed";
  slots: TimeSlot[];
  recommendationScore?: number | undefined;
  isRecommended?: boolean | undefined;
}

export type BookingStatus = "confirmed" | "arrived" | "verified" | "procured" | "completed" | "cancelled";

export interface Booking {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  centreId: string;
  centreName: string;
  crop: string;
  quantityKg: number;
  mspPerKg: number;
  totalAmount: number;
  date: string;
  slotTime: string;
  queueNumber: number;
  status: BookingStatus;
  currentStepIndex: number;
  bookedAt: string;
  transactionId?: string | undefined;
  paymentStatus?: "pending" | "processing" | "completed" | undefined;
  bookingSource?: "ivr" | "web" | "counter" | undefined;
  alternatePhone?: string | undefined;
  qualityGrade?: string | undefined;
  languageUsed?: "ml" | "en" | undefined;
  cancellationReason?: string | undefined;
}

export interface QueueItem {
  queueNumber: number;
  farmerName: string;
  farmerId: string;
  crop: string;
  quantityKg: number;
  status: "waiting" | "serving" | "verified" | "completed" | "skipped" | "rejected";
  isCurrentFarmer?: boolean | undefined;
  bookingSource?: "ivr" | "web" | "counter" | undefined;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "booking" | "queue" | "delay" | "procurement" | "payment" | "sms" | "info" | "success";
  read: boolean;
}

export interface BottleneckAlert {
  centreId: string;
  centreName: string;
  severity: "high" | "medium";
  title: string;
  message: string;
  increasePercentage: number;
  bottleneckArea: string;
  recommendedAction: string;
}

export interface DemandForecast {
  centreId: string;
  centreName: string;
  expectedDemand: "high" | "normal" | "low";
  projectedBookings: number;
  recommendedStaffCount: number;
  recommendedSlotCapacity: number;
  reason: string;
}
