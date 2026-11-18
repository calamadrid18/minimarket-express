# Minimarket Express

Sistema para un minisúper dentro de un condominio: los vecinos ven el catálogo y arman su pedido para enviarlo por WhatsApp, y el administrador maneja productos, precios y stock desde un panel privado.

*Full stack system for a condo mini-market: a customer storefront, a REST API and a private React admin panel to manage products and inventory.*

> **Estado: en desarrollo.** Funciona en entorno local y todavía no está abierto al público.

## Partes del proyecto

| Carpeta | Qué es | Tecnologías |
|---|---|---|
| `tienda/` | Tienda para los clientes, pensada para el celular | HTML, CSS, JavaScript |
| `admin/` | Panel privado de administración | React 19, React Router 7, Vite |
| `backend/` | API REST y base de datos | Node.js, Express 5, MongoDB, Mongoose, JWT, bcrypt, Docker |

## Funcionalidades

**Tienda**
- Catálogo por categorías con búsqueda
- Carrito guardado en el celular
- Pedido listo para enviar por WhatsApp
- Aviso de productos agotados o con pocas unidades

**Panel de administración**
- Login de administrador con JWT
- Crear, editar y borrar productos
- Ajustar el stock con botones rápidos
- Alertas de productos agotados y con poco stock

## Decisiones de diseño

- **Los clientes no necesitan cuenta:** comprar debe ser rápido.
- **No hay registro público de administradores:** la cuenta se crea con un script en el servidor.
- **Rutas protegidas:** ver el catálogo es público; cambiar productos requiere token.
- **Lista blanca de campos:** la API ignora cualquier campo que no esté permitido.

## Cómo ejecutarlo

Necesitas Docker y Node.js.

```bash
# 1. Backend y base de datos
cd backend
cp .env.example .env   # cambia JWT_SECRET por un texto largo y secreto
docker compose up -d --build

# 2. Cargar los productos iniciales
docker compose exec api npm run cargar-productos

# 3. Crear la cuenta de administrador
docker compose exec api npm run crear-admin -- tu@correo.com TuContraseñaSegura

# 4. Panel de administración (en otra terminal)
cd admin
npm install
npm run dev
```

- Panel: http://localhost:5173
- API: http://localhost:3002
- Tienda: abre la carpeta `tienda/` con Live Server (puerto 5500)

## API

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/productos` | Público | Ver el catálogo |
| POST | `/login` | Público | Iniciar sesión como administrador |
| GET | `/yo` | Token | Ver la cuenta del administrador |
| POST | `/productos` | Token | Crear producto |
| PUT | `/productos/:id` | Token | Editar producto |
| DELETE | `/productos/:id` | Token | Borrar producto |

## Próximos pasos

- Guardar los pedidos y descontar el stock automáticamente
- Estados del pedido y estadísticas de ventas
- Publicar la API y conectar la tienda en producción
