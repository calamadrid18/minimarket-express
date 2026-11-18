const express = require("express")
const { login, verMiCuenta } = require("../controllers/authController")
const verificarToken = require("../middlewares/verificarToken")

const router = express.Router()

// Pública: el admin entra con su email y contraseña (no hay registro público)
router.post("/login", login)

// Privada: datos del admin que tiene la sesión
router.get("/yo", verificarToken, verMiCuenta)

module.exports = router
