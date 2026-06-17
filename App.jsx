import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login/Login";
import Registro from "./pages/Registro/Registro";
import Dashboard from "./pages/Dashboard/Dashboard";

export default function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("id");
    const username = localStorage.getItem("username");
    const correo = localStorage.getItem("correo");
    const rol = localStorage.getItem("rol");

    return token
      ? {
          token,
          id,
          username,
          correo,
          rol,
        }
      : null;
  });

  const handleLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("id", data.id);
    localStorage.setItem("username", data.username);
    localStorage.setItem("correo", data.correo);
    localStorage.setItem("rol", data.rol);
    localStorage.setItem("user", JSON.stringify(data));

    setUser(data);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
          }
        />

        <Route
          path="/registro"
          element={user ? <Navigate to="/dashboard" /> : <Registro />}
        />

        <Route
          path="/dashboard/*"
          element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}