import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Type, Edit3, Trash2, Maximize2, Minimize2, Grid, HelpCircle, 
  CornerUpLeft, CornerUpRight, RotateCcw, Compass, ArrowUpRight, 
  Circle as CircleIcon, Square, Triangle, PenTool, Flame, RefreshCw 
} from 'lucide-react';
import { BoardInstruction } from '../types';
import BoardToolbar from './BoardToolbar';

interface SmartBoardViewProps {
  boardInstructions: BoardInstruction[];
  subjectId: string;
}

type BoardTool = 'marker' | 'highlighter' | 'eraser' | 'laser' | 'circle' | 'rectangle' | 'triangle' | 'arrow';
type BoardBackground = 'greenboard' | 'whiteboard' | 'grid' | 'graph';

interface BoardDrawElement {
  id: string;
  type: BoardTool;
  points?: [number, number][]; // Relative coordinates 0-100
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  color: string;
  strokeWidth: number;
}

interface LaserTrailPoint {
  x: number;
  y: number;
  age: number;
  maxAge: number;
}

export default function SmartBoardView({ boardInstructions, subjectId }: SmartBoardViewProps) {
  const [activeTool, setActiveTool] = useState<BoardTool>('marker');
  const [boardBg, setBoardBg] = useState<BoardBackground>('greenboard');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Student manual drawing elements
  const [userElements, setUserElements] = useState<BoardDrawElement[]>([]);
  const [currentDrawPoints, setCurrentDrawPoints] = useState<[number, number][]>([]);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [shapeCurrent, setShapeCurrent] = useState<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Laser trail state
  const [laserPoints, setLaserPoints] = useState<LaserTrailPoint[]>([]);

  // Teacher automated animations state
  // Track animation progress for each teacher instruction: [id] -> progress (0 to 1)
  const [teacherProgress, setTeacherProgress] = useState<Record<string, number>>({});
  // Track where the virtual pen/marker tip is right now (in 0-100 coords)
  const [markerPosition, setMarkerPosition] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Auto-sync blackboard bg based on subject
  useEffect(() => {
    if (subjectId === 'maths') {
      setBoardBg('graph');
    } else if (subjectId === 'science') {
      setBoardBg('grid');
    } else {
      setBoardBg('greenboard');
    }
    // Clear user sketch elements on subject transition for a pristine board
    setUserElements([]);
    setTeacherProgress({});
  }, [subjectId]);

  // Trigger teacher drawing animation when board instructions change
  useEffect(() => {
    // Reset progress tracker
    const initialProgress: Record<string, number> = {};
    boardInstructions.forEach(inst => {
      initialProgress[inst.id] = 0;
    });
    setTeacherProgress(initialProgress);

    let currentInstIndex = 0;
    let progressVal = 0;

    const animateTeacherDraw = () => {
      if (boardInstructions.length === 0) {
        setMarkerPosition({ x: 0, y: 0, active: false });
        return;
      }

      if (currentInstIndex < boardInstructions.length) {
        const currentInst = boardInstructions[currentInstIndex];
        // Dynamic speed based on content type
        const increment = currentInst.type === 'text' ? 0.025 : 0.015;
        progressVal = Math.min(1, progressVal + increment);

        setTeacherProgress(prev => ({
          ...prev,
          [currentInst.id]: progressVal
        }));

        // Calculate current virtual marker drawing tip position
        let tx = 15;
        let ty = 12 + currentInstIndex * 9;

        if (currentInst.type === 'text' && currentInst.content) {
          // Slide text indicator along line
          tx = 15 + (currentInst.content.length * 1.6) * progressVal;
        } else if (currentInst.type === 'shape') {
          // Circle or geometry tracing coords
          const angle = progressVal * Math.PI * 2;
          tx = 50 + Math.cos(angle) * 8;
          ty = 50 + Math.sin(angle) * 8;
        } else if (currentInst.type === 'graph') {
          // Parabola graph tracing coordinate
          tx = 20 + 60 * progressVal;
          // Quadratic y equation mapped to graph scale
          const px = (tx - 50) / 10;
          const py = px * px - 2 * px;
          ty = 50 + py * 5;
        } else if (currentInst.type === 'chemical') {
          // Covalent model coordinate trace
          tx = 50 + Math.cos(progressVal * Math.PI * 2) * 15;
          ty = 50 + Math.sin(progressVal * Math.PI * 2) * 15;
        }

        setMarkerPosition({ x: tx, y: ty, active: progressVal < 1 });

        if (progressVal >= 1) {
          // Finish this step, proceed to the next
          currentInstIndex++;
          progressVal = 0;
        }
      } else {
        // All instructions drawn
        setMarkerPosition(prev => ({ ...prev, active: false }));
      }
    };

    // Run interval for drawing simulation steps
    const timer = setInterval(animateTeacherDraw, 30);
    return () => {
      clearInterval(timer);
    };
  }, [boardInstructions]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Set up high performance Canvas Draw loop and Resize Observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display resolution multiplier
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Canvas drawing helper function
    const drawBoard = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      if (width === 0 || height === 0) return;

      // Coordinate converter (0-100 relative to actual pixels)
      const rx = (val: number) => (val / 100) * width;
      const ry = (val: number) => (val / 100) * height;

      ctx.clearRect(0, 0, width, height);

      // 1. BACKGROUND THEMES RENDER
      if (boardBg === 'whiteboard') {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);
        
        // Soft whiteboard coordinate guidelines
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)';
        ctx.lineWidth = 0.5;
        for (let x = 10; x < 100; x += 10) {
          ctx.beginPath();
          ctx.moveTo(rx(x), 0);
          ctx.lineTo(rx(x), height);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(0, ry(x));
          ctx.lineTo(width, ry(x));
          ctx.stroke();
        }
      } else {
        // Greenboard/Graph/Grid themes get authentic green forest color
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        if (boardBg === 'graph') {
          gradient.addColorStop(0, '#09152e');
          gradient.addColorStop(1, '#020714');
        } else {
          gradient.addColorStop(0, '#093a20');
          gradient.addColorStop(1, '#031c0e');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Render chalkboard dust texture layer simulation
        ctx.fillStyle = 'rgba(255, 255, 255, 0.007)';
        for (let i = 0; i < 15; i++) {
          ctx.beginPath();
          ctx.arc(rx(10 + Math.random() * 80), ry(10 + Math.random() * 80), rx(15 + Math.random() * 20), 0, Math.PI * 2);
          ctx.fill();
        }

        // Standard educational grid or graph coordinates
        const isGraph = boardBg === 'graph';
        const lineClr = isGraph ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.06)';
        ctx.strokeStyle = lineClr;
        ctx.lineWidth = isGraph ? 0.75 : 0.5;

        for (let i = 10; i < 100; i += 10) {
          ctx.beginPath();
          ctx.moveTo(rx(i), 0);
          ctx.lineTo(rx(i), height);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(0, ry(i));
          ctx.lineTo(width, ry(i));
          ctx.stroke();
        }

        // Draw mathematical cartesian coordinate axes
        if (isGraph) {
          ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)'; // Yellow axis
          ctx.lineWidth = 1.5;

          // X Axis (centered at 50)
          ctx.beginPath();
          ctx.moveTo(0, ry(50));
          ctx.lineTo(width, ry(50));
          ctx.stroke();

          // Y Axis (centered at 50)
          ctx.beginPath();
          ctx.moveTo(rx(50), 0);
          ctx.lineTo(rx(50), height);
          ctx.stroke();

          // Axis Labels
          ctx.fillStyle = 'rgba(234, 179, 8, 0.8)';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText('X', rx(96), ry(53));
          ctx.fillText('Y', rx(52), ry(6));
          ctx.fillText('O (Origin)', rx(45), ry(54));

          // Draw grid tick increments
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.font = '8px monospace';
          for (let tick = 20; tick < 100; tick += 20) {
            if (tick === 50) continue;
            // X Ticks
            ctx.fillRect(rx(tick), ry(49), 1, 3);
            ctx.fillText(((tick - 50) / 10).toString(), rx(tick) - 3, ry(54));
            // Y Ticks
            ctx.fillRect(rx(49), ry(tick), 3, 1);
            ctx.fillText(((50 - tick) / 10).toString(), rx(52), ry(tick) + 3);
          }
        }
      }

      // 2. TEACHER INSTRUCTIONS LAYER (ANIMATED)
      boardInstructions.forEach((inst, index) => {
        const progress = teacherProgress[inst.id] ?? 0;
        if (progress <= 0) return;

        const baseColor = inst.color || (boardBg === 'whiteboard' ? '#0f172a' : '#ffffff');
        ctx.strokeStyle = baseColor;
        ctx.fillStyle = baseColor;

        if (inst.type === 'text' && inst.content) {
          // Dynamic typing text animation
          ctx.font = 'bold 13px "JetBrains Mono", monospace';
          const charsToDraw = Math.floor(inst.content.length * progress);
          const visibleText = inst.content.substring(0, charsToDraw);
          ctx.fillText(visibleText, rx(15), ry(12 + index * 9));
        } 
        
        else if (inst.type === 'shape') {
          // Draw geometric circle
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(rx(50), ry(50), rx(8), 0, Math.PI * 2 * progress);
          ctx.stroke();

          // If finished, draw label centered
          if (progress >= 1) {
            ctx.fillStyle = baseColor;
            ctx.font = 'italic 10px Inter';
            ctx.fillText('Radius r = 8 cm', rx(43), ry(62));
          }
        } 
        
        else if (inst.type === 'graph') {
          // Plot quadratic function parabola: y = x^2 - 2x
          ctx.lineWidth = 2.0;
          ctx.strokeStyle = '#10b981'; // Green curve
          ctx.beginPath();

          const startX = 20;
          const endX = startX + 60 * progress;

          for (let xCoord = startX; xCoord <= endX; xCoord += 0.5) {
            // Map 0-100 to algebraic coordinates centered around 50
            const xAlgebra = (xCoord - 50) / 10;
            const yAlgebra = xAlgebra * xAlgebra - 2 * xAlgebra;
            // Map back to canvas coords
            const canvasY = 50 + yAlgebra * 5;

            if (xCoord === startX) {
              ctx.moveTo(rx(xCoord), ry(canvasY));
            } else {
              ctx.lineTo(rx(xCoord), ry(canvasY));
            }
          }
          ctx.stroke();

          // Render parabola highlights when fully loaded
          if (progress >= 1) {
            // Critical roots points (x=0, x=2)
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(rx(50), ry(50), 3.5, 0, Math.PI * 2); // (0,0) Root
            ctx.arc(rx(70), ry(50), 3.5, 0, Math.PI * 2); // (2,0) Root
            ctx.fill();

            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 8px monospace';
            ctx.fillText('(0,0)', rx(45), ry(46));
            ctx.fillText('(2,0)', rx(68), ry(46));

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px "JetBrains Mono"';
            ctx.fillText('p(x) = x² - 2x', rx(41), ry(88));
          }
        } 
        
        else if (inst.type === 'chemical') {
          // Chemical Molecular Atoms and Bonds Covalent diagrams
          const scale = progress; // Elastic growth factor
          ctx.save();
          // Translate to center of molecular canvas
          ctx.translate(rx(50), ry(50));
          ctx.scale(scale, scale);

          // Central Oxygen atom
          ctx.fillStyle = '#0284c7';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px Inter';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('O', 0, 0);

          // Draw chemical bonds extending outward
          if (progress > 0.5) {
            const bondProgress = (progress - 0.5) * 2;
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 3.5;

            // Hydrogen bond 1
            ctx.beginPath();
            ctx.moveTo(-12, 12);
            ctx.lineTo(-12 - 20 * bondProgress, 12 + 20 * bondProgress);
            ctx.stroke();

            // Hydrogen bond 2
            ctx.beginPath();
            ctx.moveTo(12, 12);
            ctx.lineTo(12 + 20 * bondProgress, 12 + 20 * bondProgress);
            ctx.stroke();

            // Atomic Hydrogens
            if (progress > 0.8) {
              const hydrogenScale = (progress - 0.8) * 5;
              ctx.fillStyle = '#e11d48';
              ctx.strokeStyle = '#fda4af';
              ctx.lineWidth = 1.5;

              // Left H
              ctx.beginPath();
              ctx.arc(-32, 32, 10 * hydrogenScale, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 8px Inter';
              ctx.fillText('H', -32, 32);

              // Right H
              ctx.beginPath();
              ctx.arc(32, 32, 10 * hydrogenScale, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              ctx.fillStyle = '#ffffff';
              ctx.fillText('H', 32, 32);
            }
          }

          ctx.restore();
        }
      });

      // 3. STUDENT HANDWRITTEN / DRAWING LAYER
      userElements.forEach(el => {
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (el.type === 'marker' || el.type === 'highlighter' || el.type === 'eraser') {
          if (!el.points || el.points.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(rx(el.points[0][0]), ry(el.points[0][1]));
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(rx(el.points[i][0]), ry(el.points[i][1]));
          }
          ctx.stroke();
        } 
        
        else if (el.type === 'circle') {
          const sx = rx(el.startX ?? 0);
          const sy = ry(el.startY ?? 0);
          const ex = rx(el.endX ?? 0);
          const ey = ry(el.endY ?? 0);
          const radius = Math.sqrt(Math.pow(ex - sx, 2) + Math.pow(ey - sy, 2));

          ctx.beginPath();
          ctx.arc(sx, sy, radius, 0, Math.PI * 2);
          ctx.stroke();
        } 
        
        else if (el.type === 'rectangle') {
          const sx = rx(el.startX ?? 0);
          const sy = ry(el.startY ?? 0);
          const ex = rx(el.endX ?? 0);
          const ey = ry(el.endY ?? 0);

          ctx.beginPath();
          ctx.rect(sx, sy, ex - sx, ey - sy);
          ctx.stroke();
        } 
        
        else if (el.type === 'triangle') {
          const sx = rx(el.startX ?? 0);
          const sy = ry(el.startY ?? 0);
          const ex = rx(el.endX ?? 0);
          const ey = ry(el.endY ?? 0);

          ctx.beginPath();
          ctx.moveTo(sx + (ex - sx) / 2, sy); // Apex
          ctx.lineTo(ex, ey); // Bottom Right
          ctx.lineTo(sx, ey); // Bottom Left
          ctx.closePath();
          ctx.stroke();
        } 
        
        else if (el.type === 'arrow') {
          const sx = rx(el.startX ?? 0);
          const sy = ry(el.startY ?? 0);
          const ex = rx(el.endX ?? 0);
          const ey = ry(el.endY ?? 0);

          // Arrow shaft
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();

          // Arrowhead head angle calculations
          const angle = Math.atan2(ey - sy, ex - sx);
          const headLength = 12;

          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - headLength * Math.cos(angle - Math.PI / 6), ey - headLength * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(ex - headLength * Math.cos(angle + Math.PI / 6), ey - headLength * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fillStyle = el.color;
          ctx.fill();
        }
      });

      // 4. ACTIVE LIVE USER SKETCH FEEDBACK (PREVIEW MODE)
      if (isDrawing && (activeTool === 'marker' || activeTool === 'highlighter' || activeTool === 'eraser')) {
        if (currentDrawPoints.length > 1) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = activeTool === 'highlighter' ? 'rgba(253, 224, 71, 0.45)' : activeTool === 'eraser' ? 'transparent' : boardBg === 'whiteboard' ? '#1e293b' : '#ffffff';
          ctx.lineWidth = activeTool === 'highlighter' ? 14 : activeTool === 'eraser' ? 24 : 3;
          if (activeTool === 'eraser') {
            ctx.strokeStyle = boardBg === 'whiteboard' ? '#f8fafc' : '#031c0e'; // Erase matches background
          }

          ctx.beginPath();
          ctx.moveTo(rx(currentDrawPoints[0][0]), ry(currentDrawPoints[0][1]));
          for (let i = 1; i < currentDrawPoints.length; i++) {
            ctx.lineTo(rx(currentDrawPoints[i][0]), ry(currentDrawPoints[i][1]));
          }
          ctx.stroke();
        }
      } 
      
      else if (isDrawing && shapeStart && shapeCurrent) {
        // Interactive live geometric drawing guide lines
        ctx.strokeStyle = boardBg === 'whiteboard' ? '#4f46e5' : '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Dashed line during drag preview

        const sx = rx(shapeStart.x);
        const sy = ry(shapeStart.y);
        const cx = rx(shapeCurrent.x);
        const cy = ry(shapeCurrent.y);

        if (activeTool === 'circle') {
          const radius = Math.sqrt(Math.pow(cx - sx, 2) + Math.pow(cy - sy, 2));
          ctx.beginPath();
          ctx.arc(sx, sy, radius, 0, Math.PI * 2);
          ctx.stroke();
        } 
        
        else if (activeTool === 'rectangle') {
          ctx.beginPath();
          ctx.rect(sx, sy, cx - sx, cy - sy);
          ctx.stroke();
        } 
        
        else if (activeTool === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(sx + (cx - sx) / 2, sy);
          ctx.lineTo(cx, cy);
          ctx.lineTo(sx, cy);
          ctx.closePath();
          ctx.stroke();
        } 
        
        else if (activeTool === 'arrow') {
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(cx, cy);
          ctx.stroke();
        }
        ctx.setLineDash([]); // Reset dashed
      }

      // 5. INTERACTIVE LASER POINTER GLOW TRAIL
      if (laserPoints.length > 1) {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#f43f5e'; // Deep neon red beam

        for (let i = 1; i < laserPoints.length; i++) {
          const ptA = laserPoints[i - 1];
          const ptB = laserPoints[i];
          const opacity = (ptB.age / ptB.maxAge);
          ctx.strokeStyle = `rgba(244, 63, 94, ${opacity})`;
          ctx.lineWidth = 4 * opacity;

          ctx.beginPath();
          ctx.moveTo(rx(ptA.x), ry(ptA.y));
          ctx.lineTo(rx(ptB.x), ry(ptB.y));
          ctx.stroke();
        }
        ctx.restore();
      }
    };

    // Animation frame loop for real-time laser fading & redraws
    const loop = () => {
      // Fade laser points over time
      setLaserPoints(prev => 
        prev
          .map(p => ({ ...p, age: p.age - 1 }))
          .filter(p => p.age > 0)
      );

      drawBoard();
      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      resizeObserver.disconnect();
    };
  }, [boardBg, boardInstructions, userElements, currentDrawPoints, shapeStart, shapeCurrent, isDrawing, activeTool, teacherProgress, laserPoints]);

  // Client absolute coordinates converted to virtual grid (0-100)
  const getRelativeCoords = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100
    };
  };

  // Student dragging and drawing event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getRelativeCoords(e.clientX, e.clientY);
    if (!coords) return;

    setIsDrawing(true);

    if (activeTool === 'laser') {
      setLaserPoints([{ ...coords, age: 30, maxAge: 30 }]);
    } else if (['circle', 'rectangle', 'triangle', 'arrow'].includes(activeTool)) {
      setShapeStart(coords);
      setShapeCurrent(coords);
    } else {
      // Continuous line drawing tools (marker, highlighter, eraser)
      setCurrentDrawPoints([ [coords.x, coords.y] ]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getRelativeCoords(e.clientX, e.clientY);
    if (!coords) return;

    if (activeTool === 'laser') {
      setLaserPoints(prev => [...prev, { ...coords, age: 30, maxAge: 30 }]);
    }

    if (!isDrawing) return;

    if (['circle', 'rectangle', 'triangle', 'arrow'].includes(activeTool)) {
      setShapeCurrent(coords);
    } else if (activeTool === 'eraser') {
      // Inline erase logic: filtering out student drawings that intersect eraser brush
      setUserElements(prev => 
        prev.filter(el => {
          if (!el.points) return true;
          // Distance calculation
          const hasCollision = el.points.some(([px, py]) => 
            Math.sqrt(Math.pow(px - coords.x, 2) + Math.pow(py - coords.y, 2)) < 3.5
          );
          return !hasCollision;
        })
      );
    } else {
      // Dragging marker or highlighter path
      setCurrentDrawPoints(prev => [...prev, [coords.x, coords.y]]);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const strokeColor = activeTool === 'highlighter' 
      ? 'rgba(253, 224, 71, 0.45)' 
      : boardBg === 'whiteboard' ? '#1e293b' : '#ffffff';

    const strokeWidth = activeTool === 'highlighter' ? 14 : 3.5;

    if (['circle', 'rectangle', 'triangle', 'arrow'].includes(activeTool) && shapeStart && shapeCurrent) {
      // Finalize and commit shape element
      const newShape: BoardDrawElement = {
        id: `user-el-${Date.now()}`,
        type: activeTool,
        startX: shapeStart.x,
        startY: shapeStart.y,
        endX: shapeCurrent.x,
        endY: shapeCurrent.y,
        color: boardBg === 'whiteboard' ? '#4f46e5' : '#38bdf8', // Cyber cyan/indigo shapes
        strokeWidth: 3
      };
      setUserElements(prev => [...prev, newShape]);
    } else if (currentDrawPoints.length > 1 && activeTool !== 'eraser') {
      // Finalize and commit handwritten line
      const newLine: BoardDrawElement = {
        id: `user-el-${Date.now()}`,
        type: activeTool,
        points: currentDrawPoints,
        color: strokeColor,
        strokeWidth
      };
      setUserElements(prev => [...prev, newLine]);
    }

    // Reset dragging parameters
    setShapeStart(null);
    setShapeCurrent(null);
    setCurrentDrawPoints([]);
  };

  // Helper: Get icon based on tool
  const getToolIcon = (tool: BoardTool) => {
    switch (tool) {
      case 'marker': return <Edit3 className="w-4 h-4" />;
      case 'highlighter': return <PenTool className="w-4 h-4" />;
      case 'laser': return <Flame className="w-4 h-4 text-rose-500" />;
      case 'circle': return <CircleIcon className="w-4 h-4" />;
      case 'rectangle': return <Square className="w-4 h-4" />;
      case 'triangle': return <Triangle className="w-4 h-4" />;
      case 'arrow': return <ArrowUpRight className="w-4 h-4" />;
      default: return <Edit3 className="w-4 h-4" />;
    }
  };

  const getBgStyle = () => {
    switch (boardBg) {
      case 'whiteboard':
        return 'bg-[#fcfcfc] text-slate-900 border-slate-200 shadow-inner';
      case 'grid':
      case 'graph':
      case 'greenboard':
      default:
        return 'bg-gradient-to-b from-[#0a2f1d] to-[#041d12] text-white border-emerald-950/80 shadow-2xl';
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative flex flex-col h-full rounded-2xl border-4 overflow-hidden select-none transition-all duration-300 ${getBgStyle()}`}
      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
    >
      {/* Smart board glowing cyber outline */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 opacity-80" />

      {/* Board Title Bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950/70 border-b border-slate-800/60 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-300">
            A.I.R.A. Interactive Quantum Canvas • v5.0
          </span>
        </div>

        {/* Board Background selector */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-0.5 rounded-xl border border-slate-800">
          {(['greenboard', 'whiteboard', 'graph'] as BoardBackground[]).map((bg) => (
            <button 
              key={bg}
              onClick={() => setBoardBg(bg)}
              className={`px-3 py-1 text-[10px] rounded-lg font-semibold transition-all uppercase tracking-wider ${
                boardBg === bg 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {bg === 'greenboard' ? 'Chalk' : bg === 'whiteboard' ? 'White' : 'Graph'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary HTML5 Canvas */}
      <div className="relative flex-1 w-full h-full min-h-[320px] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair z-10 block"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* PHYSICAL GLOWING WRITING MARKER ANIMATION OVERLAY */}
        {markerPosition.active && (
          <div 
            className="absolute pointer-events-none z-30 transition-all duration-75 ease-out"
            style={{ 
              left: `${markerPosition.x}%`, 
              top: `${markerPosition.y}%`,
              transform: 'translate(-5px, -15px)' 
            }}
          >
            {/* Elegant stylus marker vector */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
              <path d="M4 20l4-4L20 4l-4-4L4 12v8z" fill="url(#stylusGrad)" />
              <circle cx="2" cy="22" r="2" fill="#06b6d4" className="animate-ping" />
              <defs>
                <linearGradient id="stylusGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0891b2" />
                  <stop offset="100%" stopColor="#a5f3fc" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        {/* Laser point status active overlay */}
        {activeTool === 'laser' && (
          <div className="absolute inset-0 bg-transparent pointer-events-none z-20">
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-[10px] text-rose-400 font-bold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              Laser Trail Mode Active
            </div>
          </div>
        )}
      </div>

      {/* Smart Board bottom Toolbar */}
      <BoardToolbar
        activeTool={activeTool as any}
        setActiveTool={(tool) => setActiveTool(tool as any)}
        boardBg={boardBg}
        setBoardBg={setBoardBg}
        onUndo={() => setUserElements(prev => prev.slice(0, -1))}
        onClear={() => setUserElements([])}
        canUndo={userElements.length > 0}
        canClear={userElements.length > 0}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
      />
    </div>
  );
}
