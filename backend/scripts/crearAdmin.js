// Crea la cuenta del administrador (o le cambia la contraseña si ya existe).
// No hay página de registro: así nadie más puede volverse administrador.
//
// Uso con Docker:
//   docker compose exec api npm run crear-admin -- tu@correo.com TuContraseñaSegura
// Uso sin Docker:
//   npm run crear-admin -- tu@correo.com TuContraseñaSegura

require("dotenv").config()
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const Admin = require("../models/admin")

const crear = async () => {
  const [email, password] = process.argv.slice(2)

  if (!email || !password) {
    console.error("Uso: npm run crear-admin -- tu@correo.com TuContraseñaSegura")
    process.exit(1)
  }
  if (password.length < 8) {
    console.error("La contraseña debe tener al menos 8 caracteres")
    process.exit(1)
  }
  if (!process.env.MONGODB_URI) {
    console.error("Falta la variable de entorno MONGODB_URI")
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)

  const passwordEncriptada = await bcrypt.hash(password, 10)
  const emailLimpio = email.toLowerCase().trim()

  // Si ya existe, le cambia la contraseña; si no, lo crea
  const existe = await Admin.findOne({ email: emailLimpio })
  if (existe) {
    existe.password = passwordEncriptada
    await existe.save()
    console.log(`Listo: se cambió la contraseña de ${emailLimpio}`)
  } else {
    await Admin.create({ email: emailLimpio, password: passwordEncriptada })
    console.log(`Listo: administrador ${emailLimpio} creado`)
  }

  await mongoose.disconnect()
}

crear().catch(async (error) => {
  console.error("Error creando el administrador:", error.message)
  await mongoose.disconnect()
  process.exit(1)
})
