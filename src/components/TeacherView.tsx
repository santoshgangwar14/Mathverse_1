import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { TeacherState } from '../types';
import TeacherAnimation from './TeacherAnimation';
import { mediaService } from '../services/MockServices';
// @ts-ignore
import teacherPhoto from '../assets/images/teacher_aarya_1783336454228.jpg';

interface TeacherViewProps {
  teacherState: TeacherState;
}

// Selects the best available educational or Indian accented voice
const getBestVoice = (): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  
  // 1. Look for hi-IN female voices
  const hiInFemale = voices.find(v => v.lang.toLowerCase() === 'hi-in' && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('heera')));
  if (hiInFemale) return hiInFemale;

  // 2. Look for any hi-IN voice
  const hiIn = voices.find(v => v.lang.toLowerCase() === 'hi-in');
  if (hiIn) return hiIn;

  // 3. Look for en-IN (Indian English) female voices
  const enInFemale = voices.find(v => v.lang.toLowerCase().startsWith('en-in') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('veena')));
  if (enInFemale) return enInFemale;

  // 4. Look for any en-IN voice
  const enIn = voices.find(v => v.lang.toLowerCase().startsWith('en-in'));
  if (enIn) return enIn;

  // 5. Look for any English female voice (Zira, Aria, Samantha, etc.)
  const enFemale = voices.find(v => v.lang.toLowerCase().startsWith('en-') && (v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('aria') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('hazel') || v.name.toLowerCase().includes('susan')));
  if (enFemale) return enFemale;

  // 6. Look for any English voice
  const enVoice = voices.find(v => v.lang.toLowerCase().startsWith('en-'));
  if (enVoice) return enVoice;

  return voices[0] || null;
};

