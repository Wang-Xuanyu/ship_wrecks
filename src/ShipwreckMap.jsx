import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import data1 from './data1.json';
import data2 from './data2.json';
import data3 from './data3.json';
import data4 from './data4.json';
import data5 from './data5.json';
import data6 from './data6.json';
const shipwrecks = [...data1, ...data2, ...data3, ...data4, ...data5, ...data6];

const normalizeLongitude = (lng) => {
  // 阈值设为 -100，完美切割太平洋与大西洋/地中海
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
  const [selectedBattle, setSelectedBattle] = useState('All');
  // 1. 新增：国籍筛选状态
  const [selectedFaction, setSelectedFaction] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const battles = useMemo(() => {
    const allBattles = shipwrecks.map(s => s.battle);
    return ['All', ...new Set(allBattles)];
  }, []);

  // 2. 新增：提取数据中所有不重复的国籍
  const factions = useMemo(() => {
    const allFactions = shipwrecks.map(s => s.faction);
    return ['All', ...new Set(allFactions)];
  }, []);

  const filteredShipwrecks = useMemo(() => {
    return shipwrecks.filter(ship => {
      const battleMatch = selectedBattle === 'All' || ship.battle === selectedBattle;
      const factionMatch = selectedFaction === 'All' || ship.faction === selectedFaction;
      
      // Check if the ship name includes the search query (case-insensitive)
      const searchMatch = searchQuery === '' || 
                          ship.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return battleMatch && factionMatch && searchMatch;
    });
  }, [selectedBattle, selectedFaction, searchQuery]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* 筛选 UI 控制面板 */}
      <div style={{
        position: 'absolute', top: '20px', right: '20px', zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '15px',
        borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        width: '240px', fontFamily: 'sans-serif'
      }}>
        
        {/* Search Input Container */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>搜索舰船 (Search)</div>
          <input 
            type="text" 
            placeholder="输入船名..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ccc',
              boxSizing: 'border-box' // Prevents padding from breaking width
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <div style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>战役筛选</div>
          <select 
            value={selectedBattle} 
            onChange={(e) => setSelectedBattle(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          >
            {battles.map(battle => (
              <option key={battle} value={battle}>{battle}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <div style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>国籍筛选</div>
          <select 
            value={selectedFaction} 
            onChange={(e) => setSelectedFaction(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          >
            {factions.map(faction => (
              <option key={faction} value={faction}>{faction}</option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '12px', marginTop: '10px', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
          当前匹配: <strong>{filteredShipwrecks.length}</strong> 艘舰艇
        </div>
      </div>

      <MapContainer 
        center={[15, 155]} 
        zoom={3} 
        style={{ height: '100%', width: '100%', background: '#0a192f' }}
        worldCopyJump={true}
      >
        <ChangeView filteredData={filteredShipwrecks} />

        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri'
        />

        {filteredShipwrecks.map((ship) => {
          if (ship.cover) console.log(ship.cover);
          
          return(
          <Marker key={ship.id} position={[ship.coordinates[0], normalizeLongitude(ship.coordinates[1])]} icon={createFlagIcon(ship.flagIconUrl)} >
              <Popup>
              {/* Added maxHeight and overflowY for scrolling, and maxWidth to keep it neat */}
              <div style={{ 
                minWidth: '220px', 
                maxWidth: '280px',
                maxHeight: '60vh', // Limit height to 60% of the viewport height
                overflowY: 'auto', // Enable vertical scrolling
                overflowX: 'hidden',
                paddingRight: '8px' // Prevent scrollbar from overlapping text
              }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#1a237e' }}>{ship.name}</h3>
                <div style={{ fontSize: '12px' }}>
                  <p><strong>所属国:</strong> {ship.faction}</p>
                  <p><strong>类型:</strong> {ship.type}</p>
                  <p><strong>日期:</strong> {ship.sinkingDate}</p>
                  <p><strong>战役:</strong> {ship.battle}</p>
                  {ship.depth && <p><strong>深度:</strong> {ship.depth}</p>}
                  
                  {ship.cover && (
                    <img 
                      src={ship.cover} 
                      alt={ship.name} 
                      style={{ 
                        width: '100%', 
                        marginTop: '10px', 
                        borderRadius: '4px',
                        minHeight: '120px', // Pre-allocate space to help Leaflet calculate autoPan correctly
                        backgroundColor: '#f0f0f0', // Placeholder color while loading
                        objectFit: 'cover'
                      }} 
                    />
                  )}
                </div>
                
                <div style={{ 
                  marginTop: '10px', padding: '8px', 
                  backgroundColor: '#fff3e0', borderLeft: '4px solid #ff9800',
                  fontSize: '11px', lineHeight: '1.4'
                }}>
                  <strong>沉没原因:</strong><br/>{ship.cause}
                </div>
              </div>
            </Popup>
          </Marker>
        )
        })}
      </MapContainer>
    </div>
  );
};

export default ShipwreckMap;