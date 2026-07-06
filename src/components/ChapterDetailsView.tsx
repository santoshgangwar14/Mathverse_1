import React from 'react';
import { Subject, Chapter, Lesson } from '../types';
import { ChevronLeft, Clock, BookOpen, Award, CheckCircle2, Lock, PlayCircle, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface ChapterDetailsViewProps {
  subject: Subject;
  chapters: Chapter[];
  lessonsByChapter: Record<string, Lesson[]>;
  onBack: () => void;
  onSelectLesson: (lessonId: string, chapterId: string) => void;
}

export default function ChapterDetailsView({ 
  subject, chapters, lessonsByChapter, onBack, onSelectLesson 
}: ChapterDetailsViewProps) {

  // Helper to color coordinate badge
  const getDifficultyClass = (difficulty: Chapter['difficulty']) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900';
      case 'Hard':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-100 dark:border-rose-900';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900/40 dark:text-slate-400 border-slate-100';
    }
  };

  return (
    <div id="chapter-details-page" className="max-w-7xl mx-auto px-4 py-8">
      {/* Back button and title */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all mb-6 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Hero Header with Subject Colors */}
      <div className={`p-8 rounded-3xl relative overflow-hidden mb-10 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm`}>
        {/* Glow effect matching subject color */}
        <div 
          className="absolute -right-10 -top-10 w-44 h-44 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: subject.accentColor }} 
        />
        
        <div className="relative">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: subject.accentColor }}>
            CBSE NCERT CURRICULUM
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {subject.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
            {subject.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <BookOpen className="w-4 h-4 text-slate-400" /> {chapters.length} Chapters
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-slate-400" /> {subject.hoursCount} Hours study time
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Award className="w-4 h-4 text-slate-400" /> Class 9 CBSE NCERT Pattern
            </span>
          </div>
        </div>
      </div>

      {/* Chapters & Lessons layout */}
      <div className="space-y-10">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-indigo-500 fill-indigo-500" /> CBSE Syllabus Map
        </h2>

        {chapters.map((chapter) => {
          const lessons = lessonsByChapter[chapter.id] || [];
          
          return (
            <div 
              key={chapter.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              {/* Chapter Header Card */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                      {chapter.teacherName}'s Batch
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyClass(chapter.difficulty)}`}>
                      {chapter.difficulty} Level
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {chapter.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
                    {chapter.description}
                  </p>
                </div>

                {/* Progress Ring / Percentage */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Completed</span>
                    <h5 className="text-sm font-black text-slate-800 dark:text-white">
                      {chapter.completedCount}/{chapter.lessonsCount} Lessons
                    </h5>
                  </div>
                  <div className="w-12 h-12 relative flex items-center justify-center">
                    {/* SVG progress circle */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="3" fill="none" />
                      <circle cx="24" cy="24" r="20" stroke="currentColor" className="text-indigo-600 dark:text-indigo-400" strokeWidth="3" fill="none"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - chapter.progress / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{chapter.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Lesson Items inside Chapter */}
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {lessons.map((lesson) => {
                  const isLocked = lesson.status === 'locked';
                  const isCompleted = lesson.status === 'completed';
                  const isActive = lesson.status === 'active';

                  return (
                    <div 
                      key={lesson.id}
                      className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${isActive ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div className="mt-1">
                          {isCompleted && (
                            <div className="p-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-full text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                          )}
                          {isActive && (
                            <div className="p-1 bg-indigo-50 dark:bg-indigo-950/40 rounded-full text-indigo-600 dark:text-indigo-400 animate-pulse">
                              <PlayCircle className="w-5 h-5" />
                            </div>
                          )}
                          {isLocked && (
                            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
                              <Lock className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <h4 className={`text-md font-bold ${isLocked ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                            {lesson.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                            {lesson.description}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                            <span>Duration: {lesson.duration}</span>
                            <span>•</span>
                            <span>Interactive Whiteboard included</span>
                          </div>
                        </div>
                      </div>

                      {/* Launch/Locked Button */}
                      <div>
                        {isLocked ? (
                          <button 
                            disabled
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-not-allowed"
                          >
                            <Lock className="w-3.5 h-3.5" /> Locked
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectLesson(lesson.id, chapter.id)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow ${
                              isCompleted 
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                          >
                            {isCompleted ? 'Replay Class' : 'Enter Smart Classroom'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {lessons.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No lessons available under this chapter yet. Let's explore other chapters!
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
