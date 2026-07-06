import React from 'react';
import { Subject } from '../types';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';

interface SubjectDashboardProps {
  subjects: Subject[];
  onSelectSubject: (id: string) => void;
  overallProgress: {
    completedLessons: number;
    totalLessons: number;
    overallPercentage: number;
    recentActivities: Array<{ text: string; date: string }>;
  };
}

export default function SubjectDashboard({ subjects, onSelectSubject, overallProgress }: SubjectDashboardProps) {
  // Helper to dynamically get Lucide icons
  const renderIcon = (iconName: string, className: string) => {
    const IconComponent = (Icons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return <Icons.BookOpen className={className} />;
  };

  return (
    <div id="subject-dashboard" className="max-w-7xl mx-auto px-4 py-8">
      {/* Premium CBSE Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            CBSE Digital Smart School
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Namaste, Class 9 Student!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-xl">
            Welcome back to your premium smart classroom. Re-live your CBSE NCERT concepts with interactive boards and Aarya mam's explanations.
          </p>
        </div>

        {/* Global Progress Widget */}
        <div className="flex items-center gap-5 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm min-w-[280px]">
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* SVG Circle progress */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="4" fill="none" />
              <circle cx="28" cy="28" r="24" stroke="currentColor" className="text-indigo-600 dark:text-indigo-400" strokeWidth="4" fill="none"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - overallProgress.overallPercentage / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-sm font-black text-slate-800 dark:text-white">{overallProgress.overallPercentage}%</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Global Progress</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {overallProgress.completedLessons} of {overallProgress.totalLessons} Lessons
            </h4>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5 block">
              Keep it up! CBSE Boards are near
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Subjects & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Subject Cards Section */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Icons.Layers className="w-5 h-5 text-indigo-500" /> Choose Your Subject
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {subjects.map((sub, idx) => (
              <motion.div
                key={sub.id}
                whileHover={{ y: -4, scale: 1.01 }}
                className={`flex flex-col justify-between p-6 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-900 shadow-sm border-slate-100 dark:border-slate-800 hover:shadow-md`}
                onClick={() => onSelectSubject(sub.id)}
              >
                <div>
                  {/* Subject icon in colored container */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800 ${sub.bgColor}`}>
                    {renderIcon(sub.icon, `w-6 h-6`)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                    {sub.description}
                  </p>
                </div>

                {/* Progress bar and metadata */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs font-semibold mb-2 text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Icons.BookMarked className="w-3.5 h-3.5 opacity-60" /> {sub.chaptersCount} Chapters
                    </span>
                    <span>{sub.progress}% Complete</span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${sub.progress}%`,
                        backgroundColor: sub.accentColor 
                      }} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Icons.Clock className="w-3.5 h-3.5" /> {sub.hoursCount} Hours Study
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group hover:underline flex items-center gap-1">
                      Enter Classroom <Icons.ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar: Recent CBSE Activities & Handouts */}
        <div className="space-y-8">
          {/* Recent Activity Panel */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-md font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Icons.History className="w-4.5 h-4.5 text-amber-500" /> Recent Activities
            </h3>
            <div className="space-y-4">
              {overallProgress.recentActivities.map((act, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-100">
                      {act.text}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {act.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick CBSE Info Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
            {/* Floating abstract graphic */}
            <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
              <Icons.Award className="w-44 h-44" />
            </div>
            
            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-300">
              IMPORTANT ANNOUNCEMENT
            </span>
            <h4 className="text-lg font-bold mt-1">
              Class 9 NCERT Board Prep
            </h4>
            <p className="text-xs text-indigo-200 mt-2 leading-relaxed">
              Ensure you solve all Chapter End Exercises of NCERT Class 9 books. Aarya Mam has updated the whiteboard diagrams for chemical atomic structure and polynomials.
            </p>
            <button className="mt-4 px-4 py-2 bg-white text-indigo-900 rounded-xl text-xs font-bold shadow-md hover:bg-slate-50 transition-all">
              View Syllabus Calendar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
