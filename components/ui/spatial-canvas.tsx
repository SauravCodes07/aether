"use client";

import { motion } from "framer-motion";
import { SPRING_PRESETS, DATA_FLOW_VARIANTS } from "@/lib/motion";

export function SpatialCanvas() {
  return (
    <div className="relative h-full w-full glass-panel rounded-aether-lg overflow-hidden shadow-aether-xl border-aether-border bg-aether-bg-elevated/30 group perspective-container">
      {/* 3D Grid Floor */}
      <div className="absolute inset-0 grid-pattern opacity-10 [transform:rotateX(55deg)_translateY(30%)] pointer-events-none" />
      
      {/* Operational Focal Point */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotateY: [0, 8, 0, -8, 0], rotateX: [0, -4, 0, 4, 0] }}
          transition={{ 
            scale: SPRING_PRESETS.cinematic,
            rotateY: { duration: 20, repeat: Infinity, ease: "easeInOut" },
            rotateX: { duration: 15, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative w-72 h-72"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full text-aether-cyan">
            <defs>
              <linearGradient id="flow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            <motion.path
              d="M100,20 L170,160 L30,160 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeDasharray="4 4"
              variants={DATA_FLOW_VARIANTS}
              animate="animate"
            />
            
            {/* Active AI Reasoning Path */}
            <motion.path
              d="M100,20 Q150,90 100,100 T100,180"
              fill="none"
              stroke="url(#flow-grad)"
              strokeWidth="2"
              animate={{ strokeDashoffset: [40, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              strokeDasharray="20 20"
            />

            {/* Operational Nodes */}
            <motion.circle cx="100" cy="20" r="4" fill="currentColor" animate={{ r: [4, 5, 4] }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.circle cx="170" cy="160" r="4" fill="currentColor" animate={{ r: [4, 6, 4] }} transition={{ duration: 2.5, repeat: Infinity }} />
            <motion.circle cx="30" cy="160" r="4" fill="currentColor" animate={{ r: [4, 5, 4] }} transition={{ duration: 3, repeat: Infinity }} />
            
            {/* Relationship Lines */}
            <line x1="100" y1="20" x2="100" y2="100" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 2" />
            <motion.circle cx="100" cy="100" r="3" fill="currentColor" className="shadow-aether-glow-cyan" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} />
          </svg>
        </motion.div>
      </div>

      {/* Spotlight following mouse (CSS-based) */}
      <div className="absolute inset-0 spotlight opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}