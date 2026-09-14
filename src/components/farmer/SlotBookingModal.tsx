import React, { useState, useEffect, useRef } from "react";
import { useKisanQueue } from "@/lib/store";
import { t } from "@/lib/translations";
import { X, Check, Sparkles, MapPin, Calendar, Clock, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";

interface SlotBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCentreName?: string | null;
  initialCropName?: string | null;
  onNavigateToQueue?: () => void;
}

export function SlotBookingModal({
  isOpen,
  onClose,
  initialCentreName,
  initialCropName,
  onNavigateToQueue,
}: SlotBookingModalProps) {
  const { crops, centres, bookSlot, getRecommendedCentre, cancelBooking, language } = useKisanQueue();
  const recommendedCentre = getRecommendedCentre();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedCrop, setSelectedCrop] = useState(crops[0]?.name || "Paddy");
  const [quantity, setQuantity] = useState(420);
  const [selectedCentreId, setSelectedCentreId] = useState(recommendedCentre.id);
  const [selectedDate, setSelectedDate] = useState("10 Sep 2026");
  const [selectedSlotTime, setSelectedSlotTime] = useState("11:00 – 12:00 PM");
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [assignedQueueNumber, setAssignedQueueNumber] = useState<number | null>(null);

  const prevOpenRef = useRef(false);

  // Initialize modal state ONLY when modal opens (transitions from closed to open)
  // Prevents store updates during booking from violently resetting step 5 back to step 1
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setStep(1);
      setConfirmedBookingId(null);
      setAssignedQueueNumber(null);

      if (initialCentreName) {
        const match = centres.find(
          (c) =>
            c.name.toLowerCase().trim() === initialCentreName.toLowerCase().trim() ||
            c.id.toLowerCase().trim() === initialCentreName.toLowerCase().trim()
        );
        if (match) {
          setSelectedCentreId(match.id);
          const firstAvail = match.slots.find((s) => s.status !== "full")?.time || "11:00 – 12:00 PM";
          setSelectedSlotTime(firstAvail);
        }
      } else {
        setSelectedCentreId(recommendedCentre.id);
        const firstAvail = recommendedCentre.slots.find((s) => s.status !== "full")?.time || "11:00 – 12:00 PM";
        setSelectedSlotTime(firstAvail);
      }

      if (initialCropName) {
        const cropMatch = crops.find(
          (c) =>
            c.name.toLowerCase().includes(initialCropName.toLowerCase().trim()) ||
            initialCropName.toLowerCase().includes(c.name.toLowerCase().trim()) ||
            c.id.toLowerCase() === initialCropName.toLowerCase().trim() ||
            initialCropName.toLowerCase().includes(c.id.toLowerCase().trim())
        );
        if (cropMatch) {
          setSelectedCrop(cropMatch.name);
        }
      }
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, initialCentreName, initialCropName, recommendedCentre, centres, crops]);

  const handleClose = () => {
    setStep(1);
    setConfirmedBookingId(null);
    setAssignedQueueNumber(null);
    onClose();
  };

  if (!isOpen) return null;

  const currentCrop = (crops.find((c) => c.name === selectedCrop) || crops[0])!;
  const currentCentre = (centres.find((c) => c.id === selectedCentreId) || centres[0])!;
  const totalPayout = quantity * currentCrop.mspPerKg;

  const handleConfirm = () => {
    const newBooking = bookSlot(selectedCentreId, selectedCrop, quantity, selectedDate, selectedSlotTime);
    setConfirmedBookingId(newBooking.id);
    setAssignedQueueNumber(newBooking.queueNumber);
    setStep(5);
  };

  const dates = [
    { label: "10 Sep", sub: "Wed (Recommended)" },
    { label: "11 Sep", sub: "Thu" },
    { label: "12 Sep", sub: "Fri" },
    { label: "13 Sep", sub: "Sat" },
    { label: "15 Sep", sub: "Mon" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[28px] border border-border bg-card text-foreground shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {step < 5 ? `Step ${step} of 4 · Smart Procurement Booking` : "Success · Smart Procurement"}
            </span>
            <h2 className="font-display text-lg font-bold">
              {step === 1 && t(language, "step1Title")}
              {step === 2 && t(language, "step2Title")}
              {step === 3 && t(language, "step3Title")}
              {step === 4 && t(language, "step4Title")}
              {step === 5 && `🎉 ${t(language, "step5Title")}`}
            </h2>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Step Indicator */}
        {step < 5 && (
          <div className="grid grid-cols-4 gap-1 border-b border-border bg-muted/40 p-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s <= step ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* STEP 1: CROP & QUANTITY */}
          {step === 1 && (
            <div className="space-y-4">

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">{t(language, "selectCrop")}</label>
                <div className="grid grid-cols-2 gap-2">
                  {crops.map((crop) => (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => setSelectedCrop(crop.name)}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                        selectedCrop === crop.name
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      <span className="text-2xl">{crop.icon}</span>
                      <span className="mt-1 font-bold text-xs">
                        {language === "ml" ? (crop.localName?.ml || crop.name) : crop.name}
                      </span>
                      <span className="text-[11px] font-semibold text-primary mt-0.5">
                        MSP: ₹{crop.mspPerKg}/kg
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  {t(language, "harvestQty")}
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="range"
                    min="100"
                    max="3000"
                    step="50"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="font-mono text-base font-bold text-primary">
                    {quantity} kg
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-muted/40 p-2.5 text-xs">
                  <span className="text-muted-foreground">{t(language, "estPayout")}</span>
                  <strong className="text-sm font-bold text-emerald-700">
                    ₹{totalPayout.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROCUREMENT CENTRE SELECTION */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  {t(language, "chooseCentre")}
                </label>
                <span className="text-[10px] text-primary font-semibold">📍 Real-time queue sync</span>
              </div>

              <div className="space-y-2.5">
                {centres.map((centre) => {
                  const isRec = centre.id === recommendedCentre.id;
                  const isSelected = selectedCentreId === centre.id;
                  return (
                    <div
                      key={centre.id}
                      onClick={() => setSelectedCentreId(centre.id)}
                      className={`relative cursor-pointer rounded-2xl border p-3.5 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-card hover:border-border/80"
                      }`}
                    >
                      {isRec && (
                        <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                          <Sparkles className="size-3" /> ⭐ {t(language, "recommendedCentre")}
                        </span>
                      )}

                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-xs flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-primary" /> {centre.name}
                          </h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{centre.location}</p>
                        </div>
                        {isSelected && <Check className="size-4 text-primary" />}
                      </div>

                      <div className="mt-2.5 grid grid-cols-3 gap-2 border-t border-border/60 pt-2 text-[11px]">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Distance</span>
                          <strong>{centre.distanceKm} km</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Yard Queue</span>
                          <strong>{centre.currentQueueLength} farmers</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Est Turnaround</span>
                          <strong className={centre.activeDelayMinutes > 0 ? "text-destructive" : ""}>
                            ~{centre.currentQueueLength * centre.avgProcessingMinutes + centre.activeDelayMinutes}m
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: DATE & TIME SLOT */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">{t(language, "chooseDateSlot")}</label>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {dates.map((d) => (
                    <button
                      key={d.label}
                      type="button"
                      onClick={() => setSelectedDate(d.label)}
                      className={`rounded-xl border p-2 text-center transition-all ${
                        selectedDate === d.label
                          ? "border-primary bg-primary text-primary-foreground font-bold shadow-sm"
                          : "border-border bg-card text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <span className="block text-xs font-bold">{d.label}</span>
                      <span className="block text-[9px] opacity-75">{d.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    {t(language, "availableSlots")}
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">🟢 Open</span>
                    <span className="inline-flex items-center gap-1 text-amber-600 font-bold">🟡 Fast</span>
                    <span className="inline-flex items-center gap-1 text-destructive font-bold">🔴 Full</span>
                  </div>
                </div>

                <div className="mt-2 space-y-2">
                  {currentCentre.slots.map((slot) => {
                    const isFull = slot.status === "full";
                    const isSelected = selectedSlotTime === slot.time;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={isFull}
                        onClick={() => setSelectedSlotTime(slot.time)}
                        className={`flex w-full items-center justify-between rounded-xl border p-3 text-xs transition-all ${
                          isFull
                            ? "opacity-50 cursor-not-allowed border-border bg-muted/40"
                            : isSelected
                            ? "border-primary bg-primary/10 font-bold shadow-sm"
                            : "border-border bg-card hover:bg-muted/40"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Clock className="size-3.5 text-muted-foreground" />
                          <span>{slot.time}</span>
                        </span>

                        <span className="flex items-center gap-2 text-[11px]">
                          <span
                            className={
                              slot.status === "available"
                                ? "text-emerald-700 font-bold"
                                : slot.status === "almost_full"
                                ? "text-amber-700 font-bold"
                                : "text-destructive font-bold"
                            }
                          >
                            {slot.available} {t(language, "slotsLeft")}
                          </span>
                          {isSelected && <Check className="size-4 text-primary" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-2.5">
                <h3 className="font-display text-base font-bold text-primary">{t(language, "summaryTitle")}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Crop & Weight</span>
                    <strong>
                      {language === "ml"
                        ? currentCrop.localName?.ml || selectedCrop
                        : selectedCrop}{" "}
                      · {quantity} kg
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Total MSP Payout</span>
                    <strong className="text-primary">₹{totalPayout.toLocaleString("en-IN")}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Procurement Centre</span>
                    <strong>{currentCentre.name}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Date & Slot</span>
                    <strong>{selectedDate}, {selectedSlotTime}</strong>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground flex items-start gap-2">
                <ShieldCheck className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Upon confirmation, an automated <strong>Digital Token Number</strong> will be assigned according to centre holding capacity and queue progression.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS CONFIRMATION PASS */}
          {step === 5 && (
            <div className="space-y-4 text-center py-2">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                <Check className="size-8 stroke-[3]" />
              </div>
              <div>
                <span className="eyebrow text-primary">{t(language, "digitalPassIssued")}</span>
                <h3 className="font-display text-2xl font-bold mt-1">{t(language, "allSet")}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Arrive 15 mins prior to {selectedSlotTime} at {currentCentre.name}.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/40 p-4 text-left space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-border/80 pb-2">
                  <span className="text-muted-foreground">TOKEN NUMBER:</span>
                  <span className="font-display text-2xl font-bold text-primary">#{assignedQueueNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">BOOKING ID:</span>
                  <span className="font-bold">{confirmedBookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SLOT TIME:</span>
                  <span>{selectedDate}, {selectedSlotTime}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    if (onNavigateToQueue) {
                      onNavigateToQueue();
                    }
                  }}
                  className="rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                >
                  <Clock className="size-3.5" /> {t(language, "trackLiveQueue")}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-border bg-card py-3 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                >
                  {t(language, "goToDashboard")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {step < 5 && (
          <div className="flex items-center justify-between border-t border-border p-4 bg-card">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
              >
                {t(language, "back")}
              </button>
            ) : (
              <span />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as any)}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-md"
              >
                {t(language, "nextStep")} <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-lg active:scale-95 transition-all"
              >
                🎟️ {t(language, "confirmGenToken")} <Check className="size-4 stroke-[3]" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
