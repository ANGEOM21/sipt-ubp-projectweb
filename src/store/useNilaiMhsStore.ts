import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import type { NilaiMhs, ResponsePeriodeNilaiMhs } from "@/types";
import toast from "react-hot-toast";
import axios from "axios";

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
	isLoadingPeriode: boolean;
	periodeNilaiMhs: ResponsePeriodeNilaiMhs | null;
	NilaiMhs: NilaiMhs[] | null;

	getPeriode: (nim: string) => Promise<void>;
	getNilai: (data: NilaiData) => Promise<void>;
	getNilaiPrint: (
		data: NilaiData,
		typePrint: "transkrip" | "khs",
		openInNewTab?: boolean
	) => Promise<void>;
	resetNilai: () => void;
}

export const useNilaiMhsStore = create<NilaiMhsStore>((set) => ({
	isLoadingNilai: false,
	isLoadingPeriode: false,
	periodeNilaiMhs: null,
	NilaiMhs: null,

	getPeriode: async (nim) => {
		set({ isLoadingPeriode: true });
		try {
			const res = await axiosInstance.get<ResponsePeriodeNilaiMhs>(
				`/mahasiswa/nilai/periode-mahasiswa/${nim}`
			);
      
      if (res.data.status_code && res.data.status_code !== "200" && res.data.status_code !== "000") {
        console.error("Error during getPeriode:", res.data.messages || "Unknown error");
        toast.error(res.data.messages || "Terjadi kesalahan.");
        set({ isLoadingPeriode: false });
        set({ periodeNilaiMhs: null });
        return;
      }
			set({ isLoadingPeriode: false });
			set({ periodeNilaiMhs: res.data });
		} catch (error) {
			set({ isLoadingPeriode: false });
			console.error("Error during getPeriode:", error);
		}
	},

	getNilai: async (data) => {
	set({ isLoadingNilai: true });

	try {
		const payload = {
			nim: data.nim,
			periode: data.periode,
			jenis: data.jenis
		};

		// console.log("=== REQUEST NILAI ===");
		// console.log("Payload:", payload);

		const res = await axios.post(
			"https://api-gateway.ubpkarawang.ac.id/mahasiswa/nilai/show-report-nilai",
			payload,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: localStorage.getItem("token") 
				},
				timeout: 15000
			}
		);

		// console.log("=== RESPONSE NILAI ===");
		// console.log("Full Response:", res);
		// console.log("Response Data:", res.data);

		set({
			NilaiMhs: res.data?.nilai || [],
			isLoadingNilai: false
		});
	} catch (error: any) {
		// console.log("=== ERROR NILAI ===");

		if (error.response) {
			console.log("Status:", error.response.status);
			console.log("Data:", error.response.data);
		} else if (error.request) {
			console.log("No response received:", error.request);
		} else {
			console.log("Error message:", error.message);
		}

		set({ isLoadingNilai: false });
	}
},

	getNilaiPrint: async (data, typePrint, openInNewTab = false) => {
	const payload = {
		nim: data.nim,
		periode: data.periode,
		jenis: data.jenis
	};

	const url =
		typePrint === "transkrip"
			? "https://api-gateway.ubpkarawang.ac.id/mahasiswa/nilai/report-transkrip"
			: "https://api-gateway.ubpkarawang.ac.id/mahasiswa/nilai/report-khs";

	try {
		// console.log("=== REQUEST PRINT ===");
		// console.log("URL:", url);
		// console.log("Payload:", payload);

		const res = await axios.post(url, payload, {
			responseType: "blob",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/pdf",
				Authorization: localStorage.getItem("token") || ""
			},
			timeout: 20000
		});

		// console.log("=== RESPONSE PRINT ===");
		// console.log("Headers:", res.headers);
		// console.log("Blob Type:", res.data.type);

		// Kalau server ternyata kirim JSON error
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

	} catch (error: any) {
		console.log("=== ERROR PRINT ===");

		if (error.response) {
			console.log("Status:", error.response.status);
			console.log("Data:", error.response.data);
		} else if (error.request) {
			console.log("No response received:", error.request);
		} else {
			console.log("Error message:", error.message);
		}
	}
},

	resetNilai: () => set({ NilaiMhs: null, periodeNilaiMhs: null})
}));
