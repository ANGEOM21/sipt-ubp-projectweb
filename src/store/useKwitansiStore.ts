import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

export interface KwitansiItem {
  id_trx: string;
  tanggal: string;
  kwitansi: string;
  jlminput: string; // Nominal bayar
  periode: string;
  status: string;
  nama_ukt: string;
  tanggal_fmt: string;
}

interface ResponseKwitansi {
  messages: string;
  status_code: string;
  data: KwitansiItem[];
}

interface KwitansiStore {
  kwitansiList: KwitansiItem[] | null;
  isLoadingKwitansi: boolean;
  getKwitansi: (nimPayload: string | null) => Promise<void>;
}

export const useKwitansiStore = create<KwitansiStore>((set) => ({
  kwitansiList: null,
  isLoadingKwitansi: false,

  getKwitansi: async (nimPayload: string | null) => {
    set({ isLoadingKwitansi: true });

    let storedNim: string | null = null;
    try {
      const raw = localStorage.getItem("mhs");
      storedNim = raw ? (JSON.parse(raw)?.id ?? null) : null;
    } catch { storedNim = null; }

    const nim = (nimPayload ?? storedNim)?.toString().trim() || null;
    
    if (!nim) {
      set({ kwitansiList: null, isLoadingKwitansi: false });
      return;
    }

    try {
      const res = await axiosInstance.get<ResponseKwitansi>(
        `/mahasiswa/administrasi/get_list_kwitansi/${nim}`
      );
      
      if (res.data.status_code === '000' && Array.isArray(res.data.data)) {
        // Sort dari terbaru ke terlama
        const sorted = res.data.data.sort((a, b) => 
            new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
        );
        set({ kwitansiList: sorted });
      } else {
        set({ kwitansiList: [] });
      }
    } catch (error) {
      console.error(error);
      set({ kwitansiList: null });
      toast.error("Gagal memuat riwayat kwitansi.");
    } finally {
      set({ isLoadingKwitansi: false });
    }
  }
}));