    // ========== VARIÁVEIS GLOBAIS ==========
    const sessionKey = 'garinxoCurrentUser';
    let notificationCount = 0;
    let isElderly = false;
    let map = null;
    let trucks = []; // Array de caminhões

    // ========== VERIFICAÇÃO DE SESSÃO ==========
    function getUsers() {
      const saved = localStorage.getItem('garinxoUsers');
      return saved ? JSON.parse(saved) : [];
    }

    function getCurrentUser() {
      const cpf = localStorage.getItem(sessionKey);
      if (!cpf) return null;
      const users = getUsers();
      return users.find(entry => entry.cpf === cpf) || null;
    }

    function saveCurrentUser(updatedUser) {
      const users = getUsers();
      const index = users.findIndex(entry => entry.cpf === updatedUser.cpf);
      if (index >= 0) {
        users[index] = updatedUser;
      } else {
        users.push(updatedUser);
      }
      localStorage.setItem('garinxoUsers', JSON.stringify(users));
    }

    function getFirstName(fullName) {
      return fullName ? fullName.trim().split(' ')[0] : 'Usuário';
    }

    function getCurrentUserHistory() {
      const user = getCurrentUser();
      return (user && Array.isArray(user.history)) ? user.history : [];
    }

    function renderHistorico() {
      const history = getCurrentUserHistory();
      const body = document.getElementById('historicoBody');
      if (!body) return;

      if (history.length === 0) {
        body.innerHTML = `
          <tr id="historicoEmpty">
            <td colspan="4" style="text-align:center; color:var(--text-muted); padding:2rem;">
              Nenhuma solicitação de coleta registrada ainda.
            </td>
          </tr>
        `;
        return;
      }

      body.innerHTML = history.map(item => `
        <tr>
          <td>${item.date}</td>
          <td>${item.time}</td>
          <td>${item.local}</td>
          <td><span class="status-badge ${item.status === 'Concluído' ? 'completed' : 'pending'}">${item.status === 'Concluído' ? '✅ Concluído' : '⏳ ${item.status}'}</span></td>
        </tr>
      `).join('');
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
        userLink.textContent = getFirstName(user.fullName || user.name || 'Usuário');
        userLink.href = '#';
      }
      if (logoutLink) logoutLink.style.display = 'inline-block';
    }

    function verifySession() {
      const cpf = localStorage.getItem(sessionKey);
      if (!cpf) {
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

    // ========== MODAIS ==========
    // Funções para abrir/fechar todos os modais
    function renderHistorico() {
      const historyBody = document.getElementById('historicoBody');
      const user = getCurrentUser();
      historyBody.innerHTML = '';

      if (!user || !Array.isArray(user.history) || user.history.length === 0) {
        historyBody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align:center; color: var(--text-muted); padding: 2rem;">Nenhuma solicitação de coleta registrada ainda.</td>
          </tr>
        `;
        return;
      }

      user.history.forEach(item => {
        const statusClass = item.status === 'Concluído' ? 'completed' : '';
        historyBody.innerHTML += `
          <tr>
            <td>${item.date}</td>
            <td>${item.time}</td>
            <td>${item.local}</td>
            <td><span class="status-badge ${statusClass}">${item.statusIcon || (item.status === 'Concluído' ? '✅' : '⌛')} ${item.status}</span></td>
          </tr>
        `;
      });
    }

    function openHistorico() {
      renderHistorico();
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

    function openSolicitacao() {
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
    document.getElementById('solicitacaoForm').addEventListener('submit', (e) => {
      e.preventDefault();

      const tipoLixo = document.getElementById('tipoLixo').value;
      const endereco = document.getElementById('endereco').value.trim();
      const nomeSolicitacao = document.getElementById('nomeSolicitacao').value.trim();
      const cpfSolicitacao = document.getElementById('cpfSolicitacao').value.trim();

      if (!tipoLixo || !endereco || !nomeSolicitacao || !cpfSolicitacao) {
        alert('Por favor, preencha todos os campos da solicitação.');
        return;
      }

      const user = getCurrentUser();
      if (!user) {
        alert('Você precisa estar logado para fazer uma solicitação.');
        closeSolicitacao();
        return;
      }

      const now = new Date();
      const entry = {
        date: now.toLocaleDateString('pt-BR'),
        time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        local: endereco,
        type: tipoLixo,
        status: 'Pendente'
      };

      user.history = Array.isArray(user.history) ? user.history : [];
      user.history.unshift(entry);
      saveCurrentUser(user);
      renderHistorico();

      alert('Solicitação de coleta registrada com sucesso!');
      closeSolicitacao();
      document.getElementById('solicitacaoForm').reset();
    });

    document.getElementById('cadastroEnderecoForm').addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Endereço cadastrado com sucesso!');
      closeCadastroEndereco();
      document.getElementById('cadastroEnderecoForm').reset();
    });

    // ========== ASSISTENTE VIRTUAL / MODO IDOSO ==========
    document.getElementById('assistantFab').addEventListener('click', () => {
  // Assistente virtual sem função por enquanto
});

    function closeAssistant() {
      document.getElementById('assistantModal').classList.remove('open');
      document.getElementById('assistantModal').setAttribute('aria-hidden', 'true');
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
      const age = today.getFullYear() - birth.getFullYear();

      if (age >= 60) {
        activateElderlyMode(name, age);
      } else {
        closeAssistant();
        alert(`Bem-vindo, ${name}!`);
      }
    }

    function activateElderlyMode(name, age) {
  isElderly = true;
  document.body.classList.add('elderly-mode');
  closeAssistant();

  speak(`Bem-vindo, ${name}. O modo idoso foi ativado. Vou te guiar pelo site passo a passo.`);
  startElderlyTutorial();
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

const elderlySteps = [
  {
    selector: '.header-search',
    text: 'Aqui você pode buscar endereço, ponto de coleta ou serviço.'
  },
  {
    selector: '.notification-bell',
    text: 'Aqui ficam suas notificações sobre coleta e avisos importantes.'
  },
  {
    selector: '.feature-card:nth-child(1)',
    text: 'Aqui você consulta o histórico das suas solicitações.'
  },
  {
    selector: '.feature-card:nth-child(2)',
    text: 'Aqui você abre o mapa em tempo real.'
  },
  {
    selector: '.feature-card:nth-child(3)',
    text: 'Aqui você pode solicitar uma coleta de resíduos.'
  },
  {
    selector: '#support',
    text: 'Aqui embaixo você pode pedir suporte ou enviar feedback.'
  }
];

let elderlyStepIndex = 0;

function startElderlyTutorial() {
  elderlyStepIndex = 0;

  const overlay = document.createElement('div');
  overlay.className = 'elderly-overlay';
  overlay.id = 'elderlyOverlay';
  document.body.appendChild(overlay);

  const tip = document.createElement('div');
  tip.className = 'elderly-tip';
  tip.id = 'elderlyTip';
  document.body.appendChild(tip);

  showElderlyStep();
}

function showElderlyStep() {
  document.querySelectorAll('.elderly-highlight').forEach(el => {
    el.classList.remove('elderly-highlight');
  });

  const step = elderlySteps[elderlyStepIndex];
  const element = document.querySelector(step.selector);
  const tip = document.getElementById('elderlyTip');

  if (!step || !element || !tip) {
    finishElderlyTutorial();
    return;
  }

  element.classList.add('elderly-highlight');
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });

  tip.innerHTML = `
    <div>${step.text}</div>
    <button onclick="nextElderlyStep()">Próximo passo</button>
  `;

  speak(step.text);
}

function nextElderlyStep() {
  elderlyStepIndex++;

  if (elderlyStepIndex >= elderlySteps.length) {
    finishElderlyTutorial();
    return;
  }

  showElderlyStep();
}

function finishElderlyTutorial() {
  document.querySelectorAll('.elderly-highlight').forEach(el => {
    el.classList.remove('elderly-highlight');
  });

  const overlay = document.getElementById('elderlyOverlay');
  const tip = document.getElementById('elderlyTip');

  if (overlay) overlay.remove();
  if (tip) tip.remove();

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

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    openAgeCheck();
  }, 700);
});

function openAgeCheck() {
  const modal = document.getElementById('ageCheckModal');
  if (!modal) return;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeAgeCheck() {
  const modal = document.getElementById('ageCheckModal');
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function checkUserAge() {
  const birthDate = document.getElementById('ageBirthDate').value;

  if (!birthDate) {
    closeAgeCheck();
    return;
  }

  const birth = new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  closeAgeCheck();

  if (age >= 60) {
    pendingElderlyAge = age;
    openElderlyConfirm();
  }
}

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

  if (typeof activateElderlyMode === 'function') {
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
    // ========== INICIALIZAÇÃO ==========
    verifySession();
  