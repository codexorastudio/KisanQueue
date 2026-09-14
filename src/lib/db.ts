import { supabase } from "./supabase";
import {
  User,
  ProcurementCentre,
  Crop,
  Booking,
  QueueItem,
  NotificationItem,
  BookingStatus,
} from "./types";

/**
 * Normalizes an Indian mobile phone number into a consistent 10-digit format
 */
export function normalizeMobile(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

// ----------------------------------------------------------------------
// USER / FARMER REPOSITORY
// ----------------------------------------------------------------------

export async function fetchUserByMobile(mobile: string): Promise<User | null> {
  try {
    const clean = normalizeMobile(mobile);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .or(`mobile.eq.${clean},mobile.eq.+91 ${clean},mobile.like.%${clean}%`)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("fetchUserByMobile error:", error.message);
      return null;
    }
    if (!data) return null;

    return mapDbUser(data);
  } catch (err) {
    console.warn("fetchUserByMobile error:", err);
    return null;
  }
}

export async function fetchUserByFarmerId(farmerId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .ilike("farmer_id", farmerId.trim())
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return mapDbUser(data);
  } catch (err) {
    console.warn("fetchUserByFarmerId error:", err);
    return null;
  }
}

export async function createDbUser(profile: Partial<User>): Promise<User | null> {
  try {
    const cleanMobile = normalizeMobile(
      profile.mobile && profile.mobile.length >= 10
        ? profile.mobile
        : "944" + Math.floor(1000000 + Math.random() * 9000000)
    );
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const farmerId = profile.farmerId || `KL-KTM-${randomSuffix}`;

    const newRecord = {
      mobile: cleanMobile,
      name: profile.name || "Farmer",
      farmer_id: farmerId,
      role: profile.role || "farmer",
      village: profile.village || "Kumarakom",
      district: profile.district || "Kottayam",
      state: profile.state || "Kerala",
      primary_crop: profile.primaryCrop || "Paddy",
      crops: profile.crops || ["paddy"],
      bank_account: profile.bankAccount || "SBI A/C **** " + (Math.floor(1000 + Math.random() * 9000)),
      ifsc: profile.ifsc || "SBIN0070114",
    };

    const { data, error } = await supabase
      .from("users")
      .upsert(newRecord, { onConflict: "mobile" })
      .select()
      .single();

    if (error) {
      console.warn("createDbUser upsert error:", error.message);
      return null;
    }

    return mapDbUser(data);
  } catch (err) {
    console.warn("createDbUser error:", err);
    return null;
  }
}

export async function updateDbUser(id: string, updates: Partial<User>): Promise<User | null> {
  try {
    const patch: Record<string, any> = {};
    if (updates.name !== undefined) patch["name"] = updates.name;
    if (updates.village !== undefined) patch["village"] = updates.village;
    if (updates.district !== undefined) patch["district"] = updates.district;
    if (updates.primaryCrop !== undefined) patch["primary_crop"] = updates.primaryCrop;
    if (updates.crops !== undefined) patch["crops"] = updates.crops;
    if (updates.bankAccount !== undefined) patch["bank_account"] = updates.bankAccount;
    if (updates.ifsc !== undefined) patch["ifsc"] = updates.ifsc;

    const { data, error } = await supabase
      .from("users")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) return null;
    return mapDbUser(data);
  } catch (err) {
    console.warn("updateDbUser error:", err);
    return null;
  }
}

function mapDbUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    mobile: row.mobile.startsWith("+91") ? row.mobile : `+91 ${row.mobile}`,
    farmerId: row.farmer_id,
    staffId: row.role === "staff" ? row.farmer_id : undefined,
    village: row.village || "Kumarakom",
    district: row.district || "Kottayam",
    state: row.state || "Kerala",
    primaryCrop: row.primary_crop || "Paddy",
    crops: row.crops || ["paddy"],
    bankAccount: row.bank_account || "SBI A/C **** 4891",
    ifsc: row.ifsc || "SBIN0070114",
  };
}

// ----------------------------------------------------------------------
// PROCUREMENT CENTRES REPOSITORY
// ----------------------------------------------------------------------

