import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { extractAxiosMessage, isApiOk } from "@/lib/utils";

// === Types ===

interface TokenHistoryItem {
  id: number;
  token_code: string;
  is_used: number;
  created_at: string;
  expired_at: string;
  activated_at: string | null;
  access_expired_at: string | null;
  payment_status: string;
  amount: number;
}

interface TokenStore {
  hasAccess: boolean;
  accessExpiredAt: string | null;
  remainingSeconds: number;
  isCheckingToken: boolean;
  isPurchasing: boolean;
  isActivating: boolean;
  isAutoActivating: boolean;
  qrUrl: string | null;
  currentOrderId: string | null;
  purchaseExpiredAt: string | null;
  generatedTokenCode: string | null;
  paymentStatus: string | null;
  tokenHistory: TokenHistoryItem[];
  isLoadingHistory: boolean;
  countdownInterval: ReturnType<typeof setInterval> | null;

  checkTokenStatus: () => Promise<void>;
  purchaseToken: () => Promise<void>;
  activateToken: (tokenCode: string) => Promise<void>;
  autoActivateToken: (orderId: string) => Promise<boolean>;
  pollPaymentStatus: (orderId: string) => Promise<boolean>;
  getTokenHistory: () => Promise<void>;
  startCountdown: () => void;
  stopCountdown: () => void;
  resetPurchase: () => void;
}

// === Helpers ===

const TOKEN_ACCESS_KEY = "token_access";

