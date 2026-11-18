/* =========================================================
   CONFIGURACIÓN (edita aquí)
   ========================================================= */

// Número de WhatsApp con código de país, sin "+" ni espacios
const NUMERO_WHATSAPP = "50660111975";

// Nombre de la tienda (aparece en el mensaje de WhatsApp)
const NOMBRE_TIENDA = "MINIMARKET EXPRESS";

// Símbolo de moneda
const MONEDA = "₡";

// Horario de atención en formato 24h (15 = 3 p.m., 21 = 9 p.m.).
// Puedes poner varios turnos. Pon HORARIO = null para mostrar siempre "Abierto".
const HORARIO = [
  { abre: 9, cierra: 14 },  // 9:00 a.m. a 2:00 p.m.
  { abre: 15, cierra: 21 }  // 3:00 p.m. a 9:00 p.m.
];

// Avisar "¡Últimas unidades!" cuando el stock sea igual o menor a este número
const STOCK_BAJO = 3;

// Dirección del backend (la API). Los productos ya NO están escritos aquí:
// se piden a la API, que los saca de la base de datos.
// En tu PC usa localhost; en internet, la dirección de Render.
const API_URL = ["localhost", "127.0.0.1"].includes(location.hostname)
  ? "http://localhost:3002"
  : "https://TU-BACKEND.onrender.com"; // ← la cambiamos cuando hagamos el deploy

// CATEGORÍAS (en este orden aparecen en la página)
// - iconos: figuritas 3D de la carpeta fotos/iconos (la del medio sale más grande)
// - color: color pastel de fondo de la tarjeta
const ICONOS_TODOS = { color: "#d1fae5", iconos: ["bread", "shopping_cart", "egg"] };
const CATEGORIAS = [
  { id: "despensa",     nombre: "Despensa",                    color: "#fee2e2", iconos: ["salt", "cooked_rice", "canned_food"] },
  { id: "refrigerados", nombre: "Huevos, lácteos y embutidos", corto: "Huevos y lácteos", color: "#fef3c7", iconos: ["egg", "glass_of_milk", "cheese_wedge"] },
  { id: "snacks",       nombre: "Snacks y bebidas",            color: "#fce7f3", iconos: ["cup_with_straw", "popcorn", "french_fries"] },
  { id: "higiene",      nombre: "Higiene y limpieza",          color: "#dbeafe", iconos: ["toothbrush", "roll_of_paper", "lotion_bottle"] }
];

