import React from 'react';
import { motion } from 'motion/react';
import { mediaService } from '../services/MockServices';

export type PoseType = 'writing' | 'explaining' | 'standing';

interface TeacherAnimationProps {
  action: string;
  emotion: 'smiling' | 'serious' | 'enthusiastic';
  facing: 'audience' | 'board';
  isSpeaking?: boolean;
}

export default function TeacherAnimation({ action, emotion, facing, isSpeaking = false }: TeacherAnimationProps) {
  // 1. Blinking State
  const [isBlinking, setIsBlinking] = React.useState(false);
  React.useEffect(() => {
    let blinkTimeout: any;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      
      const nextBlinkDelay = 2500 + Math.random() * 4000;
      blinkTimeout = setTimeout(triggerBlink, nextBlinkDelay);
    };
    
    blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(blinkTimeout);
  }, []);

  // 2. Real-time Phoneme Subscription for Lip-sync
  const [currentPhoneme, setCurrentPhoneme] = React.useState<'a' | 'o' | 'e' | 'i' | 'consonant' | 'idle'>('idle');
  React.useEffect(() => {
    const handlePhoneme = (phoneme: 'a' | 'o' | 'e' | 'i' | 'consonant' | 'idle') => {
      setCurrentPhoneme(phoneme);
    };
    
    mediaService.addPhonemeListener(handlePhoneme);
    return () => {
      mediaService.removePhonemeListener(handlePhoneme);
    };
  }, []);

  // 3. Fallback spoken phonemes oscillation for standard speech narration
  const [fallbackPhoneme, setFallbackPhoneme] = React.useState<'a' | 'o' | 'e' | 'i' | 'consonant' | 'idle'>('idle');
  React.useEffect(() => {
    if (!isSpeaking) {
      setFallbackPhoneme('idle');
      return;
    }
    
    const phonemes: ('a' | 'o' | 'e' | 'i' | 'consonant')[] = ['a', 'consonant', 'e', 'consonant', 'o', 'consonant', 'i'];
    let index = 0;
    const interval = setInterval(() => {
      setFallbackPhoneme(phonemes[index % phonemes.length]);
      index++;
    }, 110);
    
    return () => clearInterval(interval);
  }, [isSpeaking]);

  const activePhoneme = currentPhoneme !== 'idle' ? currentPhoneme : (isSpeaking ? fallbackPhoneme : 'idle');

  // Normalize action strings
  const normalizedAction = action?.toLowerCase() || '';
  const isWriting = normalizedAction.includes('write') || normalizedAction.includes('writing');
  const isPointing = normalizedAction.includes('point') || normalizedAction.includes('pointing');
  const isGesturing = normalizedAction.includes('gestur') || normalizedAction.includes('explain') || normalizedAction.includes('concept');
  const isWalking = normalizedAction.includes('walk') || normalizedAction.includes('walking') || normalizedAction.includes('to board');

  // Determine actual gaze direction: turn head/body to board when writing, pointing, or instructed
  const isFacingBoard = facing === 'board' || isWriting || isPointing;

  // Render Lip-Sync Mouth paths based on active phoneme (human lips, dark inner mouth, pearly teeth, warm tongue)
  const renderHumanMouth = () => {
    switch (activePhoneme) {
      case 'a': // /a/ - Wide open mouth
        return (
          <g transform="translate(100, 77)">
            {/* Inner Mouth cavity */}
            <path d="M -7 -1 Q 0 8 7 -1 Q 0 -4 -7 -1" fill="#6b1d1d" />
            {/* Upper teeth */}
            <path d="M -5 -2 Q 0 0 5 -2 L 5 -3 L -5 -3 Z" fill="#ffffff" />
            {/* Tongue */}
            <path d="M -4 4 Q 0 1 4 4 Q 0 8 -4 4" fill="#f87171" />
            {/* Outer Lips contour */}
            <path d="M -8 -1 Q 0 9 8 -1 Q 0 -5 -8 -1" fill="none" stroke="#be123c" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );
      case 'o': // /o/ - Rounded circle mouth
        return (
          <g transform="translate(100, 77)">
            {/* Inner mouth */}
            <ellipse cx="0" cy="2" rx="4" ry="5.5" fill="#6b1d1d" />
            {/* Outer lips */}
            <ellipse cx="0" cy="2" rx="5" ry="6.5" fill="none" stroke="#be123c" strokeWidth="1.5" />
          </g>
        );
      case 'i': // /i/ - Wide flat mouth showing teeth
        return (
          <g transform="translate(100, 77)">
            {/* Wide mouth */}
            <path d="M -9 1 Q 0 4 9 1 Q 0 -1 -9 1 Z" fill="#6b1d1d" />
            {/* Upper and lower teeth showing */}
            <path d="M -7 1 L 7 1" stroke="#ffffff" strokeWidth="1.5" />
            {/* Lips */}
            <path d="M -10 1 Q 0 5 10 1 Q 0 -2 -10 1" fill="none" stroke="#be123c" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );
      case 'e': // /e/ - Mid open wide mouth
        return (
          <g transform="translate(100, 77)">
            <path d="M -8 0 Q 0 5 8 0 Q 0 -2 -8 0" fill="#6b1d1d" />
            <path d="M -6 -1 Q 0 1 6 -1" stroke="#ffffff" strokeWidth="1" />
            <path d="M -9 0 Q 0 6 9 0 Q 0 -3 -9 0" fill="none" stroke="#be123c" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );
      case 'consonant': // /consonant/ - Compressed narrow lips
        return (
          <g transform="translate(100, 77)">
            <line x1="-7" y1="2" x2="7" y2="2" stroke="#be123c" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="-5" y1="2" x2="5" y2="2" stroke="#fda4af" strokeWidth="0.6" strokeLinecap="round" />
          </g>
        );
      case 'idle':
      default: // Soft, warm smile
        return (
          <g transform="translate(100, 77)">
            {/* Upper lip shadow */}
            <path d="M -8 1 Q 0 4 8 1" fill="none" stroke="#9f1239" strokeWidth="1" opacity="0.3" />
            {/* Smile line */}
            <path d="M -8 1 Q 0 5 8 1" fill="none" stroke="#be123c" strokeWidth="1.5" strokeLinecap="round" />
            {/* Soft dimple dots */}
            <circle cx="-10" cy="0" r="0.5" fill="#be123c" opacity="0.6" />
            <circle cx="10" cy="0" r="0.5" fill="#be123c" opacity="0.6" />
          </g>
        );
    }
  };

  // State-driven limb coordinate paths
  // Left arm paths
  const leftArmD = isGesturing
    ? "M 64 125 C 35 125, 25 150, 42 170" // Gesturing out
    : "M 64 125 C 48 145, 42 185, 48 200"; // Resting or holding book

  // Right arm paths (IK pointing or writing target simulation)
  const rightArmD = isWriting
    ? "M 136 125 C 145 100, 175 75, 188 62" // Reaching whiteboard
    : isPointing
    ? "M 136 125 C 155 110, 175 92, 190 82" // Pointing high
    : isGesturing
    ? "M 136 125 C 160 130, 170 155, 154 175" // Gesturing
    : "M 136 125 C 152 145, 158 185, 152 205"; // Relaxed by side

  return (
    <svg
      id="instructor-aarya-avatar"
      viewBox="0 0 200 300"
      className="w-full h-full drop-shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Skin Tone Gradient: Warm golden olive Indian complexion */}
        <linearGradient id="skinTone" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="40%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.45" />
        </linearGradient>

        {/* Cardigan Fabric Gradient: Professional Dark Navy Cardigan */}
        <linearGradient id="cardiganBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="50%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>

        {/* Kurta Printed Motif Pattern: Beautiful traditional Indian print from the photo */}
        <pattern id="kurtaPattern" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#f0fdf4" />
          <circle cx="6" cy="6" r="1.5" fill="#1e40af" />
          <path d="M 6 1 L 11 6 L 6 11 L 1 6 Z" fill="none" stroke="#60a5fa" strokeWidth="0.5" />
          <circle cx="6" cy="1" r="0.8" fill="#1e40af" />
          <circle cx="6" cy="11" r="0.8" fill="#1e40af" />
        </pattern>

        {/* Traditional Gold Borders (Zari embroidery) */}
        <linearGradient id="zariGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Hair shading */}
        <linearGradient id="hairDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#090d16" />
        </linearGradient>

        {/* Eye makeup shading */}
        <linearGradient id="kohlEyeliner" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Soft blush radial gradient */}
        <radialGradient id="blush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
        </radialGradient>

        {/* Dynamic Glow Filters for writing sparks */}
        <filter id="chalkSparkGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Ambient breathing Ground Shadow */}
      <motion.ellipse 
        cx="100" 
        cy="288" 
        rx="42" 
        ry="7" 
        fill="#000000" 
        fillOpacity="0.15"
        animate={{
          rx: isWalking ? [36, 44, 36] : [42, 45, 42],
          fillOpacity: isWalking ? [0.18, 0.12, 0.18] : [0.15, 0.12, 0.15]
        }}
        transition={{
          duration: isWalking ? 0.6 : 3.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* 2. Master skeletal torso & head assembly with breathing idle animations */}
      <motion.g
        id="aarya-skeleton"
        animate={{
          y: isWalking ? [0, -5, 0, -5, 0] : (isSpeaking ? [0, -2, 0] : [0, -3.5, 0]),
          x: isFacingBoard ? [-4, -4, -4] : (isSpeaking ? [0, 0.8, -0.8, 0] : [0, 0, 0])
        }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: isWalking ? 0.6 : (isSpeaking ? 2.0 : 3.5),
          ease: "easeInOut",
        }}
      >
        {/* A. Professional Kurta Skirt with elegant prints */}
        <g id="sari-skirt" className="cursor-pointer">
          <path 
            d="M 62 170 L 138 170 L 148 285 L 52 285 Z" 
            fill="url(#kurtaPattern)" 
            stroke="#1e3a8a" 
            strokeWidth="0.8" 
          />
          {/* Cardigan drape overlay on sides */}
          <path d="M 52 285 L 68 170 L 62 170 L 52 285 Z" fill="url(#cardiganBlue)" />
          <path d="M 148 285 L 132 170 L 138 170 L 148 285 Z" fill="url(#cardiganBlue)" />
          
          {/* Elegant traditional silver/gold border */}
          <path d="M 52 280 L 148 280 L 149 285 L 51 285 Z" fill="url(#zariGold)" />
        </g>

        {/* B. Symmetrical Elegant Torso (Open Cardigan & Printed Kurta) */}
        <g id="sari-torso">
          {/* Printed Kurta showing in the middle */}
          <path d="M 76 110 L 124 110 L 120 172 L 80 172 Z" fill="url(#kurtaPattern)" stroke="#1e3a8a" strokeWidth="0.5" />
          
          {/* Cardigan Left Flap */}
          <path d="M 64 110 L 82 110 L 86 172 L 68 172 Z" fill="url(#cardiganBlue)" />
          {/* Cardigan Right Flap */}
          <path d="M 118 110 L 136 110 L 114 172 L 132 172 Z" fill="url(#cardiganBlue)" />
          
          {/* Warm neck base */}
          <path d="M 88 100 L 112 100 L 106 122 L 94 122 Z" fill="url(#skinTone)" />
          <path d="M 94 105 C 100 110, 100 110, 106 105" fill="none" stroke="#e0a96d" strokeWidth="0.8" opacity="0.5" />
          
          {/* Golden Mangalsutra/Traditional Indian Necklace */}
          <path d="M 89 110 Q 100 126 111 110" fill="none" stroke="url(#zariGold)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="100" cy="118" r="2" fill="#0f172a" stroke="url(#zariGold)" strokeWidth="0.5" />
          <circle cx="98" cy="117" r="0.8" fill="#fbbf24" />
          <circle cx="102" cy="117" r="0.8" fill="#fbbf24" />
        </g>

        {/* C. Interactive Left Arm with Mudra gesture or Teacher's book */}
        <g id="aarya-left-arm">
          <motion.path
            d={leftArmD}
            stroke="url(#skinTone)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
            animate={{ d: leftArmD }}
            transition={{ type: "spring", stiffness: 70, damping: 15 }}
          />
          {/* Cardigan sleeve band */}
          <motion.path
            d={leftArmD.split(' ').slice(0, 5).join(' ')} // first section of curve
            stroke="url(#cardiganBlue)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Gold Sleeve border */}
          <motion.path
            d={leftArmD.split(' ').slice(0, 5).join(' ')}
            stroke="url(#zariGold)"
            strokeWidth="2.5"
            fill="none"
          />

          {/* Traditional Gold bangles on left wrist */}
          <g transform="translate(43, 172)">
            <ellipse cx="0" cy="0" rx="3" ry="1.5" fill="none" stroke="url(#zariGold)" strokeWidth="1" transform="rotate(-15)" />
            <ellipse cx="0" cy="2" rx="3" ry="1.5" fill="none" stroke="#be123c" strokeWidth="0.8" transform="rotate(-15)" />
            <ellipse cx="0" cy="4" rx="3" ry="1.5" fill="none" stroke="url(#zariGold)" strokeWidth="1" transform="rotate(-15)" />
          </g>

          {/* Left hand holding an elegant tablet/NCERT book */}
          {!isGesturing && (
            <g transform="translate(34, 182) rotate(10)">
              {/* Textbook casing */}
              <rect x="0" y="0" width="22" height="30" rx="2" fill="#1e3a8a" stroke="#172554" strokeWidth="1" />
              {/* Golden emblem/Math print */}
              <rect x="3" y="3" width="16" height="24" rx="1" fill="#eff6ff" opacity="0.9" />
              <text x="11" y="14" fill="#1e3a8a" fontSize="6.5" fontWeight="bold" textAnchor="middle">f(x)</text>
              <line x1="5" y1="20" x2="17" y2="20" stroke="#1e3a8a" strokeWidth="0.8" />
              <line x1="5" y1="23" x2="14" y2="23" stroke="#1e3a8a" strokeWidth="0.8" />
              {/* Hand holding book fingers */}
              <path d="M -3 12 C -1 12, 1 14, 1 17 C 1 20, -2 22, -4 22" fill="url(#skinTone)" stroke="#e0a96d" strokeWidth="0.5" />
            </g>
          )}

          {/* Elegant active gesture fingers (if gesturing) */}
          {isGesturing && (
            <g transform="translate(42, 170) rotate(-10)">
              <circle cx="0" cy="0" r="2.5" fill="url(#skinTone)" />
              {/* Fluttering fingers */}
              <path d="M 0 0 C 3 -2, 6 -1, 7 -3" fill="none" stroke="url(#skinTone)" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M 0 1 C 4 1, 7 3, 8 1" fill="none" stroke="url(#skinTone)" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M 0 2 C 3 3, 6 6, 7 4" fill="none" stroke="url(#skinTone)" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          )}
        </g>

        {/* D. Interactive Right Arm: Chalk/Stylus writing engine & IK Pointing */}
        <g id="aarya-right-arm">
          <motion.path
            d={rightArmD}
            stroke="url(#skinTone)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
            animate={{ d: rightArmD }}
            transition={{ type: "spring", stiffness: 70, damping: 15 }}
          />
          {/* Cardigan sleeve */}
          <motion.path
            d={rightArmD.split(' ').slice(0, 5).join(' ')}
            stroke="url(#cardiganBlue)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <motion.path
            d={rightArmD.split(' ').slice(0, 5).join(' ')}
            stroke="url(#zariGold)"
            strokeWidth="2.5"
            fill="none"
          />

          {/* Wrist glass bangles */}
          <g transform="translate(152, 172)">
            <ellipse cx="0" cy="0" rx="3" ry="1.5" fill="none" stroke="url(#zariGold)" strokeWidth="1" transform="rotate(15)" />
            <ellipse cx="0" cy="2" rx="3" ry="1.5" fill="none" stroke="#be123c" strokeWidth="0.8" transform="rotate(15)" />
            <ellipse cx="0" cy="4" rx="3" ry="1.5" fill="none" stroke="url(#zariGold)" strokeWidth="1" transform="rotate(15)" />
          </g>

          {/* HAND AT WRITING NODE */}
          {isWriting && (
            <motion.g 
              transform="translate(188, 62)"
              animate={{ 
                x: [186, 191, 187, 190, 186],
                y: [60, 64, 61, 63, 60]
              }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            >
              {/* Palm */}
              <circle cx="0" cy="0" r="3.5" fill="url(#skinTone)" />
              {/* Hand holding chalk/stylus */}
              <path d="M -3 -1 C -1 -3, 3 -3, 4 0 C 4 3, -1 4, -3 2" fill="url(#skinTone)" stroke="#e0a96d" strokeWidth="0.5" />
              
              {/* Elegant white chalk / teacher's stylus */}
              <g transform="rotate(-30)">
                <rect x="-1" y="-8" width="2" height="10" fill="#ffffff" rx="0.5" stroke="#94a3b8" strokeWidth="0.5" />
                {/* Tracer point laser chalk dust sparks */}
                <motion.circle 
                  cx="0" 
                  cy="-9" 
                  r="3.5" 
                  fill="#fef08a" 
                  filter="url(#chalkSparkGlow)"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 0.4 }}
                />
              </g>
            </motion.g>
          )}

          {/* HAND AT POINTING NODE */}
          {isPointing && (
            <g transform="translate(190, 82)">
              {/* Palm */}
              <circle cx="0" cy="0" r="3" fill="url(#skinTone)" />
              {/* Extended Index finger pointing directly to blackboard */}
              <path d="M 0 -1 L 7 -4" stroke="url(#skinTone)" strokeWidth="1.8" strokeLinecap="round" />
              {/* Resting fingers */}
              <path d="M -1 1 C 1 2, 2 3, 1 4" stroke="url(#skinTone)" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Laser pointing pointer spark */}
              <motion.circle 
                cx="8" 
                cy="-4.5" 
                r="4" 
                fill="#fda4af" 
                filter="url(#chalkSparkGlow)"
                animate={{ scale: [1, 1.6, 1] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
              <circle cx="8" cy="-4.5" r="1.5" fill="#ffffff" />
            </g>
          )}

          {/* NORMAL IDLE HAND */}
          {!isWriting && !isPointing && (
            <g transform="translate(152, 205)">
              <circle cx="0" cy="0" r="3" fill="url(#skinTone)" />
              {/* Graceful human relaxed fingers */}
              <path d="M -1 2 C -1 4, 0 6, 0 8" fill="none" stroke="url(#skinTone)" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M 1 2 C 1 4, 2 6, 2 8" fill="none" stroke="url(#skinTone)" strokeWidth="1" strokeLinecap="round" />
              <path d="M 2 1 C 3 3, 4 5, 4 7" fill="none" stroke="url(#skinTone)" strokeWidth="0.8" strokeLinecap="round" />
            </g>
          )}
        </g>

        {/* E. Symmetrical Realistic Indian Head & Facial Expression Assembly */}
        <motion.g
          id="aarya-head"
          animate={
            isFacingBoard 
              ? { rotate: 10, x: -3, y: 1 } 
              : isSpeaking 
                ? { y: [0, -1.8, 0, -1.0, 0], rotate: [0, 1.2, -1.2, 0.8, 0] } 
                : { rotate: 0, x: 0, y: 0 }
          }
          transition={
            isSpeaking 
              ? { repeat: Infinity, duration: 1.8, ease: "easeInOut" } 
              : { type: "spring", stiffness: 90 }
          }
        >
          {/* Ear on the left (visible in 3/4 turn) */}
          <path d="M 70 63 C 67 63, 67 73, 71 73 Z" fill="url(#skinTone)" stroke="#e0a96d" strokeWidth="0.5" />
          {/* Beautiful hanging Gold Jhumka Earring */}
          <g transform="translate(69, 71)">
            {/* Stud */}
            <circle cx="0" cy="0" r="1.5" fill="url(#zariGold)" />
            {/* Hanging thread with small beads */}
            <line x1="0" y1="0" x2="0" y2="6" stroke="url(#zariGold)" strokeWidth="0.8" />
            {/* Dome shaped Jhumka hanging */}
            <motion.path 
              d="M -3 6 C -3 6, -3 9, 0 9 C 3 9, 3 6, 3 6 Z" 
              fill="url(#zariGold)" 
              stroke="#b45309"
              strokeWidth="0.4"
              animate={{ rotate: isWalking ? [-8, 8, -8] : (isSpeaking ? [-5, 5, -5] : [-2, 2, -2]) }}
              transition={{ repeat: Infinity, duration: isWalking ? 0.6 : (isSpeaking ? 0.9 : 2.5), ease: "easeInOut" }}
            />
            <circle cx="0" cy="10" r="0.6" fill="#be123c" />
          </g>

          {/* Right Ear */}
          <path d="M 130 63 C 133 63, 133 73, 129 73 Z" fill="url(#skinTone)" stroke="#e0a96d" strokeWidth="0.5" />
          {/* Right Jhumka Earring */}
          <g transform="translate(131, 71)">
            <circle cx="0" cy="0" r="1.5" fill="url(#zariGold)" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="url(#zariGold)" strokeWidth="0.8" />
            <motion.path 
              d="M -3 6 C -3 6, -3 9, 0 9 C 3 9, 3 6, 3 6 Z" 
              fill="url(#zariGold)" 
              stroke="#b45309"
              strokeWidth="0.4"
              animate={{ rotate: isWalking ? [8, -8, 8] : (isSpeaking ? [5, -5, 5] : [2, -2, 2]) }}
              transition={{ repeat: Infinity, duration: isWalking ? 0.6 : (isSpeaking ? 0.9 : 2.5), ease: "easeInOut" }}
            />
            <circle cx="0" cy="10" r="0.6" fill="#be123c" />
          </g>

          {/* Base Face oval structure */}
          <ellipse cx="100" cy="62" rx="27" ry="24" fill="url(#skinTone)" stroke="#e0a96d" strokeWidth="0.8" />

          {/* Soft blushed cheeks */}
          <ellipse cx="80" cy="68" rx="6" ry="4" fill="url(#blush)" />
          <ellipse cx="120" cy="68" rx="6" ry="4" fill="url(#blush)" />

          {/* FLAWLESS EYE COHL Kohl-rimmed Almond Eyes */}
          {/* Left Eye */}
          <g id="aarya-left-eye">
            {/* White Sclera background */}
            <path d="M 79 61 Q 86 56 93 61 Q 86 64 79 61 Z" fill="#ffffff" />
            
            {/* Dark warm iris */}
            <circle cx="86" cy="60.5" r="3" fill="#1e293b" />
            <circle cx="85.2" cy="59.7" r="0.9" fill="#ffffff" /> {/* Eye light reflection */}

            {/* Kohl rich dark eyeliner eyelashes contour */}
            <path d="M 78 61 Q 86 54 94 61" fill="none" stroke="url(#kohlEyeliner)" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 78 61 Q 86 65 94 61" fill="none" stroke="url(#kohlEyeliner)" strokeWidth="0.8" />

            {/* Sharp elegant eyebrow */}
            <motion.path 
              d="M 77 54 Q 85 49 93 54" 
              fill="none" 
              stroke="#090d16" 
              strokeWidth="1.8" 
              strokeLinecap="round"
              animate={{ y: isSpeaking ? [-1.2, 0.4, -1.2] : 0 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            />

            {/* Interactive Blinking Overlay lid */}
            {isBlinking && (
              <path d="M 77.5 59.5 Q 86 65.5 94.5 59.5" fill="url(#skinTone)" stroke="url(#kohlEyeliner)" strokeWidth="2.5" strokeLinecap="round" />
            )}
          </g>

          {/* Right Eye */}
          <g id="aarya-right-eye">
            <path d="M 107 61 Q 114 56 121 61 Q 114 64 107 61 Z" fill="#ffffff" />
            <circle cx="114" cy="60.5" r="3" fill="#1e293b" />
            <circle cx="113.2" cy="59.7" r="0.9" fill="#ffffff" />

            <path d="M 106 61 Q 114 54 122 61" fill="none" stroke="url(#kohlEyeliner)" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 106 61 Q 114 65 122 61" fill="none" stroke="url(#kohlEyeliner)" strokeWidth="0.8" />

            {/* Sharp elegant eyebrow */}
            <motion.path 
              d="M 107 54 Q 115 49 123 54" 
              fill="none" 
              stroke="#090d16" 
              strokeWidth="1.8" 
              strokeLinecap="round"
              animate={{ y: isSpeaking ? [-1.2, 0.4, -1.2] : 0 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.1 }}
            />

            {isBlinking && (
              <path d="M 105.5 59.5 Q 114 65.5 122.5 59.5" fill="url(#skinTone)" stroke="url(#kohlEyeliner)" strokeWidth="2.5" strokeLinecap="round" />
            )}
          </g>

          {/* Traditional crimson velvet Bindi (Centered on forehead) */}
          <circle cx="100" cy="51" r="2.2" fill="#be123c" />
          <circle cx="100" cy="51" r="0.8" fill="#fbbf24" opacity="0.8" />

          {/* Soft human nose contour */}
          <path d="M 98 59 L 100 68 L 102 68" fill="none" stroke="#e0a96d" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Subtle gold nose pin (Nath) on her left nostril */}
          <circle cx="103" cy="67.5" r="0.6" fill="url(#zariGold)" />
          <circle cx="103" cy="67.5" r="0.2" fill="#ffffff" />

          {/* Symmetrical Animated Mouth (Lip Sync) */}
          {renderHumanMouth()}
        </motion.g>

        {/* F. Elegant Hair styling (Front partitions, flowing side strands, and a gorgeous long braid draping her shoulder) */}
        <g id="aarya-hair">
          {/* Long dark hair braid draped beautifully over her left shoulder (from photo) */}
          <g id="aarya-long-braid">
            {/* Smooth cascading braid segments */}
            <path 
              d="M 74 60 C 70 75, 62 90, 58 110 C 55 125, 58 140, 64 155 C 68 165, 68 175, 62 195 L 58 220" 
              fill="none" 
              stroke="url(#hairDark)" 
              strokeWidth="11" 
              strokeLinecap="round" 
            />
            {/* Inner braid details/plaits texture */}
            <path 
              d="M 74 60 C 70 75, 62 90, 58 110 C 55 125, 58 140, 64 155 C 68 165, 68 175, 62 195" 
              fill="none" 
              stroke="#1e293b" 
              strokeWidth="2" 
              strokeDasharray="6,6" 
            />
            <path 
              d="M 74 60 Q 64 100 62 140 Q 60 180 58 220" 
              fill="none" 
              stroke="#334155" 
              strokeWidth="0.8" 
              opacity="0.5" 
            />
            {/* Cute gold/red hair band at the end of the braid */}
            <rect x="55" y="218" width="6" height="3" rx="0.5" fill="url(#zariGold)" />
            <circle cx="58" cy="224" r="1.5" fill="#e11d48" />
            <circle cx="56" cy="226" r="1" fill="#e11d48" />
            <circle cx="60" cy="226" r="1" fill="#e11d48" />
          </g>

          {/* Main head hair cap */}
          <path d="M 73 60 C 73 60, 71 39, 100 38 C 129 39, 127 60, 127 60 C 132 50, 129 44, 120 42 C 110 40, 90 40, 80 42 C 71 44, 68 50, 73 60 Z" fill="url(#hairDark)" />

          {/* Middle hairline partition (Sindoor line or pure partition) */}
          <path d="M 100 38 L 100 48" stroke="#1e293b" strokeWidth="1" />
          {/* Golden head jewelry (Maang Tikka) dangling in partition */}
          <path d="M 100 38 L 100 44" stroke="url(#zariGold)" strokeWidth="0.8" />
          <circle cx="100" cy="45" r="1.2" fill="#be123c" stroke="url(#zariGold)" strokeWidth="0.4" />

          {/* Left sweeping bangs */}
          <path d="M 100 42 C 88 42, 75 50, 74 62 C 76 56, 85 49, 100 47 Z" fill="url(#hairDark)" />
          {/* Right sweeping bangs */}
          <path d="M 100 42 C 112 42, 125 50, 126 62 C 124 56, 115 49, 100 47 Z" fill="url(#hairDark)" />

          {/* Delicate hair strands contouring the face */}
          <path d="M 73 61 C 72 65, 73 70, 75 74" fill="none" stroke="url(#hairDark)" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M 127 61 C 128 65, 127 70, 125 74" fill="none" stroke="url(#hairDark)" strokeWidth="0.8" strokeLinecap="round" />
        </g>
      </motion.g>
    </svg>
  );
}
