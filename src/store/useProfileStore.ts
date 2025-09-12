import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import type { ResponseProfile } from "@/types";

interface ProfileStore {
  infoUser: ResponseProfile | null;
  getInfoUser: (nimPayload: string | null) => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  infoUser: null,

  getInfoUser: async (nimPayload: string | null) => {
    // Ambil dari localStorage kalau payload null
    let storedNim: string | null = null;
    try {
      const raw = localStorage.getItem("mhs");
      storedNim = raw ? (JSON.parse(raw)?.id ?? null) : null;
    } catch {
      storedNim = null;
    }

    const nim = (nimPayload ?? storedNim)?.toString().trim()  || null;
    if (!nim) {
      set({ infoUser: null });
      return;
    }

    try {
      const res = await axiosInstance.get<ResponseProfile>(
        `/mahasiswa/profile/lihat-profile/${nim}`
      );
      set({ infoUser: res.data });
    } catch (error: unknown) {
      console.error("Error during getInfoUser:", error);
      set({ infoUser: null });
    }
  },
}));
