// ── STATE ─────────────────────────────────────────────────────────────────────

function defaultState() {
  const daveStart   = DAVE_STARTS[Math.floor(Math.random() * DAVE_STARTS.length)];
  const coltonStart = MIRROR[daveStart];
  return {
    fronts:      {dave: daveStart, colton: coltonStart},
    territories: {
      [daveStart]:   {owner:'dave',   hunt:null, sprite:null},
      [coltonStart]: {owner:'colton', hunt:null, sprite:null},
    },
    pending: {dave:null, colton:null},
    scores:  {dave:1, colton:1},
    winner:  null,
  };
}

function isValidState(s) {
  return s && s.fronts && s.territories && s.pending && s.scores;
}

let state          = defaultState();
let currentPlayer  = 'dave';
let selectedNodeId = null;

// ── PLAYER SELECT ─────────────────────────────────────────────────────────────

function setPlayer(p) {
  currentPlayer  = p;
  selectedNodeId = null;
  document.getElementById('btnDave').classList.toggle('active', p === 'dave');
  document.getElementById('btnColton').classList.toggle('active', p === 'colton');
  showSpinUI(false);
  renderGame();
}

// ── NODE CLICK ────────────────────────────────────────────────────────────────

function onNodeClick(nodeId) {
  if (state.winner) return;
  if (state.pending[currentPlayer]) return;
  if (state.territories[nodeId]?.owner) return;

  const front = state.fronts[currentPlayer];
  if (front === null || !ADJ[front]?.includes(nodeId)) return;

  selectedNodeId = nodeId;
  showSpinUI(true);
  renderMap();
}

// ── SPIN CALLBACK ─────────────────────────────────────────────────────────────

async function onSpinComplete(result) {
  if (selectedNodeId === null) return;
  state.pending[currentPlayer] = {nodeId: selectedNodeId, ...result};
  selectedNodeId = null;
  showSpinUI(false);
  await saveState();
  renderGame();
}

// ── RESPIN ────────────────────────────────────────────────────────────────────

async function respinHunt(player) {
  const pend = state.pending[player];
  if (!pend || state.winner) return;
  const nodeId = pend.nodeId;
  state.pending[player] = null;
  await saveState();
  setPlayer(player);
  selectedNodeId = nodeId;
  showSpinUI(true);
  renderMap();
}

// ── MARK FOUND ────────────────────────────────────────────────────────────────

async function markFound(player) {
  const pend = state.pending[player];
  if (!pend || state.winner) return;

  const {nodeId, game, method, location, pokemon} = pend;

  state.territories[nodeId] = {owner:player, hunt:{game, method, location, pokemon}, sprite:null};
  state.fronts[player]      = nodeId;
  state.pending[player]     = null;
  state.scores[player]++;
  if (state.scores[player] >= 16) state.winner = player;

  await saveState();
  renderGame();

  fetchShinySprite(pokemon).then(url => {
    if (!url || !state.territories[nodeId]) return;
    state.territories[nodeId].sprite = url;
    const img = document.querySelector(`#node-${nodeId} image.sprite`);
    if (img) { img.setAttribute('href', url); img.setAttribute('visibility', 'visible'); }
    saveState();
  });
}

// ── NEW GAME ──────────────────────────────────────────────────────────────────

async function newGame() {
  if (!confirm('Start a new conquest? All territory will be lost.')) return;
  state          = defaultState();
  selectedNodeId = null;
  showSpinUI(false);
  await saveState();
  renderGame();
}

// ── PERSIST ───────────────────────────────────────────────────────────────────

async function saveState() {
  isSaving = true;
  localStorage.setItem('shinyConquest', JSON.stringify(state));
  await pushState(state);
  isSaving = false;
}

async function loadAndRender() {
  setSyncStatus('loading', '⟳ Loading...');
  const remote = await pullState();
  if (isValidState(remote)) {
    state = remote;
  } else {
    try {
      const saved = localStorage.getItem('shinyConquest');
      const parsed = saved ? JSON.parse(saved) : null;
      state = isValidState(parsed) ? parsed : defaultState();
    } catch { state = defaultState(); }
  }
  localStorage.setItem('shinyConquest', JSON.stringify(state));
  setSyncStatus('ok', '✓ Loaded');
  buildMap();
  renderGame();
  startAutoRefresh();
}

