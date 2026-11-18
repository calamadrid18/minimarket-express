// Carga los productos iniciales en la base de datos.
// Son los mismos que antes estaban escritos en tienda/script.js.
//
// Uso con Docker:  docker compose exec api npm run cargar-productos
// Uso sin Docker:  npm run cargar-productos
//
// ⚠️ BORRA todos los productos que haya y los vuelve a crear.
// Úsalo solo para empezar; después los productos se manejan desde el panel.

require("dotenv").config()
const mongoose = require("mongoose")
const Producto = require("../models/producto")

// ✅ = precio confirmado   ⚠️ = precio estimado, falta confirmar
const productos = [
  // HUEVOS, LÁCTEOS Y EMBUTIDOS
  { codigo: 1,  nombre: "Huevo Jumbo Don Cristóbal", variante: "Cartón de 12 unidades", precio: 1600, categoria: "refrigerados", badge: "Popular", stock: 20, emoji: "🥚", img: "fotos/huevos-12.jpg" }, // ✅
  { codigo: 2,  nombre: "Huevos x30", variante: "Cartón de 30 unidades", precio: 4200, categoria: "refrigerados", badge: "Ahorro", stock: 10, emoji: "🥚", img: "fotos/huevos-36.jpg" }, // ⚠️
  { codigo: 3,  nombre: "Leche Delactomy Dos Pinos", variante: "Deslactosada descremada 946 ml", precio: 1000, categoria: "refrigerados", badge: null, stock: 20, emoji: "🥛", img: "fotos/leche.jpg" }, // ✅
  { codigo: 4,  nombre: "Jamón de pavo Cinta Azul Light", variante: "Extra delgado · 1 libra (454 g)", precio: 3500, categoria: "refrigerados", badge: null, stock: 15, emoji: "🍖", img: "fotos/jamon.jpg" }, // ⚠️
  { codigo: 5,  nombre: "Queso mozzarella Monteverde", variante: "Rallado 227 g", precio: 1950, categoria: "refrigerados", badge: null, stock: 15, emoji: "🧀", img: "fotos/queso-mozzarella.jpg" }, // ✅
  { codigo: 6,  nombre: "Salchicha de pavo Cinta Azul", variante: "Ahumada · 480 g", precio: 1700, categoria: "refrigerados", badge: null, stock: 15, emoji: "🌭", img: "fotos/salchichas.jpg" }, // ✅

  // DESPENSA
  { codigo: 9,  nombre: "Arroz Sabemás 99% grano entero", variante: "Bolsa 1,8 kg", precio: 1600, categoria: "despensa", badge: null, stock: 20, emoji: "🍚", img: "fotos/arroz.jpg" }, // ⚠️
  { codigo: 10, nombre: "Aceite vegetal En Su Punto", variante: "Botella 1,5 litros", precio: 2200, categoria: "despensa", badge: null, stock: 15, emoji: "🫒", img: "fotos/aceite.jpg" }, // ⚠️
  { codigo: 11, nombre: "Harina PAN", variante: "Harina de maíz 1 kg", precio: 1300, categoria: "despensa", badge: null, stock: 15, emoji: "🌽", img: "fotos/harina-pan.jpg" }, // ⚠️
  { codigo: 12, nombre: "Atún Calvo trozos en agua", variante: "4 latas · 420 g", precio: 2300, categoria: "despensa", badge: "Pack", stock: 20, emoji: "🐟", img: "fotos/atun.jpg" }, // ✅
  { codigo: 13, nombre: "Azúcar Doña María", variante: "Blanco de plantación · 2 kg", precio: 1500, categoria: "despensa", badge: null, stock: 20, emoji: "🍬", img: "fotos/azucar.jpg" }, // ⚠️
  { codigo: 14, nombre: "Sal Refisal Alta Pureza", variante: "Bolsa 500 g", precio: 400, categoria: "despensa", badge: null, stock: 20, emoji: "🧂", img: "fotos/sal.jpg" }, // ⚠️

  // SNACKS Y BEBIDAS
  { codigo: 15, nombre: "Papas Lay's Clásicas", variante: "Bolsa 184,2 g", precio: 2430, categoria: "snacks", badge: null, stock: 20, emoji: "🍟", img: "fotos/papitas.jpg" }, // ✅
  { codigo: 16, nombre: "Coca-Cola Sin Azúcar", variante: "Botella 1,5 litros", precio: 1230, categoria: "snacks", badge: null, stock: 20, emoji: "🥤", img: "fotos/gaseosas.jpg" }, // ✅

  // HIGIENE Y LIMPIEZA
  { codigo: 17, nombre: "Cepillo Oral-B 7 Beneficios", variante: "Suave · 2 unidades", precio: 2900, categoria: "higiene", badge: null, stock: 15, emoji: "🪥", img: "fotos/cepillo-dientes.jpg" }, // ✅
  { codigo: 18, nombre: "Crema dental Colgate Total", variante: "Limpieza interdental · 150 ml", precio: 3000, categoria: "higiene", badge: null, stock: 15, emoji: "🦷", img: "fotos/crema-dental.jpg" }, // ✅
  { codigo: 19, nombre: "Cloro Clorox", variante: "Fragancia original 946 ml", precio: 690, categoria: "higiene", badge: null, stock: 15, emoji: "🧴", img: "fotos/cloro.jpg" }, // ✅
  { codigo: 20, nombre: "Detergente", variante: "Bolsa 1 kg", precio: 2000, categoria: "higiene", badge: null, stock: 15, emoji: "🧺", img: "fotos/detergente.jpg" }, // ⚠️
  { codigo: 21, nombre: "Papel higiénico Scott 2en1", variante: "Doble hoja · 4 rollos jumbo", precio: 1800, categoria: "higiene", badge: null, stock: 15, emoji: "🧻", img: "fotos/papel-higienico.jpg" }, // ⚠️
]

const cargar = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("Falta la variable de entorno MONGODB_URI")
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  await Producto.deleteMany({}) // borra todo lo anterior
  const creados = await Producto.insertMany(productos) // aplica las validaciones del modelo
  console.log(`Listo: ${creados.length} productos cargados`)
  await mongoose.disconnect()
}

cargar().catch(async (error) => {
  console.error("Error cargando productos:", error.message)
  await mongoose.disconnect()
  process.exit(1)
})
