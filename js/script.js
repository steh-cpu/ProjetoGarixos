    // ========== VARIÁVEIS GLOBAIS ==========
    const sessionKey = 'garinxoCurrentUser';
    let notificationCount = 0;
    let isElderly = false;
    let map = null;
    let trucks = []; // Array de caminhões

    // ========== VERIFICAÇÃO DE SESSÃO ==========
// ========== VERIFICAÇÃO DE SESSÃO COM API ==========
    function getCurrentUser() {
      const userStr = localStorage.getItem(sessionKey); // Pega o JSON salvo no login
      if (!userStr) return null;
      try {
        return JSON.parse(userStr); // Devolve o objeto { id, nome, email, perfil }
      } catch (e) {
        return null;
      }
    }

    function getFirstName(fullName) {
      return fullName ? fullName.trim().split(' ')[0] : 'Usuário';
    }

    function updateHeaderUser() {
      const userLink = document.getElementById('userLink');
      const logoutLink = document.getElementById('logoutLink');
      const user = getCurrentUser();
      
      if (!user) {
        if (userLink) {
          userLink.textContent = 'Entrar';
          userLink.href = 'index.html';
        }
        if (logoutLink) logoutLink.style.display = 'none';
        return;
      }

      if (userLink) {
        // Agora usamos user.nome porque é assim que vem do PostgreSQL
        userLink.textContent = getFirstName(user.nome); 
        userLink.href = '#';
      }
      if (logoutLink) logoutLink.style.display = 'inline-block';
    }

    function verifySession() {
      const user = getCurrentUser();
      // Se não houver usuário logado válido, joga de volta pro login
      if (!user) {
        window.location.href = 'index.html';
        return;
      }
      updateHeaderUser();
    }

    // ========== LOGOUT ==========
    function logout(e) {
      e.preventDefault();
      localStorage.removeItem(sessionKey);
      window.location.href = 'index.html';
    }

    // ========== NOTIFICAÇÕES EM TEMPO REAL ==========
    const notificationMessages = [
      '🚛 O caminhão está próximo ao seu bairro',
      '📢 Nova rota de coleta disponível',
      '✅ Coleta concluída com sucesso',
      '⏰ Lembrete: coleta em sua região acontece amanhã',
      '🌍 Você ajudou a economizar 15kg de lixo',
      '📍 Novo ponto de coleta aberto próximo a você'
    ];

    function generateNotification() {
  const msg = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  addNotification(msg, time);
  updateNotificationUI();
  showNotificationToast();
}
function showNotificationToast() {
  const toast = document.getElementById('notificationToast');

  if (!toast) return;

  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

    function addNotification(message, time) {
      const list = document.getElementById('notificationList');
      
      // Remove mensagem "vazia" se existir
      const emptyMsg = list.querySelector('.notification-empty');
      if (emptyMsg) emptyMsg.remove();

      const item = document.createElement('div');
      item.className = 'notification-item';
      item.innerHTML = `
        <div class="notification-message">${message}</div>
        <div class="notification-time">${time}</div>
      `;
      list.prepend(item);

      notificationCount++;
      updateBadge();

      // Manter apenas as últimas 5 notificações
      while (list.children.length > 5) {
        list.removeChild(list.lastChild);
      }
    }

    function updateBadge() {
      const badge = document.getElementById('notificationBadge');
      if (notificationCount > 0) {
        badge.textContent = notificationCount > 9 ? '9+' : notificationCount;
        badge.style.display = 'inline-grid';
      }
    }

    function updateNotificationUI() {
      const list = document.getElementById('notificationList');
      if (list.children.length === 0) {
        list.innerHTML = '<p class="notification-empty">Nenhuma notificação no momento</p>';
        notificationCount = 0;
        document.getElementById('notificationBadge').style.display = 'none';
      }
    }

    // Gerar notificação a cada 1 minuto
    setInterval(generateNotification, 60000);
    // Gerar uma notificação inicial
    setTimeout(() => generateNotification(), 2000);

    // ========== DROPDOWN DE NOTIFICAÇÕES ==========
    document.getElementById('notificationBtn').addEventListener('click', () => {
      const dropdown = document.getElementById('notificationDropdown');
      const btn = document.getElementById('notificationBtn');
      const isOpen = dropdown.classList.toggle('open');
      
      btn.setAttribute('aria-expanded', isOpen);
      dropdown.setAttribute('aria-hidden', !isOpen);
      
      // Remove badge ao abrir
      if (isOpen) {
        notificationCount = 0;
        document.getElementById('notificationBadge').style.display = 'none';
      }
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
      const bell = document.querySelector('.notification-bell');
      const dropdown = document.getElementById('notificationDropdown');
      if (!bell.contains(e.target) && dropdown.classList.contains('open')) {
        dropdown.classList.remove('open');
        document.getElementById('notificationBtn').setAttribute('aria-expanded', 'false');
        dropdown.setAttribute('aria-hidden', 'true');
      }
    });

// ========== HISTÓRICO CONECTADO À API ==========
// ========== HISTÓRICO CONECTADO À API ==========
    async function renderHistorico() {
      const historyBody = document.getElementById('historicoBody');
      if (!historyBody) return;
      
      const user = getCurrentUser();
      if (!user) return;

      // Exibe uma mensagem visual de carregamento enquanto o fetch responde
      historyBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:2rem; color:var(--text-muted);">Carregando histórico...</td></tr>';

      try {
        const resposta = await fetch('http://localhost:3000/api/solicitacoes');
        if (!resposta.ok) throw new Error('Erro ao buscar dados do servidor');
        
        const todasSolicitacoes = await resposta.json();
        
        // Filtra no front-end para garantir que o cidadão veja apenas os seus próprios pedidos
        const minhasSolicitacoes = todasSolicitacoes.filter(item => item.usuario_id === user.id);

        historyBody.innerHTML = '';

        if (minhasSolicitacoes.length === 0) {
          historyBody.innerHTML = `
            <tr>
              <td colspan="4" style="text-align:center; color: var(--text-muted); padding: 2rem;">Nenhuma solicitação de coleta registrada ainda.</td>
            </tr>
          `;
          return;
        }

        // Alimenta a tabela dinamicamente
        minhasSolicitacoes.forEach(item => {
          const dataCriacao = new Date(item.createdAt);
          const dataFormatada = dataCriacao.toLocaleDateString('pt-BR');
          const horaFormatada = dataCriacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          
          // Captura os dados do Eager Loading (LEFT JOIN) que o Sequelize gerou
          const localFormatado = item.Endereco 
            ? `${item.Endereco.logradouro}, ${item.Endereco.numero} - ${item.Endereco.bairro}`
            : 'Endereço não identificado';

          // Mapeia e estiliza as badges de status vindas do ENUM do banco
          const statusLower = item.status ? item.status.toLowerCase() : 'pendente';
          let statusClass = '';
          let statusTexto = '⏳ Pendente';

          if (statusLower === 'concluido' || statusLower === 'concluído') {
            statusClass = 'completed';
            statusTexto = '✅ Concluído';
          } else if (statusLower === 'em_andamento') {
            statusTexto = '🚛 Em Andamento';
          }

          // NOVIDADE: Botão de cancelar criado apenas para pedidos pendentes
          const botaoCancelar = statusLower === 'pendente' || statusLower === 'pendente'
            ? `<button onclick="cancelarSolicitacao(${item.id})" style="background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 0.8rem; margin-top: 8px; display: block; width: 100%; transition: 0.3s;">Cancelar</button>`
            : '';

          historyBody.innerHTML += `
            <tr>
              <td>${dataFormatada}</td>
              <td>${horaFormatada}</td>
              <td>${localFormatado} <small style="display:block; color:var(--text-muted);">${item.tipo_lixo}</small></td>
              <td>
                <span class="status-badge ${statusClass}">${statusTexto}</span>
                ${botaoCancelar}
              </td>
            </tr>
          `;
        });
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        historyBody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align:center; color:red; padding: 2rem;">Erro ao conectar com a API de histórico.</td>
          </tr>
        `;
      }
    }
    // ========== CANCELAR SOLICITAÇÃO ==========
    async function cancelarSolicitacao(id) {
      // Pede confirmação para evitar cliques acidentais
      const confirmar = confirm('Tem certeza que deseja cancelar esta solicitação de coleta?');
      if (!confirmar) return;

      try {
        const resposta = await fetch(`http://localhost:3000/api/solicitacoes/${id}`, {
          method: 'DELETE'
        });

        if (resposta.ok) {
          alert('✅ Solicitação cancelada com sucesso!');
          renderHistorico(); // Recarrega a tabela automaticamente para a linha sumir
        } else {
          const erro = await resposta.json();
          alert('Erro ao cancelar: ' + (erro.mensagem || 'Tente novamente.'));
        }
      } catch (error) {
        console.error('Erro ao cancelar solicitação:', error);
        alert('Erro de conexão com o servidor.');
      }
    }

    function openHistorico() {
      renderHistorico(); // Dispara o carregamento assíncrono da API
      document.getElementById('historicoModal').classList.add('open');
      document.getElementById('historicoModal').setAttribute('aria-hidden', 'false');
    }
    function closeHistorico() {
      document.getElementById('historicoModal').classList.remove('open');
      document.getElementById('historicoModal').setAttribute('aria-hidden', 'true');
    }

    function openMapa() {
  document.getElementById("mapaModal").classList.add("open");
  document.getElementById("mapaModal").setAttribute("aria-hidden", "false");

  setTimeout(() => {
    initMap();
  }, 300);
}
    function closeMapa() {
      document.getElementById('mapaModal').classList.remove('open');
      document.getElementById('mapaModal').setAttribute('aria-hidden', 'true');
    }

