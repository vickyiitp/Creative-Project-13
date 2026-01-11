
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Node, Edge, MaterialType, Vector } from '../types';
import { COLORS, MATERIAL_CONFIG, PHYSICS, LEVEL_GROUND_Y } from '../constants';
import { PhysicsEngine } from '../services/physicsEngine';

interface GameCanvasProps {
  selectedMaterial: MaterialType;
  isDeleteMode: boolean;
  isSimulating: boolean;
  onCostUpdate: (cost: number) => void;
  onSimulateComplete: (success: boolean) => void;
  onLevelFailed: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  selectedMaterial, 
  isDeleteMode, 
  isSimulating,
  onCostUpdate,
  onSimulateComplete,
  onLevelFailed
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PhysicsEngine>(new PhysicsEngine());
  
  // Game State Refs
  const nodesRef = useRef<Map<string, Node>>(new Map());
  const edgesRef = useRef<Edge[]>([]);
  const truckNodesRef = useRef<Node[]>([]);
  const truckEdgesRef = useRef<Edge[]>([]);
  
  // Interaction State
  const [mousePos, setMousePos] = useState<Vector>({ x: 0, y: 0 });
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [invalidLine, setInvalidLine] = useState<boolean>(false);
  const requestRef = useRef<number>();
  
  // Viewport
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Patterns
  const patternRef = useRef<CanvasPattern | null>(null);

  // Initial Setup
  useEffect(() => {
    initializeLevel();
    createPatterns();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createPatterns = () => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 20;
      pCanvas.height = 20;
      const pCtx = pCanvas.getContext('2d');
      if (pCtx) {
          pCtx.strokeStyle = 'rgba(148, 163, 184, 0.2)'; // Faint slate
          pCtx.lineWidth = 1;
          pCtx.beginPath();
          pCtx.moveTo(0, 20);
          pCtx.lineTo(20, 0);
          pCtx.stroke();
          // Create pattern
          const pat = pCtx.createPattern(pCanvas, 'repeat');
          patternRef.current = pat;
      }
  };

  const handleResize = () => {
    // Force redraw on resize
    if(requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(loop);
  };

  const initializeLevel = () => {
    const nodes = new Map<string, Node>();
    
    // Create Anchor Points (Left Bank)
    const a1 = createNode(100, LEVEL_GROUND_Y, true);
    const a2 = createNode(200, LEVEL_GROUND_Y, true);
    
    // Create Anchor Points (Right Bank)
    const a3 = createNode(700, LEVEL_GROUND_Y, true);
    const a4 = createNode(800, LEVEL_GROUND_Y, true);

    nodes.set(a1.id, a1);
    nodes.set(a2.id, a2);
    nodes.set(a3.id, a3);
    nodes.set(a4.id, a4);

    nodesRef.current = nodes;
    edgesRef.current = [];
    updateCost();
    draw();
  };

  const createNode = (x: number, y: number, isFixed = false): Node => ({
    id: uuidv4(),
    x, y, oldX: x, oldY: y,
    isFixed,
    mass: isFixed ? 0 : 1.0
  });

  const updateCost = () => {
    const cost = edgesRef.current.reduce((acc, edge) => acc + edge.cost, 0);
    onCostUpdate(cost);
  };

  // --- Truck Initialization ---
  const spawnTruck = () => {
    const startX = 50;
    const startY = LEVEL_GROUND_Y - 30;
    
    const w1 = createNode(startX, startY); w1.id = `truck-wheel-1`; w1.mass = 5;
    const w2 = createNode(startX + 60, startY); w2.id = `truck-wheel-2`; w2.mass = 5;
    const body = createNode(startX + 30, startY - 40); body.id = `truck-body`; body.mass = 2;

    const truckNodes = [w1, w2, body];

    const createTruckEdge = (n1: Node, n2: Node): Edge => ({
        id: uuidv4(),
        nodeA: n1.id, nodeB: n2.id, type: MaterialType.STEEL,
        restLength: Math.hypot(n1.x - n2.x, n1.y - n2.y),
        currentStress: 0, broken: false, cost: 0
    });

    const truckEdges = [
        createTruckEdge(w1, w2), createTruckEdge(w1, body), createTruckEdge(w2, body)
    ];

    truckNodesRef.current = truckNodes;
    truckEdgesRef.current = truckEdges;
  };

  // --- Main Loop ---
  const loop = useCallback(() => {
    if (!canvasRef.current) return;

    if (isSimulating) {
      const engine = engineRef.current;
      engine.update();
      engine.updateTruckInteraction(
          truckNodesRef.current, 
          truckEdgesRef.current, 
          engine.nodes,
          engine.edges.filter(e => e.type === MaterialType.ROAD)
      );

      // Check win condition (Truck passed X=850)
      if (truckNodesRef.current[0] && truckNodesRef.current[0].x > 880) {
          onSimulateComplete(true);
      }
      // Check fail condition (Truck fell into abyss)
      if (truckNodesRef.current[0] && truckNodesRef.current[0].y > LEVEL_GROUND_Y + 300) {
          onLevelFailed();
      }
    }

    draw();
    requestRef.current = requestAnimationFrame(loop);
  }, [isSimulating, onSimulateComplete, onLevelFailed]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [loop]);

  // --- Simulation Control ---
  useEffect(() => {
    if (isSimulating) {
      engineRef.current.loadState(nodesRef.current, edgesRef.current);
      spawnTruck();
    } else {
      truckNodesRef.current = [];
      truckEdgesRef.current = [];
    }
  }, [isSimulating]);


  // --- Input Handlers ---
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX - offset.x,
      y: (clientY - rect.top) * scaleY - offset.y
    };
  };

