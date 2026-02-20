import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { extractAxiosMessage } from "@/lib/utils";
import toast from "react-hot-toast";

// Tipe data Mata Kuliah sesuai response JSON
export interface MataKuliah {
  id_matkul: string;
  kode_matkul: string;
  nama_mata_kuliah: string;
  semester: string;
  sks_mata_kuliah: string;
  status_acc: string | null; // null (Bisa diambil), "0" (Menunggu), "1" (Ditolak), "2" (Diterima)
  ambil_matkul_periode: string | null;
  jns_mk: string | null;
}

// Tipe data payload untuk pengajuan (ID + Tipe Ambil/Ulang)
export interface KrsSelection {
  id_matkul: string;
  tipe: "ambil" | "ulang"; // User harus memilih salah satu
}

interface KrsStore {
  krsData: MataKuliah[];
  isLoading: boolean;
  isSubmitting: boolean;

  getKrsData: (nim: string) => Promise<void>;
  ajukanKrs: (nim: string, selections: KrsSelection[]) => Promise<void>;
}

export const useKrsStore = create<KrsStore>((set, get) => ({
  krsData: [],
  isLoading: false,
  isSubmitting: false,

  getKrsData: async (nim: string) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/mahasiswa/krs/tambah-krs/${nim}`);
      // Pastikan data array
      set({ krsData: res.data?.data || [] });
    } catch (err) {
      toast.error("Gagal memuat data KRS");
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  ajukanKrs: async (nim, selections) => {
    if (selections.length === 0) {
      toast.error("Pilih minimal satu mata kuliah");
      return;
    }

    set({ isSubmitting: true });
    const toastId = toast.loading("Mengajukan KRS...");

    try {
      // Sesuaikan payload dengan kebutuhan backend
      const payload = {
        nim: nim,
        mata_kuliah: selections // Mengirim array object {id, tipe}
      };

      // GANTI URL INI SESUAI ENDPOINT POST BACKEND ANDA
      await axiosInstance.post("/mahasiswa/krs/ajukan-krs", payload);

      toast.success("KRS berhasil diajukan!", { id: toastId });
      
      // Refresh data setelah submit
      await get().getKrsData(nim);
      
    } catch (err: unknown) {
      const msg = extractAxiosMessage(err);
      toast.error(msg || "Gagal mengajukan KRS", { id: toastId });
    } finally {
      set({ isSubmitting: false });
    }
  },
}));