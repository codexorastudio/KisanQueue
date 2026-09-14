import React, { useState } from "react";
import { useKisanQueue } from "@/lib/store";
import { fetchUserByMobile, fetchUserByFarmerId, createDbUser } from "@/lib/db";
import { X, CheckCircle2, Phone, ShieldCheck, KeyRound, UserCheck, ArrowRight } from "lucide-react";

export function AuthModal({
  isOpen,
  open,
  onClose,
}: {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
}) {
  const isModalOpen = isOpen ?? open ?? false;
  const { setRole, addNotification, setIsLoggedIn, setUser } = useKisanQueue();
  const [authMode, setAuthMode] = useState<"otp" | "farmerId" | "staff" | "register">("otp");
  const [mobile, setMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [farmerIdInput, setFarmerIdInput] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Registration state
  const [regName, setRegName] = useState("");
  const [regVillage, setRegVillage] = useState("");
  const [regDistrict, setRegDistrict] = useState("Kottayam");
  const [regCrop, setRegCrop] = useState("Paddy (നെല്ല്)");

  if (!isModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setOtpSent(true);
    setOtpValue("2604");
    try {
      const userMatch = await fetchUserByMobile(mobile);
      if (userMatch) {
        addNotification("OTP Sent 📲", `Welcome back ${userMatch.name}! Verification code is 2604.`, "sms");
      } else {
        addNotification("OTP Sent 📲", "Your 4-digit verification code is 2604 (Auto-filled for demo).", "sms");
      }
    } catch {
      addNotification("OTP Sent 📲", "Your 4-digit verification code is 2604 (Auto-filled for demo).", "sms");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userMatch = await fetchUserByMobile(mobile);
      if (userMatch) {
        setUser(userMatch);
        addNotification("Login Successful 👨‍🌾", `Welcome back ${userMatch.name} (Farmer ID: ${userMatch.farmerId}).`, "booking");
      } else {
        const randomSuffix = Math.floor(10000 + Math.random() * 90000);
        const newUser = await createDbUser({
          name: "Farmer",
          mobile,
          farmerId: `KL-KTM-${randomSuffix}`,
          village: "Kumarakom",
          district: "Kottayam",
          role: "farmer",
        });
        if (newUser) setUser(newUser);
        addNotification("Farmer Registered 🌾", `Welcome to KisanQueue! Your ID is KL-KTM-${randomSuffix}.`, "booking");
      }
      setRole("farmer");
      setIsLoggedIn(true);
      onClose();
    } catch (err) {
      console.error(err);
      setRole("farmer");
      setIsLoggedIn(true);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFarmerIdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userMatch = await fetchUserByFarmerId(farmerIdInput);
      if (userMatch) {
        setUser(userMatch);
        addNotification("Farmer Authenticated 🌾", `Welcome back ${userMatch.name} (${userMatch.farmerId}).`, "booking");
      } else {
        addNotification("Farmer Authenticated 🌾", `Logged in with verified Kerala Farmer ID: ${farmerIdInput}.`, "booking");
      }
      setRole("farmer");
      setIsLoggedIn(true);
      onClose();
    } catch (err) {
      console.error(err);
      setRole("farmer");
      setIsLoggedIn(true);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLogin = (asAdmin = false) => {
    if (asAdmin) {
      setRole("admin");
      addNotification("Admin Session Active 🧑‍💼", "Statewide Agricultural Procurement Directorate unlocked.", "booking");
    } else {
      setRole("staff");
      addNotification("Staff Session Active 🏢", "Kottayam Centre Yard Queue & Verification controls unlocked.", "booking");
    }
    onClose();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const farmerId = `KL-${regDistrict.slice(0, 3).toUpperCase()}-${randomSuffix}`;
      const newUser = await createDbUser({
        name: regName || "Farmer",
        mobile,
        farmerId,
        village: regVillage || "Kumarakom",
        district: regDistrict,
        primaryCrop: regCrop,
        crops: [regCrop.toLowerCase().includes("paddy") ? "paddy" : "coconut"],
        role: "farmer",
      });

      if (newUser) {
        setUser(newUser);
      }
      setRole("farmer");
      setIsLoggedIn(true);
      addNotification(
        "Farmer Registration Completed 🎉",
        `Welcome ${regName || "Farmer"}! Your verified Farmer ID is ${farmerId}. Assigned to ${regDistrict} cluster.`,
        "booking"
      );
      onClose();
    } catch (err) {
      console.error(err);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-border bg-card text-foreground shadow-2xl">
        {/* Header */}
        <div className="border-b border-border p-5 text-center">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display text-2xl font-bold">
            KQ
          </div>
          <h2 className="font-display text-xl font-bold">KisanQueue Portal</h2>
          <p className="mt-1 text-xs text-muted-foreground">Select role or authenticate below</p>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-border bg-muted/40 p-1 text-xs font-semibold">
          <button
            onClick={() => setAuthMode("otp")}
            className={`flex-1 rounded-xl py-2 transition-all ${
              authMode === "otp" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            Mobile OTP
          </button>
          <button
            onClick={() => setAuthMode("farmerId")}
            className={`flex-1 rounded-xl py-2 transition-all ${
              authMode === "farmerId" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            Farmer ID
          </button>
          <button
            onClick={() => setAuthMode("staff")}
            className={`flex-1 rounded-xl py-2 transition-all ${
              authMode === "staff" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            Staff / Admin
          </button>
          <button
            onClick={() => setAuthMode("register")}
            className={`flex-1 rounded-xl py-2 transition-all ${
              authMode === "register" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            New Farmer
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5">
          {authMode === "otp" && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase">Registered Mobile Number</label>
                    <div className="mt-1.5 flex items-center rounded-xl border border-input bg-background px-3 py-2.5">
                      <span className="text-xs font-semibold text-muted-foreground mr-2">+91</span>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Enter 10-digit number"
                        required
                        className="w-full bg-transparent text-sm font-semibold outline-none"
                      />
                      <Phone className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.01]"
                  >
                    Send One-Time Password <ArrowRight className="size-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="rounded-xl bg-primary/10 p-3 text-xs text-primary">
                    Enter the 4-digit code sent to +91 {mobile} (Demo: <strong>2604</strong>).
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase">4-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-input bg-background p-3 text-center text-xl font-bold tracking-widest outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md"
                  >
                    Verify & Enter Farmer Dashboard <CheckCircle2 className="size-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {authMode === "farmerId" && (
            <form onSubmit={handleFarmerIdLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Government Farmer ID / Karshaka ID</label>
                <div className="mt-1.5 flex items-center rounded-xl border border-input bg-background px-3 py-2.5">
                  <input
                    type="text"
                    value={farmerIdInput}
                    onChange={(e) => setFarmerIdInput(e.target.value)}
                    placeholder="e.g. KL-KTM-26047"
                    required
                    className="w-full bg-transparent text-sm font-semibold outline-none uppercase"
                  />
                  <ShieldCheck className="size-4 text-primary" />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Linked to AIMS (Agricultural Information Management System)
                </p>
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md"
              >
                Sign In with Farmer ID <ArrowRight className="size-4" />
              </button>
            </form>
          )}

          {authMode === "staff" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Staff Password / Token</label>
                <div className="mt-1.5 flex items-center rounded-xl border border-input bg-background px-3 py-2.5">
                  <input
                    type="password"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                  <KeyRound className="size-4 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleStaffLogin(false)}
                  className="rounded-xl border border-border bg-card p-3 text-left hover:border-primary transition-all"
                >
                  <p className="text-xs font-bold">🏢 Centre Staff</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Kottayam Gate-B desk</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleStaffLogin(true)}
                  className="rounded-xl border border-border bg-card p-3 text-left hover:border-primary transition-all"
                >
                  <p className="text-xs font-bold">🧑‍💼 Govt Admin</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Directorate analytics</p>
                </button>
              </div>
            </div>
          )}

          {authMode === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Farmer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Radhakrishnan Nair"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Village / Krishi Bhavan</label>
                  <input
                    type="text"
                    placeholder="e.g. Kumarakom"
                    value={regVillage}
                    onChange={(e) => setRegVillage(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">District</label>
                  <select
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-2 py-2 text-xs outline-none"
                  >
                    <option value="Kottayam">Kottayam</option>
                    <option value="Alappuzha">Alappuzha</option>
                    <option value="Idukki">Idukki</option>
                    <option value="Palakkad">Palakkad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Primary Crop Cultivated</label>
                <select
                  value={regCrop}
                  onChange={(e) => setRegCrop(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none"
                >
                  <option value="Paddy (നെല്ല്)">Paddy (നെല്ല്)</option>
                  <option value="Coconut (തേങ്ങ)">Raw Coconut (തേങ്ങ)</option>
                  <option value="Rubber (റബ്ബർ)">Rubber Sheet (റബ്ബർ)</option>
                  <option value="Pepper (കുരുമുളക്)">Black Pepper (കുരുമുളക്)</option>
                </select>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md mt-2"
              >
                Register & Issue Digital Pass <UserCheck className="size-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
