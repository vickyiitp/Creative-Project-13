
import React, { useEffect, useRef } from 'react';

const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationId: number;

    // Configuration for floating objects
    const objects: {
        x: number;
        y: number;
        z: number; // Scale factor
        vx: number;
        vy: number;
        rotation: number;
        vRotation: number;
        type: 'CUBE' | 'PYRAMID' | 'GRID' | 'PLUS';
        color: string;
    }[] = [];

    const init = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      objects.length = 0;
      const numObjects = Math.floor((width * height) / 40000); // Density based on screen size

      for (let i = 0; i < numObjects; i++) {
        objects.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: 0.5 + Math.random() * 1.5,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          rotation: Math.random() * Math.PI * 2,
          vRotation: (Math.random() - 0.5) * 0.01,
          type: Math.random() > 0.7 ? 'CUBE' : Math.random() > 0.5 ? 'PYRAMID' : Math.random() > 0.3 ? 'GRID' : 'PLUS',
          color: `rgba(${100 + Math.random() * 100}, ${150 + Math.random() * 105}, 255, ${0.05 + Math.random() * 0.1})`
        });
      }
    };

    const drawCube = (ctx: CanvasRenderingContext2D, size: number) => {
        const s = size / 2;
        ctx.beginPath();
        // Front face
        ctx.moveTo(-s, -s); ctx.lineTo(s, -s); ctx.lineTo(s, s); ctx.lineTo(-s, s); ctx.closePath();
        // Back face offset
        const off = s * 0.5;
        ctx.moveTo(-s + off, -s - off); ctx.lineTo(s + off, -s - off); ctx.lineTo(s + off, s - off); ctx.lineTo(-s + off, s - off); ctx.closePath();
        // Connecting lines
        ctx.moveTo(-s, -s); ctx.lineTo(-s + off, -s - off);
        ctx.moveTo(s, -s); ctx.lineTo(s + off, -s - off);
        ctx.moveTo(s, s); ctx.lineTo(s + off, s - off);
        ctx.moveTo(-s, s); ctx.lineTo(-s + off, s - off);
        ctx.stroke();
    };

    const drawPyramid = (ctx: CanvasRenderingContext2D, size: number) => {
        const s = size / 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s, s);
        ctx.lineTo(-s, s);
        ctx.closePath();
        ctx.moveTo(0, -s);
        ctx.lineTo(0, s/2); // Inner depth line
        ctx.stroke();
    };

    const drawPlus = (ctx: CanvasRenderingContext2D, size: number) => {
        const s = size / 2;
        ctx.beginPath();
        ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
        ctx.moveTo(0, -s); ctx.lineTo(0, s);
        ctx.stroke();
    };

    const animate = () => {
      // Create Gradient Background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0f172a'); // Slate 900
      gradient.addColorStop(0.5, '#1e1b4b'); // Indigo 950
      gradient.addColorStop(1, '#172554'); // Blue 950
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw faint background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      const time = Date.now() / 1000;
      
      // Moving Grid Effect
      const shiftX = (time * 10) % gridSize;
      const shiftY = (time * 10) % gridSize;

      for (let x = -gridSize; x < width + gridSize; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x + shiftX, 0); ctx.lineTo(x + shiftX, height); ctx.stroke();
      }
      for (let y = -gridSize; y < height + gridSize; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y + shiftY); ctx.lineTo(width, y + shiftY); ctx.stroke();
      }

      // Draw Objects
      objects.forEach(obj => {
        obj.x += obj.vx;
        obj.y += obj.vy;
        obj.rotation += obj.vRotation;

        // Wrap around screen
        if (obj.x < -100) obj.x = width + 100;
        if (obj.x > width + 100) obj.x = -100;
        if (obj.y < -100) obj.y = height + 100;
        if (obj.y > height + 100) obj.y = -100;

        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.rotation);
        ctx.scale(obj.z, obj.z);
        
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = 2;

        if (obj.type === 'CUBE') drawCube(ctx, 40);
        else if (obj.type === 'PYRAMID') drawPyramid(ctx, 40);
        else if (obj.type === 'PLUS') drawPlus(ctx, 20);
        else if (obj.type === 'GRID') {
             ctx.strokeRect(-20, -20, 40, 40);
             ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, 20); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.stroke();
        }

        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', init);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none" />;
};

export default BackgroundCanvas;
