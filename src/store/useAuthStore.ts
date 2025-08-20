import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import type { ResponseAuth, ResponseProfile, UserLogin } from "@/types";
import axios from "axios";
import {
	extractAxiosMessage,
	setAuthHeaderFromToken,
	isApiUnauthorized,
	isApiOk
} from "@/lib/utils";

interface LoginData {
	email: string;
	password: string;
}

interface AuthStore {
	authUser: UserLogin | null;
	isLoggingIn: boolean;
	isUpdatingProfile: boolean;
	isCheckingAuth: boolean;

	checkAuth: (suppressToast?: boolean) => Promise<void>;
	login: (data: LoginData) => Promise<void>;
	logout: () => Promise<void>;
}

// ===== Helpers =====
const TOKEN_KEY = "token";
const MHS_KEY = "mhs";

function getStoredMhs(): UserLogin | null {
	try {
		const raw = localStorage.getItem(MHS_KEY);
		return raw ? (JSON.parse(raw) as UserLogin) : null;
	} catch {
		return null;
	}
}

function setStoredMhs(val: UserLogin | null) {
	if (!val) {
		localStorage.removeItem(MHS_KEY);
		return;
	}
	localStorage.setItem(MHS_KEY, JSON.stringify(val));
}

// ===== Store =====
export const useAuthStore = create<AuthStore>((set) => ({
	authUser: getStoredMhs(),
	isLoggingIn: false,
	isUpdatingProfile: false,
	isCheckingAuth: true,

	checkAuth: async (suppressToast = false) => {
		const token = localStorage.getItem(TOKEN_KEY);
		const stored = getStoredMhs();

		setAuthHeaderFromToken(token);

		if (stored) set({ authUser: stored });
		if (!stored) {
			set({ isCheckingAuth: false });
			return;
		}

		try {
			const res = await axiosInstance.get<ResponseProfile>(
				`/mahasiswa/profile/lihat-profile/${stored.id}`
			);

			const bodyCode = res?.data?.status_code;
			const messages = res?.data?.messages;

			// Body bilang unauthorized (walau HTTP 200)
			if (isApiUnauthorized(bodyCode)) {
				localStorage.removeItem(TOKEN_KEY);
				setStoredMhs(null);
				set({ authUser: null, isCheckingAuth: false });
				return; // stop
			}

			// Kalau bukan OK menurut body → jangan sentuh session
			if (!isApiOk(bodyCode, messages)) {
				set({ isCheckingAuth: false });
				return;
			}

			const profile = res?.data?.data; // bisa undefined/null
			if (!profile) {
				// success tanpa data: biarin state dari localStorage, selesai
				set({ isCheckingAuth: false });
				return;
			}

			// Update HANYA nama + email, defensif
			set((state) => {
				const prev = state.authUser ?? stored;
				const merged: UserLogin = {
					...prev,
					nama: profile?.nama ?? prev?.nama ?? "",
					email: profile?.email ?? prev?.email ?? ""
				};
				setStoredMhs(merged);
				return { authUser: merged };
			});

			if (!suppressToast) {
				const safeName = profile?.nama ?? stored?.nama ?? "there";
				toast.success(`Welcome back, ${safeName}`);
			}
		} catch (err: unknown) {
			if (
				axios.isAxiosError(err) &&
				(err.response?.status === 401 || err.response?.status === 403)
			) {
				localStorage.removeItem(TOKEN_KEY);
				setStoredMhs(null);
				set({ authUser: null, isCheckingAuth: false });
				return;
			}
			console.error("checkAuth error:", extractAxiosMessage(err));
		} finally {
			set({ isCheckingAuth: false });
		}
	},

	login: async (data: LoginData) => {
		set({ isLoggingIn: true });
		try {
			const formData = new FormData();
			formData.append("email", data.email);
			formData.append("password", data.password);

			const res = await axiosInstance.post<ResponseAuth>("/login", formData, {
				headers: { "Content-Type": "multipart/form-data" }
			});

			const bodyCode = res?.data?.status_code;
			const messages = res?.data?.messages;

			// Kalau body bilang unauthorized → lempar error biar masuk catch
			if (isApiUnauthorized(bodyCode)) {
				throw new Error(res?.data?.messages || "Unauthorized");
			}

			if (
				!isApiOk(bodyCode, messages) ||
				!res?.data?.data ||
				!res?.data?.token
			) {
				throw new Error(res?.data?.messages || "Login gagal");
			}

			const token = res.data.token;
			const mhs = res.data.data; // UserLogin

			localStorage.setItem(TOKEN_KEY, token);
			setStoredMhs(mhs);
			setAuthHeaderFromToken(token);

			set({ authUser: mhs });
			toast.success("Logged in successfully");
		} catch (err: unknown) {
			// Jangan simpan apa pun kalau gagal
			localStorage.removeItem(TOKEN_KEY);
			setStoredMhs(null);
			set({ authUser: null });
			toast.error(extractAxiosMessage(err) || "Login failed");
		} finally {
			set({ isLoggingIn: false });
		}
	},

	logout: async () => {
		const fakeLogoutPromise = new Promise((resolve) =>
			setTimeout(resolve, 1000)
		);

		toast.promise(fakeLogoutPromise, {
			loading: "Logging out...",
			success: "Logged out successfully",
			error: "Logout failed"
		});

		try {
			await fakeLogoutPromise;
		} finally {
			localStorage.removeItem(TOKEN_KEY);
			setStoredMhs(null);
			set({ authUser: null });
		}
	}
}));
