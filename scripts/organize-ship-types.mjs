import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';

const outputDir = 'src/datas/by_type';

const typeFiles = {
  carrier: 'carriers_new.json',
  battleship: 'battleships_new.json',
  cruiser: 'cruisers_new.json',
  destroyer: 'destroyers_new.json',
  submarine: 'submarines_new.json',
  merchant: 'merchant_transport_new.json',
  small: 'small_warships_new.json',
  support: 'support_ships_new.json',
  other: 'other_ships_new.json'
};

const dataFiles = (await readdir('src/datas'))
  .filter((file) => /^data\d+_new\.json$/.test(file))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
  .map((file) => `src/datas/${file}`);

const getText = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'object') {
    return value[lang] || value.en || value.zh || '';
  }
  return value;
};

const getShipTypeCategory = (type) => {
  const normalizedType = getText(type, 'en').toLowerCase();

  if (/memorial|info marker/.test(normalizedType)) return 'other';
  if (/tender|fleet oiler|oiler|supply|provision|hospital|dry dock|rescue/.test(normalizedType)) return 'support';
  if (/freighter|merchant|transport|troopship|liner|cargo|liberty|tanker|hell ship|passenger/.test(normalizedType)) return 'merchant';
  if (/\bsubmarine\b|u-boat/.test(normalizedType)) return 'submarine';
  if (/battleship|battlecruiser|panzerschiff/.test(normalizedType)) return 'battleship';
  if (/carrier/.test(normalizedType)) return 'carrier';
  if (/destroyer|escort ship|kaibōkan/.test(normalizedType)) return 'destroyer';
  if (/cruiser/.test(normalizedType)) return 'cruiser';
  if (/minesweeper|minelayer|gunboat|corvette|frigate|sloop|pt boat|patrol|aviso/.test(normalizedType)) return 'small';
  if (/auxiliary/.test(normalizedType)) return 'support';

  return 'other';
};

const shipsById = new Map();

for (const file of dataFiles) {
  const ships = JSON.parse(await readFile(file, 'utf8'));

  ships.forEach((ship) => {
    if (!shipsById.has(ship.id)) {
      shipsById.set(ship.id, ship);
    }
  });
}

const shipsByType = Object.fromEntries(
  Object.keys(typeFiles).map((category) => [category, []])
);

Array.from(shipsById.values()).forEach((ship) => {
  shipsByType[getShipTypeCategory(ship.type)].push(ship);
});

await mkdir(outputDir, { recursive: true });

for (const [category, ships] of Object.entries(shipsByType)) {
  ships.sort((a, b) => getText(a.name).localeCompare(getText(b.name)));
  await writeFile(`${outputDir}/${typeFiles[category]}`, `${JSON.stringify(ships, null, 2)}\n`);
}

console.log(`Organized ${shipsById.size} unique ships into ${Object.keys(typeFiles).length} type files.`);

Object.entries(shipsByType).forEach(([category, ships]) => {
  console.log(`${category}: ${ships.length}`);
});
