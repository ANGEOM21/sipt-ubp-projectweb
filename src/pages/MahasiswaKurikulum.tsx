import React, { useEffect, useMemo, useState } from "react";
import Topbar from "@/components/Topbar";
import Footer from "@/components/Footer";
import {
    FiBook, FiLayers, FiSearch, FiFilter,
    FiXCircle, FiList,
} from "react-icons/fi";
import { useKurikulumStore, type KurikulumItem } from "@/store/useKurikulumStore";

const MahasiswaKurikulum = () => {
    const { kurikulumData, getKurikulum, isLoading } = useKurikulumStore();

    const [nimInput, setNimInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        try {
            const raw = localStorage.getItem("mhs");
            const id = raw ? JSON.parse(raw)?.id : "";
            if (id) {
                setNimInput(id);
                getKurikulum(null);
            }
        } catch { }
    }, [getKurikulum]);

    const handleFetch = (e: React.FormEvent) => {
        e.preventDefault();
        if (nimInput) getKurikulum(nimInput);
    };

    const filteredAndGroupedData = useMemo(() => {
        const listMatkul = kurikulumData?.daftar_matkul;
        if (!listMatkul || !Array.isArray(listMatkul)) return {};

        const lowerQuery = searchQuery.toLowerCase();
        const filtered = listMatkul.filter((item) =>
            (item.nama_mata_kuliah || "").toLowerCase().includes(lowerQuery) ||
            (item.kode_matkul || "").toLowerCase().includes(lowerQuery)
        );

        const sorted = [...filtered].sort((a, b) => Number(a.semester) - Number(b.semester));

        return sorted.reduce((acc, item) => {
            const sem = item.semester.toString();
            if (!acc[sem]) acc[sem] = [];
            acc[sem].push(item);
            return acc;
        }, {} as Record<string, KurikulumItem[]>);
    }, [kurikulumData, searchQuery]);

    const totalSKS = useMemo(() => {
        const list = kurikulumData?.daftar_matkul;
        if (!list || !Array.isArray(list)) return 0;
        return list.reduce((acc, item) => acc + parseFloat(item.sks_mata_kuliah || "0"), 0);
    }, [kurikulumData]);

    const getSemesterSKS = (items: KurikulumItem[]) => {
        return items.reduce((acc, item) => acc + parseFloat(item.sks_mata_kuliah || "0"), 0);
    };

    const displayedCount = Object.values(filteredAndGroupedData).flat().length;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            <Topbar />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-grow pb-12 relative z-20 space-y-6">

                <div className="card bg-white shadow-xl rounded-xl border border-slate-100 overflow-hidden">
                    <div className="card-body p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-end">
                            <form onSubmit={handleFetch} className="form-control w-full lg:w-1/3">
                                <label className="label font-bold text-slate-700 text-xs uppercase tracking-wide">
                                    Mahasiswa
                                </label>
                                <div className="join w-full">
                                    <input
                                        type="text"
                                        className="input input-sm sm:input-md input-bordered w-full join-item focus:outline-none focus:border-blue-500 bg-slate-50"
                                        placeholder="NIM..."
                                        value={nimInput}
                                        onChange={(e) => setNimInput(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-sm sm:btn-md btn-primary join-item bg-blue-600 border-blue-600 text-white"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "..." : "Cek"}
                                    </button>
                                </div>
                            </form>

                            <div className="form-control w-full lg:w-2/3">
                                <label className="label font-bold text-slate-700 text-xs uppercase tracking-wide">
                                    Filter Mata Kuliah
                                </label>
                                <div className="relative w-full">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                                        <FiSearch />
                                    </span>
                                    <input
                                        type="text"
                                        className="input input-sm sm:input-md input-bordered w-full pl-10 focus:outline-none focus:border-blue-500 bg-white"
                                        placeholder="Cari nama atau kode..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        disabled={!kurikulumData}
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 z-10"
                                        >
                                            <FiXCircle />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {kurikulumData && (
                            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
                                <div className="badge badge-lg gap-2 py-3 bg-blue-50 text-blue-700 border-blue-100 rounded-lg">
                                    <FiBook /> Total: <strong>{totalSKS} SKS</strong>
                                </div>
                                {searchQuery && (
                                    <div className="badge badge-lg gap-2 py-3 bg-yellow-50 text-yellow-700 border-yellow-100 rounded-lg">
                                        <FiFilter /> Hasil: <strong>{displayedCount} Matkul</strong>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <span className="loading loading-spinner loading-lg text-blue-600"></span>
                        <p className="mt-4 text-slate-500 font-medium">Memuat data...</p>
                    </div>
                ) : kurikulumData ? (
                    <div className="space-y-6">
                        {Object.keys(filteredAndGroupedData).length > 0 ? (
                            
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                                {Object.keys(filteredAndGroupedData).map((semester) => {
                                    const matkulList = filteredAndGroupedData[semester];
                                    const semesterSKS = getSemesterSKS(matkulList);

                                    return (
                                        <div key={semester} className="card bg-white shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-200 rounded-xl overflow-hidden animate-fade-in break-inside-avoid">
                                            
                                            <div className="bg-gradient-to-r from-slate-50 to-white px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                                        {semester}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-700 text-sm">SEMESTER {semester}</h3>
                                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                                            <FiList className="inline" /> {matkulList.length} Mata Kuliah
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-xs text-slate-400 font-semibold uppercase">Total Beban</span>
                                                    <span className="block text-sm font-bold text-blue-600">{semesterSKS} SKS</span>
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="table w-full">
                                                    <thead className="bg-white text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-50">
                                                        <tr>
                                                            <th className="pl-5 w-24">Kode</th>
                                                            <th>Mata Kuliah</th>
                                                            <th className="text-center w-14">SKS</th>
                                                            <th className="text-center w-16">Sifat</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-sm divide-y divide-slate-50">
                                                        {matkulList.map((mk) => (
                                                            <tr key={mk.id} className="hover:bg-blue-50/20 transition-colors group">
                                                                <td className="pl-5 py-2.5 font-mono text-xs text-slate-500 group-hover:text-blue-600">
                                                                    {mk.kode_matkul}
                                                                </td>
                                                                <td className="py-2.5">
                                                                    <div className="font-medium text-slate-700 text-xs sm:text-sm line-clamp-1 group-hover:text-blue-700" title={mk.nama_mata_kuliah}>
                                                                        {mk.nama_mata_kuliah || '-'}
                                                                    </div>
                                                                </td>
                                                                <td className="text-center py-2.5">
                                                                    <span className="font-semibold text-slate-600 text-xs">
                                                                        {parseFloat(mk.sks_mata_kuliah as string)}
                                                                    </span>
                                                                </td>
                                                                <td className="text-center py-2.5 pr-4">
                                                                    {mk.status_wajib === '1' ? (
                                                                        <div className="w-2 h-2 rounded-full bg-green-500 mx-auto" title="Wajib"></div>
                                                                    ) : (
                                                                        <div className="w-2 h-2 rounded-full bg-orange-400 mx-auto" title="Pilihan"></div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            
                                            <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-50 flex items-center gap-4 text-[10px] text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Wajib
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-orange-400"></div> Pilihan
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-dashed border-slate-300">
                                <div className="bg-slate-100 p-4 rounded-full mb-3 text-slate-400">
                                    <FiSearch className="text-3xl" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-600">Tidak Ditemukan</h3>
                                <p className="text-slate-500 text-sm">
                                    Mata kuliah <b>"{searchQuery}"</b> tidak ada.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                        <div className="bg-blue-50 p-5 rounded-full mb-4 animate-bounce-slow">
                            <FiLayers className="text-4xl text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700">Data Kurikulum</h3>
                        <p className="text-slate-500 max-w-md mx-auto mt-2">
                            Silakan masukkan NIM untuk memuat struktur mata kuliah.
                        </p>
                    </div>
                )}
            </main>
            <Footer />

            <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
};

export default MahasiswaKurikulum;