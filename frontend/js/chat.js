// chat.js — runs after chat.html is injected

(function () {
  const messagesEl = document.getElementById('chat-messages');
  const emptyEl    = document.getElementById('chat-empty');
  const textarea   = document.getElementById('chat-input');
  const sendBtn    = document.getElementById('chat-send');

  let history = [];   // [{role, content}]
  let thinking = false;

  // ── Render ──────────────────────────────────────────────────────────────────
  function appendMessage(role, content, sources = []) {
    if (emptyEl) emptyEl.style.display = 'none';

    const isAI = role === 'ai';
    const div = document.createElement('div');
    div.className = `message ${isAI ? 'ai' : 'user'}`;

    const initials = isAI ? 'AI' : 'U';
    const avatarClass = isAI ? 'ai' : 'user-av';

    let sourcesHTML = '';
    if (isAI && sources.length) {
      const chips = sources.map(s => `
        <div class="source-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          ${s}
        </div>`).join('');

      sourcesHTML = `
        <div class="msg-sources">
          <div class="sources-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            SOURCES
          </div>
          <div class="source-chips">${chips}</div>
        </div>`;
    }

    const actionsHTML = isAI ? `
      <div class="msg-actions">
        <button class="msg-action-btn" onclick="utils.copyText(this.closest('.message').querySelector('.msg-bubble').textContent)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        </button>
      </div>` : '';

    div.innerHTML = `
      <div class="msg-avatar ${avatarClass}">${initials}</div>
      <div class="msg-body">
        <div class="msg-name">${isAI ? 'AI · HireMeAI' : 'You'}</div>
        <div class="msg-bubble">${escapeHtml(content)}</div>
        ${sourcesHTML}
        ${actionsHTML}
      </div>`;

    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function showThinking() {
    if (emptyEl) emptyEl.style.display = 'none';
    const div = document.createElement('div');
    div.className = 'message ai';
    div.id = 'thinking-indicator';
    div.innerHTML = `
      <div class="msg-avatar ai">AI</div>
      <div class="msg-body">
        <div class="msg-name">AI · HireMeAI</div>
        <div class="msg-bubble" style="padding:14px 16px">
          <div class="thinking">
            <div class="thinking-dot"></div>
            <div class="thinking-dot"></div>
            <div class="thinking-dot"></div>
          </div>
        </div>
      </div>`;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeThinking() {
    const el = document.getElementById('thinking-indicator');
    if (el) el.remove();
  }

  // ── Send message ─────────────────────────────────────────────────────────────
  async function send() {
    if (thinking) return;
    const text = textarea.value.trim();
    if (!text) return;

    textarea.value = '';
    textarea.style.height = 'auto';
    thinking = true;
    sendBtn.disabled = true;

    appendMessage('user', text);
    history.push({ role: 'user', content: text });
    showThinking();

    try {
      // POST /chat  →  { response: "...", sources: [...] }
      // Adjust to match your actual FastAPI endpoint shape
      const data = await API.post('/chat', { message: text });
      removeThinking();

      const reply = data.response || data.answer || 'No response.';
      const sources = data.sources || [];
      appendMessage('ai', reply, sources);
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      removeThinking();
      appendMessage('ai', `Sorry, I encountered an error: ${err.message}`);
    }

    thinking = false;
    sendBtn.disabled = false;
    textarea.focus();
  }

  // ── Events ───────────────────────────────────────────────────────────────────
  sendBtn.addEventListener('click', send);

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  });

  // suggestion chips
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      textarea.value = chip.textContent.trim();
      textarea.dispatchEvent(new Event('input'));
      send();
    });
  });

  // hint chips (bottom bar)
  document.querySelectorAll('.hint-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      textarea.value = chip.textContent.trim();
      textarea.dispatchEvent(new Event('input'));
      textarea.focus();
    });
  });

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  textarea.focus();
})();