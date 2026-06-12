/* ===================================================
   GARIXOS - Tutorial Interativo com Spotlight
   Como usar:
     1. Adicione no <head>:
        <link rel="stylesheet" href="./css/tutorial.css">
     2. Antes do </body>:
        <script src="./js/tutorial.js"></script>
   O tutorial inicia automaticamente na 1ª visita.
  Para forçar reinício: GarixosTutorial.start({ audioDescription: true })
=================================================== */

(function () {

  /* ─── PASSOS DO TUTORIAL ─── */
  const STEPS = [
    {
      selector: '.logo-area',
      title: '👋 Bem-vindo ao Garixos!',
      text: 'Este é o painel principal da plataforma de coleta inteligente de resíduos. Vamos te mostrar tudo que você pode fazer aqui.',
      position: 'bottom',
    },
    {
      selector: '.header-search',
      title: '🔍 Barra de Busca',
      text: 'Use a barra de busca para encontrar endereços, pontos de coleta ou serviços específicos rapidamente.',
      position: 'bottom',
    },
    {
      selector: '.notification-bell',
      title: '🔔 Notificações',
      text: 'Aqui você recebe alertas sobre suas solicitações, lembretes de coleta e novidades da plataforma.',
      position: 'bottom',
    },
    {
      selector: '.features-grid',
      title: '📦 Funcionalidades Principais',
      text: 'Estes são os 6 recursos principais do Garixos. Cada card dá acesso a uma funcionalidade diferente. Vamos conhecer cada uma!',
      position: 'top',
    },
    {
      selector: '.features-grid .feature-card:nth-child(1)',
      title: '📋 Histórico de Solicitações',
      text: 'Consulte todas as suas solicitações de coleta — data, hora, local e status de cada uma.',
      position: 'right',
    },
    {
      selector: '.features-grid .feature-card:nth-child(2)',
      title: '🗺️ Mapa em Tempo Real',
      text: 'Visualize caminhões de coleta e pontos de descarte próximos a você em tempo real no mapa interativo.',
      position: 'right',
    },
    {
      selector: '.features-grid .feature-card:nth-child(3)',
      title: '♻️ Solicitar Coleta',
      text: 'Solicite a coleta de resíduos diretamente no seu endereço. Informe o tipo de lixo e agende a retirada.',
      position: 'left',
    },
    {
      selector: '.features-grid .feature-card:nth-child(4)',
      title: '⏰ Horários de Coleta',
      text: 'Consulte os dias e horários de coleta para sua região, separados por tipo de resíduo.',
      position: 'left',
    },
    {
      selector: '.features-grid .feature-card:nth-child(5)',
      title: '📍 Cadastro de Endereço',
      text: 'Cadastre seus endereços para facilitar solicitações futuras. Seus dados ficam salvos com segurança.',
      position: 'right',
    },
    {
      selector: '.features-grid .feature-card:nth-child(6)',
      title: '🌍 Notícias Ambientais',
      text: 'Fique por dentro das últimas notícias sobre meio ambiente, reciclagem e sustentabilidade.',
      position: 'left',
    },
    {
      selector: '.assistant-fab',
      title: '🤖 Assistente Virtual',
      text: 'Clique neste botão para abrir o Assistente Virtual. Ele te guia pelas funcionalidades e possui modo especial para idosos.',
      position: 'top',
    },
    {
      selector: '.support-section',
      title: '🛠️ Suporte & Feedback',
      text: 'Precisa de ajuda ou quer enviar uma sugestão? Use os formulários aqui para falar com nossa equipe.',
      position: 'top',
    },
  ];

  /* ─── ESTADO ─── */
  let currentStep = 0;
  let overlayEl, borderEl, tooltipEl;
  let curtains = [];
  let voiceEnabled = true;

  function stripEmojis(text) {
    return String(text)
      .replace(/[\u{1F300}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function speak(text) {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    var utterance = new SpeechSynthesisUtterance(stripEmojis(text));
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  }

  /* ─── INICIALIZAÇÃO ─── */
  function buildDOM() {
    /* Overlay invisível (intercepta cliques fora) */
    overlayEl = document.createElement('div');
    overlayEl.id = 'tutorial-overlay';
    document.body.appendChild(overlayEl);

    /* 4 cortinas */
    ['top', 'bottom', 'left', 'right'].forEach(function (side) {
      var el = document.createElement('div');
      el.className = 'tutorial-curtain tutorial-curtain-' + side;
      document.body.appendChild(el);
      curtains.push(el);
    });

    /* Borda verde ao redor do elemento */
    borderEl = document.createElement('div');
    borderEl.id = 'tutorial-highlight-border';
    document.body.appendChild(borderEl);

    /* Tooltip */
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'tutorial-tooltip';
    tooltipEl.innerHTML =
      '<div id="tutorial-progress-bar-wrap"><div id="tutorial-progress-bar"></div></div>' +
      '<div id="tutorial-step-indicator"></div>' +
      '<h3 id="tutorial-title"></h3>' +
      '<p id="tutorial-text"></p>' +
      '<div id="tutorial-actions">' +
        '<button id="tutorial-skip-btn">Pular tutorial</button>' +
        '<div id="tutorial-nav">' +
          '<button class="tutorial-btn tutorial-btn-prev" id="tutorial-prev-btn">← Anterior</button>' +
          '<button class="tutorial-btn tutorial-btn-next" id="tutorial-next-btn">Próximo →</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(tooltipEl);

    /* Eventos */
    document.getElementById('tutorial-skip-btn').addEventListener('click', end);
    document.getElementById('tutorial-next-btn').addEventListener('click', next);
    document.getElementById('tutorial-prev-btn').addEventListener('click', prev);
  }

  /* ─── MOSTRAR PASSO ─── */
  function showStep(index) {
    var step = STEPS[index];
    var target = document.querySelector(step.selector);

    /* Scroll até o elemento */
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /* Aguarda scroll antes de posicionar */
    setTimeout(function () {
      positionSpotlight(target);
      updateTooltip(step, index);
      speak(step.title + '. ' + step.text);
    }, 320);
  }

  /* ─── SPOTLIGHT ─── */
  function positionSpotlight(target) {
    if (!target) {
      /* Sem alvo: esconde o spotlight */
      curtains.forEach(function (c) {
        c.style.top = '0'; c.style.left = '0';
        c.style.width = '0'; c.style.height = '0';
      });
      borderEl.style.opacity = '0';
      return;
    }

    var pad = 8;
    var rect = target.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    var top    = rect.top    - pad;
    var left   = rect.left   - pad;
    var right  = rect.right  + pad;
    var bottom = rect.bottom + pad;
    var w      = right - left;
    var h      = bottom - top;

    /* Cortina superior */
    setCurtain(curtains[0], 0, 0, vw, top);
    /* Cortina inferior */
    setCurtain(curtains[1], 0, bottom, vw, vh - bottom);
    /* Cortina esquerda */
    setCurtain(curtains[2], 0, top, left, h);
    /* Cortina direita */
    setCurtain(curtains[3], right, top, vw - right, h);

    /* Borda verde */
    borderEl.style.top    = top  + 'px';
    borderEl.style.left   = left + 'px';
    borderEl.style.width  = w    + 'px';
    borderEl.style.height = h    + 'px';
    borderEl.style.opacity = '1';
    borderEl.classList.add('pulse');
  }

  function setCurtain(el, x, y, w, h) {
    el.style.left   = x + 'px';
    el.style.top    = y + 'px';
    el.style.width  = Math.max(0, w) + 'px';
    el.style.height = Math.max(0, h) + 'px';
  }

  /* ─── TOOLTIP ─── */
  function updateTooltip(step, index) {
    var total = STEPS.length;

    document.getElementById('tutorial-step-indicator').textContent =
      'Passo ' + (index + 1) + ' de ' + total;

    document.getElementById('tutorial-title').textContent = step.title;
    document.getElementById('tutorial-text').textContent  = step.text;

    var pct = ((index + 1) / total * 100).toFixed(1) + '%';
    document.getElementById('tutorial-progress-bar').style.width = pct;

    /* Botão Anterior */
    var prevBtn = document.getElementById('tutorial-prev-btn');
    prevBtn.style.display = index === 0 ? 'none' : 'inline-block';

    /* Botão Próximo / Concluir */
    var nextBtn = document.getElementById('tutorial-next-btn');
    nextBtn.textContent = index === total - 1 ? '✓ Concluir' : 'Próximo →';

    positionTooltip(step);

    /* Animação pop */
    tooltipEl.classList.remove('pop');
    void tooltipEl.offsetWidth;
    tooltipEl.classList.add('pop');
  }

  function positionTooltip(step) {
    var target = document.querySelector(step.selector);
    if (!target) {
      tooltipEl.style.top  = '50%';
      tooltipEl.style.left = '50%';
      tooltipEl.style.transform = 'translate(-50%, -50%)';
      return;
    }

    tooltipEl.style.transform = '';
    var pad    = 18;
    var rect   = target.getBoundingClientRect();
    var tw     = tooltipEl.offsetWidth  || 320;
    var th     = tooltipEl.offsetHeight || 160;
    var vw     = window.innerWidth;
    var vh     = window.innerHeight;
    var pos    = step.position || 'bottom';

    var t, l;

    if (pos === 'bottom') {
      t = rect.bottom + pad;
      l = rect.left + (rect.width - tw) / 2;
    } else if (pos === 'top') {
      t = rect.top - th - pad;
      l = rect.left + (rect.width - tw) / 2;
    } else if (pos === 'right') {
      t = rect.top  + (rect.height - th) / 2;
      l = rect.right + pad;
    } else { /* left */
      t = rect.top  + (rect.height - th) / 2;
      l = rect.left - tw - pad;
    }

    /* Clamp para não sair da tela */
    l = Math.max(12, Math.min(l, vw - tw - 12));
    t = Math.max(12, Math.min(t, vh - th - 12));

    tooltipEl.style.top  = t + 'px';
    tooltipEl.style.left = l + 'px';
  }

  /* ─── NAVEGAÇÃO ─── */
  function next() {
    if (currentStep < STEPS.length - 1) {
      currentStep++;
      showStep(currentStep);
    } else {
      end();
    }
  }

  function prev() {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  }

  /* ─── INICIAR ─── */
  function start(options) {
    options = options || {};
    currentStep = 0;
    voiceEnabled = !!options.audioDescription;
    overlayEl.classList.add('active');
    tooltipEl.style.display = 'block';
    borderEl.style.opacity  = '1';
    curtains.forEach(function (c) { c.style.display = 'block'; });
    showStep(0);
  }

  /* ─── ENCERRAR ─── */
  function end() {
    overlayEl.classList.remove('active');
    tooltipEl.style.display = 'none';
    borderEl.style.opacity  = '0';
    borderEl.classList.remove('pulse');
    curtains.forEach(function (c) { c.style.display = 'none'; });
    window.speechSynthesis && window.speechSynthesis.cancel();
    localStorage.setItem('garixos_tutorial_done', '1');
    window.dispatchEvent(new CustomEvent('garixos-tutorial-end'));
  }

  /* ─── RECALCULA AO REDIMENSIONAR ─── */
  window.addEventListener('resize', function () {
    if (overlayEl && overlayEl.classList.contains('active')) {
      positionSpotlight(document.querySelector(STEPS[currentStep].selector));
      positionTooltip(STEPS[currentStep]);
    }
  });

  /* ─── BOOTSTRAP ─── */
  function init() {
    buildDOM();
    /* Inicia automaticamente na 1ª visita */
    if (!localStorage.getItem('garixos_tutorial_done')) {
      setTimeout(start, 600);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* API pública */
  window.GarixosTutorial = { start: start, end: end };

})();
