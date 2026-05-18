// ── GAME DATA ─────────────────────────────────────────────────────────────────

const EXTRA_GAMES = {
  'Sun / Moon': ['Rowlet','Litten','Popplio','Decidueye','Incineroar','Primarina',
    'Mimikyu','Solgaleo','Lunala','Necrozma','Lycanroc','Kommo-o','Tapu Koko',
    'Tapu Lele','Tapu Bulu','Tapu Fini','Toxapex','Golisopod','Salazzle','Vikavolt',
    'Pikipek','Yungoos','Grubbin','Crabrawler','Mudbray','Sandygast','Stufful',
    'Bounsweet','Comfey','Oranguru','Passimian','Wimpod','Jangmo-o','Wishiwashi',
    'Mareanie','Dhelmise','Drampa','Turtonator','Togedemaru','Bruxish'],
  'Ultra Sun / Ultra Moon': ['Rowlet','Litten','Popplio','Decidueye','Incineroar',
    'Primarina','Mimikyu','Solgaleo','Lunala','Necrozma','Lycanroc','Kommo-o',
    'Tapu Koko','Tapu Lele','Tapu Bulu','Tapu Fini','Poipole','Naganadel',
    'Stakataka','Blacephalon','Buzzwole','Pheromosa','Xurkitree','Celesteela',
    'Kartana','Guzzlord','Nihilego','Absol','Articuno','Zapdos','Moltres','Mewtwo',
    'Raikou','Entei','Suicune','Lugia','Ho-Oh','Latias','Latios','Kyogre','Groudon',
    'Rayquaza','Dialga','Palkia','Giratina','Xerneas','Yveltal'],
  "Let's Go Pikachu / Eevee": ['Bulbasaur','Charmander','Squirtle','Pikachu','Eevee',
    'Mewtwo','Dragonite','Snorlax','Gengar','Alakazam','Machamp','Gyarados','Lapras',
    'Articuno','Zapdos','Moltres','Aerodactyl','Vaporeon','Jolteon','Flareon',
    'Porygon','Hitmonlee','Hitmonchan','Scyther','Pinsir','Kangaskhan','Tauros'],
  'Sword / Shield': ['Grookey','Scorbunny','Sobble','Rillaboom','Cinderace','Inteleon',
    'Corviknight','Toxtricity','Dragapult','Grimmsnarl','Zacian','Zamazenta',
    'Eternatus','Urshifu','Regieleki','Regidrago','Galarian Articuno',
    'Galarian Zapdos','Galarian Moltres','Calyrex','Glastrier','Spectrier',
    'Kubfu','Zarude','Appletun','Flapple','Dreepy','Hatenna','Impidimp','Morpeko'],
  'Brilliant Diamond / Shining Pearl': ['Turtwig','Chimchar','Piplup','Lucario',
    'Garchomp','Dialga','Palkia','Giratina','Arceus','Darkrai','Shaymin','Cresselia',
    'Heatran','Rotom','Mesprit','Uxie','Azelf','Regigigas','Starly','Bidoof',
    'Shinx','Budew','Cranidos','Shieldon','Drifloon','Buizel','Cherubi','Shellos',
    'Stunky','Bonsly','Mime Jr.','Happiny','Chatot','Spiritomb','Riolu'],
  'Legends: Arceus': ['Rowlet','Cyndaquil','Oshawott','Decidueye','Typhlosion',
    'Samurott','Wyrdeer','Kleavor','Ursaluna','Basculegion','Sneasler','Overqwil',
    'Enamorus','Dialga','Palkia','Giratina','Arceus','Regigigas','Cresselia',
    'Hisuian Growlithe','Hisuian Voltorb','Hisuian Qwilfish','Hisuian Sneasel',
    'Hisuian Zorua','Hisuian Zoroark','Hisuian Braviary','Hisuian Lilligant'],
  'Scarlet / Violet': ['Sprigatito','Fuecoco','Quaxly','Meowscarada','Skeledirge',
    'Quaquaval','Koraidon','Miraidon','Tinkaton','Garganacl','Annihilape','Kingambit',
    'Baxcalibur','Gholdengo','Ceruledge','Armarouge','Wo-Chien','Chien-Pao',
    'Ting-Lu','Chi-Yu','Flutter Mane','Slither Wing','Great Tusk','Iron Treads',
    'Roaring Moon','Iron Valiant','Sandy Shocks','Iron Moth','Scream Tail',
    'Iron Bundle','Brute Bonnet','Iron Hands'],
};

const EXCLUDED_GAMES = new Set(['Gold / Silver', 'Crystal']);

