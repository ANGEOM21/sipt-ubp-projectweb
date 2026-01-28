import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

export interface KurikulumItem {
  id: string;
  kode_matkul: string;        
  nama_mata_kuliah: string;   
  sks_mata_kuliah: string;    
  semester: string;
  status_wajib: string;         
  nama_kurikulum?: string;
}
interface KurikulumDataWrapper {
  daftar_matkul: KurikulumItem[];
}

interface ResponseKurikulum {
  messages: string;
  status_code: string;
  data: KurikulumDataWrapper; 
}

interface KurikulumStore {
  kurikulumData: KurikulumDataWrapper | null;
  isLoading: boolean;
  getKurikulum: (nimPayload: string | null) => Promise<void>;
  resetKurikulum: () => void;
}

export const useKurikulumStore = create<KurikulumStore>((set) => ({
  kurikulumData: null,
  isLoading: false,

  getKurikulum: async (nimPayload: string | null) => {
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
      set({ kurikulumData: null, isLoading: false });
      return;
    }

    try {
      const res = await axiosInstance.get<ResponseKurikulum>(
        `/mahasiswa/kurikulum/matakuliah-kurikulum/${nim}`
      );
      
      const responseData = res.data;

      if (
        responseData.status_code === '000' && 
        responseData.data && 
        Array.isArray(responseData.data.daftar_matkul)
      ) {
        set({ kurikulumData: responseData.data });
      } 
      else if (responseData.status_code === '403' || responseData.messages?.includes("expired")) {
        set({ kurikulumData: null });
      } else {
        console.warn("Format response tidak sesuai:", responseData);
        set({ kurikulumData: null });
        toast.error(responseData.messages || "Gagal memuat data kurikulum.");
      }

    } catch (error: unknown) {
      console.error("Error getKurikulum:", error);
      set({ kurikulumData: null });
      toast.error("Terjadi kesalahan saat mengambil data.");
    } finally {
      set({ isLoading: false });
    }
  },

  resetKurikulum: () => set({ kurikulumData: null })
}));