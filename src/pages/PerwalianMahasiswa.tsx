import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { usePerwalianStore, type PerwalianItem } from "@/store/usePerwalianStore";

// Master NIM List
const MASTER_NIM = ["22416255201247", "22416255201162"];

const PerwalianMahasiswa = () => {
  const { authUser } = useAuthStore();
  // Ambil function 'uploadFile' yang sudah kita buat di store
  const { perwalianData, isLoading, isUploading, getPerwalian, uploadFile } = usePerwalianStore();

  const storedNim: any = authUser?.id || "";
  const [currentNim, setCurrentNim] = useState(storedNim);
  const isMaster = MASTER_NIM.includes(storedNim);

  // Initial Load
  useEffect(() => {
    if (storedNim) {
      getPerwalian(storedNim);
    }
  }, [storedNim, getPerwalian]);

  // Handle Search for Master
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNim) return toast.error("NIM kosong");
    getPerwalian(currentNim);
  };

  // Handle File Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, item: PerwalianItem, type: "krs" | "khs") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran file (Contoh: 2MB)
    if (file.size > 2 * 1024 * 1024) { 
       toast.error("Ukuran file maksimal 2MB");
       e.target.value = ""; 
       return;
    }

    // Panggil fungsi uploadFile yang sudah pintar memilih endpoint di store
    uploadFile(currentNim, item.periode, type, file).then(() => {
       // Reset input value agar bisa upload ulang file yang sama jika gagal sebelumnya
       e.target.value = ""; 
    });
  };

  // Helper: Format Periode
  const formatPeriode = (p: string) => {
    if (!p || p.length < 5) return p;
    const year = p.substring(0, 4);
    const sem = p.substring(4) === "1" ? "Ganjil" : p.substring(4) === "2" ? "Genap" : "Pendek";
    return `${year} / ${sem}`;
  };

  // Helper: Cek apakah file sudah diupload
  const isUploaded = (path: string | null, status: string | null) => {
    return path || status === "uploaded";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Topbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-grow pb-12 relative z-20 space-y-8">
        
        {/* Header & Search Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Perwalian Mahasiswa</h1>
            <p className="text-slate-500 text-sm mt-1">Kelola data KRS dan KHS per semester</p>
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

        {/* Content Section */}
        <div className="animate-fade-in delay-100">
          {isLoading ? (
             // Loading Skeleton (Grid View)
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                   <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
                ))}
             </div>
          ) : perwalianData.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-slate-300">
              <div className="text-slate-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">Tidak ada data perwalian ditemukan</p>
            </div>
          ) : (
            // CARD GRID VIEW
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {perwalianData.map((item, idx) => (
                <div key={idx} className="card bg-white shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 overflow-hidden group">
                  
                  {/* Card Header: Periode */}
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-bold text-slate-700 text-lg">{formatPeriode(item.periode)}</span>
                    </div>
                  </div>

                  <div className="card-body p-6 gap-5">
                    
                    {/* Dosen Wali Info */}
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 bg-blue-50 rounded-full text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Dosen Wali</p>
                        <p className="font-medium text-slate-700 text-sm line-clamp-2">
                          {item.dosen_wali || <span className="text-slate-400 italic">Belum ditentukan</span>}
                        </p>
                      </div>
                    </div>

                    <div className="divider my-0"></div>

                    {/* Section: KRS */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                           KRS
                        </span>
                        {isUploaded(item.krs_file_path, item.krs_upload_status) ? (
                          <div className="badge badge-success text-white badge-sm gap-1 pl-1 pr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Uploaded
                          </div>
                        ) : (
                          <div className="badge badge-error badge-outline badge-sm">Belum</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input 
                          type="file" 
                          disabled={isUploading}
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, item, "krs")}
                          className="file-input file-input-bordered file-input-primary file-input-xs w-full bg-slate-50"
                        />
                        {item.krs_file_path && (
                          <a href={item.krs_file_path} target="_blank" rel="noreferrer" className="btn btn-square btn-xs btn-outline btn-primary" title="Lihat File">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Section: KHS */}
                    <div className="space-y-3">
                       <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                           KST
                        </span>
                        {isUploaded(item.khs_file_path, item.khs_upload_status) ? (
                          <div className="badge badge-success text-white badge-sm gap-1 pl-1 pr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Uploaded
                          </div>
                        ) : (
                          <div className="badge badge-error badge-outline badge-sm">Belum</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input 
                          type="file" 
                          disabled={isUploading}
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, item, "khs")}
                          className="file-input file-input-bordered file-input-secondary file-input-xs w-full bg-slate-50"
                        />
                        {item.khs_file_path && (
                          <a href={item.khs_file_path} target="_blank" rel="noreferrer" className="btn btn-square btn-xs btn-outline btn-secondary" title="Lihat File">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </a>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default PerwalianMahasiswa;