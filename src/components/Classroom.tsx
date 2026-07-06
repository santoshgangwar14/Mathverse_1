import React, { useState, useEffect, useRef } from 'react';
import { 
  Subject, Chapter, Lesson, LessonStep, BoardInstruction, 
  QuizItem, HomeworkItem, NoteItem, TranscriptLine, ResourceItem, TeacherState 
} from '../types';
import { 
  teacherService, boardService, quizService, homeworkService, 
  notesService, transcriptService, mockResources 
} from '../services/MockServices';
import TeacherView from './TeacherView';
import SmartBoardView from './SmartBoardView';
import { 
  Play, Pause, RotateCcw, Volume2, FastForward, CheckCircle2, 
  HelpCircle, Clipboard, FileText, Download, Award, ChevronRight, 
  ChevronLeft, BookOpen, Clock, Send, Star, Compass, PenTool, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClassroomProps {
  lesson: Lesson;
  chapter: Chapter;
  subject: Subject;
  onBackToChapter: () => void;
}

type TabType = 'transcript' | 'notes' | 'resources' | 'practice' | 'quiz' | 'homework';

export default function Classroom({ lesson, chapter, subject, onBackToChapter }: ClassroomProps) {
  // Navigation & Step Control States
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [progressPercent, setProgressPercent] = useState(0);

  // Dynamic Content States (fetched from Service Layer)
  const [teacherState, setTeacherState] = useState<TeacherState>({
    currentAction: 'idle',
    speechText: '',
    emotion: 'smiling',
    facing: 'audience'
  });
  const [boardInstructions, setBoardInstructions] = useState<BoardInstruction[]>([]);
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);

  // Interactive user actions inside tabs
  const [activeTab, setActiveTab] = useState<TabType>('transcript');
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedQuizIdx, setSelectedQuizIdx] = useState<number>(0);
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<string, number>>({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState<Record<string, boolean>>({});
  const [userHomeworkAnswers, setUserHomeworkAnswers] = useState<Record<string, Record<string, string>>>({});
  const [practiceAnswerInput, setPracticeAnswerInput] = useState('');
  const [practiceResult, setPracticeResult] = useState<'correct' | 'incorrect' | 'idle'>('idle');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = lesson.steps;
  const currentStep = steps[currentStepIndex] || null;

  // Initialize data for lesson
  useEffect(() => {
    if (steps.length > 0) {
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
    // Fetch quizzes & homework
    quizService.getQuizzes(subject.id).then(setQuizzes);
    homeworkService.getHomework(subject.id).then(setHomeworkList);
  }, [lesson, subject]);

  // Load state whenever step changes
  useEffect(() => {
    if (!currentStep) return;

    // 1. Fetch Teacher speech & poses
    teacherService.getTeacherState(lesson.id, currentStep.id).then(setTeacherState);

    // 2. Fetch Board instructions
    boardService.getBoardInstructions(lesson.id, currentStep.id).then(setBoardInstructions);

    // 3. Fetch step transcript
    transcriptService.getTranscript(lesson.id, currentStep.id).then(setTranscriptLines);

    // 4. Fetch notes
    notesService.getNotes(lesson.id).then(setNotes);

    // 5. Update progress timeline
    setProgressPercent(((currentStepIndex + 1) / steps.length) * 100);

    // Auto-switch tabs to maximize visual focus
    if (currentStep.type === 'quiz') {
      setActiveTab('quiz');
    } else if (currentStep.type === 'practice') {
      setActiveTab('practice');
    } else if (currentStep.type === 'homework') {
      setActiveTab('homework');
    } else {
      setActiveTab('transcript');
    }

    // Reset practice inputs for new practice steps
    setPracticeAnswerInput('');
    setPracticeResult('idle');

  }, [currentStepIndex, lesson]);

  // No autoplay or voice simulation timer (self-paced interactive learning)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleResetLecture = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  // Add Dynamic Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const timeFormatted = `00:${(currentStepIndex * 15).toString().padStart(2, '0')}`;
    const newNote = await notesService.addNote(lesson.id, lesson.name, newNoteText, timeFormatted);
    setNotes(prev => [...prev, newNote]);
    setNewNoteText('');
  };

  // Toggle Bookmark
  const handleToggleBookmark = async (id: string) => {
    await notesService.toggleBookmark(id);
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isBookmarked: !n.isBookmarked } : n));
  };

  // Delete Note
  const handleDeleteNote = async (id: string) => {
    await notesService.deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // Submit CBSE POP Quiz Answer
  const handleQuizAnswer = (quizId: string, optionIdx: number) => {
    setUserQuizAnswers(prev => ({ ...prev, [quizId]: optionIdx }));
    setSubmittedQuizzes(prev => ({ ...prev, [quizId]: true }));
  };

  // Submit Interactive Practice Math Task
  const handleSubmitPractice = () => {
    const val = practiceAnswerInput.trim().replace(/\s+/g, '');
    // Correct answers mapping for CBSE NCERT examples
    const isCorrect = val === '-7/2' || val === '3:8' || val === '5x-4x^2+3';
    setPracticeResult(isCorrect ? 'correct' : 'incorrect');
  };

  // Submit Homework Sheets
  const handleHomeworkSubmit = async (hwId: string) => {
    const answers = userHomeworkAnswers[hwId] || {};
    const success = await homeworkService.submitHomework(hwId, answers);
    if (success) {
      // Re-fetch homework to update status
      homeworkService.getHomework(subject.id).then(setHomeworkList);
    }
  };

  const handleHwAnswerChange = (hwId: string, qId: string, value: string) => {
    setUserHomeworkAnswers(prev => ({
      ...prev,
      [hwId]: {
        ...(prev[hwId] || {}),
        [qId]: value
      }
    }));
  };

  return (
    <div id="classroom-layout" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-all">
      {/* Classroom Header */}
      <header className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBackToChapter}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
                {subject.name} • {chapter.name}
              </span>
            </div>
            <h1 className="text-lg font-black text-slate-800 dark:text-white mt-0.5">
              {lesson.name}
            </h1>
          </div>
        </div>

        {/* Live Batch Info */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Classroom Teacher</span>
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">Aarya Mam (CBSE Class 9)</h5>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-500 to-teal-600 flex items-center justify-center text-white text-xs font-extrabold shadow">
            A9
          </div>
        </div>
      </header>

      {/* Main Container: Left-Teacher | Center-Board | Right-Tabs */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        
        {/* Left Side: Teacher Area (Podium / Left of Board) */}
        <div className="lg:col-span-3 flex flex-col justify-end bg-gradient-to-t from-slate-100 to-white dark:from-slate-900 dark:to-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 min-h-[300px] h-full shadow-inner relative">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-slate-950/20 text-xs px-2.5 py-1 rounded-full text-slate-500 font-semibold dark:text-slate-400">
            <Compass className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} /> Live Podium
          </div>
          <TeacherView teacherState={teacherState} />
        </div>

        {/* Center: Smart Board & Timeline */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Smart Board Wrapper */}
          <div className="flex-1 min-h-[350px]">
            <SmartBoardView boardInstructions={boardInstructions} subjectId={subject.id} />
          </div>

          {/* Lesson Steps Timeline */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Lecture Timeline
              </span>
              <span>Step {currentStepIndex + 1} of {steps.length}</span>
            </div>

            {/* Timesteps Indicator */}
            <div className="flex items-center gap-2">
              {steps.map((step, idx) => {
                const isActive = idx === currentStepIndex;
                const isPassed = idx < currentStepIndex;
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      setCurrentStepIndex(idx);
                      setIsPlaying(false);
                    }}
                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                      isActive 
                        ? 'bg-indigo-600 dark:bg-indigo-400' 
                        : isPassed 
                        ? 'bg-indigo-100 dark:bg-indigo-900/40' 
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                    title={step.title}
                  />
                );
              })}
            </div>

            {/* Current step meta */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {currentStep?.title} <span className="text-[10px] font-medium text-slate-400">({currentStep?.duration})</span>
              </span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                {currentStep?.type}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Tabbed Panel Container */}
        <div className="lg:col-span-3 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Tabs selector */}
          <div className="flex items-center border-b border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none bg-slate-50/50 dark:bg-slate-900/50 p-2 gap-1.5">
            {(['transcript', 'notes', 'resources', 'practice', 'quiz', 'homework'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-bold capitalize rounded-lg transition-all shrink-0 cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Active Tab Panel Content */}
          <div className="flex-1 p-5 overflow-y-auto max-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
              >
                {/* 1. Transcript Tab */}
                {activeTab === 'transcript' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Hinglish Lecture Transcript</h3>
                    <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                      {transcriptLines.map((line) => (
                        <div key={line.id} className="flex gap-3">
                          <span className="text-[10px] font-mono text-slate-400 mt-1">{line.time}</span>
                          <div>
                            <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 block uppercase">
                              {line.speaker} Mam
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-0.5">
                              {line.text}
                            </p>
                          </div>
                        </div>
                      ))}
                      {transcriptLines.length === 0 && (
                        <p className="text-xs text-slate-400">Class script loading...</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Notes Tab */}
                {activeTab === 'notes' && (
                  <div className="flex flex-col h-full space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Your Smart Notes</h3>
                    
                    {/* Add note input form */}
                    <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Write note at current timeline..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="flex-1 text-xs px-3 py-2 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                      <button 
                        type="submit" 
                        className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>

                    {/* Notes lists */}
                    <div className="space-y-3 overflow-y-auto max-h-[250px] pr-1">
                      {notes.map((note) => (
                        <div key={note.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 relative group">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-bold text-indigo-600 font-mono">
                              Timestamp: {note.timestamp}
                            </span>
                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-all">
                              <button 
                                onClick={() => handleToggleBookmark(note.id)}
                                className={`p-0.5 rounded ${note.isBookmarked ? 'text-amber-500' : 'text-slate-400'}`}
                              >
                                <Star className="w-3 h-3 fill-current" />
                              </button>
                              <button 
                                onClick={() => handleDeleteNote(note.id)}
                                className="p-0.5 rounded text-rose-500 hover:bg-rose-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                            {note.text}
                          </p>
                        </div>
                      ))}
                      {notes.length === 0 && (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          No notes added yet. Save your learnings here.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Resources Tab */}
                {activeTab === 'resources' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">NCERT Handouts & Downloads</h3>
                    <div className="space-y-3">
                      {mockResources.map((res) => (
                        <div key={res.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">
                              {res.title}
                            </h5>
                            <span className="text-[10px] text-slate-400">
                              {res.fileType.toUpperCase()} {res.fileSize ? `• ${res.fileSize}` : ''}
                            </span>
                          </div>
                          <a 
                            href={res.downloadUrl} 
                            onClick={(e) => e.preventDefault()} 
                            className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-700"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Practice Tab */}
                {activeTab === 'practice' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Interactive Concept Practice</h3>
                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl">
                      <span className="text-[9px] font-bold text-indigo-600 uppercase">ACTIVE LESSON TASK</span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-1 leading-relaxed">
                        {subject.id === 'maths' 
                          ? 'Evaluate p(x) = 5x - 4x² + 3 at x = -1' 
                          : 'Find the mass ratio of Ca and O in Calcium Oxide (CaO)'}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Solve this step in your notebook, then enter your final numeric/fraction value here.
                      </p>

                      <div className="mt-4 flex gap-2">
                        <input
                          type="text"
                          placeholder={subject.id === 'maths' ? "e.g. -7/2 or 3:8" : "e.g. 5:2"}
                          value={practiceAnswerInput}
                          onChange={(e) => setPracticeAnswerInput(e.target.value)}
                          className="flex-1 text-xs px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none"
                        />
                        <button 
                          onClick={handleSubmitPractice}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all cursor-pointer"
                        >
                          Check
                        </button>
                      </div>

                      {/* Immediate animated feedback */}
                      {practiceResult === 'correct' && (
                        <div className="mt-3 p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] text-emerald-800 flex items-center gap-1.5 animate-bounce">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Great Job! Correct CBSE explanation calculation.
                        </div>
                      )}
                      {practiceResult === 'incorrect' && (
                        <div className="mt-3 p-2 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-800 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-rose-600" /> Not quite right. Hint: Sub x = -1 carefully into p(-1). Try again!
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. Quiz Tab */}
                {activeTab === 'quiz' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white">Class Pop Quiz</h3>
                      <span className="text-[10px] font-bold text-slate-400">Card {selectedQuizIdx + 1} of {quizzes.length}</span>
                    </div>

                    {quizzes.length > 0 ? (
                      <div className="space-y-4">
                        {/* Quiz question card */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                            {quizzes[selectedQuizIdx].question}
                          </p>
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                          {quizzes[selectedQuizIdx].options.map((opt, oIdx) => {
                            const quizId = quizzes[selectedQuizIdx].id;
                            const isSubmitted = submittedQuizzes[quizId];
                            const selectedAnswer = userQuizAnswers[quizId];
                            const isCorrectAnswer = oIdx === quizzes[selectedQuizIdx].correctAnswerIndex;
                            
                            let btnStyle = 'border-slate-100 dark:border-slate-800 hover:border-slate-300';
                            if (isSubmitted) {
                              if (isCorrectAnswer) {
                                btnStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900';
                              } else if (selectedAnswer === oIdx) {
                                btnStyle = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900';
                              } else {
                                btnStyle = 'opacity-50 border-slate-100';
                              }
                            } else if (selectedAnswer === oIdx) {
                              btnStyle = 'bg-indigo-50 border-indigo-400 text-indigo-700';
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={isSubmitted}
                                onClick={() => handleQuizAnswer(quizId, oIdx)}
                                className={`w-full text-left p-3 text-xs rounded-xl border transition-all cursor-pointer font-medium leading-normal ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation block */}
                        {submittedQuizzes[quizzes[selectedQuizIdx].id] && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed"
                          >
                            <strong>NCERT Explanation:</strong> {quizzes[selectedQuizIdx].explanation}
                          </motion.div>
                        )}

                        {/* Toggle next quiz */}
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => setSelectedQuizIdx(prev => (prev + 1) % quizzes.length)}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline"
                          >
                            Next Question <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Loading Pop Quizzes...</p>
                    )}
                  </div>
                )}

                {/* 6. Homework Tab */}
                {activeTab === 'homework' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Active Class Homework</h3>
                    
                    {homeworkList.map((hw) => {
                      const isGraded = hw.status === 'graded';
                      const isSubmitted = hw.status === 'submitted';
                      const answers = userHomeworkAnswers[hw.id] || {};

                      return (
                        <div key={hw.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black tracking-wider uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                              Due: {hw.dueDate}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isGraded ? 'bg-emerald-100 text-emerald-800' : isSubmitted ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {hw.status.toUpperCase()}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-800 dark:text-white">{hw.title}</h4>

                          {/* Render questions inside homework */}
                          {!isGraded && !isSubmitted ? (
                            <div className="space-y-3 pt-2">
                              {hw.questions.map((q) => (
                                <div key={q.id} className="space-y-1.5">
                                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed block">
                                    {q.text}
                                  </label>
                                  <input
                                    type="text"
                                    placeholder={q.hint ? `Hint: ${q.hint}` : "Your calculation..."}
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleHwAnswerChange(hw.id, q.id, e.target.value)}
                                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none"
                                  />
                                </div>
                              ))}
                              <button
                                onClick={() => handleHomeworkSubmit(hw.id)}
                                className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all cursor-pointer"
                              >
                                Submit Homework to A.I.R.A.
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3 pt-2 text-xs text-slate-500">
                              <p className="flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 
                                {isGraded ? `Graded: ${hw.marks} / ${hw.totalMarks} Marks` : 'Successfully Submitted to A.I.R.A.!'}
                              </p>
                              {hw.teacherRemarks && (
                                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl mt-2 text-[11px] text-slate-600 leading-relaxed">
                                  <strong className="text-indigo-600 dark:text-indigo-400">A.I.R.A.\'s Remarks:</strong> "{hw.teacherRemarks}"
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </main>

      {/* Bottom Concept & Topic Controls Overlay */}
      <footer className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md z-20">
        
        {/* Previous / Next navigation */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-xs font-semibold cursor-pointer"
            title="Previous Topic"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev Concept
          </button>

          <button
            onClick={handleNextStep}
            disabled={currentStepIndex === steps.length - 1}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all text-xs font-semibold cursor-pointer"
            title="Next Topic"
          >
            Next Concept
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Concept Chips for manual slide exploration */}
        <div className="flex-1 w-full max-w-2xl overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-2 px-1">
            {steps.map((st, idx) => {
              const isActive = idx === currentStepIndex;
              return (
                <button
                  key={st.id}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 shadow-sm scale-105 font-semibold' 
                      : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${isActive ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                    {idx + 1}
                  </span>
                  {st.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Classroom progress indicator */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Classroom Index</span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Concept {currentStepIndex + 1} of {steps.length} ({Math.round(progressPercent)}% Explored)
            </span>
          </div>
        </div>

      </footer>
    </div>
  );
}