function rollPokemon(exclude = []) {
  const dbGames    = typeof ENCOUNTER_DB !== 'undefined' ? Object.keys(ENCOUNTER_DB).filter(g => !EXCLUDED_GAMES.has(g)) : [];
  const extraGames = Object.keys(EXTRA_GAMES).filter(g => !EXCLUDED_GAMES.has(g));
  const allGames   = [...dbGames, ...extraGames];

  for (let attempt = 0; attempt < 40; attempt++) {
    const game = allGames[Math.floor(Math.random() * allGames.length)];
    let pool = [];
    if (typeof ENCOUNTER_DB !== 'undefined' && ENCOUNTER_DB[game]) {
      pool = Object.values(ENCOUNTER_DB[game]).flat().map(e => e.pokemon);
    } else if (EXTRA_GAMES[game]) {
      pool = EXTRA_GAMES[game];
    }
    pool = [...new Set(pool.filter(Boolean))].filter(p => !exclude.includes(p));
    if (!pool.length) continue;
    const pokemon = pool[Math.floor(Math.random() * pool.length)];
    return { game, pokemon };
  }
  return { game: allGames[0], pokemon: 'Pikachu' };
}

async function fetchShinySprite(name) {
  const slug = name.toLowerCase()
    .replace(/♀/g, '-f').replace(/♂/g, '-m')
    .replace(/['']/g, '').replace(/[.:\s]+/g, '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '');
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
    if (!res.ok) return null;
    return (await res.json()).sprites?.front_shiny ?? null;
  } catch { return null; }
}

// ── STATE ─────────────────────────────────────────────────────────────────────

function defaultState() { return { board: [] }; }
function isValidState(s) { return s && Array.isArray(s.board); }

let state = defaultState();
let pendingTileId = null;
let boardGenId = 0;

// ── BOARD GENERATION ──────────────────────────────────────────────────────────

async function generateBoard() {
  const genId = ++boardGenId;
  const entries = [];
  const used = [];

  for (let i = 0; i < 36; i++) {
    const { game, pokemon } = rollPokemon(used);
    used.push(pokemon);
    entries.push({ id: i, pokemon, game, sprite: null, claimedBy: null, found: false, revealed: false });
  }

  state.board = entries;
  renderAll();
  await saveState();

  await Promise.all(entries.map(async ({ id, pokemon }) => {
    const sprite = await fetchShinySprite(pokemon);
    if (boardGenId !== genId) return;
    const e = state.board.find(b => b.id === id);
    if (e && sprite) { e.sprite = sprite; renderBoard(); }
  }));

  if (boardGenId === genId) await saveState();
}

function confirmNewBoard() {
  const claimed = state.board.filter(e => e.claimedBy).length;
  if (claimed > 0 && !confirm(`Clear ${claimed} claimed tile(s) and generate a new board?`)) return;
  generateBoard();
}

// ── MODAL ─────────────────────────────────────────────────────────────────────

function openModal(id) {
  const entry = state.board.find(e => e.id === id);
  if (!entry || entry.claimedBy) return;

  if (!entry.revealed) {
    entry.revealed = true;
    renderBoard();
    saveState();
  }

  pendingTileId = id;
  const wrap = document.getElementById('modalSpriteWrap');
  wrap.innerHTML = entry.sprite
    ? `<img src="${entry.sprite}" alt="${entry.pokemon}" class="modal-sprite-img">`
    : `<div style="font-size:52px;line-height:1">✨</div>`;
  document.getElementById('modalPokemon').textContent = entry.pokemon;
  document.getElementById('modalGame').textContent    = entry.game;
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  pendingTileId = null;
  document.getElementById('modal').classList.add('hidden');
}

