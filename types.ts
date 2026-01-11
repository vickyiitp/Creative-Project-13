export interface Vector {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  isFixed: boolean;
  mass: number;
}

export enum MaterialType {
  ROAD = 'ROAD',
  WOOD = 'WOOD',
  STEEL = 'STEEL',
  CABLE = 'CABLE',
}

export interface Edge {
  id: string;
  nodeA: string;
  nodeB: string;
  type: MaterialType;
  restLength: number;
  currentStress: number; // 0 to 1+ (1 is breaking point)
  broken: boolean;
  cost: number;
}

export interface LevelConfig {
  id: number;
  anchors: Node[];
  gapWidth: number;
  budget: number;
}

export interface PhysicsState {
  nodes: Map<string, Node>;
  edges: Edge[];
  gravity: Vector;
  iterationCount: number;
}