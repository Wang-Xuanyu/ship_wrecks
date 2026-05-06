import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';

import data1 from './data1.json';
import data2 from './data2.json';
import data3 from './data3.json';
import data4 from './data4.json';
import data5 from './data5.json';
import data6 from './data6.json';
import data7 from './data7.json';
const shipwrecks = [...data1, ...data2, ...data3, ...data4, ...data5, ...data6, ...data7];

const normalizeLongitude = (lng) => {
  return lng < -100 ? lng + 360 : lng;
};

const ChangeView = ({ filteredData }) => {
  const map = useMap();

  useEffect(() => {
    if (filteredData.length > 0) {
      const normalizedCoords = filteredData.map(s => [
        s.coordinates[0],
        normalizeLongitude(s.coordinates[1])
      ]);

      const bounds = L.latLngBounds(normalizedCoords);

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

const createFlagIcon = (flagUrl) => {
  return new L.Icon({
    iconUrl: flagUrl,
    iconSize: [30, 20],
    iconAnchor: [15, 10],
    popupAnchor: [0, -10],
    className: 'flag-marker-shadow'
  });
};

const ShipwreckMap = () => {
  const { t, i18n } = useTranslation();

  const [selectedBattle, setSelectedBattle] = useState('All');
  const [selectedFaction, setSelectedFaction] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const battles = useMemo(() => {
    const allBattles = shipwrecks.map(s => s.battle);
    return ['All', ...new Set(allBattles)];
  }, []);

  const factions = useMemo(() => {
    const allFactions = shipwrecks.map(s => s.faction);
    return ['All', ...new Set(allFactions)];
  }, []);

  const filteredShipwrecks = useMemo(() => {
    return shipwrecks.filter(ship => {
      const battleMatch = selectedBattle === 'All' || ship.battle === selectedBattle;
      const factionMatch = selectedFaction === 'All' || ship.faction === selectedFaction;
      const searchMatch =
        searchQuery === '' ||
        ship.name.toLowerCase().includes(searchQuery.toLowerCase());

      return battleMatch && factionMatch && searchMatch;
    });
  }, [selectedBattle, selectedFaction, searchQuery]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      
      {/* 控制面板 */}
      <div style={{
        position: 'absolute', top: '20px', right: '20px', zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '15px',
        borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        width: '240px', fontFamily: 'sans-serif'
      }}>

        {/* 🌍 语言切换 */}
        <button
          onClick={() =>
            i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
          }
          style={{
            marginBottom: '10px',
            padding: '6px',
            width: '100%',
            cursor: 'pointer'
          }}
        >
          {i18n.language === 'en' ? '切换中文' : 'Switch to English'}
        </button>

        {/* 搜索 */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
            {t('search')}
          </div>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* 战役筛选 */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
            {t('battleFilter')}
          </div>
          <select
            value={selectedBattle}
            onChange={(e) => setSelectedBattle(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {battles.map(battle => (
              <option key={battle} value={battle}>{battle}</option>
            ))}
          </select>
        </div>

        {/* 国籍筛选 */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
            {t('factionFilter')}
          </div>
          <select
            value={selectedFaction}
            onChange={(e) => setSelectedFaction(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {factions.map(faction => (
              <option key={faction} value={faction}>{faction}</option>
            ))}
          </select>
        </div>

        {/* 匹配数量 */}
        <div style={{
          fontSize: '12px',
          marginTop: '10px',
          color: '#666',
          borderTop: '1px solid #eee',
          paddingTop: '10px'
        }}>
          {t('matchCount')}: <strong>{filteredShipwrecks.length}</strong> {t('ships')}
        </div>
      </div>

      {/* 地图 */}
      <MapContainer
        center={[15, 155]}
        zoom={3}
        style={{ height: '100%', width: '100%', background: '#0a192f' }}
        worldCopyJump={true}
      >
        <ChangeView filteredData={filteredShipwrecks} />

        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri"
        />

        {filteredShipwrecks.map((ship) => (
          <Marker
            key={ship.id}
            position={[ship.coordinates[0], normalizeLongitude(ship.coordinates[1])]}
            icon={createFlagIcon(ship.flagIconUrl)}
          >
            <Popup>
              <div style={{
                minWidth: '220px',
                maxWidth: '280px',
                maxHeight: '60vh',
                overflowY: 'auto',
                paddingRight: '8px'
              }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#1a237e' }}>
                  {ship.name}
                </h3>

                <div style={{ fontSize: '12px' }}>
                  <p><strong>{t('faction')}:</strong> {ship.faction}</p>
                  <p><strong>{t('type')}:</strong> {ship.type}</p>
                  <p><strong>{t('date')}:</strong> {ship.sinkingDate}</p>
                  <p><strong>{t('battle')}:</strong> {ship.battle}</p>
                  {ship.depth && <p><strong>{t('depth')}:</strong> {ship.depth}</p>}

                  {ship.cover && (
                    <img
                      src={ship.cover}
                      alt={ship.name}
                      style={{
                        width: '100%',
                        marginTop: '10px',
                        borderRadius: '4px',
                        minHeight: '120px',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                </div>

                <div style={{
                  marginTop: '10px',
                  padding: '8px',
                  backgroundColor: '#fff3e0',
                  borderLeft: '4px solid #ff9800',
                  fontSize: '11px'
                }}>
                  <strong>{t('cause')}:</strong><br />
                  {typeof ship.cause === 'object'
                    ? ship.cause[i18n.language]
                    : ship.cause}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ShipwreckMap;