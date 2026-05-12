import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { extractAxiosMessage } from "@/lib/utils";
import type { ResponseinfoAkademik } from "@/types";

interface HomeStore {
	infoAkademik: ResponseinfoAkademik | null;
	getInfoAkademik: () => Promise<void>;
}

export const useHomeStore = create<HomeStore>((set) => ({
	infoAkademik: null,
	getInfoAkademik: async () => {
		try {
			const res = await axiosInstance.get<ResponseinfoAkademik>("/apps/dashboard/info-akademik");
			set({ infoAkademik: res.data });
		} catch (error: unknown) {
			console.error("Error during getInfoAkademik:", extractAxiosMessage(error));
		}
	},
}));