  const getSnapNode = (pos: Vector): string | null => {
    let closestDist = PHYSICS.snapDistance;
    let closestId = null;
    nodesRef.current.forEach((node) => {
      const d = Math.hypot(node.x - pos.x, node.y - pos.y);
      if (d < closestDist) {
        closestDist = d; closestId = node.id;
      }
    });
    return closestId;
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isSimulating) return;
    const pos = getCanvasCoords(e);
    const snapId = getSnapNode(pos);

    if (isDeleteMode) {
        if (snapId) {
            const node = nodesRef.current.get(snapId);
            if (node && !node.isFixed) {
                nodesRef.current.delete(snapId);
                edgesRef.current = edgesRef.current.filter(edge => edge.nodeA !== snapId && edge.nodeB !== snapId);
                updateCost();
            }
        } else {
            const edgeIndex = edgesRef.current.findIndex(edge => {
                const nA = nodesRef.current.get(edge.nodeA);
                const nB = nodesRef.current.get(edge.nodeB);
                if (!nA || !nB) return false;
                const l2 = (nA.x - nB.x)**2 + (nA.y - nB.y)**2;
                if (l2 === 0) return false;
                let t = ((pos.x - nA.x) * (nB.x - nA.x) + (pos.y - nA.y) * (nB.y - nA.y)) / l2;
                t = Math.max(0, Math.min(1, t));
                const projX = nA.x + t * (nB.x - nA.x);
                const projY = nA.y + t * (nB.y - nA.y);
                return Math.hypot(pos.x - projX, pos.y - projY) < 15;
            });

            if (edgeIndex !== -1) {
                edgesRef.current.splice(edgeIndex, 1);
                updateCost();
            }
        }
        return;
    }