export async function fetchProcurementCentresFromDb(): Promise<ProcurementCentre[]> {
  try {
    const { data, error } = await supabase
      .from("procurement_centres")
      .select("*")
      .order("distance_km", { ascending: true });

    if (error || !data || data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      district: row.district,
      location: row.location,
      distanceKm: Number(row.distance_km || 0),
      workingHours: row.working_hours,
      dailyCapacityKg: Number(row.daily_capacity_kg || 25000),
      todayBookingsCount: Number(row.today_bookings_count || 0),
      currentQueueLength: Number(row.current_queue_length || 0),
      avgProcessingMinutes: Number(row.avg_processing_minutes || 6),
      activeDelayMinutes: Number(row.active_delay_minutes || 0),
      delayReason: row.delay_reason || undefined,
      status: row.status,
      slots: row.slots || [],
    }));
  } catch (err) {
    console.warn("fetchProcurementCentresFromDb error:", err);
    return [];
  }
}

export async function updateDbCentreDelay(
  centreId: string,
  delayMinutes: number,
  reason?: string
): Promise<void> {
  try {
    await supabase
      .from("procurement_centres")
      .update({
        active_delay_minutes: delayMinutes,
        delay_reason: reason || null,
        status: delayMinutes > 15 ? "delayed" : "normal",
      })
      .eq("id", centreId);
  } catch (err) {
    console.warn("updateDbCentreDelay error:", err);
  }
}

// ----------------------------------------------------------------------
// CROPS REPOSITORY
// ----------------------------------------------------------------------

export async function fetchCropsFromDb(): Promise<Crop[]> {
  try {
    const { data, error } = await supabase.from("crops").select("*");
    if (error || !data || data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      localName: row.local_name || { ml: row.name, hi: row.name },
      mspPerKg: Number(row.msp_per_kg),
      icon: row.icon || "🌾",
      description: row.description || "",
    }));
  } catch (err) {
    console.warn("fetchCropsFromDb error:", err);
    return [];
  }
}

// ----------------------------------------------------------------------
// BOOKINGS REPOSITORY
// ----------------------------------------------------------------------