export default function TeacherView({ teacherState }: TeacherViewProps) {
  const { currentAction, speechText, emotion, facing } = teacherState;

  const [isMuted, setIsMuted] = React.useState(() => {
    try {
      const saved = localStorage.getItem('mathverse_teacher_muted');
      return saved === 'true'; // persists user choice
    } catch {
      return false;
    }
  });

  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [voicesLoaded, setVoicesLoaded] = React.useState(false);
  const [userHasInteracted, setUserHasInteracted] = React.useState(false);
  const speechTimeoutRef = React.useRef<any>(null);
  const [avatarMode, setAvatarMode] = React.useState<'photo' | 'vector'>('vector');

  // Track user interaction to guide them to click and satisfy browser autoplay security policies
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleInteraction = () => {
      setUserHasInteracted(true);
      
      // Crucial: Initialize and resume Web Audio API context during user gesture
      try {
        mediaService.initAudio();
      } catch (err) {
        console.warn('Web Audio init error:', err);
      }
      
      // Resume speechSynthesis if it got stuck paused by browser policy
      if (window.speechSynthesis) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Bind to voices changed event to handle asynchronous voice loading
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    const handleVoicesChanged = () => {
      setVoicesLoaded(true);
    };
    
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    // Trigger initial check
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoicesLoaded(true);
    }
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speakText = React.useCallback((text: string, useFallbackVoice: boolean = false, forcePlay: boolean = false) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Always cancel ongoing speech first to clear queue
    window.speechSynthesis.cancel();
    mediaService.stopSpeech();
    setIsSpeaking(false);

    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    if (isMuted || !text) return;

    // VERY IMPORTANT: Defer automatic speech synthesis until the first user interaction 
    // to prevent browsers from permanently locking the Web Speech queue
    if (!userHasInteracted && !forcePlay) {
      console.log('Speech synthesis deferred until user interaction.');
      return;
    }

    // Ensure the synthesis engine is unpaused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Sanitize the text (remove brackets and special mathematical chars that shouldn't be read raw)
    const cleanText = text
      .replace(/[{}]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    // Trigger our spatial Web Audio API vocal engine to complement the narration
    try {
      mediaService.initAudio();
      mediaService.setSpatialPosition(-0.45); // Standing at the left podium
      mediaService.playSpeechPhrase(cleanText, 0.92);
    } catch (err) {
      console.warn('MediaService playSpeechPhrase error:', err);
    }

    // Activate mouth movement animation immediately so it's fully responsive to speech
    setIsSpeaking(true);

    // Calculate estimated talking duration as a safety fallback in case speechSynthesis events stall
    const wordsCount = cleanText.split(/\s+/).length;
    const estimatedDurationMs = Math.max(1800, (wordsCount * 460) + 1200);

    speechTimeoutRef.current = setTimeout(() => {
      setIsSpeaking(false);
      mediaService.stopSpeech();
    }, estimatedDurationMs);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (!useFallbackVoice) {
      const bestVoice = getBestVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
      }
    } else {
      console.log('Using standard browser fallback voice for maximum compatibility.');
    }

    // Configure friendly teacher acoustics
    utterance.rate = 0.92; // slightly slower pacing to capture Hinglish terminology comfortably
    utterance.pitch = 1.05; // clear and friendly pitch

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      mediaService.stopSpeech();
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      // Don't stop immediately if the speech was interrupted by a new step
      if (e.error !== 'interrupted') {
        setIsSpeaking(false);
        mediaService.stopSpeech();
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
          speechTimeoutRef.current = null;
        }

        // Try once with system default voice if first attempt failed and we weren't already using fallback
        if (!useFallbackVoice) {
          setTimeout(() => {
            speakText(text, true, forcePlay);
          }, 100);
        }
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Failed to call speak():', err);
    }
    
    // Web Speech API buggy resume trigger for Chrome/Safari
    const resumeInterval = setInterval(() => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.resume();
      } else {
        clearInterval(resumeInterval);
      }
    }, 1000);

  }, [isMuted, userHasInteracted]);

  // Run a short, friendly voice check
  const playTestSound = () => {
    if (isMuted) {
      setIsMuted(false);
      try {
        localStorage.setItem('mathverse_teacher_muted', 'false');
      } catch {}
    }
    setUserHasInteracted(true);
    try {
      mediaService.initAudio();
    } catch {}
    setTimeout(() => {
      speakText("Namaste! My voice is working perfectly. Let's begin our NCERT math lesson today!", false, true);
    }, 100);
  };

  // Handle auto-speak on step changes
  React.useEffect(() => {
    // Only speak automatically once the user has interacted to satisfy browser safety standards
    if (!userHasInteracted) return;

    const timer = setTimeout(() => {
      speakText(speechText);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      if (typeof window !== 'undefined') {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        mediaService.stopSpeech();
      }
    };
  }, [speechText, speakText, voicesLoaded, userHasInteracted]);

  const toggleMute = () => {
    setIsMuted(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem('mathverse_teacher_muted', String(newValue));
      } catch (e) {}
      
      if (newValue) {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        mediaService.stopSpeech();
        setIsSpeaking(false);
      } else {
        // Trigger speech immediately upon unmuting
        setTimeout(() => speakText(speechText), 50);
      }
      return newValue;
    });
  };

  return (
    <div id="teacher-container" className="relative flex flex-col items-center select-none h-full justify-end">
      {/* Premium speech bubble in Hinglish with Apple-like micro-shadows */}
      <AnimatePresence mode="wait">
        <motion.div
          key={speechText}
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.4, cubicBezier: [0.16, 1, 0.3, 1] }}
          className="absolute top-2 left-1/2 -translate-x-1/2 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 z-10"
        >
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 font-sans">
                  Aarya Mam
                  {isSpeaking && (
                    <span className="flex items-center gap-0.5 h-3 ml-1" title="Teacher is Speaking">
                      <motion.span animate={{ height: [4, 11, 4] }} transition={{ repeat: Infinity, duration: 0.4, ease: "easeInOut" }} className="w-0.5 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                      <motion.span animate={{ height: [6, 14, 6] }} transition={{ repeat: Infinity, duration: 0.3, ease: "easeInOut", delay: 0.08 }} className="w-0.5 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                      <motion.span animate={{ height: [2, 9, 2] }} transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut", delay: 0.15 }} className="w-0.5 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                    </span>
                  )}
                </span>
                
                <div className="flex items-center gap-1.5">
                  {/* Replay Speech */}
                  <button
                    onClick={() => speakText(speechText)}
                    className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                    title="Replay Voice"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* Mute Toggle */}
                  <button
                    onClick={toggleMute}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      isMuted 
                        ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30' 
                        : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    title={isMuted ? "Unmute Teacher Voice" : "Mute Teacher Voice"}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>

                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/60 px-1.5 py-0.5 rounded-md">
                    LIVE
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed font-sans">
                "{speechText}"
              </p>

              {!userHasInteracted && (
                <div className="mt-2.5 p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/40 text-[10px] text-amber-800 dark:text-amber-200 font-semibold flex items-center justify-between gap-1.5">
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    Tap anywhere on the screen to enable narration
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserHasInteracted(true);
                      playTestSound();
                    }}
                    className="underline text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 cursor-pointer whitespace-nowrap px-1"
                  >
                    Test Sound
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 dark:bg-slate-900/95 border-r border-b border-slate-100 dark:border-slate-800 rotate-45" />
        </motion.div>
      </AnimatePresence>

      {/* Teacher Avatar Container with Multi-Mode Toggle */}
      <div className="w-44 h-72 sm:w-56 sm:h-96 relative flex flex-col justify-end items-center overflow-visible group/container">
        {/* Toggle between Photorealistic Portrait and Interactive 2D Vector Avatar */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 flex bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-full border border-slate-200/80 dark:border-slate-800 shadow-lg text-[9px] font-bold text-slate-700 dark:text-slate-200 transition-all duration-300 pointer-events-auto whitespace-nowrap scale-95 hover:scale-100 opacity-90 group-hover/container:opacity-100">
          <button 
            type="button"
            onClick={() => setAvatarMode('photo')}
            className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${avatarMode === 'photo' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            📸 Live Photo
          </button>
          <button 
            type="button"
            onClick={() => setAvatarMode('vector')}
            className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${avatarMode === 'vector' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            👤 2D Avatar
          </button>
        </div>

        {avatarMode === 'photo' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex flex-col justify-end shadow-xl relative"
          >
            {/* Photorealistic Stream Background Image */}
            <motion.img 
              src={teacherPhoto} 
              alt="Aarya Mam - NCERT Math Educator" 
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
              referrerPolicy="no-referrer"
              animate={
                isSpeaking 
                  ? { y: [0, -1.8, 0, -1.0, 0], scale: [1, 1.018, 1, 1.01, 1] } 
                  : { y: [0, -3.0, 0], scale: [1, 1.005, 1] }
              }
              transition={{
                repeat: Infinity,
                duration: isSpeaking ? 1.8 : 3.5,
                ease: "easeInOut"
              }}
            />
            
            {/* Vignette & Gradient Shadows over the photo */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 pointer-events-none" />
            
            {/* Dynamic Status / Floating Indicator */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[8px] font-bold text-white uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </div>

            {/* Speaking Status Tag */}
            {isSpeaking && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-indigo-600/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[8px] font-bold text-white uppercase tracking-wider shadow-sm animate-bounce">
                Speaking
              </div>
            )}

            {/* Live Audio Waveform Overlay at bottom of the photo */}
            <div className="absolute inset-x-0 bottom-0 bg-slate-950/85 backdrop-blur-md px-3.5 py-2.5 border-t border-white/10 flex flex-col gap-1 z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-300 tracking-wider uppercase font-sans">
                  Aarya Mam
                </span>
                <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-900/40">
                  {isSpeaking ? "AUDIO ACTIVE" : "IDLE"}
                </span>
              </div>
              
              {/* Audio spectrum bar waves */}
              <div className="flex items-end gap-1 h-3.5 mt-0.5">
                {Array.from({ length: 18 }).map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{
                      height: isSpeaking ? [3, Math.random() * 12 + 3, 3] : 3
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.25 + Math.random() * 0.35,
                      ease: "easeInOut"
                    }}
                    className="flex-1 bg-gradient-to-t from-indigo-500 via-indigo-400 to-sky-300 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <TeacherAnimation action={currentAction} emotion={emotion} facing={facing} isSpeaking={isSpeaking} />
        )}
      </div>
    </div>
  );
}
