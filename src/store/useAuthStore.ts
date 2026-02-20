import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import type { ResponseProfile, UserLogin } from "@/types";
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
		
		if (!stored || !token) {
			set({ authUser: null, isCheckingAuth: false });
			return;
		}

		try {
			const res = await axiosInstance.get<ResponseProfile>(
				`/mahasiswa/profile/lihat-profile/${stored.id}`
			);

			const bodyCode = res?.data?.status_code;
			const messages = res?.data?.messages;

			if (isApiUnauthorized(bodyCode)) {
				localStorage.removeItem(TOKEN_KEY);
				setStoredMhs(null);
				set({ authUser: null, isCheckingAuth: false });
				return;
			}

			if (!isApiOk(bodyCode, messages)) {
				set({ isCheckingAuth: false });
				return;
			}

			const profile = res?.data?.data;
			if (!profile) {
				set({ isCheckingAuth: false });
				return;
			}

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
				const safeName = profile?.nama ?? stored?.nama ?? "User";
				toast.success(`Welcome back, ${safeName}`);
			}
		} catch (err: unknown) {
			if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
				localStorage.removeItem(TOKEN_KEY);
				setStoredMhs(null);
				set({ authUser: null });
			}
			console.error(extractAxiosMessage(err));
		} finally {
			set({ isCheckingAuth: false });
		}
	},

	login: async (data: { email: string; password: string }) => {
    set({ isLoggingIn: true });
    try {
         const res = await axiosInstance.post('/auth/login-bypass', {
        email: data.email,
        password: data.password
    	});

        const { token, data: userData } = res.data;

        localStorage.setItem(TOKEN_KEY, token);
        setStoredMhs(userData);
        setAuthHeaderFromToken(token);

        set({ authUser: userData });
        toast.success("Logged in successfully");
    } catch (err: any) {
        const msg = err.response?.data?.messages || "Login gagal";
        toast.error(msg);
    } finally {
        set({ isLoggingIn: false });
    }
},

	logout: async () => {
		const logoutPromise = new Promise((resolve) => setTimeout(resolve, 800));
		toast.promise(logoutPromise, {
			loading: "Logging out...",
			success: "Logged out successfully",
			error: "Logout failed"
		});

		try {
			await logoutPromise;
		} finally {
			localStorage.removeItem(TOKEN_KEY);
			setStoredMhs(null);
			set({ authUser: null });
			window.location.href = "/login";
		}
	}
}));