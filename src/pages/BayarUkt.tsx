import React, { useEffect, useMemo, useState } from "react";
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import { useKwitansiStore } from "@/store/useKwitansiStore";
import { useTagihanStore } from "@/store/useTagihanStore";
import {
    FiSearch, FiClock, FiCheckCircle, FiWifi, FiArrowRight, FiFileText, FiDownload
} from "react-icons/fi";
import toast from "react-hot-toast";

const BayarUkt = () => {
    const { tagihanData, getTagihan, createVaMdr, isLoading, isCreatingVa } = useTagihanStore();
    const [nimInput, setNimInput] = useState("");
    const [paymentAmount, setPaymentAmount] = useState("");
    const { kwitansiList, getKwitansi, isLoadingKwitansi } = useKwitansiStore();

    const MASTER_NIM = ["22416255201247", "22416255201162"];

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
            getTagihan(storedNim);
            getKwitansi(storedNim);
        }
    }, [getTagihan, getKwitansi, storedNim]);

    const handleFetch = (e: React.FormEvent) => {
        e.preventDefault();
        if (nimInput) {
            getTagihan(nimInput);
            getKwitansi(nimInput);
        }
    };

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tagihanData?.tagih?.tagih_nim) return;
        
        const cleanAmount = paymentAmount.replace(/\D/g, '');
        if (!cleanAmount || parseInt(cleanAmount) < 10000) {
            toast.error("Minimal pembayaran Rp 10.000");
            return;
        }

        createVaMdr({
            nim: tagihanData.tagih.tagih_nim.nim,
            periode: tagihanData.tagih.tagih_nim.periode,
            nominal: cleanAmount
        });
    };

    const formatRupiah = (angka: string | number) => {
        const number = typeof angka === 'string' ? parseFloat(angka) : angka;
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(number);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        if (raw === "") {
            setPaymentAmount("");
        } else {
            setPaymentAmount(formatRupiah(raw).replace("Rp", "").trim());
        }
    };

    const overview = tagihanData?.tagih?.tagih_nim;
    const details = tagihanData?.tagih?.detail_tagihan;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            <Topbar />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-8">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Pembayaran UKT</h1>
                        <p className="text-slate-500 text-sm">Kelola tagihan dan pembayaran semester</p>
                    </div>
                    
                    {isMaster && (
                        <form onSubmit={handleFetch} className="flex gap-2">
                            <input
                                type="text"
                                className="input input-bordered input-sm bg-white w-full md:w-48"
                                placeholder="Admin: Cek NIM lain..."
                                value={nimInput}
                                onChange={(e) => setNimInput(e.target.value)}
                            />
                            <button type="submit" className="btn btn-sm btn-primary bg-slate-800 text-white border-slate-800">
                                {isLoading ? "..." : <FiSearch />}
                            </button>
                        </form>
                    )}
                </div>

                {isLoading ? (
                    <div className="text-center py-20">
                        <span className="loading loading-spinner loading-lg text-blue-600"></span>
                        <p className="mt-4 text-slate-500 font-medium">Mengambil data tagihan...</p>
                    </div>
                ) : overview && details ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">

                        <div className="lg:col-span-1 space-y-6">

                            <div className="relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl group transition-transform hover:scale-[1.02] duration-300">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#003d79] via-[#0052a5] to-[#002b55]"></div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
                                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5 transform -skew-y-12"></div>

                                <div className="absolute inset-0 p-6 flex flex-col justify-between text-white font-sans">
                                    <div className="flex justify-between items-start">
                                        <div className="w-11 h-8 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md border border-yellow-600/50 relative overflow-hidden shadow-sm">
                                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-yellow-800/40"></div>
                                            <div className="absolute top-0 left-1/3 w-[1px] h-full bg-yellow-800/40"></div>
                                            <div className="absolute top-0 right-1/3 w-[1px] h-full bg-yellow-800/40"></div>
                                            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-yellow-800/40 rounded-sm"></div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <h3 className="font-bold italic text-xl tracking-wider drop-shadow-md">mandiri</h3>
                                            <div className="flex items-center gap-1 mt-1 opacity-80">
                                                <FiWifi className="transform rotate-90 text-lg" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <p className="font-mono text-lg sm:text-xl md:text-2xl tracking-widest drop-shadow-md" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}>
                                            {overview.nim.replace(/(\d{4})(?=\d)/g, '$1 ')}
                                        </p>
                                        <div className="flex justify-center items-center gap-2 mt-2 ml-8">
                                            <span className="text-[6px] text-center leading-tight opacity-80">VALID<br />THRU</span>
                                            <span className="font-mono text-sm tracking-widest">12/30</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="uppercase font-medium text-xs sm:text-sm tracking-wider opacity-90 truncate max-w-[60%]">
                                            {overview.nama}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] uppercase tracking-widest opacity-70 mb-0.5">Sisa Tagihan</p>
                                            <p className="font-bold text-lg sm:text-xl drop-shadow-md">{formatRupiah(overview.sisa_tagihan)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-sm">
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="text-slate-500">Periode</span>
                                    <span className="font-bold text-slate-700">{overview.periode}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="text-slate-500">Status MHS</span>
                                    <span className={`badge badge-sm ${overview.status_aktif === 'Aktif' ? 'badge-success text-white' : 'badge-warning'}`}>
                                        {overview.status_aktif}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total Tagihan</span>
                                    <span className="font-medium">{formatRupiah(overview.total_tagihan)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                        <FiClock className="text-blue-600" /> Rincian Cicilan
                                    </h3>
                                    <span className="text-xs text-slate-500 font-mono bg-white px-2 py-1 rounded border border-slate-200">
                                        C1 - C10
                                    </span>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {details.map((item, index) => {
                                        const isLunas = item.sisa_tagihan === "0";

                                        return (
                                            <div key={index} className="p-4 hover:bg-slate-50 transition-colors flex flex-row items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg flex-shrink-0 
                              ${isLunas ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        {isLunas ? <FiCheckCircle /> : <FiClock />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-800 text-sm truncate">
                                                            Cicilan {item.cicilan.replace('C', '')}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                                                            {formatRupiah(item.total_tagihan)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                    {isLunas ? (
                                                        <div className="badge badge-success badge-sm gap-1 text-white border-none px-3">
                                                            LUNAS
                                                        </div>
                                                    ) : (
                                                        <div className="badge badge-ghost bg-slate-200 text-slate-500 badge-sm border-none px-3">
                                                            BELUM
                                                        </div>
                                                    )}
                                                    <p className="text-[10px] text-slate-400 text-right">
                                                        {isLunas
                                                            ? (item.last_payment ? new Date(item.last_payment).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : 'Lunas')
                                                            : (parseFloat(item.total_bayar) > 0 ? `Masuk: ${formatRupiah(item.total_bayar)}` : '-')
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                                    Buat Pembayaran Baru
                                </h3>

                                <form onSubmit={handlePayment} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-sm font-medium text-slate-600">Nominal Pembayaran</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold z-10">Rp</span>
                                            <input
                                                type="text"
                                                className="input input-bordered w-full pl-12 text-lg font-semibold text-slate-800 focus:border-blue-500 focus:outline-none bg-slate-50 h-12"
                                                placeholder="0"
                                                value={paymentAmount}
                                                onChange={handleAmountChange}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className={`btn btn-primary bg-blue-700 hover:bg-blue-800 border-none text-white h-12 px-6 shadow-md shadow-blue-200 flex-shrink-0 ${(!paymentAmount || isLoading || isCreatingVa) ? 'btn-disabled opacity-50' : ''}`}
                                            disabled={isLoading || isCreatingVa}
                                        >
                                            {isCreatingVa ? (
                                                <span className="loading loading-spinner"></span>
                                            ) : (
                                                <>
                                                    Bayar <FiArrowRight className="hidden sm:inline" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 pl-1">
                                        *VA akan dibuat otomatis setelah klik tombol Bayar.
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-slate-400">Data tidak ditemukan.</p>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                    <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <FiFileText className="text-blue-600" /> Riwayat Pembayaran
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">
                                Daftar kwitansi pembayaran yang telah valid
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="py-4 pl-6 w-16">No</th>
                                    <th className="py-4 min-w-[120px]">Tanggal</th>
                                    <th className="py-4 min-w-[200px]">No. Kwitansi</th>
                                    <th className="py-4 text-center">Periode</th>
                                    <th className="py-4 min-w-[140px]">Nominal</th>
                                    <th className="py-4 text-center">Status</th>
                                    <th className="py-4 pr-6 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-100">
                                {isLoadingKwitansi ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-slate-400">
                                            <span className="loading loading-spinner loading-sm"></span> Memuat riwayat...
                                        </td>
                                    </tr>
                                ) : kwitansiList && kwitansiList.length > 0 ? (
                                    kwitansiList.map((item, index) => (
                                        <tr key={item.id_trx} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="py-3 pl-6 text-slate-400 font-mono">{index + 1}</td>
                                            <td className="py-3 font-medium text-slate-700">
                                                {new Date(item.tanggal).toLocaleDateString('id-ID', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                            <td className="py-3 font-mono text-xs text-slate-600">
                                                {item.kwitansi}
                                                <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]" title={item.nama_ukt}>
                                                    {item.nama_ukt}
                                                </div>
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className="badge badge-ghost bg-slate-100 text-slate-600 border-none">
                                                    {item.periode}
                                                </span>
                                            </td>
                                            <td className="py-3 font-semibold text-slate-800">
                                                {formatRupiah(item.jlminput)}
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                                    <FiCheckCircle className="text-[10px]" /> {item.status}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-6 text-center">
                                                <button
                                                    className="btn btn-xs btn-ghost text-blue-600 hover:bg-blue-50 tooltip tooltip-left"
                                                    data-tip="Unduh Bukti"
                                                    onClick={() => toast.success("Fitur cetak kwitansi akan segera tersedia")}
                                                >
                                                    <FiDownload />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-slate-400 italic">
                                            Belum ada riwayat pembayaran.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {kwitansiList && kwitansiList.length > 0 && (
                        <div className="bg-slate-50 border-t border-slate-200 p-3 text-xs text-center text-slate-400">
                            Menampilkan {kwitansiList.length} transaksi terakhir
                        </div>
                    )}
                </div>

            </main>

            <Footer />
            <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
};

export default BayarUkt;