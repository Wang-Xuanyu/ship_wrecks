import React, { useState, useMemo, useEffect } from 'react';
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

import data1 from './datas/data1_new.json';
import data2 from './datas/data2_new.json';
import data3 from './datas/data3_new.json';
import data4 from './datas/data4_new.json';
import data5 from './datas/data5_new.json';
import data6 from './datas/data6_new.json';
import data7 from './datas/data7_new.json';

// ========================
// 数据合并
// ========================
const shipwrecks = [...data1, ...data2, ...data3, ...data4, ...data5, ...data6, ...data7];

// ========================
// 核心修复：安全取文本
// ========================
const getText = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'object') {
    return value[lang] || value.en || value.zh || '';
  }
  return value;
};

// ========================
// 经度修正
// ========================
const normalizeLongitude = (lng) => {
  return lng < -100 ? lng + 360 : lng;
};

// ========================
// 自动缩放地图
// ========================
const ChangeView = ({ filteredData }) => {
  const map = useMap();

  useEffect(() => {
    if (filteredData.length > 0) {
      const bounds = L.latLngBounds(
        filteredData.map((s) => [
          s.coordinates[0],
          normalizeLongitude(s.coordinates[1])
        ])
      );

      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 10,
        animate: true,
        duration: 1.5
      });
    }
  }, [filteredData, map]);

  return null;
};

// ========================
// 图标
// ========================
const createFlagIcon = (flagUrl) =>
  new L.Icon({
    iconUrl: flagUrl,
    iconSize: [30, 20],
    iconAnchor: [15, 10],
    popupAnchor: [0, -20], // 稍微调整了一下弹出框的锚点，避免遮挡国旗
    className: 'flag-marker-shadow'
  });

