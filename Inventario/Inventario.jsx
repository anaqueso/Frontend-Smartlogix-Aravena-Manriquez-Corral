import { useState, useEffect } from "react";
import "./Inventario.css";

const API_BASE = "http://localhost:8080";


export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    cantidad: "",
    precio: "",
    tipoStock: "VENTA",
    stockMinimo: "",
  });

  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("TODOS");

  const rol = localStorage.getItem("rol");
  const token = localStorage.getItem("token");

  const esAdmin = rol === "ADMIN";
  const esVendedor = rol === "VENDEDOR";
  const esUser = rol === "USER";
  const puedeEditar = esAdmin || esVendedor;

  const totalColumnas = 7 + (esUser ? 1 : 0) + (puedeEditar ? 1 : 0);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const cargarProductos = async () => {
    try {
      let url = `${API_BASE}/api/inventario`;

      if (filtro === "VENTA") {
        url = `${API_BASE}/api/inventario/stock/VENTA`;
      }

      if (filtro === "CRITICO") {
        url = `${API_BASE}/api/inventario/stock/CRITICO`;
      }

      if (filtro === "CRITICO_ALERTA") {
        url = `${API_BASE}/api/inventario/stock/critico/alertas`;
      }

      const res = await fetch(url, { headers });
      const data = await res.json();

      setProductos(Array.isArray(data) ? data : []);
    } catch {
      setProductos([]);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, [filtro]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      descripcion: "",
      cantidad: "",
      precio: "",
      tipoStock: "VENTA",
      stockMinimo: "",
    });

    setEditId(null);
    setError("");
    setMsg("");
  };

  const guardar = async () => {
    setMsg("");
    setError("");

    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (!form.cantidad || Number(form.cantidad) < 0) {
      setError("La cantidad debe ser mayor o igual a 0");
      return;
    }

    if (!form.precio || Number(form.precio) < 0) {
      setError("El precio debe ser mayor o igual a 0");
      return;
    }

    try {
      const body = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        cantidad: Number(form.cantidad),
        precio: Number(form.precio),
        tipoStock: form.tipoStock,
        stockMinimo: Number(form.stockMinimo) || 0,
      };

      const url = editId
        ? `${API_BASE}/api/inventario/${editId}`
        : `${API_BASE}/api/inventario`;

      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.mensaje || "Error al guardar");

      setMsg(
        editId
          ? "Producto actualizado correctamente"
          : "Producto creado correctamente"
      );

      limpiarFormulario();
      cargarProductos();
    } catch (e) {
      setError(e.message);
    }
  };

  const editar = (p) => {
    setForm({
      nombre: p.nombre || "",
      descripcion: p.descripcion || "",
      cantidad: p.cantidad || "",
      precio: p.precio || "",
      tipoStock: p.tipoStock || "VENTA",
      stockMinimo: p.stockMinimo || 0,
    });

    setEditId(p.id);
    setMsg("");
    setError("");
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;

    try {
      await fetch(`${API_BASE}/api/inventario/${id}`, {
        method: "DELETE",
        headers,
      });

      setMsg("Producto eliminado correctamente");
      cargarProductos();
    } catch {
      setError("Error al eliminar producto");
    }
  };

  return (
    <div className="inventario-container">
      <h2 className="section-title">Filtrar productos</h2>

      <div className="form-row">
        <div className="field-group">
          <label className="field-label">Tipo de stock</label>
          <select
            className="input"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="TODOS">TODOS</option>
            <option value="VENTA">VENTA</option>
            <option value="CRITICO">CRÍTICO</option>
            <option value="CRITICO_ALERTA">CRÍTICO EN ALERTA</option>
          </select>
        </div>

        <div className="field-group field-group-btn">
          <label className="field-label">&nbsp;</label>
          <button className="btn-primary" onClick={cargarProductos}>
            Actualizar
          </button>
        </div>
      </div>

      {puedeEditar && (
        <>
          <h2 className="section-title">
            {editId ? "Editar producto" : "Nuevo producto"}
          </h2>

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
                name="nombre"
                placeholder="Nombre"
                value={form.nombre}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Descripción</label>
              <input
                className="input"
                name="descripcion"
                placeholder="Descripción"
                value={form.descripcion}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label className="field-label">
                Cantidad <span>*</span>
              </label>
              <input
                className="input input-sm"
                name="cantidad"
                type="number"
                placeholder="0"
                value={form.cantidad}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label className="field-label">
                Precio <span>*</span>
              </label>
              <input
                className="input input-sm"
                name="precio"
                type="number"
                placeholder="0"
                value={form.precio}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Tipo stock</label>
              <select
                className="input input-sm"
                name="tipoStock"
                value={form.tipoStock}
                onChange={handleChange}
              >
                <option value="VENTA">VENTA</option>
                <option value="CRITICO">CRÍTICO</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Stock mínimo</label>
              <input
                className="input input-sm"
                name="stockMinimo"
                type="number"
                placeholder="0"
                value={form.stockMinimo}
                onChange={handleChange}
              />
            </div>

            <div className="field-group field-group-btn">
              <label className="field-label">&nbsp;</label>
              <button className="btn-primary" onClick={guardar}>
                {editId ? "Actualizar" : "Crear"}
              </button>
            </div>

            {editId && (
              <div className="field-group field-group-btn">
                <label className="field-label">&nbsp;</label>
                <button className="btn-secondary" onClick={limpiarFormulario}>
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {error && <p className="error">{error}</p>}
      {msg && <p className="success">{msg}</p>}

      <h2 className="section-title">Productos registrados</h2>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Tipo</th>
            <th>Stock mín.</th>
            {puedeEditar && <th>Acciones</th>}
          </tr>
        </thead>

        <tbody>
          {productos.map((p) => (
            <tr
              key={p.id}
              className={p.cantidad <= p.stockMinimo ? "fila-alerta" : ""}
            >
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.descripcion || "Sin descripción"}</td>
              <td>{p.cantidad}</td>
              <td>${Number(p.precio || 0).toLocaleString("es-CL")}</td>
              <td>
                <span
                  className={`badge-stock ${
                    p.tipoStock === "CRITICO" ? "badge-critico" : "badge-venta"
                  }`}
                >
                  {p.tipoStock}
                </span>
              </td>
              <td>{p.stockMinimo}</td>


              {puedeEditar && (
                <td>
                  <button className="btn-edit" onClick={() => editar(p)}>
                    Editar
                  </button>

                  {esAdmin && (
                    <button
                      className="btn-delete"
                      onClick={() => eliminar(p.id)}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}

          {productos.length === 0 && (
            <tr>
              <td
                colSpan={totalColumnas}
                style={{ textAlign: "center", color: "#6a5a78" }}
              >
                Sin productos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}