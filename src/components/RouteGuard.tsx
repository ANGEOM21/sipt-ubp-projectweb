import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import type { JSX } from "react"

interface Props {
  children: JSX.Element
  protected?: boolean
  guestOnly?: boolean
}

const RouteGuard = ({ children, protected: isProtected, guestOnly }: Props) => {
  const { authUser } = useAuthStore()

  if (isProtected && !authUser) {
    return <Navigate to="/login" replace />
  }

  if (guestOnly && authUser) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RouteGuard
