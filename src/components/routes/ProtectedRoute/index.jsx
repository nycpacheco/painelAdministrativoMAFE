// src/components/routes/ProtectedRoute/index.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { api } from '../../../services/api';

export function ProtectedRoute() {
  const estaAutenticado = api.auth.verificarSessao();

  // Se estiver logado na coordenação, permite o acesso ao painel. Senão, redireciona ao login.
  return estaAutenticado ? <Outlet /> : <Navigate to="/login" replace />;
}