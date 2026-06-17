import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../../componentes/Navbar/Navbar";
import Inventario from "../../componentes/Inventario/Inventario";
import Pedidos from "../../componentes/Pedidos/Pedidos";
import Envios from "../../componentes/Envios/Envios";
import Notificaciones from "../../componentes/Notificaciones/Notificaciones";
import Proveedores from "../../componentes/Proveedores/Proveedores";
import Bodegas from "../../componentes/Bodegas/Bodegas";


export default function Dashboard({ user, onLogout }) {
  const rol = user?.rol;
  const defaultRoute = rol === "PROVEEDOR" ? "proveedores" : "inventario";

  return (
    <div className="page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="content">
        <Routes>
          <Route
            path="inventario"
            element={
              <>
                <h1 className="page-title">Inventario</h1>
                <Inventario />
              </>
            }
          />

          <Route
            path="pedidos"
            element={
              <>
                <h1 className="page-title">Pedidos</h1>
                <Pedidos user={user} />
              </>
            }
          />

          <Route
            path="envios"
            element={
              <>
                <h1 className="page-title">Envíos</h1>
                <Envios />
              </>
            }
          />

          <Route
            path="notificaciones"
            element={
              <>
                <h1 className="page-title">Notificaciones</h1>
                <Notificaciones user={user} />
              </>
            }
          />

          <Route
            path="proveedores"
            element={
              <>
                <h1 className="page-title">Proveedores</h1>
                <Proveedores />
              </>
            }
          />

          <Route
            path="bodegas"
            element={
              <>
                <h1 className="page-title">Bodegas</h1>
                <Bodegas />
              </>
            }
          />

          <Route path="*" element={<Navigate to={defaultRoute} />} />
        </Routes>
      </div>
    </div>
  );
}