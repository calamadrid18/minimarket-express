const jwt = require("jsonwebtoken")

// Revisa que la petición traiga un token válido de administrador.
// Si es válido, guarda el ID del admin en req.adminId y deja pasar.
const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1] // "Bearer TOKEN" -> "TOKEN"

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado, falta el token" })
  }

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET)
    req.adminId = datos.id
    next()
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado" })
  }
}

module.exports = verificarToken
