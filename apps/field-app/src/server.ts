import http from 'node:http';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '/api';

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Poco Field App — Care Officer Mobile Portal</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-100 text-slate-900 min-h-screen flex justify-center selection:bg-emerald-100 selection:text-emerald-800">
  <div class="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col border-x border-slate-200">
    <!-- Top App Bar -->
    <header class="bg-slate-900 text-white px-5 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
          🌿
        </div>
        <div>
          <h1 class="text-sm font-bold tracking-tight">Poco Field App</h1>
          <p class="text-[11px] text-emerald-400 font-medium">Care Officer Workspace</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span id="sync-indicator" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Synced
        </span>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 p-4 space-y-4 overflow-y-auto">
      <!-- Officer Quick Card -->
      <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-sm border border-slate-700/50">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Officer</span>
            <h2 class="text-base font-bold text-white mt-0.5" id="officer-name">Care Officer (Field Demo)</h2>
            <p class="text-xs text-slate-400">Cluster: <span class="text-emerald-400 font-medium">Indiranagar, Bengaluru</span></p>
          </div>
          <div class="w-10 h-10 rounded-full bg-slate-700/80 border border-slate-600 flex items-center justify-center text-sm font-bold text-emerald-400">
            CO
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-700/60 text-center">
          <div>
            <div class="text-xs text-slate-400">Today Visits</div>
            <div class="text-base font-extrabold text-white mt-0.5">3</div>
          </div>
          <div>
            <div class="text-xs text-slate-400">Completed</div>
            <div class="text-base font-extrabold text-emerald-400 mt-0.5">1</div>
          </div>
          <div>
            <div class="text-xs text-slate-400">Pending Sync</div>
            <div class="text-base font-extrabold text-teal-300 mt-0.5">0</div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
        <button id="tab-visits" onclick="switchTab('visits')" class="flex-1 py-2 rounded-lg bg-white text-slate-900 shadow-sm transition-all font-bold">📋 Visits (3)</button>
        <button id="tab-vitals" onclick="switchTab('vitals')" class="flex-1 py-2 rounded-lg text-slate-500 hover:text-slate-900 transition-all">🩺 Vitals Entry</button>
        <button id="tab-emergency" onclick="switchTab('emergency')" class="flex-1 py-2 rounded-lg text-slate-500 hover:text-slate-900 transition-all">🚨 Emergency</button>
      </div>

      <!-- Section: Visits List -->
      <div id="view-visits" class="space-y-3">
        <!-- Visit Card 1 -->
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all space-y-3">
          <div class="flex items-start justify-between">
            <div>
              <span class="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-md uppercase tracking-wider">Scheduled (10:00 AM)</span>
              <h3 class="text-sm font-bold text-slate-900 mt-1">Savitri & K. V. Rao</h3>
              <p class="text-xs text-slate-500">12th Main Road, Indiranagar, Bengaluru</p>
            </div>
            <span class="text-xs font-semibold text-slate-400 mono">#SR-9041</span>
          </div>

          <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1 text-slate-600">
            <div class="font-medium text-slate-800">Assigned Services:</div>
            <div class="flex items-center gap-1.5 text-slate-600">
              <span>💊</span> <span>Morning Vitals & Blood Pressure Check</span>
            </div>
            <div class="flex items-center gap-1.5 text-slate-600">
              <span>🩺</span> <span>Prescription Delivery Handover</span>
            </div>
          </div>

          <div class="flex gap-2 pt-1">
            <button onclick="simulateStartVisit('SR-9041')" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition-all shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1.5">
              <span>📍</span> Start Visit (GPS Geofence)
            </button>
            <button onclick="openSopWizard('SR-9041')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-lg text-xs transition-all border border-slate-200">
              SOP Checklist
            </button>
          </div>
        </div>

        <!-- Visit Card 2 -->
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all space-y-3">
          <div class="flex items-start justify-between">
            <div>
              <span class="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-md uppercase tracking-wider">In Progress (On-Site)</span>
              <h3 class="text-sm font-bold text-slate-900 mt-1">Leela Menon</h3>
              <p class="text-xs text-slate-500">Kochi Cluster, Ernakulam</p>
            </div>
            <span class="text-xs font-semibold text-slate-400 mono">#SR-8820</span>
          </div>

          <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1 text-slate-600">
            <div class="font-medium text-slate-800">Assigned Services:</div>
            <div class="flex items-center gap-1.5 text-slate-600">
              <span>🚶</span> <span>Physiotherapy Assisted Walk</span>
            </div>
          </div>

          <div class="flex gap-2 pt-1">
            <button onclick="openSopWizard('SR-8820')" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition-all shadow-sm">
              Complete SOP Steps (3/4 Done)
            </button>
          </div>
        </div>
      </div>

      <!-- Section: Vitals Entry -->
      <div id="view-vitals" class="space-y-3 hidden">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 class="text-sm font-bold text-slate-900">Record Senior Vitals</h3>
          <p class="text-xs text-slate-500">Values are validated locally with WatermelonDB offline schema before sync.</p>
          
          <div class="space-y-3 pt-2">
            <div>
              <label class="text-xs font-semibold text-slate-700">Senior Person</label>
              <select class="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs bg-slate-50 font-medium">
                <option>K. V. Rao (Household: Rao Family)</option>
                <option>Leela Menon (Household: Menon Residence)</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-xs font-semibold text-slate-700">Systolic (mmHg)</label>
                <input type="number" id="vital-sys" value="128" class="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs font-semibold" />
              </div>
              <div>
                <label class="text-xs font-semibold text-slate-700">Diastolic (mmHg)</label>
                <input type="number" id="vital-dia" value="82" class="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs font-semibold" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-xs font-semibold text-slate-700">Pulse (BPM)</label>
                <input type="number" id="vital-pulse" value="74" class="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs font-semibold" />
              </div>
              <div>
                <label class="text-xs font-semibold text-slate-700">Blood Sugar (mg/dL)</label>
                <input type="number" id="vital-sugar" value="112" class="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs font-semibold" />
              </div>
            </div>

            <button onclick="saveVitals()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-all shadow-md shadow-emerald-600/20">
              Save Vitals to Local Outbox
            </button>
            <div id="vitals-status" class="text-xs font-semibold text-emerald-600 text-center hidden">✓ Saved locally & queued for sync</div>
          </div>
        </div>
      </div>

      <!-- Section: Emergency SOS View -->
      <div id="view-emergency" class="space-y-3 hidden">
        <div class="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-3">
          <div class="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <span>🚨</span>
            <span>Emergency SOS Profile</span>
          </div>
          <p class="text-xs text-rose-800 leading-relaxed">
            One-tap escalation for emergency medical situations during field visits.
          </p>

          <div class="bg-white p-3 rounded-lg border border-rose-200 text-xs space-y-1.5">
            <div class="font-bold text-slate-900">Senior: K. V. Rao (78 yrs)</div>
            <div class="text-slate-600">Blood Group: <strong class="text-rose-600 font-bold">O+ Positive</strong></div>
            <div class="text-slate-600">Primary Hospital: <strong>Manipal Hospital, HAL Road</strong></div>
            <div class="text-slate-600">Known Allergies: <strong>Penicillin</strong></div>
            <div class="text-slate-600">Emergency Contact: <strong>Ananya Rao (+91 98450 12345)</strong></div>
          </div>

          <button onclick="triggerEmergencyAlert()" class="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2">
            <span>📞</span> Trigger Emergency Dispatch (Ambulance + Ops)
          </button>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation Bar -->
    <footer class="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-slate-500 sticky bottom-0 z-20">
      <button onclick="switchTab('visits')" class="flex flex-col items-center gap-1 text-emerald-600">
        <span class="text-base">📋</span>
        <span class="text-[10px] font-bold">Visits</span>
      </button>
      <button onclick="switchTab('vitals')" class="flex flex-col items-center gap-1 hover:text-slate-900">
        <span class="text-base">🩺</span>
        <span class="text-[10px] font-semibold">Vitals</span>
      </button>
      <button onclick="switchTab('emergency')" class="flex flex-col items-center gap-1 hover:text-rose-600">
        <span class="text-base">🚨</span>
        <span class="text-[10px] font-semibold">SOS</span>
      </button>
      <button onclick="simulateSyncNow()" class="flex flex-col items-center gap-1 hover:text-slate-900">
        <span class="text-base">🔄</span>
        <span class="text-[10px] font-semibold">Sync</span>
      </button>
    </footer>
  </div>

  <script>
    function switchTab(tab) {
      document.getElementById('view-visits').classList.add('hidden');
      document.getElementById('view-vitals').classList.add('hidden');
      document.getElementById('view-emergency').classList.add('hidden');
      
      document.getElementById('tab-visits').className = 'flex-1 py-2 rounded-lg text-slate-500 hover:text-slate-900 transition-all';
      document.getElementById('tab-vitals').className = 'flex-1 py-2 rounded-lg text-slate-500 hover:text-slate-900 transition-all';
      document.getElementById('tab-emergency').className = 'flex-1 py-2 rounded-lg text-slate-500 hover:text-slate-900 transition-all';

      if (tab === 'visits') {
        document.getElementById('view-visits').classList.remove('hidden');
        document.getElementById('tab-visits').className = 'flex-1 py-2 rounded-lg bg-white text-slate-900 shadow-sm transition-all font-bold';
      } else if (tab === 'vitals') {
        document.getElementById('view-vitals').classList.remove('hidden');
        document.getElementById('tab-vitals').className = 'flex-1 py-2 rounded-lg bg-white text-slate-900 shadow-sm transition-all font-bold';
      } else if (tab === 'emergency') {
        document.getElementById('view-emergency').classList.remove('hidden');
        document.getElementById('tab-emergency').className = 'flex-1 py-2 rounded-lg bg-white text-slate-900 shadow-sm transition-all font-bold text-rose-600';
      }
    }

    function simulateStartVisit(id) {
      alert('📍 Geofence verified (lat: 12.9716, lng: 77.6412). Visit status updated to ON_SITE and mutation queued.');
    }

    function openSopWizard(id) {
      alert('📋 SOP Checklist opened for ' + id + '. Steps: 1. Greet Senior [✓], 2. Check Vitals [✓], 3. Medication Handover [✓], 4. Upload Photo Proof [Pending].');
    }

    function saveVitals() {
      const status = document.getElementById('vitals-status');
      status.classList.remove('hidden');
      setTimeout(() => status.classList.add('hidden'), 3000);
    }

    function triggerEmergencyAlert() {
      if (confirm('Are you sure you want to trigger emergency SOS dispatch for this senior?')) {
        alert('🚨 Emergency SOS dispatched! High-priority ticket created on Ops dashboard and nearest partner notified.');
      }
    }

    function simulateSyncNow() {
      const pill = document.getElementById('sync-indicator');
      pill.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Syncing...';
      setTimeout(() => {
        pill.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Synced';
      }, 1500);
    }
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        app: 'poco-field-app',
        port: PORT,
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  // Serve the Field App web interface
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
  });
  res.end(HTML_TEMPLATE);
});

server.listen(PORT, HOST, () => {
  console.log(`[Poco Field App] Server running on http://${HOST}:${PORT}`);
  console.log(`[Poco Field App] Connected to API at: ${API_BASE}`);
});
