const mongoose = require("mongoose")

// El administrador de la tienda. No hay registro público:
// se crea con el script "npm run crear-admin".
const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "El email no es válido"],
    },
    password: {
      type: String, // siempre encriptada con bcrypt
      required: [true, "La contraseña es obligatoria"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Nunca se manda la contraseña en las respuestas
      transform: (doc, ret) => {
        delete ret.password
        delete ret.__v
        return ret
      },
    },
  }
)

const Admin = mongoose.model("Admin", adminSchema)

module.exports = Admin