    if (snapId) setActiveNodeId(snapId);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getCanvasCoords(e);
    setMousePos(pos);
    if (activeNodeId) {
        const startNode = nodesRef.current.get(activeNodeId);
        if (startNode) {
            const dist = Math.hypot(pos.x - startNode.x, pos.y - startNode.y);
            setInvalidLine(dist > MATERIAL_CONFIG[selectedMaterial].maxLength);
        }
    }
  };

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (isSimulating || isDeleteMode) { setActiveNodeId(null); return; }

    if (activeNodeId) {
        const pos = getCanvasCoords(e);
        let endNodeId = getSnapNode(pos);
        const startNode = nodesRef.current.get(activeNodeId);
        
        if (startNode && !invalidLine) {
            if (!endNodeId) {
                const newNode = createNode(pos.x, pos.y);
                nodesRef.current.set(newNode.id, newNode);
                endNodeId = newNode.id;
            }
            if (startNode.id !== endNodeId) {
                const exists = edgesRef.current.some(
                    e => (e.nodeA === startNode.id && e.nodeB === endNodeId) || 
                         (e.nodeA === endNodeId && e.nodeB === startNode.id)
                );
                if (!exists) {
                    const dist = Math.hypot(startNode.x - (nodesRef.current.get(endNodeId!)?.x || 0), startNode.y - (nodesRef.current.get(endNodeId!)?.y || 0));
                    edgesRef.current.push({
                        id: uuidv4(), nodeA: startNode.id, nodeB: endNodeId!,
                        type: selectedMaterial, restLength: dist, currentStress: 0, broken: false,
                        cost: MATERIAL_CONFIG[selectedMaterial].cost 
                    });
                    updateCost();
                }
            }
        }
    }
    setActiveNodeId(null);
    setInvalidLine(false);
  };

  // --- Rendering ---
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with transparency for global background to show through
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Add a slight dark tint for contrast
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    
    drawGrid(ctx, canvas.width, canvas.height);
    drawTerrain(ctx);

    const activeNodes = isSimulating ? engineRef.current.nodes : nodesRef.current;
    const activeEdges = isSimulating ? engineRef.current.edges : edgesRef.current;

    // Draw Edges (Behind nodes)
    activeEdges.forEach(edge => {
        if(edge.broken) return; 
        const nA = activeNodes.get(edge.nodeA);
        const nB = activeNodes.get(edge.nodeB);
        if(nA && nB) drawEdge(ctx, edge, nA, nB);
    });

    // Draw Nodes
    activeNodes.forEach(node => drawNode(ctx, node));
    
    // Draw Truck
    if (isSimulating) drawTruck(ctx);

    // Draw Active Line Interaction
    if (activeNodeId && !isSimulating) {
        const n = nodesRef.current.get(activeNodeId);
        if (n) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(mousePos.x, mousePos.y);
            ctx.strokeStyle = invalidLine ? 'rgba(239, 68, 68, 0.7)' : 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw length label
            const dist = Math.hypot(mousePos.x - n.x, mousePos.y - n.y);
            ctx.font = '10px Roboto Mono';
            ctx.fillStyle = invalidLine ? '#ef4444' : '#fff';
            ctx.fillText(`${Math.round(dist)}m`, (n.x + mousePos.x)/2 + 10, (n.y + mousePos.y)/2);
        }
    }
    ctx.restore();
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      // Minor Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.5;
      const minorSize = 20;
      for(let x=0; x<w; x+=minorSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for(let y=0; y<h; y+=minorSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      // Major Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      const majorSize = 100;
      for(let x=0; x<w; x+=majorSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for(let y=0; y<h; y+=majorSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  };

  const drawTerrain = (ctx: CanvasRenderingContext2D) => {
      // Create path for ground
      const drawGroundPoly = (startX: number, endX: number) => {
          ctx.beginPath();
          ctx.moveTo(startX, LEVEL_GROUND_Y);
          ctx.lineTo(endX, LEVEL_GROUND_Y);
          ctx.lineTo(endX, 1000);
          ctx.lineTo(startX, 1000);
          ctx.closePath();
      };

      // Fill with Hatch Pattern
      if (patternRef.current) {
          ctx.fillStyle = patternRef.current;
      } else {
          ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
      }

      drawGroundPoly(0, 250);
      ctx.fill();
      drawGroundPoly(650, 1200);
      ctx.fill();

      // Top White Line for definition
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, LEVEL_GROUND_Y); ctx.lineTo(250, LEVEL_GROUND_Y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(650, LEVEL_GROUND_Y); ctx.lineTo(1200, LEVEL_GROUND_Y); ctx.stroke();

      // Flag (Blueprint Style)
      ctx.fillStyle = 'transparent';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(880, LEVEL_GROUND_Y); ctx.lineTo(880, LEVEL_GROUND_Y - 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(880, LEVEL_GROUND_Y - 40); ctx.lineTo(910, LEVEL_GROUND_Y - 30); ctx.lineTo(880, LEVEL_GROUND_Y - 20); ctx.stroke();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.fill();
  };

  const drawEdge = (ctx: CanvasRenderingContext2D, edge: Edge, nA: Node, nB: Node) => {
      ctx.beginPath(); ctx.moveTo(nA.x, nA.y); ctx.lineTo(nB.x, nB.y);
      const config = MATERIAL_CONFIG[edge.type];
      
      if (isSimulating) {
          // Heatmap style stress
          const stressRatio = Math.min(1, edge.currentStress);
          const r = Math.floor(255 * stressRatio);
          const g = Math.floor(255 * (1 - stressRatio));
          const b = Math.floor(255 * (1 - stressRatio)); 
          ctx.strokeStyle = `rgb(${r+100}, ${g+100}, ${b+100})`; 
          if (stressRatio > 0.8) ctx.strokeStyle = '#ef4444'; 
      } else {
          ctx.strokeStyle = config.color;
      }
      ctx.lineWidth = config.weight;
      ctx.stroke();
      
      // Draw Connector Joints
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(nA.x, nA.y, 2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(nB.x, nB.y, 2, 0, Math.PI*2); ctx.fill();

      if (edge.type === MaterialType.ROAD) {
          // Dashed center line for road
          ctx.beginPath(); ctx.moveTo(nA.x, nA.y); ctx.lineTo(nB.x, nB.y);
          ctx.lineWidth = 2; ctx.strokeStyle = '#334155'; ctx.setLineDash([10, 10]); ctx.stroke(); ctx.setLineDash([]);
      }
  };

  const drawNode = (ctx: CanvasRenderingContext2D, node: Node) => {
      ctx.beginPath(); ctx.arc(node.x, node.y, node.isFixed ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b'; 
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = node.isFixed ? '#ef4444' : '#fff';
      ctx.stroke();
      
      // X for fixed nodes
      if (node.isFixed) {
          ctx.beginPath();
          ctx.moveTo(node.x - 3, node.y - 3); ctx.lineTo(node.x + 3, node.y + 3);
          ctx.moveTo(node.x + 3, node.y - 3); ctx.lineTo(node.x - 3, node.y + 3);
          ctx.stroke();
      }
  };

  const drawTruck = (ctx: CanvasRenderingContext2D) => {
      const nodes = truckNodesRef.current;
      if (nodes.length === 0) return;
      
      // Wireframe Truck
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.beginPath();
      truckEdgesRef.current.forEach(e => {
          const nA = nodes.find(n => n.id === e.nodeA);
          const nB = nodes.find(n => n.id === e.nodeB);
          if (nA && nB) { ctx.moveTo(nA.x, nA.y); ctx.lineTo(nB.x, nB.y); }
      });
      ctx.stroke();

      // Wheels
      nodes.filter(n => n.id.includes('wheel')).forEach(n => {
          ctx.beginPath(); ctx.arc(n.x, n.y, 10, 0, Math.PI * 2); 
          ctx.fillStyle = 'rgba(245, 158, 11, 0.2)'; ctx.fill();
          ctx.strokeStyle = '#f59e0b'; ctx.stroke();
          // Spokes
          ctx.beginPath(); ctx.moveTo(n.x - 10, n.y); ctx.lineTo(n.x + 10, n.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(n.x, n.y - 10); ctx.lineTo(n.x, n.y + 10); ctx.stroke();
      });
      
      // Body Box
      const body = nodes.find(n => n.id.includes('body'));
      if(body) { 
          ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
          ctx.fillRect(body.x - 15, body.y - 10, 30, 20); 
          ctx.strokeRect(body.x - 15, body.y - 10, 30, 20);
      }
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden cursor-crosshair">
        <canvas
        ref={canvasRef}
        width={1000}
        height={800}
        className="max-w-full max-h-full object-contain shadow-2xl border border-white/10 bg-transparent"
        style={{ touchAction: 'none' }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onMouseLeave={() => setActiveNodeId(null)}
        />
    </div>
  );
};

export default GameCanvas;
