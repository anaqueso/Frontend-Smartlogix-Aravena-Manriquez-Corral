import { useState } from "react";
import { Link } from "react-router-dom";
import "./Registro.css";

const API_BASE = "http://localhost:8080";

export default function Registro() {
  const [form, setForm] = useState({
    username: "",
    correo: "",
    password: "",
    rol: "USER",
  });

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [usernameFocus, setUsernameFocus] = useState(false);
  const [correoFocus, setCorreoFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const correosPermitidos = ["@gmail.com", "@duocuc.cl", "@hotmail.com"];
  const correoNormalizado = form.correo.toLowerCase();

  const correoValido =
    form.correo.trim() !== "" &&
    correosPermitidos.some((dominio) => correoNormalizado.endsWith(dominio));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setMsg("");

    if (!form.username.trim()) {
      setError("El usuario es obligatorio");
      return;
    }

    if (!form.correo.trim()) {
      setError("El correo es obligatorio");
      return;
    }

    if (!correoValido) {
      setError("Solo se permiten correos Gmail, DuocUC o Hotmail");
      return;
    }

    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/usuarios/registrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          correo: correoNormalizado,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || "Error al registrar");
      }

      setMsg(`Usuario "${data.username}" registrado correctamente`);

      setForm({
        username: "",
        correo: "",
        password: "",
        rol: "USER",
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-page">
      <div className="registro-card">
        <div className="registro-logo">SL</div>

        <h1 className="registro-title">Registrar usuario</h1>
        <p className="registro-subtitle">Crea una cuenta para SmartLogix</p>

        <p className="registro-required-note">
          Los campos marcados con <span>*</span> son obligatorios
        </p>

        <div className="registro-form">
          <div className="registro-field">
            <label className="registro-label">
              Usuario <span>*</span>
            </label>

            <input
              className="registro-input"
              name="username"
              placeholder="Ingrese su usuario"
              value={form.username}
              onChange={handleChange}
              onFocus={() => setUsernameFocus(true)}
              onBlur={() => setUsernameFocus(false)}
            />

            {usernameFocus && !form.username.trim() && (
              <p className="registro-hint">El nombre de usuario es obligatorio</p>
            )}
          </div>

          <div className="registro-field">
            <label className="registro-label">
              Correo <span>*</span>
            </label>

            <input
              className="registro-input"
              name="correo"
              type="email"
              placeholder="correo@gmail.com"
              value={form.correo}
              onChange={handleChange}
              onFocus={() => setCorreoFocus(true)}
              onBlur={() => setCorreoFocus(false)}
            />

            {correoFocus && !form.correo.trim() && (
              <p className="registro-hint">El correo es obligatorio</p>
            )}

            {form.correo.trim() !== "" && !correoValido && (
              <p className="registro-hint">
                Solo se permite @gmail.com, @duocuc.cl o @hotmail.com
              </p>
            )}
          </div>

          <div className="registro-field">
            <label className="registro-label">
              Contraseña <span>*</span>
            </label>

            <input
              className="registro-input"
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            {passwordFocus &&
              form.password.length > 0 &&
              form.password.length < 8 && (
                <p className="registro-hint">
                  Mínimo 8 caracteres ({form.password.length}/8)
                </p>
              )}
          </div>

          <div className="registro-field">
            <label className="registro-label">
              Rol <span>*</span>
            </label>

            <select
              className="registro-input"
              name="rol"
              value={form.rol}
              onChange={handleChange}
            >
              <option value="USER">USER</option>
              <option value="VENDEDOR">VENDEDOR</option>
              <option value="PROVEEDOR">PROVEEDOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          {error && <p className="registro-error">{error}</p>}
          {msg && <p className="registro-success">{msg}</p>}

          <button
            className="registro-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </div>

        <Link to="/login" className="registro-link">
          ← Volver al login
        </Link>
      </div>
    </div>
  );
}