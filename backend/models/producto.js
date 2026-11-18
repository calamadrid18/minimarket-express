const mongoose = require("mongoose")

// Las categorías que existen en la tienda (deben coincidir con CATEGORIAS en tienda/script.js)
const CATEGORIAS = ["despensa", "refrigerados", "snacks", "higiene"]

const productoSchema = new mongoose.Schema(
  {
    // Código del producto (como en cualquier inventario). La tienda lo usa como id.
    codigo: {
      type: Number,
      required: [true, "El código es obligatorio"],
      unique: true, // no puede haber dos productos con el mismo código
      min: [1, "El código debe ser mayor que 0"],
    },
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      maxlength: [80, "El nombre no puede tener más de 80 letras"],
    },
    variante: {
      type: String, // ej: "Cartón de 12 unidades"
      trim: true,
      default: "",
    },
    precio: {
      type: Number, // en colones, sin decimales
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },
    categoria: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      enum: { values: CATEGORIAS, message: "La categoría no es válida" }, // solo acepta las de la lista
    },
    stock: {
      type: Number, // unidades disponibles (0 = "Agotado")
      default: 0,
      min: [0, "El stock no puede ser negativo"],
      validate: { validator: Number.isInteger, message: "El stock debe ser un número entero" },
    },
    badge: { type: String, default: null }, // etiqueta opcional: "Oferta", "Popular"...
    emoji: { type: String, default: "" },
    img: { type: String, default: "" }, // ruta de la foto, ej: "fotos/leche.jpg"
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automáticamente
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v
        return ret
      },
    },
  }
)

const Producto = mongoose.model("Producto", productoSchema)

module.exports = Producto