// ── UI HELPERS ────────────────────────────────────────────────────────────────

function showSpinUI(show) {
  document.getElementById('spinHint').hidden  =  show;
  document.getElementById('slots').hidden     = !show;
  const btn = document.getElementById('spinBtn');
  btn.hidden   = !show;
  btn.disabled = !show;
  if (!show) {
    ['game','method','location','pokemon'].forEach(id => {
      const el = document.getElementById(id);
      el.textContent = '– – –';
      el.classList.remove('spinning','landing');
    });
  }
}

// ── RENDER ────────────────────────────────────────────────────────────────────

function renderGame() {
  renderScoreboard();
  renderMap();
  renderPanels();
}

function renderScoreboard() {
  ['dave','colton'].forEach(p => {
    document.querySelector(`#${p}Score .score-value`).textContent = state.scores[p] ?? 0;
  });
  const banner = document.getElementById('winBanner');
  if (state.winner) {
    banner.textContent = `★ ${state.winner.toUpperCase()} WINS THE CONQUEST! ★`;
    banner.hidden = false;
  } else {
    banner.hidden = true;
  }
}

function renderMap() {
  const front      = state.fronts[currentPlayer];
  const claimable  = front !== null
    ? ADJ[front].filter(id => !state.territories[id]?.owner) : [];
  const dPend      = state.pending.dave?.nodeId;
  const cPend      = state.pending.colton?.nodeId;

  NODES.forEach(n => {
    const g   = document.getElementById(`node-${n.id}`);
    if (!g) return;
    const ter = state.territories[n.id];
    const cls = ['territory'];

    if (ter?.owner) {
      cls.push(`owned-${ter.owner}`);
      if (state.fronts.dave   === n.id) cls.push('front-dave');
      if (state.fronts.colton === n.id) cls.push('front-colton');
    } else if (dPend === n.id && cPend === n.id) {
      cls.push('contested');
    } else if (dPend === n.id) {
      cls.push('pending-dave');
    } else if (cPend === n.id) {
      cls.push('pending-colton');
    } else if (claimable.includes(n.id)) {
      cls.push('claimable');
    }

    if (n.id === selectedNodeId) cls.push('selected');
    g.setAttribute('class', cls.join(' '));

    // Sprite
    const img = g.querySelector('image.sprite');
    if (img) {
      const hasSprite = ter?.sprite;
      img.setAttribute('href', hasSprite || '');
      img.setAttribute('visibility', hasSprite ? 'visible' : 'hidden');
    }

    // Label: hide when a hunt sprite would show
    const lbl = g.querySelector('text.node-label');
    if (lbl) lbl.setAttribute('visibility', ter?.hunt ? 'hidden' : 'visible');

    // Tooltip
    const title = g.querySelector('title');
    if (title) {
      if (ter?.hunt) {
        title.textContent = `${ter.hunt.pokemon} · ${ter.hunt.method} · ${ter.hunt.game}`;
      } else if (ter?.owner) {
        title.textContent = `${ter.owner.charAt(0).toUpperCase() + ter.owner.slice(1)}'s base`;
      } else {
        const isPend = dPend === n.id ? 'Dave hunting here' : cPend === n.id ? 'Colton hunting here' : '';
        title.textContent = isPend || `Territory ${n.id + 1}`;
      }
    }
  });
}

function renderPanels() {
  ['dave','colton'].forEach(p => {
    const pend = state.pending[p];
    const body = document.getElementById(`${p}PanelBody`);
    const btns = document.getElementById(`${p}HuntBtns`);

    if (pend) {
      body.innerHTML =
        `<strong>${pend.pokemon}</strong>` +
        `Territory #${pend.nodeId + 1}<br>` +
        `${pend.game}<br>` +
        `${pend.method}${pend.location ? ' · ' + pend.location : ''}`;
      btns.hidden = false;
    } else {
      body.textContent = 'No active hunt';
      btns.hidden = true;
    }
  });
}

window.addEventListener('load', loadAndRender);
