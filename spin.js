// encounter_data.js (loaded first) defines ENCOUNTER_DB globally

const GAME_DATA_FALLBACK = {
  'Omega Ruby / Alpha Sapphire': {
    gen: 3,
    methods: ['Wild Encounter','Surfing','Old Rod','Good Rod','Super Rod','Rock Smash',
              'DexNav','Horde Encounter','Masuda Method','Soft Reset (Starters)','Soft Reset (Legendaries)'],
    starters:    ['Treecko','Torchic','Mudkip'],
    legendaries: ['Regirock','Regice','Registeel','Latias','Latios','Kyogre','Groudon','Rayquaza',
                  'Deoxys','Uxie','Mesprit','Azelf','Dialga','Palkia','Heatran','Regigigas',
                  'Giratina','Cresselia','Tornadus','Thundurus','Reshiram','Zekrom','Landorus','Kyurem'],
  },
  'Sun / Moon': {
    gen: 7,
    methods: ['Wild Encounter','SOS Battle','Surfing','Old Rod','Good Rod','Super Rod',
              'Masuda Method','Soft Reset (Starters)','Soft Reset (Legendaries)'],
    starters:    ['Rowlet','Litten','Popplio'],
    legendaries: ['Tapu Koko','Tapu Lele','Tapu Bulu','Tapu Fini','Cosmog','Solgaleo','Lunala','Necrozma'],
  },
  'Ultra Sun / Ultra Moon': {
    gen: 7,
    methods: ['Wild Encounter','SOS Battle','Ultra Wormhole','Surfing','Old Rod','Good Rod','Super Rod',
              'Masuda Method','Soft Reset (Starters)','Soft Reset (Legendaries)'],
    starters:    ['Rowlet','Litten','Popplio'],
    legendaries: ['Tapu Koko','Tapu Lele','Tapu Bulu','Tapu Fini','Solgaleo','Lunala','Necrozma',
                  'Articuno','Zapdos','Moltres','Mewtwo','Raikou','Entei','Suicune','Lugia','Ho-Oh',
                  'Regirock','Regice','Registeel','Latias','Latios','Kyogre','Groudon','Rayquaza',
                  'Uxie','Mesprit','Azelf','Dialga','Palkia','Heatran','Giratina','Cresselia',
                  'Tornadus','Thundurus','Reshiram','Zekrom','Landorus','Kyurem','Xerneas','Yveltal'],
    ultraWormhole: ['Articuno','Zapdos','Moltres','Mewtwo','Raikou','Entei','Suicune','Lugia','Ho-Oh',
                    'Regirock','Regice','Registeel','Latias','Latios','Kyogre','Groudon','Rayquaza',
                    'Uxie','Mesprit','Azelf','Dialga','Palkia','Heatran','Giratina','Cresselia',
                    'Tornadus','Thundurus','Reshiram','Zekrom','Landorus','Kyurem','Xerneas','Yveltal'],
  },
  "Let's Go Pikachu / Eevee": {
    gen: 1,
    methods: ['Catch Combo','Soft Reset (Legendaries)','Shiny Charm Boost'],
    starters:    ['Pikachu','Eevee'],
    legendaries: ['Articuno','Zapdos','Moltres','Mewtwo'],
  },
  'Sword / Shield': {
    gen: 8,
    methods: ['Wild Encounter','Masuda Method','Max Raid Battle','Dynamax Adventure','Fishing'],
    starters:    ['Grookey','Scorbunny','Sobble'],
    legendaries: ['Zacian','Zamazenta','Eternatus'],
    dynamaxAdventure: ['Articuno','Zapdos','Moltres','Mewtwo','Raikou','Entei','Suicune','Lugia','Ho-Oh',
                       'Latias','Latios','Kyogre','Groudon','Rayquaza','Uxie','Mesprit','Azelf',
                       'Dialga','Palkia','Heatran','Giratina','Cresselia','Tornadus','Thundurus',
                       'Reshiram','Zekrom','Landorus','Kyurem','Xerneas','Yveltal','Zygarde',
                       'Tapu Koko','Tapu Lele','Tapu Bulu','Tapu Fini','Solgaleo','Lunala','Necrozma'],
  },
  'Brilliant Diamond / Shining Pearl': {
    gen: 4,
    methods: ['Wild Encounter','Poké Radar','Surfing','Old Rod','Good Rod','Super Rod',
              'Masuda Method','Soft Reset (Starters)','Soft Reset (Legendaries)'],
    starters:    ['Turtwig','Chimchar','Piplup'],
    legendaries: ['Uxie','Mesprit','Azelf','Dialga','Palkia','Heatran','Regigigas','Giratina','Cresselia'],
  },
  'Legends: Arceus': {
    gen: 4,
    methods: ['Mass Outbreak','Massive Mass Outbreak','Space-Time Distortion',
              'Soft Reset (Starters)','Soft Reset (Legendaries)'],
    starters:    ['Rowlet','Cyndaquil','Oshawott'],
    legendaries: ['Uxie','Mesprit','Azelf','Dialga','Palkia','Heatran','Regigigas','Giratina',
                  'Cresselia','Tornadus','Thundurus','Landorus','Enamorus'],
  },
  'Scarlet / Violet': {
    gen: 9,
    methods: ['Wild Encounter','Outbreak','Sandwich Method','Tera Raid','Masuda Method',
              'Soft Reset (Starters)'],
    starters:    ['Sprigatito','Fuecoco','Quaxly'],
    legendaries: ['Koraidon','Miraidon','Wo-Chien','Chien-Pao','Ting-Lu','Chi-Yu'],
  },
};

