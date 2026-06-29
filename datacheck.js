import { readdir, readFile, writeFile } from 'node:fs/promises';

const dataFiles = (await readdir('src/datas/by_type'))
  .filter((file) => file.endsWith('_new.json'))
  .sort()
  .map((file) => `src/datas/by_type/${file}`);

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
  const shipwrecks = JSON.parse(await readFile(file, 'utf8'));

  shipwrecks.forEach((shipwreck) => {
    const battleNameEn = getText(shipwreck.battle, 'en');
    const battleId = slugify(battleNameEn);

    if (!battlesById.has(battleId)) {
      const existingBattle = existingBattlesById.get(battleId);

      battlesById.set(battleId, {
        id: battleId,
        name: {
          zh: getText(shipwreck.battle, 'zh'),
          en: battleNameEn
        },
        commanders: existingBattle?.commanders ?? [],
        pics: existingBattle?.pics ?? []
      });
    }
  });
}

const battles = Array.from(battlesById.values()).sort((a, b) =>
  a.name.en.localeCompare(b.name.en)
);

await writeFile('src/datas/battles_new.json', `${JSON.stringify(battles, null, 2)}\n`);
await writeFile('battles.json', `${JSON.stringify(battles, null, 2)}\n`);

console.log(`Checked ${dataFiles.length} data files.`);
console.log(`Created battle metadata with ${battles.length} battles.`);
