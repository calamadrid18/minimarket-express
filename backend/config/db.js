const mongoose = require("mongoose")

// Conecta a MongoDB. Si falla, apaga el servidor (Docker lo vuelve a intentar)
const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Conectado a MongoDB!")
  } catch (error) {
    console.error("No se pudo conectar a MongoDB:", error.message)
    process.exit(1)
  }
}

module.exports = conectarDB
