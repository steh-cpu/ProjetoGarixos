/* =====================================================
   GARIXOS — Painel de Suporte (suporte.js)
   Instalação:
     1. suporte.html → raiz do projeto
     2. css/suporte.css → pasta css/
     3. js/suporte.js  → pasta js/
   Adicione no server.js as rotas de chamados e feedbacks
   conforme descrito no final deste arquivo.
===================================================== */

const API = 'http://localhost:3000';

/* ══════════════════════════════════════
   ESTADO
══════════════════════════════════════ */
let solicitacoes   = [];
let chamados       = [];
let feedbacks      = [];
let usuarios       = [];
let editandoSolId  = null;
let editandoChamId = null;
let editandoUsuarioId = null;
let confirmCallback = null;

/* ══════════════════════════════════════
   INICIALIZAÇÃO
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  carregarNomeUsuario();
  configurarAbas();
  configurarFiltros();
  carregarSolicitacoes();
});

function carregarNomeUsuario() {
  try {
    const u = JSON.parse(localStorage.getItem('garinxoCurrentUser'));
    if (u) document.getElementById('sp-user-name').textContent = u.nome || u.email;
  } catch (e) {}
}

function getUsuarioLogado() {
  try {
    return JSON.parse(localStorage.getItem('garinxoCurrentUser'));
  } catch (e) {
    return null;
  }
}

function isMasterUsuario() {
  const usuario = getUsuarioLogado();
  if (!usuario) return false;
  const perfil = String(usuario.perfil || '').toUpperCase();
  const email = String(usuario.email || '').toLowerCase();
  return perfil === 'MASTER' || email === 'master@garixos.com';
}

/* ══════════════════════════════════════
   ABAS
══════════════════════════════════════ */
function configurarAbas() {
  document.querySelectorAll('.sp-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const tab = this.dataset.tab;

      document.querySelectorAll('.sp-tab').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.sp-panel').forEach(function (p) { p.classList.remove('active'); });

      this.classList.add('active');
      document.getElementById('panel-' + tab).classList.add('active');

      if (tab === 'solicitacoes' && solicitacoes.length === 0) carregarSolicitacoes();
      if (tab === 'chamados'     && chamados.length    === 0) carregarChamados();
      if (tab === 'feedbacks'    && feedbacks.length   === 0) carregarFeedbacks();
      if (tab === 'usuarios'     && usuarios.length    === 0) carregarUsuarios();
    });
  });
}

