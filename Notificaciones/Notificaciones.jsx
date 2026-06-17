import { useEffect, useState } from "react";
import "./Notificaciones.css";

const API_BASE = "http://localhost:8080";

export default function Notificaciones({ user }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [usuariosRol, setUsuariosRol] = useState([]);

  const [filtroTipo, setFiltroTipo] = useState("TODAS");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [correoSimulado, setCorreoSimulado] = useState(null);

  const [formCorreo, setFormCorreo] = useState({
    rolDestino: "VENDEDOR",
    modoEnvio: "TODOS",
    usuarioId: "",
    tipo: "PEDIDO",
    asunto: "",
    mensaje: "",
  });

  const token = user?.token || localStorage.getItem("token");
  const usuarioId = user?.id || localStorage.getItem("id");
  const username = user?.username || localStorage.getItem("username");
  const correo = user?.correo || localStorage.getItem("correo");
  const rol = user?.rol || localStorage.getItem("rol");

  const esAdmin = rol === "ADMIN";

  const getHeaders = () => {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  };

  const cargarNotificaciones = async () => {
    setLoading(true);
    setError("");
    setMsg("");

    try {
      const url = esAdmin
        ? `${API_BASE}/api/notificaciones`
        : `${API_BASE}/api/notificaciones/usuario/${usuarioId}`;

      const res = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!res.ok) {
        throw new Error("No se pudieron cargar las notificaciones");
      }

      const data = await res.json();
      setNotificaciones(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarUsuariosPorRol = async (rolDestino) => {
    setCargandoUsuarios(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/usuarios/rol/${rolDestino}`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!res.ok) {
        throw new Error("No se pudieron cargar los destinatarios del rol seleccionado");
      }

      const data = await res.json();
      setUsuariosRol(Array.isArray(data) ? data : []);
    } catch (e) {
      setUsuariosRol([]);
      setError(e.message);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const enviarCorreo = async (e) => {
    e.preventDefault();

    setError("");
    setMsg("");

    if (!formCorreo.asunto.trim()) {
      setError("El asunto es obligatorio");
      return;
    }

    if (!formCorreo.mensaje.trim()) {
      setError("El mensaje es obligatorio");
      return;
    }

    if (formCorreo.modoEnvio === "USUARIO" && !formCorreo.usuarioId) {
      setError("Debe seleccionar un destinatario");
      return;
    }

    setEnviando(true);

    try {
      let url = "";
      let body = {};

      if (formCorreo.modoEnvio === "TODOS") {
        url = `${API_BASE}/api/notificaciones/enviar-rol`;

        body = {
          rolDestino: formCorreo.rolDestino,
          tipo: formCorreo.tipo,
          asunto: formCorreo.asunto,
          mensaje: formCorreo.mensaje,
          remitente: username || correo || "Sistema",
        };
      } else {
        const usuarioSeleccionado = usuariosRol.find(
          (u) => String(u.id) === String(formCorreo.usuarioId)
        );

        if (!usuarioSeleccionado) {
          setError("No se encontró el destinatario seleccionado");
          setEnviando(false);
          return;
        }

        url = `${API_BASE}/api/notificaciones/enviar-usuario`;

        body = {
          usuarioId: usuarioSeleccionado.id,
          correoDestino: usuarioSeleccionado.correo,
          usernameDestino: usuarioSeleccionado.username,
          tipo: formCorreo.tipo,
          asunto: formCorreo.asunto,
          mensaje: formCorreo.mensaje,
          remitente: username || correo || "Sistema",
        };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.mensaje || "No se pudo enviar el mensaje");
      }

      setMsg(
        formCorreo.modoEnvio === "TODOS"
          ? `Mensaje enviado a todos los usuarios con rol ${formCorreo.rolDestino}`
          : "Mensaje enviado al destinatario seleccionado"
      );

      setFormCorreo({
        rolDestino: "VENDEDOR",
        modoEnvio: "TODOS",
        usuarioId: "",
        tipo: "PEDIDO",
        asunto: "",
        mensaje: "",
      });

      cargarUsuariosPorRol("VENDEDOR");
      cargarNotificaciones();
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  const eliminarNotificacion = async (id) => {
    const confirmar = window.confirm("¿Desea eliminar esta notificación?");

    if (!confirmar) return;

    setError("");
    setMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/notificaciones/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar la notificación");
      }

      setMsg("Notificación eliminada correctamente");
      cargarNotificaciones();
    } catch (e) {
      setError(e.message);
    }
  };

  const cambiarRolDestino = (nuevoRol) => {
    setFormCorreo({
      ...formCorreo,
      rolDestino: nuevoRol,
      usuarioId: "",
    });

    cargarUsuariosPorRol(nuevoRol);
  };

  const obtenerClaseTipo = (tipo) => {
    if (tipo === "STOCK") return "badge-stock";
    if (tipo === "PEDIDO") return "badge-pedido";
    if (tipo === "ENVIO") return "badge-envio";
    return "badge-general";
  };

  const obtenerAsuntoCorreo = (notificacion) => {
    if (notificacion.tipo === "STOCK") {
      return "Alerta de stock crítico";
    }

    if (notificacion.tipo === "PEDIDO") {
      return "Actualización de pedido";
    }

    if (notificacion.tipo === "ENVIO") {
      return "Actualización de envío";
    }

    return "Notificación SmartLogix";
  };

  const abrirCorreoSimulado = (notificacion) => {
    setCorreoSimulado({
      destinatario: `Usuario ID ${notificacion.usuarioId}`,
      asunto: obtenerAsuntoCorreo(notificacion),
      mensaje: notificacion.mensaje,
      tipo: notificacion.tipo,
    });
  };

  const cerrarCorreoSimulado = () => {
    setCorreoSimulado(null);
  };

  const notificacionesFiltradas =
    filtroTipo === "TODAS"
      ? notificaciones
      : notificaciones.filter((n) => n.tipo === filtroTipo);

  useEffect(() => {
    cargarNotificaciones();
    cargarUsuariosPorRol(formCorreo.rolDestino);
  }, []);

  return (
    <div className="notificaciones-container">
      <div className="notificaciones-header">
        <div>
          <h2 className="section-title">Centro de notificaciones</h2>
          <p className="section-subtitle">
            Gestiona avisos internos, mensajes operativos y alertas del sistema.
          </p>
        </div>

        <button className="btn-primary" onClick={cargarNotificaciones}>
          Actualizar
        </button>
      </div>

      <div className="notificaciones-info">
        Los destinatarios se cargan automáticamente desde la base de datos según
        el rol seleccionado.
      </div>

      <form className="correo-form" onSubmit={enviarCorreo}>
        <div className="form-title-box">
          <h3>Nuevo mensaje</h3>
          <p>
            Selecciona un rol y define si el mensaje será enviado a todos o a un
            destinatario específico.
          </p>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label className="field-label">Rol destino</label>
            <select
              className="input"
              value={formCorreo.rolDestino}
              onChange={(e) => cambiarRolDestino(e.target.value)}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="VENDEDOR">VENDEDOR</option>
              <option value="USER">USER</option>
              <option value="PROVEEDOR">PROVEEDOR</option>
            </select>
          </div>

          <div className="form-field">
            <label className="field-label">Destinatario</label>
            <select
              className="input"
              value={formCorreo.modoEnvio}
              onChange={(e) =>
                setFormCorreo({
                  ...formCorreo,
                  modoEnvio: e.target.value,
                  usuarioId: "",
                })
              }
            >
              <option value="TODOS">Todos los usuarios del rol</option>
              <option value="USUARIO">Usuario específico</option>
            </select>
          </div>

          <div className="form-field">
            <label className="field-label">Tipo de mensaje</label>
            <select
              className="input"
              value={formCorreo.tipo}
              onChange={(e) =>
                setFormCorreo({ ...formCorreo, tipo: e.target.value })
              }
            >
              <option value="PEDIDO">PEDIDO</option>
              <option value="ENVIO">ENVIO</option>
              <option value="STOCK">STOCK</option>
            </select>
          </div>

          {formCorreo.modoEnvio === "USUARIO" && (
            <div className="form-field form-field-full">
              <label className="field-label">Usuario registrado</label>

              <select
                className="input"
                value={formCorreo.usuarioId}
                onChange={(e) =>
                  setFormCorreo({ ...formCorreo, usuarioId: e.target.value })
                }
              >
                <option value="">
                  {cargandoUsuarios
                    ? "Cargando destinatarios..."
                    : "Seleccione un destinatario"}
                </option>

                {usuariosRol.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.username} - {usuario.correo}
                  </option>
                ))}
              </select>

              {usuariosRol.length === 0 && !cargandoUsuarios && (
                <span className="helper-text">
                  No hay usuarios registrados con este rol.
                </span>
              )}
            </div>
          )}

          <div className="form-field form-field-full">
            <label className="field-label">Destinatarios disponibles</label>

            <div className="usuarios-preview">
              {cargandoUsuarios ? (
                <p>Cargando destinatarios...</p>
              ) : usuariosRol.length === 0 ? (
                <p>No hay destinatarios registrados para este rol.</p>
              ) : (
                usuariosRol.map((usuario) => (
                  <span key={usuario.id} className="usuario-chip">
                    {usuario.username} · {usuario.correo}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="form-field form-field-full">
            <label className="field-label">Asunto</label>
            <input
              className="input"
              type="text"
              value={formCorreo.asunto}
              onChange={(e) =>
                setFormCorreo({ ...formCorreo, asunto: e.target.value })
              }
              placeholder="Ej: Actualización de pedido"
            />
          </div>

          <div className="form-field form-field-full">
            <label className="field-label">Mensaje</label>
            <textarea
              className="input textarea"
              value={formCorreo.mensaje}
              onChange={(e) =>
                setFormCorreo({ ...formCorreo, mensaje: e.target.value })
              }
              placeholder="Escribe el contenido del mensaje..."
            />
          </div>
        </div>

        <button className="btn-primary" type="submit" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar mensaje"}
        </button>
      </form>

      <div className="filter-box">
        <label className="field-label">Filtrar por tipo</label>

        <select
          className="input"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="TODAS">Todas</option>
          <option value="STOCK">Stock</option>
          <option value="PEDIDO">Pedido</option>
          <option value="ENVIO">Envío</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {msg && <p className="success">{msg}</p>}
      {loading && <p className="loading">Cargando notificaciones...</p>}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Mensaje</th>
              <th>Usuario destino</th>
              <th>Vista previa</th>
              {esAdmin && <th>Acción</th>}
            </tr>
          </thead>

          <tbody>
            {notificacionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={esAdmin ? "6" : "5"} className="empty">
                  No hay notificaciones registradas.
                </td>
              </tr>
            ) : (
              notificacionesFiltradas.map((notificacion) => (
                <tr key={notificacion.id}>
                  <td>{notificacion.id}</td>

                  <td>
                    <span
                      className={`badge ${obtenerClaseTipo(
                        notificacion.tipo
                      )}`}
                    >
                      {notificacion.tipo}
                    </span>
                  </td>

                  <td>{notificacion.mensaje}</td>

                  <td>{notificacion.usuarioId || "Sistema"}</td>

                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => abrirCorreoSimulado(notificacion)}
                    >
                      Ver mensaje
                    </button>
                  </td>

                  {esAdmin && (
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => eliminarNotificacion(notificacion.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {correoSimulado && (
        <div className="modal-overlay">
          <div className="correo-modal">
            <h3>Vista previa del mensaje</h3>

            <div className="correo-box">
              <p>
                <strong>Destinatario:</strong> {correoSimulado.destinatario}
              </p>

              <p>
                <strong>Asunto:</strong> {correoSimulado.asunto}
              </p>

              <p>
                <strong>Tipo:</strong> {correoSimulado.tipo}
              </p>

              <div className="correo-mensaje">
                <strong>Contenido:</strong>
                <p>{correoSimulado.mensaje}</p>
              </div>
            </div>

            <p className="correo-note">
              Esta vista muestra el contenido asociado a la notificación
              seleccionada.
            </p>

            <button className="btn-primary" onClick={cerrarCorreoSimulado}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}