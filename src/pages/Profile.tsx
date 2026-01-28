import Topbar from "@/components/Topbar";
import { useProfileStore } from "@/store/useProfileStore";
import React, { useEffect, useMemo, useState } from "react";
import {
	FiUser, FiHome, FiUsers, FiBook, FiBriefcase,
	FiDollarSign, FiMail, FiPhone, FiCalendar,
	FiMapPin, FiAward, FiEdit, FiDownload,
	FiInfo, FiCopy, FiCheckCircle, FiShield
} from "react-icons/fi";
import { BiUser } from "react-icons/bi";
import toast from "react-hot-toast";

const MASTER_NIM = ["22416255201247", "22416255201162"];

const Profile = () => {
	const { infoUser, getInfoUser } = useProfileStore();
	const [activeTab, setActiveTab] = useState('personal');
	const [nimOverride, setNimOverride] = useState("");

	const [imgError, setImgError] = useState(false);

	// --- Logic Cek NIM ---
	const storedNim = useMemo(() => {
		try {
			const raw = localStorage.getItem("mhs");
			return raw ? (JSON.parse(raw)?.id?.toString() ?? null) : null;
		} catch {
			return null;
		}
	}, []);

	const isMaster = MASTER_NIM.includes(storedNim ?? "");

	useEffect(() => {
		getInfoUser(null);
	}, [getInfoUser]);

	const handleSubmitOverride = (e: React.FormEvent) => {
		e.preventDefault();
		const clean = nimOverride.trim();
		if (!/^\d{8,18}$/.test(clean)) {
			toast.error("Masukkan NIM angka 8–18 digit.");
			return;
		}
		getInfoUser(clean);
		setActiveTab("personal");
		toast.success(`Memuat profil NIM ${clean}…`);
	};

	const tabs = [
		{ id: 'personal', label: 'Pribadi', icon: FiUser },
		{ id: 'address', label: 'Alamat', icon: FiHome },
		{ id: 'parents', label: 'Orang Tua', icon: FiUsers },
		{ id: 'education', label: 'Pendidikan', icon: FiBook },
		{ id: 'academic', label: 'Akademik', icon: FiAward },
	];

	// Helper Formatter
	const formatDate = (dateString: string | null | undefined) => {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('id-ID', {
			year: 'numeric', month: 'long', day: 'numeric'
		});
	};

	const downloadIjazah = () => {
		if (infoUser?.data?.path_ijazah) {
			window.open(infoUser.data.path_ijazah, '_blank');
		}
	};

	const profileUrl = useMemo(() => {
		const photo = infoUser?.data?.pas_photo;
		if (photo && photo !== import.meta.env.VITE_API_URL_ORI) {
			return `${import.meta.env.VITE_API_URL}/pas_photo/${photo.split("/").pop()}`;
		}
		return null;
	}, [infoUser?.data?.pas_photo]);

	useEffect(() => {
		setImgError(false);
	}, [profileUrl]);

	return (
		<div className="min-h-screen bg-slate-50 font-sans text-slate-800">
			<Topbar />


			<div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 mt-8 relative z-10">

				{/* --- Main Profile Card --- */}
				<div className="card bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
					<div className="card-body p-0">
						{/* Header Content */}
						<div className="flex flex-col md:flex-row gap-6 p-6 sm:p-8 items-center md:items-start border-b border-slate-100 bg-white">

							{/* Avatar Box */}
							<div className="relative group">
								<div className="w-32 h-32 rounded-2xl ring-4 ring-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center relative">
									{profileUrl && !imgError ? (
										<img
											src={profileUrl}
											alt="Profile"
											className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
											onError={() => setImgError(true)} // Set error jadi true jika gambar gagal load
										/>
									) : (
										// Tampilan Fallback (Icon)
										<div className="flex flex-col items-center justify-center text-blue-300">
											<BiUser className="text-6xl" />
										</div>
									)}
									{/* Fallback jika gambar error (via css class fallback-active manual handler jika perlu, atau render conditional di atas sudah cukup) */}
									{!profileUrl && (
										<div className="absolute inset-0 flex items-center justify-center bg-blue-50 text-black">
											<BiUser className="text-6xl" />
										</div>
									)}
								</div>
								{/* Status Badge Absolute */}
								<div className="absolute -bottom-2 -right-2">
									<span className={`badge ${infoUser?.data?.status_aktif === 'Aktif' ? 'badge-success' : 'badge-warning'} shadow-md gap-1 py-3 px-3 border-2 border-white`}>
										{infoUser?.data?.status_aktif || 'N/A'}
									</span>
								</div>
							</div>

							{/* User Identity */}
							<div className="text-center md:text-left flex-1 space-y-2">
								<div>
									<h1 className="text-3xl font-bold text-slate-800 tracking-tight">
										{infoUser?.data?.nama || 'Memuat Data...'}
									</h1>
									<p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
										<span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-blue-600">
											{infoUser?.data?.nim}
										</span>
										<span className="text-slate-300">|</span>
										<span>{infoUser?.data?.prodi}</span>
									</p>
								</div>

								<div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
									<div className="badge badge-ghost gap-2 py-3 pl-2 pr-3 text-slate-600 bg-slate-100 border-none">
										<FiUsers className="text-blue-500" />
										Kelas {infoUser?.data?.kelas}
									</div>
									<div className="badge badge-ghost gap-2 py-3 pl-2 pr-3 text-slate-600 bg-slate-100 border-none">
										<FiCalendar className="text-blue-500" />
										Angkatan {infoUser?.data?.tahun_masuk || new Date().getFullYear()}
									</div>
								</div>
							</div>

							{/* Action Buttons (Optional placeholder) */}
							<div className="flex flex-col gap-2">
								{/* Bisa diisi tombol edit profile jika ada fitur itu */}
							</div>
						</div>

						{/* --- Master Mode Section --- */}
						{isMaster && (
							<div className="bg-blue-50 border-b border-blue-100 p-4">
								<div className="flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
									<div className="flex items-center gap-3 text-blue-800 font-medium flex-1">
										<div className="p-2 bg-blue-200 rounded-full"><FiShield /></div>
										<div>
											<p className="text-xs uppercase tracking-wider opacity-70">Admin Mode</p>
											<p className="text-sm">Anda login sebagai Master. Cari mahasiswa lain:</p>
										</div>
									</div>
									<form onSubmit={handleSubmitOverride} className="join w-full sm:w-auto">
										<input
											className="input input-sm input-bordered border-blue-300 join-item w-full sm:w-64 focus:outline-none focus:border-blue-500"
											placeholder="Cari NIM (8-18 digit)..."
											value={nimOverride}
											onChange={(e) => setNimOverride(e.target.value.replace(/[^\d]/g, ""))}
										/>
										<button className="btn btn-sm btn-primary bg-blue-600 border-blue-600 join-item text-white">
											Cari
										</button>
									</form>
								</div>
							</div>
						)}

						{/* --- Content Area --- */}
						<div className="p-0">
							{/* Custom Tabs Navigation */}
							<div className="bg-white border-b border-slate-100 px-4 sm:px-8 pt-4 sticky top-16 z-20">
								<div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
									{tabs.map((tab) => (
										<button
											key={tab.id}
											onClick={() => setActiveTab(tab.id)}
											className={`
                              flex items-center gap-2 px-5 py-3 rounded-t-lg transition-all duration-200 font-medium text-sm border-b-2
                              ${activeTab === tab.id
													? 'border-blue-600 text-blue-600 bg-blue-50/50'
													: 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
                           `}
										>
											<tab.icon className={activeTab === tab.id ? "text-lg" : "text-lg opacity-70"} />
											<span className="whitespace-nowrap">{tab.label}</span>
										</button>
									))}
								</div>
							</div>

							{/* Tab Panels */}
							<div className="p-6 sm:p-8 min-h-[400px] bg-white">

								{/* PRIBADI */}
								{activeTab === 'personal' && (
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 animate-fade-in">
										<SectionGroup title="Identitas Diri">
											<InfoItem icon={FiUser} label="Nama Lengkap" value={infoUser?.data?.nama} />
											<InfoItem icon={FiAward} label="NIM" value={infoUser?.data?.nim?.toString()} copyable />
											<InfoItem icon={FiMapPin} label="Tempat Lahir" value={infoUser?.data?.tempat_lahir} />
											<InfoItem icon={FiCalendar} label="Tanggal Lahir" value={formatDate(infoUser?.data?.tanggal_lahir_edit)} />
											<InfoItem icon={FiUser} label="Jenis Kelamin" value={infoUser?.data?.gender === 'L' ? 'Laki-laki' : 'Perempuan'} />
											<InfoItem icon={FiBook} label="Agama" value={infoUser?.data?.agama} />
										</SectionGroup>

										<SectionGroup title="Kontak & Lainnya">
											<InfoItem icon={FiMail} label="Email" value={infoUser?.data?.email} isEmail />
											<InfoItem icon={FiPhone} label="No. Handphone" value={infoUser?.data?.handphone} isPhone />
											<InfoItem icon={FiUser} label="NIK" value={infoUser?.data?.nik} />
											<InfoItem icon={FiAward} label="NISN" value={infoUser?.data?.nisn} />
											<InfoItem icon={FiEdit} label="Jenis Daftar" value={infoUser?.data?.jenis_daftar} />
											<InfoItem icon={FiBriefcase} label="Jalur Masuk" value={infoUser?.data?.jalur_masuk} />
										</SectionGroup>
									</div>
								)}

								{/* ALAMAT */}
								{activeTab === 'address' && (
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 animate-fade-in">
										<div className="lg:col-span-2">
											<SectionGroup title="Lokasi Tempat Tinggal">
												<InfoItem icon={FiMapPin} label="Alamat Lengkap" value={infoUser?.data?.alamat} fullWidth />
											</SectionGroup>
										</div>
										<SectionGroup title="Detail Wilayah">
											<InfoItem icon={FiMapPin} label="Kelurahan" value={infoUser?.data?.kelurahan} />
											<InfoItem icon={FiMapPin} label="Kecamatan" value={infoUser?.data?.kecamatan} />
											<InfoItem icon={FiMapPin} label="Kab/Kota" value={infoUser?.data?.kabupaten_kota} />
										</SectionGroup>
										<SectionGroup title="Detail Tambahan">
											<InfoItem icon={FiMapPin} label="Provinsi" value={infoUser?.data?.provinsi} />
											<InfoItem icon={FiMapPin} label="Kode Pos" value={infoUser?.data?.kode_pos} />
											<InfoItem icon={FiHome} label="Status Tinggal" value={infoUser?.data?.jenis_tinggal} />
										</SectionGroup>
									</div>
								)}

								{/* ORANG TUA */}
								{activeTab === 'parents' && (
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
										<div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
											<div className="flex items-center gap-2 mb-4 text-blue-700">
												<FiUser className="text-xl" />
												<h3 className="font-bold text-lg">Data Ayah</h3>
											</div>
											<div className="space-y-4">
												<InfoItem icon={FiUser} label="Nama Ayah" value={infoUser?.data?.nama_ayah} simple />
												<InfoItem icon={FiAward} label="NIK" value={infoUser?.data?.nik_ayah} simple />
												<InfoItem icon={FiCalendar} label="Tgl Lahir" value={formatDate(infoUser?.data?.tanggal_lahir_ayah_edit)} simple />
												<InfoItem icon={FiBook} label="Pendidikan" value={infoUser?.data?.nama_jenjang_didik_ayah} simple />
												<InfoItem icon={FiBriefcase} label="Pekerjaan" value={infoUser?.data?.nama_pekerjaan_ayah} simple />
												<InfoItem icon={FiDollarSign} label="Penghasilan" value={infoUser?.data?.nama_penghasilan_ayah} simple />
												<InfoItem icon={FiPhone} label="Telepon" value={infoUser?.data?.telepon_ayah} isPhone simple />
											</div>
										</div>

										<div className="bg-pink-50/30 p-6 rounded-xl border border-pink-100">
											<div className="flex items-center gap-2 mb-4 text-pink-700">
												<FiUser className="text-xl" />
												<h3 className="font-bold text-lg">Data Ibu</h3>
											</div>
											<div className="space-y-4">
												<InfoItem icon={FiUser} label="Nama Ibu" value={infoUser?.data?.nama_ibu} simple />
												<InfoItem icon={FiAward} label="NIK" value={infoUser?.data?.nik_ibu} simple />
												<InfoItem icon={FiCalendar} label="Tgl Lahir" value={formatDate(infoUser?.data?.tanggal_lahir_ibu_edit)} simple />
												<InfoItem icon={FiBook} label="Pendidikan" value={infoUser?.data?.nama_jenjang_didik_ibu} simple />
												<InfoItem icon={FiBriefcase} label="Pekerjaan" value={infoUser?.data?.nama_pekerjaan_ibu} simple />
												<InfoItem icon={FiDollarSign} label="Penghasilan" value={infoUser?.data?.nama_penghasilan_ibu} simple />
												<InfoItem icon={FiPhone} label="Telepon" value={infoUser?.data?.telepon_ibu} isPhone simple />
											</div>
										</div>
									</div>
								)}

								{/* PENDIDIKAN */}
								{activeTab === 'education' && (
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 animate-fade-in">
										<div className="space-y-6">
											<SectionGroup title="File Ijazah">
												{infoUser?.data?.file_ijazah ? (
													<div className="card bg-slate-50 border border-slate-200">
														<div className="card-body p-4">
															<div className="flex items-center justify-between">
																<div className="flex items-center gap-3">
																	<div className="p-3 bg-green-100 text-green-600 rounded-lg">
																		<FiCheckCircle className="text-xl" />
																	</div>
																	<div>
																		<p className="font-semibold text-slate-700">Dokumen Tersedia</p>
																		<p className="text-xs text-slate-500 max-w-[150px] truncate">{infoUser.data.file_ijazah}</p>
																	</div>
																</div>
																<button
																	onClick={downloadIjazah}
																	className="btn btn-primary btn-sm bg-blue-600 border-blue-600"
																>
																	<FiDownload /> Download
																</button>
															</div>
														</div>
													</div>
												) : (
													<div className="alert alert-warning bg-orange-50 border-orange-100 text-orange-800 flex items-start">
														<FiInfo className="mt-1" />
														<span>Belum ada file ijazah yang diunggah.</span>
													</div>
												)}
											</SectionGroup>
										</div>

										<SectionGroup title="Dosen Wali">
											<InfoItem icon={FiUser} label="Nama Dosen" value={infoUser?.data?.dosen_wali} />
											<InfoItem icon={FiMail} label="Email" value={infoUser?.data?.email_dosen_wali} isEmail />
											<InfoItem icon={FiPhone} label="Telepon" value={infoUser?.data?.telepon_dosen_wali} isPhone />
										</SectionGroup>
									</div>
								)}

								{/* AKADEMIK */}
								{activeTab === 'academic' && (
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 animate-fade-in">
										<SectionGroup title="Informasi Prodi">
											<InfoItem icon={FiBook} label="Program Studi" value={infoUser?.data?.prodi} />
											<InfoItem icon={FiUsers} label="Kelas" value={infoUser?.data?.kelas} />
											<InfoItem icon={FiUser} label="Koordinator Prodi" value={infoUser?.data?.korprodi} />
										</SectionGroup>

										<SectionGroup title="Status Mahasiswa">
											<InfoItem icon={FiAward} label="Status Aktif" value={infoUser?.data?.status_aktif} badge />
											<InfoItem icon={FiBook} label="Jenis Daftar" value={infoUser?.data?.jenis_daftar} />
											<InfoItem icon={FiBook} label="Jalur Masuk" value={infoUser?.data?.jalur_masuk} />
											<div className="divider"></div>
											<InfoItem icon={FiCalendar} label="Terakhir Update" value={formatDate(infoUser?.data?.updated_profil)} />
										</SectionGroup>
									</div>
								)}

							</div>
						</div>
					</div>
				</div>
			</div>

			{/* CSS untuk animasi sederhana */}
			<style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
		</div>
	);
};

