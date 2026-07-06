import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { TeacherState } from '../types';
import TeacherAnimation from './TeacherAnimation';
import { mediaService } from '../services/MockServices';

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

  // Track user interaction to guide them to click and satisfy browser autoplay security policies
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleInteraction = () => {
      setUserHasInteracted(true);
      // Resume speechSynthesis if it got stuck paused by browser policy
      if (window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
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

  const speakText = React.useCallback((text: string, useFallbackVoice: boolean = false) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Always cancel ongoing speech first to clear queue
    window.speechSynthesis.cancel();
    mediaService.stopSpeech();
    setIsSpeaking(false);

    if (isMuted || !text) return;

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
    mediaService.initAudio();
    mediaService.setSpatialPosition(-0.45); // Standing at the left podium
    mediaService.playSpeechPhrase(cleanText, 0.92);

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
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setIsSpeaking(false);
      mediaService.stopSpeech();
      
      // If first attempt failed and we weren't already using fallback, try once with the system default voice
      if (!useFallbackVoice && e.error !== 'interrupted') {
        setTimeout(() => {
          speakText(text, true);
        }, 100);
      }
    };

    window.speechSynthesis.speak(utterance);
    
    // Web Speech API buggy resume trigger for Chrome/Safari
    const resumeInterval = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.resume();
      } else {
        clearInterval(resumeInterval);
      }
    }, 1000);

  }, [isMuted]);

  // Run a short, friendly voice check
  const playTestSound = () => {
    if (isMuted) {
      setIsMuted(false);
      try {
        localStorage.setItem('mathverse_teacher_muted', 'false');
      } catch {}
    }
    setTimeout(() => {
      speakText("Namaste! My voice is working perfectly. Let's begin our NCERT math lesson today!");
    }, 100);
  };

  // Handle auto-speak on step changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      speakText(speechText);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined') {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        mediaService.stopSpeech();
      }
    };
  }, [speechText, speakText, voicesLoaded]);

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
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  A.I.R.A. Humanoid
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

      {/* Humanoid Robot Graphic Container */}
      <div className="w-44 h-72 sm:w-56 sm:h-96 relative flex items-end overflow-visible">
        <TeacherAnimation action={currentAction} emotion={emotion} facing={facing} isSpeaking={isSpeaking} />
      </div>
    </div>
  );
}