// ========================
// 主组件
// ========================
const ShipwreckMap = () => {
  const { t, i18n } = useTranslation();

  const [selectedBattle, setSelectedBattle] = useState('All');
  const [selectedFaction, setSelectedFaction] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const lang = i18n.language;

  // ========================
  // battles
  // ========================
  const battles = useMemo(() => {
    const all = shipwrecks.map((s) => getText(s.battle, lang));
    return ['All', ...new Set(all)];
  }, [lang]);

  // ========================
  // factions
  // ========================
  const factions = useMemo(() => {
    const all = shipwrecks.map((s) => getText(s.faction, lang));
    return ['All', ...new Set(all)];
  }, [lang]);

  // ========================
  // filter
  // ========================
  const filteredShipwrecks = useMemo(() => {
    return shipwrecks.filter((ship) => {
      const battle = getText(ship.battle, lang);
      const faction = getText(ship.faction, lang);
      const name = getText(ship.name, lang);

      const battleMatch = selectedBattle === 'All' || battle === selectedBattle;
      const factionMatch = selectedFaction === 'All' || faction === selectedFaction;
      const searchMatch = searchQuery === '' || name.toLowerCase().includes(searchQuery.toLowerCase());

      return battleMatch && factionMatch && searchMatch;
    });
  }, [selectedBattle, selectedFaction, searchQuery, lang]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>

      {/* 控制面板 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: '15px',
        borderRadius: '8px',
        width: '240px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={() => i18n.changeLanguage(lang === 'en' ? 'zh' : 'en')}
          style={{ width: '100%', marginBottom: '10px', padding: '8px', cursor: 'pointer' }}
        >
          {lang === 'en' ? '切换中文' : 'Switch to English'}
        </button>

        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === 'en' ? 'Search ship name...' : '搜索船名...'}
          style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }}
        />

        <select
          value={selectedBattle}
          onChange={(e) => setSelectedBattle(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        >
          {battles.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <select
          value={selectedFaction}
          onChange={(e) => setSelectedFaction(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        >
          {factions.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          {filteredShipwrecks.length} {lang === 'en' ? 'ships found' : '艘沉船'}
        </div>
      </div>

      {/* map */}
      <MapContainer
        center={[15, 155]}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView filteredData={filteredShipwrecks} />

        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        {filteredShipwrecks.map((ship) => {
          const name = getText(ship.name, lang);
          const faction = getText(ship.faction, lang);
          const type = getText(ship.type, lang);
          const battle = getText(ship.battle, lang);
          const cause = getText(ship.cause, lang);

          return (
            <Marker
              key={ship.id}
              position={[
                ship.coordinates[0],
                normalizeLongitude(ship.coordinates[1])
              ]}
              icon={createFlagIcon(ship.flagIconUrl)}
            >
              {/* 
                1. maxHeight={400} 限制高度，超出自动加滚动条
                2. keepInView={true} 强制弹窗保持在地图可视范围内
                3. minWidth={250} 保证布局不会被文字挤变形
              */}
              <Popup maxHeight={400} minWidth={260} keepInView={true} autoPanPadding={[20, 20]}>
                <div style={{ width: '100%' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{name}</h3>

                  <p style={{ margin: '4px 0' }}><b>{lang === 'en' ? 'Faction' : '阵营'}:</b> {faction}</p>
                  <p style={{ margin: '4px 0' }}><b>{lang === 'en' ? 'Type' : '类型'}:</b> {type}</p>
                  <p style={{ margin: '4px 0' }}><b>{lang === 'en' ? 'Battle' : '战役'}:</b> {battle}</p>
                  <p style={{ margin: '4px 0' }}><b>{lang === 'en' ? 'Date' : '时间'}:</b> {ship.sinkingDate}</p>

                  {ship.cover && (
                    <img
                      src={ship.cover}
                      alt={name}
                      style={{ 
                        width: '100%', 
                        marginTop: '10px', 
                        borderRadius: '4px',
                        // 设置一个最小高度或让图片保持比例，避免加载时 Popup 高度突变
                        minHeight: '120px', 
                        objectFit: 'cover'
                      }}
                    />
                  )}

                  <div style={{ marginTop: '10px', fontSize: '13px', lineHeight: '1.4' }}>
                    <b>{lang === 'en' ? 'Cause' : '沉没原因'}:</b>
                    <br />
                    {cause}
                  </div>
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

// import data1 from './datas/data1_new.json';
// import data2 from './datas/data2_new.json';
// import data3 from './datas/data3_new.json';
// import data4 from './datas/data4_new.json';
// import data5 from './datas/data5_new.json';
// import data6 from './datas/data6_new.json';
// import data7 from './datas/data7_new.json';
// // ========================
// // 数据合并
// // ========================
// const shipwrecks = [...data1, ...data2, ...data3, ...data4, ...data5, ...data6, ...data7];

// // ========================
// // 核心修复：安全取文本
// // ========================
// const getText = (value, lang = 'en') => {
//   if (!value) return '';

//   if (typeof value === 'object') {
//     return value[lang] || value.en || value.zh || '';
//   }

//   return value;
// };

// // ========================
// // 经度修正
// // ========================
// const normalizeLongitude = (lng) => {
//   return lng < -100 ? lng + 360 : lng;
// };

// // ========================
// // 自动缩放地图
// // ========================
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
//         padding: [50, 50],
//         maxZoom: 10,
//         animate: true,
//         duration: 1.5
//       });
//     }
//   }, [filteredData, map]);

//   return null;
// };

// // ========================
// // 图标
// // ========================
// const createFlagIcon = (flagUrl) =>
//   new L.Icon({
//     iconUrl: flagUrl,
//     iconSize: [30, 20],
//     iconAnchor: [15, 10],
//     popupAnchor: [0, -10],
//     className: 'flag-marker-shadow'
//   });

// // ========================
// // 主组件
// // ========================
// const ShipwreckMap = () => {
//   const { t, i18n } = useTranslation();

//   const [selectedBattle, setSelectedBattle] = useState('All');
//   const [selectedFaction, setSelectedFaction] = useState('All');
//   const [searchQuery, setSearchQuery] = useState('');

//   const lang = i18n.language;

//   // ========================
//   // battles
//   // ========================
//   const battles = useMemo(() => {
//     const all = shipwrecks.map((s) => getText(s.battle, lang));
//     return ['All', ...new Set(all)];
//   }, [lang]);

//   // ========================
//   // factions
//   // ========================
//   const factions = useMemo(() => {
//     const all = shipwrecks.map((s) => getText(s.faction, lang));
//     return ['All', ...new Set(all)];
//   }, [lang]);

//   // ========================
//   // filter
//   // ========================
//   const filteredShipwrecks = useMemo(() => {
//     return shipwrecks.filter((ship) => {
//       const battle = getText(ship.battle, lang);
//       const faction = getText(ship.faction, lang);
//       const name = getText(ship.name, lang);

//       const battleMatch =
//         selectedBattle === 'All' || battle === selectedBattle;

//       const factionMatch =
//         selectedFaction === 'All' || faction === selectedFaction;

//       const searchMatch =
//         searchQuery === '' ||
//         name.toLowerCase().includes(searchQuery.toLowerCase());

//       return battleMatch && factionMatch && searchMatch;
//     });
//   }, [selectedBattle, selectedFaction, searchQuery, lang]);

//   return (
//     <div style={{ position: 'relative', width: '100%', height: '100vh' }}>

//       {/* 控制面板 */}
//       <div style={{
//         position: 'absolute',
//         top: '20px',
//         right: '20px',
//         zIndex: 1000,
//         backgroundColor: 'rgba(255,255,255,0.95)',
//         padding: '15px',
//         borderRadius: '8px',
//         width: '240px'
//       }}>

//         <button
//           onClick={() =>
//             i18n.changeLanguage(lang === 'en' ? 'zh' : 'en')
//           }
//           style={{ width: '100%', marginBottom: '10px' }}
//         >
//           {lang === 'en' ? '切换中文' : 'Switch to English'}
//         </button>

//         {/* search */}
//         <input
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           placeholder={t('searchPlaceholder')}
//           style={{ width: '100%', marginBottom: '10px' }}
//         />

//         {/* battle */}
//         <select
//           value={selectedBattle}
//           onChange={(e) => setSelectedBattle(e.target.value)}
//           style={{ width: '100%', marginBottom: '10px' }}
//         >
//           {battles.map((b) => (
//             <option key={b} value={b}>{b}</option>
//           ))}
//         </select>

//         {/* faction */}
//         <select
//           value={selectedFaction}
//           onChange={(e) => setSelectedFaction(e.target.value)}
//           style={{ width: '100%' }}
//         >
//           {factions.map((f) => (
//             <option key={f} value={f}>{f}</option>
//           ))}
//         </select>

//         <div style={{ marginTop: '10px', fontSize: '12px' }}>
//           {filteredShipwrecks.length} ships
//         </div>
//       </div>

//       {/* map */}
//       <MapContainer
//         center={[15, 155]}
//         zoom={3}
//         style={{ height: '100%', width: '100%' }}
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
//               <Popup>
//                 <h3>{name}</h3>

//                 <p><b>{t('faction')}:</b> {faction}</p>
//                 <p><b>{t('type')}:</b> {type}</p>
//                 <p><b>{t('battle')}:</b> {battle}</p>
//                 <p><b>{t('date')}:</b> {ship.sinkingDate}</p>

//                 {ship.cover && (
//                   <img
//                     src={ship.cover}
//                     style={{ width: '100%', marginTop: 10 }}
//                   />
//                 )}

//                 <div style={{ marginTop: 10 }}>
//                   <b>{t('cause')}:</b>
//                   <br />
//                   {cause}
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