const pokemonByGen = {
  1: ['Bulbasaur','Charmander','Squirtle','Pikachu','Eevee','Mewtwo','Dragonite','Snorlax','Gengar',
      'Alakazam','Machamp','Gyarados','Lapras','Articuno','Zapdos','Moltres','Dratini','Arcanine',
      'Ninetales','Vileplume','Golem','Slowbro','Magneton','Cloyster','Hypno','Electrode','Exeggutor',
      'Marowak','Hitmonlee','Hitmonchan','Rhydon','Chansey','Kangaskhan','Starmie','Scyther','Jynx',
      'Electabuzz','Magmar','Pinsir','Tauros','Vaporeon','Jolteon','Flareon','Porygon','Aerodactyl'],
  2: ['Chikorita','Cyndaquil','Totodile','Ampharos','Espeon','Umbreon','Tyranitar','Lugia','Ho-Oh',
      'Heracross','Scizor','Kingdra','Steelix','Houndoom','Blissey','Raikou','Entei','Suicune','Larvitar',
      'Crobat','Skarmory','Mantine','Donphan','Miltank'],
  3: ['Treecko','Torchic','Mudkip','Gardevoir','Blaziken','Swampert','Aggron','Salamence','Metagross',
      'Rayquaza','Groudon','Kyogre','Latias','Latios','Absol','Flygon','Milotic','Walrein','Slaking',
      'Breloom','Manectric','Altaria','Sharpedo','Camerupt'],
  4: ['Turtwig','Chimchar','Piplup','Lucario','Garchomp','Dialga','Palkia','Giratina','Arceus','Darkrai',
      'Shaymin','Cresselia','Heatran','Luxray','Staraptor','Roserade','Weavile','Gliscor','Mamoswine',
      'Gallade','Rotom','Togekiss','Glaceon','Leafeon'],
  5: ['Snivy','Tepig','Oshawott','Serperior','Emboar','Samurott','Excadrill','Zoroark','Chandelure',
      'Haxorus','Hydreigon','Volcarona','Reshiram','Zekrom','Kyurem','Cobalion','Terrakion','Virizion',
      'Landorus','Thundurus','Tornadus','Ferrothorn','Braviary'],
  6: ['Chespin','Fennekin','Froakie','Greninja','Aegislash','Sylveon','Goodra','Noivern','Xerneas',
      'Yveltal','Zygarde','Hawlucha','Heliolisk','Dragalge','Clawitzer'],
  7: ['Rowlet','Litten','Popplio','Decidueye','Incineroar','Primarina','Mimikyu','Solgaleo','Lunala',
      'Necrozma','Lycanroc','Kommo-o','Tapu Koko','Tapu Lele','Tapu Bulu','Tapu Fini','Toxapex',
      'Golisopod','Salazzle','Vikavolt'],
  8: ['Grookey','Scorbunny','Sobble','Rillaboom','Cinderace','Inteleon','Corviknight','Toxtricity',
      'Dragapult','Grimmsnarl','Zacian','Zamazenta','Eternatus','Urshifu','Regieleki','Regidrago'],
  9: ['Sprigatito','Fuecoco','Quaxly','Meowscarada','Skeledirge','Quaquaval','Koraidon','Miraidon',
      'Tinkaton','Garganacl','Annihilape','Kingambit','Baxcalibur','Gholdengo','Ceruledge','Armarouge',
      'Wo-Chien','Chien-Pao','Ting-Lu','Chi-Yu'],
};