async function claim(player) {
  if (pendingTileId === null) return;
  const entry = state.board.find(e => e.id === pendingTileId);
  if (entry) entry.claimedBy = player;
  closeModal();
  renderAll();
  await saveState();
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────

async function rerollTile() {
  if (pendingTileId === null) return;
  const entry = state.board.find(e => e.id === pendingTileId);
  if (!entry) return;

  const exclude = state.board.filter(b => b.id !== pendingTileId).map(b => b.pokemon);
  const { game, pokemon } = rollPokemon(exclude);
  entry.pokemon = pokemon;
  entry.game    = game;
  entry.sprite  = null;
  renderBoard();

  document.getElementById('modalPokemon').textContent    = pokemon;
  document.getElementById('modalGame').textContent       = game;
  document.getElementById('modalSpriteWrap').innerHTML   = `<div style="font-size:52px;line-height:1">✨</div>`;

  const sprite = await fetchShinySprite(pokemon);
  const fresh  = state.board.find(b => b.id === pendingTileId);
  if (fresh && fresh.pokemon === pokemon) {
    fresh.sprite = sprite;
    renderBoard();
    if (pendingTileId !== null) {
      document.getElementById('modalSpriteWrap').innerHTML = sprite
        ? `<img src="${sprite}" alt="${pokemon}" class="modal-sprite-img">`
        : `<div style="font-size:52px;line-height:1">✨</div>`;
    }
    await saveState();
  }
}

async function toggleFound(id) {
  const entry = state.board.find(e => e.id === id);
  if (entry) entry.found = !entry.found;
  renderAll();
  await saveState();
}

async function unclaim(id) {
  const entry = state.board.find(e => e.id === id);
  if (entry) { entry.claimedBy = null; entry.found = false; }
  renderAll();
  await saveState();
}

// ── RENDER ────────────────────────────────────────────────────────────────────

function renderBoard() {
  const grid = document.getElementById('boardGrid');
  if (!grid) return;

  if (!state.board.length) {
    grid.innerHTML = `
      <div class="board-empty">
        <div>No board yet</div>
        <button class="generate-btn" onclick="generateBoard()">Generate Board</button>
      </div>`;
    return;
  }

  grid.innerHTML = '';
  state.board.forEach(entry => {
    const tile = document.createElement('div');
    const classes = ['tile'];
    if (!entry.revealed)      classes.push('face-down');
    else if (entry.claimedBy) classes.push('claimed', `claimed-${entry.claimedBy}`);
    tile.className = classes.join(' ');

    if (!entry.claimedBy) tile.onclick = () => openModal(entry.id);

    if (!entry.revealed) {
      tile.innerHTML = `<div class="tile-mystery">✦</div>`;
    } else {
      tile.innerHTML = `
        ${entry.sprite
          ? `<img src="${entry.sprite}" alt="${entry.pokemon}" class="tile-img">`
          : `<div class="tile-placeholder">✨</div>`}
        <div class="tile-name">${entry.pokemon}</div>
        <div class="tile-game">${entry.game}</div>
        ${entry.claimedBy ? `<div class="tile-badge">${entry.claimedBy === 'dave' ? 'Dave' : 'Colton'}</div>` : ''}
      `;
    }
    grid.appendChild(tile);
  });
}

function renderRoster(player) {
  const container = document.getElementById(`${player}Roster`);
  const header    = document.getElementById(`${player}Header`);
  if (!container) return;

  const claimed = state.board.filter(e => e.claimedBy === player);
  const found   = claimed.filter(e => e.found).length;
  const name    = player === 'dave' ? 'Dave' : 'Colton';
  if (header) header.textContent = claimed.length ? `${name}  ${found}/${claimed.length}` : name;

  if (!claimed.length) {
    container.innerHTML = '<div class="empty-state">No claims yet</div>';
    return;
  }

  container.innerHTML = '';
  claimed.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'roster-card' + (entry.found ? ' found' : '');
    card.innerHTML = `
      ${entry.sprite
        ? `<img src="${entry.sprite}" alt="${entry.pokemon}" class="roster-sprite">`
        : `<div class="roster-sprite-ph">✨</div>`}
      <div class="roster-info">
        <div class="roster-pokemon">${entry.pokemon}</div>
        <div class="roster-game">${entry.game}</div>
      </div>
      <div class="card-actions">
        <button class="found-btn${entry.found ? ' active' : ''}"
          title="${entry.found ? 'Unmark' : 'Mark found'}"
          onclick="toggleFound(${entry.id})">★</button>
        <button class="delete-btn" title="Unclaim" onclick="unclaim(${entry.id})">✕</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderAll() {
  renderBoard();
  renderRoster('dave');
  renderRoster('colton');
}

// ── PERSIST ───────────────────────────────────────────────────────────────────

async function saveState() {
  isSaving = true;
  state.savedAt = Date.now();
  localStorage.setItem('shinyBounty', JSON.stringify(state));
  await pushState(state);
  isSaving = false;
}

async function loadAndRender() {
  try {
    const saved  = localStorage.getItem('shinyBounty');
    const parsed = saved ? JSON.parse(saved) : null;
    if (isValidState(parsed)) state = parsed;
  } catch {}
  renderAll();
  setSyncStatus('loading', '⟳ Syncing...');

  const remote = await pullState();
  if (isValidState(remote)) {
    const remoteNewer = !state.savedAt || !remote.savedAt || remote.savedAt >= state.savedAt;
    if (remoteNewer) {
      state = remote;
      localStorage.setItem('shinyBounty', JSON.stringify(state));
      renderAll();
    }
  }
  setSyncStatus('ok', '✓ Ready');
  startAutoRefresh();
}

window.addEventListener('load', loadAndRender);