// Função nova para buscar endereços no banco
    async function carregarEnderecosDropdown() {
      const selectEndereco = document.getElementById('endereco');
      const user = getCurrentUser();
      if (!user || !selectEndereco) return;

      try {
        const resposta = await fetch('http://localhost:3000/api/enderecos');
        const todosEnderecos = await resposta.json();
        
        // Filtra só os endereços do usuário atual
        const meusEnderecos = todosEnderecos.filter(end => end.usuario_id === user.id);

        selectEndereco.innerHTML = '<option value="">Selecione o local da coleta</option>';

        if (meusEnderecos.length === 0) {
          selectEndereco.innerHTML = '<option value="">Nenhum endereço cadastrado</option>';
        } else {
          meusEnderecos.forEach(end => {
            const option = document.createElement('option');
            option.value = end.id; // Guarda o ID verdadeiro do banco!
            option.textContent = `${end.logradouro}, ${end.numero} - ${end.bairro}`;
            selectEndereco.appendChild(option);
          });
        }
      } catch (error) {
        console.error('Erro ao buscar endereços:', error);
      }
    }

    function openSolicitacao() {
      carregarEnderecosDropdown(); // Carrega os endereços do banco sempre que abre o modal!
      document.getElementById('solicitacaoModal').classList.add('open');
      document.getElementById('solicitacaoModal').setAttribute('aria-hidden', 'false');
    }
    function closeSolicitacao() {
      document.getElementById('solicitacaoModal').classList.remove('open');
      document.getElementById('solicitacaoModal').setAttribute('aria-hidden', 'true');
    }

    function openHorarios() {
      document.getElementById('horariosModal').classList.add('open');
      document.getElementById('horariosModal').setAttribute('aria-hidden', 'false');
    }
    function closeHorarios() {
      document.getElementById('horariosModal').classList.remove('open');
      document.getElementById('horariosModal').setAttribute('aria-hidden', 'true');
    }

    function openCadastroEndereco() {
      document.getElementById('cadastroEnderecoModal').classList.add('open');
      document.getElementById('cadastroEnderecoModal').setAttribute('aria-hidden', 'false');
      renderListaEnderecos();
    }
    function closeCadastroEndereco() {
      document.getElementById('cadastroEnderecoModal').classList.remove('open');
      document.getElementById('cadastroEnderecoModal').setAttribute('aria-hidden', 'true');
    }

    function openNoticias() {
      document.getElementById('noticiasModal').classList.add('open');
      document.getElementById('noticiasModal').setAttribute('aria-hidden', 'false');
      loadEnvironmentNews();
    }
    function closeNoticias() {
      document.getElementById('noticiasModal').classList.remove('open');
      document.getElementById('noticiasModal').setAttribute('aria-hidden', 'true');
    }

    // Fechar modal ao clicar fora
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal') && e.target.classList.contains('open')) {
        e.target.classList.remove('open');
        e.target.setAttribute('aria-hidden', 'true');
      }
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.open').forEach(m => {
          m.classList.remove('open');
          m.setAttribute('aria-hidden', 'true');
        });
      }
    });

    // ========== MAPA COM LEAFLET.JS ==========
