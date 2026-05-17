"""
Process PokeAPI CSVs into a compact encounter database for shinyBingo.

Output: encounter_data.js  (a single JS const assignment)

Data structure:
  ENCOUNTER_DB[gameName][methodDisplayName] = [
    { location: "...", pokemon: "..." },
    ...
  ]
"""

import csv, json, os, collections

BASE = os.path.dirname(os.path.abspath(__file__))

def load(name):
    path = os.path.join(BASE, name)
    with open(path, newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f))

# ── Load tables ──────────────────────────────────────────────────────────────
enc_rows        = load('encounters.csv')
slots_rows      = load('encounter_slots.csv')
versions_rows   = load('versions.csv')
vgroups_rows    = load('version_groups.csv')
loc_areas_rows  = load('location_areas.csv')
loc_names_rows  = load('location_names.csv')
area_prose_rows = load('location_area_prose.csv')
pokemon_rows    = load('pokemon.csv')
species_rows    = load('pokemon_species_names.csv')

# ── Build lookup dicts ────────────────────────────────────────────────────────

# version_id -> version_group_id
ver_to_vg = {r['id']: r['version_group_id'] for r in versions_rows}

# version_group_id -> generation_id
vg_to_gen = {r['id']: r['generation_id'] for r in vgroups_rows}

# encounter_slot_id -> (version_group_id, encounter_method_id)
slot_to_method = {r['id']: (r['version_group_id'], r['encounter_method_id'])
                  for r in slots_rows}

# location_area_id -> location_id
area_to_loc = {r['id']: r['location_id'] for r in loc_areas_rows}

# location_id -> English name  (local_language_id 9 = English)
loc_name_en = {r['location_id']: r['name']
               for r in loc_names_rows if r['local_language_id'] == '9'}

# location_area_id -> English sub-area name
area_prose_en = {r['location_area_id']: r['name']
                 for r in area_prose_rows if r['local_language_id'] == '9'}

# pokemon_id -> species_id
poke_to_species = {r['id']: r['species_id'] for r in pokemon_rows}

# species_id -> English name
species_name_en = {r['pokemon_species_id']: r['name']
                   for r in species_rows if r['local_language_id'] == '9'}

# ── Method display names ──────────────────────────────────────────────────────
METHOD_DISPLAY = {
    '1':  'Wild Encounter',
    '2':  'Old Rod',
    '3':  'Good Rod',
    '4':  'Super Rod',
    '5':  'Surfing',
    '6':  'Rock Smash',
    '7':  'Headbutt',
    '8':  'Dark Grass',
    '9':  'Rustling Grass',
    '10': 'Dust Clouds',
    '11': 'Bridge Shadow',
    '12': 'Dark Water Fishing',
    '13': 'Dark Water Surfing',
    '14': 'Yellow Flowers',
    '15': 'Purple Flowers',
    '16': 'Red Flowers',
    '17': 'Horde Encounter',
    '18': 'Gift',
    '19': 'Gift (Egg)',
}

# Skip gift methods – not useful for the hunt randomizer
SKIP_METHODS = {'18', '19'}

# ── Version group -> game display name ───────────────────────────────────────
# We merge some version groups into shared game names for simplicity.
VG_TO_GAME = {
    '3':  'Gold / Silver',
    '4':  'Crystal',
    '5':  'Ruby / Sapphire',
    '6':  'Emerald',
    '7':  'FireRed / LeafGreen',
    '8':  'Diamond / Pearl',
    '9':  'Platinum',
    '10': 'HeartGold / SoulSilver',
    '11': 'Black / White',
    '14': 'Black 2 / White 2',
    '15': 'X / Y',
}

# For each version group, which single version_id do we use to query encounters?
# (pick one representative; encounters are largely the same within a vg)
VG_REPRESENTATIVE_VERSION = {
    '3':  '4',   # Gold
    '4':  '6',   # Crystal
    '5':  '7',   # Ruby
    '6':  '9',   # Emerald
    '7':  '10',  # FireRed
    '8':  '12',  # Diamond
    '9':  '14',  # Platinum
    '10': '15',  # HeartGold
    '11': '17',  # Black
    '14': '21',  # Black 2
    '15': '23',  # X
}

def build_location_label(area_id):
    """Return a human-readable location string like 'Eterna Forest' or 'Mt. Coronet - 1F Route 207'."""
    loc_id = area_to_loc.get(area_id, '')
    loc_main = loc_name_en.get(loc_id, '')
    sub = area_prose_en.get(area_id, '')
    if sub:
        return f"{loc_main} - {sub}" if loc_main else sub
    return loc_main or f"Area {area_id}"

# ── Build the encounter database ──────────────────────────────────────────────
# game_name -> method_name -> set of (location, pokemon) tuples
db = collections.defaultdict(lambda: collections.defaultdict(set))

for row in enc_rows:
    ver_id  = row['version_id']
    slot_id = row['encounter_slot_id']
    area_id = row['location_area_id']
    poke_id = row['pokemon_id']

    vg_id, method_id = slot_to_method.get(slot_id, (None, None))
    if not vg_id or method_id in SKIP_METHODS:
        continue
    if vg_id not in VG_TO_GAME:
        continue
    # Only process encounters from the representative version for this vg
    if ver_id != VG_REPRESENTATIVE_VERSION.get(vg_id, ''):
        continue

    game   = VG_TO_GAME[vg_id]
    method = METHOD_DISPLAY.get(method_id, method_id)

    species_id = poke_to_species.get(poke_id, '')
    poke_name  = species_name_en.get(species_id, '')
    loc_label  = build_location_label(area_id)

    if poke_name and loc_label:
        db[game][method].add((loc_label, poke_name))

# ── Serialize to compact JSON-compatible structure ────────────────────────────
output = {}
for game, methods in db.items():
    output[game] = {}
    for method, pairs in methods.items():
        output[game][method] = [
            {'location': loc, 'pokemon': poke}
            for loc, poke in sorted(pairs)
        ]

# Print summary
for game, methods in output.items():
    total = sum(len(v) for v in methods.values())
    method_counts = {m: len(pairs) for m, pairs in methods.items()}
    print(f"{game}: {total} entries | {method_counts}")

# ── Write JS file ─────────────────────────────────────────────────────────────
out_path = os.path.join(BASE, 'encounter_data.js')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write('// Auto-generated from PokeAPI CSVs. Do not edit manually.\n')
    f.write('const ENCOUNTER_DB = ')
    json.dump(output, f, ensure_ascii=False, separators=(',', ':'))
    f.write(';\n')

print(f"\nWrote {out_path}")
