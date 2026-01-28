export interface ResponseAuth {
	messages: string;
	status_code: string | number;
	token: string;
	data: UserLogin;
}

export interface ResponseProfile {
	messages: string;
	status_code: string | number;
	data: User;
}

export interface User {
	telepon_ibu: string | null;
	telepon_ayah: string | null;
	file_ijazah: string | null;
	path_ijazah: string | null;
	nim: string | number;
	email: string | null;
	nama: string | null;
	pas_photo: string | null;
	gender: string | null;
	jenis_daftar: string | null;
	jalur_masuk: string | null;
	alamat: string | null;
	kelurahan: string | null;
	kode_pos: string | null;
	nisn: string | null;
	nik: string | null;
	tempat_lahir: string | null;
	tanggal_lahir: string | null;
	tanggal_lahir_edit: string | null;
	nama_ayah: string | null;
	tanggal_lahir_ayah: string | null;
	tanggal_lahir_ayah_edit: string | null;
	tanggal_lahir_ibu_edit: string | null;
	nik_ayah: string | null;
	jenjang_pendidikan_ayah: string | null;
	pekerjaan_ayah: string | null;
	nama_ibu: string | null;
	tanggal_lahir_ibu: string | null;
	nik_ibu: string | null;
	jenjang_pendidikan_ibu: string | null;
	pekerjaan_ibu: string | null;
	prodi: string | null;
	tahun_masuk: string | null;
	agama: string | null;
	id_agama: string | null;
	kecamatan: string | null;
	kabupaten_kota: string | null;
	id_jenjang_didik_ayah: string | null;
	nama_jenjang_didik_ayah: string | null;
	id_jenis_tinggal: string | null;
	nama_jenis_tinggal: string | null;
	id_jenjang_didik_ibu: string | null;
	nama_jenjang_didik_ibu: string | null;
	provinsi: string | null;
	nama_wali: string | null;
	tanggal_lahir_wali: string | null;
	jenjang_pendidikan_wali: string | null;
	pekerjaan_wali: string | null;
	telepon: string | null;
	handphone: string | null;
	email_wali: string | null;
	penerima_kps: string | null;
	nomor_kps: string | null;
	npwp: string | null;
	jenis_tinggal: string | null;
	dosen_wali: string | null;
	korprodi: string | null;
	kelas: string | null;
	email_dosen_wali: string | null;
	telepon_dosen_wali: string | null;
	status_bekerja: string | null;
	status_aktif: string | null;
	id_elearning: string | null;
	messages_elearning: string | null;
	id_pekerjaan_ayah: string | null;
	id_pekerjaan_ibu: string | null;
	nama_pekerjaan_ayah: string | null;
	nama_pekerjaan_ibu: string | null;
	id_penghasilan_ayah: string | null;
	nama_penghasilan_ayah: string | null;
	id_penghasilan_ibu: string | null;
	nama_penghasilan_ibu: string | null;
	info_feeder: string | null;
	updated_profil: string | null;
}

export interface UserLogin {
	id: string | number;
	role: string;
	nama: string;
	email: string;
	prodi: string | null;
	employee: null;
	user_access: null;
	current_period: string | null;
	vaksin: boolean | null;
}

export interface BannerResponse {
	messages: string;
	status_code: string | number;
	data: string | null;
}

export interface ResponseinfoAkademik {
	messages: string;
	status_code: string | number;
	data: DataInfoAkademik[];
}

export interface DataInfoAkademik {
	id: string | number;
	file_name: string;
	file_path: string;
	created_at: string;
}

export interface ResponsePeriodeNilaiMhs {
	messages: string;
	status_code: string | number;
	data: {
		periode: string;
	}[];
}

export interface ResponseNilaiMhs {
	messages: string;
	nilai: NilaiMhs[];
}

export interface NilaiMhs {
	id: string | number;
	kuisioner: string;
	Kode: string;
	Matakuliah: string;
	English: string;
	Semester: string;
	SKS: number;
	Periode: string;
	Absensi: number;
	Tugas: number;
	UTS: number;
	UAS: number;
	Praktikum: string | null | number;
	Total: number;
	Grade: string;
	Nilai: number;
	Kumulatif: number;
}
