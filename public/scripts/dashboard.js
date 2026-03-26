let pollInterval = null;

// Fetch and render averages + table
async function loadDashboard() {
    const [avgRes, dataRes] = await Promise.all([
        fetch('/sensor/averages'),
        fetch('/sensor/data')
    ]);
    const avg  = await avgRes.json();
    const data = await dataRes.json();

    // Update cards
    document.querySelector('.temp-avg').textContent     = avg.avgTemp?.toFixed(1)       ?? '--';
    document.querySelector('.turbidity-avg').textContent = avg.avgTurbidity?.toFixed(1) ?? '--';
    document.querySelector('.ph-avg').textContent        = avg.avgPH?.toFixed(2)        ?? '--';
    document.querySelector('.water-avg').textContent     = avg.avgWaterLevel?.toFixed(1) ?? '--';

    // Water quality
    const grade = getWaterGrade(avg.avgPH, avg.avgTurbidity, avg.avgTemp);
    const gradeEl = document.querySelector('.grade');
    const percEl  = document.querySelector('.percentage');
    if (grade.drinkable == null) {
        if (gradeEl) gradeEl.textContent = '--';
        if (percEl) percEl.textContent = '-- %';
    } else {
        if (gradeEl) gradeEl.textContent = grade.grade;
        if (percEl) percEl.textContent = grade.drinkable + '%';
    }

    // Table
    renderTable(data);
}

function getWaterGrade(pH, turbidity, temp) {
    // If we don't have any averages yet, keep the UI in the "--" state.
    if ([pH, turbidity, temp].some(v => v === undefined || v === null || Number.isNaN(v))) {
        return { grade: '--', drinkable: null };
    }

    let score = 100;
    if (pH < 6.5 || pH > 8.5)         score -= 30;
    else if (pH < 7.0 || pH > 8.0)    score -= 10;
    if (turbidity > 4)                 score -= 30;
    else if (turbidity > 1)            score -= 10;
    if (temp > 35 || temp < 5)         score -= 20;

    if (score >= 80) return { grade: 'A', drinkable: score };
    if (score >= 60) return { grade: 'B', drinkable: score };
    if (score >= 40) return { grade: 'C', drinkable: score };
    return { grade: 'D', drinkable: score };
}

function renderTable(data) {
    const container = document.querySelector('.data-list');
    if (!container) return;

    const emptyState = container.querySelector('.empty-state');
    // Remove old rows (keep header)
    container.querySelectorAll('.data-row').forEach(r => r.remove());

    if (!data || data.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    if (emptyState) emptyState.style.display = 'none';

    data.forEach((row, i) => {
        const div = document.createElement('div');
        div.className = 'data-row grid grid-cols-6 px-6 py-3 border-t border-slate-800 text-xs mono text-slate-400 hover:bg-slate-800/30';
        div.innerHTML = `
            <div>${i + 1}</div>
            <div class="col-span-2">${new Date(row.timestamp).toLocaleString('en-IN')}</div>
            <div>${row.temperature ?? '--'}</div>
            <div>${row.turbidity ?? '--'}</div>
            <div>${row.pH ?? '--'} / ${row.waterLevel ?? '--'}</div>
        `;
        container.appendChild(div);
    });
}

// Buttons
document.getElementById('start').addEventListener('click', async () => {
    await fetch('/sensor/start', { method: 'POST' });
    pollInterval = setInterval(loadDashboard, 5000);
    loadDashboard();
});

document.getElementById('stop').addEventListener('click', async () => {
    await fetch('/sensor/stop', { method: 'POST' });
    clearInterval(pollInterval);
});

document.getElementById('restart').addEventListener('click', async () => {
    await fetch('/sensor/restart', { method: 'POST' });
    clearInterval(pollInterval);
    pollInterval = setInterval(loadDashboard, 5000);
    loadDashboard();
});

// Click card → graph page
const temperatureCard = document.querySelector('.temperature');
if (temperatureCard) temperatureCard.addEventListener('click', () => location.href = '/graph/temperature');

const turbidityCard = document.querySelector('.turbidity');
if (turbidityCard) turbidityCard.addEventListener('click', () => location.href = '/graph/turbidity');

const phCard = document.querySelector('.ph');
if (phCard) phCard.addEventListener('click', () => location.href = '/graph/pH');

const waterLevelCard = document.querySelector('.water-level');
if (waterLevelCard) waterLevelCard.addEventListener('click', () => location.href = '/graph/waterLevel');

// Initial load
loadDashboard();