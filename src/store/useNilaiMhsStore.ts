import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import type { NilaiMhs, ResponsePeriodeNilaiMhs } from "@/types";

/* helpers kecil */
function getFilenameFromDisposition(dispo?: string, fallback = "file.pdf") {
  if (!dispo) return fallback;
  const m = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(dispo);
  const raw = decodeURIComponent((m?.[1] || m?.[2] || "").trim());
  return raw || fallback;
}
function saveBlob(blob: Blob, filename: string, openInNewTab = false) {
  const url = URL.createObjectURL(blob);
  if (openInNewTab) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  URL.revokeObjectURL(url);
}

interface NilaiData {
  nim: string;
  jenis: string;
  periode: string;
}

interface NilaiMhsStore {
  isLoadingNilai: boolean;
  periodeNilaiMhs: ResponsePeriodeNilaiMhs | null;
  NilaiMhs: NilaiMhs[] | null;

  getPeriode: (nim: string) => Promise<void>;
  getNilai: (data: NilaiData) => Promise<void>;
  getNilaiPrint: (
    data: NilaiData,
    typePrint: "transkrip" | "khs",
    openInNewTab?: boolean
  ) => Promise<void>;
}

export const useNilaiMhsStore = create<NilaiMhsStore>((set) => ({
  isLoadingNilai: false,
  periodeNilaiMhs: null,
  NilaiMhs: null,

  getPeriode: async (nim) => {
    try {
      const res = await axiosInstance.get<ResponsePeriodeNilaiMhs>(
        `/mahasiswa/nilai/periode-mahasiswa/${nim}`
      );
      set({ periodeNilaiMhs: res.data });
    } catch (error) {
      console.error("Error during getPeriode:", error);
    }
  },

  getNilai: async (data) => {
    set({ isLoadingNilai: true });
    try {
      const payload = {
        nim: data.nim,
        periode: data.periode,
        jenis: data.jenis,
      };
      const res = await axiosInstance.post(
        "/mahasiswa/nilai/show-report-nilai",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      set({ NilaiMhs: res.data.nilai, isLoadingNilai: false });
    } catch (error) {
      console.error("Error during getNilai:", error);
      set({ isLoadingNilai: false });
    }
  },

  getNilaiPrint: async (data, typePrint, openInNewTab = false) => {
    const payload = { nim: data.nim, periode: data.periode, jenis: data.jenis };
    const url =
      typePrint === "transkrip"
        ? "/mahasiswa/nilai/report-transkrip"
        : "/mahasiswa/nilai/report-khs";

    try {
      const res = await axiosInstance.post<Blob>(url, payload, {
        responseType: "blob",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/pdf",
        },
      });

      // Kadang server balikin JSON (status_code: 401/403) meski kita minta blob
      if (res.data.type === "application/json") {
        const text = await res.data.text();
        try {
          const json = JSON.parse(text);
          console.error("Gagal cetak:", json?.messages || "Unknown error");
          return;
        } catch {
          console.error("Respon tidak valid saat cetak.");
          return;
        }
      }

      const dispo =
        (res.headers as Record<string, string>)["content-disposition"] ??
        (res.headers as Record<string, string>)["Content-Disposition"];
      const fallback = `${typePrint}-${data.nim}-${data.periode}.pdf`;
      const filename = getFilenameFromDisposition(
        typeof dispo === "string" ? dispo : undefined,
        fallback
      );

      saveBlob(res.data, filename, openInNewTab);
    } catch (error) {
      console.error("Error during getNilaiPrint:", error);
    }
  },
}));
