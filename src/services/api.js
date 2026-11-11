// src/services/api.js
// Camada de API e Integração com o Backend Flask / MySQL para o Front-end MAFE.
// Integração real com as rotas HTTP da API Flask com contingência automática
// caso o servidor Python local ainda não tenha sido iniciado ou o banco não esteja conectado.

// =========================================================================
// >>> [COLOCAR ROTA DE CONEXAO AQUI] <<<
// Altere a URL abaixo para apontar para o seu backend Flask (local ou em produção):
export const API_BASE_URL = 'http://localhost:5000/api'; // <<< [COLOCAR ROTA DE CONEXAO AQUI]

// =========================================================================
// >>> [COMO PARAR DE USAR O ARMAZENAMENTO LOCAL SIMULADO] <<<
// - true  (Padrão atual): Se o backend estiver desligado, usa localStorage automaticamente.
// - false (Produção/Banco Real): DESATIVA completamente a simulação. Se o backend ou banco
//   estiverem offline, o front-end acusará erro na tela em vez de simular os dados.
export const USAR_STORAGE_CONTINGENCIA = false;
// =========================================================================

const URL_PLACEHOLDER = "https://images.unsplash.com/photo-1559234938-b60fff04894d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D";

const DADOS_INICIAIS = {
  categorias: [
    { id: 1, nome: 'Competições e Torneios' },
    { id: 2, nome: 'Treinos Semanais' },
    { id: 3, nome: 'Eventos e Confraternizações' }
  ],
  midias: [
    { 
      id: 1, 
      categoria_id: 1, 
      titulo: 'Final do Torneio Regional de Vôlei', 
      descricao: 'Momento da final disputada pela equipe.', 
      url_midia: URL_PLACEHOLDER, 
      tipo_midia: 'foto', 
      ano: 2026, 
      visualizacoes: 125, 
      ativo: true 
    },
    { 
      id: 2, 
      categoria_id: 2, 
      titulo: 'Treinamento de Fundamentos e Saques', 
      descricao: 'Exercícios práticos de manchete, toque e aperfeiçoamento de saque na quadra.', 
      url_midia: URL_PLACEHOLDER, 
      tipo_midia: 'foto', 
      ano: 2026, 
      visualizacoes: 94, 
      ativo: true 
    },
    { 
      id: 3, 
      categoria_id: 1, 
      titulo: 'Melhores Momentos do Triangular de Vôlei', 
      descricao: 'Resumo em vídeo com as jogadas mais emocionantes do triangular municipal.', 
      url_midia: URL_PLACEHOLDER, 
      tipo_midia: 'video', 
      ano: 2025, 
      visualizacoes: 310, 
      ativo: true 
    },
    { 
      id: 4, 
      categoria_id: 3, 
      titulo: 'Café de Aniversário do Grupo', 
      descricao: 'Comemoração especial dos aniversariantes do trimestre com muita integração e alegria.', 
      url_midia: URL_PLACEHOLDER, 
      tipo_midia: 'foto', 
      ano: 2025, 
      visualizacoes: 180, 
      ativo: true 
    },
    { 
      id: 5, 
      categoria_id: 2, 
      titulo: 'Atividade de Alongamento e Mobilidade', 
      descricao: 'Sessão preventiva focada em flexibilidade, postura e bem-estar antes do treino.', 
      url_midia: URL_PLACEHOLDER, 
      tipo_midia: 'foto', 
      ano: 2026, 
      visualizacoes: 65, 
      ativo: true 
    },
    { 
      id: 6, 
      categoria_id: 1, 
      titulo: 'Entrega de Medalhas do Festival de Verão', 
      descricao: 'Registro da cerimônia de premiação e entrega de medalhas simbólicas para os atletas.', 
      url_midia: URL_PLACEHOLDER, 
      tipo_midia: 'foto', 
      ano: 2026, 
      visualizacoes: 215, 
      ativo: true 
    }
  ],
  apoiadores: [
    { 
      id: 1, 
      nome_empresa: 'Prefeitura de Bragança Paulista', 
      descricao: 'Apoio institucional (SEMJEL).', 
      logo_url: URL_PLACEHOLDER, 
      site_url: 'https://braganca.sp.gov.br',
      visualizacoes: 120,
      ativo: true 
    },
    { 
      id: 2, 
      nome_empresa: 'Panificadora Trigo de Ouro', 
      descricao: 'Parceiro oficial fornecendo lanches de integração para os atletas após os treinos.', 
      logo_url: URL_PLACEHOLDER, 
      site_url: 'https://instagram.com',
      visualizacoes: 12,
      ativo: true 
    },
    { 
      id: 3, 
      nome_empresa: 'Clínica de Fisioterapia Movimento & Saúde', 
      descricao: 'Suporte preventivo e acompanhamento fisioterapêutico para os integrantes do projeto.', 
      logo_url: URL_PLACEHOLDER, 
      site_url: 'https://instagram.com',
      visualizacoes: 100,
      ativo: true 
    },
    { 
      id: 4, 
      nome_empresa: 'Academia Vida Ativa', 
      descricao: 'Espaço parceiro focado em condicionamento físico e bem-estar para a terceira idade.', 
      logo_url: URL_PLACEHOLDER, 
      site_url: 'https://instagram.com',
      visualizacoes: 253,
      ativo: true 
    },
    { 
      id: 5, 
      nome_empresa: 'Drogaria Bragança', 
      descricao: 'Patrocinador oficial de kits de primeiros socorros e hidratação para torneios.', 
      logo_url: URL_PLACEHOLDER, 
      site_url: 'https://instagram.com',
      visualizacoes: 1321,
      ativo: true 
    },
    { 
      id: 6, 
      nome_empresa: 'Hortifruti São José', 
      descricao: 'Fornecimento semanal de frutas para o consumo dos atletas durante os treinos na quadra.', 
      logo_url: URL_PLACEHOLDER, 
      site_url: 'https://maps.google.com/?q=Hortifruti+Braganca',
      visualizacoes: 10,
      ativo: true 
    }
  ],
  estatisticas: {
    quantidade_participantes: 48,
    quantidade_torneios: 14,
    ano_fundacao: 2019
  }
};

