const express = require("express")
const cors = require("cors")
const authRoutes = require("./routes/auth")
const productosRoutes = require("./routes/productos")
const { rutaNoEncontrada, manejarErrores } = require("./middlewares/manejarErrores")

const app = express()

// Páginas que pueden usar esta API. Se separan con comas en FRONTEND_URL.
// Ej: "http://localhost:5500,https://minimarket.netlify.app"
const origenesPermitidos = (process.env.FRONTEND_URL || "http://localhost:5500")
  .split(",")
  .map((url) => url.trim())

// 1. Middlewares globales (se ejecutan en TODAS las peticiones)
app.use(cors({ origin: origenesPermitidos }))
app.use(express.json())

// 2. Rutas
app.get("/", (req, res) => {
  res.send("API del Minimarket Express funcionando!")
})
app.use(authRoutes)
app.use(productosRoutes)

// 3. Si ninguna ruta coincidió -> 404
app.use(rutaNoEncontrada)

// 4. Manejo de errores (siempre al final)
app.use(manejarErrores)

module.exports = app
