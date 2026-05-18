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

function rollPokemon(exclude = []) {
  const dbGames    = typeof ENCOUNTER_DB !== 'undefined' ? Object.keys(ENCOUNTER_DB) : [];
  const extraGames = Object.keys(EXTRA_GAMES);
  const allGames   = [...dbGames, ...extraGames];

  for (let attempt = 0; attempt < 20; attempt++) {
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
    return {game, pokemon};
  }
  // Fallback: return anything
  const game = allGames[0];
  return {game, pokemon: 'Pikachu'};
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

function defaultState() { return {dave: [], colton: []}; }

function isValidState(s) {
  return s && Array.isArray(s.dave) && Array.isArray(s.colton);
}

let state = defaultState();

// ── ACTIONS ───────────────────────────────────────────────────────────────────

function allPokemonOnBoard() {
  return [...state.dave, ...state.colton].map(e => e.pokemon);
}

async function addSpin(player) {
  const btn = document.querySelector(`.roll-btn.${player}`);
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Rolling...'; }

  const {game, pokemon} = rollPokemon(allPokemonOnBoard());
  const id = Date.now() + Math.random();
  state[player].push({id, pokemon, game, sprite: null});
  renderBountyBoard();
  saveState();

  const sprite = await fetchShinySprite(pokemon);
  const entry  = state[player].find(e => e.id === id);
  if (sprite && entry) {
    entry.sprite = sprite;
    renderBountyBoard();
    saveState();
  }

  if (btn) { btn.disabled = false; btn.textContent = '🎲 Roll Bounty'; }
}

async function rerollEntry(player, id) {
  const entry = state[player].find(e => e.id === id);
  if (!entry) return;

  const exclude = allPokemonOnBoard().filter(p => p !== entry.pokemon);
  const {game, pokemon} = rollPokemon(exclude);
  entry.pokemon = pokemon;
  entry.game    = game;
  entry.sprite  = null;
  entry.found   = false;
  renderBountyBoard();
  saveState();

  const sprite = await fetchShinySprite(pokemon);
  const fresh  = state[player].find(e => e.id === id);
  if (sprite && fresh && fresh.pokemon === pokemon) {
    fresh.sprite = sprite;
    renderBountyBoard();
    saveState();
  }
}

async function deleteEntry(player, id) {
  state[player] = state[player].filter(e => e.id !== id);
  renderBountyBoard();
  await saveState();
}

async function toggleFound(player, id) {
  const entry = state[player].find(e => e.id === id);
  if (entry) entry.found = !entry.found;
  renderBountyBoard();
  await saveState();
}

// ── RENDER ────────────────────────────────────────────────────────────────────

function renderBountyBoard() {
  ['dave', 'colton'].forEach(p => {
    const container = document.getElementById(`${p}Bounties`);
    if (!container) return;

    // Update header with progress count
    const header     = document.getElementById(`${p}Header`);
    const total      = state[p].length;
    const foundCount = state[p].filter(e => e.found).length;
    const name       = p === 'dave' ? 'Dave' : 'Colton';
    if (header) header.textContent = total > 0 ? `${name}  ${foundCount} / ${total}` : name;

    if (total === 0) {
      container.innerHTML = '<div class="empty-state">No bounties yet</div>';
      return;
    }

    // Sort: active hunts first, found ones at bottom
    const sorted = [...state[p]].sort((a, b) => (a.found ? 1 : 0) - (b.found ? 1 : 0));

    container.innerHTML = '';
    sorted.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'bounty-card' + (entry.found ? ' found' : '');

      const spriteHtml = entry.sprite
        ? `<img src="${entry.sprite}" alt="${entry.pokemon}" class="shiny-sprite">`
        : `<div class="sprite-placeholder">✨</div>`;

      card.innerHTML = `
        ${spriteHtml}
        <div class="bounty-info">
          <div class="bounty-pokemon">${entry.pokemon}</div>
          <div class="bounty-game">${entry.game}</div>
        </div>
        <div class="card-actions">
          <button class="reroll-btn" title="Reroll" onclick="rerollEntry('${p}', ${entry.id})">↺</button>
          <button class="found-btn${entry.found ? ' active' : ''}" title="${entry.found ? 'Unmark' : 'Mark found'}" onclick="toggleFound('${p}', ${entry.id})">★</button>
          <button class="delete-btn" title="Remove" onclick="deleteEntry('${p}', ${entry.id})">✕</button>
        </div>
      `;
      container.appendChild(card);
    });
  });
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
  // Render immediately from localStorage — no network wait
  try {
    const saved  = localStorage.getItem('shinyBounty');
    const parsed = saved ? JSON.parse(saved) : null;
    if (isValidState(parsed)) state = parsed;
  } catch {}
  renderBountyBoard();
  setSyncStatus('loading', '⟳ Syncing...');

  // Sync from remote in background
  const remote = await pullState();
  if (isValidState(remote)) {
    const remoteNewer = !state.savedAt || !remote.savedAt || remote.savedAt >= state.savedAt;
    if (remoteNewer) {
      state = remote;
      localStorage.setItem('shinyBounty', JSON.stringify(state));
      renderBountyBoard();
    }
  }
  setSyncStatus('ok', '✓ Ready');
  startAutoRefresh();
}

window.addEventListener('load', loadAndRender);
