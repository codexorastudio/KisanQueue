import React, { useState } from "react";
import { useKisanQueue } from "@/lib/store";
import { t } from "@/lib/translations";
import { ArrowLeft, Calendar, MapPin, QrCode, RefreshCw, XCircle, CheckCircle2, ChevronRight, Phone } from "lucide-react";
import { Booking } from "@/lib/types";

export function MyBookingsView({
  onBack,
  onOpenReschedule,
}: {
  onBack: () => void;
  onOpenReschedule: (booking: Booking) => void;
}) {
  const { user, isLoggedIn, bookings, cancelBooking, language } = useKisanQueue();
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const userBookings = React.useMemo(() => {
    if (!isLoggedIn || !user || !user.farmerId || user.farmerId === "GUEST") {
      return [];
    }
    return bookings.filter(
      (b) =>
        b.farmerId === user.farmerId ||
        (user.mobile && b.farmerMobile === user.mobile)
    );
  }, [bookings, isLoggedIn, user]);

  const filtered = userBookings.filter((b) => {
    if (activeTab === "upcoming") return b.status !== "completed" && b.status !== "cancelled";
    if (activeTab === "completed") return b.status === "completed";
    return b.status === "cancelled";
  });

  const upcomingCount = userBookings.filter((b) => b.status !== "completed" && b.status !== "cancelled").length;
  const completedCount = userBookings.filter((b) => b.status === "completed").length;
  const cancelledCount = userBookings.filter((b) => b.status === "cancelled").length;

  return (
    <div className="content-stack pt-2 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold">{t(language, "myBookings")}</h1>
          <p className="text-xs text-muted-foreground">Digital passes and slot history</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 rounded-xl border border-border bg-muted/40 p-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`rounded-lg py-2 transition-all ${
            activeTab === "upcoming" ? "bg-card text-primary shadow-sm font-bold" : "text-muted-foreground"
          }`}
        >
          Upcoming ({upcomingCount})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`rounded-lg py-2 transition-all ${
            activeTab === "completed" ? "bg-card text-primary shadow-sm font-bold" : "text-muted-foreground"
          }`}
        >
          Completed ({completedCount})
        </button>
        <button
          onClick={() => setActiveTab("cancelled")}
          className={`rounded-lg py-2 transition-all ${
            activeTab === "cancelled" ? "bg-card text-primary shadow-sm font-bold" : "text-muted-foreground"
          }`}
        >
          Cancelled ({cancelledCount})
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            No bookings found in this section.
          </div>
        ) : (
          filtered.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3 transition-all hover:border-primary/40"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-muted-foreground">ID: {booking.id}</span>
                    {booking.bookingSource === "ivr" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[9.5px] font-bold">
                        <Phone className="size-2.5 text-emerald-700" /> Toll-Free Call Booking
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm mt-0.5">{booking.crop} · {booking.quantityKg} kg</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3.5 text-primary" /> {booking.centreName}
                  </p>
                  {booking.alternatePhone && (
                    <p className="text-[10.5px] text-muted-foreground mt-0.5 font-mono">
                      Alt Phone: {booking.alternatePhone}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="inline-block font-display text-2xl font-extrabold text-primary">
                    #{booking.queueNumber}
                  </span>
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Token</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-2 text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] block">Slot Time</span>
                  <strong>{booking.date} · {booking.slotTime}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">MSP Value</span>
                  <strong className="text-emerald-700">₹{booking.totalAmount.toLocaleString("en-IN")}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(booking)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <QrCode className="size-3.5" /> View Pass
                </button>

                {activeTab === "upcoming" && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenReschedule(booking)}
                      className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted"
                    >
                      {t(language, "rescheduleSlot")}
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelBooking(booking.id)}
                      className="rounded-lg border border-destructive/30 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
                    >
                      {t(language, "cancelSlot")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR PASS MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-border bg-card text-foreground shadow-2xl p-5 text-center space-y-4">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              ✕
            </button>

            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display text-xl font-bold">
              KQ
            </div>

            <div>
              <span className="eyebrow text-primary">OFFICIAL GATE ENTRY PASS</span>
              <h3 className="font-display text-2xl font-bold mt-1">Token #{selectedBooking.queueNumber}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedBooking.centreName}</p>
            </div>

            {/* Stylized QR Code placeholder */}
            <div className="mx-auto grid size-32 grid-cols-8 gap-1 rounded-2xl border border-border bg-background p-3">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-sm ${
                    i % 2 === 0 || i % 5 === 0 || i % 7 === 0 ? "bg-foreground" : "bg-transparent"
                  }`}
                />
              ))}
            </div>

            <div className="rounded-xl bg-muted/40 p-3 text-left font-mono text-xs space-y-1">
              <p className="text-muted-foreground">ID: <strong>{selectedBooking.id}</strong></p>
              <p className="text-muted-foreground">Crop: <strong>{selectedBooking.crop} ({selectedBooking.quantityKg} kg)</strong></p>
              <p className="text-muted-foreground">Slot: <strong>{selectedBooking.date} @ {selectedBooking.slotTime}</strong></p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
