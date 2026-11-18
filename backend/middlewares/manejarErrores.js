// Ruta que no existe -> 404
const rutaNoEncontrada = (req, res) => {
  res.status(404).json({ error: `La ruta ${req.method} ${req.originalUrl} no existe` })
}

// Middleware de errores: Express llega aquí cuando algo falla en cualquier ruta.
// Tiene 4 parámetros (err, req, res, next); así Express sabe que es de errores.
const manejarErrores = (err, req, res, next) => {
  // El body no es un JSON válido
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El JSON enviado no es válido" })
  }

  // Errores que lanzamos nosotros con crearError(status, mensaje)
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message })
  }

  // Validaciones del modelo (precio negativo, categoría inválida...)
  if (err.name === "ValidationError") {
    const primerError = Object.values(err.errors)[0].message
    return res.status(400).json({ error: primerError })
  }

  // ID con formato inválido (ej: /productos/abc)
  if (err.name === "CastError") {
    return res.status(400).json({ error: "El ID no es válido" })
  }

  // Valor repetido (índice unique de MongoDB, ej: el mismo código de producto)
  if (err.code === 11000) {
    return res.status(409).json({ error: "Ya existe un registro con ese valor" })
  }

  // Cualquier otro error: lo mostramos en consola y respondemos 500
  console.error(err)
  res.status(500).json({ error: "Error interno del servidor" })
}

module.exports = { rutaNoEncontrada, manejarErrores }
