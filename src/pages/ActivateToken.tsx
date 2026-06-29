import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Topbar from "@/components/Topbar";
import Footer from "@/components/Footer";
import { useTokenStore } from "@/store/useTokenStore";
import {
  FiKey,
  FiClock,
  FiCheckCircle,
  FiShoppingCart,
  FiArrowRight,
  FiInfo,
} from "react-icons/fi";
import { Loader2 } from "lucide-react";

/** Format input menjadi TKN-XXXX-XXXX-XXXX */
function formatTokenInput(value: string): string {
  // Hapus semua karakter selain alphanumeric
  const clean = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  // Potong max 15 char (TKN + 4 + 4 + 4 = 15 alphanum tanpa dash)
  const trimmed = clean.slice(0, 15);

  // Split menjadi grup: TKN, lalu 4, 4, 4
  const parts: string[] = [];
  if (trimmed.length <= 3) {
    parts.push(trimmed);
  } else {
    parts.push(trimmed.slice(0, 3));
    const rest = trimmed.slice(3);
    for (let i = 0; i < rest.length; i += 4) {
      parts.push(rest.slice(i, i + 4));
    }
  }

  return parts.join("-");
}

/** Format detik ke MM:SS */
function formatTime(seconds: number): { mins: string; secs: string } {
  const m = Math.max(0, Math.floor(seconds / 60));
  const s = Math.max(0, seconds % 60);
  return {
    mins: String(m).padStart(2, "0"),
    secs: String(s).padStart(2, "0"),
  };
}

const TOTAL_DURATION = 3600; // 1 jam

const ActivateToken = () => {
  const navigate = useNavigate();
  const [tokenInput, setTokenInput] = useState("");

  const {
    hasAccess,
    accessExpiredAt,
    remainingSeconds,
    isCheckingToken,
    isActivating,
    activateToken,
    checkTokenStatus,
  } = useTokenStore();

  useEffect(() => {
    checkTokenStatus();
  }, [checkTokenStatus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenInput(formatTokenInput(e.target.value));
  };

  const handleActivate = async () => {
    if (!tokenInput || tokenInput.length < 5) return;
    await activateToken(tokenInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleActivate();
  };

  const time = formatTime(remainingSeconds);
  const progress = Math.min(remainingSeconds / TOTAL_DURATION, 1);
  const circumference = 2 * Math.PI * 54; // radius 54
  const strokeDashoffset = circumference * (1 - progress);

  // Loading state
  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Topbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-slate-500 font-medium">
              Memeriksa status token...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Topbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 flex-grow pb-12 relative z-20">
        <div className="max-w-lg mx-auto py-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 animate-[fadeIn_0.5s_ease-out]">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">
              <FiKey className="text-base" />
              {hasAccess ? "Token Aktif" : "Aktivasi Token"}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {hasAccess ? "Akses Aktif" : "Aktivasi Token"}
            </h1>
          </div>

          {/* ============ BELUM AKTIF ============ */}
          {!hasAccess && (
            <div className="animate-[fadeIn_0.4s_ease-out]">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-xl" />

                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl overflow-hidden">
                  {/* Gradient top accent */}
                  <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />

                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="text-center space-y-1">
                      <h3 className="text-lg font-bold text-slate-800">
                        Masukkan Kode Token
                      </h3>
                      <p className="text-sm text-slate-500">
                        Masukkan kode yang Anda dapatkan setelah pembayaran
                      </p>
                    </div>

                    {/* Token Input */}
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={tokenInput}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="TKN-XXXX-XXXX-XXXX"
                        maxLength={18}
                        className="input w-full h-16 text-center text-2xl font-mono font-bold tracking-[0.2em] bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 placeholder:tracking-[0.15em] uppercase"
                      />
                      <p className="text-xs text-center text-slate-400">
                        Format: TKN-XXXX-XXXX-XXXX
                      </p>
                    </div>

                    {/* Activate Button */}
                    <button
                      onClick={handleActivate}
                      disabled={isActivating || tokenInput.length < 5}
                      className="btn w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 h-14 text-base font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isActivating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Mengaktivasi...
                        </>
                      ) : (
                        <>
                          <FiKey className="text-lg" />
                          Aktivasi Token
                        </>
                      )}
                    </button>

                    {/* Link ke purchase */}
                    <div className="text-center pt-2">
                      <Link
                        to="/purchase-token"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium group transition-colors"
                      >
                        <FiShoppingCart className="text-base" />
                        Belum punya token? Beli di sini
                        <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ SUDAH AKTIF (Countdown) ============ */}
          {hasAccess && (
            <div className="animate-[fadeIn_0.4s_ease-out]">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 rounded-3xl blur-xl" />

                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl overflow-hidden">
                  {/* Gradient top accent */}
                  <div className="h-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500" />

                  <div className="p-6 sm:p-8 space-y-8">
                    {/* Circular Timer */}
                    <div className="flex justify-center">
                      <div className="relative w-44 h-44 sm:w-52 sm:h-52">
                        {/* SVG Circle */}
                        <svg
                          className="w-full h-full -rotate-90"
                          viewBox="0 0 120 120"
                        >
                          {/* Background ring */}
                          <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="6"
                          />
                          {/* Progress ring */}
                          <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="url(#timerGradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-linear"
                          />
                          <defs>
                            <linearGradient
                              id="timerGradient"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop offset="0%" stopColor="#22c55e" />
                              <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                          </defs>
                        </svg>

                        {/* Timer Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Sisa Waktu
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tabular-nums">
                              {time.mins}
                            </span>
                            <span className="text-2xl sm:text-3xl font-bold text-slate-400 animate-pulse">
                              :
                            </span>
                            <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tabular-nums">
                              {time.secs}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FiCheckCircle className="text-green-600 text-lg" />
                        </div>
                        <div>
                          <p className="text-xs text-green-600 font-medium">
                            Status
                          </p>
                          <p className="text-sm font-bold text-green-700">
                            Aktif
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FiClock className="text-blue-600 text-lg" />
                        </div>
                        <div>
                          <p className="text-xs text-blue-600 font-medium">
                            Expired At
                          </p>
                          <p className="text-sm font-bold text-blue-700 truncate">
                            {accessExpiredAt
                              ? new Date(accessExpiredAt.endsWith('Z') ? accessExpiredAt : accessExpiredAt.replace(' ', 'T') + 'Z').toLocaleString(
                                  "id-ID",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Info text */}
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <FiInfo className="text-amber-600 text-lg flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700">
                        Akses Anda akan berakhir setelah waktu habis. Pastikan
                        untuk menyelesaikan kegiatan sebelum timer berakhir.
                      </p>
                    </div>

                    {/* Navigate to Dashboard */}
                    <button
                      onClick={() => navigate("/")}
                      className="btn w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 h-14 text-base font-bold rounded-xl shadow-lg shadow-green-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Lanjut ke Dashboard
                      <FiArrowRight className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ActivateToken;
