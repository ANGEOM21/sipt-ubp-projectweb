import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import toast from "react-hot-toast"
import { useAuthStore } from "@/store/useAuthStore"

import RouteGuard from "@/components/RouteGuard"
import routes from "./route"

const App = () => {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    const runCheck = async () => {
      try {
        await checkAuth(true)
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error("Gagal cek auth: " + error.message)
        }
      }
    }

    runCheck()
  }, [checkAuth])

  return (
    <Routes>
      {routes.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          element={
            <RouteGuard
              protected={route.protected}
              guestOnly={route.guestOnly}
            >
              {route.element}
            </RouteGuard>
          }
        />
      ))}
    </Routes>
  )
}

export default App
