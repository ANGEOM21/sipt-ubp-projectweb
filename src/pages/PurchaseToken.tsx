import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "@/components/Topbar";
import Footer from "@/components/Footer";
import { useTokenStore } from "@/store/useTokenStore";
import {
  FiShoppingCart,
  FiCreditCard,
  FiCheckCircle,
  FiZap,
  FiClock,
  FiShield,
  FiHome,
} from "react-icons/fi";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const PRICE = "Rp 5.000";
const POLL_INTERVAL = 3000;
const REDIRECT_DELAY = 4000; // ms sebelum auto-redirect ke dashboard

const PurchaseToken = () => {
  const navigate = useNavigate();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const redirectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    isPurchasing,
    isAutoActivating,
    qrUrl,
    currentOrderId,
    purchaseExpiredAt,
    paymentStatus,
    accessExpiredAt,
    purchaseToken,
    pollPaymentStatus,
    resetPurchase,
  } = useTokenStore();

  // Step: 1=Beli, 2=Bayar, 3=Sukses
  const [currentStep, setCurrentStep] = useState(1);
  const [purchaseRemaining, setPurchaseRemaining] = useState<number>(0);
  const [redirectCountdown, setRedirectCountdown] = useState(
    Math.ceil(REDIRECT_DELAY / 1000)
  );

  // Calculate purchase remaining time
  useEffect(() => {
    if (currentStep === 2 && purchaseExpiredAt) {
      // Midtrans expiry_time is in GMT+7 (WIB) format: YYYY-MM-DD HH:mm:ss
      const expiryStr = purchaseExpiredAt.replace(" ", "T") + "+07:00";
      const expiryTime = new Date(expiryStr).getTime();

      const tick = () => {
        const remaining = Math.max(
          0,
          Math.floor((expiryTime - Date.now()) / 1000)
        );
        setPurchaseRemaining(remaining);
      };

      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStep, purchaseExpiredAt]);

  // Saat QR muncul → step 2 & mulai polling
  useEffect(() => {
    if (qrUrl && currentOrderId) {
      setCurrentStep(2);

      pollRef.current = setInterval(async () => {
        const paid = await pollPaymentStatus(currentOrderId);
        if (paid) {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setCurrentStep(3);
        }
      }, POLL_INTERVAL);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [qrUrl, currentOrderId, pollPaymentStatus]);

  // Saat payment sudah PAID → step 3
  useEffect(() => {
    if (paymentStatus === "PAID") setCurrentStep(3);
  }, [paymentStatus]);

  // Saat step 3 → countdown & auto redirect ke dashboard
  useEffect(() => {
    if (currentStep === 3) {
      toast.success("🎉 Akses berhasil diaktivasi! Selamat datang!", {
        duration: 3000,
      });

      let count = Math.ceil(REDIRECT_DELAY / 1000);
      const countInterval = setInterval(() => {
        count -= 1;
        setRedirectCountdown(count);
        if (count <= 0) clearInterval(countInterval);
      }, 1000);

      redirectRef.current = setTimeout(() => {
        navigate("/");
      }, REDIRECT_DELAY);

      return () => {
        clearInterval(countInterval);
        if (redirectRef.current) clearTimeout(redirectRef.current);
      };
    }
  }, [currentStep, navigate]);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      resetPurchase();
      if (redirectRef.current) clearTimeout(redirectRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.max(0, Math.floor(seconds / 60));
    const s = Math.max(0, seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const steps = [
    { label: "Beli", icon: FiShoppingCart },
    { label: "Bayar", icon: FiCreditCard },
    { label: "Aktif!", icon: FiCheckCircle },
  ];

  // Format expiry time untuk ditampilkan
  const formattedExpiry = accessExpiredAt
    ? new Date(
        accessExpiredAt.endsWith("Z")
          ? accessExpiredAt
          : accessExpiredAt.replace(" ", "T") + "Z"
      ).toLocaleString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Topbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 flex-grow pb-12 relative z-20">
        <div className="max-w-2xl mx-auto py-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 animate-[fadeIn_0.5s_ease-out]">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">
              <FiZap className="text-base" />
              Token Akses Premium
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Beli Token Akses
            </h1>
            <p className="text-slate-500 max-w-md mx-auto">
              Dapatkan akses penuh ke seluruh fitur portal akademik
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-0">
            {steps.map((step, i) => {
              const stepNum = i + 1;
              const isActive = currentStep === stepNum;
              const isDone = currentStep > stepNum;
              return (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500
                        ${isDone ? "bg-green-500 text-white shadow-lg shadow-green-200" : ""}
                        ${isActive ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-200 scale-110" : ""}
                        ${!isDone && !isActive ? "bg-slate-200 text-slate-400" : ""}
                      `}
                    >
                      {isDone ? (
                        <FiCheckCircle className="text-lg" />
                      ) : (
                        <step.icon className="text-lg" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold transition-colors ${
                        isActive
                          ? "text-blue-600"
                          : isDone
                            ? "text-green-600"
                            : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 rounded transition-colors duration-500 ${
                        currentStep > stepNum ? "bg-green-400" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Main Card */}
          <div className="relative">
            {/* Dynamic glow background */}
            <div
              className={`absolute -inset-1 rounded-3xl blur-xl transition-all duration-700 ${
                currentStep === 3
                  ? "bg-gradient-to-r from-green-500/30 via-emerald-500/30 to-green-500/30"
                  : "bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20"
              }`}
            />

            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl overflow-hidden">
              {/* Dynamic Gradient Header */}
              <div
                className={`px-6 py-8 text-white text-center relative overflow-hidden transition-all duration-700 ${
                  currentStep === 3
                    ? "bg-gradient-to-br from-green-500 via-green-600 to-emerald-700"
                    : "bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700"
                }`}
              >
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-sm font-medium mb-4">
                    <FiShield className="text-base" />
                    {currentStep === 3
                      ? "Akses Aktif ✓"
                      : "Pembayaran Aman via QRIS"}
                  </div>
                  <div className="text-5xl sm:text-6xl font-extrabold tracking-tight">
                    {PRICE}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3 text-blue-100">
                    <FiClock className="text-base" />
                    <span className="text-sm font-medium">1 Jam Akses Penuh</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                {/* ───────────────── STEP 1: Beli ───────────────── */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                    <div className="space-y-3">
                      {[
                        "Akses seluruh fitur akademik",
                        "Lihat nilai, KRS, dan kurikulum",
                        "Bayar UKT & perwalian online",
                      ].map((f) => (
                        <div
                          key={f}
                          className="flex items-center gap-3 text-slate-600"
                        >
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <FiCheckCircle className="text-green-600 text-xs" />
                          </div>
                          <span className="text-sm">{f}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={purchaseToken}
                      disabled={isPurchasing}
                      className="btn w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 h-14 text-base font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                    >
                      {isPurchasing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <FiShoppingCart className="text-lg" />
                          Beli Akses Sekarang
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* ───────────────── STEP 2: Bayar (QR) ───────────────── */}
                {currentStep === 2 && qrUrl && (
                  <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-bold text-slate-800">
                        Scan QR Code untuk Bayar
                      </h3>
                      <p className="text-sm text-slate-500">
                        Gunakan aplikasi e-wallet atau mobile banking
                      </p>
                    </div>

                    {/* QR Code display */}
                    <div className="flex justify-center">
                      <div className="relative p-2">
                        {/* Animated glow border */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-2xl opacity-60 blur-sm animate-pulse" />
                        <div className="relative bg-white p-4 rounded-xl shadow-xl">
                          <img
                            src={qrUrl}
                            alt="QRIS QR Code"
                            className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Polling indicator */}
                    <div className="flex items-center justify-center gap-3 py-4 px-5 bg-amber-50 rounded-xl border border-amber-200">
                      <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                      <span className="text-sm font-medium text-amber-700">
                        Menunggu konfirmasi pembayaran...
                      </span>
                    </div>

                    {/* Expiry indicator */}
                    {purchaseRemaining > 0 ? (
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
                        <FiClock className="text-base text-red-500" />
                        QRIS expired dalam{" "}
                        <span className="text-red-500 font-bold tabular-nums">
                          {formatTime(purchaseRemaining)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-sm text-red-500 font-bold">
                        <FiClock className="text-base" />
                        Kode QR telah kedaluwarsa
                      </div>
                    )}

                    <p className="text-xs text-center text-slate-400">
                      Order ID: {currentOrderId}
                    </p>
                  </div>
                )}

                {/* ───────────────── STEP 3: Sukses & Auto Redirect ───────────────── */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                    {/* Success animation */}
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 animate-[successPop_0.6s_cubic-bezier(0.68,-0.55,0.27,1.55)]">
                        <FiCheckCircle className="text-4xl text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-green-700">
                        Akses Berhasil Diaktivasi!
                      </h3>
                      <p className="text-sm text-slate-500">
                        Pembayaran diterima & akses langsung aktif. Selamat
                        menggunakan portal akademik!
                      </p>
                    </div>

                    {/* Access info card */}
                    <div className="bg-green-50 rounded-xl border border-green-200 p-5 space-y-3">
                      {isAutoActivating ? (
                        <div className="flex items-center justify-center gap-3 py-2">
                          <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                          <span className="text-sm text-green-700 font-medium">
                            Mengaktivasi akses...
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                              <FiCheckCircle className="text-green-700 text-sm" />
                            </div>
                            <div>
                              <p className="text-xs text-green-600 font-medium">
                                Status Akses
                              </p>
                              <p className="text-sm font-bold text-green-800">
                                ✅ Aktif — 1 Jam Penuh
                              </p>
                            </div>
                          </div>
                          {formattedExpiry && (
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                                <FiClock className="text-green-700 text-sm" />
                              </div>
                              <div>
                                <p className="text-xs text-green-600 font-medium">
                                  Berlaku Hingga
                                </p>
                                <p className="text-sm font-bold text-green-800">
                                  {formattedExpiry}
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Auto redirect countdown */}
                    <div className="text-center space-y-3">
                      <p className="text-sm text-slate-500">
                        Otomatis ke Dashboard dalam{" "}
                        <span className="font-bold text-blue-600 tabular-nums text-base">
                          {redirectCountdown}
                        </span>{" "}
                        detik...
                      </p>

                      <button
                        onClick={() => navigate("/")}
                        className="btn w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 h-14 text-base font-bold rounded-xl shadow-lg shadow-green-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <FiHome className="text-lg" />
                        Langsung ke Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Global Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes successPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PurchaseToken;
