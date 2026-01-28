import { useEffect } from "react";
import Topbar from "@/components/Topbar";
import { useHomeStore } from "@/store/useHomeStore";
import { format } from "date-fns";
import { FiCalendar, FiInfo, FiFileText, FiArrowRight } from "react-icons/fi";
import Footer from "@/components/Footer";
import { Banner } from "@/components/Banner";

const Home = () => {
  const { infoAkademik, getInfoAkademik } = useHomeStore();

  useEffect(() => {
    getInfoAkademik();
  }, [getInfoAkademik]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Topbar />


      <main className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 flex-grow pb-12 relative z-20 space-y-12">
        
        <div className="rounded-2xl shadow-xl overflow-hidden border border-slate-100 bg-white p-2">
           <div className="rounded-xl overflow-hidden">
             <Banner image={`${import.meta.env.VITE_API_URL}/banner`} />
           </div>
        </div>

        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <FiInfo className="text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Informasi Akademik</h2>
                <p className="text-sm text-slate-500">Pengumuman dan dokumen terbaru</p>
              </div>
            </div>
            {(infoAkademik?.data?.length ?? 0) > 0 && (
              <span className="badge badge-primary badge-outline font-semibold">
                {infoAkademik?.data?.length ?? 0} Info
              </span>
            )}
          </div>

          {infoAkademik?.data?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {infoAkademik.data.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div className="p-5 flex-grow space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <FiFileText size={24} />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <FiCalendar size={12} />
                        {item.created_at ? format(new Date(item.created_at), "dd MMM yyyy") : '-'}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {item.file_name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                        Klik tombol di bawah untuk melihat detail atau mengunduh dokumen ini.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <a
                      href={item.file_path.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-100 hover:text-blue-700 gap-2 group-hover:translate-x-1 transition-transform"
                      title="Buka Dokumen"
                    >
                      Buka Dokumen <FiArrowRight />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State yang lebih estetik
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
              <div className="p-4 bg-slate-50 rounded-full mb-3">
                <FiInfo className="text-4xl text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Belum Ada Informasi</h3>
              <p className="text-slate-500 max-w-sm mt-1">
                Saat ini belum ada pengumuman atau informasi akademik baru yang ditampilkan.
              </p>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;