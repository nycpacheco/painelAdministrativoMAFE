
// src/components/routes/ProtectedRoute/index.jsx

import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { api } from '../../../services/api';

export function ProtectedRoute() {
  const [autenticado, setAutenticado] = useState(null);

  useEffect(() => {
    let ativo = true;

    async function verificarAcesso() {
      try {
        const valido = await api.auth.verificarSessao();

        if (ativo) {
          setAutenticado(valido);
        }
      } catch {
        if (ativo) {
          setAutenticado(false);
        }
      }
    }

    verificarAcesso();

    return () => {
      ativo = false;
    };
  }, []);

  // Enquanto o servidor verifica a autenticação, não libera o painel.
  if (autenticado === null) {
    return <div>Verificando autenticação...</div>;
  }

  return autenticado
    ? <Outlet />
    : <Navigate to="/login" replace />;
}
