import data1 from './src/datas/data1_new.json' with { type: 'json' };
import data2 from './src/datas/data2_new.json' with { type: 'json' };
import data3 from './src/datas/data3_new.json' with { type: 'json' };
import data4 from './src/datas/data4_new.json' with { type: 'json' };
import data5 from './src/datas/data5_new.json' with { type: 'json' };
import data6 from './src/datas/data6_new.json' with { type: 'json' };
import data7 from './src/datas/data7_new.json' with { type: 'json' };
import data8 from './src/datas/data8_new.json' with { type: 'json' };
import data9 from './src/datas/data9_new.json' with { type: 'json' };
import data10 from './src/datas/data10_new.json' with { type: 'json' };
import { writeFile } from 'node:fs/promises';

const allShipwrecks = [...data1, ...data2, ...data3, ...data4, ...data5, ...data6, ...data7, ...data8, ...data9, ...data10];
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

allShipwrecks.forEach((shipwreck) => {
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

const battles = Array.from(battlesById.values()).sort((a, b) =>
  a.name.en.localeCompare(b.name.en)
);

await writeFile('src/datas/battles_new.json', `${JSON.stringify(battles, null, 2)}\n`);
await writeFile('battles.json', `${JSON.stringify(battles, null, 2)}\n`);

console.log(`Created battle metadata with ${battles.length} battles.`);
