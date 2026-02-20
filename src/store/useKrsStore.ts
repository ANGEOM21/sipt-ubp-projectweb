import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

export interface MataKuliah {
  id_matkul: string;
  kode_matkul: string;
  nama_mata_kuliah: string;
  sks_mata_kuliah: string;
  semester: string;
  status_acc: string | null;
}

export interface KrsSelection {
  id_matkul: string;
  tipe: "ambil" | "ulang";
}

interface ResponseKrs {
  messages: string;
  status_code: string;
  data: MataKuliah[];
}

interface KrsStore {
  krsData: MataKuliah[];
  isLoading: boolean;
  isSubmitting: boolean;
  getKrsData: (nimPayload: string | null) => Promise<void>;
  ajukanKrs: (nim: string, selections: KrsSelection[]) => Promise<void>;
}

export const useKrsStore = create<KrsStore>((set, get) => ({
  krsData: [],
  isLoading: false,
  isSubmitting: false,

  getKrsData: async (nimPayload) => {
    set({ isLoading: true });
    const nim = resolveNim(nimPayload);

    if (!nim) {
      set({ krsData: [], isLoading: false });
      return;
    }

    try {
      const res = await axiosInstance.get<ResponseKrs>(`/mahasiswa/krs/tambah-krs/${nim}`);
      set({ krsData: res.data?.data || [] });
    } catch (err) {
      toast.error("Gagal memuat data KRS");
      console.error(err);
      set({ krsData: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  ajukanKrs: async (nim, selections) => {
    set({ isSubmitting: true });
    try {
      const formData = new FormData();
      formData.append("nim", nim);

      selections.forEach((item) => {
        if (item.tipe === "ambil") {
          formData.append("matakuliah", item.id_matkul);
        } else if (item.tipe === "ulang") {
          formData.append("ulang_matakuliah[]", item.id_matkul);
        }
      });

      const res = await axiosInstance.post("/mahasiswa/krs/submit-krs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.status_code === "000" || res.data.status_code === "200") {
        toast.success(res.data.messages || "KRS berhasil diajukan");
        await get().getKrsData(nim);
      } else {
        toast.error(res.data.messages || "Gagal mengajukan KRS");
      }
    } catch (e) {
      console.error(e);
      toast.error("Terjadi kesalahan sistem saat pengajuan");
    } finally {
      set({ isSubmitting: false });
    }
  },
}));

const resolveNim = (payload: string | null) => {
  let storedNim: string | null = null;
  try {
    const raw = localStorage.getItem("mhs");
    storedNim = raw ? (JSON.parse(raw)?.id ?? null) : null;
  } catch {}
  return (payload ?? storedNim)?.toString().trim() || null;
};