let userMarker;
let trashMarkers = [];
let truckMarkers = [];
let trashCooldown = {};

const RIO_CENTER = [-22.9068, -43.1729];

function initMap() {
  if (map) {
    setTimeout(() => map.invalidateSize(), 200);
    return;
  }

  map = L.map("mapContainer").setView(RIO_CENTER, 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  showUserLocation();
  createTrashPoints();
  createMovingTrucks();

  setTimeout(() => map.invalidateSize(), 300);
}
function showUserLocation() {
  if (!navigator.geolocation) {
    alert("Seu navegador não suporta localização.");
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      if (!userMarker) {
        userMarker = L.marker([lat, lng])
          .addTo(map)
          .bindPopup("📍 Você está aqui")
          .openPopup();

        map.setView([lat, lng], 15);
      } else {
        userMarker.setLatLng([lat, lng]);
      }
    },
    () => {
      alert("Não foi possível acessar sua localização.");
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 10000
    }
  );
}
const trashPoints = [
  { id: "lata-1", lat: -22.9068, lng: -43.1729, name: "Centro" },
  { id: "lata-2", lat: -22.9121, lng: -43.2302, name: "Tijuca" },
  { id: "lata-3", lat: -22.9707, lng: -43.1823, name: "Copacabana" },
  { id: "lata-4", lat: -22.9849, lng: -43.2054, name: "Ipanema" },
  { id: "lata-5", lat: -22.9997, lng: -43.3659, name: "Barra da Tijuca" },
  { id: "lata-6", lat: -22.8832, lng: -43.1034, name: "Niterói / área próxima" },
  { id: "lata-7", lat: -22.8951, lng: -43.2214, name: "Maracanã" },
  { id: "lata-8", lat: -22.9235, lng: -43.2326, name: "Vila Isabel" }
];

