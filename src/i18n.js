// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        search: "Search Ship",
        searchPlaceholder: "Enter ship name...",
        battleFilter: "Battle Filter",
        factionFilter: "Faction Filter",
        matchCount: "Matched",
        ships: "ships",

        faction: "Faction",
        type: "Type",
        date: "Date",
        battle: "Battle",
        depth: "Depth",
        cause: "Cause"
      }
    },
    zh: {
      translation: {
        search: "搜索舰船",
        searchPlaceholder: "输入船名...",
        battleFilter: "战役筛选",
        factionFilter: "国籍筛选",
        matchCount: "当前匹配",
        ships: "艘舰艇",

        faction: "所属国",
        type: "类型",
        date: "日期",
        battle: "战役",
        depth: "深度",
        cause: "沉没原因"
      }
    }
  },
  lng: 'en', // 默认语言
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;