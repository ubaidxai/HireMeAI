// dashboard.js

(function () {

  // ── Fetch & render ───────────────────────────────────────────────────────────
  async function loadDashboard() {
    try {
      // GET /metrics/langsmith  →  { runs: [...], avg_latency, avg_tokens, total_cost }
      // GET /metrics/ragas      →  { scores: [...], avg_faithfulness, avg_relevancy, avg_recall }
      //
      // Expected LangSmith run shape:
      // { timestamp, latency_sec, total_tokens, cost_usd, prompt_tokens, completion_tokens }
      //
      // Expected RAGAS scores shape:
      // { timestamp, question, faithfulness, answer_relevancy, context_recall }

      const [lsData, ragasData] = await Promise.all([
        API.get('/metrics/langsmith'),
        API.get('/metrics/ragas'),
      ]);

      renderKPIs(lsData);
      renderLatencyChart(lsData.runs || []);
      renderTokenChart(lsData.runs || []);
      renderCostChart(lsData.runs || []);
      renderGauge(lsData.avg_latency || 0);
      renderRagasScores(ragasData);
      renderLatencyBreakdown(lsData);
      renderEvalsTable(ragasData.scores || []);

    } catch (err) {
      console.error('Dashboard load error:', err);
      document.querySelectorAll('.dash-empty').forEach(el => el.style.display = 'flex');
      // show demo data so the page still looks useful during dev
      renderDemo();
    }
  }

  // ── KPI cards ────────────────────────────────────────────────────────────────
  function renderKPIs(data) {
    setText('kpi-latency', (data.avg_latency ?? '--') + 's');
    setText('kpi-tokens',  Math.round(data.avg_tokens ?? 0).toString());
    setText('kpi-cost',    '$' + (data.total_cost ?? 0).toFixed(4));
  }

  // ── Mini bar chart (canvas-free, CSS bars) ───────────────────────────────────
  function renderLatencyChart(runs) {
    const el = document.getElementById('latency-chart');
    if (!el || !runs.length) return;
    const max = Math.max(...runs.map(r => r.latency_sec), 0.1);
    el.innerHTML = runs.slice(-20).map(r => {
      const pct = (r.latency_sec / max * 100).toFixed(1);
      const color = r.latency_sec < 3 ? 'var(--accent-2)' : r.latency_sec < 6 ? 'var(--amber)' : 'var(--red)';
      return `<div class="mini-bar-wrap" title="${r.latency_sec}s">
        <div class="mini-bar" style="height:${pct}%;background:${color}"></div>
      </div>`;
    }).join('');
  }

  function renderTokenChart(runs) {
    const el = document.getElementById('token-chart');
    if (!el || !runs.length) return;
    const max = Math.max(...runs.map(r => r.total_tokens), 1);
    el.innerHTML = runs.slice(-20).map(r => {
      const pct = (r.total_tokens / max * 100).toFixed(1);
      return `<div class="mini-bar-wrap" title="${r.total_tokens} tokens">
        <div class="mini-bar" style="height:${pct}%;background:var(--accent)"></div>
      </div>`;
    }).join('');
  }

  function renderCostChart(runs) {
    const el = document.getElementById('cost-chart');
    if (!el || !runs.length) return;
    const max = Math.max(...runs.map(r => r.cost_usd), 0.0001);
    el.innerHTML = runs.slice(-20).map(r => {
      const pct = (r.cost_usd / max * 100).toFixed(1);
      return `<div class="mini-bar-wrap" title="$${r.cost_usd}">
        <div class="mini-bar" style="height:${pct}%;background:var(--amber)"></div>
      </div>`;
    }).join('');
  }

  // ── Circular gauge (SVG) ─────────────────────────────────────────────────────
  function renderGauge(avgLatency) {
    const el = document.getElementById('gauge-value');
    if (el) el.textContent = avgLatency.toFixed(2) + 's';

    const svg = document.getElementById('gauge-svg');
    if (!svg) return;

    const max = 10;
    const pct = Math.min(avgLatency / max, 1);
    const r = 54, cx = 70, cy = 70;
    const circumference = 2 * Math.PI * r;
    const dash = circumference * pct;
    const color = pct < 0.3 ? '#00d4aa' : pct < 0.6 ? '#f59e0b' : '#ff4d6d';

    svg.innerHTML = `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border)" stroke-width="10"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
        stroke="${color}" stroke-width="10" stroke-linecap="round"
        stroke-dasharray="${dash} ${circumference}"
        transform="rotate(-90 ${cx} ${cy})"
        style="transition:stroke-dasharray 1s ease"/>
    `;

    const label = document.getElementById('gauge-label');
    if (label) label.textContent = pct < 0.3 ? 'FAST' : pct < 0.6 ? 'MODERATE' : 'SLOW';
  }

  // ── RAGAS scores ─────────────────────────────────────────────────────────────
  function renderRagasScores(data) {
    const scores = [
      { id: 'faith',   label: 'Faithfulness',    val: data.avg_faithfulness  ?? 0 },
      { id: 'rel',     label: 'Answer Relevancy', val: data.avg_relevancy     ?? 0 },
      { id: 'recall',  label: 'Context Recall',   val: data.avg_recall        ?? 0 },
    ];

    scores.forEach(s => {
      const color = utils.scoreColor(s.val);
      const valEl  = document.getElementById(`score-${s.id}`);
      const fillEl = document.getElementById(`fill-${s.id}`);
      if (valEl)  { valEl.textContent = (s.val * 100).toFixed(0); valEl.style.color = color; }
      if (fillEl) { fillEl.style.width = (s.val * 100) + '%'; fillEl.style.background = color; }
    });
  }

  // ── Latency breakdown bars ───────────────────────────────────────────────────
  function renderLatencyBreakdown(data) {
    const breakdown = data.latency_breakdown || {
      embedding: data.avg_embedding_ms || 0,
      llm:       data.avg_llm_ms       || 0,
      reranking: data.avg_rerank_ms    || 0,
    };

    const max = Math.max(...Object.values(breakdown), 1);
    Object.entries(breakdown).forEach(([key, val]) => {
      const fill = document.getElementById(`lat-${key}`);
      const label = document.getElementById(`lat-${key}-val`);
      if (fill)  fill.style.width  = (val / max * 100) + '%';
      if (label) label.textContent = Math.round(val) + 'ms';
    });
  }

  // ── Evals table ──────────────────────────────────────────────────────────────
  function renderEvalsTable(scores) {
    const tbody = document.getElementById('evals-tbody');
    if (!tbody) return;
    if (!scores.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px">No evals run yet</td></tr>`;
      return;
    }
    tbody.innerHTML = scores.slice(-10).reverse().map(s => `
      <tr>
        <td style="color:var(--text-secondary);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.question}</td>
        <td><span class="score-pill" style="background:${utils.scoreBg(s.faithfulness)};color:${utils.scoreColor(s.faithfulness)}">${(s.faithfulness*100).toFixed(0)}%</span></td>
        <td><span class="score-pill" style="background:${utils.scoreBg(s.answer_relevancy)};color:${utils.scoreColor(s.answer_relevancy)}">${(s.answer_relevancy*100).toFixed(0)}%</span></td>
        <td><span class="score-pill" style="background:${utils.scoreBg(s.context_recall)};color:${utils.scoreColor(s.context_recall)}">${(s.context_recall*100).toFixed(0)}%</span></td>
        <td class="mono" style="font-size:11px;color:var(--text-muted)">${utils.timeAgo(s.timestamp)}</td>
      </tr>`).join('');
  }

  // ── Demo fallback (dev mode) ─────────────────────────────────────────────────
  function renderDemo() {
    const demoRuns = Array.from({ length: 12 }, (_, i) => ({
      timestamp:    new Date(Date.now() - i * 3600000).toISOString(),
      latency_sec:  +(1.5 + Math.random() * 4).toFixed(2),
      total_tokens: Math.floor(400 + Math.random() * 800),
      cost_usd:     +(0.0001 + Math.random() * 0.0005).toFixed(6),
    }));

    const avgLat = demoRuns.reduce((a, r) => a + r.latency_sec, 0) / demoRuns.length;

    renderKPIs({
      avg_latency: +avgLat.toFixed(2),
      avg_tokens:  Math.round(demoRuns.reduce((a, r) => a + r.total_tokens, 0) / demoRuns.length),
      total_cost:  +demoRuns.reduce((a, r) => a + r.cost_usd, 0).toFixed(4),
    });

    renderLatencyChart(demoRuns);
    renderTokenChart(demoRuns);
    renderCostChart(demoRuns);
    renderGauge(avgLat);

    renderRagasScores({ avg_faithfulness: 0.87, avg_relevancy: 0.91, avg_recall: 0.78 });
    renderLatencyBreakdown({ embedding: 142, llm: 890, reranking: 210 });

    renderEvalsTable([
      { question: 'What are your core skills?', faithfulness: 0.92, answer_relevancy: 0.88, context_recall: 0.85, timestamp: new Date().toISOString() },
      { question: 'Where do you work currently?', faithfulness: 0.95, answer_relevancy: 0.93, context_recall: 0.90, timestamp: new Date(Date.now()-7200000).toISOString() },
    ]);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  loadDashboard();

  // refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) refreshBtn.addEventListener('click', loadDashboard);

})();