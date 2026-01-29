import { Navigate, Route, Routes } from "react-router-dom"
import Login from "@/pages/Auth/Login"
import Home from "@/pages/Home"
import { useAuthStore } from "@/store/useAuthStore"
import { useEffect } from "react"
import toast from "react-hot-toast"
import NilaiMahasiswa from "@/pages/NilaiMahasiswa"
import Profile from "@/pages/Profile"
import NotFoundPage from "@/pages/NotFoundPage"
import MahasiswaKurikulum from "./pages/MahasiswaKurikulum"
import AktivitasPerkuliahan from "./pages/AktivitasPerkuliahan"
import BayarUkt from "./pages/BayarUkt"

const App = () => {
  const { authUser, checkAuth } = useAuthStore()

  useEffect(() => {
    const runCheck = async () => {
      try {
        if (checkAuth) await checkAuth(true);
      } catch (error: unknown) {
        if (error instanceof Error) toast.error("Gagal cek auth" + error.message);
      }
    };

    runCheck();
  }, [checkAuth]);
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/nilai-mhs"
        element={authUser ? <NilaiMahasiswa /> : <Navigate to="/login" />}
      />
      <Route
        path="/profile"
        element={authUser ? <Profile /> : <Navigate to="/login" />}
      />
      <Route
        path="/mahasiswa/kurikulum"
        element={authUser ? <MahasiswaKurikulum /> : <Navigate to="/login" />}
      />
      <Route
        path="/aktivitas-perkuliahan"
        element={authUser ? <AktivitasPerkuliahan /> : <Navigate to="/login" />}
      />
      <Route
        path="/bayar-ukt-mahasiswa"
        element={authUser ? <BayarUkt /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={!authUser ? <Login /> : <Navigate to="/" />}
      />
      {/* Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
