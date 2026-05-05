import React, { useState } from 'react';
import ShipwreckMap from './ShipwreckMap';
import './index.css'; 

function App() {
  const [hasEntered, setHasEntered] = useState(false);

  if (!hasEntered) {
    return (
      <div className="py-10 flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-200 text-center px-6 font-sans">
        
        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-cyan-400 tracking-wide drop-shadow-md">
          WWII Global Shipwreck Database
        </h1>
        
        {/* Content Container */}
        <div className="max-w-3xl leading-relaxed text-lg">
          
          {/* Website Introduction */}
          <p className="mb-8 text-slate-300">
            Welcome to this interactive historical archive. This project is dedicated to reconstructing the precise geographic coordinates of naval wreckages across the global oceans during World War II. From the fierce battles of the Pacific to the desperate convoys of the Atlantic, you can visually explore the steel behemoths sleeping in the deep sea and the history behind them.
          </p>
          
          {/* Historical Disclaimer */}
          <p className="text-sm text-slate-500 mt-8 mb-8 text-left leading-loose">
            <strong className="text-slate-400 tracking-wider">※ Historical Data Disclaimer:</strong><br />
            Limited by the loss of historical archives, the chaos of naval warfare, and the physical limits of modern deep-sea exploration, this system only includes a fraction of shipwrecks with explicit coordinates or those that have been physically located. In the vast depths of the oceans, thousands of unnamed vessels, merchant ships, and hundreds of thousands of sailors rest eternally unmapped—but they shall not be forgotten.
          </p>

          {/* Ocean Reflection */}
          <div className="mt-10 p-6 border-l-4 border-cyan-600 bg-cyan-900/20 italic text-slate-400 text-left shadow-inner rounded-r-md">
            "The ocean witnessed humanity's most brutal slaughters, and ultimately used its endless abyss to calmly bury the smoke of war. These rusted wreckages are the scars of civilization tearing itself apart, and the silent monuments of the deep sea returning to tranquility."
          </div>

        </div>

        {/* Entry Button */}
        <button 
          onClick={() => setHasEntered(true)}
          className="mt-16 px-8 py-4 text-lg font-bold text-cyan-400 border-2 border-cyan-500 rounded transition-all duration-300 hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:-translate-y-1"
        >
          Dive into the Deep (Enter Map)
        </button>
      </div>
    );
  }

  // Render the actual map component once the user enters
  return (
    <>
      <ShipwreckMap />
    </>
  );
}

export default App;