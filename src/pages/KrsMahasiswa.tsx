import { useEffect, useState, useMemo } from "react";
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useKrsStore, type MataKuliah, type KrsSelection } from "@/store/useKrsStore";

const MASTER_NIM = ["22416255201247", "22416255201162"];

const KrsMahasiswa = () => {
  const { authUser } = useAuthStore();
  const { krsData, isLoading, isSubmitting, getKrsData, ajukanKrs } = useKrsStore();

  const storedNim: any = authUser?.id || "";
  const [currentNim, setCurrentNim] = useState(storedNim);
  const isMaster = MASTER_NIM.includes(storedNim);

  const [selections, setSelections] = useState<Record<string, "ambil" | "ulang">>({});

  useEffect(() => {
    if (storedNim) {
      getKrsData(storedNim);
    }
  }, [storedNim, getKrsData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNim) return toast.error("NIM kosong");
    setSelections({}); 
    getKrsData(currentNim);
  };

  const groupedData = useMemo(() => {
    const groups: Record<string, MataKuliah[]> = {};
    krsData.forEach((item) => {
      const sem = item.semester || "Lainnya";
      if (!groups[sem]) groups[sem] = [];
      groups[sem].push(item);
    });
    return Object.keys(groups)
      .sort((a, b) => Number(a) - Number(b))
      .reduce((obj, key) => {
        obj[key] = groups[key];
        return obj;
      }, {} as Record<string, MataKuliah[]>);
  }, [krsData]);

  const toggleSelection = (id: string, type: "ambil" | "ulang") => {
    setSelections((prev) => {
      const current = prev[id];
      const newSelections = { ...prev };

      if (current === type) {
        delete newSelections[id];
      } else {
        newSelections[id] = type;
      }
      return newSelections;
    });
  };

  const handleSubmit = () => {
    const payload: KrsSelection[] = Object.entries(selections).map(([id, tipe]) => ({
      id_matkul: id,
      tipe: tipe,
    }));
    
    if (payload.length === 0) {
      toast.error("Belum ada mata kuliah yang dipilih");
      return;
    }

    ajukanKrs(currentNim, payload).then(() => {
        setSelections({}); 
    });
  };

  const renderStatus = (status: string | null) => {
    switch (status) {
      case "0":
        return <div className="badge badge-warning gap-1 text-xs">Menunggu</div>;
      case "1":
        return <div className="badge badge-error text-white gap-1 text-xs">Ditolak</div>;
      case "2":
        return <div className="badge badge-success text-white gap-1 text-xs">Disetujui</div>;
      default:
        return null; 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Topbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-grow pb-24 relative z-20 space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Tambah KRS</h1>
            <p className="text-slate-500 text-sm mt-1">Pilih mata kuliah yang akan diambil semester ini</p>
          </div>
          
          {isMaster && (
            <div className="join w-full md:w-auto shadow-sm">
              <input 
                type="text" 
                placeholder="Cari NIM..." 
                className="input input-bordered input-sm join-item w-full md:w-48 bg-white focus:outline-none"
                value={currentNim}
                onChange={(e) => setCurrentNim(e.target.value)}
              />
              <button onClick={handleSearch} className="btn btn-primary btn-sm join-item text-white border-primary" disabled={isLoading}>
                Cari
              </button>
            </div>
          )}
        </div>

        <div className="animate-fade-in delay-100 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="h-40 bg-slate-200 rounded-xl animate-pulse"></div>
               ))}
            </div>
          ) : krsData.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-xl border border-dashed border-slate-300">
               <p className="text-slate-500">Data Mata Kuliah tidak ditemukan.</p>
            </div>
          ) : (
            Object.entries(groupedData).map(([semester, items]) => (
              <div key={semester} className="card bg-white shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-6 py-3 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-700">Semester {semester}</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead className="text-slate-500 bg-slate-50 text-xs uppercase font-semibold">
                      <tr>
                        <th className="w-1/2 min-w-[200px]">Mata Kuliah</th>
                        <th className="text-center w-20">SKS</th>
                        <th className="text-center w-40">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {items.map((mk) => {
                        const isAvailable = mk.status_acc === null;
                        const isSelectedAmbil = selections[mk.id_matkul] === "ambil";
                        const isSelectedUlang = selections[mk.id_matkul] === "ulang";

                        return (
                          <tr key={mk.id_matkul} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4">
                              <div className="font-bold text-slate-700">{mk.nama_mata_kuliah}</div>
                              <div className="text-xs text-slate-400 mt-1">{mk.kode_matkul}</div>
                            </td>

                            <td className="text-center font-medium text-slate-600">
                              {mk.sks_mata_kuliah}
                            </td>

                            <td className="text-center">
                              {isAvailable ? (
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                  <label className="cursor-pointer label p-0 gap-2">
                                    <input 
                                      type="checkbox" 
                                      className="checkbox checkbox-primary checkbox-sm"
                                      checked={isSelectedAmbil}
                                      onChange={() => toggleSelection(mk.id_matkul, "ambil")}
                                    />
                                    <span className={`label-text text-xs ${isSelectedAmbil ? 'font-bold text-primary' : ''}`}>Ambil</span>
                                  </label>

                                  <label className="cursor-pointer label p-0 gap-2">
                                    <input 
                                      type="checkbox" 
                                      className="checkbox checkbox-secondary checkbox-sm"
                                      checked={isSelectedUlang}
                                      onChange={() => toggleSelection(mk.id_matkul, "ulang")}
                                    />
                                    <span className={`label-text text-xs ${isSelectedUlang ? 'font-bold text-secondary' : ''}`}>Ulang</span>
                                  </label>
                                </div>
                              ) : (
                                renderStatus(mk.status_acc)
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>

      </main>

      {Object.keys(selections).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 animate-slide-up">
          <div className="container mx-auto flex justify-between items-center px-4 sm:px-6">
            <div>
              <p className="text-sm font-semibold text-slate-600">
                {Object.keys(selections).length} Mata Kuliah Dipilih
              </p>
              <p className="text-xs text-slate-400">Pastikan pilihan sudah benar sebelum mengajukan.</p>
            </div>
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="btn btn-primary text-white px-8"
            >
              {isSubmitting ? <span className="loading loading-spinner"></span> : "Ajukan KRS"}
            </button>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default KrsMahasiswa;