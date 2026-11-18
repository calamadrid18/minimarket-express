import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

// Envuelve páginas que necesitan sesión. Si no hay sesión, manda al login.
const RutaPrivada = ({ children }) => {
  const { estaLogueado } = useAuth()

  if (!estaLogueado) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default RutaPrivada
