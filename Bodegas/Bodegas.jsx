import { useEffect, useState } from "react";
import "./Bodegas.css";

const API_BASE = "http://localhost:8080";

export default function Bodegas() {
  const [bodegas, setBodegas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [stockProducto, setStockProducto] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");

  const [formBodega, setFormBodega] = useState({
    nombre: "",
    direccion: "",
    tipo: "BODEGA",
  });

  const [formStock, setFormStock] = useState({
    productoId: "",
    bodegaId: "",
    cantidad: "",
  });

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const cargarBodegas = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bodegas`, { headers });
      const data = await res.json();
      setBodegas(Array.isArray(data) ? data : []);
    } catch {
      setBodegas([]);
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

  const cargarStockPorProducto = async (productoId) => {
    if (!productoId) {
      setStockProducto([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/inventario/stock-bodega/producto/${productoId}`, { headers });
      const data = await res.json();
      setStockProducto(Array.isArray(data) ? data : []);
    } catch {
      setStockProducto([]);
    }
  };

  useEffect(() => {
    cargarBodegas();
    cargarProductos();
  }, []);

  const crearBodega = async () => {
    setMsg("");
    setError("");

    if (!formBodega.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (!formBodega.direccion.trim()) {
      setError("La dirección es obligatoria");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/bodegas`, {
        method: "POST",
        headers,
        body: JSON.stringify(formBodega),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.mensaje || "Error al crear bodega");

      setMsg("Bodega creada correctamente");
      setFormBodega({ nombre: "", direccion: "", tipo: "BODEGA" });
      cargarBodegas();
    } catch (e) {
      setError(e.message);
    }
  };

  const asignarStock = async () => {
    setMsg("");
    setError("");

    if (!formStock.productoId) {
      setError("Debe seleccionar un producto");
      return;
    }

    if (!formStock.bodegaId) {
      setError("Debe seleccionar una bodega");
      return;
    }

    if (!formStock.cantidad || Number(formStock.cantidad) < 0) {
      setError("La cantidad debe ser mayor o igual a 0");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/inventario/stock-bodega`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          productoId: Number(formStock.productoId),
          bodegaId: Number(formStock.bodegaId),
          cantidad: Number(formStock.cantidad),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.mensaje || "Error al asignar stock");

      setMsg("Stock asignado correctamente");
      setFormStock({ productoId: "", bodegaId: "", cantidad: "" });

      if (productoSeleccionado) {
        cargarStockPorProducto(productoSeleccionado);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const eliminarBodega = async (id) => {
    if (!confirm("¿Eliminar bodega?")) return;

    setMsg("");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/bodegas/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) throw new Error("Error al eliminar bodega");

      setMsg("Bodega eliminada correctamente");
      cargarBodegas();
    } catch (e) {
      setError(e.message);
    }
  };

  const obtenerNombreProducto = (stock) => {
    return stock.producto?.nombre || productos.find((p) => p.id === stock.productoId)?.nombre || stock.productoId || "No disponible";
  };

  const obtenerNombreBodega = (stock) => {
    return stock.bodega?.nombre || bodegas.find((b) => b.id === stock.bodegaId)?.nombre || stock.bodegaId || "No disponible";
  };

  const obtenerTipoBodega = (stock) => {
    return stock.bodega?.tipo || bodegas.find((b) => b.id === stock.bodegaId)?.tipo || "No disponible";
  };

  return (
    <div className="bodegas-container">
      <h2 className="section-title">Nueva bodega o sucursal</h2>
      <p className="required-note">
        Los campos marcados con <span>*</span> son obligatorios
      </p>

      <div className="form-row">
        <div className="field-group">
          <label className="field-label">
            Nombre <span>*</span>
          </label>
          <input
            className="input"
            placeholder="Nombre"
            value={formBodega.nombre}
            onChange={(e) => setFormBodega({ ...formBodega, nombre: e.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label">
            Dirección <span>*</span>
          </label>
          <input
            className="input"
            placeholder="Dirección"
            value={formBodega.direccion}
            onChange={(e) => setFormBodega({ ...formBodega, direccion: e.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label">Tipo</label>
          <select
            className="input input-sm"
            value={formBodega.tipo}
            onChange={(e) => setFormBodega({ ...formBodega, tipo: e.target.value })}
          >
            <option value="BODEGA">BODEGA</option>
            <option value="SUCURSAL">SUCURSAL</option>
            <option value="TIENDA">TIENDA</option>
          </select>
        </div>

        <div className="field-group field-group-btn">
          <label className="field-label">&nbsp;</label>
          <button className="btn-primary" onClick={crearBodega}>
            Crear
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {msg && <p className="success">{msg}</p>}

      <h2 className="section-title">Asignar stock a bodega</h2>

      <div className="form-row">
        <div className="field-group">
          <label className="field-label">
            Producto <span>*</span>
          </label>
          <select
            className="input"
            value={formStock.productoId}
            onChange={(e) => setFormStock({ ...formStock, productoId: e.target.value })}
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
            Bodega <span>*</span>
          </label>
          <select
            className="input"
            value={formStock.bodegaId}
            onChange={(e) => setFormStock({ ...formStock, bodegaId: e.target.value })}
          >
            <option value="">Seleccionar bodega</option>
            {bodegas.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre} - {b.tipo}
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
            value={formStock.cantidad}
            onChange={(e) => setFormStock({ ...formStock, cantidad: e.target.value })}
          />
        </div>

        <div className="field-group field-group-btn">
          <label className="field-label">&nbsp;</label>
          <button className="btn-primary" onClick={asignarStock}>
            Asignar
          </button>
        </div>
      </div>

      <h2 className="section-title">Stock por producto</h2>

      <div className="form-row">
        <div className="field-group">
          <label className="field-label">Producto</label>
          <select
            className="input"
            value={productoSeleccionado}
            onChange={(e) => {
              setProductoSeleccionado(e.target.value);
              cargarStockPorProducto(e.target.value);
            }}
          >
            <option value="">Seleccionar producto</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Bodega</th>
            <th>Tipo</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {stockProducto.map((s) => (
            <tr key={s.id}>
              <td>{obtenerNombreProducto(s)}</td>
              <td>{obtenerNombreBodega(s)}</td>
              <td>{obtenerTipoBodega(s)}</td>
              <td>{s.cantidad}</td>
            </tr>
          ))}
          {stockProducto.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", color: "#6a5a78" }}>
                Sin datos
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="section-title">Bodegas registradas</h2>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Tipo</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {bodegas.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.nombre}</td>
              <td>{b.direccion}</td>
              <td>{b.tipo}</td>
              <td>
                <button className="btn-delete" onClick={() => eliminarBodega(b.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {bodegas.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", color: "#6a5a78" }}>
                Sin bodegas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}