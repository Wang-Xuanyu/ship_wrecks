// pages/IntroScreen.jsx
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/hero.png';

export default function IntroScreen() {
  const navigate = useNavigate();

  return (
    <main
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-slate-950 px-5 py-8 text-center font-sans text-slate-200 sm:px-6 md:py-10"
      style={{
        backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.84), rgba(2, 6, 23, 0.92)), url(${heroImage})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      <section className="w-full max-w-3xl">
      <h1 className="mx-auto mb-5 max-w-[13ch] text-3xl font-bold leading-tight text-cyan-300 sm:max-w-none sm:text-4xl md:text-5xl">
        WWII Global Shipwreck Database
      </h1>

      <div className="mx-auto max-w-3xl text-base leading-relaxed sm:text-lg">
        
        {/* 网站介绍 */}
        <p className="mb-6 text-slate-300 md:mb-8">
          This website is an interactive map-based archive that visualizes the locations of shipwrecks from the Second World War. It aims to present, in a spatial and intuitive way, the remains of naval conflicts scattered across the world's oceans, allowing users to explore where history rests beneath the surface.
        </p>

        {/* 数据声明 */}
        <p className="mx-auto mb-6 mt-6 max-w-2xl text-left text-xs leading-relaxed text-slate-400 sm:text-sm md:mb-8 md:mt-8">
          <strong className="text-slate-400">※ Data Note:</strong><br />
          Due to incomplete historical records, the chaos of wartime reporting, and the limitations of modern exploration technology, only a portion of shipwrecks with known or confirmed coordinates are included in this database. Countless vessels remain unrecorded, resting silently in depths that may never be fully charted.
        </p>

        {/* 感慨 */}
        <div className="mt-7 rounded-r-md border-l-4 border-cyan-600 bg-slate-950/45 p-4 text-left text-sm italic text-slate-300 shadow-inner sm:p-5 md:mt-10 md:p-6 md:text-base">
          The ocean does not remember names, yet it holds them all. Beneath its vast and quiet surface lies not only steel and wreckage, but the weight of history, conflict, and the passage of time.
        </div>

      </div>

      <div className="mt-9 flex w-full flex-col gap-3 sm:mx-auto sm:max-w-xl sm:flex-row sm:justify-center md:mt-14">
        <button
          onClick={() => navigate('/map')}
          className="min-h-12 w-full border-2 border-cyan-500 bg-cyan-500/10 px-5 py-3 text-base font-bold text-cyan-200 transition-all duration-300 hover:bg-cyan-500/20 sm:w-auto sm:px-7 md:text-lg"
        >
          Dive into the Deep
        </button>

        <button
          onClick={() => window.open('https://github.com/Wang-Xuanyu/ship_wrecks', '_blank')}
          className="min-h-12 w-full border-2 border-slate-500 bg-slate-950/20 px-5 py-3 text-base font-bold text-slate-200 transition-all duration-300 hover:bg-slate-700/30 sm:w-auto sm:px-7 md:text-lg"
        >
          GitHub Repository
        </button>
      </div>
      </section>
    </main>
  );
}