function createTrashPoints() {
  trashPoints.forEach(point => {
    const marker = L.marker([point.lat, point.lng], {
      icon: L.divIcon({
        className: "trash-icon",
        html: "🗑️",
        iconSize: [30, 30]
      })
    }).addTo(map);

    marker.bindPopup(`Lata de lixo - ${point.name}`);
    trashMarkers.push({ ...point, marker });
  });
}
const truckRoutes = [
  [
    [-22.9068, -43.1729],
    [-22.9075, -43.1800],
    [-22.9121, -43.2302],
    [-22.8951, -43.2214]
  ],
  [
    [-22.9707, -43.1823],
    [-22.9760, -43.1900],
    [-22.9849, -43.2054],
    [-22.9235, -43.2326]
  ]
];

function createMovingTrucks() {
  truckRoutes.forEach((route, index) => {
    const truck = L.marker(route[0], {
      icon: L.divIcon({
        className: "truck-icon",
        html: "🚛",
        iconSize: [35, 35]
      })
    }).addTo(map);

    truckMarkers.push({
      marker: truck,
      route,
      index: 0,
      stopped: false
    });

    moveTruck(truckMarkers[index]);
  });
}
function moveTruck(truckData) {
  setInterval(() => {
    if (truckData.stopped) return;

    truckData.index++;

    if (truckData.index >= truckData.route.length) {
      truckData.index = 0;
    }

    const nextPosition = truckData.route[truckData.index];
    truckData.marker.setLatLng(nextPosition);

    const trash = findNearbyTrash(nextPosition);

    if (trash && canCollectTrash(trash.id)) {
      stopTruckAtTrash(truckData, trash);
    }

  }, 3000);
}
function findNearbyTrash(position) {
  const [lat, lng] = position;

  return trashMarkers.find(trash => {
    const distance = map.distance([lat, lng], [trash.lat, trash.lng]);
    return distance <= 30;
  });
}
function canCollectTrash(trashId) {
  const lastCollected = trashCooldown[trashId];

  if (!lastCollected) return true;

  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  return now - lastCollected >= oneHour;
}
function stopTruckAtTrash(truckData, trash) {
  truckData.stopped = true;

  truckData.marker.bindPopup(`🚛 Coletando lixo em ${trash.name}`).openPopup();

  trashCooldown[trash.id] = Date.now();
  
  notifyTrashCollected(trash);

  trash.marker.setIcon(
    L.divIcon({
      className: "trash-icon collected",
      html: "✅",
      iconSize: [30, 30]
    })
  );

  setTimeout(() => {
    truckData.stopped = false;
    truckData.marker.closePopup();
  }, 5000);

  setTimeout(() => {
    trash.marker.setIcon(
      L.divIcon({
        className: "trash-icon",
        html: "🗑️",
        iconSize: [30, 30]
      })
    );
  }, 60 * 60 * 1000);
}
    // ========== NOTÍCIAS AMBIENTAIS REAIS ==========
    async function loadEnvironmentNews() {
      const container = document.getElementById('noticiasContainer');
      container.innerHTML = '<p style="text-align: center; padding: 2rem;">Carregando notícias...</p>';

      try {
        // Usando NewsAPI.org (você precisa de uma chave grátis em newsapi.org)
        const apiKey = 'demo'; // Use sua chave real aqui
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=meio%20ambiente&sortBy=publishedAt&language=pt&pageSize=5&apiKey=${apiKey}`
        ).catch(() => {
          // Se API falhar, usar notícias simuladas
          return null;
        });

        let news = [];
        
        if (response && response.ok) {
          const data = await response.json();
          news = data.articles.slice(0, 5);
        } else {
          // Notícias simuladas como fallback
          news = [
            {
              title: 'Brasil amplia áreas protegidas costeiras',
              description: 'Novas áreas marinhas são protegidas para preservar biodiversidade',
              url: '#',
              publishedAt: new Date().toISOString()
            },
            {
              title: 'Projeto de reflorestamento urbano ativa novos parques',
              description: 'Cidades brasileiras plantam milhões de árvores',
              url: '#',
              publishedAt: new Date().toISOString()
            },
            {
              title: 'Energia solar cresce 15% no último trimestre',
              description: 'Fonte renovável se consolida na matriz energética',
              url: '#',
              publishedAt: new Date().toISOString()
            }
          ];
        }

        container.innerHTML = news.map(article => `
          <div class="noticia-card">
            <h3>${article.title}</h3>
            <p>${article.description || ''}</p>
            <small>${new Date(article.publishedAt).toLocaleDateString('pt-BR')}</small>
          </div>
        `).join('');
      } catch (error) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem;">Erro ao carregar notícias. Tente novamente.</p>';
      }
    }

// ========== FORMULÁRIOS ==========
    document.getElementById('solicitacaoForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const tipoLixo = document.getElementById('tipoLixo').value;
      const enderecoId = document.getElementById('endereco').value;

      if (!tipoLixo || !enderecoId) {
        alert('Por favor, preencha o tipo de lixo e escolha um endereço.');
        return;
      }

      const user = getCurrentUser();
      if (!user) {
        alert('Você precisa estar logado para fazer uma solicitação.');
        window.location.href = 'index.html';
        return;
      }

      const tipoLixoFormatado = tipoLixo.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase();

      try {
        const resposta = await fetch('http://localhost:3000/api/solicitacoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario_id: user.id, 
            endereco_id: parseInt(enderecoId),
            veiculo_id: 1, 
            tipo_lixo: tipoLixoFormatado,
            status: 'PENDENTE'
          })
        });

        if (resposta.ok) {
          alert('✅ Solicitação de coleta registrada com sucesso!');
          closeSolicitacao();
          document.getElementById('solicitacaoForm').reset();
          renderHistorico(); 
        } else {
          alert('Erro ao registrar coleta. Verifique os dados.');
        }
      } catch (error) {
        alert('Erro de conexão com o servidor.');
      }
    });

// ========== CADASTRO DE NOVO ENDEREÇO CONECTADO À API ==========
    document.getElementById('cadastroEnderecoForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const user = getCurrentUser();
      if (!user) {
        alert('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = 'index.html';
        return;
      }

      // Captura os dados usando os IDs exatos do principal.html
      const rua = document.getElementById('rua').value.trim();
      const numero = document.getElementById('numero').value.trim();
      const complemento = document.getElementById('complemento').value.trim();
      const bairro = document.getElementById('bairro').value.trim();
      const cep = document.getElementById('cep').value.trim();
      
      // Junta a rua com o complemento para salvar no banco de dados (ex: "Rua das Flores - Apto 101")
      const logradouroCompleto = complemento ? `${rua} - ${complemento}` : rua;

      try {
        const resposta = await fetch('http://localhost:3000/api/enderecos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario_id: user.id, // O ID real do cidadão logado
            cep: cep,
            logradouro: logradouroCompleto,
            numero: numero,
            bairro: bairro,
            zona_id: 1 // Fixo na zona 1 temporariamente
          })
        });

        if (resposta.ok) {
          alert('✅ Novo endereço cadastrado com sucesso!');
          document.getElementById('cadastroEnderecoForm').reset(); // Limpa os campos
          renderListaEnderecos();
        } else {
          const erro = await resposta.json();
          alert('Erro ao cadastrar endereço: ' + (erro.mensagem || 'Verifique os dados informados.'));
        }
      } catch (error) {
        console.error('Erro ao cadastrar endereço:', error);
        alert('Erro de conexão. Certifique-se de que o servidor back-end está ligado.');
      }
    });

    // ========== ASSISTENTE VIRTUAL / MODO IDOSO ==========
    document.getElementById('assistantFab').addEventListener('click', () => {
      openAssistant();
    });

 

    function startAssistantTutorial() {
      closeAssistantOptions();
      startSharedTutorial(false);
    }

    function activateElderlyModeFromAssistant() {
      processAssistantData();
    }

    function disableElderlyMode() {
      isElderly = false;
      document.body.classList.remove('elderly-mode');

      document.querySelectorAll('.elderly-highlight').forEach(el => {
        el.classList.remove('elderly-highlight');
      });

      const overlay = document.getElementById('elderlyOverlay');
      const tip = document.getElementById('elderlyTip');
      const confirmModal = document.getElementById('elderlyConfirmModal');

      if (overlay) overlay.remove();
      if (tip) tip.remove();
      if (confirmModal) {
        confirmModal.classList.remove('open');
        confirmModal.setAttribute('aria-hidden', 'true');
      }

      speak('Modo idoso desativado.');
      alert('Modo idoso desativado.');
      closeAssistantOptions();
    }

    function openSupportFromAssistant() {
      closeAssistantOptions();

      const supportSection = document.getElementById('support');
      if (supportSection) {
        supportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      speak('Você foi direcionado para a área de suporte.');
    }

    function startSharedTutorial(openConfirmAfterFinish = false) {
      if (openConfirmAfterFinish) {
        pendingOpenElderlyConfirm = true;
      }

      if (typeof window.GarixosTutorial === 'undefined') {
        alert('O tutorial ainda não está disponível nesta tela.');
        return;
      }

      if (openConfirmAfterFinish && !isElderly) {
        isElderly = true;
        document.body.classList.add('elderly-mode');
      }

      window.GarixosTutorial.start();
      speak('Vamos iniciar o tutorial.');
    }

    function toggleAssistantOptions() {
      const menu = document.getElementById('assistantOptionsMenu');
      const button = document.getElementById('assistantMoreOptionsBtn');
      if (!menu || !button) return;

      const isOpen = menu.classList.toggle('open');
      menu.setAttribute('aria-hidden', String(!isOpen));
      button.setAttribute('aria-expanded', String(isOpen));
    }

    function closeAssistantOptions() {
      const menu = document.getElementById('assistantOptionsMenu');
      const button = document.getElementById('assistantMoreOptionsBtn');
      if (!menu || !button) return;

      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      button.setAttribute('aria-expanded', 'false');
    }

// ========== ASSISTENTE VIRTUAL (INTEGRAÇÃO COM GEMINI IA) ==========
    let chatHistory = []; // Guarda o histórico da conversa para dar contexto à IA

    document.getElementById('assistantFab').addEventListener('click', openAssistant);

    function openAssistant() {
      const modal = document.getElementById('assistantModal');
      if (modal) {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
      }
    }

    function closeAssistant() {
      const modal = document.getElementById('assistantModal');
      if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      }
    }

    // Dispara a mensagem se apertar a tecla "Enter"
    function handleChatKeyPress(event) {
      if (event.key === 'Enter') {
        enviarMensagemChat();
      }
    }

    async function enviarMensagemChat() {
      const input = document.getElementById('chatInput');
      const text = input.value.trim();
      if (!text) return; // Não envia mensagens vazias

      const chatContainer = document.getElementById('chatContainer');

      // 1. Mostrar a mensagem do usuário na tela
      chatContainer.innerHTML += `
        <div style="align-self: flex-end; background: var(--primary-color); color: white; padding: 10px 14px; border-radius: 12px; max-width: 80%;">
          ${text}
        </div>
      `;
      input.value = ''; // Limpar o campo
      chatContainer.scrollTop = chatContainer.scrollHeight; // Rolar para o fim

      // 2. Salvar no histórico (formato que a API do Gemini exige)
      chatHistory.push({ role: "user", parts: [{ text: text }] });

      // 3. Adicionar o aviso de "Digitando..."
      const loadingId = 'loading-' + Date.now();
      chatContainer.innerHTML += `
        <div id="${loadingId}" style="align-self: flex-start; background: #e0e0e0; padding: 10px 14px; border-radius: 12px; font-style: italic;">
          Pensando...
        </div>
      `;
      chatContainer.scrollTop = chatContainer.scrollHeight;

      try {
        // 4. Enviar para a sua rota no Node.js
        const resposta = await fetch('http://localhost:3000/api/assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history: chatHistory })
        });

        // 5. Remover o aviso de "Digitando..."
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        if (resposta.ok) {
          const data = await resposta.json();
          const repostaIA = data.reply;

          // Troca quebras de linha por <br> para manter a formatação do texto da IA
          const formatText = repostaIA.replace(/\n/g, '<br>');

          // 6. Mostrar a resposta da IA na tela
          chatContainer.innerHTML += `
            <div style="align-self: flex-start; background: #e0e0e0; padding: 10px 14px; border-radius: 12px; max-width: 80%;">
              ${formatText}
            </div>
          `;
          
          // 7. Salvar resposta no histórico
          chatHistory.push({ role: "model", parts: [{ text: repostaIA }] });
        } else {
          chatContainer.innerHTML += `<div style="align-self: flex-start; color: red;">Erro ao processar a resposta da IA.</div>`;
        }
      } catch (error) {
        console.error("Erro na IA:", error);
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();
        
        chatContainer.innerHTML += `
          <div style="align-self: flex-start; background: #ffcdd2; color: #c62828; padding: 10px 14px; border-radius: 12px;">
            Erro de conexão com o Assistente. O servidor Node.js está a correr?
          </div>
        `;
      }
      chatContainer.scrollTop = chatContainer.scrollHeight; // Rolar para o fim novamente
    }

    function processAssistantData() {
      const name = document.getElementById('assistantName').value.trim();
      const birthDate = document.getElementById('assistantBirthDate').value;

      if (!name || !birthDate) {
        alert('Por favor, preencha todos os campos');
        return;
      }

      const birth = new Date(birthDate);
      const today = new Date();

      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      pendingElderlyName = name;
      pendingElderlyAge = age;

      if (age >= 60) {
        activateElderlyMode(name, age);
      } else {
        alert(`Bem-vindo, ${name}!`);
      }
    }

    function activateElderlyMode(name, age) {
  isElderly = true;
  document.body.classList.add('elderly-mode');

  pendingOpenElderlyConfirm = true;
  speak(`Bem-vindo, ${name}. O modo idoso foi ativado. Vou te guiar pelo tutorial principal.`);
  startSharedTutorial(true);
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  const voice = new SpeechSynthesisUtterance(text);
  voice.lang = 'pt-BR';
  voice.rate = 0.9;
  voice.pitch = 1;

  window.speechSynthesis.speak(voice);
}

let pendingOpenElderlyConfirm = false;

window.addEventListener('garixos-tutorial-end', () => {
  if (!pendingOpenElderlyConfirm) return;

  pendingOpenElderlyConfirm = false;
  openElderlyConfirm();
});

function finishElderlyTutorial() {
  speak('Tutorial finalizado. O modo idoso continuará ativado.');
}

    // ========== SUPORTE E FEEDBACK ==========
    document.getElementById('supportForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('supportEmail').value.trim();
      const subject = document.getElementById('supportSubject').value.trim();
      const message = document.getElementById('supportMessage').value.trim();

      if (email && subject && message) {
        const data = { email, subject, message, timestamp: new Date().toLocaleString('pt-BR') };
        let saved = JSON.parse(localStorage.getItem('garinxoSupportEmails') || '[]');
        saved.push(data);
        localStorage.setItem('garinxoSupportEmails', JSON.stringify(saved));

        const box = document.getElementById('supportMessage-response');
        box.textContent = '✅ Suporte recebido! Entraremos em contato em breve.';
        box.className = 'form-message success';
        box.style.display = 'block';

        this.reset();
        setTimeout(() => box.style.display = 'none', 4000);
      }
    });

    document.getElementById('feedbackForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('feedbackEmail').value.trim();
      const type = document.getElementById('feedbackType').value;
      const message = document.getElementById('feedbackMessage').value.trim();

      if (email && type && message) {
        const data = { email, type, message, timestamp: new Date().toLocaleString('pt-BR') };
        let saved = JSON.parse(localStorage.getItem('garinxoFeedbackEmails') || '[]');
        saved.push(data);
        localStorage.setItem('garinxoFeedbackEmails', JSON.stringify(saved));

        const box = document.getElementById('feedbackMessage-response');
        box.textContent = '✅ Obrigado pelo seu feedback!';
        box.className = 'form-message success';
        box.style.display = 'block';

        this.reset();
        setTimeout(() => box.style.display = 'none', 4000);
      }
    });

    function notifyTrashCollected(trash) {
  const now = new Date();

  const horaPassou = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const proximaColeta = new Date(now.getTime() + 60 * 60 * 1000);

  const horaProxima = proximaColeta.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const mensagem = `🚛 Caminhão passou em ${trash.name} às ${horaPassou}. Próxima coleta prevista: ${horaProxima}.`;

  addNotification(mensagem, horaPassou);
  showNotificationToast();
}
let pendingElderlyName = 'usuário';
let pendingElderlyAge = 0;

function openElderlyConfirm() {
  const modal = document.getElementById('elderlyConfirmModal');
  if (!modal) return;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeElderlyConfirm() {
  const modal = document.getElementById('elderlyConfirmModal');
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function confirmElderlyMode() {
  closeElderlyConfirm();

  if (!isElderly && typeof activateElderlyMode === 'function') {
    activateElderlyMode(pendingElderlyName, pendingElderlyAge);
  }
}
function togglePassword(inputId, iconContainer) {

  const input = document.getElementById(inputId);

  if (!input) return;

  const icon = iconContainer.querySelector('i');

  if (input.type === 'password') {

    input.type = 'text';

    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');

  } else {

    input.type = 'password';

    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}
emailjs.init("ZU8Cn-oC4L0bnD_M8");

function openForgotPasswordModal() {
  document
    .getElementById("forgotPasswordModal")
    .classList.add("open");
}

function closeForgotPasswordModal() {
  document
    .getElementById("forgotPasswordModal")
    .classList.remove("open");
}

function recoverPassword() {

  const email =
    document.getElementById("recoverEmail").value;

  const users =
    JSON.parse(localStorage.getItem("garinxoUsers")) || [];

  const user =
    users.find(u => u.email === email);

  if (!user) {
    alert("Email não encontrado.");
    return;
  }

  emailjs.send(
    "service_qjal7z5",
    "template_380ivd7",
    {
      name: user.fullName,
      password: user.password,
      email: email
    }
  )
  .then(() => {
      alert("Senha enviada para seu email.");
      closeForgotPasswordModal();
  })
  .catch(() => {
      alert("Erro ao enviar email.");
  });
}

// ========== LISTAR E DELETAR ENDEREÇOS ==========
    async function renderListaEnderecos() {
      const listaEnderecos = document.getElementById('listaEnderecos');
      if (!listaEnderecos) return;

      const user = getCurrentUser();
      if (!user) return;

      listaEnderecos.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">Carregando seus endereços...</p>';

      try {
        const resposta = await fetch('http://localhost:3000/api/enderecos');
        const todosEnderecos = await resposta.json();
        
        // Filtra só os endereços deste usuário
        const meusEnderecos = todosEnderecos.filter(end => end.usuario_id === user.id);

        listaEnderecos.innerHTML = '';

        if (meusEnderecos.length === 0) {
          listaEnderecos.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">Você ainda não possui endereços cadastrados.</p>';
          return;
        }

        meusEnderecos.forEach(end => {
          const item = document.createElement('div');
          item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 12px; border-radius: 6px; border: 1px solid #eee;';
          
          item.innerHTML = `
            <div style="font-size: 0.9rem;">
              <strong>${end.logradouro}, ${end.numero}</strong><br>
              <span style="color: #666;">Bairro: ${end.bairro} | CEP: ${end.cep}</span>
            </div>
            <button onclick="deletarEndereco(${end.id})" style="background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; border-radius: 4px; padding: 6px 12px; cursor: pointer; transition: 0.3s; font-weight: bold;" aria-label="Excluir endereço">Excluir</button>
          `;
          listaEnderecos.appendChild(item);
        });
      } catch (error) {
        console.error('Erro ao carregar endereços:', error);
        listaEnderecos.innerHTML = '<p style="color:red; font-size:0.9rem;">Erro ao carregar endereços do servidor.</p>';
      }
    }

    async function deletarEndereco(enderecoId) {
      const user = getCurrentUser();
      if (!user) return;

      const confirmar = confirm('Tem certeza que deseja excluir este endereço?');
      if (!confirmar) return;

      try {
        // A nossa rota exige o ID do endereço e o ID do usuário para segurança!
        const resposta = await fetch(`http://localhost:3000/api/enderecos/${enderecoId}/${user.id}`, {
          method: 'DELETE'
        });

        if (resposta.ok) {
          alert('✅ Endereço excluído com sucesso!');
          renderListaEnderecos(); // Recarrega a listinha na hora!
        } else {
          const erro = await resposta.json();
          alert('Erro ao excluir: ' + (erro.mensagem || 'Tente novamente.'));
        }
      } catch (error) {
        console.error('Erro ao deletar endereço:', error);
        alert('Erro de conexão com o servidor.');
      }
    }
    // ========== INICIALIZAÇÃO ==========
    verifySession();
  