const GAMES_DB = typeof ENCOUNTER_DB !== 'undefined' ? Object.keys(ENCOUNTER_DB) : [];
const GAMES_FB = Object.keys(GAME_DATA_FALLBACK);
const GAMES    = [...GAMES_DB, ...GAMES_FB];

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function getPokemonForFallback(game, method) {
  const d = GAME_DATA_FALLBACK[game];
  if (!d) return ['???'];
  if (method === 'Soft Reset (Starters)' || method === 'Catch Combo') return d.starters || [];
  if (method === 'Soft Reset (Legendaries)') return d.legendaries || [];
  if (method === 'Ultra Wormhole')    return d.ultraWormhole    || d.legendaries || [];
  if (method === 'Dynamax Adventure') return d.dynamaxAdventure || d.legendaries || [];
  let out = [];
  for (let i = 1; i <= d.gen; i++) out = out.concat(pokemonByGen[i] || []);
  return out.length ? out : ['???'];
}

function getMethodsForGame(game) {
  if (ENCOUNTER_DB?.[game]) return Object.keys(ENCOUNTER_DB[game]);
  return GAME_DATA_FALLBACK[game]?.methods || [];
}

function pickEncounterForMethod(game, method) {
  const pairs = ENCOUNTER_DB?.[game]?.[method];
  if (pairs?.length) { const p = getRandom(pairs); return {location: p.location, pokemon: p.pokemon}; }
  const pool = getPokemonForFallback(game, method);
  return {location: null, pokemon: pool.length ? getRandom(pool) : '???'};
}

function getLocationsForMethod(game, method) {
  const pairs = ENCOUNTER_DB?.[game]?.[method];
  return pairs ? [...new Set(pairs.map(p => p.location))] : [];
}

const METHOD_WEIGHTS = {
  'Wild Encounter':10, 'Soft Reset (Starters)':8, 'Soft Reset (Legendaries)':8,
  'DexNav':7, 'SOS Battle':7, 'Masuda Method':6, 'Horde Encounter':6,
  'Catch Combo':6, 'Mass Outbreak':6, 'Massive Mass Outbreak':6, 'Outbreak':6,
  'Sandwich Method':6, 'Headbutt':5, 'Dynamax Adventure':5, 'Max Raid Battle':5,
  'Space-Time Distortion':5, 'Ultra Wormhole':5, 'Poké Radar':5,
  'Rustling Grass':4, 'Dark Grass':4, 'Surfing':3, 'Dark Water Surfing':3,
  'Yellow Flowers':3, 'Purple Flowers':3, 'Red Flowers':3, 'Rock Smash':3,
  'Dust Clouds':3, 'Tera Raid':3, 'Shiny Charm Boost':3, 'Bridge Shadow':2,
  'Super Rod':2, 'Fishing':2, 'Good Rod':1, 'Old Rod':1, 'Dark Water Fishing':1,
};