// CRÉDITOS DE LAS FOTOS (Wikimedia Commons). Las licencias piden mencionar al autor.
const CREDITOS_FOTOS = [
  ["Figuritas de categorías", "Microsoft Fluent Emoji", "MIT", "https://github.com/microsoft/fluentui-emoji"],
  ["Harina PAN", "Emmanuel Sosa", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Harina_PAN_hecha_en_USA.jpg"],
  ["Detergente", "Lebacno", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Plastic_spoon_n_Laundry_detergent_n_Washing_powder_in_white.jpg"]
];

/* =========================================================
   ESTADO
   ========================================================= */
const CLAVE_CARRITO = "mercadito_carrito";
const CLAVE_CLIENTE = "mercadito_cliente";

let productos = []; // llegan de la API al abrir la página
let carrito = {};    // { idProducto: cantidad } (se carga después de los productos)
let categoriaActual = "todos";
let busquedaActual = "";

const $ = (id) => document.getElementById(id);
const catalogo = $("catalogo");
const cartBar = $("cart-bar");
const modal = $("modal-cart");
const listaCarrito = $("cart-items-list");
const inputBusqueda = $("input-search");
const btnLimpiar = $("search-clear");
const form = $("checkout-form");

/* =========================================================
   UTILIDADES
   ========================================================= */
// Colones sin decimales y con separador de miles: ₡1.950
const formatoPrecio = (n) =>
  `${MONEDA}${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

// Quita acentos para que "limon" encuentre "Limón"
const normalizar = (txt) =>
  txt.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

// Evita que textos con < > rompan el HTML
const escaparHTML = (txt) =>
  String(txt).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const buscarProducto = (id) => productos.find((p) => p.id === Number(id));

const icono = (nombre) => `<svg aria-hidden="true"><use href="#i-${nombre}"/></svg>`;

function leerStorage(clave) {
  try { return JSON.parse(localStorage.getItem(clave)); } catch { return null; }
}
function guardarStorage(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* modo privado */ }
}

// Recupera el carrito guardado y descarta productos que ya no existen o se agotaron
function cargarCarrito() {
  const guardado = leerStorage(CLAVE_CARRITO) || {};
  const limpio = {};
  Object.entries(guardado).forEach(([id, cant]) => {
    const p = productos.find((prod) => prod.id === Number(id));
    if (p && p.stock > 0 && cant > 0) limpio[id] = Math.min(cant, p.stock);
  });
  return limpio;
}

function calcularTotales() {
  let items = 0;
  let total = 0;
  Object.entries(carrito).forEach(([id, cant]) => {
    const p = buscarProducto(id);
    if (!p) return;
    items += cant;
    total += p.precio * cant;
  });
  return { items, total };
}

let toastTimer;
function mostrarAviso(mensaje) {
  const toast = $("toast");
  toast.textContent = mensaje;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function vibrar() {
  if (navigator.vibrate) navigator.vibrate(12);
}

/* =========================================================
   CATÁLOGO
   ========================================================= */
function htmlSelector(p, qty) {
  if (p.stock <= 0) {
    return `<button type="button" class="btn-add" disabled>Agotado</button>`;
  }
  if (qty === 0) {
    return `<button type="button" class="btn-add" data-accion="sumar" data-id="${p.id}" aria-label="Agregar ${escaparHTML(p.nombre)}">
              ${icono("plus")} Agregar
            </button>`;
  }
  return `
    <div class="qty-controls">
      <button type="button" class="btn-qty" data-accion="restar" data-id="${p.id}" aria-label="Quitar uno">${icono(qty === 1 ? "trash" : "minus")}</button>
      <span class="qty-num" aria-live="polite">${qty}</span>
      <button type="button" class="btn-qty" data-accion="sumar" data-id="${p.id}" aria-label="Agregar uno" ${qty >= p.stock ? "disabled" : ""}>${icono("plus")}</button>
    </div>`;
}

function renderProductos() {
  const busqueda = normalizar(busquedaActual);

  const filtrados = productos.filter((p) => {
    const cumpleCat = categoriaActual === "todos" || p.categoria === categoriaActual;
    const cumpleBusqueda = !busqueda ||
      normalizar(p.nombre).includes(busqueda) ||
      normalizar(p.variante).includes(busqueda);
    return cumpleCat && cumpleBusqueda;
  });

  const cat = CATEGORIAS.find((c) => c.id === categoriaActual);
  const cantidad = filtrados.length === 1 ? "1 producto" : `${filtrados.length} productos`;
  $("results-info").textContent = busqueda
    ? `${cantidad} para "${busquedaActual.trim()}"`
    : cat ? `${cat.nombre} · ${cantidad}` : cantidad;

  if (filtrados.length === 0) {
    catalogo.innerHTML = `
      <div class="empty-state">
        ${icono("search")}
        <strong>No encontramos productos</strong>
        <p>Prueba con otra palabra o cambia de categoría.</p>
      </div>`;
    return;
  }

  // En "Todos" sin búsqueda: productos agrupados por categoría con su título
  if (categoriaActual === "todos" && !busqueda) {
    catalogo.innerHTML = CATEGORIAS.map((c) => {
      const delGrupo = filtrados.filter((p) => p.categoria === c.id);
      if (!delGrupo.length) return "";
      return `
        <section class="cat-section">
          <div class="section-head">
            <h2>${escaparHTML(c.nombre)}</h2>
            <button type="button" class="link-btn" data-cat="${c.id}">Ver todo ${icono("chevron")}</button>
          </div>
          <div class="grid-productos">${delGrupo.map(htmlCard).join("")}</div>
        </section>`;
    }).join("");
    return;
  }

  catalogo.innerHTML = `<div class="grid-productos">${filtrados.map(htmlCard).join("")}</div>`;
}

function htmlCard(p) {
    const qty = carrito[p.id] || 0;
    const agotado = p.stock <= 0;
    const pocas = !agotado && p.stock <= STOCK_BAJO;

    return `
      <article class="card-producto ${agotado ? "is-out" : ""}">
        <div class="card-img-wrapper">
          <span class="img-fallback">${p.emoji ? `<span class="emoji" aria-hidden="true">${p.emoji}</span>` : icono("bag")}</span>
          ${p.img ? `<img src="${escaparHTML(p.img)}" alt="${escaparHTML(p.nombre)}" loading="lazy" decoding="async"
               width="300" height="300" onerror="this.remove()">` : ""}
          ${p.badge && !agotado ? `<span class="badge-tag">${escaparHTML(p.badge)}</span>` : ""}
        </div>
        <div class="info-producto">
          <h3>${escaparHTML(p.nombre)}</h3>
          <div class="variante">${escaparHTML(p.variante)}</div>
        </div>
        <div class="card-action">
          <div>
            <span class="precio">${formatoPrecio(p.precio)}</span>
            ${pocas ? `<span class="stock-low">¡Últimas ${p.stock}!</span>` : ""}
          </div>
          ${htmlSelector(p, qty)}
        </div>
      </article>`;
}

/* =========================================================
   CATEGORÍAS
   Se generan desde la lista CATEGORIAS: botones del menú fijo y tarjetas con foto.
   ========================================================= */
function renderCategorias() {
  const contar = (id) => productos.filter((p) => p.categoria === id).length;

  $("categories-nav").innerHTML =
    `<button type="button" class="cat-btn active" data-cat="todos" aria-pressed="true">Todos</button>` +
    CATEGORIAS.map((c) =>
      `<button type="button" class="cat-btn" data-cat="${c.id}" aria-pressed="false">${escaparHTML(c.nombre)}</button>`
    ).join("");

  // Tres figuritas 3D por tarjeta
  const figuritas = (lista) =>
    `<span class="cat-tile-art" aria-hidden="true">${lista.map((n, i) =>
      `<img class="fig fig-${i}" src="fotos/iconos/${n}.png" alt="" loading="lazy" onerror="this.remove()">`
    ).join("")}</span>`;

  const tarjeta = (id, nombre, cantidad, estilo, activa = false) => `
    <button type="button" class="cat-tile ${activa ? "active" : ""}" data-cat="${id}" style="--tile-bg:${estilo.color}">
      ${figuritas(estilo.iconos)}
      <span class="cat-tile-text"><strong>${escaparHTML(nombre)}</strong><small>${cantidad} productos</small></span>
    </button>`;

  $("cat-grid").innerHTML =
    tarjeta("todos", "Todos", productos.length, ICONOS_TODOS, true) +
    CATEGORIAS.map((c) => tarjeta(c.id, c.corto || c.nombre, contar(c.id), c)).join("");
}

function seleccionarCategoria(cat, desplazar = false) {
  categoriaActual = cat;
  document.querySelectorAll("[data-cat]").forEach((el) => {
    const activo = el.dataset.cat === cat;
    el.classList.toggle("active", activo);
    if (el.classList.contains("cat-btn")) el.setAttribute("aria-pressed", activo);
  });
  const chip = document.querySelector(`.cat-btn[data-cat="${cat}"]`);
  if (chip) chip.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  renderProductos();
  if (desplazar) $("results-info").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* =========================================================
   CARRITO
   ========================================================= */
function cambiarCantidad(id, cambio) {
  const p = buscarProducto(id);
  if (!p) return;

  const nueva = (carrito[id] || 0) + cambio;

  if (nueva > p.stock) {
    mostrarAviso(`Solo quedan ${p.stock} unidades disponibles`);
    return;
  }

  if (nueva <= 0) delete carrito[id];
  else carrito[id] = nueva;

  if (cambio > 0) vibrar();
  guardarStorage(CLAVE_CARRITO, carrito);

  renderProductos();
  actualizarBarraFlotante(cambio > 0);
  if (!modal.classList.contains("hidden")) renderCarrito();
}

function actualizarBarraFlotante(animar = false) {
  const { items, total } = calcularTotales();

  if (items > 0) {
    $("cart-count").textContent = items;
    $("cart-total").textContent = formatoPrecio(total);
    cartBar.classList.remove("hidden");
    if (animar) {
      cartBar.classList.remove("bump");
      void cartBar.offsetWidth; // reinicia la animación
      cartBar.classList.add("bump");
    }
  } else {
    cartBar.classList.add("hidden");
  }
}

function renderCarrito() {
  const ids = Object.keys(carrito);

  // Si se vació el carrito desde el modal, se cierra
  if (ids.length === 0) {
    cerrarModal();
    return;
  }

  listaCarrito.innerHTML = ids.map((id) => {
    const p = buscarProducto(id);
    const cant = carrito[id];
    return `
      <li class="cart-item-row">
        ${p.img
          ? `<img src="${escaparHTML(p.img)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">`
          : `<span class="cart-thumb" aria-hidden="true">${p.emoji || ""}</span>`}
        <div class="cart-item-info">
          <strong>${escaparHTML(p.nombre)}</strong>
          <span>${formatoPrecio(p.precio * cant)}</span>
        </div>
        <div class="qty-controls">
          <button type="button" class="btn-qty" data-accion="restar" data-id="${p.id}" aria-label="Quitar uno">${icono(cant === 1 ? "trash" : "minus")}</button>
          <span class="qty-num">${cant}</span>
          <button type="button" class="btn-qty" data-accion="sumar" data-id="${p.id}" aria-label="Agregar uno" ${cant >= p.stock ? "disabled" : ""}>${icono("plus")}</button>
        </div>
      </li>`;
  }).join("");

  $("modal-total-price").textContent = formatoPrecio(calcularTotales().total);
}

/* =========================================================
   MODAL
   El botón "atrás" de Android cierra el modal en vez de salir de la página.
   ========================================================= */
function abrirModal() {
  if (Object.keys(carrito).length === 0) return;
  renderCarrito();
  modal.classList.remove("hidden");
  document.body.classList.add("no-scroll");
  history.pushState({ modal: true }, "");
}

function ocultarModal() {
  modal.classList.add("hidden");
  document.body.classList.remove("no-scroll");
}

function cerrarModal() {
  if (history.state && history.state.modal) history.back(); // dispara popstate
  else ocultarModal();
}

window.addEventListener("popstate", ocultarModal);

/* =========================================================
   FORMULARIO Y WHATSAPP
   ========================================================= */
const camposCliente = ["cliente-nombre", "cliente-torre", "cliente-apto"];

function cargarDatosCliente() {
  const datos = leerStorage(CLAVE_CLIENTE);
  if (!datos) return;
  camposCliente.forEach((campo) => { if (datos[campo]) $(campo).value = datos[campo]; });
  ["entrega", "pago"].forEach((grupo) => {
    const radio = form.querySelector(`input[name="${grupo}"][value="${CSS.escape(datos[grupo] || "")}"]`);
    if (radio) radio.checked = true;
  });
}

function guardarDatosCliente() {
  const datos = {};
  camposCliente.forEach((campo) => { datos[campo] = $(campo).value.trim(); });
  datos.entrega = form.querySelector('input[name="entrega"]:checked').value;
  datos.pago = form.querySelector('input[name="pago"]:checked').value;
  guardarStorage(CLAVE_CLIENTE, datos);
}

function validarFormulario() {
  let primerError = null;
  camposCliente.forEach((campo) => {
    const input = $(campo);
    const vacio = !input.value.trim();
    input.classList.toggle("invalid", vacio);
    if (vacio && !primerError) primerError = input;
  });
  if (primerError) {
    primerError.focus();
    primerError.scrollIntoView({ behavior: "smooth", block: "center" });
    mostrarAviso("Completa los datos de entrega");
    return false;
  }
  return true;
}

function enviarPedidoWhatsApp(e) {
  e.preventDefault();
  if (!validarFormulario()) return;

  const nombre = $("cliente-nombre").value.trim();
  const torre = $("cliente-torre").value.trim();
  const apto = $("cliente-apto").value.trim();
  const entrega = form.querySelector('input[name="entrega"]:checked').value;
  const pago = form.querySelector('input[name="pago"]:checked').value;
  const notas = $("cliente-notas").value.trim();

  guardarDatosCliente();

  const linea = "━━━━━━━━━━━━━━━━━━━━";
  let msg = `🛒 *NUEVO PEDIDO - ${NOMBRE_TIENDA}*\n${linea}\n`;
  msg += `👤 *Cliente:* ${nombre}\n`;
  msg += `🏢 *Ubicación:* ${torre} - Apto ${apto}\n`;
  msg += `🚚 *Entrega:* ${entrega}\n`;
  msg += `💳 *Pago:* ${pago}\n`;
  if (notas) msg += `📝 *Nota:* ${notas}\n`;
  msg += `${linea}\n📋 *DETALLE DEL PEDIDO:*\n`;

  Object.entries(carrito).forEach(([id, cant]) => {
    const p = buscarProducto(id);
    msg += `• ${cant}x ${p.nombre} (${formatoPrecio(p.precio * cant)})\n`;
  });

  msg += `${linea}\n💰 *TOTAL A PAGAR:* ${formatoPrecio(calcularTotales().total)}`;

  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(msg)}`;

  // En celulares se abre directo la app; si el navegador bloquea la ventana, se usa la misma pestaña
  const esMovil = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (esMovil) {
    window.location.href = url;
  } else {
    const ventana = window.open(url, "_blank", "noopener");
    if (!ventana) window.location.href = url;
  }

  mostrarAviso("Abriendo WhatsApp…");
}

/* =========================================================
   HORARIO
   ========================================================= */
// Convierte 15 en "3:00 p.m."
const formatoHora = (h) => `${h % 12 || 12}:00 ${h < 12 ? "a.m." : "p.m."}`;

function actualizarEstadoTienda() {
  if (!HORARIO) return;
  const ahora = new Date();
  const hora = ahora.getHours() + ahora.getMinutes() / 60;

  const turnoActual = HORARIO.find((t) => hora >= t.abre && hora < t.cierra);
  let texto;

  if (turnoActual) {
    texto = `Abierto · hasta ${formatoHora(turnoActual.cierra)}`;
  } else {
    const siguiente = HORARIO.find((t) => t.abre > hora);
    texto = siguiente
      ? `Cerrado · abre ${formatoHora(siguiente.abre)}`
      : `Cerrado · abre mañana ${formatoHora(HORARIO[0].abre)}`;
  }

  $("estado-tienda").textContent = texto;
  document.querySelector(".dot-live").classList.toggle("closed", !turnoActual);
}

// Revisa el horario cada minuto por si la página queda abierta
setInterval(actualizarEstadoTienda, 60000);

/* =========================================================
   EVENTOS
   ========================================================= */

// Botones + / - (catálogo y modal) con un solo listener
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-accion]");
  if (!btn || btn.disabled) return;
  cambiarCantidad(btn.dataset.id, btn.dataset.accion === "sumar" ? 1 : -1);
});

