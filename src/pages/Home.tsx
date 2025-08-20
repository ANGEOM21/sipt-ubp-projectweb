import { useEffect } from "react";
import Topbar from "@/components/Topbar";
import { useHomeStore } from "@/store/useHomeStore";
import { format } from "date-fns";
import { FiCalendar, FiExternalLink, FiInfo } from "react-icons/fi";
import Footer from "@/components/Footer";
import { Banner } from "@/components/Banner";

const Home = () => {
  const { infoAkademik, getInfoAkademik } = useHomeStore();

  useEffect(() => {
    getInfoAkademik();
  }, [getInfoAkademik]);

  return (
    <div className="min-h-screen bg-base-100">
      <Topbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Welcome Section */}
        <section className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
            Selamat Datang
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Portal Akademik Terpadu
          </p>
        </section>

        {/* Banner Carousel */}
              {/* // src={`${import.meta.env.VITE_API_URL}/banner`} */}
        <Banner image={`${import.meta.env.VITE_API_URL}/banner`} />

        {/* Academic Info Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <FiInfo className="text-2xl text-primary" />
            <h2 className="text-2xl font-semibold">Informasi Akademik</h2>
          </div>

          {infoAkademik?.data?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {infoAkademik.data.map((item) => (
                <div
                  key={item.id}
                  className="card bg-base-200 hover:bg-base-300 transition-all duration-300 shadow hover:shadow-lg"
                >
                  <div className="card-body">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="card-title line-clamp-1">{item.file_name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <FiCalendar size={14} />
                          {format(new Date(item.created_at), "dd MMM yyyy, HH:mm")}
                        </div>
                      </div>
                      <a
                        href={item.file_path.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary btn-square"
                        title="Download"
                      >
                        <FiExternalLink size={18} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-info shadow-lg">
              <div>
                <FiInfo />
                <span>Tidak ada informasi akademik tersedia saat ini.</span>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;