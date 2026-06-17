import { useState, useEffect } from "react";
import "./Envios.css";

const API_BASE = "http://localhost:8080";

const ESTADOS = ["PENDIENTE", "EN_CAMINO", "ENTREGADO", "CANCELADO"];

const colorEstado = {
  PENDIENTE: "badge-pendiente",
  EN_CAMINO: "badge-en-camino",
  ENTREGADO: "badge-entregado",
  CANCELADO: "badge-cancelado",
  SERVICIO_NO_DISPONIBLE: "badge-no-disponible",
};

export default function Envios() {
  const [envios, setEnvios] = useState([]);
  const [editandoEstado, setEditandoEstado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");

  const [busquedaPedido, setBusquedaPedido] = useState("");
  const [envioEncontrado, setEnvioEncontrado] = useState(null);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const cargarEnvios = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/envios`, { headers });
      const data = await res.json();

      setEnvios(Array.isArray(data) ? data : []);
    } catch {
      setEnvios([]);
    }
  };

  useEffect(() => {
    cargarEnvios();
  }, []);

  const buscarPorPedido = async () => {
    setMsg("");
    setError("");
    setEnvioEncontrado(null);

    if (!busquedaPedido) {
      setError("Debe ingresar un ID de pedido");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/envios/pedido/${busquedaPedido}`, {
        headers,
      });

      if (!res.ok) throw new Error("No se encontró envío para ese pedido");

      const data = await res.json();
      setEnvioEncontrado(data);
    } catch (e) {
      setError(e.message);
      setEnvioEncontrado(null);
    }
  };

  const actualizarEstado = async (id) => {
    setMsg("");
    setError("");

    if (!nuevoEstado) {
      setError("Debe seleccionar un estado");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/envios/${id}/estado`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.mensaje || "Error al actualizar estado");

      setMsg(`Estado actualizado a ${nuevoEstado}`);
      setEditandoEstado(null);
      setNuevoEstado("");
      cargarEnvios();

      if (envioEncontrado?.id === id) {
        setEnvioEncontrado(data);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const cancelarEdicion = () => {
    setEditandoEstado(null);
    setNuevoEstado("");
    setError("");
  };

  const renderEstado = (estado) => (
    <span className={`badge-estado ${colorEstado[estado] || ""}`}>
      {estado}
    </span>
  );

  return (
    <div className="envios-container">
      <h2 className="section-title">Buscar envío por pedido</h2>

      <div className="form-row">
        <div className="field-group">
          <label className="field-label">
            ID pedido <span>*</span>
          </label>
          <input
            className="input input-sm"
            type="number"
            placeholder="ID"
            value={busquedaPedido}
            onChange={(e) => setBusquedaPedido(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscarPorPedido()}
          />
        </div>

        <div className="field-group field-group-btn">
          <label className="field-label">&nbsp;</label>
          <button className="btn-primary" onClick={buscarPorPedido}>
            Buscar
          </button>
        </div>

        <div className="field-group field-group-btn">
          <label className="field-label">&nbsp;</label>
          <button className="btn-secondary" onClick={cargarEnvios}>
            Actualizar
          </button>
        </div>
      </div>

      {msg && <p className="success">{msg}</p>}
      {error && <p className="error">{error}</p>}

      {envioEncontrado && (
        <>
          <h2 className="section-title">Resultado de búsqueda</h2>

          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pedido</th>
                <th>Estado</th>
                <th>Transportista</th>
                <th>Código</th>
                <th>Dirección</th>
                <th>Entrega estimada</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>{envioEncontrado.id}</td>
                <td>{envioEncontrado.pedidoId}</td>
                <td>{renderEstado(envioEncontrado.estado)}</td>
                <td>{envioEncontrado.transportista}</td>
                <td className="td-codigo">{envioEncontrado.codigoSeguimiento}</td>
                <td className="td-dir">{envioEncontrado.direccion}</td>
                <td>
                  {envioEncontrado.fechaEstimadaEntrega}
                  <span className="dias"> ({envioEncontrado.diasEstimados}d)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      <h2 className="section-title">Envíos registrados</h2>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Pedido</th>
            <th>Estado</th>
            <th>Transportista</th>
            <th>Código</th>
            <th>Dirección</th>
            <th>Entrega estimada</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {envios.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.pedidoId}</td>

              <td>
                {editandoEstado === e.id ? (
                  <div className="estado-edit">
                    <select
                      className="input input-sm"
                      value={nuevoEstado}
                      onChange={(ev) => setNuevoEstado(ev.target.value)}
                    >
                      <option value="">Seleccionar</option>
                      {ESTADOS.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>

                    <button
                      className="btn-confirmar"
                      onClick={() => actualizarEstado(e.id)}
                    >
                      Guardar
                    </button>

                    <button className="btn-cancelar-sm" onClick={cancelarEdicion}>
                      Cancelar
                    </button>
                  </div>
                ) : (
                  renderEstado(e.estado)
                )}
              </td>

              <td>{e.transportista}</td>
              <td className="td-codigo">{e.codigoSeguimiento}</td>
              <td className="td-dir">{e.direccion}</td>
              <td>
                {e.fechaEstimadaEntrega}
                <span className="dias"> ({e.diasEstimados}d)</span>
              </td>

              <td>
                {editandoEstado !== e.id && (
                  <button
                    className="btn-edit"
                    onClick={() => {
                      setEditandoEstado(e.id);
                      setNuevoEstado(e.estado);
                      setMsg("");
                      setError("");
                    }}
                  >
                    Cambiar estado
                  </button>
                )}
              </td>
            </tr>
          ))}

          {envios.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", color: "#6a5a78" }}>
                Sin envíos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}