// Categorías: menú fijo, tarjetas con foto y botones "Ver todo"
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cat]");
  if (!btn) return;
  const desdeMenu = btn.classList.contains("cat-btn");
  seleccionarCategoria(btn.dataset.cat, !desdeMenu);
});

// Flechas del carrusel de categorías
const navCats = $("categories-nav");

function actualizarFlechas() {
  const max = navCats.scrollWidth - navCats.clientWidth;
  $("chips-prev").classList.toggle("oculta", navCats.scrollLeft <= 4);
  $("chips-next").classList.toggle("oculta", navCats.scrollLeft >= max - 4);
}

$("chips-prev").addEventListener("click", () => navCats.scrollBy({ left: -navCats.clientWidth * 0.7 }));
$("chips-next").addEventListener("click", () => navCats.scrollBy({ left: navCats.clientWidth * 0.7 }));
navCats.addEventListener("scroll", actualizarFlechas, { passive: true });
window.addEventListener("resize", actualizarFlechas);

// Búsqueda
inputBusqueda.addEventListener("input", () => {
  busquedaActual = inputBusqueda.value;
  btnLimpiar.classList.toggle("hidden", !busquedaActual);
  renderProductos();
});

inputBusqueda.addEventListener("keydown", (e) => {
  if (e.key === "Enter") inputBusqueda.blur(); // cierra el teclado del celular
});

