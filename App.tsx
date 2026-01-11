
import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import Toolbar from './components/Toolbar';
import LandingPage from './components/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import BackgroundCanvas from './components/BackgroundCanvas';
import { MaterialType } from './types';

const LEVEL_BUDGET = 15000;

type ViewState = 'loading' | 'landing' | 'game' | 'privacy' | 'terms' | '404';

function App() {
  const [view, setView] = useState<ViewState>('loading');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType>(MaterialType.WOOD);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentCost, setCurrentCost] = useState(0);
  const [gameMessage, setGameMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Simulate Initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setView('landing');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSimulate = () => {
    setIsSimulating(true);
    setGameMessage(null);
  };

  const handleReset = () => {
    setIsSimulating(false);
    setGameMessage(null);
  };

  const handleSimulateComplete = (success: boolean) => {
    if (success && !gameMessage) {
        setGameMessage({ text: "BRIDGE STABLE! MISSION ACCOMPLISHED.", type: 'success' });
    }
  };

  const handleLevelFailed = () => {
    if (!gameMessage) {
      setGameMessage({ text: "STRUCTURAL FAILURE DETECTED.", type: 'error' });
    }
  };

  // --- Views ---

  const renderContent = () => {
    switch (view) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center h-screen text-blue-300 font-mono z-10 relative">
             <div className="w-20 h-20 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(59,130,246,0.5)]"></div>
             <p className="animate-pulse tracking-[0.3em] text-lg font-bold">INITIALIZING ARCHITECT...</p>
          </div>
        );

      case 'landing':
        return (
          <LandingPage 
            onPlay={() => setView('game')} 
            onPrivacy={() => setView('privacy')}
            onTerms={() => setView('terms')}
          />
        );

      case 'privacy':
        return (
          <SimplePage title="Privacy Policy" onBack={() => setView('landing')}>
            <p className="mb-4">Effective Date: 2025-01-01</p>
            <p className="mb-4">This privacy policy explains how Poly-Bridge Architect collects and uses data.</p>
            <h3 className="text-xl font-bold mt-6 mb-2">1. Data Collection</h3>
            <p>We do not collect any personal data. All game progress is stored locally in your browser session.</p>
            <h3 className="text-xl font-bold mt-6 mb-2">2. Cookies</h3>
            <p>This site uses local storage to save your preferences but does not track you across the web.</p>
          </SimplePage>
        );

      case 'terms':
        return (
          <SimplePage title="Terms of Service" onBack={() => setView('landing')}>
            <p className="mb-4">By accessing this website, you agree to be bound by these terms of service.</p>
            <h3 className="text-xl font-bold mt-6 mb-2">1. Usage</h3>
            <p>You may use this game for personal, non-commercial purposes. Do not reverse engineer the physics engine.</p>
            <h3 className="text-xl font-bold mt-6 mb-2">2. Disclaimer</h3>
            <p>The software is provided "as is", without warranty of any kind.</p>
          </SimplePage>
        );

      case 'game':
        return (
          <div className="relative w-full h-full flex flex-col overflow-hidden font-mono animate-fade-in-up">
            {/* Header / Info */}
            <div className="absolute top-0 left-0 w-full p-4 z-20 pointer-events-none flex justify-between items-start">
              <div className="bg-slate-900/40 backdrop-blur-sm p-2 rounded border border-white/5">
                <h1 className="text-2xl md:text-4xl font-bold handwritten text-white drop-shadow-md">Poly-Bridge Architect</h1>
                <p className="text-blue-200 mt-1 font-mono text-xs md:text-sm opacity-80 max-w-md">
                    Connect nodes to build. Press PLAY to test.
                </p>
              </div>
              <button 
                onClick={() => setView('landing')}
                className="pointer-events-auto bg-slate-800/80 hover:bg-red-900/80 text-white px-4 py-2 rounded border border-white/10 backdrop-blur-md transition-colors text-xs font-bold"
              >
                EXIT TO MENU
              </button>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 w-full h-full relative">
              <GameCanvas 
                  selectedMaterial={selectedMaterial}
                  isDeleteMode={isDeleteMode}
                  isSimulating={isSimulating}
                  onCostUpdate={setCurrentCost}
                  onSimulateComplete={handleSimulateComplete}
                  onLevelFailed={handleLevelFailed}
              />
              
              {/* Game Message Overlay */}
              {gameMessage && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 animate-bounce">
                    <div className={`
                      p-8 rounded-xl shadow-2xl backdrop-blur-md border border-white/20 text-center
                      ${gameMessage.type === 'success' ? 'bg-green-600/90' : 'bg-red-600/90'}
                    `}>
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{gameMessage.text}</h2>
                      <div className="flex justify-center gap-4 mt-6">
                        <button 
                            onClick={handleReset}
                            className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition shadow-lg"
                        >
                            {gameMessage.type === 'success' ? 'Build More' : 'Try Again'}
                        </button>
                      </div>
                    </div>
                  </div>
              )}
            </div>

            {/* Toolbar */}
            <Toolbar 
              selectedMaterial={selectedMaterial}
              onSelectMaterial={(m) => {
                  setSelectedMaterial(m);
                  setIsDeleteMode(false);
              }}
              isDeleteMode={isDeleteMode}
              onDeleteTool={() => setIsDeleteMode(!isDeleteMode)}
              onClear={() => window.location.reload()}
              onSimulate={handleSimulate}
              onReset={handleReset}
              isSimulating={isSimulating}
              budget={LEVEL_BUDGET}
              currentCost={currentCost}
            />
          </div>
        );

      default:
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
                <h1 className="text-4xl font-bold mb-4">404 - Sector Not Found</h1>
                <button onClick={() => setView('landing')} className="text-blue-400 hover:underline">Return to Base</button>
            </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="w-screen h-screen overflow-hidden text-white relative">
        <BackgroundCanvas />
        {renderContent()}
      </div>
    </ErrorBoundary>
  );
}

// Simple Page Layout Helper
const SimplePage: React.FC<{ title: string; children: React.ReactNode; onBack: () => void }> = ({ title, children, onBack }) => (
  <div className="min-h-screen p-8 overflow-y-auto font-montserrat relative z-10 animate-fade-in-up">
    <div className="max-w-3xl mx-auto bg-slate-900/60 p-8 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="text-slate-300 leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  </div>
);

export default App;
