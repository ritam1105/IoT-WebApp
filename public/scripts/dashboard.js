let pollInterval = null;
let activeSessionId = null;
let sessionData = [];

// ─── Init: load active session on page load ──────────────────────────────────
async function init() {
    try {
        const res  = await fetch('/sensor/session');
        const info = await res.json();

        if (info.sessionId) {
            activeSessionId = info.sessionId;
            await loadAll();

            if (info.isRunning) {
                pollInterval = setInterval(fetchLatest, 5000);
                setStatus('LIVE MONITORING', 'text-emerald-400');
            } else {
                setStatus('PAUSED', 'text-amber-400');
            }
        }
    } catch (err) {
        console.error('Init error:', err);
    }
}

// ─── Load averages + full table for active session ───────────────────────────
async function loadAll() {
    if (!activeSessionId) return;
    try {
        const [avgRes, dataRes] = await Promise.all([
            fetch(`/sensor/averages/${activeSessionId}`),
            fetch(`/sensor/data/${activeSessionId}`)
        ]);
        const avg  = await avgRes.json();
        const data = await dataRes.json();

        updateCards(avg);
        sessionData = data.reverse(); // oldest first
        renderTable();
    } catch (err) {
        console.error('Load error:', err);
    }
}

// ─── Poll latest single record ────────────────────────────────────────────────
async function fetchLatest() {
    if (!activeSessionId) return;
    try {
        const res    = await fetch('/sensor/latest');
        const record = await res.json();
        if (!record || !record._id) return;

        const exists = sessionData.find(r => r._id === record._id);
        if (!exists) {
            sessionData.push(record);
            renderTable();
        }

        const avgRes = await fetch(`/sensor/averages/${activeSessionId}`);
        const avg    = await avgRes.json();
        updateCards(avg);
    } catch (err) {
        console.error('Poll error:', err);
    }
}

// ─── Update sensor cards ──────────────────────────────────────────────────────
function updateCards(avg) {
    document.querySelector('.temp-avg').textContent      = avg.avgTemp?.toFixed(1)       ?? '--';
    document.querySelector('.turbidity-avg').textContent = avg.avgTurbidity?.toFixed(1)  ?? '--';
    document.querySelector('.ph-avg').textContent        = avg.avgPH?.toFixed(2)         ?? '--';
    document.querySelector('.water-avg').textContent     = avg.avgWaterLevel?.toFixed(1) ?? '--';

    const grade   = getWaterGrade(avg.avgPH, avg.avgTurbidity, avg.avgTemp);
    const gradeEl = document.querySelector('.grade');
    const percEl  = document.querySelector('.percentage');
    if (grade.drinkable == null) {
        if (gradeEl) gradeEl.textContent = '--';
        if (percEl)  percEl.textContent  = '-- %';
    } else {
        if (gradeEl) gradeEl.textContent = grade.grade;
        if (percEl)  percEl.textContent  = grade.drinkable + '%';
    }
}

// ─── Water grade ──────────────────────────────────────────────────────────────
function getWaterGrade(pH, turbidity, temp) {
    if ([pH, turbidity, temp].some(v => v == null || Number.isNaN(v))) {
        return { grade: '--', drinkable: null };
    }
    let score = 100;
    if (pH < 6.5 || pH > 8.5)      score -= 30;
    else if (pH < 7.0 || pH > 8.0) score -= 10;
    if (turbidity > 4)              score -= 30;
    else if (turbidity > 1)         score -= 10;
    if (temp > 35 || temp < 5)      score -= 20;

    if (score >= 80) return { grade: 'A', drinkable: score };
    if (score >= 60) return { grade: 'B', drinkable: score };
    if (score >= 40) return { grade: 'C', drinkable: score };
    return { grade: 'D', drinkable: score };
}

// ─── Render table ─────────────────────────────────────────────────────────────
function renderTable() {
    const container  = document.querySelector('.data-list');
    if (!container) return;
    const emptyState = container.querySelector('.empty-state');
    container.querySelectorAll('.data-row').forEach(r => r.remove());

    if (!sessionData || sessionData.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    if (emptyState) emptyState.style.display = 'none';

    [...sessionData].reverse().forEach((row, i) => {
        const div = document.createElement('div');
        div.className = 'data-row grid grid-cols-7 px-6 py-3 border-t border-slate-800 text-xs mono text-slate-400 hover:bg-slate-800/30 transition-colors';
        div.innerHTML = `
            <div class="text-slate-600">${sessionData.length - i}</div>
            <div class="col-span-2">${new Date(row.timestamp).toLocaleString('en-IN')}</div>
            <div class="text-orange-400">${row.temperature ?? '--'}</div>
            <div class="text-sky-400">${row.turbidity ?? '--'}</div>
            <div class="text-violet-400">${row.pH ?? '--'}</div>
            <div class="text-teal-400">${row.waterLevel ?? '--'}</div>
        `;
        container.appendChild(div);
    });
}

// ─── Status label ─────────────────────────────────────────────────────────────
function setStatus(text, color = 'text-slate-400') {
    const el = document.getElementById('fetch-status');
    if (!el) return;
    el.textContent = text;
    el.className   = `text-xs mono ${color}`;
}

// ─── BUTTONS ──────────────────────────────────────────────────────────────────

// START — resume current session
document.getElementById('start').addEventListener('click', async () => {
    const res  = await fetch('/sensor/start', { method: 'POST' });
    const data = await res.json();
    activeSessionId = data.sessionId;
    clearInterval(pollInterval);
    pollInterval = setInterval(fetchLatest, 5000);
    fetchLatest();
    setStatus('LIVE MONITORING', 'text-emerald-400');
});

// STOP — pause
document.getElementById('stop').addEventListener('click', async () => {
    await fetch('/sensor/stop', { method: 'POST' });
    clearInterval(pollInterval);
    setStatus('PAUSED', 'text-amber-400');
});

// NEW — fresh session, old data archived
document.getElementById('new-session').addEventListener('click', async () => {
    const res  = await fetch('/sensor/new', { method: 'POST' });
    const data = await res.json();
    activeSessionId = data.sessionId;

    // Reset display
    sessionData = [];
    renderTable();
    updateCards({});

    clearInterval(pollInterval);
    pollInterval = setInterval(fetchLatest, 5000);
    fetchLatest();
    setStatus('LIVE MONITORING', 'text-emerald-400');
});

// ─── Card click → graph (pass sessionId in URL) ───────────────────────────────
function goToGraph(sensor) {
    if (!activeSessionId) return alert('No active session yet. Press START first.');
    location.href = `/graph/${activeSessionId}/${sensor}`;
}

document.querySelector('.temperature')?.addEventListener('click',  () => goToGraph('temperature'));
document.querySelector('.turbidity')?.addEventListener('click',    () => goToGraph('turbidity'));
document.querySelector('.ph')?.addEventListener('click',           () => goToGraph('pH'));
document.querySelector('.water-level')?.addEventListener('click',  () => goToGraph('waterLevel'));

// ─── Start ────────────────────────────────────────────────────────────────────
init();