// Funções locais de contingência
const obterDoStorage = (chave) => {
  const dados = localStorage.getItem(`mafe_${chave}`);
  if (!dados) {
    localStorage.setItem(`mafe_${chave}`, JSON.stringify(DADOS_INICIAIS[chave]));
    return DADOS_INICIAIS[chave];
  }
  const parsed = JSON.parse(dados);
  if (chave === 'apoiadores' && Array.isArray(parsed)) {
    let migrado = false;
    const sanitizado = parsed.map(item => {
      if ('maps_url' in item) {
        migrado = true;
        const { maps_url, ...resto } = item;
        return {
          ...resto,
          site_url: item.site_url || maps_url || ''
        };
      }
      return item;
    });
    if (migrado) {
      localStorage.setItem(`mafe_apoiadores`, JSON.stringify(sanitizado));
      return sanitizado;
    }
  }
  return parsed;
};

const salvarNoStorage = (chave, dados) => {
  localStorage.setItem(`mafe_${chave}`, JSON.stringify(dados));
};

// Helper genérico para requisições com timeout rápido e fallback transparente
async function executarRequisicao(endpoint, opcoes = {}, fallbackFn = null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 segundos de timeout

  try {
    const token = localStorage.getItem('mafe_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(opcoes.headers || {})
    };

    const resposta = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...opcoes,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const json = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      const mensagemErro = (json && (json.mensagem || json.error)) || `Erro HTTP ${resposta.status}`;
      throw new Error(mensagemErro);
    }

    return json?.dados !== undefined ? json.dados : json;
  } catch (erro) {
    clearTimeout(timeoutId);

    // Se o backend retornar erro da regra de negócio (ex: 400 Bad Request / 401 Unauthorized), repassa o erro
    if (erro.message && !erro.message.includes('fetch') && !erro.message.includes('abort') && !erro.message.includes('NetworkError')) {
      throw erro;
    }

    // Se for erro de rede (backend ainda não iniciado, servidor fora do ar ou sem conexão):
    if (USAR_STORAGE_CONTINGENCIA && fallbackFn) {
      console.warn(`[MAFE API] Backend offline em ${API_BASE_URL}${endpoint}. Usando dados simulados locais:`, erro.message);
      return await fallbackFn();
    }

    // Se a contingência estiver desativada (produção/banco real), propaga o erro de conexão real para a UI:
    throw new Error(`Falha de conexão com a API em '${API_BASE_URL}${endpoint}'. Verifique se o servidor backend e o banco de dados online estão ativos.`);
  }
}