/* ══════════════════════════════════════
   FILTROS
══════════════════════════════════════ */
function configurarFiltros() {
  document.getElementById('filtro-status-sol').addEventListener('change',   renderSolicitacoes);
  document.getElementById('filtro-tipo-lixo').addEventListener('change',    renderSolicitacoes);
  document.getElementById('filtro-status-cham').addEventListener('change',  renderChamados);
  document.getElementById('filtro-tipo-feed').addEventListener('change',    renderFeedbacks);
  document.getElementById('filtro-busca-usuario').addEventListener('input', renderUsuarios);
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function toast(msg, tipo) {
  const el = document.getElementById('sp-toast');
  el.textContent = msg;
  el.className = 'sp-toast show ' + (tipo || '');
  clearTimeout(el._t);
  el._t = setTimeout(function () { el.classList.remove('show'); }, 3500);
}

/* ══════════════════════════════════════
   BADGE
══════════════════════════════════════ */
function setBadge(id, n) {
  const el = document.getElementById('badge-' + id);
  if (el) el.textContent = n;
}

/* ══════════════════════════════════════
   HELPERS DE STATUS
══════════════════════════════════════ */
function badgeSol(status) {
  const map = {
    PENDENTE: ['sp-badge-pendente', '⏳ Pendente'],
    EM_ANDAMENTO: ['sp-badge-andamento', '🚛 Em Andamento'],
    CONCLUIDO: ['sp-badge-concluido', '✅ Concluído'],
    CANCELADO: ['sp-badge-cancelado', '❌ Cancelado']
  };
  const v = map[status] || ['sp-badge-pendente', status];
  return '<span class="sp-badge ' + v[0] + '">' + v[1] + '</span>';
}

function badgeCham(status) {
  const map = {
    aberto: ['sp-badge-aberto', '🔴 Aberto'],
    em_atendimento: ['sp-badge-atendimento', '🔵 Em Atendimento'],
    resolvido: ['sp-badge-resolvido', '✅ Resolvido']
  };
  const v = map[status] || ['sp-badge-aberto', status];
  return '<span class="sp-badge ' + v[0] + '">' + v[1] + '</span>';
}

function badgeFeed(tipo) {
  const map = {
    sugestao: ['sp-badge-sugestao', '💡 Sugestão'],
    bug:      ['sp-badge-bug',      '🐛 Bug'],
    elogio:   ['sp-badge-elogio',   '⭐ Elogio'],
    outro:    ['sp-badge-outro',    '📌 Outro']
  };
  const v = map[tipo] || ['sp-badge-outro', tipo];
  return '<span class="sp-badge ' + v[0] + '">' + v[1] + '</span>';
}

function badgeUsuario(perfil) {
  const map = {
    CIDADAO:      ['sp-badge-cidadao', 'Cidadão'],
    ADMIN_INTERNO:['sp-badge-admin',   'Admin'],
    MASTER:       ['sp-badge-master',  'Master']
  };
  const v = map[perfil] || ['sp-badge-cidadao', perfil];
  return '<span class="sp-badge ' + v[0] + '">' + v[1] + '</span>';
}

function fmtData(str) {
  if (!str) return '—';
  try { return new Date(str).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
  catch(e) { return str; }
}

/* ══════════════════════════════════════
   ABA: SOLICITAÇÕES
══════════════════════════════════════ */
async function carregarSolicitacoes() {
  mostrarLoading('sol');
  try {
    const r = await fetch(API + '/api/solicitacoes');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    solicitacoes = await r.json();
    setBadge('solicitacoes', solicitacoes.length);
    renderSolicitacoes();
  } catch (e) {
    console.error(e);
    toast('Erro ao carregar solicitações. O servidor está ligado?', 'error');
    esconderLoading('sol');
  }
}

function renderSolicitacoes() {
  const filtroStatus = document.getElementById('filtro-status-sol').value;
  const filtroTipo   = document.getElementById('filtro-tipo-lixo').value;

  let lista = solicitacoes.filter(function (s) {
    const okStatus = !filtroStatus || s.status === filtroStatus;
    const okTipo   = !filtroTipo   || s.tipo_lixo === filtroTipo;
    return okStatus && okTipo;
  });

  const tbody = document.getElementById('body-solicitacoes');
  tbody.innerHTML = '';

  if (lista.length === 0) {
    mostrarVazio('sol'); return;
  }

  lista.forEach(function (s) {
    const usuario  = s.Usuario  ? s.Usuario.nome  || s.Usuario.email : '#' + (s.usuario_id || '—');
    const endereco = s.Endereco ? s.Endereco.logradouro + ', ' + s.Endereco.numero + ' — ' + s.Endereco.bairro : '—';

    tbody.innerHTML += '<tr>' +
      '<td><strong>#' + s.id + '</strong></td>' +
      '<td>' + usuario + '</td>' +
      '<td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="' + endereco + '">' + endereco + '</td>' +
      '<td><span class="sp-tipo">' + (s.tipo_lixo || '—') + '</span></td>' +
      '<td style="white-space:nowrap;">' + fmtData(s.createdAt || s.data_solicitacao) + '</td>' +
      '<td>' + badgeSol(s.status) + '</td>' +
      '<td style="white-space:nowrap;">' +
        '<button class="sp-btn-sm edit" onclick="abrirModalSol(' + s.id + ')">✏️ Editar</button> ' +
        '<button class="sp-btn-sm del"  onclick="confirmarExclusao(\'solicitacao\',' + s.id + ')">🗑️</button>' +
      '</td>' +
    '</tr>';
  });

  mostrarTabela('sol');
}

function abrirModalSol(id) {
  const s = solicitacoes.find(function (x) { return x.id === id; });
  if (!s) return;
  editandoSolId = id;
  document.getElementById('modal-sol-id').textContent = '#' + id;
  document.getElementById('modal-sol-status').value   = s.status || 'PENDENTE';
  document.getElementById('modal-sol-veiculo').value  = s.veiculo_id || '';
  abrirModal('modal-sol');
}

function fecharModalSol() { fecharModal('modal-sol'); editandoSolId = null; }

async function salvarSolicitacao() {
  if (!editandoSolId) return;
  const status     = document.getElementById('modal-sol-status').value;
  const veiculo_id = document.getElementById('modal-sol-veiculo').value || null;

  try {
    const r = await fetch(API + '/api/solicitacoes/' + editandoSolId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, veiculo_id: veiculo_id ? Number(veiculo_id) : null })
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    toast('✅ Solicitação atualizada!', 'success');
    fecharModalSol();
    carregarSolicitacoes();
  } catch (e) {
    toast('Erro ao atualizar solicitação.', 'error');
  }
}

/* ══════════════════════════════════════
   ABA: CHAMADOS
══════════════════════════════════════ */
async function carregarChamados() {
  mostrarLoading('cham');
  try {
    const r = await fetch(API + '/api/suporte');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const registros = await r.json();
    chamados = registros.filter(function (item) { return item.tipo === 'chamado'; });
    setBadge('chamados', chamados.filter(function (c) { return c.status === 'aberto'; }).length);
    renderChamados();
  } catch (e) {
    console.error(e);
    toast('Erro ao carregar chamados.', 'error');
    esconderLoading('cham');
  }
}

function renderChamados() {
  const filtro = document.getElementById('filtro-status-cham').value;
  let lista = chamados.filter(function (c) {
    return !filtro || c.status === filtro;
  });

  const grid = document.getElementById('grid-chamados');
  grid.innerHTML = '';

  if (lista.length === 0) { mostrarVazio('cham'); return; }

  lista.forEach(function (c) {
    grid.innerHTML += '<div class="sp-card">' +
      '<div class="sp-card-top">' +
        '<span class="sp-card-email">✉️ ' + (c.email || '—') + '</span>' +
        '<span class="sp-card-date">' + fmtData(c.createdAt) + '</span>' +
      '</div>' +
      '<div class="sp-card-subject">' + (c.assunto || c.subject || '(sem assunto)') + '</div>' +
      '<div class="sp-card-msg">' + (c.mensagem || c.message || '') + '</div>' +
      '<div class="sp-card-footer">' +
        badgeCham(c.status) +
        '<button class="sp-btn-sm view" onclick="abrirModalCham(' + c.id + ')">👁️ Ver / Responder</button>' +
      '</div>' +
    '</div>';
  });

  mostrarGrid('cham');
}

function abrirModalCham(id) {
  const c = chamados.find(function (x) { return x.id === id; });
  if (!c) return;
  editandoChamId = id;

  document.getElementById('modal-cham-body').innerHTML =
    '<table style="width:100%;font-size:13px;border-collapse:collapse;">' +
      '<tr><td style="padding:6px 0;color:#6b7280;width:100px;">Email</td><td style="color:#111827;font-weight:600;">' + (c.email || '—') + '</td></tr>' +
      '<tr><td style="padding:6px 0;color:#6b7280;">Assunto</td><td>' + (c.assunto || c.subject || '—') + '</td></tr>' +
      '<tr><td style="padding:6px 0;color:#6b7280;">Mensagem</td><td style="color:#374151;">' + (c.mensagem || c.message || '—') + '</td></tr>' +
      '<tr><td style="padding:6px 0;color:#6b7280;">Data</td><td>' + fmtData(c.createdAt) + '</td></tr>' +
    '</table>';

  document.getElementById('modal-cham-status').value = c.status || 'aberto';
  abrirModal('modal-cham');
}

function fecharModalCham() { fecharModal('modal-cham'); editandoChamId = null; }

async function salvarChamado() {
  if (editandoChamId === null) return;
  const status = document.getElementById('modal-cham-status').value;

  try {
    const r = await fetch(API + '/api/suporte/' + editandoChamId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!r.ok) throw new Error();
    toast('✅ Chamado atualizado!', 'success');
    fecharModalCham();
    carregarChamados();
  } catch (e) {
    toast('Erro ao atualizar chamado.', 'error');
  }
}

/* ══════════════════════════════════════
   ABA: FEEDBACKS
══════════════════════════════════════ */
async function carregarFeedbacks() {
  mostrarLoading('feed');
  try {
    const r = await fetch(API + '/api/suporte');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const registros = await r.json();
    feedbacks = registros.filter(function (item) { return item.tipo === 'feedback'; });
    setBadge('feedbacks', feedbacks.length);
    renderFeedbacks();
  } catch (e) {
    toast('Erro ao carregar feedbacks.', 'error');
    esconderLoading('feed');
  }
}

function renderFeedbacks() {
  const filtro = document.getElementById('filtro-tipo-feed').value;
  let lista = feedbacks.filter(function (f) {
    return !filtro || f.tipo === filtro || f.type === filtro;
  });

  const grid = document.getElementById('grid-feedbacks');
  grid.innerHTML = '';

  if (lista.length === 0) { mostrarVazio('feed'); return; }

  lista.forEach(function (f) {
    const tipo = f.tipo || f.type || 'outro';
    grid.innerHTML += '<div class="sp-card">' +
      '<div class="sp-card-top">' +
        '<span class="sp-card-email">✉️ ' + (f.email || '—') + '</span>' +
        '<span class="sp-card-date">' + fmtData(f.createdAt) + '</span>' +
      '</div>' +
      badgeFeed(tipo) +
      '<div class="sp-card-msg">' + (f.mensagem || f.message || '') + '</div>' +
    '</div>';
  });

  mostrarGrid('feed');
}

/* ══════════════════════════════════════
   ABA: USUÁRIOS
══════════════════════════════════════ */
async function carregarUsuarios() {
  mostrarLoading('usu');
  try {
    const r = await fetch(API + '/api/usuarios');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    usuarios = await r.json();
    setBadge('usuarios', usuarios.length);
    renderUsuarios();
  } catch (e) {
    console.error(e);
    toast('Erro ao carregar usuários.', 'error');
    esconderLoading('usu');
  }
}

function renderUsuarios() {
  const busca = (document.getElementById('filtro-busca-usuario').value || '').toLowerCase();
  let lista = usuarios.filter(function (u) {
    return !busca || (u.nome || '').toLowerCase().includes(busca) || (u.email || '').toLowerCase().includes(busca);
  });

  const tbody = document.getElementById('body-usuarios');
  tbody.innerHTML = '';

  if (lista.length === 0) { mostrarVazio('usu'); return; }

  lista.forEach(function (u) {
    const ehMaster = isMasterUsuario();
    const botoes = [];

    if (ehMaster) {
      botoes.push('<button class="sp-btn-sm edit" onclick="abrirModalUsuario(' + u.id + ')">✏️ Editar</button>');
    }

    botoes.push('<button class="sp-btn-sm del" onclick="confirmarExclusao(\'usuario\',' + u.id + ')">🗑️ Excluir</button>');

    tbody.innerHTML += '<tr>' +
      '<td><strong>#' + u.id + '</strong></td>' +
      '<td>' + (u.nome || '—') + '</td>' +
      '<td>' + (u.email || '—') + '</td>' +
      '<td>' + badgeUsuario(u.perfil) + '</td>' +
      '<td style="white-space:nowrap;">' + fmtData(u.createdAt) + '</td>' +
      '<td style="white-space:nowrap;">' + botoes.join(' ') + '</td>' +
    '</tr>';
  });

  mostrarTabela('usu');
}

/* ══════════════════════════════════════
   EXCLUSÃO COM CONFIRMAÇÃO
══════════════════════════════════════ */
function abrirModalUsuario(id) {
  const u = usuarios.find(function (item) { return item.id === id; });
  if (!u) return;

  editandoUsuarioId = id;
  document.getElementById('modal-usuario-id').textContent = '#' + id;
  document.getElementById('modal-usuario-nome').value = u.nome || '';
  document.getElementById('modal-usuario-email').value = u.email || '';
  document.getElementById('modal-usuario-perfil').value = u.perfil || 'CLIENTE';
  abrirModal('modal-usuario');
}

function fecharModalUsuario() { fecharModal('modal-usuario'); editandoUsuarioId = null; }

async function salvarUsuario() {
  if (editandoUsuarioId === null) return;

  const nome = document.getElementById('modal-usuario-nome').value.trim();
  const email = document.getElementById('modal-usuario-email').value.trim();
  const perfil = document.getElementById('modal-usuario-perfil').value;

  try {
    const r = await fetch(API + '/api/usuarios/' + editandoUsuarioId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, perfil })
    });

    if (!r.ok) throw new Error('HTTP ' + r.status);
    toast('✅ Perfil atualizado com sucesso!', 'success');
    fecharModalUsuario();
    carregarUsuarios();
  } catch (e) {
    toast('Erro ao atualizar usuário.', 'error');
  }
}

