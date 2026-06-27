import { useState, useMemo, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from 'react-leaflet';

import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';

// 导入数据
import data1 from './datas/data1_new.json';
import data2 from './datas/data2_new.json';
import data3 from './datas/data3_new.json';
import data4 from './datas/data4_new.json';
import data5 from './datas/data5_new.json';
import data6 from './datas/data6_new.json';
import data7 from './datas/data7_new.json';
import data8 from './datas/data8_new.json';
import data9 from './datas/data9_new.json';
import data10 from './datas/data10_new.json';
import data11 from './datas/data11_new.json';
import data12 from './datas/data12_new.json';
import data13 from './datas/data13_new.json';
import battlesData from './datas/battles_new.json';

const allShipwrecks = [...data1, ...data2, ...data3, ...data4, ...data5, ...data6, ...data7, ...data8, ...data9,...data10,...data11, ...data12, ...data13];
const shipwrecksById = new Map();
allShipwrecks.forEach((ship) => {
  if (!shipwrecksById.has(ship.id)) {
    shipwrecksById.set(ship.id, ship);
  }
});
const shipwrecks = Array.from(shipwrecksById.values());
const battlesById = new Map(battlesData.map((battle) => [battle.id, battle]));

const getText = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'object') {
    return value[lang] || value.en || value.zh || '';
  }
  return value;
};

const SHIP_TYPE_FILTERS = [
  { id: 'All', label: { en: 'All types', zh: '全部类型' } },
  { id: 'carrier', label: { en: 'Carriers', zh: '航空母舰' } },
  { id: 'battleship', label: { en: 'Battleships', zh: '战列舰' } },
  { id: 'cruiser', label: { en: 'Cruisers', zh: '巡洋舰' } },
  { id: 'destroyer', label: { en: 'Destroyers', zh: '驱逐舰' } },
  { id: 'submarine', label: { en: 'Submarines', zh: '潜艇' } },
  { id: 'merchant', label: { en: 'Merchant / transport', zh: '商船/运输船' } },
  { id: 'small', label: { en: 'Small warships', zh: '小型军舰' } },
  { id: 'support', label: { en: 'Support ships', zh: '支援舰船' } },
  { id: 'other', label: { en: 'Other', zh: '其他' } }
];

const getShipTypeCategory = (type) => {
  const normalizedType = getText(type, 'en').toLowerCase();

  if (/carrier|aircraft/.test(normalizedType)) return 'carrier';
  if (/battleship|battlecruiser|panzerschiff/.test(normalizedType)) return 'battleship';
  if (/cruiser/.test(normalizedType)) return 'cruiser';
  if (/destroyer|escort ship|kaibōkan/.test(normalizedType)) return 'destroyer';
  if (/submarine|u-boat/.test(normalizedType)) return 'submarine';
  if (/freighter|merchant|transport|troopship|liner|cargo|liberty|tanker|oiler|hell ship|passenger/.test(normalizedType)) return 'merchant';
  if (/minesweeper|minelayer|gunboat|corvette|frigate|sloop|pt boat|patrol/.test(normalizedType)) return 'small';
  if (/tender|supply|provision|hospital|auxiliary|dry dock|rescue/.test(normalizedType)) return 'support';

  return 'other';
};

const normalizeLongitude = (lng) => {
  return lng < -100 ? lng + 360 : lng;
};

const getMinimumMapZoom = (isMobile) => (isMobile ? 2 : 2);

// 自动缩放组件
const ChangeView = ({ filteredData, isMobile, controlsExpanded }) => {
  const map = useMap();
  useEffect(() => {
    const minZoom = getMinimumMapZoom(isMobile);
    map.setMinZoom(minZoom);

    if (filteredData.length > 0) {
      const bounds = L.latLngBounds(
        filteredData.map((s) => [
          s.coordinates[0],
          normalizeLongitude(s.coordinates[1])
        ])
      );
      const targetZoom = Math.max(map.getBoundsZoom(bounds), minZoom);

      map.fitBounds(bounds, {
        paddingTopLeft: [24, 24],
        paddingBottomRight: [24, isMobile ? (controlsExpanded ? 280 : 104) : 24],
        minZoom,
        maxZoom: 10,
        animate: true,
        duration: 1.5
      });

      if (targetZoom === minZoom) {
        window.setTimeout(() => {
          map.setZoom(minZoom);
        }, 0);
      }
    }
  }, [filteredData, map, isMobile, controlsExpanded]);
  return null;
};

