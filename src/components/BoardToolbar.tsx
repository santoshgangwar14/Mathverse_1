import React from 'react';
import { motion } from 'motion/react';
import { 
  Edit3, PenTool, Flame, Circle as CircleIcon, Square, 
  Triangle, ArrowUpRight, Eraser, Trash2, Maximize2, Minimize2, ZoomIn, ZoomOut 
} from 'lucide-react';

export type BoardTool = 'marker' | 'highlighter' | 'eraser' | 'laser' | 'circle' | 'rectangle' | 'triangle' | 'arrow';
export type BoardBackground = 'greenboard' | 'whiteboard' | 'graph';

interface BoardToolbarProps {
  activeTool: BoardTool;
  setActiveTool: (tool: BoardTool) => void;
  boardBg: BoardBackground;
  setBoardBg: (bg: BoardBackground) => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canClear: boolean;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export default function BoardToolbar({
  activeTool,
  setActiveTool,
  boardBg,
  setBoardBg,
  onUndo,
  onClear,
  canUndo,
  canClear,
  zoomLevel,
  setZoomLevel,
  isFullscreen,
  toggleFullscreen
}: BoardToolbarProps) {

  const toolsList: { id: BoardTool; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'marker', label: 'Fine Marker', icon: <Edit3 className="w-4 h-4" />, color: 'from-blue-400 to-indigo-500' },
    { id: 'highlighter', label: 'Highlighter', icon: <PenTool className="w-4 h-4" />, color: 'from-amber-400 to-yellow-500' },
    { id: 'eraser', label: 'Smart Eraser', icon: <Eraser className="w-4 h-4" />, color: 'from-rose-400 to-pink-500' },
    { id: 'laser', label: 'Quantum Laser', icon: <Flame className="w-4 h-4" />, color: 'from-red-400 to-orange-500' },
    { id: 'circle', label: 'Circle', icon: <CircleIcon className="w-4 h-4" />, color: 'from-cyan-400 to-teal-500' },
    { id: 'rectangle', label: 'Rectangle', icon: <Square className="w-4 h-4" />, color: 'from-emerald-400 to-green-500' },
    { id: 'triangle', label: 'Triangle', icon: <Triangle className="w-4 h-4" />, color: 'from-purple-400 to-violet-500' },
    { id: 'arrow', label: 'Vector Arrow', icon: <ArrowUpRight className="w-4 h-4" />, color: 'from-sky-400 to-blue-500' },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between p-3.5 bg-slate-950/80 border-t border-slate-800/80 backdrop-blur-xl gap-4 z-20 shadow-2xl rounded-b-xl">
      {/* 1. Left Section: Tool Selector with smooth layout transitions */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/60 p-1 rounded-2xl border border-slate-800/60 max-w-full overflow-x-auto no-scrollbar">
        {toolsList.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className="relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-2 select-none cursor-pointer outline-none group"
              id={`tool-btn-${tool.id}`}
            >
              {/* Dynamic Pill background using Framer Motion */}
              {isActive && (
                <motion.div
                  layoutId="activeToolPill"
                  className={`absolute inset-0 bg-gradient-to-r ${tool.color} opacity-20 rounded-xl border border-white/10 shadow-[0_4px_12px_rgba(6,182,212,0.15)]`}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon wrapper with subtle scale animation */}
              <span className={`relative z-10 transition-all duration-300 transform group-hover:scale-110 ${isActive ? 'text-cyan-300 scale-105' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {tool.icon}
              </span>

              {/* Text label */}
              <span className={`relative z-10 hidden sm:inline text-[11px] uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Right Section: Background styles & System level utilities */}
      <div className="flex items-center justify-end gap-3 flex-wrap">
        {/* Undo / Reset Handlers */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-20 disabled:hover:bg-transparent transition-all cursor-pointer outline-none"
            title="Undo last sketch element"
            id="btn-undo-sketch"
          >
            <motion.span whileTap={canUndo ? { scale: 0.9 } : undefined} className="block">
              <Trash2 className="w-4 h-4 rotate-180" />
            </motion.span>
          </button>

          <button
            onClick={onClear}
            disabled={!canClear}
            className="p-2 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/20 disabled:opacity-20 disabled:hover:bg-transparent transition-all cursor-pointer outline-none"
            title="Clear all sketches"
            id="btn-clear-sketches"
          >
            <motion.span whileTap={canClear ? { scale: 0.9 } : undefined} className="block">
              <Trash2 className="w-4 h-4" />
            </motion.span>
          </button>
        </div>

        <div className="w-px h-6 bg-slate-800/60 hidden md:block" />

        {/* Zoom Increments */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/60 px-2 py-1 rounded-xl text-xs font-semibold">
          <button 
            onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))} 
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            id="zoom-out-btn"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-300 min-w-[36px] text-center font-mono text-[10px] select-none">{zoomLevel}%</span>
          <button 
            onClick={() => setZoomLevel(Math.min(120, zoomLevel + 10))} 
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            id="zoom-in-btn"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Screen size mode */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-850 transition-all cursor-pointer outline-none"
          title="Toggle Canvas Fullscreen"
          id="btn-fullscreen-toggle"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
