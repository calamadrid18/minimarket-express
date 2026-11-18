const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Admin = require("../models/admin")
const crearError = require("../utils/crearError")

// POST /login -> si el email y la contraseña son correctos, devuelve un token
const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw crearError(400, "Email y contraseña son obligatorios")
  }

  // String(...) evita que manden un objeto como { "$gt": "" } (inyección NoSQL)
  const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() })

  // Mismo mensaje en los dos casos: así no revelamos qué emails existen
  const passwordCorrecta = admin && (await bcrypt.compare(String(password), admin.password))
  if (!passwordCorrecta) {
    throw crearError(401, "Email o contraseña incorrectos")
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1d" })
  res.json({ mensaje: "Login exitoso!", token })
}

// GET /yo -> los datos del admin dueño del token (sirve para saber si el token sigue siendo válido)
const verMiCuenta = async (req, res) => {
  const admin = await Admin.findById(req.adminId)
  if (!admin) {
    throw crearError(401, "La cuenta ya no existe")
  }
  res.json(admin)
}

module.exports = { login, verMiCuenta }
