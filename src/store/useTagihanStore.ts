import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

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

export interface TunggakanOverview {
  nim: string;
  periode: string;
  create_date: string;
  total_tunggakan: string;
  total_bayar: number | string;
  sisa_tunggakan: number | string;
}

export interface ActiveVaData {
  trx_id: string;
  virtual_account: string;
  trx_amount: string;
  customer_name: string;
  datetime_expired: string;
  description: string;
  status: string;
  channel: string;
  update_info?: string;
  nim?: string;
  customer_email?: string;
  customer_phone?: string;
}

interface TagihanData {
  tagih: {
    tagih_nim: TagihanOverview;
    detail_tagihan: TagihanDetail[];
  };
}

interface TunggakanData {
  tunggak: {
    tunggak_nim: TunggakanOverview;
    detail_tunggak: any[]; 
  };
}

interface ResponseTagihan {
  messages: string;
  status_code: string;
  data: TagihanData;
}

interface ResponseTunggakan {
  messages: string;
  status_code: string;
  data: TunggakanData;
}

interface ResponseCekVa {
  messages: string;
  status_code: string;
  data: ActiveVaData;
}


interface TagihanStore {
  // State Data
  tagihanData: TagihanData | null;
  tunggakanData: TunggakanData | null;
  activeVa: ActiveVaData | null;
  
  isLoading: boolean;
  isCreatingVa: boolean;
  
  getTagihan: (nimPayload: string | null) => Promise<void>;
  getTunggakan: (nimPayload: string | null) => Promise<void>;
  cekVa: (nimPayload: string | null) => Promise<void>;
  createVaMdr: (payload: { nim: string; nominal: string; periode: string }) => Promise<void>;
  resetTagihan: () => void;
}


export const useTagihanStore = create<TagihanStore>((set, get) => ({
  tagihanData: null,
  tunggakanData: null,
  activeVa: null,
  isLoading: false,
  isCreatingVa: false,

  getTagihan: async (nimPayload) => {
    set({ isLoading: true });
    const nim = resolveNim(nimPayload);
    
    if (!nim) { 
      set({ tagihanData: null, isLoading: false }); 
      return; 
    }

    try {
      const res = await axiosInstance.get<ResponseTagihan>(`/mahasiswa/administrasi/get-tagihan-bni/${nim}`);
      
      if (res.data.status_code === '000' && res.data.data) {
        set({ tagihanData: res.data.data });
      } else {
        set({ tagihanData: null });
      }
    } catch (e) { 
      console.error(e); 
      set({ tagihanData: null }); 
    } finally { 
      set({ isLoading: false }); 
    }
  },

  getTunggakan: async (nimPayload) => {
      const nim = resolveNim(nimPayload);
      if (!nim) return;

      try {
          const res = await axiosInstance.get<ResponseTunggakan>(`/mahasiswa/administrasi/get-tunggakan-bni/${nim}`);
          if (res.data.status_code === '000' && res.data.data) {
              set({ tunggakanData: res.data.data });
          } else {
              set({ tunggakanData: null });
          }
      } catch (e) { 
          console.error(e); 
          set({ tunggakanData: null }); 
      }
  },

  cekVa: async (nimPayload) => {
      const nim = resolveNim(nimPayload);
      if (!nim) return;

      try {
          const res = await axiosInstance.get<ResponseCekVa>(`/mahasiswa/administrasi/cek-va-bni/${nim}`);
          if (res.data.status_code === '000' && res.data.data) {
              set({ activeVa: res.data.data });
          } else {
              set({ activeVa: null });
          }
      } catch (e) { 
          console.error(e); 
          set({ activeVa: null }); 
      }
  },

  createVaMdr: async (payload) => {
    set({ isCreatingVa: true });
    try {
      const formData = new FormData();
      formData.append('nim', payload.nim);
      formData.append('periode', payload.periode);
      formData.append('total_bayar', payload.nominal); 

      const res = await axiosInstance.post('/mahasiswa/administrasi/create-va-mdr', formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
      });
      
      if (
          res.data?.status_code === '000' || 
          res.data?.status_code === '200' || 
          res.data?.messages?.toLowerCase().includes('success') ||
          res.data?.messages?.includes('Va') 
      ) {
          toast.success("Virtual Account berhasil dibuat! Memuat ulang...");
          
          get().cekVa(payload.nim);

          setTimeout(() => {
            window.location.reload();
          }, 1500);

      } else {
          toast.error(res.data?.messages || "Gagal membuat VA.");
      }
    } catch (error) {
      console.error("Error createVaMdr:", error);
      toast.error("Gagal membuat permintaan pembayaran.");
    } finally {
      set({ isCreatingVa: false });
    }
  },

  resetTagihan: () => set({ tagihanData: null, tunggakanData: null, activeVa: null })
}));

const resolveNim = (payload: string | null) => {
    let storedNim: string | null = null;
    try {
        const raw = localStorage.getItem("mhs");
        storedNim = raw ? (JSON.parse(raw)?.id ?? null) : null;
    } catch { }
    return (payload ?? storedNim)?.toString().trim() || null;
};