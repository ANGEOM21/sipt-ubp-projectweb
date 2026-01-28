import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

export interface AktivitasItem {
  periode: string;          
  ips: string;              
  sks_semester: string;     
  sks_keseluruhan: string;  
  ipk: string;              
}

interface ResponseAktivitas {
  messages: string;
  status_code: string;
  data: AktivitasItem[];
}

interface AktivitasStore {
  aktivitasData: AktivitasItem[] | null; 
  isLoading: boolean;
  getAktivitas: (nimPayload: string | null) => Promise<void>;
  resetAktivitas: () => void;
}

export const useAktivitasStore = create<AktivitasStore>((set) => ({
  aktivitasData: null,
  isLoading: false,

  getAktivitas: async (nimPayload: string | null) => {
    set({ isLoading: true });

    let storedNim: string | null = null;
    try {
      const raw = localStorage.getItem("mhs");
      storedNim = raw ? (JSON.parse(raw)?.id ?? null) : null;
    } catch {
      storedNim = null;
    }

    const nim = (nimPayload ?? storedNim)?.toString().trim() || null;
    
    if (!nim) {
      set({ aktivitasData: null, isLoading: false });
      return;
    }

    try {
      const res = await axiosInstance.get<ResponseAktivitas>(
        `/mahasiswa/aktivitas/aktivitas-perkuliahan/${nim}`
      );
      
      const responseData = res.data;

      if (responseData.status_code === '000' && Array.isArray(responseData.data)) {
        const sortedData = [...responseData.data].sort((a, b) => Number(b.periode) - Number(a.periode));
        set({ aktivitasData: sortedData });
      } 
      else if (responseData.status_code === '403' || responseData.messages?.includes("expired")) {
        set({ aktivitasData: null });
      } else {
        set({ aktivitasData: null });
        toast.error(responseData.messages || "Gagal memuat data aktivitas.");
      }

    } catch (error: unknown) {
      console.error("Error getAktivitas:", error);
      set({ aktivitasData: null });
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      set({ isLoading: false });
    }
  },

  resetAktivitas: () => set({ aktivitasData: null })
}));