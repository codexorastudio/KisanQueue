import React, { useState } from "react";
import { useKisanQueue } from "@/lib/store";
import { t } from "@/lib/translations";
import { ArrowLeft, CheckCircle2, IndianRupee, Download, Building, FileText, Check } from "lucide-react";

export function PaymentTrackingView({ onBack }: { onBack: () => void }) {
  const { user, bookings, language } = useKisanQueue();
  const [showVoucher, setShowVoucher] = useState(false);

  const completed = bookings.filter((b) => b.paymentStatus === "completed" || b.status === "completed");

  return (
    <div className="content-stack pt-2 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold">{t(language, "paymentStatus")}</h1>
          <p className="text-xs text-muted-foreground">{t(language, "dbtPayout")}</p>
        </div>
      </div>

      {/* Hero Payout Summary Card */}
      <section className="payment-hero relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-dots text-white/10" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-secondary">LATEST SETTLEMENT</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold">
              <CheckCircle2 className="size-3" /> Transferred via PFMS
            </span>
          </div>

          <p className="mt-2 font-display text-5xl font-extrabold text-secondary">₹13,440</p>
          <p className="text-xs text-primary-foreground/75 mt-0.5">
            Paddy Procurement · 420 kg @ ₹32/kg MSP
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/15 pt-3 text-xs">
            <div>
              <span className="text-[10px] text-primary-foreground/60 block">Bank Account</span>
              <strong>{user.bankAccount || "SBI **** 4891"}</strong>
            </div>
            <div>
              <span className="text-[10px] text-primary-foreground/60 block">Transaction Reference</span>
              <strong className="font-mono">TXN80472291</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Payment History List */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Settlement Ledger
          </h3>
          <button
            onClick={() => setShowVoucher(true)}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <Download className="size-3" /> Download Advice
          </button>
        </div>

        {completed.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-border bg-card p-3.5 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold">{item.crop} · {item.quantityKg} kg</h4>
                <p className="text-[10px] text-muted-foreground font-mono">{item.date} · Ref: {item.transactionId}</p>
              </div>
              <div className="text-right">
                <strong className="text-sm font-bold text-emerald-700">₹{item.totalAmount.toLocaleString("en-IN")}</strong>
                <span className="block text-[9px] uppercase font-bold text-emerald-600">Settled ✓</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
              <span>Rate: ₹{item.mspPerKg}/kg</span>
              <span>Direct Bank Deposit: {user.bankAccount}</span>
            </div>
          </div>
        ))}
      </section>

      {/* DBT Bank Guarantee Info Box */}
      <div className="rounded-2xl border border-border bg-muted/40 p-4 flex items-start gap-3 text-xs text-muted-foreground">
        <Building className="size-5 text-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-foreground block">100% Aadhaar-Linked Direct Transfer</strong>
          <p className="mt-0.5 leading-relaxed">
            All MSP payments are settled straight to the farmer's registered bank account via Public Financial Management System (PFMS) without middleman commission.
          </p>
        </div>
      </div>

      {/* Voucher Modal */}
      {showVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-[28px] border border-border bg-card p-5 text-foreground shadow-2xl space-y-4 text-center">
            <button
              onClick={() => setShowVoucher(false)}
              className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              ✕
            </button>

            <FileText className="size-10 text-primary mx-auto" />
            <div>
              <span className="eyebrow text-primary">KERALA STATE AGRI DEPT</span>
              <h3 className="font-display text-xl font-bold mt-0.5">Procurement Payment Advice</h3>
              <p className="text-xs text-muted-foreground">Certified MSP Electronic Settlement Voucher</p>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-3 text-left font-mono text-xs space-y-1.5">
              <div className="flex justify-between"><span>Farmer:</span><strong>{user?.name && user.name !== "Guest Farmer" ? user.name : "Farmer"} ({user?.farmerId && user.farmerId !== "GUEST" ? user.farmerId : "KL-KTM-26047"})</strong></div>
              <div className="flex justify-between"><span>Commodity:</span><strong>Paddy Grade A (420 kg)</strong></div>
              <div className="flex justify-between"><span>MSP Rate:</span><strong>₹32.00 / kg</strong></div>
              <div className="flex justify-between text-primary font-bold border-t border-border pt-1"><span>Net Disbursed:</span><strong>₹13,440.00</strong></div>
              <div className="flex justify-between text-[10px] text-muted-foreground pt-1"><span>UTR:</span><span>SBIN-PFMS-998822</span></div>
            </div>

            <button
              type="button"
              onClick={() => setShowVoucher(false)}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground"
            >
              Close Voucher
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
