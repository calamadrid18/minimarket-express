import { useState } from "react"
import { CATEGORIAS } from "../categorias"

// Formulario para crear un producto nuevo o editar uno que ya existe.
// - producto: el producto a editar, o null si es nuevo
// - alGuardar(datos): lo llama al enviar el formulario
// - alCancelar(): cierra el formulario
const FormularioProducto = ({ producto, alGuardar, alCancelar }) => {
  const esNuevo = !producto

  // Un solo estado con todos los campos (si es nuevo, empiezan vacíos)
  const [campos, setCampos] = useState({
    nombre: producto?.nombre || "",
    variante: producto?.variante || "",
    precio: producto?.precio ?? "",
    stock: producto?.stock ?? 0,
    categoria: producto?.categoria || CATEGORIAS[0].id,
    badge: producto?.badge || "",
    emoji: producto?.emoji || "",
    img: producto?.img || "",
  })
  const [error, setError] = useState("")
  const [guardando, setGuardando] = useState(false)

  // Una sola función para todos los inputs: usa el "name" del input
  const cambiar = (e) => {
    setCampos({ ...campos, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setGuardando(true)
    try {
      // Los inputs devuelven texto: convertimos los números y vaciamos el badge si no hay
      await alGuardar({
        ...campos,
        precio: Number(campos.precio),
        stock: Number(campos.stock),
        badge: campos.badge.trim() || null,
      })
    } catch (err) {
      setError(err.message) // ej: "El precio no puede ser negativo"
      setGuardando(false)
    }
  }

  return (
    <form className="tarjeta formulario-producto" onSubmit={handleSubmit}>
      <h2>{esNuevo ? "Nuevo producto" : `Editar: ${producto.nombre}`}</h2>

      <div className="campos">
        <label className="ancho">
          Nombre *
          <input name="nombre" value={campos.nombre} onChange={cambiar} maxLength={80} required />
        </label>
        <label className="ancho">
          Presentación
          <input name="variante" value={campos.variante} onChange={cambiar} placeholder="Ej. Botella 1,5 litros" />
        </label>
        <label>
          Precio (₡) *
          <input name="precio" type="number" min="0" step="1" value={campos.precio} onChange={cambiar} required />
        </label>
        <label>
          Stock (unidades)
          <input name="stock" type="number" min="0" step="1" value={campos.stock} onChange={cambiar} required />
        </label>
        <label className="ancho">
          Categoría *
          <select name="categoria" value={campos.categoria} onChange={cambiar}>
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </label>
        <label>
          Etiqueta
          <input name="badge" value={campos.badge} onChange={cambiar} placeholder="Ej. Oferta" />
        </label>
        <label>
          Emoji
          <input name="emoji" value={campos.emoji} onChange={cambiar} placeholder="Ej. 🥛" />
        </label>
        <label className="ancho">
          Foto (ruta en la tienda)
          <input name="img" value={campos.img} onChange={cambiar} placeholder="Ej. fotos/leche.jpg" />
        </label>
      </div>

      {error && <p className="mensaje error">{error}</p>}

      <div className="acciones">
        <button type="button" className="boton secundario" onClick={alCancelar}>
          Cancelar
        </button>
        <button type="submit" className="boton" disabled={guardando}>
          {guardando ? "Guardando..." : esNuevo ? "Crear producto" : "Guardar cambios"}
        </button>
      </div>
    </form>
  )
}

export default FormularioProducto
