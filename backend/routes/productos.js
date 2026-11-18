const express = require("express")
const verificarToken = require("../middlewares/verificarToken")
const {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require("../controllers/productosController")

const router = express.Router()

// Pública: cualquier cliente puede ver el catálogo
router.get("/productos", listarProductos)

// Privadas: solo el admin (con token) puede cambiar productos
router.post("/productos", verificarToken, crearProducto)
router.put("/productos/:id", verificarToken, actualizarProducto)
router.delete("/productos/:id", verificarToken, eliminarProducto)

module.exports = router