function confirmarExclusao(tipo, id) {
  const msgs = {
    solicitacao: 'Excluir a solicitação #' + id + '? Esta ação não pode ser desfeita.',
    usuario:     'Excluir o usuário #' + id + '? Esta ação não pode ser desfeita.'
  };

  document.getElementById('modal-confirm-msg').textContent = msgs[tipo] || 'Confirmar exclusão?';
  confirmCallback = function () { executarExclusao(tipo, id); };
  document.getElementById('modal-confirm-ok').onclick = function () {
    fecharModalConfirm();
    confirmCallback && confirmCallback();
  };
  abrirModal('modal-confirm');
}

function fecharModalConfirm() { fecharModal('modal-confirm'); confirmCallback = null; }

async function executarExclusao(tipo, id) {
  const rotas = { solicitacao: '/api/solicitacoes/', usuario: '/api/usuarios/' };
  const rota = rotas[tipo];
  if (!rota) return;

  try {
    const r = await fetch(API + rota + id, { method: 'DELETE' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    toast('✅ ' + (tipo === 'usuario' ? 'Usuário' : 'Solicitação') + ' excluído com sucesso!', 'success');
    if (tipo === 'solicitacao') carregarSolicitacoes();
    if (tipo === 'usuario')     carregarUsuarios();
  } catch (e) {
    toast('Erro ao excluir. Verifique o servidor.', 'error');
  }
}

/* ══════════════════════════════════════
   HELPERS DE UI
══════════════════════════════════════ */
function getGridId(aba) {
  if (aba === 'cham') return 'grid-chamados';
  if (aba === 'feed') return 'grid-feedbacks';
  return 'grid-' + aba;
}

function mostrarLoading(aba) {
  document.getElementById('loading-' + aba).style.display = 'block';
  document.getElementById('empty-'   + aba).style.display = 'none';
  const tw = document.getElementById('tabela-'  + aba + '-wrap');
  const gd = document.getElementById(getGridId(aba));
  if (tw) tw.style.display = 'none';
  if (gd) gd.style.display = 'none';
}

function esconderLoading(aba) {
  document.getElementById('loading-' + aba).style.display = 'none';
}

function mostrarVazio(aba) {
  document.getElementById('loading-' + aba).style.display = 'none';
  document.getElementById('empty-'   + aba).style.display = 'block';
  const tw = document.getElementById('tabela-'  + aba + '-wrap');
  const gd = document.getElementById(getGridId(aba));
  if (tw) tw.style.display = 'none';
  if (gd) gd.style.display = 'none';
}

function mostrarTabela(aba) {
  document.getElementById('loading-' + aba).style.display = 'none';
  document.getElementById('empty-'   + aba).style.display = 'none';
  const tw = document.getElementById('tabela-' + aba + '-wrap');
  if (tw) tw.style.display = 'block';
}

function mostrarGrid(aba) {
  document.getElementById('loading-' + aba).style.display = 'none';
  document.getElementById('empty-'   + aba).style.display = 'none';
  const gd = document.getElementById(getGridId(aba));
  if (gd) gd.style.display = 'grid';
}

function abrirModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); }
}

function fecharModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); }
}

/* Fecha modal ao clicar fora */
document.addEventListener('click', function (e) {
  ['modal-sol', 'modal-cham', 'modal-confirm', 'modal-usuario'].forEach(function (id) {
    const m = document.getElementById(id);
    if (m && e.target === m) fecharModal(id);
  });
});
