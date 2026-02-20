import Home from "@/pages/Home"
import Login from "@/pages/Auth/Login"
import NilaiMahasiswa from "@/pages/NilaiMahasiswa"
import Profile from "@/pages/Profile"
import MahasiswaKurikulum from "@/pages/MahasiswaKurikulum"
import AktivitasPerkuliahan from "@/pages/AktivitasPerkuliahan"
import BayarUkt from "@/pages/BayarUkt"
import PerwalianMahasiswa from "@/pages/PerwalianMahasiswa"
import KrsMahasiswa from "@/pages/KrsMahasiswa"
import NotFoundPage from "@/pages/NotFoundPage"
import type { JSX } from "react"


export interface AppRoute {
  path: string
  element: JSX.Element
  protected?: boolean
  guestOnly?: boolean
}

const routes: AppRoute[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
    guestOnly: true,
  },
  {
    path: "/nilai-mhs",
    element: <NilaiMahasiswa />,
    protected: true,
  },
  {
    path: "/profile",
    element: <Profile />,
    protected: true,
  },
  {
    path: "/mahasiswa/kurikulum",
    element: <MahasiswaKurikulum />,
    protected: true,
  },
  {
    path: "/aktivitas-perkuliahan",
    element: <AktivitasPerkuliahan />,
    protected: true,
  },
  {
    path: "/bayar-ukt-mahasiswa",
    element: <BayarUkt />,
    protected: true,
  },
  {
    path: "/krs-mahasiswa",
    element: <KrsMahasiswa />,
    protected: true,
  },
  {
    path: "/perwalian-mahasiswa",
    element: <PerwalianMahasiswa />,
    protected: true,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]

export default routes
