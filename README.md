# SmartLogix Frontend

Frontend web desarrollado para el sistema **SmartLogix**, una plataforma de gestión logística orientada a eCommerce. Esta aplicación permite interactuar con los microservicios del backend mediante una interfaz visual para administrar inventario, pedidos, envíos, proveedores, bodegas y notificaciones.

## Descripción del proyecto

SmartLogix Frontend corresponde a la capa visual del sistema. Su objetivo es facilitar la operación logística desde un panel centralizado, permitiendo que distintos roles de usuario accedan a las funcionalidades que les corresponden.

La aplicación se conecta al backend mediante el **API Gateway**, configurado por defecto en:

```js
http://localhost:8080
```

Desde esta interfaz se pueden realizar acciones como iniciar sesión, registrar usuarios, consultar productos, crear pedidos, revisar boletas, cambiar estados de envío, administrar proveedores, gestionar bodegas y visualizar notificaciones del sistema.

## Tecnologías utilizadas

- React
- JavaScript
- Vite
- React Router DOM
- CSS modular por componente
- Fetch API para consumo de servicios REST
- LocalStorage para manejo de sesión y token JWT

## Requisitos previos

Antes de ejecutar el proyecto, se debe contar con:

- Node.js instalado
- npm instalado
- Backend de SmartLogix ejecutándose
- API Gateway disponible en `http://localhost:8080`

## Instalación y ejecución

1. Clonar o descargar el proyecto.

```bash
git clone <URL_DEL_REPOSITORIO>
```

2. Entrar a la carpeta del frontend.

```bash
cd smartlogix_frontend_aravena_corral_manriquez-main
```

3. Instalar dependencias.

```bash
npm install
```

4. Ejecutar la aplicación en modo desarrollo.

```bash
npm run dev
```

5. Abrir en el navegador la URL entregada por Vite, normalmente:

```bash
http://localhost:5173
```

## Scripts disponibles

```bash
npm run dev
```

Ejecuta el frontend en modo desarrollo.

```bash
npm run build
```

Genera la versión de producción del proyecto.

```bash
npm run preview
```

Permite previsualizar la versión generada para producción.

```bash
npm run lint
```

Ejecuta la revisión de código con ESLint, si se encuentra configurado en el proyecto.

## Estructura principal del proyecto

```text
smartlogix_frontend_aravena_corral_manriquez-main/
│
├── componentes/
│   ├── Bodegas/
│   │   ├── Bodegas.jsx
│   │   └── Bodegas.css
│   │
│   ├── Envios/
│   │   ├── Envios.jsx
│   │   └── Envios.css
│   │
│   ├── Inventario/
│   │   ├── Inventario.jsx
│   │   └── Inventario.css
│   │
│   ├── Navbar/
│   │   ├── Navbar.jsx
│   │   └── Navbar.css
│   │
│   ├── Notificaciones/
│   │   ├── Notificaciones.jsx
│   │   └── Notificaciones.css
│   │
│   ├── Pedidos/
│   │   ├── Pedidos.jsx
│   │   └── Pedidos.css
│   │
│   └── Proveedores/
│       ├── Proveedores.jsx
│       └── Proveedores.css
│
├── pages/
│   ├── Dashboard/
│   ├── Login/
│   └── Registro/
│
├── App.jsx
├── App.css
├── main.jsx
├── index.css
├── index.html
├── package.json
└── vite.config.js
```

## Módulos del sistema

### Login

Permite iniciar sesión con usuario y contraseña. Al autenticar correctamente, guarda los datos de sesión en `localStorage`, incluyendo el token JWT, id de usuario, nombre de usuario, correo y rol.

### Registro

Permite crear nuevos usuarios dentro del sistema. Incluye validaciones para campos obligatorios, largo mínimo de contraseña y dominios de correo permitidos.

Roles disponibles en el registro:

- `ADMIN`
- `VENDEDOR`
- `USER`
- `PROVEEDOR`

### Dashboard

