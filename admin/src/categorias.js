// Las mismas categorías del backend (models/producto.js) y de la tienda
export const CATEGORIAS = [
  { id: "despensa", nombre: "Despensa" },
  { id: "refrigerados", nombre: "Huevos, lácteos y embutidos" },
  { id: "snacks", nombre: "Snacks y bebidas" },
  { id: "higiene", nombre: "Higiene y limpieza" },
]

export const nombreCategoria = (id) => CATEGORIAS.find((c) => c.id === id)?.nombre || id

// Colones con separador de miles: ₡1.950
export const formatoPrecio = (n) => `₡${Math.round(n).toLocaleString("es-CR").replace(/\s/g, ".")}`

// Igual que en la tienda: desde este número se avisa "¡Últimas unidades!"
export const STOCK_BAJO = 3
