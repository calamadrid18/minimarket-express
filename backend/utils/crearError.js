// Crea un error con código de estado HTTP.
// Ejemplo: throw crearError(404, "Producto no encontrado")
// El middleware manejarErrores lo atrapa y responde al cliente.
const crearError = (status, mensaje) => {
  const error = new Error(mensaje)
  error.status = status
  return error
}

module.exports = crearError
