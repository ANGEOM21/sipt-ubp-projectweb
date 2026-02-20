import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { extractAxiosMessage } from "@/lib/utils";
import toast from "react-hot-toast";
import axios from "axios";

export interface PerwalianItem {
  id: string | null;
  periode: string; 
  konten_perwalian: string | null;
  dosen_wali: string | null;
  krs_file_path: string | null;
  khs_file_path: string | null;
  krs_upload_status: string | null;
  khs_upload_status: string | null;
}

interface PerwalianStore {
  perwalianData: PerwalianItem[];
  isLoading: boolean;
  isUploading: boolean; 
  
  getPerwalian: (nim: string) => Promise<void>;
  uploadFile: (nim: string, periode: string, type: "krs" | "khs", file: File) => Promise<void>;
}

export const usePerwalianStore = create<PerwalianStore>((set, get) => ({
  perwalianData: [],
  isLoading: false,
  isUploading: false,

  getPerwalian: async (nim: string) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/mahasiswa/perwalian/periode-perwalian/${nim}`);
      set({ perwalianData: res.data?.data || [] });
    } catch (err) {
      toast.error("Gagal memuat data perwalian");
    } finally {
      set({ isLoading: false });
    }
  },

  uploadFile: async (nim, periode, type, file) => {
    set({ isUploading: true });
    const label = type.toUpperCase();
    const toastId = toast.loading(`Mengupload ${label}...`);

    try {
      const endpoint = type === "krs" 
        ? "/mahasiswa/perwalian/upload-krs" 
        : "/mahasiswa/perwalian/upload-khs";

      const formData = new FormData();
      formData.append("file", file);      
      formData.append("periode", periode);
      formData.append("nim", nim);
      formData.append("jenis", type); 

      await axiosInstance.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`Berhasil upload ${label}`, { id: toastId });
      
      await get().getPerwalian(nim);
      
    } catch (err) {
      let message = "";
      
      if (axios.isAxiosError(err) && err.response?.data?.messages) {
        message = err.response.data.messages;
      } else {
        message = extractAxiosMessage(err) || `Gagal upload ${label}`;
      }

      toast.error(message, { id: toastId });
    } finally {
      set({ isUploading: false });
    }
  },
}));