btnLimpiar.addEventListener("click", (e) => {
  e.preventDefault();
  inputBusqueda.value = "";
  busquedaActual = "";
  btnLimpiar.classList.add("hidden");
  renderProductos();
  inputBusqueda.focus();
});

// Modal
cartBar.addEventListener("click", abrirModal);
modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) cerrarModal(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) cerrarModal();
});

// Formulario
form.addEventListener("submit", enviarPedidoWhatsApp);
camposCliente.forEach((campo) => {
  $(campo).addEventListener("input", (e) => e.target.classList.remove("invalid"));
});

/* =========================================================
   INICIO
   ========================================================= */
function renderCreditos() {
  $("creditos-lista").innerHTML = CREDITOS_FOTOS.map(([producto, autor, licencia, url]) =>
    `<li>${escaparHTML(producto)}: <a href="${escaparHTML(url)}" target="_blank" rel="noopener">${escaparHTML(autor)}</a>, ${escaparHTML(licencia)}</li>`
  ).join("");
}

// Pide los productos a la API
async function cargarProductos() {
  const respuesta = await fetch(`${API_URL}/productos`);
  if (!respuesta.ok) throw new Error(`La API respondió con error ${respuesta.status}`);
  const datos = await respuesta.json();
  // El carrito usa "id" para cada producto: usamos el código del producto
  return datos.map((p) => ({ ...p, id: p.codigo }));
}

async function iniciar() {
  cargarDatosCliente();
  actualizarEstadoTienda();
  renderCreditos();
  catalogo.innerHTML = `<p class="results-info">Cargando productos…</p>`;

  try {
    productos = await cargarProductos();
  } catch (error) {
    // El servidor está apagado o no hay internet
    console.error(error);
    catalogo.innerHTML = `
      <div class="empty-state">
        ${icono("bag")}
        <strong>No pudimos cargar los productos</strong>
        <p>Revisa tu conexión e intenta de nuevo.</p>
        <button type="button" class="btn-add" onclick="location.reload()">Reintentar</button>
      </div>`;
    return;
  }

  // Ahora que hay productos, se recupera el carrito y se dibuja todo
  carrito = cargarCarrito();
  renderCategorias();
  actualizarFlechas();
  renderProductos();
  actualizarBarraFlotante();
}

iniciar();
