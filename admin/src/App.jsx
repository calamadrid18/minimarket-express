import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import RutaPrivada from "./componentes/RutaPrivada"
import Login from "./paginas/Login"
import Productos from "./paginas/Productos"

function App() {
  return (
    // AuthProvider comparte la sesión con toda la app
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<Login />} />

          {/* Privada: necesita sesión de admin */}
          <Route path="/" element={<RutaPrivada><Productos /></RutaPrivada>} />

          {/* Cualquier otra ruta -> inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
