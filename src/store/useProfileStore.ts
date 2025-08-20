import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import type { ResponseProfile } from "@/types";

interface ProfileStore {
	infoUser: ResponseProfile | null,
	getInfoUser: () => void
}

export const useProfileStore = create<ProfileStore>((set) => ({
	infoUser: null,
	getInfoUser: async () => {
		const mhs = localStorage.getItem("mhs");
		const nim = mhs ? JSON.parse(mhs).id : null;
		try {
			const res = await axiosInstance.get<ResponseProfile>(`/mahasiswa/profile/lihat-profile/${nim}`);
			set({ infoUser: res.data });
		} catch (error: unknown) {
			if (error instanceof Error) console.error("Error during getInfoUser:", error);
		}
	},

}));
