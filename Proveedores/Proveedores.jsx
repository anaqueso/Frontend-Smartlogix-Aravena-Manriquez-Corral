import { useState, useEffect } from "react";
import "./Proveedores.css";

const API_BASE = "http://localhost:8080";

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState({ nombre: "", contacto: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const rol = localStorage.getItem("rol");
  const token = localStorage.getItem("token");

  const esAdmin = rol === "ADMIN";
  const esProveedor = rol === "PROVEEDOR";
  const puedeCrearProveedor = esAdmin || esProveedor;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const cargar = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/proveedores`, { headers });
      const data = await res.json();
      setProveedores(Array.isArray(data) ? data : []);
    } catch {
      setProveedores([]);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const guardar = async () => {
    setMsg("");
    setError("");

    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (!form.contacto.trim()) {
      setError("El contacto es obligatorio");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/proveedores`, {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.mensaje || "Error al guardar");

      setMsg("Proveedor creado correctamente");
      setForm({ nombre: "", contacto: "" });
      cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar proveedor?")) return;

    await fetch(`${API_BASE}/api/proveedores/${id}`, {
      method: "DELETE",
      headers,
    });

    cargar();
  };

  return (
    <div className="proveedores-container">
      {puedeCrearProveedor && (
        <>
          <h2 className="section-title">Nuevo proveedor</h2>

          <div className="form-row">
            <div className="field-group">
              <label className="field-label">
                Nombre <span>*</span>
              </label>
              <input
                className="input"
                placeholder="Nombre empresa o persona"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>

            <div className="field-group">
              <label className="field-label">
                Contacto <span>*</span>
              </label>
              <input
                className="input"
                placeholder="Email o teléfono"
                value={form.contacto}
                onChange={(e) => setForm({ ...form, contacto: e.target.value })}
              />
            </div>

            <div className="field-group field-group-btn">
              <label className="field-label">&nbsp;</label>
              <button className="btn-primary" onClick={guardar}>
                Crear
              </button>
            </div>
          </div>

          {error && <p className="error">{error}</p>}
          {msg && <p className="success">{msg}</p>}
        </>
      )}

      <h2 className="section-title">Proveedores registrados</h2>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Contacto</th>
            {esAdmin && <th>Acciones</th>}
          </tr>
        </thead>

        <tbody>
          {proveedores.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.contacto}</td>

              {esAdmin && (
                <td>
                  <button className="btn-delete" onClick={() => eliminar(p.id)}>
                    Eliminar
                  </button>
                </td>
              )}
            </tr>
          ))}

          {proveedores.length === 0 && (
            <tr>
              <td
                colSpan={esAdmin ? 4 : 3}
                style={{ textAlign: "center", color: "#6a5a78" }}
              >
                Sin proveedores
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}