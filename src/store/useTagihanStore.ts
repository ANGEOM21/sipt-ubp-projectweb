import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

// ... (Interface TagihanOverview, TagihanDetail, TagihanData, ResponseTagihan SAMA SEPERTI SEBELUMNYA) ...
export interface TagihanOverview {
  nim: string;
  periode: string;
  last_payment: string | null;
  total_bayar: string;
  total_tagihan: string;
  sisa_tagihan: string;
  email: string;
  handphone: string;
  nama: string;
  kode_prodi: string;
  status_aktif: string;
}

export interface TagihanDetail {
  nim: string;
  periode: string;
  last_payment: string | null;
  total_bayar: string;
  total_tagihan: string;
  sisa_tagihan: string;
  cicilan: string;
}

interface TagihanData {
  tagih: {
    tagih_nim: TagihanOverview;
    detail_tagihan: TagihanDetail[];
  };
}

interface ResponseTagihan {
  messages: string;
  status_code: string;
  data: TagihanData;
}

// Interface Store
interface TagihanStore {
  tagihanData: TagihanData | null;
  isLoading: boolean;
  isCreatingVa: boolean; // State loading khusus buat bayar
  getTagihan: (nimPayload: string | null) => Promise<void>;
  createVaMdr: (payload: { nim: string; nominal: string; periode: string }) => Promise<void>;
  resetTagihan: () => void;
}

export const useTagihanStore = create<TagihanStore>((set) => ({
  tagihanData: null,
  isLoading: false,
  isCreatingVa: false,

  getTagihan: async (nimPayload: string | null) => {
    set({ isLoading: true });

    let storedNim: string | null = null;
    try {
      const raw = localStorage.getItem("mhs");
      storedNim = raw ? (JSON.parse(raw)?.id ?? null) : null;
    } catch { storedNim = null; }

    const nim = (nimPayload ?? storedNim)?.toString().trim() || null;
    
    if (!nim) {
      set({ tagihanData: null, isLoading: false });
      return;
    }

    try {
      const res = await axiosInstance.get<ResponseTagihan>(
        `/mahasiswa/administrasi/get-tagihan-bni/${nim}`
      );
      
      const responseData = res.data;
      if (responseData.status_code === '000' && responseData.data) {
        set({ tagihanData: responseData.data });
      } else if (responseData.status_code === '403') {
        set({ tagihanData: null });
      } else {
        set({ tagihanData: null });
        toast.error(responseData.messages || "Gagal memuat data.");
      }
    } catch (error: unknown) {
      console.error(error);
      set({ tagihanData: null });
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      set({ isLoading: false });
    }
  },

  // --- FUNGSI BARU: CREATE VA ---
  createVaMdr: async (payload) => {
    set({ isCreatingVa: true });
    try {
      // POST Request
      const res = await axiosInstance.post('/mahasiswa/administrasi/create-va-mdr', payload);
      
      console.log("👇 RESPONSE CREATE VA MDR 👇");
      console.log(res.data);
      console.log("----------------------------");

      // Cek response (sesuaikan logic ini dengan format response API nanti)
      if (res.data?.status_code === '000' || res.data?.messages === 'success') {
          toast.success("Virtual Account berhasil dibuat! Cek Console.");
      } else {
          toast(res.data?.messages || "Cek console untuk detail response.");
      }
      
    } catch (error) {
      console.error("Error createVaMdr:", error);
      toast.error("Gagal membuat permintaan pembayaran.");
    } finally {
      set({ isCreatingVa: false });
    }
  },

  resetTagihan: () => set({ tagihanData: null })
}));