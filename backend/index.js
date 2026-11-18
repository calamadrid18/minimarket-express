require("dotenv").config()
const app = require("./app")
const conectarDB = require("./config/db")

const PORT = process.env.PORT || 3002

// Sin estas variables el servidor no puede funcionar
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error("Faltan variables de entorno: MONGODB_URI y/o JWT_SECRET (revisa tu .env)")
  process.exit(1)
}

// Primero conecta la base de datos y después enciende el servidor
conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
  })
})
