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

const battlesById = new Map();

for (const file of dataFiles) {
  const shipwrecks = JSON.parse(await readFile(file, 'utf8'));

  shipwrecks.forEach((shipwreck) => {
    const battleNameEn = getText(shipwreck.battle, 'en');
    const battleId = slugify(battleNameEn);

    if (!battlesById.has(battleId)) {
      battlesById.set(battleId, {
        id: battleId,
        name: {
          zh: getText(shipwreck.battle, 'zh'),
          en: battleNameEn
        },
        commanders: []
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