// --- Sub Components ---

const SectionGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
	<div className="space-y-4">
		<h3 className="text-slate-800 font-bold text-lg flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
			{title}
		</h3>
		<div className="space-y-1">
			{children}
		</div>
	</div>
);

const InfoItem = ({
	icon: Icon,
	label,
	value,
	isEmail = false,
	isPhone = false,
	badge = false,
	fullWidth = false,
	copyable = false,
	simple = false
}: {
	icon: React.ElementType;
	label: string;
	value?: string | null;
	isEmail?: boolean;
	isPhone?: boolean;
	badge?: boolean;
	fullWidth?: boolean;
	copyable?: boolean;
	simple?: boolean;
}) => {
	const displayValue = (!value || value === 'undefined' || value === '0') ? '-' : value;

	// Layout sederhana untuk Data Orang Tua (agar lebih padat)
	if (simple) {
		return (
			<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-1.5 border-b border-dashed border-slate-200 last:border-0">
				<div className="flex items-center gap-2 text-slate-500 w-32 shrink-0">
					<Icon className="text-sm" />
					<span className="text-xs uppercase font-semibold tracking-wide">{label}</span>
				</div>
				<div className="text-sm font-medium text-slate-700 truncate">
					{isPhone && displayValue !== '-' ? (
						<a href={`https://wa.me/${displayValue.replace('0', '+62')}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
							{displayValue}
						</a>
					) : (
						displayValue
					)}
				</div>
			</div>
		);
	}

	// Layout Standard
	return (
		<div className={`group py-3 ${fullWidth ? '' : 'grid grid-cols-1 sm:grid-cols-[160px_1fr]'} gap-1 sm:gap-4 items-start`}>
			<div className="flex items-center gap-2 text-slate-500">
				<div className="p-1.5 rounded-md bg-slate-100 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
					<Icon className="w-4 h-4" />
				</div>
				<span className="text-sm font-medium">{label}</span>
			</div>

			<div className={`text-sm text-slate-700 font-medium ${fullWidth ? 'mt-1 ml-9' : 'mt-1 sm:mt-1.5'}`}>
				{isEmail && displayValue !== '-' ? (
					<div className="flex items-center gap-2 flex-wrap">
						<a href={`mailto:${displayValue}`} className="text-blue-600 hover:text-blue-700 hover:underline break-all">
							{displayValue}
						</a>
						<button
							onClick={() => { navigator.clipboard.writeText(displayValue); toast.success('Disalin!'); }}
							className="opacity-0 group-hover:opacity-100 transition-opacity btn btn-ghost btn-xs text-slate-400"
							title="Salin Email"
						>
							<FiCopy />
						</button>
					</div>
				) : isPhone && displayValue !== '-' ? (
					<a href={`https://wa.me/${displayValue.replace('0', '+62')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 px-2 py-0.5 rounded bg-green-50 border border-green-100">
						<FiPhone className="text-xs" /> {displayValue}
					</a>
				) : badge ? (
					<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${displayValue === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
						{displayValue}
					</span>
				) : (
					<div className="flex items-center gap-2">
						<span className={fullWidth ? '' : ''}>{displayValue}</span>
						{copyable && displayValue !== '-' && (
							<button
								onClick={() => { navigator.clipboard.writeText(displayValue); toast.success('Disalin!'); }}
								className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-500"
								title="Salin"
							>
								<FiCopy className="w-3.5 h-3.5" />
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Profile;