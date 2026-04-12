// ingest.js

(function () {

  // ── Drop zone ────────────────────────────────────────────────────────────────
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  if (dropZone) {
    dropZone.addEventListener('click', () => fileInput?.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      handleFiles(e.dataTransfer.files);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));
  }

  async function handleFiles(files) {
    for (const file of files) {
      await uploadFile(file, detectType(file));
    }
  }

  function detectType(file) {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) return 'resume';
    if (file.name.endsWith('.md') || file.name.endsWith('.txt')) return 'document';
    if (file.name.endsWith('.zip')) return 'archive';
    return 'document';
  }

  // ── Resume upload ─────────────────────────────────────────────────────────────
  const resumeBtn = document.getElementById('resume-upload-btn');
  const resumeInput = document.getElementById('resume-input');

  if (resumeBtn) resumeBtn.addEventListener('click', () => resumeInput?.click());
  if (resumeInput) {
    resumeInput.addEventListener('change', () => {
      if (resumeInput.files[0]) uploadFile(resumeInput.files[0], 'resume');
    });
  }

  // ── Generic file uploader ────────────────────────────────────────────────────
  async function uploadFile(file, type) {
    const rowId = 'row-' + Date.now();
    addActivityRow(rowId, file.name, type, 'Uploading…', 'amber');

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('type', type);

      // POST /ingest/upload  →  { status: "indexed", message: "..." }
      const data = await API.postForm('/ingest/upload', form);
      updateActivityRow(rowId, data.status === 'indexed' ? 'Indexed' : 'Done', 'green');
      utils.toast(`${file.name} indexed successfully`, 'success');
    } catch (err) {
      updateActivityRow(rowId, 'Failed', 'red');
      utils.toast(`Failed to upload ${file.name}: ${err.message}`, 'error');
    }
  }

  // ── GitHub sync ──────────────────────────────────────────────────────────────
  const githubBtn = document.getElementById('github-sync-btn');
  const githubInput = document.getElementById('github-url');

  if (githubBtn) {
    githubBtn.addEventListener('click', async () => {
      const url = githubInput?.value.trim();
      if (!url) { utils.toast('Enter a GitHub URL', 'error'); return; }

      const rowId = 'row-gh-' + Date.now();
      addActivityRow(rowId, url.split('/').slice(-2).join('/'), 'GitHub', 'Syncing…', 'amber');
      githubBtn.disabled = true;

      try {
        // POST /ingest/github  →  { status: "indexed" }
        await API.post('/ingest/github', { url });
        updateActivityRow(rowId, 'Indexed', 'green');
        utils.toast('GitHub repo indexed', 'success');
        if (githubInput) githubInput.value = '';
      } catch (err) {
        updateActivityRow(rowId, 'Failed', 'red');
        utils.toast(err.message, 'error');
      }

      githubBtn.disabled = false;
    });
  }

  // ── LinkedIn sync ────────────────────────────────────────────────────────────
  const linkedinBtn = document.getElementById('linkedin-sync-btn');
  const linkedinInput = document.getElementById('linkedin-url');

  if (linkedinBtn) {
    linkedinBtn.addEventListener('click', async () => {
      const url = linkedinInput?.value.trim();
      if (!url) { utils.toast('Enter a LinkedIn URL', 'error'); return; }

      const rowId = 'row-li-' + Date.now();
      addActivityRow(rowId, url, 'LinkedIn', 'Syncing…', 'amber');
      linkedinBtn.disabled = true;

      try {
        // POST /ingest/linkedin  →  { status: "indexed" }
        await API.post('/ingest/linkedin', { url });
        updateActivityRow(rowId, 'Indexed', 'green');
        utils.toast('LinkedIn profile indexed', 'success');
      } catch (err) {
        updateActivityRow(rowId, 'Failed', 'red');
        utils.toast(err.message, 'error');
      }

      linkedinBtn.disabled = false;
    });
  }

  // ── Activity table helpers ───────────────────────────────────────────────────
  const icons = {
    resume:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    GitHub:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/></svg>`,
    LinkedIn: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    archive:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
    document: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  };

  const typeColors = {
    resume: 'red', GitHub: 'purple', LinkedIn: 'amber', archive: 'amber', document: 'green',
  };

  function addActivityRow(id, name, type, status, statusColor) {
    const tbody = document.getElementById('activity-tbody');
    if (!tbody) return;

    const icon = icons[type] || icons.document;
    const iconColor = typeColors[type] || 'purple';
    const now = new Date().toLocaleString();

    const tr = document.createElement('tr');
    tr.id = id;
    tr.innerHTML = `
      <td>
        <div class="file-name-cell">
          <div class="file-type-icon badge-${iconColor}" style="background:var(--${iconColor === 'red' ? 'red' : iconColor === 'green' ? 'accent-2' : 'accent'}-dim);color:var(--${iconColor === 'red' ? 'red' : iconColor === 'green' ? 'accent-2' : 'accent'})">${icon}</div>
          <span style="color:var(--text-primary);font-weight:500">${name}</span>
        </div>
      </td>
      <td><span class="badge badge-purple">${type}</span></td>
      <td class="status-cell"><span class="badge badge-${statusColor}">${status}</span></td>
      <td class="mono" style="font-size:11px;color:var(--text-muted)">${now}</td>
      <td></td>`;
    tbody.prepend(tr);
  }

  function updateActivityRow(id, status, color) {
    const tr = document.getElementById(id);
    if (!tr) return;
    const statusCell = tr.querySelector('.status-cell');
    if (statusCell) statusCell.innerHTML = `<span class="badge badge-${color}">${status}</span>`;
  }

  // ── Re-sync existing rows ────────────────────────────────────────────────────
  document.querySelectorAll('.resync-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const source = btn.dataset.source;
      btn.textContent = 'Syncing…';
      btn.disabled = true;
      try {
        await API.post('/ingest/resync', { source });
        utils.toast(`${source} re-synced`, 'success');
        btn.textContent = 'Re-sync';
      } catch {
        utils.toast('Re-sync failed', 'error');
        btn.textContent = 'Re-sync';
      }
      btn.disabled = false;
    });
  });

  document.querySelectorAll('.retry-btn').forEach(btn => {
    btn.addEventListener('click', () => utils.toast('Retry triggered', 'info'));
  });

})();