// Objeto principal da API consumido pelo Front-end
export const api = {
  // --- CATEGORIAS ---
  categorias: {
    listar: async () => {
      return executarRequisicao('/admin/categorias', { method: 'GET' }, async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return obterDoStorage('categorias');
      });
    },

    criar: async (novaCategoria) => {
      return executarRequisicao(
        '/admin/categorias',
        {
          method: 'POST',
          body: JSON.stringify({ nome: novaCategoria.nome })
        },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          const categorias = obterDoStorage('categorias');
          const existe = categorias.some(c => c.nome.toLowerCase() === novaCategoria.nome.trim().toLowerCase());
          if (existe) {
            throw new Error('Já existe uma categoria cadastrada com este nome.');
          }
          const categoriaComId = { id: Date.now(), ...novaCategoria, nome: novaCategoria.nome.trim() };
          categorias.push(categoriaComId);
          salvarNoStorage('categorias', categorias);
          return categoriaComId;
        }
      );
    },

    atualizar: async (id, dadosAtualizados) => {
      return executarRequisicao(
        `/admin/categorias/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ nome: dadosAtualizados.nome })
        },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          let categorias = obterDoStorage('categorias');
          categorias = categorias.map(c => String(c.id) === String(id) ? { ...c, ...dadosAtualizados } : c);
          salvarNoStorage('categorias', categorias);
          return categorias.find(c => String(c.id) === String(id));
        }
      );
    },

    deletar: async (id) => {
      return executarRequisicao(
        `/admin/categorias/${id}`,
        { method: 'DELETE' },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          const midias = obterDoStorage('midias');
          const midiasVinculadas = midias.filter(m => String(m.categoria_id) === String(id));
          if (midiasVinculadas.length > 0) {
            throw new Error(`Não é possível excluir esta categoria: existem ${midiasVinculadas.length} mídia(s) vinculada(s) a ela (restrição ON DELETE RESTRICT do banco). Remova ou reclassifique as mídias primeiro.`);
          }
          let categorias = obterDoStorage('categorias');
          categorias = categorias.filter(c => String(c.id) !== String(id));
          salvarNoStorage('categorias', categorias);
          return { success: true };
        }
      );
    }
  },

  // --- MÍDIAS ---
  midias: {
    listar: async () => {
      return executarRequisicao('/admin/midias', { method: 'GET' }, async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return obterDoStorage('midias');
      });
    },

    criar: async (novaMidia) => {
      return executarRequisicao(
        '/admin/midias',
        {
          method: 'POST',
          body: JSON.stringify({
            categoria_id: Number(novaMidia.categoria_id),
            titulo: novaMidia.titulo,
            descricao: novaMidia.descricao || '',
            url_midia: novaMidia.url_midia,
            tipo_midia: novaMidia.tipo_midia || 'foto',
            ano: Number(novaMidia.ano || 2026)
          })
        },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          const midias = obterDoStorage('midias');
          const midiaComId = { 
            id: Date.now(), 
            visualizacoes: 0, 
            ativo: true, 
            criado_em: new Date().toISOString(),
            ...novaMidia 
          };
          midias.push(midiaComId);
          salvarNoStorage('midias', midias);
          return midiaComId;
        }
      );
    },

    atualizar: async (id, dadosAtualizados) => {
      return executarRequisicao(
        `/admin/midias/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(dadosAtualizados)
        },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          let midias = obterDoStorage('midias');
          midias = midias.map(m => String(m.id) === String(id) ? { ...m, ...dadosAtualizados } : m);
          salvarNoStorage('midias', midias);
          return midias.find(m => String(m.id) === String(id));
        }
      );
    },

    deletar: async (id) => {
      return executarRequisicao(
        `/admin/midias/${id}`,
        { method: 'DELETE' },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          let midias = obterDoStorage('midias');
          midias = midias.filter(m => String(m.id) !== String(id));
          salvarNoStorage('midias', midias);
          return { success: true };
        }
      );
    }
  },

  // --- APOIADORES ---
  apoiadores: {
    listar: async () => {
      return executarRequisicao('/admin/apoiadores', { method: 'GET' }, async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return obterDoStorage('apoiadores');
      });
    },

    criar: async (novoApoiador) => {
      return executarRequisicao(
        '/admin/apoiadores',
        {
          method: 'POST',
          body: JSON.stringify({
            nome_empresa: novoApoiador.nome_empresa,
            descricao: novoApoiador.descricao || '',
            logo_url: novoApoiador.logo_url,
            site_url: novoApoiador.site_url || null
          })
        },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          const apoiadores = obterDoStorage('apoiadores');
          const apoiadorComId = { id: Date.now(), visualizacoes: 0, ativo: true, ...novoApoiador };
          apoiadores.push(apoiadorComId);
          salvarNoStorage('apoiadores', apoiadores);
          return apoiadorComId;
        }
      );
    },

    atualizar: async (id, dadosAtualizados) => {
      return executarRequisicao(
        `/admin/apoiadores/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(dadosAtualizados)
        },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          let apoiadores = obterDoStorage('apoiadores');
          apoiadores = apoiadores.map(a => String(a.id) === String(id) ? { ...a, ...dadosAtualizados } : a);
          salvarNoStorage('apoiadores', apoiadores);
          return apoiadores.find(a => String(a.id) === String(id));
        }
      );
    },

    deletar: async (id) => {
      return executarRequisicao(
        `/admin/apoiadores/${id}`,
        { method: 'DELETE' },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          let apoiadores = obterDoStorage('apoiadores');
          apoiadores = apoiadores.filter(a => String(a.id) !== String(id));
          salvarNoStorage('apoiadores', apoiadores);
          return { success: true };
        }
      );
    }
  },

  // --- ESTATÍSTICAS ---
  estatisticas: {
    obter: async () => {
      return executarRequisicao('/admin/estatisticas', { method: 'GET' }, async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return obterDoStorage('estatisticas');
      });
    },

    atualizar: async (novosDados) => {
      return executarRequisicao(
        '/admin/estatisticas',
        {
          method: 'PUT',
          body: JSON.stringify(novosDados)
        },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          salvarNoStorage('estatisticas', novosDados);
          return novosDados;
        }
      );
    }
  },

  // --- AUTENTICAÇÃO ---
  auth: {
    login: async (usuario, senha) => {
      const usuarioLimpo = (usuario || '').trim();
      return executarRequisicao(
        '/login',
        {
          method: 'POST',
          body: JSON.stringify({ usuario: usuarioLimpo, senha: String(senha) })
        },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 300));
          if (usuarioLimpo === 'coordenacao' && senha === '123456') {
            localStorage.setItem('mafe_autenticado', 'true');
            localStorage.setItem('mafe_token', 'token_jwt_simulado');
            return { success: true, usuario: usuarioLimpo };
          } else {
            throw new Error('Usuário ou senha incorretos!');
          }
        }
      ).then(dados => {
        localStorage.setItem('mafe_autenticado', 'true');
        if (dados && dados.token) {
          localStorage.setItem('mafe_token', dados.token);
        }
        return { success: true, usuario: usuarioLimpo };
      });
    },

    logout: async () => {
      localStorage.removeItem('mafe_autenticado');
      localStorage.removeItem('mafe_token');
    },

    verificarSessao: () => {
      return localStorage.getItem('mafe_autenticado') === 'true';
    }
  }
};

export default api;
