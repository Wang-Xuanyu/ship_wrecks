// pages/IntroScreen.jsx
import { useNavigate } from 'react-router-dom';

export default function IntroScreen() {
  const navigate = useNavigate();

  return (
    <div className="py-10 flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-200 text-center px-6 font-sans">
      
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-cyan-400">
        WWII Global Shipwreck Database
      </h1>

      <div className="max-w-3xl leading-relaxed text-lg">
        
        {/* 网站介绍 */}
        <p className="mb-8 text-slate-300">
          This website is an interactive map-based archive that visualizes the locations of shipwrecks from the Second World War. It aims to present, in a spatial and intuitive way, the remains of naval conflicts scattered across the world's oceans, allowing users to explore where history rests beneath the surface.
        </p>

        {/* 数据声明 */}
        <p className="text-sm text-slate-500 mt-8 mb-8 text-left leading-relaxed">
          <strong className="text-slate-400">※ Data Note:</strong><br />
          Due to incomplete historical records, the chaos of wartime reporting, and the limitations of modern exploration technology, only a portion of shipwrecks with known or confirmed coordinates are included in this database. Countless vessels remain unrecorded, resting silently in depths that may never be fully charted.
        </p>

        {/* 感慨 */}
        <div className="mt-10 p-6 border-l-4 border-cyan-600 bg-cyan-900/20 italic text-slate-400 text-left shadow-inner rounded-r-md">
          The ocean does not remember names, yet it holds them all. Beneath its vast and quiet surface lies not only steel and wreckage, but the weight of history, conflict, and the passage of time.
        </div>

      </div>

      <button 
        onClick={() => navigate('/map')}
        className="mt-16 px-8 py-4 text-lg font-bold text-cyan-400 border-2 border-cyan-500 transition-all duration-300 hover:bg-cyan-500/10 hover:-translate-y-1"
      >
        Dive into the Deep (Enter Map)
      </button>

      <button
        onClick={() => window.open('https://github.com/Wang-Xuanyu/ship_wrecks', '_blank')}
        className="mt-16 px-8 py-4 text-lg font-bold text-cyan-400 border-2 border-cyan-500 transition-all duration-300 hover:bg-cyan-500/10 hover:-translate-y-1"
      >
        GitHub Repository
      </button>
    </div>
  );
}