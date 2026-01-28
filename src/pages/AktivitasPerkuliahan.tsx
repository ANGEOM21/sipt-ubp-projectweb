import React, { useEffect, useMemo, useState } from "react";
import Topbar from "@/components/Topbar";
import Footer from "@/components/Footer";
import { useAktivitasStore } from "@/store/useAktivitasStore";
import {
    FiActivity, FiCalendar,
    FiBook, FiArrowUpRight
} from "react-icons/fi";

const MASTER_NIM = ["22416255201247", "22416255201162"];

const AktivitasPerkuliahan = () => {
    const { aktivitasData, getAktivitas, isLoading } = useAktivitasStore();
    const [nimInput, setNimInput] = useState("");

    const storedNim = useMemo(() => {
        try {
            const raw = localStorage.getItem("mhs");
            return raw ? (JSON.parse(raw)?.id?.toString() ?? "") : "";
        } catch { return ""; }
    }, []);

    const isMaster = MASTER_NIM.includes(storedNim);

    useEffect(() => {
        if (storedNim) {
            setNimInput(storedNim);
            getAktivitas(storedNim);
        }
    }, [getAktivitas, storedNim]);

    const handleFetch = (e: React.FormEvent) => {
        e.preventDefault();
        if (nimInput) getAktivitas(nimInput);
    };

    const sortedData = useMemo(() => {
        if (!aktivitasData) return null;
        return [...aktivitasData].sort((a, b) => Number(a.periode) - Number(b.periode));
    }, [aktivitasData]);

    const latestStat = sortedData ? sortedData[sortedData.length - 1] : null;

    const formatPeriode = (kode: string) => {
        if (!kode || kode.length !== 5) return kode;
        const year = kode.substring(0, 4);
        const term = kode.substring(4);
        return term === '1' ? `Ganjil ${year}` : term === '2' ? `Genap ${year}` : `Pendek ${year}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            <Topbar />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <FiActivity className="text-blue-600" /> Riwayat Studi
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">
                                Perkembangan akademik per semester
                            </p>
                        </div>

                        {latestStat && (
                            <div className="flex gap-4 sm:gap-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total SKS</p>
                                    <p className="text-xl font-bold text-slate-800">{latestStat.sks_keseluruhan}</p>
                                </div>
                                <div className="border-l border-slate-200 pl-4 sm:pl-8">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">IPK Terakhir</p>
                                    <p className="text-xl font-bold text-blue-600">{parseFloat(latestStat.ipk).toFixed(2)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-6">

                {isMaster && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 max-w-2xl">
                        <form onSubmit={handleFetch} className="flex gap-2">
                            <input
                                type="text"
                                className="input input-bordered w-full input-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                                placeholder="Masukkan NIM..."
                                value={nimInput}
                                onChange={(e) => setNimInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="btn btn-sm btn-primary bg-blue-600 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? "..." : "Cari"}
                            </button>
                        </form>
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-20">
                        <span className="loading loading-spinner loading-md text-slate-400"></span>
                        <p className="mt-2 text-slate-400 text-sm">Memuat data...</p>
                    </div>
                ) : sortedData ? (
                    <div className="space-y-4 animate-fade-in">

                        <div className="grid gap-3">
                            {sortedData.map((item, index) => {
                                const semesterKe = index + 1; // 1, 2, 3...
                                const ips = parseFloat(item.ips);
                                const ipk = parseFloat(item.ipk);

                                return (
                                    <div
                                        key={index}
                                        className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 transition-colors"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 font-bold text-lg border border-slate-200">
                                                {semesterKe}
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-slate-800 text-base">
                                                    Semester {semesterKe}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <FiCalendar className="text-slate-400" />
                                                        {formatPeriode(item.periode)}
                                                    </span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="flex items-center gap-1">
                                                        <FiBook className="text-slate-400" />
                                                        {item.sks_semester} SKS Diambil
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 sm:gap-12 pl-16 sm:pl-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                            <div className="text-left sm:text-right">
                                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">IPS</p>
                                                <p className="font-bold text-slate-700 text-lg">{ips.toFixed(2)}</p>
                                            </div>

                                            <div className="text-left sm:text-right">
                                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">IPK Total</p>
                                                <div className="flex items-center gap-1">
                                                    <p className={`font-bold text-lg ${ipk >= 3.0 ? 'text-blue-600' : 'text-slate-800'}`}>
                                                        {ipk.toFixed(2)}
                                                    </p>
                                                    {index === sortedData.length - 1 && (
                                                        <FiArrowUpRight className="text-blue-500 text-xs mb-1" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="text-center text-xs text-slate-400 mt-6 pb-6">
                            Menampilkan data dari semester awal hingga akhir
                        </div>
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                            <FiActivity className="text-slate-400 text-xl" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-600">Belum ada data</h3>
                        <p className="text-xs text-slate-400 mt-1">
                            Silakan cari NIM mahasiswa untuk menampilkan riwayat.
                        </p>
                    </div>
                )}
            </main>
            <Footer />

            <style>{`
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default AktivitasPerkuliahan;