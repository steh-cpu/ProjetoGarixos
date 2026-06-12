/* =====================================================
   GARIXOS - Assistente Virtual com Gemini via back-end
===================================================== */

(function () {
  const ASSISTANT_API_URL = 'http://localhost:3000/api/assistant/chat';

  let history = [];
  let pendingElderlyTutorial = false;
  let chatBuilt = false;

  function buildChat() {
    if (chatBuilt) return;
    chatBuilt = true;

    const chat = document.createElement('div');
    chat.id = 'gx-chat';
    chat.setAttribute('role', 'dialog');
    chat.setAttribute('aria-label', 'Assistente Virtual Garixos');
    chat.innerHTML = `
      <div id="gx-chat-header">
        <img src="assets/assistentevirt.png" alt="Gari" onerror="this.style.display='none'">
        <div id="gx-chat-header-info">
          <strong>Gari - Assistente Virtual</strong>
          <span>Ativa para ajudar</span>
        </div>
        <div id="gx-chat-header-actions">
          <button id="gx-chat-more" aria-label="Mais opções" aria-expanded="false">Mais opções</button>
          <button id="gx-chat-close" aria-label="Fechar chat">✕</button>
        </div>
      </div>

      <div id="gx-chat-options" aria-hidden="true">
        <button class="gx-option-btn" type="button" data-action="tutorial">Tutorial</button>
        <button class="gx-option-btn" type="button" data-action="activate-elderly">Ativar modo idoso</button>
        <button class="gx-option-btn" type="button" data-action="disable-elderly">Desativar modo idoso</button>
        <button class="gx-option-btn" type="button" data-action="help">Preciso de ajuda</button>
      </div>

      <div id="gx-chat-messages" aria-live="polite"></div>

      <div id="gx-suggestions">
        <button class="gx-suggestion" type="button">Como solicitar coleta?</button>
        <button class="gx-suggestion" type="button">Horários de coleta</button>
        <button class="gx-suggestion" type="button">Como usar o mapa?</button>
        <button class="gx-suggestion" type="button">Tipos de lixo aceitos</button>
      </div>

      <div id="gx-chat-input-area">
        <textarea
          id="gx-chat-input"
          placeholder="Digite sua dúvida..."
          rows="1"
          aria-label="Mensagem para o assistente"
        ></textarea>
        <button id="gx-chat-send" aria-label="Enviar mensagem">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(chat);

    const fab = document.getElementById('assistantFab');
    if (fab && !document.getElementById('gx-fab-badge')) {
      const badge = document.createElement('div');
      badge.id = 'gx-fab-badge';
      fab.appendChild(badge);
    }

    document.getElementById('gx-chat-close').addEventListener('click', closeChat);
    document.getElementById('gx-chat-send').addEventListener('click', handleSend);
    document.getElementById('gx-chat-more').addEventListener('click', toggleOptions);

    document.getElementById('gx-chat-input').addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    });

    document.getElementById('gx-chat-input').addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 90) + 'px';
    });

    document.querySelectorAll('.gx-suggestion').forEach(function (button) {
      button.addEventListener('click', function () {
        sendMessage(this.textContent);
        const suggestions = document.getElementById('gx-suggestions');
        if (suggestions) suggestions.style.display = 'none';
      });
    });

    document.querySelectorAll('#gx-chat-options .gx-option-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        const action = this.dataset.action;

        if (action === 'tutorial') {
          startTutorial();
        } else if (action === 'activate-elderly') {
          activateElderlyMode();
        } else if (action === 'disable-elderly') {
          disableElderlyMode();
        } else if (action === 'help') {
          openHelp();
        }
      });
    });

    if (fab) {
      fab.onclick = null;
      fab.addEventListener('click', toggleChat);
    }

    addBotMessage('Olá! 👋 Sou a Gari, assistente virtual do Garixos. Use o menu "Mais opções" para acessar o tutorial, ativar o modo idoso ou pedir ajuda.');
    openChat();
  }

  function toggleChat() {
    const chat = document.getElementById('gx-chat');
    if (!chat) return;

    if (chat.classList.contains('open')) {
      closeChat();
    } else {
      openChat();
    }
  }

  function openChat() {
    const chat = document.getElementById('gx-chat');
    if (!chat) return;

    chat.classList.add('open');
    hideBadge();
    closeOptions();

    setTimeout(function () {
      const input = document.getElementById('gx-chat-input');
      if (input) input.focus();
    }, 150);
  }

  function closeChat() {
    const chat = document.getElementById('gx-chat');
    if (!chat) return;

    chat.classList.remove('open');
    closeOptions();
  }

  function showBadge() {
    const badge = document.getElementById('gx-fab-badge');
    if (badge) badge.style.display = 'block';
  }

  function hideBadge() {
    const badge = document.getElementById('gx-fab-badge');
    if (badge) badge.style.display = 'none';
  }

  function toggleOptions() {
    const options = document.getElementById('gx-chat-options');
    const button = document.getElementById('gx-chat-more');
    if (!options || !button) return;

    const isOpen = options.classList.toggle('open');
    options.setAttribute('aria-hidden', String(!isOpen));
    button.setAttribute('aria-expanded', String(isOpen));
  }

  function closeOptions() {
    const options = document.getElementById('gx-chat-options');
    const button = document.getElementById('gx-chat-more');
    if (!options || !button) return;

    options.classList.remove('open');
    options.setAttribute('aria-hidden', 'true');
    button.setAttribute('aria-expanded', 'false');
  }

  function addBotMessage(text) {
    const messages = document.getElementById('gx-chat-messages');
    if (!messages) return;

    const div = document.createElement('div');
    div.className = 'gx-msg gx-msg-bot';
    div.innerHTML = formatText(text);
    messages.appendChild(div);
    scrollBottom();
  }

  function addUserMessage(text) {
    const messages = document.getElementById('gx-chat-messages');
    if (!messages) return;

    const div = document.createElement('div');
    div.className = 'gx-msg gx-msg-user';
    div.textContent = text;
    messages.appendChild(div);
    scrollBottom();
  }

  function showTyping() {
    const messages = document.getElementById('gx-chat-messages');
    if (!messages) return null;

    const div = document.createElement('div');
    div.className = 'gx-typing';
    div.id = 'gx-typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(div);
    scrollBottom();
    return div;
  }

  function removeTyping() {
    const typing = document.getElementById('gx-typing-indicator');
    if (typing) typing.remove();
  }

  function scrollBottom() {
    const messages = document.getElementById('gx-chat-messages');
    if (!messages) return;

    messages.scrollTop = messages.scrollHeight;
  }

  function formatText(text) {
    return String(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function handleSend() {
    const input = document.getElementById('gx-chat-input');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';
    sendMessage(text);
  }

  function sendMessage(text) {
    const chat = document.getElementById('gx-chat');
    if (chat && !chat.classList.contains('open')) {
      openChat();
    }

    addUserMessage(text);
    history.push({ role: 'user', parts: [{ text: text }] });

    showTyping();
    setInputDisabled(true);

    callAssistantApi()
      .then(function (reply) {
        removeTyping();
        addBotMessage(reply);
        history.push({ role: 'model', parts: [{ text: reply }] });
        if (chat && !chat.classList.contains('open')) {
          showBadge();
        }
      })
      .catch(function (error) {
        removeTyping();
        console.error('Erro no assistente:', error);
        addBotMessage('Não consegui responder agora. Verifique se o servidor está rodando e se a chave do Gemini foi configurada no back-end.');
      })
      .finally(function () {
        setInputDisabled(false);
        const input = document.getElementById('gx-chat-input');
        if (input) input.focus();
      });
  }

  function setInputDisabled(disabled) {
    const input = document.getElementById('gx-chat-input');
    const button = document.getElementById('gx-chat-send');
    if (input) input.disabled = disabled;
    if (button) button.disabled = disabled;
  }

  async function callAssistantApi() {
    const response = await fetch(ASSISTANT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        history: history.slice(-10)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensagem || 'Erro ao consultar o assistente.');
    }

    if (!data.reply) {
      throw new Error('Resposta vazia do assistente.');
    }

    return data.reply;
  }

  function startTutorial() {
    closeOptions();

    if (window.GarixosTutorial && typeof window.GarixosTutorial.start === 'function') {
      addBotMessage('Tutorial iniciado. Vou abrir o guia padrão do Garixos.');
      window.GarixosTutorial.start();
      return;
    }

    addBotMessage('O tutorial ainda não está disponível nesta página.');
  }

  function activateElderlyMode() {
    closeOptions();
    pendingElderlyTutorial = true;
    document.body.classList.add('elderly-mode');

    if (window.GarixosTutorial && typeof window.GarixosTutorial.start === 'function') {
      addBotMessage('Modo idoso ativado. Vou iniciar o tutorial padrão em seguida.');
      window.GarixosTutorial.start();
      return;
    }

    addBotMessage('Modo idoso ativado, mas o tutorial não está disponível nesta página.');
  }

  function disableElderlyMode() {
    closeOptions();
    pendingElderlyTutorial = false;
    document.body.classList.remove('elderly-mode');

    if (window.GarixosTutorial && typeof window.GarixosTutorial.end === 'function') {
      window.GarixosTutorial.end();
    }

    const confirmModal = document.getElementById('elderlyConfirmModal');
    if (confirmModal) {
      confirmModal.classList.remove('open');
      confirmModal.setAttribute('aria-hidden', 'true');
    }

    addBotMessage('Modo idoso desativado.');
  }

  function openHelp() {
    closeOptions();

    const supportSection = document.getElementById('support');
    if (supportSection) {
      supportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    addBotMessage('Levei você para a área de suporte.');
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
    addBotMessage('Tudo certo. O modo idoso permanece ativo.');
  }

  function onTutorialEnd() {
    if (!pendingElderlyTutorial) return;

    pendingElderlyTutorial = false;
    openElderlyConfirm();
  }

  function init() {
    buildChat();
    window.addEventListener('garixos-tutorial-end', onTutorialEnd);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.GarixosAssistant = {
    open: openChat,
    close: closeChat,
    send: sendMessage,
    tutorial: startTutorial,
    activateElderlyMode: activateElderlyMode,
    disableElderlyMode: disableElderlyMode,
    help: openHelp
  };

  window.toggleAssistantOptions = toggleOptions;
  window.startAssistantTutorial = startTutorial;
  window.activateElderlyModeFromAssistant = activateElderlyMode;
  window.disableElderlyMode = disableElderlyMode;
  window.openSupportFromAssistant = openHelp;
  window.confirmElderlyMode = confirmElderlyMode;
  window.closeElderlyConfirm = closeElderlyConfirm;
})();
