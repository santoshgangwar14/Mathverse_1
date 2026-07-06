import React, { useState, useEffect } from 'react';
import { Subject, Chapter, Lesson } from './types';
import { 
  subjectService, chapterService, lessonService, progressService 
} from './services/MockServices';
import SubjectDashboard from './components/SubjectDashboard';
import ChapterDetailsView from './components/ChapterDetailsView';
import Classroom from './components/Classroom';
import { Moon, Sun, GraduationCap, Award, Compass, Sparkles } from 'lucide-react';

type ViewState = 'dashboard' | 'chapter_details' | 'classroom';

export default function App() {
  // Navigation & Route states
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('maths');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('math-ch2');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('les-maths-p3');

  // Core Data Lists
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessonsByChapter, setLessonsByChapter] = useState<Record<string, Lesson[]>>({});
  const [overallProgress, setOverallProgress] = useState({
    completedLessons: 0,
    totalLessons: 0,
    overallPercentage: 0,
    recentActivities: [] as Array<{ text: string; date: string }>
  });

  // Global Theme / Dark Mode (Accessibility Guidelines)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Initialize Core Services
  useEffect(() => {
    // Load subjects
    subjectService.getSubjects().then(setSubjects);
    
    // Load overall progress
    progressService.getOverallProgress().then(setOverallProgress);
  }, []);

  // Sync chapters and lessons when selected subject changes
  useEffect(() => {
    if (!selectedSubjectId) return;

    // Load chapters of selected subject
    chapterService.getChapters(selectedSubjectId).then(chList => {
      setChapters(chList);
      
      // Load lessons for each chapter
      const promises = chList.map(ch => 
        lessonService.getLessons(ch.id).then(lesList => ({
          chapterId: ch.id,
          lessons: lesList
        }))
      );

      Promise.all(promises).then(results => {
        const temp: Record<string, Lesson[]> = {};
        results.forEach(res => {
          temp[res.chapterId] = res.lessons;
        });
        setLessonsByChapter(temp);
      });
    });
  }, [selectedSubjectId]);

  // Dark Mode side effects
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Route Callbacks
  const handleSelectSubject = (id: string) => {
    setSelectedSubjectId(id);
    setCurrentView('chapter_details');
  };

  const handleSelectLesson = (lessonId: string, chapterId: string) => {
    setSelectedLessonId(lessonId);
    setSelectedChapterId(chapterId);
    setCurrentView('classroom');
  };

  // Find Active items to send to views
  const activeSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const activeChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0];
  const activeLesson = (lessonsByChapter[selectedChapterId] || []).find(l => l.id === selectedLessonId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Global SaaS App Bar */}
      <nav className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
        {/* Brand Name */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-all select-none"
        >
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
              MathVerse <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md">PRO</span>
            </h1>
          </div>
        </div>

        {/* Global Action controls */}
        <div className="flex items-center gap-4">
          
          {/* Quick CBSE details */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 px-3 py-1.5 rounded-full text-xs text-slate-500 dark:text-slate-300 font-semibold select-none">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> CBSE NCERT Class 9
          </div>

          {/* Dark Mode toggle (Accessibility) */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm"
            title="Toggle Accessibility Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </nav>

      {/* Main View Manager */}
      <div className="flex-1">
        {currentView === 'dashboard' && (
          <SubjectDashboard 
            subjects={subjects} 
            onSelectSubject={handleSelectSubject} 
            overallProgress={overallProgress} 
          />
        )}

        {currentView === 'chapter_details' && activeSubject && (
          <ChapterDetailsView 
            subject={activeSubject} 
            chapters={chapters} 
            lessonsByChapter={lessonsByChapter} 
            onBack={() => setCurrentView('dashboard')} 
            onSelectLesson={handleSelectLesson} 
          />
        )}

        {currentView === 'classroom' && activeLesson && activeChapter && activeSubject && (
          <Classroom 
            lesson={activeLesson} 
            chapter={activeChapter} 
            subject={activeSubject} 
            onBackToChapter={() => setCurrentView('chapter_details')} 
          />
        )}
      </div>

      {/* Premium Footer */}
      <footer className="py-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-400 select-none">
        <p>© 2026 MathVerse CBSE Learning Corp. Powered by smart-board-rendering and Aarya interactive teaching layers.</p>
      </footer>
    </div>
  );
}
