// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/routes/Login";
import { AdminDashboard } from "./components/routes/AdminDashboard";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Rota de Login do Painel Administrativo */}
        <Route path="/login" element={<Login />} />

        {/* 2. Rotas Protegidas do Painel Admin (Exigem autenticação ativa) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* 3. Redirecionamento padrão: qualquer rota cai no login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
