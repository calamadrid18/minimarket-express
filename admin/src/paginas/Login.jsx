import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [enviando, setEnviando] = useState(false)
  const { estaLogueado, login } = useAuth()
  const navigate = useNavigate()

  // Si ya tiene sesión, va directo al panel
  if (estaLogueado) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setEnviando(true)
    try {
      await login(email, password)
      navigate("/")
    } catch (err) {
      setError(err.message) // "Email o contraseña incorrectos"
      setEnviando(false)
    }
  }

  return (
    <main className="pantalla-login">
      <div className="tarjeta formulario-login">
        <div className="logo">M</div>
        <h1>Panel de administración</h1>
        <p className="suave">Minimarket Express</p>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="mensaje error">{error}</p>}
          <button type="submit" className="boton" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  )
}

export default Login
