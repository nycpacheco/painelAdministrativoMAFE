// src/components/routes/AdminDashboard/index.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { ConfirmModal } from '../../ui/ConfirmModal';
import styles from './AdminDashboard.module.css';

// Importando os componentes de cada aba
import { MidiasTab } from '../../tabs/MidiasTab';
import { CategoriasTab } from '../../tabs/CategoriasTab';
import { ApoiadoresTab } from '../../tabs/ApoiadoresTab';
import { EstatisticasTab } from '../../tabs/EstatisticasTab';

//importanto logo
import logo from '../../../assets/imgs/brandLogo.jpeg'

// =========================================================================
// URL DO SITE PÚBLICO:
// Altere o link abaixo para a URL definitiva do site público quando desejar:
const URL_SITE_PUBLICO = 'https://site-mafe-v2.vercel.app/';
// =========================================================================

export function AdminDashboard() {
  const [abaAtiva, setAbaAtiva] = useState('midias');
  const [modalLogoutAberto, setModalLogoutAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const navigate = useNavigate();

  const handleConfirmarLogout = async () => {
    setSaindo(true);
    try {
      await api.auth.logout();
      navigate('/login');
    } finally {
      setSaindo(false);
      setModalLogoutAberto(false);
    }
  };

  const renderizarAba = () => {
    switch (abaAtiva) {
      case 'midias':
        return <MidiasTab />;
      case 'categorias':
        return <CategoriasTab />;
      case 'apoiadores':
        return <ApoiadoresTab />;
      case 'estatisticas':
        return <EstatisticasTab />;
      default:
        return <MidiasTab />;
    }
  };

  const titulosAbas = {
    midias: 'Galeria de Mídias e Momentos',
    categorias: 'Categorias de Eventos e Torneios',
    apoiadores: 'Apoiadores e Patrocinadores',
    estatisticas: 'Estatísticas do Time'
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Menu Lateral Fixo com o tamanho da tela */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.brandContainer}>
            <div className={styles.brandIcon}><img className={styles.logoImg} src={ logo } alt="Logo Maturidade Feliz" /></div>
            <div>
              <h2 className={styles.sidebarTitle}>Painel MAFE</h2>
              <span className={styles.teamSubtitle}>Maturidade Feliz</span>
            </div>
          </div>

          <nav className={styles.navMenu}>
            <ul className={styles.navList}>
              <li>
                <button 
                  type="button" 
                  onClick={() => setAbaAtiva('midias')}
                  className={`${styles.navButton} ${abaAtiva === 'midias' ? styles.navButtonActive : ''}`}
                >
                  <span className={styles.buttonIcon}>📁</span> Mídias (Galeria)
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => setAbaAtiva('categorias')}
                  className={`${styles.navButton} ${abaAtiva === 'categorias' ? styles.navButtonActive : ''}`}
                >
                  <span className={styles.buttonIcon}>🏷️</span> Categorias
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => setAbaAtiva('apoiadores')}
                  className={`${styles.navButton} ${abaAtiva === 'apoiadores' ? styles.navButtonActive : ''}`}
                >
                  <span className={styles.buttonIcon}>🤝</span> Apoiadores
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => setAbaAtiva('estatisticas')}
                  className={`${styles.navButton} ${abaAtiva === 'estatisticas' ? styles.navButtonActive : ''}`}
                >
                  <span className={styles.buttonIcon}>📊</span> Estatísticas
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Rodapé Fixo na parte inferior com botão direto para o site público e sair */}
        <div className={styles.sidebarFooter}>
          <a 
            href={URL_SITE_PUBLICO} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.publicSiteButton}
            title="Ir para o Site Público"
          >
            Ir para o Site Público ↗
          </a>

          <button 
            type="button" 
            onClick={() => setModalLogoutAberto(true)} 
            className={styles.logoutButton}
          >
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal com scroll independente */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <span className={styles.badge}>Coordenação Técnica</span>
          <h1 className={styles.title}>{titulosAbas[abaAtiva] || 'Painel Administrativo'}</h1>
        </header>

        <div className={styles.card}>
          {renderizarAba()}
        </div>
      </main>

      {/* Modal de confirmação seguro para logout */}
      <ConfirmModal
        isOpen={modalLogoutAberto}
        titulo="Sair da Coordenação"
        mensagem="Deseja realmente desconectar e sair do painel administrativo do MAFE?"
        tipo="aviso"
        textoConfirmar="Sim, Sair"
        onConfirm={handleConfirmarLogout}
        onCancel={() => setModalLogoutAberto(false)}
        carregando={saindo}
      />
    </div>
  );
}