function weightedRandom(methods) {
  const weights = methods.map(m => METHOD_WEIGHTS[m] ?? 4);
  const total   = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < methods.length; i++) { r -= weights[i]; if (r <= 0) return methods[i]; }
  return methods[methods.length - 1];
}

function landReel(el, value) {
  el.classList.remove('spinning');
  el.textContent = value;
  el.classList.add('landing');
  setTimeout(() => el.classList.remove('landing'), 500);
}

function spin() {
  const lockedNodeId = selectedNodeId;
  const els = {
    game:     document.getElementById('game'),
    method:   document.getElementById('method'),
    location: document.getElementById('location'),
    pokemon:  document.getElementById('pokemon'),
    btn:      document.getElementById('spinBtn'),
  };

  els.btn.disabled = true;
  [els.game, els.method, els.location, els.pokemon].forEach(e => e.classList.add('spinning'));

  const game    = getRandom(GAMES);
  const methods = getMethodsForGame(game);
  const method  = weightedRandom(methods);
  const enc     = pickEncounterForMethod(game, method);

  function animFrame(m) {
    const pairs = ENCOUNTER_DB?.[game]?.[m];
    if (pairs?.length) { const p = getRandom(pairs); return {loc: p.location, poke: p.pokemon}; }
    return {loc: '—', poke: getRandom(getPokemonForFallback(game, m))};
  }

  let ticks = 0, phase = 1;
  const iv = setInterval(() => {
    ticks++;
    if (phase === 1) {
      const f = animFrame(getRandom(methods));
      els.game.textContent = getRandom(GAMES); els.method.textContent = getRandom(methods);
      els.location.textContent = f.loc; els.pokemon.textContent = f.poke;
      if (ticks >= 20) { landReel(els.game, game); ticks = 0; phase = 2; }

    } else if (phase === 2) {
      const f = animFrame(getRandom(methods));
      els.method.textContent = getRandom(methods); els.location.textContent = f.loc; els.pokemon.textContent = f.poke;
      if (ticks >= 25) { landReel(els.method, method); ticks = 0; phase = 3; }

    } else if (phase === 3) {
      const locs = getLocationsForMethod(game, method);
      els.location.textContent = locs.length ? getRandom(locs) : '—';
      els.pokemon.textContent = ENCOUNTER_DB?.[game]?.[method]?.length
        ? getRandom(ENCOUNTER_DB[game][method]).pokemon
        : getRandom(getPokemonForFallback(game, method));
      if (ticks >= 25) { landReel(els.location, enc.location || '—'); ticks = 0; phase = 4; }

    } else {
      const pairs = ENCOUNTER_DB?.[game]?.[method];
      if (pairs?.length) {
        const pool = enc.location ? pairs.filter(p => p.location === enc.location) : pairs;
        els.pokemon.textContent = getRandom(pool.length ? pool : pairs).pokemon;
      } else {
        els.pokemon.textContent = getRandom(getPokemonForFallback(game, method));
      }
      if (ticks >= 25) {
        clearInterval(iv);
        landReel(els.pokemon, enc.pokemon);
        onSpinComplete({game, method, location: enc.location, pokemon: enc.pokemon}, lockedNodeId);
      }
    }
  }, 100);
}

function pokemonSlug(name) {
  return name.toLowerCase()
    .replace(/♀/g, '-f').replace(/♂/g, '-m')
    .replace(/['’]/g, '')
    .replace(/[.:\s]/g, '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '');
}

async function fetchShinySprite(pokemonName) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonSlug(pokemonName)}`);
    if (!res.ok) return null;
    return (await res.json()).sprites?.front_shiny ?? null;
  } catch { return null; }
}
