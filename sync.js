const MASTER_KEY = '$2a$10$y78gUbDpbg0cgnCLtYOgO.YI6kWqvi1Z0F45uFkoC2cpPACtN.G7y';
const BIN_ID     = '69ed383a856a6821897180c7';

var isSaving = false;

function setSyncStatus(s, msg) {
  const el = document.getElementById('syncStatus');
  if (!el) return;
  el.textContent = msg;
  el.style.color = ({ok:'var(--green)', err:'var(--red)', loading:'var(--gold)'})[s] ?? 'var(--muted)';
}

async function pushState(data) {
  setSyncStatus('loading', '⟳ Saving...');
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json', 'X-Master-Key': MASTER_KEY},
      body: JSON.stringify(data),
    });
    if (!res.ok) { setSyncStatus('err', '✗ Save failed'); return false; }
    setSyncStatus('ok', '✓ Saved ' + new Date().toLocaleTimeString());
    return true;
  } catch { setSyncStatus('err', '✗ Save failed'); return false; }
}

async function pullState() {
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {'X-Master-Key': MASTER_KEY},
    });
    if (!res.ok) return null;
    return (await res.json()).record ?? null;
  } catch { return null; }
}

function startAutoRefresh() {
  setInterval(async () => {
    if (document.hidden || isSaving) return;
    const remote = await pullState();
    if (!isValidState(remote) || isSaving) return;
    if (remote.savedAt && state.savedAt && remote.savedAt < state.savedAt) return;
    state = remote;
    localStorage.setItem('shinyBounty', JSON.stringify(state));
    renderBountyBoard();
    setSyncStatus('ok', '✓ Synced ' + new Date().toLocaleTimeString());
  }, 15000);
}
