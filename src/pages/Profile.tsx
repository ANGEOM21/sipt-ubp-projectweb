import Topbar from "@/components/Topbar"
import { useProfileStore } from "@/store/useProfileStore";
import React, { useEffect, useState } from "react";
import {
	FiUser, FiHome, FiUsers, FiBook, FiBriefcase,
	FiDollarSign, FiMail, FiPhone, FiCalendar,
	FiMapPin, FiAward, FiEdit, FiDownload,
	FiInfo,
	FiCopy,
	FiChevronUp,
	FiChevronDown
} from "react-icons/fi";

import { BiUser } from "react-icons/bi"
import toast from "react-hot-toast";

const Profile = () => {
	const { infoUser, getInfoUser } = useProfileStore();
	const [activeTab, setActiveTab] = useState('personal');
	useEffect(() => {
		getInfoUser();
	}, [getInfoUser]);

	const tabs = [
		{ id: 'personal', label: 'Data Pribadi', icon: FiUser },
		{ id: 'address', label: 'Alamat', icon: FiHome },
		{ id: 'parents', label: 'Data Orang Tua', icon: FiUsers },
		{ id: 'education', label: 'Pendidikan', icon: FiBook },
		{ id: 'academic', label: 'Akademik', icon: FiAward },
	];

	// Format tanggal untuk tampilan lebih baik
	const formatDate = (dateString: string) => {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('id-ID', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const formatSimpleDate = (dateString: string) => {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('id-ID', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	};

	const downloadIjazah = () => {
		if (infoUser?.data?.path_ijazah) {
			window.open(infoUser.data.path_ijazah, '_blank');
		}
	};

	return (
		<div className="min-h-screen bg-base-100">
			<Topbar />

			{/* Header Profile */}
			<div className="bg-gradient-to-bl from-indigo-500 to-primary text-primary-content py-8">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col md:flex-row items-center gap-6">
						<div className="avatar">
							<div className="w-24 h-24 rounded-full bg-white text-primary flex items-center justify-center">
								{infoUser?.data?.pas_photo && (infoUser?.data?.pas_photo !== import.meta.env.VITE_API_URL_ORI) ? (
									// <Avatar url={infoUser?.data?.pas_photo} />
									<img
										src={`${import.meta.env.VITE_API_URL}/pas_photo/${infoUser?.data?.pas_photo?.split("/").pop()}`}
										alt="Profile"
										className="rounded-full object-cover"
									/>
								) : (
									<div className="flex items-center justify-center h-full">
										<BiUser className="text-7xl" />
									</div>
								)}
							</div>
						</div>

						<div className="text-center md:text-left flex-1">
							<h1 className="text-2xl md:text-3xl font-bold mb-2">
								{infoUser?.data?.nama || 'Loading...'}
							</h1>
							<p className="text-primary-content/80 mb-2">{infoUser?.data?.nim}</p>
							<p className="badge badge-accent badge-lg">
								{infoUser?.data?.status_aktif || 'Mahasiswa'}
							</p>

							<div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
								<div className="flex items-center gap-2 text-sm font-semibold text-white">
									<FiBook />
									<span>{infoUser?.data?.prodi}</span>
								</div>
								<div className="flex items-center gap-2 text-sm font-semibold text-white">
									<FiUsers />
									<span>{infoUser?.data?.kelas}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Tabs Navigation */}
				<div className="tabs tabs-boxed bg-base-200 p-1 mb-8 overflow-x-auto">
					<div className="flex space-x-1 min-w-max">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							return (
								<button
									key={tab.id}
									className={`tab flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'tab-active bg-primary text-primary-content' : ''
										}`}
									onClick={() => setActiveTab(tab.id)}
								>
									<Icon className="text-sm" />
									{/* Tampilkan label pada layar medium ke atas */}
									<span className="hidden md:block">{tab.label}</span>
									{/* Tampilkan hanya icon pada layar kecil */}
									<span className="md:hidden">
										{tab.label.split(' ')[0]}
									</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* Tab Content */}
				<div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
					{/* Data Pribadi */}
					{activeTab === 'personal' && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<h3 className="text-lg font-semibold border-b pb-2">Informasi Pribadi</h3>

								<div className="space-y-3">
									<InfoItem
										icon={FiUser}
										label="Nama Lengkap"
										value={infoUser?.data?.nama}
									/>
									<InfoItem
										icon={FiAward}
										label="NIM"
										value={infoUser?.data?.nim.toString()}
									/>
									<InfoItem
										icon={FiCalendar}
										label="Tanggal Lahir"
										value={infoUser?.data?.tanggal_lahir_edit ? formatDate(infoUser.data.tanggal_lahir_edit) : '-'}
									/>
									<InfoItem
										icon={FiMapPin}
										label="Tempat Lahir"
										value={infoUser?.data?.tempat_lahir}
									/>
									<InfoItem
										icon={FiUser}
										label="Jenis Kelamin"
										value={infoUser?.data?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
									/>
									<InfoItem
										icon={FiBook}
										label="Agama"
										value={infoUser?.data?.agama}
									/>
								</div>
							</div>

							<div className="space-y-4">
								<h3 className="text-lg font-semibold border-b pb-2">Kontak & Identitas</h3>

								<div className="space-y-3">
									<InfoItem
										icon={FiMail}
										label="Email"
										value={infoUser?.data?.email}
										isEmail={true}
									/>
									<InfoItem
										icon={FiPhone}
										label="Telepon"
										value={infoUser?.data?.handphone}
										isPhone={true}
									/>
									<InfoItem
										icon={FiUser}
										label="NIK"
										value={infoUser?.data?.nik}
									/>
									<InfoItem
										icon={FiAward}
										label="NISN"
										value={infoUser?.data?.nisn}
									/>
									<InfoItem
										icon={FiEdit}
										label="Jenis Pendaftaran"
										value={infoUser?.data?.jenis_daftar}
									/>
									<InfoItem
										icon={FiBook}
										label="Jalur Masuk"
										value={infoUser?.data?.jalur_masuk}
									/>
								</div>
							</div>
						</div>
					)}

					{/* Alamat */}
					{activeTab === 'address' && (
						<div className="space-y-6">
							<h3 className="text-lg font-semibold border-b pb-2">Informasi Alamat</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-3">
									<InfoItem
										icon={FiMapPin}
										label="Alamat Lengkap"
										value={infoUser?.data?.alamat}
										fullWidth={true}
									/>
									<InfoItem
										icon={FiMapPin}
										label="Kelurahan"
										value={infoUser?.data?.kelurahan}
									/>
									<InfoItem
										icon={FiMapPin}
										label="Kecamatan"
										value={infoUser?.data?.kecamatan?.trim()}
									/>
								</div>

								<div className="space-y-3">
									<InfoItem
										icon={FiMapPin}
										label="Kabupaten/Kota"
										value={infoUser?.data?.kabupaten_kota}
									/>
									<InfoItem
										icon={FiMapPin}
										label="Provinsi"
										value={infoUser?.data?.provinsi}
									/>
									<InfoItem
										icon={FiMapPin}
										label="Kode Pos"
										value={infoUser?.data?.kode_pos}
									/>
									<InfoItem
										icon={FiHome}
										label="Jenis Tinggal"
										value={infoUser?.data?.jenis_tinggal}
									/>
								</div>
							</div>
						</div>
					)}

					{/* Data Orang Tua */}
					{activeTab === 'parents' && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{/* Ayah */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
									<FiUser className="text-primary" />
									Data Ayah
								</h3>

								<div className="space-y-3">
									<InfoItem
										icon={FiUser}
										label="Nama Ayah"
										value={infoUser?.data?.nama_ayah}
									/>
									<InfoItem
										icon={FiCalendar}
										label="Tanggal Lahir"
										value={infoUser?.data?.tanggal_lahir_ayah_edit ? formatSimpleDate(infoUser.data.tanggal_lahir_ayah_edit) : '-'}
									/>
									<InfoItem
										icon={FiAward}
										label="NIK"
										value={infoUser?.data?.nik_ayah}
									/>
									<InfoItem
										icon={FiBook}
										label="Pendidikan"
										value={infoUser?.data?.nama_jenjang_didik_ayah}
									/>
									<InfoItem
										icon={FiBriefcase}
										label="Pekerjaan"
										value={infoUser?.data?.nama_pekerjaan_ayah}
									/>
									<InfoItem
										icon={FiDollarSign}
										label="Penghasilan"
										value={infoUser?.data?.nama_penghasilan_ayah}
									/>
									<InfoItem
										icon={FiPhone}
										label="Telepon"
										value={infoUser?.data?.telepon_ayah}
										isPhone={true}
									/>
								</div>
							</div>

							{/* Ibu */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
									<FiUser className="text-primary" />
									Data Ibu
								</h3>

								<div className="space-y-3">
									<InfoItem
										icon={FiUser}
										label="Nama Ibu"
										value={infoUser?.data?.nama_ibu}
									/>
									<InfoItem
										icon={FiCalendar}
										label="Tanggal Lahir"
										value={infoUser?.data?.tanggal_lahir_ibu_edit ? formatSimpleDate(infoUser.data.tanggal_lahir_ibu_edit) : '-'}
									/>
									<InfoItem
										icon={FiAward}
										label="NIK"
										value={infoUser?.data?.nik_ibu}
									/>
									<InfoItem
										icon={FiBook}
										label="Pendidikan"
										value={infoUser?.data?.nama_jenjang_didik_ibu}
									/>
									<InfoItem
										icon={FiBriefcase}
										label="Pekerjaan"
										value={infoUser?.data?.nama_pekerjaan_ibu}
									/>
									<InfoItem
										icon={FiDollarSign}
										label="Penghasilan"
										value={infoUser?.data?.nama_penghasilan_ibu}
									/>
									<InfoItem
										icon={FiPhone}
										label="Telepon"
										value={infoUser?.data?.telepon_ibu}
										isPhone={true}
									/>
								</div>
							</div>
						</div>
					)}

					{/* Pendidikan */}
					{activeTab === 'education' && (
						<div className="space-y-6">
							<h3 className="text-lg font-semibold border-b pb-2">Informasi Pendidikan</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-4">
									<h4 className="font-medium text-primary">Ijazah</h4>

									{infoUser?.data?.file_ijazah ? (
										<div className="bg-base-100 p-4 rounded-lg border">
											<div className="flex items-center justify-between mb-3">
												<span className="font-medium">File Ijazah</span>
												<button
													onClick={downloadIjazah}
													className="btn btn-sm btn-primary"
												>
													<FiDownload className="mr-1" />
													Download
												</button>
											</div>
											<p className="text-sm text-gray-600 break-all">
												{infoUser.data.file_ijazah}
											</p>
										</div>
									) : (
										<div className="alert alert-warning">
											<FiInfo className="text-lg" />
											<span>File ijazah belum diupload</span>
										</div>
									)}
								</div>

								<div className="space-y-4">
									<h4 className="font-medium text-primary">Informasi Lainnya</h4>

									<div className="space-y-3">
										<InfoItem
											icon={FiBook}
											label="Program Studi"
											value={infoUser?.data?.prodi}
										/>
										<InfoItem
											icon={FiUsers}
											label="Kelas"
											value={infoUser?.data?.kelas}
										/>
										<InfoItem
											icon={FiUser}
											label="Dosen Wali"
											value={infoUser?.data?.dosen_wali}
										/>
										<InfoItem
											icon={FiMail}
											label="Email Dosen Wali"
											value={infoUser?.data?.email_dosen_wali}
											isEmail={true}
										/>
										<InfoItem
											icon={FiPhone}
											label="Telepon Dosen Wali"
											value={infoUser?.data?.telepon_dosen_wali}
											isPhone={true}
										/>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Akademik */}
					{activeTab === 'academic' && (
						<div className="space-y-6">
							<h3 className="text-lg font-semibold border-b pb-2">Informasi Akademik</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-3">
									<InfoItem
										icon={FiBook}
										label="Program Studi"
										value={infoUser?.data?.prodi}
									/>
									<InfoItem
										icon={FiUsers}
										label="Kelas"
										value={infoUser?.data?.kelas}
									/>
									<InfoItem
										icon={FiUser}
										label="Dosen Wali"
										value={infoUser?.data?.dosen_wali}
									/>
									<InfoItem
										icon={FiUser}
										label="Koordinator Prodi"
										value={infoUser?.data?.korprodi}
									/>
								</div>

								<div className="space-y-3">
									<InfoItem
										icon={FiAward}
										label="Status Aktif"
										value={infoUser?.data?.status_aktif}
										badge={true}
									/>
									<InfoItem
										icon={FiBook}
										label="Jenis Pendaftaran"
										value={infoUser?.data?.jenis_daftar}
									/>
									<InfoItem
										icon={FiBook}
										label="Jalur Masuk"
										value={infoUser?.data?.jalur_masuk}
									/>
									<InfoItem
										icon={FiCalendar}
										label="Terakhir Update"
										value={infoUser?.data?.updated_profil ? formatDate(infoUser.data.updated_profil) : '-'}
									/>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

// Komponen untuk menampilkan item informasi
const InfoItem = ({
	icon: Icon,
	label,
	value,
	isEmail = false,
	isPhone = false,
	badge = false,
	fullWidth = false
}: {
	icon: React.ElementType;
	label: string;
	value?: string | null;
	isEmail?: boolean;
	isPhone?: boolean;
	badge?: boolean;
	fullWidth?: boolean;
}) => {
	if (!value || value === 'undefined' || value === '0') value = '-';

	const [showFullEmail, setShowFullEmail] = useState(false);

	return (
		<div className={`flex ${fullWidth ? 'flex-col' : 'flex-row items-start'} gap-2 py-1`}>
			<div className="flex items-start gap-2 flex-1">
				<Icon className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
				<span className="font-medium text-sm text-gray-600 min-w-[130px] sm:min-w-[150px]">{label}:</span>
			</div>
			<div className={`${fullWidth ? 'ml-6' : 'flex-1'}`}>
				{isEmail ? (

					<>
						<div className="join block sm:hidden">
							<button
								onClick={() => setShowFullEmail(!showFullEmail)}
								className="btn btn-xs btn-ghost join-item"
								aria-label={showFullEmail ? "Sembunyikan email" : "Tampilkan email lengkap"}
							>
								{showFullEmail ? (
									<FiChevronUp />
								) : (
									<FiChevronDown />
								)}
							</button>
							<button
								onClick={() => {
									navigator.clipboard.writeText(value);
									toast.success('Email berhasil disalin');
								}}
								className="btn btn-xs btn-ghost join-item"
								aria-label="Salin email"
							>
								<FiCopy />
							</button>
						</div>
						<div className="flex items-center gap-1">
							<a
								href={`mailto:${value}`}
								className={`link link-primary text-sm ${showFullEmail ? 'whitespace-normal break-all' : 'truncate max-w-[130px] sm:min-w-[150px]'}`}
							>
								{value}
							</a>
							<div className={`join hidden sm:block ${showFullEmail ? 'join-vertical' : 'join-horizontal'}`}>
								<button
									onClick={() => setShowFullEmail(!showFullEmail)}
									className="btn btn-xs btn-ghost join-item"
									aria-label={showFullEmail ? "Sembunyikan email" : "Tampilkan email lengkap"}
								>
									{showFullEmail ? (
										<FiChevronUp />
									) : (
										<FiChevronDown />
									)}
								</button>
								<button
									onClick={() => {
										navigator.clipboard.writeText(value);
										toast.success('Email berhasil disalin');
									}}
									className="btn btn-xs btn-ghost join-item"
									aria-label="Salin email"
								>
									<FiCopy />
								</button>
							</div>
						</div>
					</>
				) : isPhone ? (
					<a href={`https://wa.me/${value.replace('0', '+62')}`} target="_blank" className="link link-primary text-sm">
						{value}
					</a>
				) : badge ? (
					<span className={`badge ${value === 'Aktif' ? 'badge-success' : 'badge-warning'} text-sm`}>
						{value}
					</span>
				) : (
					<span className="text-sm">{value}</span>
				)}
			</div>
		</div>
	);
};

export default Profile;
