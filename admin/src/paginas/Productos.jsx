import { useState, useEffect } from "react"
import { pedir } from "../api"
import { useAuth } from "../context/AuthContext"
import FormularioProducto from "../componentes/FormularioProducto"
import { nombreCategoria, formatoPrecio, STOCK_BAJO } from "../categorias"

const Productos = () => {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")
  const [aviso, setAviso] = useState("")
  const [busqueda, setBusqueda] = useState("")
  // null = formulario cerrado · "nuevo" = crear · un producto = editar ese
  const [editando, setEditando] = useState(null)
  const { logout } = useAuth()

  // Al abrir la página, pide los productos al backend
  useEffect(() => {
    pedir("/productos")
      .then(setProductos)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  // Muestra un mensaje verde por unos segundos
  const avisar = (texto) => {
    setAviso(texto)
    setTimeout(() => setAviso(""), 2500)
  }

  // Reemplaza un producto de la lista por su versión nueva (la que devolvió el backend)
  const reemplazar = (actualizado) =>
    setProductos((lista) => lista.map((p) => (p._id === actualizado._id ? actualizado : p)))

  // Crear o editar, según lo que haya en "editando"
  const guardar = async (datos) => {
    if (editando === "nuevo") {
      const respuesta = await pedir("/productos", { method: "POST", body: datos })
      setProductos((lista) => [...lista, respuesta.producto])
      avisar("Producto creado")
    } else {
      const respuesta = await pedir(`/productos/${editando._id}`, { method: "PUT", body: datos })
      reemplazar(respuesta.producto)
      avisar("Cambios guardados")
    }
    setEditando(null)
  }

  // Botones rápidos + / − del stock
  const cambiarStock = async (producto, cambio) => {
    const nuevo = producto.stock + cambio
    if (nuevo < 0) return
    try {
      const respuesta = await pedir(`/productos/${producto._id}`, { method: "PUT", body: { stock: nuevo } })
      reemplazar(respuesta.producto)
    } catch (err) {
      setError(err.message)
    }
  }

  const eliminar = async (producto) => {
    if (!window.confirm(`¿Borrar "${producto.nombre}"? Desaparece de la tienda y no se puede deshacer.`)) return
    try {
      await pedir(`/productos/${producto._id}`, { method: "DELETE" })
      setProductos((lista) => lista.filter((p) => p._id !== producto._id))
      avisar("Producto eliminado")
    } catch (err) {
      setError(err.message)
    }
  }

  // La lista que se ve: filtrada por la búsqueda
  const texto = busqueda.toLowerCase().trim()
  const visibles = productos.filter(
    (p) => !texto || p.nombre.toLowerCase().includes(texto) || p.variante.toLowerCase().includes(texto)
  )
  const agotados = productos.filter((p) => p.stock === 0).length
  const pocos = productos.filter((p) => p.stock > 0 && p.stock <= STOCK_BAJO).length

  return (
    <>
      <header className="barra">
        <div className="marca">
          <span className="logo chico">M</span> Panel · Minimarket Express
        </div>
        <button className="boton secundario" onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      <main className="contenedor">
        <div className="titulo-fila">
          <div>
            <h1>Productos ({productos.length})</h1>
            {!cargando && (agotados > 0 || pocos > 0) && (
              <p className="alerta-stock">
                {agotados > 0 && <span>🔴 {agotados} agotado{agotados > 1 && "s"}</span>}
                {pocos > 0 && <span>🟠 {pocos} con poco stock</span>}
              </p>
            )}
          </div>
          {!editando && (
            <button className="boton" onClick={() => setEditando("nuevo")}>
              + Nuevo producto
            </button>
          )}
        </div>

        {aviso && <p className="mensaje exito">{aviso}</p>}
        {error && <p className="mensaje error">{error}</p>}

        {editando && (
          <FormularioProducto
            // "key" hace que el formulario empiece de cero al cambiar de producto
            key={editando === "nuevo" ? "nuevo" : editando._id}
            producto={editando === "nuevo" ? null : editando}
            alGuardar={guardar}
            alCancelar={() => setEditando(null)}
          />
        )}

        <input
          type="search"
          className="buscador"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {cargando ? (
          <p>Cargando...</p>
        ) : (
          <ul className="lista-productos">
            {visibles.map((p) => (
              <li key={p._id} className={`tarjeta fila-producto ${p.stock === 0 ? "agotado" : ""}`}>
                <span className="emoji">{p.emoji || "📦"}</span>

                <div className="info">
                  <strong>{p.nombre}</strong>
                  <small>
                    {p.variante} · {nombreCategoria(p.categoria)} · #{p.codigo}
                  </small>
                  <span className="precio">
                    {formatoPrecio(p.precio)}
                    {p.badge && <span className="badge">{p.badge}</span>}
                  </span>
                </div>

                <div className="stock">
                  <small>Stock</small>
                  <div className="stock-controles">
                    <button onClick={() => cambiarStock(p, -1)} disabled={p.stock === 0} aria-label="Restar uno">
                      −
                    </button>
                    <span className={p.stock === 0 ? "rojo" : p.stock <= STOCK_BAJO ? "naranja" : ""}>
                      {p.stock}
                    </span>
                    <button onClick={() => cambiarStock(p, 1)} aria-label="Sumar uno">
                      +
                    </button>
                  </div>
                </div>

                <div className="botones-fila">
                  <button className="boton secundario chico" onClick={() => setEditando(p)}>
                    Editar
                  </button>
                  <button className="boton peligro chico" onClick={() => eliminar(p)}>
                    Borrar
                  </button>
                </div>
              </li>
            ))}
            {visibles.length === 0 && <p className="suave">No hay productos con ese nombre.</p>}
          </ul>
        )}
      </main>
    </>
  )
}

export default Productos
