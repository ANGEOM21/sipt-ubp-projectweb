import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import type { ResponseinfoAkademik } from "@/types";

interface HomeStore {
	infoAkademik: ResponseinfoAkademik | null,
	getInfoAkademik: () => void
}

export const useHomeStore = create<HomeStore>((set) => ({
	infoAkademik: null,
	getInfoAkademik: async () => {
		try {
			const res = await axiosInstance.get<ResponseinfoAkademik>("/apps/dashboard/info-akademik");
			set({ infoAkademik: res.data });
		} catch (error: unknown) {
			if (error instanceof Error) console.error("Error during getInfoAkademik:", error);
		}
	},

}));
