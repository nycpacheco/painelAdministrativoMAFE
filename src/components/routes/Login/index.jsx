// src/components/routes/Login/index.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import styles from './Login.module.css';
import logo from '../../../assets/imgs/brandLogo.jpeg'

export function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (carregando) return;

    setErro(null);

    const usuarioLimpo = usuario.trim();
    if (!usuarioLimpo || !senha) {
      setErro('Preencha os campos de usuário e senha.');
      return;
    }

    setCarregando(true);
    try {
      await api.auth.login(usuarioLimpo, senha);
      navigate('/admin');
    } catch (err) {
      setErro(err.message || 'Usuário ou senha incorretos! Verifique os dados informados.');
    } finally {
      setCarregando(false);
    }
  };

  const preencherAcessoRapido = () => {
    setUsuario('coordenacao');
    setSenha('123456');
    setErro(null);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.brandIcon}><img className={styles.logoImg} src={logo} alt="logo maturidade feliz" /></div>
          <h2 className={styles.loginTitle}>Painel MAFE</h2>
          <p className={styles.loginSubtitle}>Acesso Exclusivo da Coordenação</p>
        </div>

        {erro && (
          <div className={styles.errorMessage} role="alert">
            <span>⚠️ {erro}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className={styles.loginForm} noValidate>
          <div className={styles.inputGroup}>
            <label htmlFor="usuarioInput">Usuário</label>
            <input 
              id="usuarioInput"
              type="text" 
              value={usuario} 
              onChange={(e) => {
                setUsuario(e.target.value);
                if (erro) setErro(null);
              }} 
              placeholder="Ex: coordenacao"
              required
              disabled={carregando}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="senhaInput">Senha</label>
            <input 
              id="senhaInput"
              type="password" 
              value={senha} 
              onChange={(e) => {
                setSenha(e.target.value);
                if (erro) setErro(null);
              }} 
              placeholder="••••••••"
              required
              disabled={carregando}
              className={styles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={carregando} 
            className={styles.loginButton}
          >
            {carregando ? 'Validando Acesso...' : 'Entrar no Painel Admin'}
          </button>
        </form>

        <div className={styles.demoCredentialsBox}>
          <p className={styles.demoTitle}>Credenciais de Acesso:</p>
          <p className={styles.demoText}>Usuário: <code>coordenacao</code> | Senha: <code>123456</code></p>
          <button 
            type="button" 
            onClick={preencherAcessoRapido} 
            className={styles.fillCredentialsBtn}
            disabled={carregando}
          >
            Preencher automaticamente
          </button>
        </div>
      </div>
    </div>
  );
}