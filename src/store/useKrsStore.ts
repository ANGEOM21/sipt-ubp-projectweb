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
			const res = await axiosInstance.get<ResponseKrs>(
				`/mahasiswa/krs/tambah-krs/${nim}`
			);
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
			const requests = selections.map((item) => {
				const formData = new FormData();
				formData.append("nim", nim);

				if (item.tipe === "ambil") {
					formData.append("matakuliah", item.id_matkul);
				} else {
					formData.append("ulang_matakuliah", item.id_matkul);
				}

				return axiosInstance.post("/mahasiswa/krs/submit-krs", formData, {
					headers: {
						"Content-Type": "multipart/form-data"
					}
				});
			});

			const results = await Promise.allSettled(requests);

			const success = results.filter((r) => r.status === "fulfilled");
			const failed = results.filter((r) => r.status === "rejected");

			if (success.length > 0) {
				toast.success(`${success.length} matkul berhasil diajukan`);
			}

			if (failed.length > 0) {
				toast.error(`${failed.length} matkul gagal diajukan`);
			}

			await get().getKrsData(nim);
		} catch (err) {
			console.error(err);
			toast.error("Terjadi kesalahan sistem");
		} finally {
			set({ isSubmitting: false });
		}
	}
}));

const resolveNim = (payload: string | null) => {
	let storedNim: string | null = null;
	try {
		const raw = localStorage.getItem("mhs");
		storedNim = raw ? JSON.parse(raw)?.id ?? null : null;
	} catch {}
	return (payload ?? storedNim)?.toString().trim() || null;
};
