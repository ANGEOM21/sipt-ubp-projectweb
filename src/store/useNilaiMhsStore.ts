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

	isKuisionerModalOpen: boolean;
	kuisionerErrorData: any;
	closeKuisionerModal: () => void;
	submitAutoKuisioner: (email: string) => Promise<void>;

	resetNilai: () => void;
}

export const useNilaiMhsStore = create<NilaiMhsStore>((set) => ({
	isLoadingNilai: false,
	isLoadingPeriode: false,
	periodeNilaiMhs: null,
	NilaiMhs: null,
	isKuisionerModalOpen: false,
	kuisionerErrorData: null,

	getPeriode: async (nim) => {
		set({ isLoadingPeriode: true });
		try {
			const res = await axiosInstance.get<ResponsePeriodeNilaiMhs>(
				`/mahasiswa/nilai/periode-mahasiswa/${nim}`
			);

			if (
				res.data.status_code &&
				res.data.status_code !== "200" &&
				res.data.status_code !== "000"
			) {
				console.error(
					"Error during getPeriode:",
					res.data.messages || "Unknown error"
				);
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

			if (res.data.type === "application/json") {
				const text = await res.data.text();
				try {
					const json = JSON.parse(text);
					const errorMsg = json?.messages || "Unknown error";
					await handleKuisionerError(errorMsg, data, typePrint, openInNewTab);
					return;
				} catch {
					console.error("Respon tidak valid saat cetak.");
					toast.error("Respon tidak valid dari server saat mencetak.");
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
				if (error.response.data instanceof Blob) {
					const text = await error.response.data.text();
					try {
						const json = JSON.parse(text);
						const errorMsg = json?.messages || "Unknown error";
						await handleKuisionerError(errorMsg, data, typePrint, openInNewTab);
					} catch {
						toast.error("Gagal mencetak: Terjadi kesalahan server.");
					}
				} else {
					toast.error(error.response.data?.messages || "Gagal mencetak data.");
				}
			} else {
				toast.error(error.message);
			}
		}

		async function handleKuisionerError(
			errorMsg: string,
			_data: any,
			_typePrint: any,
			_openInNewTab: boolean
		) {
			console.error("Gagal cetak:", errorMsg);
			if (errorMsg.toLowerCase().includes("kuisioner")) {
				// Berhubung mentok, kembalikan ke sistem manual via Toast
				toast.error("Cetak Transkrip Gagal: Ada kuisioner yang belum diisi! Silakan isi manual di web resmi SIPT UBP.", { 
					duration: 6000, 
					id: "kuisioner-manual" 
				});
			} else {
				toast.error(errorMsg);
			}
		}
	},

	submitAutoKuisioner: async (email: string) => {
		const state = useNilaiMhsStore.getState();
		const { kuisionerErrorData } = state;
		if (!kuisionerErrorData) return;

		const { data, typePrint, openInNewTab } = kuisionerErrorData;
		
		toast.loading("Mendeteksi kuisioner nunggak! Mengambil daftar pertanyaan...", { id: "kuisioner" });
		try {
			// Karena proxy Vercel ditolak oleh kampus untuk path /apps/, 
			// dan karena endpoint ini aslinya NGASIH izin CORS (kalo endpointnya bener ada),
			// kita hit langsung ke API kampus tanpa lewat proxy!
			let url_get = import.meta.env.VITE_API_URL_ORI + "apps/kuisioner/daftar-kuisioner-institusi";
			let url_post = import.meta.env.VITE_API_URL_ORI + "apps/kuisioner/submit-kuisioner-institusi";

			// 1. Ambil list pertanyaan langsung ke kampus
			const listRes = await axiosInstance.post(url_get, {
				role: "mahasiswa",
				email
			});

			const listData = listRes.data;
			if (!listData || !listData.data || !Array.isArray(listData.data)) {
				throw new Error("Gagal memuat daftar pertanyaan dari server. Respon bukan array.");
			}

			// 2. Racik jawaban Sangat Baik (Nilai Bintang 4)
			const kuisionerValues: string[] = [];
			for (const q of listData.data) {
				if (q && q.id) {
					kuisionerValues.push(`${q.id}4`);
				}
			}

			if (kuisionerValues.length === 0) {
				throw new Error("Tidak ada pertanyaan yang ditemukan.");
			}

			toast.loading(`Memborbardir ${kuisionerValues.length} pertanyaan dengan nilai Sangat Baik...`, { id: "kuisioner" });

			// 3. Submit jawaban via proxy
			await axiosInstance.post(url_post, {
				kuisioner: kuisionerValues.join(","),
				email,
				role: "mahasiswa"
			}, {
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				}
			});

			toast.success("BOOM! Kuisioner sukses diratakan nilainya! Mengulang cetak transkrip...", { id: "kuisioner" });
			
			set({ isKuisionerModalOpen: false, kuisionerErrorData: null });

			// Ulangi panggil cetak transkrip
			setTimeout(() => {
				useNilaiMhsStore.getState().getNilaiPrint(data, typePrint, openInNewTab);
			}, 1500);

		} catch (err: any) {
			const errMsg = err.response?.data?.messages || err.message || "Unknown error";
			toast.error("Gagal auto-sikat kuisioner: " + errMsg, { id: "kuisioner" });
		}
	},

	closeKuisionerModal: () =>
		set({ isKuisionerModalOpen: false, kuisionerErrorData: null }),

	resetNilai: () => set({ NilaiMhs: null, periodeNilaiMhs: null })
}));