function getUser() {
  try {
    const raw = localStorage.getItem("mhs");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistAccess(hasAccess: boolean, accessExpiredAt: string | null) {
  localStorage.setItem(
    TOKEN_ACCESS_KEY,
    JSON.stringify({ hasAccess, accessExpiredAt })
  );
}

function loadPersistedAccess(): {
  hasAccess: boolean;
  accessExpiredAt: string | null;
} {
  try {
    const raw = localStorage.getItem(TOKEN_ACCESS_KEY);
    if (!raw) return { hasAccess: false, accessExpiredAt: null };
    const parsed = JSON.parse(raw);
    // Cek apakah masih valid
    if (parsed.hasAccess && parsed.accessExpiredAt) {
      // Ensure it's parsed as UTC by appending 'Z' if missing
      const dateStr = parsed.accessExpiredAt.endsWith('Z') ? parsed.accessExpiredAt : parsed.accessExpiredAt.replace(' ', 'T') + 'Z';
      const remaining = Math.floor(
        (new Date(dateStr).getTime() - Date.now()) / 1000
      );
      if (remaining <= 0) {
        return { hasAccess: false, accessExpiredAt: null };
      }
    }
    return parsed;
  } catch {
    return { hasAccess: false, accessExpiredAt: null };
  }
}

const initial = loadPersistedAccess();

// === Store ===

export const useTokenStore = create<TokenStore>((set, get) => ({
  hasAccess: initial.hasAccess,
  accessExpiredAt: initial.accessExpiredAt,
  remainingSeconds: 0,
  isCheckingToken: false,
  isPurchasing: false,
  isActivating: false,
  isAutoActivating: false,
  qrUrl: null,
  currentOrderId: null,
  purchaseExpiredAt: null,
  generatedTokenCode: null,
  paymentStatus: null,
  tokenHistory: [],
  isLoadingHistory: false,
  countdownInterval: null,

  checkTokenStatus: async () => {
    const user = getUser();
    if (!user?.id) return;

    set({ isCheckingToken: true });
    try {
      const res = await axiosInstance.get("/token/status", {
        params: { sipt_user_id: user.id },
      });

      const data = res.data?.data ?? res.data;
      const hasAccess = !!data?.has_access;
      const accessExpiredAt = data?.access_expired_at ?? null;
      const remainingSeconds = data?.remaining_seconds ?? 0;

      set({ hasAccess, accessExpiredAt, remainingSeconds });
      persistAccess(hasAccess, accessExpiredAt);

      if (hasAccess) {
        get().startCountdown();
      }
    } catch (err) {
      console.error("checkTokenStatus:", extractAxiosMessage(err));
    } finally {
      set({ isCheckingToken: false });
    }
  },

  purchaseToken: async () => {
    const user = getUser();
    if (!user?.id) {
      toast.error("Data user tidak ditemukan");
      return;
    }

    set({ isPurchasing: true });
    try {
      const res = await axiosInstance.post("/token/purchase", {
        sipt_user_id: user.id,
        email: user.email,
        nama: user.nama,
      });

      const data = res.data?.data ?? res.data;
      if (isApiOk(res.data?.status_code, res.data?.messages)) {
        set({
          qrUrl: data?.qr_url ?? null,
          currentOrderId: data?.order_id ?? null,
          purchaseExpiredAt: data?.expired_at ?? null,
        });
        toast.success("QR Pembayaran berhasil dibuat");
      } else {
        toast.error(res.data?.messages ?? "Gagal membuat pembayaran");
      }
    } catch (err) {
      toast.error(extractAxiosMessage(err));
    } finally {
      set({ isPurchasing: false });
    }
  },

  activateToken: async (tokenCode: string) => {
    const user = getUser();
    if (!user?.id) {
      toast.error("Data user tidak ditemukan");
      return;
    }

    set({ isActivating: true });
    try {
      const res = await axiosInstance.post("/token/activate", {
        token_code: tokenCode,
        sipt_user_id: user.id,
      });

      const data = res.data?.data ?? res.data;
      if (isApiOk(res.data?.status_code, res.data?.messages) || data?.success) {
        const accessExpiredAt = data?.access_expired_at ?? null;
        set({
          hasAccess: true,
          accessExpiredAt,
          generatedTokenCode: data?.token_code ?? tokenCode,
        });
        persistAccess(true, accessExpiredAt);
        get().startCountdown();
        toast.success("Token berhasil diaktivasi! Akses diberikan.");
      } else {
        toast.error(res.data?.messages ?? "Gagal mengaktivasi token");
      }
    } catch (err) {
      toast.error(extractAxiosMessage(err));
    } finally {
      set({ isActivating: false });
    }
  },

  autoActivateToken: async (orderId: string) => {
    const user = getUser();
    if (!user?.id) return false;

    set({ isAutoActivating: true });
    try {
      const res = await axiosInstance.post("/token/auto-activate", {
        order_id: orderId,
        sipt_user_id: user.id,
      });

      const data = res.data?.data ?? res.data;
      if (data?.success) {
        const accessExpiredAt = data?.access_expired_at ?? null;
        set({
          hasAccess: true,
          accessExpiredAt,
          paymentStatus: "PAID",
        });
        persistAccess(true, accessExpiredAt);
        get().startCountdown();
        return true;
      }
      return false;
    } catch (err) {
      console.error("autoActivateToken:", err);
      return false;
    } finally {
      set({ isAutoActivating: false });
    }
  },

  pollPaymentStatus: async (orderId: string) => {
    try {
      const res = await axiosInstance.get(`/payment/status/${orderId}`);
      const data = res.data?.data ?? res.data;
      const status = data?.payment_status ?? null;

      set({ paymentStatus: status });

      if (status === "PAID") {
        // Langsung auto-aktivasi tanpa user perlu copy-paste token
        await get().autoActivateToken(orderId);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  },

  getTokenHistory: async () => {
    const user = getUser();
    if (!user?.id) return;

    set({ isLoadingHistory: true });
    try {
      const res = await axiosInstance.get("/token/history", {
        params: { sipt_user_id: user.id },
      });

      const data = res.data?.data ?? res.data;
      set({ tokenHistory: Array.isArray(data) ? data : [] });
    } catch (err) {
      console.error("getTokenHistory:", extractAxiosMessage(err));
    } finally {
      set({ isLoadingHistory: false });
    }
  },

  startCountdown: () => {
    // Bersihkan interval sebelumnya
    const prev = get().countdownInterval;
    if (prev) clearInterval(prev);

    const tick = () => {
      const { accessExpiredAt } = get();
      if (!accessExpiredAt) return;

      const dateStr = accessExpiredAt.endsWith('Z') ? accessExpiredAt : accessExpiredAt.replace(' ', 'T') + 'Z';
      const remaining = Math.floor(
        (new Date(dateStr).getTime() - Date.now()) / 1000
      );

      if (remaining <= 0) {
        set({ hasAccess: false, remainingSeconds: 0 });
        persistAccess(false, null);
        get().stopCountdown();
        toast("⏰ Akses token telah habis", { icon: "🔒" });
        return;
      }

      set({ remainingSeconds: remaining });
    };

    // Jalankan sekali dulu
    tick();
    const interval = setInterval(tick, 1000);
    set({ countdownInterval: interval });
  },

  stopCountdown: () => {
    const interval = get().countdownInterval;
    if (interval) clearInterval(interval);
    set({ countdownInterval: null });
  },

  resetPurchase: () => {
    set({
      qrUrl: null,
      currentOrderId: null,
      purchaseExpiredAt: null,
      generatedTokenCode: null,
      paymentStatus: null,
    });
  },
}));