// 图标设置
const createFlagIcon = (flagUrl) =>
  new L.Icon({
    iconUrl: flagUrl,
    iconSize: [30, 20],
    iconAnchor: [15, 10],
    popupAnchor: [0, -0],
    className: 'flag-marker-shadow'
  });

const ShipwreckMap = () => {
  const { i18n } = useTranslation();
  const [selectedBattle, setSelectedBattle] = useState('All');
  const [selectedFaction, setSelectedFaction] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // 响应式状态：增加 SSR 兼容判断和窗口高度监听
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const lang = i18n.language;

  const battles = useMemo(() => {
    const battleIdsWithShips = new Set(shipwrecks.map((ship) => ship.battleId));
    return battlesData.filter((battle) => battleIdsWithShips.has(battle.id));
  }, []);

  const selectedBattleDetails = selectedBattle === 'All' ? null : battlesById.get(selectedBattle);

  const factions = useMemo(() => {
    const all = shipwrecks.map((s) => getText(s.faction, lang));
    return ['All', ...new Set(all)];
  }, [lang]);

  const filteredShipwrecks = useMemo(() => {
    return shipwrecks.filter((ship) => {
      const faction = getText(ship.faction, lang);
      const name = getText(ship.name, lang);
      const battleMatch = selectedBattle === 'All' || ship.battleId === selectedBattle;
      const factionMatch = selectedFaction === 'All' || faction === selectedFaction;
      const typeMatch = selectedType === 'All' || getShipTypeCategory(ship.type) === selectedType;
      const searchMatch = searchQuery === '' || name.toLowerCase().includes(searchQuery.toLowerCase());
      return battleMatch && factionMatch && typeMatch && searchMatch;
    });
  }, [selectedBattle, selectedFaction, selectedType, searchQuery, lang]);

  const controlsExpanded = !isMobile || filtersOpen;
  const popupWidth = isMobile ? Math.max(220, Math.min(windowWidth - 44, 320)) : 300;
  const popupMinWidth = isMobile ? Math.max(200, Math.min(windowWidth - 64, 260)) : 260;

  return (
    <div className="relative w-full h-[100dvh] min-h-[520px] overflow-hidden bg-slate-950">

      {/* 控制面板 */}
      <div className="absolute z-[1000] bg-white/95 p-3 md:p-[15px] rounded-lg shadow-[0_4px_18px_rgba(0,0,0,0.25)] flex flex-col gap-2 left-3 right-3 bottom-3 max-h-[58dvh] overflow-y-auto md:top-[20px] md:right-[20px] md:bottom-auto md:left-auto md:w-[260px] md:max-h-[calc(100dvh-40px)]">
        <div className="flex items-center gap-2">
            <button
            onClick={() => i18n.changeLanguage(lang === 'en' ? 'zh' : 'en')}
            className="min-h-11 flex-1 rounded border border-[#ccc] bg-[#f0f0f0] px-3 py-2 text-[14px] font-semibold cursor-pointer md:min-h-0 md:text-[13px]"
            >
            {lang === 'en' ? '中文' : 'EN'}
            </button>
            <div className="flex-[2] flex items-center justify-center text-sm text-[#555] md:text-xs">
                {filteredShipwrecks.length} {lang === 'en' ? 'ships' : '艘沉船'}
            </div>
            {isMobile && (
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                className="min-h-11 rounded border border-[#ccc] bg-[#f8fafc] px-3 py-2 text-sm font-semibold text-[#1f2937]"
                aria-expanded={filtersOpen}
              >
                {filtersOpen ? (lang === 'en' ? 'Hide' : '收起') : (lang === 'en' ? 'Filter' : '筛选')}
              </button>
            )}
        </div>

        {controlsExpanded && (
          <>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'en' ? 'Search ship...' : '搜索船名...'}
            className="min-h-11 w-full rounded border border-[#ccc] px-3 py-2 text-[16px] md:min-h-0 md:text-[13px]"
          />

          <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
            <select
            value={selectedBattle}
            onChange={(e) => setSelectedBattle(e.target.value)}
            className="min-h-11 w-full rounded border border-[#ccc] bg-white px-3 py-2 text-[16px] md:min-h-0 md:text-[13px]"
            >
              <option value="All">All</option>
            {battles.map((battle) => (
                <option key={battle.id} value={battle.id}>{getText(battle.name, lang)}</option>
            ))}
            </select>

            <select
            value={selectedFaction}
            onChange={(e) => setSelectedFaction(e.target.value)}
            className="min-h-11 w-full rounded border border-[#ccc] bg-white px-3 py-2 text-[16px] md:min-h-0 md:text-[13px]"
            >
            {factions.map((f) => (
                <option key={f} value={f}>{f}</option>
            ))}
            </select>

            <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="min-h-11 w-full rounded border border-[#ccc] bg-white px-3 py-2 text-[16px] md:min-h-0 md:text-[13px]"
            >
            {SHIP_TYPE_FILTERS.map((type) => (
                <option key={type.id} value={type.id}>{getText(type.label, lang)}</option>
            ))}
            </select>
          </div>

          {selectedBattleDetails && (
            <div className="rounded border border-[#d6dee8] bg-[#f8fafc] p-3 text-left text-[13px] text-[#334155]">
              <div className="font-semibold text-[#0f172a]">
                {getText(selectedBattleDetails.name, lang)}
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                {lang === 'en' ? 'Commanders' : '指挥官'}
              </div>
              {selectedBattleDetails.commanders.length > 0 ? (
                <div className="mt-2 flex flex-col gap-2">
                  {selectedBattleDetails.commanders.map((commander) => (
                    <div key={`${commander.side}-${commander.name}`}>
                      <div className="font-medium text-[#1f2937]">{commander.name}</div>
                      <div className="text-xs text-[#64748b]">
                        {[commander.side, commander.role].filter(Boolean).join(' - ')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-xs italic text-[#64748b]">
                  {lang === 'en' ? 'Commander data not added yet.' : '指挥官资料尚未添加。'}
                </div>
              )}
            </div>
          )}
          </>
        )}
      </div>

      {/* 地图组件 */}
      <MapContainer
        center={[15, 155]}
        zoom={isMobile ? 2 : 3}
        minZoom={getMinimumMapZoom(isMobile)}
        className="h-full w-full z-0" // 确保地图处于控制面板下方
        zoomControl={!isMobile} 
        worldCopyJump={true}
      >
        <ChangeView
          filteredData={filteredShipwrecks}
          isMobile={isMobile}
          controlsExpanded={controlsExpanded}
        />

        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution="Labels &copy; Esri"
          zIndex={2}
        />

        {filteredShipwrecks.map((ship) => {
          const name = getText(ship.name, lang);
          const faction = getText(ship.faction, lang);
          const type = getText(ship.type, lang);
          const battle = getText(ship.battle, lang);
          const cause = getText(ship.cause, lang);
          const historyNotes = getText(ship.historyNotes, lang);

          return (
            <Marker
              key={ship.id}
              position={[
                ship.coordinates[0],
                normalizeLongitude(ship.coordinates[1])
              ]}
              icon={createFlagIcon(ship.flagIconUrl)}
            >
              <Popup 
                // 动态高度：最大不超屏幕的 55%，超过会自动出现滚动条
                maxHeight={windowHeight * (isMobile ? 0.5 : 0.55)}
                minWidth={popupMinWidth}
                maxWidth={popupWidth}
                keepInView={true} 
                autoPan={true}
                autoPanPaddingTopLeft={[16, 24]} 
                autoPanPaddingBottomRight={[16, isMobile ? (controlsExpanded ? 300 : 116) : 24]} 
              >
                <div className="w-full overflow-x-hidden text-[13px] md:text-[14px]">
                  <h3 className="m-0 mb-2 text-[15px] md:text-[16px] text-[#2c3e50]">{name}</h3>

                  <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                    <b>{lang === 'en' ? 'Faction' : '阵营'}:</b> <span>{faction}</span>
                    <b>{lang === 'en' ? 'Type' : '类型'}:</b> <span>{type}</span>
                    <b>{lang === 'en' ? 'Battle' : '战役'}:</b> <span>{battle}</span>
                    <b>{lang === 'en' ? 'Date' : '时间'}:</b> <span>{ship.sinkingDate}</span>
                  </div>

                  {ship.cover && (
                    <img
                      src={ship.cover}
                      alt={name}
                      // 增加 aspect-video 固定比例，避免图片加载前后高度突变导致弹窗错位
                      className="w-full mt-[10px] rounded aspect-video object-cover"
                    />
                  )}

                  <div className="mt-[10px] border-t border-[#eee] pt-2">
                    <b className="text-[#e74c3c]">{lang === 'en' ? 'Cause' : '沉没原因'}:</b>
                    <div className="mt-1 italic">{cause}</div>
                  </div>

                  {historyNotes && (
                    <div className="mt-[10px] border-t border-[#eee] pt-2">
                      <b className="text-[#2563eb]">{lang === 'en' ? 'History Notes' : '历史备注'}:</b>
                      <div className="mt-1 leading-relaxed">{historyNotes}</div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ShipwreckMap;
// import React, { useState, useMemo, useEffect } from 'react';
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   useMap
// } from 'react-leaflet';

// import L from 'leaflet';
// import { useTranslation } from 'react-i18next';
// import 'leaflet/dist/leaflet.css';

// // 导入数据
// import data1 from './datas/data1_new.json';
// import data2 from './datas/data2_new.json';
// import data3 from './datas/data3_new.json';
// import data4 from './datas/data4_new.json';
// import data5 from './datas/data5_new.json';
// import data6 from './datas/data6_new.json';
// import data7 from './datas/data7_new.json';
// import data8 from './datas/data8_new.json';

// const shipwrecks = [...data1, ...data2, ...data3, ...data4, ...data5, ...data6, ...data7, ...data8];

// const getText = (value, lang = 'en') => {
//   if (!value) return '';
//   if (typeof value === 'object') {
//     return value[lang] || value.en || value.zh || '';
//   }
//   return value;
// };

// const normalizeLongitude = (lng) => {
//   return lng < -100 ? lng + 360 : lng;
// };

// // 自动缩放组件
// const ChangeView = ({ filteredData }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (filteredData.length > 0) {
//       const bounds = L.latLngBounds(
//         filteredData.map((s) => [
//           s.coordinates[0],
//           normalizeLongitude(s.coordinates[1])
//         ])
//       );
//       map.fitBounds(bounds, {
//         padding: [30, 30],
//         maxZoom: 10,
//         animate: true,
//         duration: 1.5
//       });
//     }
//   }, [filteredData, map]);
//   return null;
// };

// // 图标设置：重点修改 popupAnchor 让弹窗下移
// const createFlagIcon = (flagUrl) =>
//   new L.Icon({
//     iconUrl: flagUrl,
//     iconSize: [30, 20],
//     iconAnchor: [15, 10],
//     popupAnchor: [0, -5], // 从 -20 改为 -5，弹窗会向下移动靠近图标
//     className: 'flag-marker-shadow'
//   });

// const ShipwreckMap = () => {
//   const { t, i18n } = useTranslation();
//   const [selectedBattle, setSelectedBattle] = useState('All');
//   const [selectedFaction, setSelectedFaction] = useState('All');
//   const [searchQuery, setSearchQuery] = useState('');
  
//   // 响应式状态
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth < 768);
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const lang = i18n.language;

//   const battles = useMemo(() => {
//     const all = shipwrecks.map((s) => getText(s.battle, lang));
//     return ['All', ...new Set(all)];
//   }, [lang]);

//   const factions = useMemo(() => {
//     const all = shipwrecks.map((s) => getText(s.faction, lang));
//     return ['All', ...new Set(all)];
//   }, [lang]);

//   const filteredShipwrecks = useMemo(() => {
//     return shipwrecks.filter((ship) => {
//       const battle = getText(ship.battle, lang);
//       const faction = getText(ship.faction, lang);
//       const name = getText(ship.name, lang);
//       const battleMatch = selectedBattle === 'All' || battle === selectedBattle;
//       const factionMatch = selectedFaction === 'All' || faction === selectedFaction;
//       const searchMatch = searchQuery === '' || name.toLowerCase().includes(searchQuery.toLowerCase());
//       return battleMatch && factionMatch && searchMatch;
//     });
//   }, [selectedBattle, selectedFaction, searchQuery, lang]);

//   // 动态样式
//   const panelStyle = {
//     position: 'absolute',
//     top: isMobile ? '10px' : '20px',
//     right: isMobile ? '10px' : '20px',
//     left: isMobile ? '10px' : 'auto', // 手机端全宽显示
//     zIndex: 1000,
//     backgroundColor: 'rgba(255,255,255,0.95)',
//     padding: isMobile ? '10px' : '15px',
//     borderRadius: '8px',
//     width: isMobile ? 'auto' : '240px',
//     boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '8px'
//   };

//   const inputStyle = {
//     width: '100%',
//     padding: '8px',
//     border: '1px solid #ccc',
//     borderRadius: '4px',
//     fontSize: isMobile ? '14px' : '13px',
//     boxSizing: 'border-box'
//   };

//   return (
//     <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>

//       {/* 控制面板 */}
//       <div style={panelStyle}>
//         <div style={{ display: 'flex', gap: '5px' }}>
//             <button
//             onClick={() => i18n.changeLanguage(lang === 'en' ? 'zh' : 'en')}
//             style={{ ...inputStyle, cursor: 'pointer', flex: 1, backgroundColor: '#f0f0f0' }}
//             >
//             {lang === 'en' ? '中文' : 'EN'}
//             </button>
//             <div style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#666' }}>
//                 {filteredShipwrecks.length} {lang === 'en' ? 'ships' : '艘沉船'}
//             </div>
//         </div>

//         <input
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           placeholder={lang === 'en' ? 'Search ship...' : '搜索船名...'}
//           style={inputStyle}
//         />

//         <div style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'row' : 'column' }}>
//             <select
//             value={selectedBattle}
//             onChange={(e) => setSelectedBattle(e.target.value)}
//             style={inputStyle}
//             >
//             {battles.map((b) => (
//                 <option key={b} value={b}>{b}</option>
//             ))}
//             </select>

//             <select
//             value={selectedFaction}
//             onChange={(e) => setSelectedFaction(e.target.value)}
//             style={inputStyle}
//             >
//             {factions.map((f) => (
//                 <option key={f} value={f}>{f}</option>
//             ))}
//             </select>
//         </div>
//       </div>

//       {/* 地图组件 */}
//       <MapContainer
//         center={[15, 155]}
//         zoom={3}
//         style={{ height: '100%', width: '100%' }}
//         zoomControl={!isMobile} // 手机端隐藏缩放按钮以节省空间
//       >
//         <ChangeView filteredData={filteredShipwrecks} />

//         <TileLayer
//           url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
//         />

//         {filteredShipwrecks.map((ship) => {
//           const name = getText(ship.name, lang);
//           const faction = getText(ship.faction, lang);
//           const type = getText(ship.type, lang);
//           const battle = getText(ship.battle, lang);
//           const cause = getText(ship.cause, lang);

//           return (
//             <Marker
//               key={ship.id}
//               position={[
//                 ship.coordinates[0],
//                 normalizeLongitude(ship.coordinates[1])
//               ]}
//               icon={createFlagIcon(ship.flagIconUrl)}
//             >
//               <Popup 
//                 maxHeight={isMobile ? 300 : 400} 
//                 minWidth={isMobile ? 200 : 260} 
//                 maxWidth={isMobile ? 250 : 300}
//                 keepInView={true} 
//                 autoPanPadding={[10, isMobile ? 80 : 20]} // 手机端增加顶部边距，防止被控制面板遮挡
//               >
//                 <div style={{ width: '100%', fontSize: isMobile ? '12px' : '14px' }}>
//                   <h3 style={{ margin: '0 0 8px 0', fontSize: isMobile ? '14px' : '16px', color: '#2c3e50' }}>{name}</h3>

//                   <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 8px' }}>
//                     <b>{lang === 'en' ? 'Faction' : '阵营'}:</b> <span>{faction}</span>
//                     <b>{lang === 'en' ? 'Type' : '类型'}:</b> <span>{type}</span>
//                     <b>{lang === 'en' ? 'Battle' : '战役'}:</b> <span>{battle}</span>
//                     <b>{lang === 'en' ? 'Date' : '时间'}:</b> <span>{ship.sinkingDate}</span>
//                   </div>

//                   {ship.cover && (
//                     <img
//                       src={ship.cover}
//                       alt={name}
//                       style={{ 
//                         width: '100%', 
//                         marginTop: '10px', 
//                         borderRadius: '4px',
//                         minHeight: isMobile ? '80px' : '120px', 
//                         maxHeight: '180px',
//                         objectFit: 'cover'
//                       }}
//                     />
//                   )}

//                   <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
//                     <b style={{ color: '#e74c3c' }}>{lang === 'en' ? 'Cause' : '沉没原因'}:</b>
//                     <div style={{ marginTop: '4px', fontStyle: 'italic' }}>{cause}</div>
//                   </div>
//                 </div>
//               </Popup>
//             </Marker>
//           );
//         })}
//       </MapContainer>
//     </div>
//   );
// };

// export default ShipwreckMap;
