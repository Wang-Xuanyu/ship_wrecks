import { readdir, readFile, writeFile } from 'node:fs/promises';

const sourceDir = 'src/datas/by_type';

const typeFiles = [
  'battleships_new.json',
  'carriers_new.json',
  'cruisers_new.json',
  'destroyers_new.json',
  'merchant_transport_new.json',
  'other_ships_new.json',
  'small_warships_new.json',
  'submarines_new.json',
  'support_ships_new.json'
];

const getText = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'object') {
    return value[lang] || value.en || value.zh || '';
  }
  return value;
};

const slugify = (value) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const existingFiles = new Set(await readdir(sourceDir));
const missingFiles = typeFiles.filter((file) => !existingFiles.has(file));

if (missingFiles.length > 0) {
  throw new Error(`Missing by_type files: ${missingFiles.join(', ')}`);
}

const seenIds = new Map();
let totalShips = 0;

for (const file of typeFiles) {
  const path = `${sourceDir}/${file}`;
  const ships = JSON.parse(await readFile(path, 'utf8'));
  const normalizedShips = ships.map((ship) => ({
    ...ship,
    battleId: ship.battleId || slugify(getText(ship.battle))
  }));

  normalizedShips.sort((a, b) => getText(a.name).localeCompare(getText(b.name)));
  await writeFile(path, `${JSON.stringify(normalizedShips, null, 2)}\n`);

  normalizedShips.forEach((ship) => {
    if (seenIds.has(ship.id)) {
      throw new Error(`Duplicate ship id "${ship.id}" in ${file} and ${seenIds.get(ship.id)}`);
    }
    seenIds.set(ship.id, file);
  });

  totalShips += normalizedShips.length;
  console.log(`${file}: ${normalizedShips.length}`);
}

console.log(`Checked ${totalShips} ships across ${typeFiles.length} by_type files.`);
