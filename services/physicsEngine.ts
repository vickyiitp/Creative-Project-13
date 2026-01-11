import { Node, Edge, Vector, MaterialType } from '../types';
import { PHYSICS, MATERIAL_CONFIG } from '../constants';

// Helper for distance
const dist = (p1: Vector, p2: Vector) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

export class PhysicsEngine {
  nodes: Map<string, Node>;
  edges: Edge[];
  
  constructor() {
    this.nodes = new Map();
    this.edges = [];
  }

  // Add nodes and edges from the game state
  loadState(nodes: Map<string, Node>, edges: Edge[]) {
    // Deep copy to avoid mutating React state directly during simulation step
    this.nodes = new Map(JSON.parse(JSON.stringify(Array.from(nodes))));
    this.edges = JSON.parse(JSON.stringify(edges));
  }

  update() {
    this.updateVerlet();
    this.solveConstraints();
    this.checkCollisions(); // Simplified truck/ground collision
  }

  private updateVerlet() {
    this.nodes.forEach(node => {
      if (node.isFixed) return;

      const vx = (node.x - node.oldX) * PHYSICS.friction;
      const vy = (node.y - node.oldY) * PHYSICS.friction;

      node.oldX = node.x;
      node.oldY = node.y;

      node.x += vx + PHYSICS.gravity.x * node.mass;
      node.y += vy + PHYSICS.gravity.y * node.mass;
    });
  }

  private solveConstraints() {
    // Iterate multiple times for stability
    for (let i = 0; i < PHYSICS.iterations; i++) {
      // 1. Edge Length Constraints
      this.edges.forEach(edge => {
        if (edge.broken) return;

        const nA = this.nodes.get(edge.nodeA);
        const nB = this.nodes.get(edge.nodeB);

        if (!nA || !nB) return;

        const dx = nA.x - nB.x;
        const dy = nA.y - nB.y;
        const distance = Math.hypot(dx, dy);
        
        // Calculate Stress for visualization
        const difference = distance - edge.restLength;
        const strain = difference / edge.restLength;
        
        // Only update stress on the last iteration for display accuracy
        if (i === PHYSICS.iterations - 1) {
           // Normalize stress relative to material strength
           const maxStrain = 0.3 * MATERIAL_CONFIG[edge.type].strength; 
           edge.currentStress = Math.abs(strain) / maxStrain;

           if (edge.currentStress > 1.0) {
             edge.broken = true;
           }
        }

        if (distance === 0) return; // Prevent divide by zero

        // Material stiffness: Steel is stiffer (harder to pull apart)
        // We simulate stiffness by how much we correct the error. 
        // For this simple engine, we treat all as rigid but break them if they stretch too much.
        const correctionPercent = difference / distance / 2;
        const offsetX = dx * correctionPercent;
        const offsetY = dy * correctionPercent;

        if (!nA.isFixed) {
          nA.x -= offsetX;
          nA.y -= offsetY;
        }
        if (!nB.isFixed) {
          nB.x += offsetX;
          nB.y += offsetY;
        }
      });
    }
  }

  private checkCollisions() {
    // Simple ground floor collision
    const groundY = 800; // Below screen roughly, just a kill floor
    this.nodes.forEach(node => {
      if (node.y > groundY) {
        node.y = groundY;
        node.x = node.x; // Friction could go here
      }
    });
  }

  // Special method to handle Truck physics interacting with the bridge
  // Truck is passed in as a set of temporary nodes/constraints
  updateTruckInteraction(truckNodes: Node[], truckEdges: Edge[], bridgeNodes: Map<string, Node>, roadEdges: Edge[]) {
     // 1. Truck internal constraints
     for(let i=0; i<PHYSICS.iterations; i++) {
        truckEdges.forEach(edge => {
            const nA = truckNodes.find(n => n.id === edge.nodeA);
            const nB = truckNodes.find(n => n.id === edge.nodeB);
            if(!nA || !nB) return;
            
            const dx = nA.x - nB.x;
            const dy = nA.y - nB.y;
            const d = Math.hypot(dx, dy);
            const diff = (d - edge.restLength) / d / 2;
            
            nA.x -= dx * diff;
            nA.y -= dy * diff;
            nB.x += dx * diff;
            nB.y += dy * diff;
        });
     }

     // 2. Truck gravity & movement
     truckNodes.forEach(node => {
        const vx = (node.x - node.oldX) * PHYSICS.friction;
        const vy = (node.y - node.oldY) * PHYSICS.friction;
        node.oldX = node.x;
        node.oldY = node.y;
        
        // Add "Engine" force to wheels (nodes 0 and 1 usually)
        if (node.id.includes('wheel')) {
             node.x += 0.1; // Drive forward
        }

        node.x += vx + PHYSICS.gravity.x * node.mass;
        node.y += vy + PHYSICS.gravity.y * node.mass;
     });

     // 3. Collision: Truck Wheels vs Road Edges
     truckNodes.filter(n => n.id.includes('wheel')).forEach(wheel => {
         let bestDist = 20; // Radius of wheel
         let collisionNormal = null;
         let collisionEdge = null;

         // Find closest road segment
         for (const edge of roadEdges) {
             if (edge.broken) continue;
             const p1 = bridgeNodes.get(edge.nodeA);
             const p2 = bridgeNodes.get(edge.nodeB);
             if (!p1 || !p2) continue;

             // Line segment collision
             const l2 = (p1.x - p2.x)**2 + (p1.y - p2.y)**2;
             if (l2 === 0) continue;
             let t = ((wheel.x - p1.x) * (p2.x - p1.x) + (wheel.y - p1.y) * (p2.y - p1.y)) / l2;
             t = Math.max(0, Math.min(1, t));
             
             const projX = p1.x + t * (p2.x - p1.x);
             const projY = p1.y + t * (p2.y - p1.y);
             
             const d = Math.hypot(wheel.x - projX, wheel.y - projY);

             if (d < bestDist) {
                 // Check if wheel is above the line
                 // Cross product to determine side? Or simple Y check?
                 // For simplicity, just push away from line center
                 const nx = (wheel.x - projX) / d;
                 const ny = (wheel.y - projY) / d;
                 
                 wheel.x = projX + nx * bestDist;
                 wheel.y = projY + ny * bestDist;
                 
                 // Apply weight to bridge nodes (Equal and Opposite reaction)
                 // Distribute force based on 't' (barycentric coordinates)
                 const impulse = 0.5; // Weight factor
                 if (!p1.isFixed) {
                     p1.y += impulse * (1-t);
                 }
                 if (!p2.isFixed) {
                     p2.y += impulse * t;
                 }
             }
         }
     });
  }
}