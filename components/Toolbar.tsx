import React from 'react';
import { MaterialType } from '../types';
import { MATERIAL_CONFIG } from '../constants';

interface ToolbarProps {
  selectedMaterial: MaterialType;
  onSelectMaterial: (m: MaterialType) => void;
  onDeleteTool: () => void;
  isDeleteMode: boolean;
  onClear: () => void;
  onSimulate: () => void;
  onReset: () => void;
  isSimulating: boolean;
  budget: number;
  currentCost: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
  selectedMaterial,
  onSelectMaterial,
  onDeleteTool,
  isDeleteMode,
  onClear,
  onSimulate,
  onReset,
  isSimulating,
  budget,
  currentCost,
}) => {
  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;
  const overBudget = currentCost > budget;

  return (
    <div className="absolute bottom-0 left-0 right-0 p-3 bg-blueprint-900/95 border-t-2 border-white/20 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 z-10 select-none shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      
      {/* Materials */}
      <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide justify-center md:justify-start px-4">
        {Object.values(MaterialType).map((mat) => (
          <button
            key={mat}
            onClick={() => onSelectMaterial(mat)}
            disabled={isSimulating}
            aria-label={`Select ${mat}`}
            className={`
              flex flex-col items-center justify-center p-2 min-w-[80px] transition-all relative group
              ${selectedMaterial === mat && !isDeleteMode
                ? 'scale-110 -translate-y-2' 
                : 'hover:-translate-y-1 opacity-80 hover:opacity-100'}
              ${isSimulating ? 'opacity-30 grayscale cursor-not-allowed' : ''}
            `}
          >
            {/* Sketch Box */}
            <div className={`absolute inset-0 border-2 rounded-sm transform transition-colors ${selectedMaterial === mat && !isDeleteMode ? 'border-white bg-white/10' : 'border-slate-500 group-hover:border-blue-300'}`}></div>
            
            <span className="font-handwritten font-bold text-[12px] uppercase text-white tracking-wider relative z-10">{MATERIAL_CONFIG[mat].label}</span>
            <span className="text-[10px] text-blue-300 font-mono relative z-10">${MATERIAL_CONFIG[mat].cost}</span>
            <div 
              className="w-12 h-1 mt-2 shadow-sm relative z-10" 
              style={{ backgroundColor: MATERIAL_CONFIG[mat].color }} 
            />
          </button>
        ))}
      </div>

      {/* Tools & Stats Row for Mobile */}
      <div className="flex w-full md:w-auto justify-between md:justify-end items-center gap-6 px-4">
        <div className="flex gap-2">
            <button
            onClick={onDeleteTool}
            disabled={isSimulating}
            aria-label="Delete Tool"
            className={`p-3 rounded-sm font-bold border-2 transition-all relative group overflow-hidden ${
                isDeleteMode ? 'border-red-500 text-red-500' : 'border-slate-600 text-slate-400 hover:border-red-400 hover:text-red-400'
            } ${isSimulating ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
             <div className={`absolute inset-0 bg-red-500/10 transition-transform ${isDeleteMode ? 'translate-y-0' : 'translate-y-full'}`}></div>
             <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <button
                onClick={onClear}
                disabled={isSimulating}
                aria-label="Clear All"
                className="p-3 rounded-sm font-bold border-2 border-slate-600 text-slate-400 hover:border-white hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
        </div>

        {/* Budget Display */}
        <div className="flex flex-col items-end min-w-[120px]">
           <div className="font-handwritten text-slate-400 text-xs transform -rotate-2 origin-bottom-right">Estimated Cost:</div>
           <div className={`font-mono text-xl md:text-2xl font-bold transition-colors ${overBudget ? "text-red-500 animate-pulse" : "text-white"}`}>
             {formatCurrency(currentCost)}
           </div>
           <div className="w-full h-px bg-slate-600 mt-1"></div>
           <div className="text-slate-500 text-[10px] font-mono mt-0.5">
             MAX: {formatCurrency(budget)}
           </div>
        </div>

        {/* Sim Controls */}
        <div className="w-auto">
            {!isSimulating ? (
            <button
                onClick={onSimulate}
                disabled={overBudget}
                aria-label="Start Simulation"
                className={`bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-3 rounded-sm border-2 border-blue-400 shadow-[4px_4px_0_rgba(255,255,255,0.2)] active:translate-y-1 active:shadow-none transition-all text-lg tracking-widest flex items-center justify-center gap-2 group ${overBudget ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
                <span className="hidden md:inline font-mono group-hover:tracking-[0.2em] transition-all">SIMULATE</span>
                <span className="md:hidden">RUN</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
            </button>
            ) : (
            <button
                onClick={onReset}
                aria-label="Stop Simulation"
                className="bg-red-600 hover:bg-red-500 text-white font-black px-8 py-3 rounded-sm border-2 border-red-400 shadow-[4px_4px_0_rgba(255,255,255,0.2)] active:translate-y-1 active:shadow-none transition-all text-lg tracking-widest flex items-center justify-center gap-2"
            >
                <span className="hidden md:inline font-mono">ABORT</span>
                <span className="md:hidden">STOP</span>
                <div className="w-4 h-4 bg-white animate-pulse"></div>
            </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;