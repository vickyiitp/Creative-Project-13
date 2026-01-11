import { MaterialType } from './types';

export const COLORS = {
  background: '#172554', // blue-950 (Blueprint Blue)
  gridMinor: 'rgba(255, 255, 255, 0.05)',
  gridMajor: 'rgba(255, 255, 255, 0.15)',
  node: '#ffffff',
  nodeFixed: '#ef4444', // Red 500
  edge: {
    base: '#ffffff',
    stress: '#ef4444',
  },
  terrainStroke: '#94a3b8',
  terrainFill: '#1e293b', 
};

export const PHYSICS = {
  gravity: { x: 0, y: 0.2 },
  friction: 0.98,
  groundFriction: 0.8,
  iterations: 8, // Increased for stability
  breakingThreshold: 1.3,
  snapDistance: 20,
  timeStep: 1, 
};

export const MATERIAL_CONFIG: Record<MaterialType, { cost: number; strength: number; maxLength: number; color: string; weight: number; label: string }> = {
  [MaterialType.ROAD]: { cost: 200, strength: 2.5, maxLength: 140, color: '#94a3b8', weight: 4, label: 'Asphalt Road' },
  [MaterialType.WOOD]: { cost: 100, strength: 1.2, maxLength: 100, color: '#fcd34d', weight: 2, label: 'Timber Truss' },
  [MaterialType.STEEL]: { cost: 450, strength: 5.0, maxLength: 220, color: '#e2e8f0', weight: 3, label: 'Heavy Steel' },
  [MaterialType.CABLE]: { cost: 150, strength: 1.8, maxLength: 350, color: '#fb7185', weight: 1, label: 'Steel Cable' },
};

// Start coordinates for the left anchor
export const LEVEL_START_X = 100;
export const LEVEL_GROUND_Y = 550;