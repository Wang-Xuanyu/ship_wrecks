import { readdir, readFile, writeFile } from 'node:fs/promises';

const dataFiles = (await readdir('src/datas'))
  .filter((file) => /^data\d+_new\.json$/.test(file))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
  .map((file) => `src/datas/${file}`);

const simplifications = new Map([
  ['Aftermath of Leyte Gulf (Dasol Bay)', { zh: '莱特湾海战', en: 'Battle of Leyte Gulf' }],
  ['Aftermath of Leyte Gulf (Manila Bay Air Strike)', { zh: '莱特湾海战', en: 'Battle of Leyte Gulf' }],
  ['Aftermath of Leyte Gulf (Taiwan Strait Interception)', { zh: '莱特湾海战', en: 'Battle of Leyte Gulf' }],
  ['Battle of Biak (Operation Kon)', { zh: '比亚克岛战役', en: 'Battle of Biak' }],
  ['Battle of Biak (Outer Blockade)', { zh: '比亚克岛战役', en: 'Battle of Biak' }],
  ['Battle of France (Naval Evacuation)', { zh: '法国战役', en: 'Battle of France' }],
  ['Battle of Guam (Outer Blockade)', { zh: '关岛战役', en: 'Battle of Guam' }],
  ['Battle of Leyte Gulf (Blockade)', { zh: '莱特湾海战', en: 'Battle of Leyte Gulf' }],
  ['Battle of Luzon (Convoy Escort)', { zh: '吕宋岛战役', en: 'Battle of Luzon' }],
  ['Battle of Luzon (Interception Action)', { zh: '吕宋岛战役', en: 'Battle of Luzon' }],
  ['Battle of Luzon (Lingayen Gulf)', { zh: '吕宋岛战役', en: 'Battle of Luzon' }],
  ['Battle of the Philippine Sea (Outer Blockade)', { zh: '菲律宾海海战', en: 'Battle of the Philippine Sea' }],
  ['Battle of the Philippine Sea (Preliminary Action)', { zh: '菲律宾海海战', en: 'Battle of the Philippine Sea' }],
  ['Battle of Tinian (Outer Blockade)', { zh: '提尼安岛战役', en: 'Battle of Tinian' }],
  ['Bougainville Campaign (Air Attack)', { zh: '布干维尔战役', en: 'Bougainville Campaign' }],
  ['Bougainville Campaign (Anti-Submarine/Mine Warfare)', { zh: '布干维尔战役', en: 'Bougainville Campaign' }],
  ['Bougainville Campaign (Blockade)', { zh: '布干维尔战役', en: 'Bougainville Campaign' }],
  ['Crimean Campaign (Black Sea Evacuation)', { zh: '克里米亚战役', en: 'Crimean Campaign' }],
  ['English Channel Naval Actions (Late War)', { zh: '英吉利海峡海战', en: 'English Channel Naval Actions' }],
  ['English Channel Naval Actions (Post-Normandy)', { zh: '英吉利海峡海战', en: 'English Channel Naval Actions' }],
  ['English Channel Naval Actions (Pre-Overlord)', { zh: '英吉利海峡海战', en: 'English Channel Naval Actions' }],
  ['Gilbert Islands Campaign (Makin Island)', { zh: '吉尔伯特群岛战役', en: 'Gilbert Islands Campaign' }],
  ['Gilbert Islands Campaign (Outer Blockade)', { zh: '吉尔伯特群岛战役', en: 'Gilbert Islands Campaign' }],
  ['Gilbert Islands Campaign (Tarawa)', { zh: '吉尔伯特群岛战役', en: 'Gilbert Islands Campaign' }],
  ['Java Sea Campaign (Defense of the Dutch East Indies)', { zh: '爪哇海战役', en: 'Java Sea Campaign' }],
  ['Mariana Islands Campaign (Subsequent Mopping-up)', { zh: '马里亚纳战役', en: 'Mariana Islands Campaign' }],
  ['Marshall Islands Campaign (Kwajalein Waters)', { zh: '马绍尔群岛战役', en: 'Marshall Islands Campaign' }],
  ['Marshall Islands Campaign (Near Wotje)', { zh: '马绍尔群岛战役', en: 'Marshall Islands Campaign' }],
  ['Marshall Islands Campaign (Outer Blockade)', { zh: '马绍尔群岛战役', en: 'Marshall Islands Campaign' }],
  ['Mediterranean Campaign (Operation Torch Logistics)', { zh: '地中海战役', en: 'Mediterranean Campaign' }],
  ['North African Campaign (Red Sea Supply Line)', { zh: '北非战役', en: 'North African Campaign' }],
  ['Operation Hailstone (Prelude)', { zh: '特鲁克大空袭', en: 'Operation Hailstone' }],
  ['Operation Hailstone (Surface Interception)', { zh: '特鲁克大空袭', en: 'Operation Hailstone' }],
  ['Pacific Submarine Warfare (Australian East Coast)', { zh: '太平洋潜艇战', en: 'Pacific Submarine Warfare' }],
  ['Pacific Submarine Warfare (Japanese Home Waters)', { zh: '太平洋潜艇战', en: 'Pacific Submarine Warfare' }]
]);

const getText = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'object') {
    return value[lang] || value.en || value.zh || '';
  }
  return value;
};

let updatedCount = 0;

for (const file of dataFiles) {
  const ships = JSON.parse(await readFile(file, 'utf8'));
  const updatedShips = ships.map((ship) => {
    const battleName = getText(ship.battle, 'en');
    const simplifiedBattle = simplifications.get(battleName);

    if (!simplifiedBattle) {
      return ship;
    }

    updatedCount += 1;
    return {
      ...ship,
      battle: simplifiedBattle
    };
  });

  await writeFile(file, `${JSON.stringify(updatedShips, null, 2)}\n`);
}

console.log(`Simplified ${updatedCount} ship battle entries.`);