Es la vista principal después del inicio de sesión. Contiene la navegación del sistema y redirige al usuario según su rol. Los proveedores son enviados por defecto a la sección de proveedores, mientras que el resto de roles ingresa al inventario.

### Navbar

Barra superior de navegación. Muestra el nombre de usuario, rol, botón de cierre de sesión y panel de notificaciones. También controla qué módulos son visibles según el rol del usuario.

### Inventario

Permite consultar productos registrados y filtrar por tipo de stock:

- Todos
- Venta
- Crítico
- Crítico en alerta

Los roles autorizados pueden crear, editar y eliminar productos. También se muestran alertas visuales cuando un producto se encuentra bajo su stock mínimo.

### Pedidos

Permite crear pedidos seleccionando producto, cantidad, dirección de envío y tipo de pedido. Además, muestra pedidos registrados y permite consultar la boleta asociada a cada pedido.

Tipos de pedido disponibles:

- Normal
- Express

### Envíos

Permite listar envíos, buscar un envío por ID de pedido y actualizar su estado.

Estados disponibles:

- `PENDIENTE`
- `EN_CAMINO`
- `ENTREGADO`
- `CANCELADO`
- `SERVICIO_NO_DISPONIBLE`

### Proveedores

Permite listar proveedores registrados y crear nuevos proveedores. El acceso de creación está disponible para usuarios con rol `ADMIN` o `PROVEEDOR`.

### Bodegas

Permite crear bodegas, sucursales o tiendas, asignar stock de productos a una bodega específica y consultar el stock distribuido por producto.

Tipos disponibles:

- `BODEGA`
- `SUCURSAL`
- `TIENDA`

### Notificaciones

Centro de notificaciones del sistema. Permite consultar mensajes internos, filtrar por tipo, enviar mensajes a usuarios por rol o a un destinatario específico y simular la visualización de un correo.

Tipos de notificación:

- `STOCK`
- `PEDIDO`
- `ENVIO`
- `GENERAL`

## Control de acceso por rol

| Rol | Acceso principal |
|---|---|
| `ADMIN` | Inventario, pedidos, envíos, proveedores, bodegas y notificaciones generales |
| `VENDEDOR` | Inventario, pedidos y notificaciones |
| `USER` | Pedidos y notificaciones propias |
| `PROVEEDOR` | Proveedores y notificaciones propias |

## Integración con backend

El frontend consume los servicios REST del backend a través del API Gateway en el puerto `8080`.

| Módulo | Endpoint base utilizado |
|---|---|
| Usuarios | `/api/usuarios` |
| Inventario | `/api/inventario` |
| Pedidos | `/api/pedidos` |
| Boletas | `/api/boletas` |
| Envíos | `/api/envios` |
| Proveedores | `/api/proveedores` |
| Bodegas | `/api/bodegas` |
| Notificaciones | `/api/notificaciones` |

Todas las peticiones protegidas envían el token JWT en el encabezado:

```http
Authorization: Bearer <token>
```

## Flujo general de uso

1. El usuario ingresa a la aplicación.
2. Inicia sesión o registra una nueva cuenta.
3. El frontend guarda la sesión en `localStorage`.
4. Según el rol, se habilitan las opciones del menú.
5. El usuario puede gestionar inventario, pedidos, envíos, proveedores, bodegas o notificaciones.
6. Las acciones se comunican con el backend mediante el API Gateway.

## Consideraciones importantes

- El backend debe estar levantado antes de usar el frontend.
- El API Gateway debe estar disponible en `http://localhost:8080`.
- Si se cambia el puerto o dominio del backend, se debe actualizar la constante `API_BASE` en los componentes.
- No se recomienda subir la carpeta `node_modules` al repositorio.
- Para instalar dependencias en otro equipo, basta con ejecutar `npm install`.

## Estilo visual

La interfaz utiliza un diseño oscuro con tonos morados y rosados, manteniendo una estética consistente entre formularios, tablas, botones, tarjetas y paneles de notificaciones.

## Autores

Proyecto desarrollado para SmartLogix por el equipo Aravena, Corral y Manríquez.