export async function fetchBookingsFromDb(farmerId?: string, mobile?: string): Promise<Booking[]> {
  try {
    let query = supabase.from("bookings").select("*").order("booked_at", { ascending: false });

    if (farmerId && mobile) {
      const clean = normalizeMobile(mobile);
      query = query.or(`farmer_id.eq.${farmerId},farmer_mobile.like.%${clean}%`);
    } else if (farmerId) {
      query = query.eq("farmer_id", farmerId);
    } else if (mobile) {
      const clean = normalizeMobile(mobile);
      query = query.like("farmer_mobile", `%${clean}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(mapDbBooking);
  } catch (err) {
    console.warn("fetchBookingsFromDb error:", err);
    return [];
  }
}

export async function insertDbBooking(booking: Booking, userId?: string): Promise<Booking | null> {
  try {
    const cleanMobile = normalizeMobile(booking.farmerMobile);
    const dbRecord = {
      id: booking.id,
      user_id: userId || null,
      farmer_id: booking.farmerId,
      farmer_name: booking.farmerName,
      farmer_mobile: booking.farmerMobile,
      centre_id: booking.centreId,
      centre_name: booking.centreName,
      crop: booking.crop,
      quantity_kg: booking.quantityKg,
      msp_per_kg: booking.mspPerKg,
      total_amount: booking.totalAmount,
      date: booking.date,
      slot_time: booking.slotTime,
      queue_number: booking.queueNumber,
      status: booking.status,
      current_step_index: booking.currentStepIndex,
      transaction_id: booking.transactionId || null,
      payment_status: booking.paymentStatus || "pending",
      booking_source: booking.bookingSource || "web",
      alternate_phone: booking.alternatePhone || null,
      quality_grade: booking.qualityGrade || null,
      language_used: booking.languageUsed || "ml",
    };

    const { data, error } = await supabase.from("bookings").insert(dbRecord).select().single();
    if (error) {
      console.warn("insertDbBooking error:", error.message);
      return null;
    }

    // Also add to queue_items table
    await supabase.from("queue_items").insert({
      centre_id: booking.centreId,
      booking_id: booking.id,
      queue_number: booking.queueNumber,
      farmer_name: booking.farmerName,
      farmer_id: booking.farmerId,
      crop: booking.crop,
      quantity_kg: booking.quantityKg,
      status: "waiting",
      booking_source: booking.bookingSource || "web",
    });

    return mapDbBooking(data);
  } catch (err) {
    console.warn("insertDbBooking error:", err);
    return null;
  }
}

export async function updateDbBookingStatus(
  bookingId: string,
  status: BookingStatus,
  currentStepIndex?: number
): Promise<void> {
  try {
    const patch: Record<string, any> = { status };
    if (currentStepIndex !== undefined) {
      patch["current_step_index"] = currentStepIndex;
    }
    if (status === "completed") {
      patch["payment_status"] = "completed";
    }
    await supabase.from("bookings").update(patch).eq("id", bookingId);
  } catch (err) {
    console.warn("updateDbBookingStatus error:", err);
  }
}

function mapDbBooking(row: any): Booking {
  return {
    id: row.id,
    farmerId: row.farmer_id,
    farmerName: row.farmer_name,
    farmerMobile: row.farmer_mobile,
    centreId: row.centre_id,
    centreName: row.centre_name,
    crop: row.crop,
    quantityKg: Number(row.quantity_kg),
    mspPerKg: Number(row.msp_per_kg),
    totalAmount: Number(row.total_amount),
    date: row.date,
    slotTime: row.slot_time,
    queueNumber: Number(row.queue_number),
    status: row.status,
    currentStepIndex: Number(row.current_step_index || 1),
    bookedAt: row.booked_at ? new Date(row.booked_at).toLocaleDateString("en-GB") : "Today",
    transactionId: row.transaction_id || undefined,
    paymentStatus: row.payment_status || "pending",
    bookingSource: row.booking_source || "web",
    alternatePhone: row.alternate_phone || undefined,
    qualityGrade: row.quality_grade || undefined,
    languageUsed: row.language_used || "ml",
  };
}

// ----------------------------------------------------------------------
// QUEUE ITEMS REPOSITORY
// ----------------------------------------------------------------------

export async function fetchQueueItemsFromDb(centreId?: string): Promise<QueueItem[]> {
  try {
    let query = supabase.from("queue_items").select("*").order("queue_number", { ascending: true });
    if (centreId) {
      query = query.eq("centre_id", centreId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) return [];

    return data.map((row: any) => ({
      queueNumber: Number(row.queue_number),
      farmerName: row.farmer_name,
      farmerId: row.farmer_id,
      crop: row.crop,
      quantityKg: Number(row.quantity_kg),
      status: row.status,
      bookingSource: row.booking_source || "web",
    }));
  } catch (err) {
    console.warn("fetchQueueItemsFromDb error:", err);
    return [];
  }
}

export async function updateDbQueueStatus(
  queueNumber: number,
  status: "waiting" | "serving" | "verified" | "completed" | "skipped",
  centreId?: string
): Promise<void> {
  try {
    let query = supabase.from("queue_items").update({ status }).eq("queue_number", queueNumber);
    if (centreId) {
      query = query.eq("centre_id", centreId);
    }
    await query;
  } catch (err) {
    console.warn("updateDbQueueStatus error:", err);
  }
}

// ----------------------------------------------------------------------
// NOTIFICATIONS REPOSITORY
// ----------------------------------------------------------------------

export async function fetchNotificationsFromDb(userId?: string): Promise<NotificationItem[]> {
  try {
    let query = supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(20);
    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      timestamp: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
      type: row.type,
      read: Boolean(row.read),
    }));
  } catch (err) {
    console.warn("fetchNotificationsFromDb error:", err);
    return [];
  }
}

export async function insertDbNotification(
  userId: string | undefined,
  title: string,
  message: string,
  type: NotificationItem["type"]
): Promise<void> {
  try {
    await supabase.from("notifications").insert({
      user_id: userId || null,
      title,
      message,
      type,
      read: false,
    });
  } catch (err) {
    console.warn("insertDbNotification error:", err);
  }
}

// ----------------------------------------------------------------------
// REALTIME SUBSCRIPTIONS
// ----------------------------------------------------------------------

export function subscribeToQueueChanges(
  onQueueUpdate: () => void,
  onBookingUpdate?: () => void
) {
  const channel = supabase
    .channel("kisanqueue_realtime_db")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "queue_items" },
      () => {
        onQueueUpdate();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "bookings" },
      () => {
        if (onBookingUpdate) onBookingUpdate();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "procurement_centres" },
      () => {
        onQueueUpdate();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
