import { readdir, readFile, writeFile } from 'node:fs/promises';

const dataFiles = (await readdir('src/datas'))
  .filter((file) => /^data\d+_new\.json$/.test(file))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
  .map((file) => `src/datas/${file}`);

const slugify = (value) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getText = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'object') {
    return value[lang] || value.en || value.zh || '';
  }
  return value;
};

const existingBattles = await readFile('src/datas/battles_new.json', 'utf8')
  .then((content) => JSON.parse(content))
  .catch(() => []);
const existingBattlesById = new Map(existingBattles.map((battle) => [battle.id, battle]));
const battlesById = new Map();

for (const file of dataFiles) {
  const ships = JSON.parse(await readFile(file, 'utf8'));

  const updatedShips = ships.map((ship) => {
    const battleNameEn = getText(ship.battle, 'en');
    const battleId = slugify(battleNameEn);

    if (!battlesById.has(battleId)) {
      const existingBattle = existingBattlesById.get(battleId);

      battlesById.set(battleId, {
        id: battleId,
        name: {
          zh: getText(ship.battle, 'zh'),
          en: battleNameEn
        },
        commanders: existingBattle?.commanders ?? [],
        pics: existingBattle?.pics ?? []
      });
    }

    return {
      ...ship,
      battleId
    };
  });

  await writeFile(file, `${JSON.stringify(updatedShips, null, 2)}\n`);
}

const battles = Array.from(battlesById.values()).sort((a, b) =>
  a.name.en.localeCompare(b.name.en)
);

await writeFile('src/datas/battles_new.json', `${JSON.stringify(battles, null, 2)}\n`);
await writeFile('battles.json', `${JSON.stringify(battles, null, 2)}\n`);

console.log(`Added battleId to ${dataFiles.length} data files.`);
console.log(`Created ${battles.length} battle metadata records.`);
