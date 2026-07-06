import React from 'react';
import { motion } from 'motion/react';

export type PoseType = 'writing' | 'explaining' | 'standing';

interface TeacherAnimationProps {
  action: string;
  emotion: 'smiling' | 'serious' | 'enthusiastic';
  facing: 'audience' | 'board';
  isSpeaking?: boolean;
}

export default function TeacherAnimation({ action, emotion, facing, isSpeaking = false }: TeacherAnimationProps) {
  // Normalize and map raw actions to primary skeletal state logic
  const normalizedAction = action?.toLowerCase() || '';
  
  const isWriting = normalizedAction.includes('write') || normalizedAction.includes('writing');
  const isPointing = normalizedAction.includes('point') || normalizedAction.includes('pointing');
  const isGesturing = normalizedAction.includes('gestur') || normalizedAction.includes('explain') || normalizedAction.includes('concept');
  const isWalking = normalizedAction.includes('walk') || normalizedAction.includes('walking') || normalizedAction.includes('to board');
  const isStanding = !isWriting && !isPointing && !isGesturing && !isWalking;

  // Master poses mapping
  const currentPose: PoseType = isWriting 
    ? 'writing' 
    : (isPointing || isGesturing) 
    ? 'explaining' 
    : 'standing';

  // State-driven motion paths representing the left skeletal/limb curves
  const leftArmD = isGesturing
    ? "M 58 130 C 25 130, 20 165, 38 185" // waving explanation gesture
    : isWriting
    ? "M 58 130 C 45 150, 40 180, 52 200" // holding draft notebook/ruler
    : isWalking
    ? "M 58 130 C 35 145, 25 175, 42 195" // swinging in walking pose
    : "M 58 130 C 35 150, 30 190, 45 210"; // relaxed standing

  // State-driven motion paths representing the right skeletal/limb curves
  const rightArmD = isWriting
    ? "M 138 130 C 145 105, 178 78, 195 62" // writing extend pose
    : isPointing
    ? "M 142 130 C 160 115, 175 95, 192 85" // laser point pose
    : isGesturing
    ? "M 142 130 C 165 140, 175 168, 158 190" // explaining pose
    : isWalking
    ? "M 142 130 C 160 150, 150 180, 162 205" // swinging in walking pose
    : "M 142 130 C 165 150, 170 190, 155 210"; // standing pose

  // Visor graphics based on emotion and active laser writing state
  const renderVisorEyes = () => {
    if (isWriting) {
      // Focused laser writing visor
      return (
        <g filter="url(#avatarGlow)">
          <motion.line 
            x1="82" y1="70" x2="98" y2="70" 
            stroke="#ef4444" 
            strokeWidth="3" 
            strokeLinecap="round" 
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
          <circle cx="90" cy="70" r="2" fill="#ffffff" />
          <motion.line 
            x1="90" y1="70" x2="90" y2="80" 
            stroke="#ef4444" 
            strokeWidth="1.2" 
            strokeDasharray="2,2" 
            animate={{ scaleY: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </g>
      );
    }

    // Interactive expressive LED pixel matrix
    return (
      <g filter="url(#avatarGlow)">
        {(emotion === 'smiling' || emotion === 'enthusiastic') ? (
          <>
            {/* Happy anime-style eyes ^ ^ */}
            <path d="M 82 72 Q 88 64 94 72" stroke="#06b6d4" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 106 72 Q 112 64 118 72" stroke="#06b6d4" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : emotion === 'serious' ? (
          <>
            {/* Analytical focused eyes */}
            <ellipse cx="88" cy="70" rx="5" ry="2.5" fill="#10b981" />
            <ellipse cx="112" cy="70" rx="5" ry="2.5" fill="#10b981" />
            <path d="M 82 63 L 94 66" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 118 63 L 106 66" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Neutral standard eyes */}
            <circle cx="88" cy="70" r="4.5" fill="#06b6d4" />
            <circle cx="112" cy="70" r="4.5" fill="#06b6d4" />
            <rect x="83" y="61" width="10" height="2" rx="1" fill="#06b6d4" opacity="0.6" />
            <rect x="107" y="61" width="10" height="2" rx="1" fill="#06b6d4" opacity="0.6" />
          </>
        )}

        {/* Dynamic breathing chemical mouthpiece spectrum */}
        <motion.path
          d="M 92 83 Q 100 85 108 83"
          stroke={emotion === 'serious' ? '#10b981' : '#06b6d4'}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: isSpeaking 
              ? [
                  "M 92 83 Q 100 91 108 83",
                  "M 92 83 Q 100 74 108 83",
                  "M 92 83 Q 100 93 108 83",
                  "M 92 83 Q 100 71 108 83"
                ]
              : [
                  "M 92 83 Q 100 85 108 83",
                  "M 92 83 Q 100 79 108 83",
                  "M 92 83 Q 100 87 108 83"
                ]
          }}
          transition={{
            duration: isSpeaking ? 0.15 : 0.6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </g>
    );
  };

  return (
    <svg
      id="instructor-avatar-container"
      viewBox="0 0 200 300"
      className="w-full h-full drop-shadow-[0_12px_28px_rgba(6,182,212,0.18)]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Futuristic Metal Shading */}
        <linearGradient id="bodyChrome" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#cbd5e1" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="cyberEngineTeal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="reactorCoreGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="eyeVisorBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        
        {/* Glow Filters */}
        <filter id="avatarGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="reactorCoreFilter" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ground shadows syncing with chassis height */}
      <motion.ellipse 
        cx="100" 
        cy="285" 
        rx="45" 
        ry="8" 
        fill="#000000" 
        fillOpacity="0.22"
        animate={{
          rx: isWalking ? [40, 48, 40] : [45, 48, 45],
          fillOpacity: isWalking ? [0.25, 0.15, 0.25] : [0.22, 0.16, 0.22]
        }}
        transition={{
          duration: isWalking ? 0.6 : 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* ROBOTIC FLOATING MASTER CHASSIS */}
      <motion.g
        animate={{
          y: isWalking ? [0, -7, 0, -7, 0] : [0, -6, 0],
          rotate: isWriting ? [4, 4, 4] : isPointing ? [-1, -1, -1] : [0, 0.5, 0],
          x: isWriting ? [-10, -10, -10] : [0, 0, 0]
        }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: isWalking ? 0.6 : 3,
          ease: "easeInOut",
        }}
      >
        {/* Hover thruster plasma burst */}
        <g transform="translate(0, 230)">
          <motion.path
            d="M 85 5 Q 100 35 115 5 Z"
            fill="url(#cyberEngineTeal)"
            opacity="0.8"
            filter="url(#avatarGlow)"
            animate={{
              scaleY: isWalking ? [1.4, 2.0, 1.4] : [1, 1.4, 0.9, 1.3, 1],
              opacity: isWalking ? [0.9, 1.0, 0.9] : [0.7, 0.9, 0.6, 0.9, 0.7]
            }}
            transition={{
              repeat: Infinity,
              duration: isWalking ? 0.2 : 0.4,
              ease: "linear"
            }}
          />
          <path d="M 80 0 L 120 0 L 110 8 L 90 8 Z" fill="#475569" />
          <rect x="92" y="1" width="16" height="3" rx="1.5" fill="#06b6d4" filter="url(#avatarGlow)" />
        </g>

        {/* Lower Body aerodynamic cone */}
        <path d="M 75 180 L 125 180 L 115 235 L 85 235 Z" fill="url(#bodyChrome)" stroke="#475569" strokeWidth="1" />
        <path d="M 90 180 L 110 180 L 105 235 L 95 235 Z" fill="#1e293b" opacity="0.25" />
        
        {/* Cyber energy indicator lines */}
        <line x1="82" y1="200" x2="118" y2="200" stroke="#06b6d4" strokeWidth="1.5" opacity="0.8" />
        <line x1="88" y1="220" x2="112" y2="220" stroke="#06b6d4" strokeWidth="1.5" opacity="0.8" />

        {/* Torso Shell Chassis (Transparent glass outer plates to reveal internal skeleton) */}
        <path
          d="M 58 120 C 58 120 50 180 62 180 C 74 180 126 180 138 180 C 150 180 142 120 142 120 Z"
          fill="url(#bodyChrome)"
          fillOpacity="0.3"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* GLOWING INTERNAL SKELETAL SYSTEM (Revealed through semi-transparent chest) */}
        <g id="cyber-skeletal-frame">
          {/* Central spine vertebrae column */}
          <rect x="97" y="125" width="6" height="4" rx="1" fill="#06b6d4" opacity="0.75" filter="url(#avatarGlow)" />
          <rect x="97" y="132" width="6" height="4" rx="1" fill="#06b6d4" opacity="0.75" filter="url(#avatarGlow)" />
          <rect x="97" y="139" width="6" height="4" rx="1" fill="#06b6d4" opacity="0.75" filter="url(#avatarGlow)" />
          <rect x="97" y="146" width="6" height="4" rx="1" fill="#06b6d4" opacity="0.75" filter="url(#avatarGlow)" />
          <rect x="97" y="153" width="6" height="4" rx="1" fill="#06b6d4" opacity="0.75" filter="url(#avatarGlow)" />
          <rect x="97" y="160" width="6" height="4" rx="1" fill="#06b6d4" opacity="0.75" filter="url(#avatarGlow)" />
          <rect x="97" y="167" width="6" height="4" rx="1" fill="#06b6d4" opacity="0.75" filter="url(#avatarGlow)" />

          {/* Clavicle / shoulder structural bar */}
          <line x1="66" y1="125" x2="134" y2="125" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" opacity="0.85" filter="url(#avatarGlow)" />

          {/* Rib Cage Ribs */}
          <path d="M 97 132 C 80 132, 72 140, 75 148" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" filter="url(#avatarGlow)" />
          <path d="M 103 132 C 120 132, 128 140, 125 148" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" filter="url(#avatarGlow)" />
          <path d="M 97 141 C 80 141, 70 149, 73 157" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" filter="url(#avatarGlow)" />
          <path d="M 103 141 C 120 141, 130 149, 127 157" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" filter="url(#avatarGlow)" />
          <path d="M 97 150 C 80 150, 71 158, 74 166" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" filter="url(#avatarGlow)" />
          <path d="M 103 150 C 120 150, 129 158, 126 166" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" filter="url(#avatarGlow)" />

          {/* Pelvis / base chassis connector node */}
          <polygon points="90,174 110,174 100,183" fill="#06b6d4" opacity="0.9" filter="url(#avatarGlow)" />
        </g>

        {/* Glowing chest reactor core (Spinning energy indicators) */}
        <g transform="translate(100, 150)">
          <circle cx="0" cy="0" r="22" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          <motion.circle 
            cx="0" 
            cy="0" 
            r="15" 
            fill="#06b6d4" 
            opacity="0.22" 
            filter="url(#reactorCoreFilter)"
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Outer Ring */}
          <motion.path
            d="M -12 0 A 12 12 0 0 1 12 0"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          />
          {/* Inner ring spinning opposite direction */}
          <motion.path
            d="M -8 0 A 8 8 0 0 0 8 0"
            fill="none"
            stroke={emotion === 'serious' ? '#10b981' : '#a855f7'}
            strokeWidth="2"
            strokeLinecap="round"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
          />
          <circle cx="0" cy="0" r="4.5" fill="#ffffff" filter="url(#avatarGlow)" />
        </g>

        {/* Humanoid robot serial tag badge */}
        <rect x="85" y="118" width="30" height="8" rx="4" fill="#1e293b" />
        <text x="100" y="124" fill="#06b6d4" fontSize="5" fontWeight="black" textAnchor="middle" letterSpacing="0.6">A.I.R.A.</text>

        {/* Cylindrical neck */}
        <rect x="92" y="90" width="16" height="20" rx="2" fill="url(#bodyChrome)" stroke="#475569" />
        <line x1="92" y1="100" x2="108" y2="100" stroke="#06b6d4" strokeWidth="2.5" filter="url(#avatarGlow)" />

        {/* ROBOTIC HEAD */}
        <motion.g
          animate={{
            rotate: isWriting || facing === 'board' ? [12, 12, 12] : [0, 0, 0],
            x: isWriting || facing === 'board' ? [-6, -6, -6] : [0, 0, 0]
          }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          {/* Head helmet frame */}
          <ellipse cx="100" cy="70" rx="30" ry="25" fill="url(#bodyChrome)" stroke="#334155" strokeWidth="2" />
          
          {/* Lateral pulse antennas */}
          <rect x="66" y="62" width="5" height="16" rx="2" fill="#475569" />
          <motion.circle 
            cx="68" cy="60" r="3" 
            fill="#06b6d4" 
            filter="url(#avatarGlow)" 
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          
          <rect x="129" y="62" width="5" height="16" rx="2" fill="#475569" />
          <motion.circle 
            cx="131" cy="60" r="3" 
            fill="#06b6d4" 
            filter="url(#avatarGlow)"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />

          {/* LED visor shape */}
          <path 
            d="M 76 60 Q 100 50 124 60 Q 128 85 120 90 Q 100 95 80 90 Q 72 85 76 60 Z" 
            fill="url(#eyeVisorBg)" 
            stroke={isWriting ? '#ef4444' : '#06b6d4'} 
            strokeWidth="1.5"
          />

          {/* Visor digital expressions */}
          {renderVisorEyes()}
        </motion.g>

        {/* ------------------ LEFT ROBOTIC ARM (Outer Chrome Plates) ------------------ */}
        <g id="avatar-left-arm">
          <motion.path
            stroke="url(#bodyChrome)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            animate={{ d: leftArmD }}
            transition={{ type: "spring", stiffness: 80, damping: 14 }}
          />
          
          {/* INTERNAL GLOWING SKELETAL BONE LINE (Nested inside arm) */}
          <motion.path
            stroke="#22d3ee"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
            filter="url(#avatarGlow)"
            animate={{ d: leftArmD }}
            transition={{ type: "spring", stiffness: 80, damping: 14 }}
          />

          {/* Cyber shoulder gear node (rotates slightly on action) */}
          <motion.g 
            transform="translate(58, 130)"
            animate={{ rotate: isGesturing ? -25 : isWriting ? 15 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx="0" cy="0" r="7" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.5" />
            <line x1="-5" y1="0" x2="5" y2="0" stroke="#06b6d4" strokeWidth="1" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#06b6d4" strokeWidth="1" />
          </motion.g>

          {/* Elbow Joint indicator */}
          <motion.circle 
            cx="34" cy="165" r="4.5" 
            fill="#1e293b" 
            stroke="#06b6d4" 
            strokeWidth="1" 
            animate={{ scale: isGesturing ? 1.2 : 1 }}
          />
        </g>

        {/* ------------------ RIGHT ROBOTIC ARM & UTILITIES (Outer Chrome Plates) ------------------ */}
        <g id="avatar-right-arm">
          <motion.path
            stroke="url(#bodyChrome)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            animate={{ d: rightArmD }}
            transition={{ type: "spring", stiffness: 80, damping: 14 }}
          />

          {/* INTERNAL GLOWING SKELETAL BONE LINE (Nested inside arm) */}
          <motion.path
            stroke="#22d3ee"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
            filter="url(#avatarGlow)"
            animate={{ d: rightArmD }}
            transition={{ type: "spring", stiffness: 80, damping: 14 }}
          />

          {/* Cyber shoulder gear node (rotates dynamically) */}
          <motion.g 
            transform="translate(142, 130)"
            animate={{ rotate: isWriting ? -45 : isPointing ? -30 : isGesturing ? 15 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx="0" cy="0" r="7" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.5" />
            <line x1="-5" y1="0" x2="5" y2="0" stroke="#06b6d4" strokeWidth="1" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#06b6d4" strokeWidth="1" />
          </motion.g>

          {/* Elbow Joint indicator */}
          <motion.circle 
            cx="166" cy="165" r="4.5" 
            fill="#1e293b" 
            stroke="#06b6d4" 
            strokeWidth="1"
            animate={{ scale: isWriting || isPointing ? 1.25 : 1 }}
          />

          {/* Active Stylus Pen (When 'writing' / 'writing equation' is active) */}
          {isWriting && (
            <motion.g 
              transform="translate(192, 57)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 150 }}
            >
              <rect x="0" y="0" width="4" height="15" rx="1.5" fill="#06b6d4" transform="rotate(45)" filter="url(#avatarGlow)" />
              <rect x="1" y="-3" width="2" height="4" fill="#ffffff" transform="rotate(45)" />
              {/* Dynamic board drawing laser sparks */}
              <motion.circle 
                cx="8" cy="-2" r="3" 
                fill="#ffffff" 
                filter="url(#avatarGlow)"
                animate={{ scale: [1, 2, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
            </motion.g>
          )}

          {/* Active Laser Beam pointer head (When 'pointing' or 'explaining concept') */}
          {isPointing && (
            <motion.g 
              transform="translate(189, 82)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 150 }}
            >
              <circle cx="4" cy="4" r="6" fill="#ef4444" filter="url(#avatarGlow)" />
              <circle cx="4" cy="4" r="2.5" fill="#ffffff" />
            </motion.g>
          )}
        </g>
      </motion.g>
    </svg>
  );
}
