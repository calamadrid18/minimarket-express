const Producto = require("../models/producto")
const crearError = require("../utils/crearError")

// Nota: en Express 5, si una función async lanza un error,
// Express lo manda solo al middleware manejarErrores. Por eso no hay try/catch.

// Lista blanca: los ÚNICOS campos que se pueden crear o cambiar desde el panel.
// Si alguien manda otros campos (ej: "_id" o "createdAt"), se ignoran.
const CAMPOS_PERMITIDOS = ["nombre", "variante", "precio", "categoria", "stock", "badge", "emoji", "img"]

const tomarCamposPermitidos = (body) => {
  const datos = {}
  CAMPOS_PERMITIDOS.forEach((campo) => {
    if (body[campo] !== undefined) datos[campo] = body[campo]
  })
  return datos
}

// GET /productos -> todos los productos, ordenados por código (público)
const listarProductos = async (req, res) => {
  const productos = await Producto.find().sort({ codigo: 1 })
  res.json(productos)
}

// POST /productos -> crear producto (solo admin)
const crearProducto = async (req, res) => {
  const datos = tomarCamposPermitidos(req.body)

  // El código se pone solo: el más alto que exista + 1
  const ultimo = await Producto.findOne().sort({ codigo: -1 })
  datos.codigo = ultimo ? ultimo.codigo + 1 : 1

  const nuevoProducto = await Producto.create(datos)
  res.status(201).json({ mensaje: "Producto creado!", producto: nuevoProducto })
}

// PUT /productos/:id -> editar producto (solo admin)
const actualizarProducto = async (req, res) => {
  const cambios = tomarCamposPermitidos(req.body)

  const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, cambios, {
    new: true, // devuelve el producto ya actualizado
    runValidators: true, // aplica las reglas del modelo también al editar
  })

  if (!productoActualizado) {
    throw crearError(404, "Producto no encontrado")
  }

  res.json({ mensaje: "Producto actualizado!", producto: productoActualizado })
}

// DELETE /productos/:id -> borrar producto (solo admin)
const eliminarProducto = async (req, res) => {
  const productoEliminado = await Producto.findByIdAndDelete(req.params.id)
  if (!productoEliminado) {
    throw crearError(404, "Producto no encontrado")
  }
  res.json({ mensaje: "Producto eliminado!" })
}

module.exports = { listarProductos, crearProducto, actualizarProducto, eliminarProducto }
