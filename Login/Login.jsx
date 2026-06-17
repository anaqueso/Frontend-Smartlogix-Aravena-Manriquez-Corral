import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const API_BASE = "http://localhost:8080";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [usernameFocus, setUsernameFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.username.trim()) {
      setError("El usuario es obligatorio");
      return;
    }

    if (!form.password) {
      setError("La contraseña es obligatoria");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/usuarios/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || "Error al iniciar sesión");
      }

      onLogin(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">SL</div>

        <h1 className="login-title">SmartLogix</h1>
        <p className="login-subtitle">Gestión logística eCommerce</p>

        <div className="login-form">
          <div className="login-field">
            <label className="login-label">
              Usuario <span>*</span>
            </label>

            <input
              className="login-input"
              name="username"
              placeholder="Ingrese su usuario"
              value={form.username}
              onChange={handleChange}
              onFocus={() => setUsernameFocus(true)}
              onBlur={() => setUsernameFocus(false)}
            />

            {usernameFocus && !form.username.trim() && (
              <p className="login-hint">El nombre de usuario es obligatorio</p>
            )}
          </div>

          <div className="login-field">
            <label className="login-label">
              Contraseña <span>*</span>
            </label>

            <input
              className="login-input"
              name="password"
              type="password"
              placeholder="Ingrese su contraseña"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            {passwordFocus &&
              form.password.length > 0 &&
              form.password.length < 8 && (
                <p className="login-hint">
                  Mínimo 8 caracteres ({form.password.length}/8)
                </p>
              )}
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </div>

        <Link to="/registro" className="login-link">
          ¿No tienes cuenta? Regístrate
        </Link>
      </div>
    </div>
  );
}