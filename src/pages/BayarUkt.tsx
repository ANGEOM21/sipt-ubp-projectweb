import React, { useEffect, useMemo, useState } from "react";
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import { useKwitansiStore } from "@/store/useKwitansiStore";
import { useTagihanStore } from "@/store/useTagihanStore";
import { useShallow } from "zustand/react/shallow";
import {
    FiSearch, FiClock, FiCheckCircle, FiWifi, FiArrowRight,
    FiFileText, FiDownload, FiAlertTriangle, FiCopy, FiXCircle, FiInbox
} from "react-icons/fi";
import toast from "react-hot-toast";

const BayarUkt = () => {
    // 1. STATE MANAGEMENT ZUSTAND
    const { tagihanData, tunggakanData, activeVa, isLoading, isCreatingVa } = useTagihanStore(
        useShallow((state) => ({
            tagihanData: state.tagihanData,
            tunggakanData: state.tunggakanData,
            activeVa: state.activeVa,
            isLoading: state.isLoading,
            isCreatingVa: state.isCreatingVa,
        }))
    );
    const { kwitansiList, isLoadingKwitansi } = useKwitansiStore(
        useShallow((state) => ({
            kwitansiList: state.kwitansiList,
            isLoadingKwitansi: state.isLoadingKwitansi
        }))
    );

    const getKwitansi = useKwitansiStore((state) => state.getKwitansi);
    const getTagihan = useTagihanStore((state) => state.getTagihan);
    const getTunggakan = useTagihanStore((state) => state.getTunggakan);
    const cekVa = useTagihanStore((state) => state.cekVa);
    const createVaMdr = useTagihanStore((state) => state.createVaMdr);

    // 2. LOCAL STATE
    const [nimInput, setNimInput] = useState("");
    const [tagihanAmount, setTagihanAmount] = useState("");
    const [tunggakanAmount, setTunggakanAmount] = useState("");
    const [timeLeft, setTimeLeft] = useState<string>("");
    
    // STATE PENTING: Untuk mengatasi flash "Data Kosong" di awal
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const MASTER_NIM = ["22416255201247", "22416255201162"];

    const storedNim = useMemo(() => {
        try {
            const raw = localStorage.getItem("mhs");
            return raw ? JSON.parse(raw)?.id?.toString() ?? "" : "";
        } catch {
            return "";
        }
    }, []);

    const isMaster = MASTER_NIM.includes(storedNim);

    // 3. FETCH DATA LOGIC
    useEffect(() => {
        if (storedNim) {
            setNimInput(storedNim);
            const fetchData = async () => {
                setIsFirstLoad(true); 
                try {
                    await Promise.all([
                        getTagihan(storedNim),
                        getTunggakan(storedNim),
                        cekVa(storedNim),
                        getKwitansi(storedNim)
                    ]);
                } catch (error) {
                    console.error("Error fetching data:", error);
                    toast.error("Gagal memuat data.");
                } finally {
                    setIsFirstLoad(false); // Loading selesai
                }
            };
            fetchData();
        }
    }, [storedNim]);

    const handleFetch = (e: React.FormEvent) => {
        e.preventDefault();
        if (nimInput) {
            getTagihan(nimInput);
            getTunggakan(nimInput);
            cekVa(nimInput);
            getKwitansi(nimInput);
        }
    };

    // 4. TIMER COUNTDOWN VA
    useEffect(() => {
        if (!activeVa || !activeVa.datetime_expired) {
            setTimeLeft("");
            return;
        }
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const expireTime = new Date(activeVa.datetime_expired).getTime();
            const distance = expireTime - now;
            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft("EXPIRED");
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}j ${minutes}m ${seconds}d`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [activeVa]);

    // 5. PAYMENT HANDLERS
    const handlePaymentTagihan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tagihanData?.tagih?.tagih_nim) return;
        const cleanAmount = tagihanAmount.replace(/\D/g, "");
        createVaMdr({
            nim: tagihanData.tagih.tagih_nim.nim,
            periode: tagihanData.tagih.tagih_nim.periode,
            nominal: cleanAmount
        });
        setTagihanAmount("");
    };

    const handlePaymentTunggakan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tagihanData?.tagih?.tagih_nim) return;
        const cleanAmount = tunggakanAmount.replace(/\D/g, "");
        createVaMdr({
            nim: tagihanData.tagih.tagih_nim.nim,
            periode: "tunggakan",
            nominal: cleanAmount
        });
        setTunggakanAmount("");
    };

    // 6. UTILS
    const formatRupiah = (angka: string | number) => {
        const number = typeof angka === "string" ? parseFloat(angka) : angka;
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, setFunc: React.Dispatch<React.SetStateAction<string>>) => {
        const raw = e.target.value.replace(/\D/g, "");
        if (raw === "") setFunc("");
        else setFunc(formatRupiah(raw).replace("Rp", "").trim());
    };

    const overview = tagihanData?.tagih?.tagih_nim;
    const details = tagihanData?.tagih?.detail_tagihan;
    const tunggakan = tunggakanData?.tunggak?.tunggak_nim;
    const hasTunggakan = tunggakan && parseFloat(tunggakan.sisa_tunggakan.toString()) > 0;

    // Loading Global Page
    const isPageLoading = isLoading || isFirstLoad;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            <Topbar />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-8">
                {/* Header Page */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Pembayaran UKT</h1>
                        <p className="text-slate-500 text-sm">Kelola tagihan, tunggakan, dan riwayat pembayaran</p>
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
                                {isPageLoading ? "..." : <FiSearch />}
                            </button>
                        </form>
                    )}
                </div>

                {/* LOADING GLOBAL */}
                {isPageLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                        <span className="loading loading-spinner loading-lg text-blue-600"></span>
                        <p className="mt-4 text-slate-500 font-medium">Sedang memuat data...</p>
                    </div>
                ) : (
                    // KONTEN UTAMA (JIKA ADA DATA)
                    (overview && details && details.length > 0) ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in space-x-0 md:space-x-6">
                            {/* KOLOM KIRI: CARD & VA STATUS */}
                            <div className="lg:col-span-1 flex sm:flex-row md:flex-col flex-col items-center gap-4">
                                <div className="relative w-[350px] h-[200px] rounded-2xl overflow-hidden shadow-2xl group transition-transform hover:scale-[1.02] duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#003d79] via-[#0052a5] to-[#002b55]"></div>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

                                    <div className="absolute inset-0 p-6 flex flex-col justify-between text-white font-sans">
                                        <div className="flex justify-between items-start">
                                            <div className="w-11 h-8 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md border border-yellow-600/50 relative overflow-hidden shadow-sm">
                                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-yellow-800/40"></div>
                                                <div className="absolute top-0 left-1/3 w-[1px] h-full bg-yellow-800/40"></div>
                                                <div className="absolute top-0 right-1/3 w-[1px] h-full bg-yellow-800/40"></div>
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
                                                {overview.nim.replace(/(\d{4})(?=\d)/g, "$1 ")}
                                            </p>
                                            <div className="flex justify-center items-center gap-2 mt-2 ml-8">
                                                <span className="text-[6px] text-center leading-tight opacity-80">VALID<br />THRU</span>
                                                <span className="font-mono text-sm tracking-widest">12/30</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="uppercase font-medium text-xs sm:text-sm tracking-wider opacity-90 truncate max-w-[60%]">{overview.nama}</div>
                                            <div className="text-right">
                                                <p className="text-[8px] uppercase tracking-widest opacity-70 mb-0.5">Sisa Tagihan</p>
                                                <p className="font-bold text-lg sm:text-xl drop-shadow-md">{formatRupiah(overview.sisa_tagihan)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                                </div>

                                {activeVa && activeVa.status === "belum" ? (
                                    <div className="bg-white w-[350px] rounded-xl border-2 border-blue-200 shadow-md overflow-hidden relative">
                                        <div className="bg-orange-400 text-white px-4 py-2 text-sm font-bold flex justify-between items-center">
                                            <span className="flex items-center gap-2"><FiClock /> Menunggu Pembayaran</span>
                                            <span className="font-mono">{timeLeft}</span>
                                        </div>
                                        <div className="p-5 space-y-4">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Nomor Virtual Account</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xl font-bold text-slate-800 tracking-wider font-mono">{activeVa.virtual_account}</p>
                                                    <button onClick={() => { navigator.clipboard.writeText(activeVa.virtual_account); toast.success("VA Disalin"); }} className="btn btn-xs btn-circle btn-ghost text-blue-600">
                                                        <FiCopy />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                                                <div>
                                                    <p className="text-xs text-slate-500">Nominal</p>
                                                    <p className="text-lg font-bold text-orange-600">{activeVa.trx_amount}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-slate-400">Batas Waktu</p>
                                                    <p className="text-xs font-medium text-slate-700">
                                                        {new Date(activeVa.datetime_expired).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-sm">
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-slate-500">Periode Tagihan</span>
                                            <span className="font-bold text-slate-700">{overview.periode}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-slate-500">Status Akademik</span>
                                            <span className={`badge badge-sm ${overview.status_aktif === "Aktif" ? "badge-success text-white" : "badge-warning"}`}>{overview.status_aktif}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Total Tagihan Sem Ini</span>
                                            <span className="font-medium">{formatRupiah(overview.total_tagihan)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* KOLOM KANAN: RINCIAN & FORM BAYAR */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="space-y-4">
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                            <h3 className="font-bold text-slate-700 flex items-center gap-2"><FiClock className="text-blue-600" /> Rincian Cicilan</h3>
                                            <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">Periode {overview.periode}</span>
                                        </div>
                                        <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                                            {details.map((item, index) => {
                                                const isLunas = item.sisa_tagihan === "0";
                                                return (
                                                    <div key={index} className="p-4 hover:bg-slate-50 transition-colors flex flex-row items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${isLunas ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                                                                {isLunas ? <FiCheckCircle /> : <FiClock />}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-800 text-sm">Cicilan {item.cicilan.replace("C", "")}</p>
                                                                <p className="text-xs text-slate-500">{formatRupiah(item.total_tagihan)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                            {isLunas ? (
                                                                <span className="badge badge-success badge-sm text-white border-none">LUNAS</span>
                                                            ) : (
                                                                <span className="badge badge-ghost bg-slate-200 text-slate-500 badge-sm border-none">BELUM</span>
                                                            )}
                                                            <p className="text-[10px] text-slate-400 text-right">
                                                                {isLunas ? (item.last_payment ? new Date(item.last_payment).toLocaleDateString() : "Lunas") : (parseFloat(item.total_bayar) > 0 ? `Masuk: ${formatRupiah(item.total_bayar)}` : "-")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                                        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                                            <div className="w-1 h-6 bg-blue-600 rounded-full"></div> Bayar Tagihan Semester
                                        </h3>
                                        <form onSubmit={handlePaymentTagihan} className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-sm font-medium text-slate-600">Nominal Pembayaran</span>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="relative flex-1">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold z-10">Rp</span>
                                                    <input type="text" className="input input-bordered w-full pl-12 text-lg font-semibold text-slate-800 focus:border-blue-500 bg-slate-50 h-12" placeholder="0" value={tagihanAmount} onChange={(e) => handleAmountChange(e, setTagihanAmount)} />
                                                </div>
                                                <button type="submit" className={`btn btn-primary bg-blue-700 border-none text-white h-12 px-6 flex-shrink-0 ${!tagihanAmount || isLoading || isCreatingVa ? "btn-disabled opacity-50" : ""}`} disabled={isLoading || isCreatingVa}>
                                                    {isCreatingVa ? <span className="loading loading-spinner"></span> : <>Bayar <FiArrowRight className="hidden sm:inline" /></>}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {hasTunggakan && (
                                    <div className="space-y-4 pt-4 border-t-2 border-dashed border-slate-200">
                                        <div className="alert alert-warning bg-orange-50 border-orange-200 text-orange-800 flex items-start gap-3 shadow-sm rounded-xl">
                                            <FiAlertTriangle className="text-xl mt-1 flex-shrink-0" />
                                            <div className="w-full">
                                                <h3 className="font-bold text-lg">Tunggakan Sebelumnya</h3>
                                                <p className="text-sm mb-2">Anda memiliki sisa tunggakan dari semester lalu.</p>
                                                <div className="flex justify-between items-center bg-white/50 p-2 rounded-lg">
                                                    <span className="text-sm font-medium">Total Sisa Tunggakan:</span>
                                                    <span className="text-lg font-bold">{formatRupiah(tunggakan!.sisa_tunggakan)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-xl shadow-md border border-orange-200 p-6">
                                            <h3 className="font-bold text-lg text-orange-800 mb-4 flex items-center gap-2">
                                                <div className="w-1 h-6 bg-orange-500 rounded-full"></div> Bayar Tunggakan
                                            </h3>
                                            <form onSubmit={handlePaymentTunggakan} className="flex flex-col gap-2">
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-sm font-medium text-slate-600">Nominal Pelunasan Tunggakan</span>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="relative flex-1">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold z-10">Rp</span>
                                                        <input type="text" className="input input-bordered w-full pl-12 text-lg font-semibold text-slate-800 focus:border-orange-500 bg-orange-50/30 h-12" placeholder="0" value={tunggakanAmount} onChange={(e) => handleAmountChange(e, setTunggakanAmount)} />
                                                    </div>
                                                    <button type="submit" className={`btn btn-warning bg-orange-500 hover:bg-orange-600 border-none text-white h-12 px-6 flex-shrink-0 ${!tunggakanAmount || isLoading || isCreatingVa ? "btn-disabled opacity-50" : ""}`} disabled={isLoading || isCreatingVa}>
                                                        {isCreatingVa ? <span className="loading loading-spinner"></span> : <>Bayar <FiArrowRight className="hidden sm:inline" /></>}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null
                )}

                {/* BAGIAN RIWAYAT PEMBAYARAN - SUDAH DIPERBAIKI (Mobile Collapse + No Flash Empty) */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                    <div className="p-6 border-b border-slate-200">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <FiFileText className="text-blue-600" /> Riwayat Pembayaran
                        </h3>
                    </div>

                    {(isLoadingKwitansi || isPageLoading) ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <span className="loading loading-spinner loading-md mb-2"></span>
                            <span className="text-sm">Memuat riwayat...</span>
                        </div>
                    ) : (kwitansiList && kwitansiList.length > 0) ? (
                        <>
                            {/* TAMPILAN DESKTOP */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="table w-full">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
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
                                        {kwitansiList.map((item, index) => (
                                            <tr key={item.id_trx} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="py-3 pl-6 text-slate-400 font-mono">{index + 1}</td>
                                                <td className="py-3 font-medium text-slate-700">{new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                                                <td className="py-3 font-mono text-xs text-slate-600">{item.kwitansi}</td>
                                                <td className="py-3 text-center"><span className="badge badge-ghost bg-slate-100 text-slate-600">{item.periode}</span></td>
                                                <td className="py-3 font-semibold text-slate-800">{formatRupiah(item.jlminput)}</td>
                                                <td className="py-3 text-center"><span className={`badge ${item.status.toLowerCase() === 'valid' ? 'badge-success bg-green-100 text-green-700' : 'badge-error bg-red-100 text-red-700'} text-xs border-none`}>{item.status}</span></td>
                                                <td className="py-3 pr-6 text-center">
                                                    <button className="btn btn-xs btn-ghost text-blue-600 tooltip tooltip-left" data-tip="Download Kwitansi" onClick={() => window.open(`https://slik.ubpkarawang.ac.id/api/tagihan/download_kwitansi/${item.kwitansi}?preview=1`, "_blank")}>
                                                        <FiDownload />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* TAMPILAN MOBILE (COLLAPSE) */}
                            <div className="md:hidden flex flex-col divide-y divide-slate-100">
                                {kwitansiList.map((item) => {
                                    const isValid = item.status.toLowerCase() === 'valid';
                                    return (
                                        <div key={item.id_trx} className="collapse collapse-arrow bg-white rounded-none">
                                            <input type="checkbox" className="peer" />
                                            <div className="collapse-title pr-10 flex justify-between items-center py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-mono text-xs text-slate-500 tracking-wide">{item.kwitansi}</span>
                                                    <span className="font-bold text-slate-800">{formatRupiah(item.jlminput)}</span>
                                                </div>
                                                <div className="flex-shrink-0 mr-2">
                                                    {isValid ? <FiCheckCircle className="text-2xl text-green-500" /> : <FiXCircle className="text-2xl text-red-500" />}
                                                </div>
                                            </div>
                                            <div className="collapse-content text-sm space-y-3 pb-4">
                                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-400">Tanggal</span>
                                                        <span className="font-medium text-slate-700">{new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-400">Periode</span>
                                                        <span className="font-medium text-slate-700">{item.periode}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-400 mb-1">Status</span>
                                                    <div className="flex items-center justify-between">
                                                        <span className={`badge ${isValid ? 'badge-success bg-green-100 text-green-700' : 'badge-error bg-red-100 text-red-700'} text-xs border-none`}>{item.status}</span>
                                                        <button className="btn btn-sm btn-outline btn-primary gap-2" onClick={() => window.open(`https://slik.ubpkarawang.ac.id/api/tagihan/download_kwitansi/${item.kwitansi}?preview=1`, "_blank")}>
                                                            <FiDownload /> Download
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <FiInbox className="text-4xl mb-2 opacity-50" />
                            <p className="italic">Belum ada riwayat pembayaran.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
            <style>{`.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default BayarUkt;