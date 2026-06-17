import { useState, useEffect } from "react";
import "./Pedidos.css";

const API_BASE = "http://localhost:8080";

export default function Pedidos({ user }) {
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);

  const isUser = user?.rol === "USER";

  const [form, setForm] = useState({
    productoId: "",
    cantidad: "",
    direccionEnvio: "",
    tipo: "NORMAL",
  });

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [verBoleta, setVerBoleta] = useState(null);
  const [boleta, setBoleta] = useState(null);

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const cargarPedidos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/pedidos`, { headers });
      const data = await res.json();
      setPedidos(Array.isArray(data) ? data : []);
    } catch {
      setPedidos([]);
    }
  };

  const cargarProductos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/inventario`, { headers });
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch {
      setProductos([]);
    }
  };

  useEffect(() => {
    cargarPedidos();
    cargarProductos();
  }, []);

  const crearPedido = async () => {
    setMsg("");
    setError("");

    if (!form.productoId) {
      setError("El producto es obligatorio");
      return;
    }

    if (!form.cantidad || Number(form.cantidad) <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    if (!form.direccionEnvio.trim()) {
      setError("La dirección de envío es obligatoria");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/pedidos`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          username: user?.username,
          productoId: Number(form.productoId),
          cantidad: Number(form.cantidad),
          direccionEnvio: form.direccionEnvio,
          tipo: form.tipo,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.mensaje || "Error al crear pedido");

      setMsg(`Pedido #${data.id} creado correctamente`);
      setForm({
        productoId: "",
        cantidad: "",
        direccionEnvio: "",
        tipo: "NORMAL",
      });

      cargarPedidos();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verBoletaPedido = async (id) => {
    setBoleta(null);
    setVerBoleta(id);

    try {
      const res = await fetch(`${API_BASE}/api/boletas/pedido/${id}`, { headers });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setBoleta(data);
    } catch {
      setBoleta(null);
    }
  };

  const obtenerNombreProducto = (productoId) => {
    const producto = productos.find((p) => p.id === productoId);
    return producto ? producto.nombre : `Producto #${productoId}`;
  };

  return (
    <div className="pedidos-container">
      <h2 className="section-title">Nuevo pedido</h2>

      <div className="form-row">
        <div className="field-group">
          <label className="field-label">
            Producto <span>*</span>
          </label>
          <select
            className="input"
            value={form.productoId}
            onChange={(e) => setForm({ ...form, productoId: e.target.value })}
          >
            <option value="">Seleccionar producto</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label className="field-label">
            Cantidad <span>*</span>
          </label>
          <input
            className="input input-sm"
            type="number"
            placeholder="0"
            value={form.cantidad}
            onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label">
            Dirección de envío <span>*</span>
          </label>
          <input
            className="input input-lg"
            placeholder="Dirección completa"
            value={form.direccionEnvio}
            onChange={(e) => setForm({ ...form, direccionEnvio: e.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label">Tipo</label>
          <select
            className="input input-sm"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            <option value="NORMAL">NORMAL</option>
            <option value="EXPRESS">EXPRESS</option>
          </select>
        </div>

        <div className="field-group field-group-btn">
          <label className="field-label">&nbsp;</label>
          <button className="btn-primary" onClick={crearPedido} disabled={loading}>
            {loading ? "Creando..." : "Crear pedido"}
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {msg && <p className="success">{msg}</p>}

      {verBoleta && (
        <div className="boleta-modal">
          <div className="boleta-card">
            <div className="boleta-header">
              <span>Boleta - Pedido #{verBoleta}</span>
              <button
                className="boleta-close"
                onClick={() => {
                  setVerBoleta(null);
                  setBoleta(null);
                }}
              >
                x
              </button>
            </div>

            {boleta ? (
              <div className="boleta-body">
                <div className="boleta-row">
                  <span>Cliente</span>
                  <span>{boleta.username}</span>
                </div>

                <div className="boleta-row">
                  <span>Fecha</span>
                  <span>{boleta.fechaEmision}</span>
                </div>

                <div className="boleta-row">
                  <span>Precio neto</span>
                  <span>${Number(boleta.precioNeto).toLocaleString("es-CL")}</span>
                </div>

                <div className="boleta-row">
                  <span>IVA 19%</span>
                  <span>${Number(boleta.iva).toLocaleString("es-CL")}</span>
                </div>

                <div className="boleta-row boleta-total">
                  <span>Total</span>
                  <span>${Number(boleta.precioTotal).toLocaleString("es-CL")}</span>
                </div>
              </div>
            ) : (
              <p className="boleta-vacia">Boleta no disponible</p>
            )}
          </div>
        </div>
      )}

      <h2 className="section-title">{isUser ? "Mis pedidos" : "Pedidos registrados"}</h2>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            {!isUser && <th>Usuario</th>}
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Dirección</th>
            <th>Boleta</th>
          </tr>
        </thead>

        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              {!isUser && <td>{p.username}</td>}
              <td>{obtenerNombreProducto(p.productoId)}</td>
              <td>{p.cantidad}</td>
              <td>
                <span className={`badge-tipo ${p.tipo === "EXPRESS" ? "badge-express" : "badge-normal"}`}>
                  {p.tipo}
                </span>
              </td>
              <td>
                <span className="badge-estado">{p.estado}</span>
              </td>
              <td className="td-direccion">{p.direccionEnvio}</td>
              <td>
                <button className="btn-boleta" onClick={() => verBoletaPedido(p.id)}>
                  Ver
                </button>
              </td>
            </tr>
          ))}

          {pedidos.length === 0 && (
            <tr>
              <td colSpan={isUser ? 7 : 8} style={{ textAlign: "center", color: "#6a5a78" }}>
                Sin pedidos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}