import { 
  Subject, Chapter, Lesson, LessonStep, BoardInstruction, 
  QuizItem, HomeworkItem, NoteItem, TranscriptLine, ResourceItem, 
  TeacherState 
} from '../types';

// ============================================================================
// Service Interfaces
// ============================================================================

export interface ISubjectService {
  getSubjects(): Promise<Subject[]>;
  getSubjectById(id: string): Promise<Subject | undefined>;
}

export interface IChapterService {
  getChapters(subjectId: string): Promise<Chapter[]>;
  getChapterById(id: string): Promise<Chapter | undefined>;
}

export interface ILessonService {
  getLessons(chapterId: string): Promise<Lesson[]>;
  getLessonById(id: string): Promise<Lesson | undefined>;
}

export interface ITeacherService {
  getTeacherState(lessonId: string, stepId: string): Promise<TeacherState>;
}

export interface IBoardService {
  getBoardInstructions(lessonId: string, stepId: string): Promise<BoardInstruction[]>;
}

export interface IQuizService {
  getQuizzes(subjectId: string): Promise<QuizItem[]>;
}

export interface IHomeworkService {
  getHomework(subjectId: string): Promise<HomeworkItem[]>;
  submitHomework(id: string, answers: Record<string, string>): Promise<boolean>;
}

export interface IProgressService {
  getOverallProgress(): Promise<{
    completedLessons: number;
    totalLessons: number;
    overallPercentage: number;
    recentActivities: Array<{ text: string; date: string }>;
  }>;
  markStepCompleted(lessonId: string, stepId: string): Promise<void>;
}

export interface INotesService {
  getNotes(lessonId: string): Promise<NoteItem[]>;
  addNote(lessonId: string, lessonName: string, text: string, timestamp: string): Promise<NoteItem>;
  toggleBookmark(noteId: string): Promise<void>;
  deleteNote(noteId: string): Promise<void>;
}

export interface ITranscriptService {
  getTranscript(lessonId: string, stepId: string): Promise<TranscriptLine[]>;
}

export interface IMediaService {
  getPlaybackSpeed(): number;
  setPlaybackSpeed(speed: number): void;
  initAudio(): void;
  setSpatialPosition(pan: number): void;
  setVolume(volume: number): void;
  playSpeechSyllable(vowelType: 'a' | 'o' | 'e' | 'i' | 'consonant', duration: number): void;
  playSpeechPhrase(text: string, rate?: number): Promise<void>;
  stopSpeech(): void;
  isAudioInitialized(): boolean;
}

// ============================================================================
// Mock Data (Authentic CBSE Class 9 NCERT Syllabus)
// ============================================================================

const MOCK_SUBJECTS: Subject[] = [
  {
    id: 'maths',
    name: 'Mathematics',
    icon: 'Calculator',
    colorClass: 'text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100/70',
    accentColor: '#4f46e5',
    bgColor: 'bg-indigo-950/10 dark:bg-indigo-950/40',
    description: 'Explore the fascinating world of numbers, equations, and geometry. Visualizing algebraic equations and coordinates.',
    progress: 45,
    chaptersCount: 12,
    hoursCount: 36
  },
  {
    id: 'science',
    name: 'Science',
    icon: 'Atom',
    colorClass: 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70',
    accentColor: '#059669',
    bgColor: 'bg-emerald-950/10 dark:bg-emerald-950/40',
    description: 'Dive into chemical reactions, physical laws, and cellular biology. Experiments and diagrams made super simple.',
    progress: 60,
    chaptersCount: 15,
    hoursCount: 45
  },
  {
    id: 'social',
    name: 'Social Science',
    icon: 'Globe',
    colorClass: 'text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100/70',
    accentColor: '#d97706',
    bgColor: 'bg-amber-950/10 dark:bg-amber-950/40',
    description: 'Travel through history, global geography, and civic systems. Re-live the French Revolution with detailed timelines.',
    progress: 30,
    chaptersCount: 18,
    hoursCount: 40
  },
  {
    id: 'english',
    name: 'English Language & Lit',
    icon: 'BookOpen',
    colorClass: 'text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100/70',
    accentColor: '#e11d48',
    bgColor: 'bg-rose-950/10 dark:bg-rose-950/40',
    description: 'Enhance your communication, literature interpretation, and composition. Reading classics with Aarya mam.',
    progress: 75,
    chaptersCount: 10,
    hoursCount: 24
  },
  {
    id: 'hindi',
    name: 'Hindi (Kshitij)',
    icon: 'Languages',
    colorClass: 'text-teal-600 border-teal-200 bg-teal-50 hover:bg-teal-100/70',
    accentColor: '#0d9488',
    bgColor: 'bg-teal-950/10 dark:bg-teal-950/40',
    description: 'गद्य और पद्य खंड का संपूर्ण विश्लेषण। भाषा की सुंदरता और कहानियों का गहरा भावार्थ समझें।',
    progress: 50,
    chaptersCount: 11,
    hoursCount: 22
  }
];

const MOCK_CHAPTERS: Record<string, Chapter[]> = {
  maths: [
    {
      id: 'math-ch2',
      subjectId: 'maths',
      name: 'Chapter 2: Polynomials (बहुपद)',
      description: 'Understand terms, coefficients, variables, degree, types, and the Remainder & Factor Theorems with algebraic visualizations.',
      progress: 60,
      difficulty: 'Medium',
      estimatedTime: '4 Hours',
      lessonsCount: 5,
      completedCount: 3,
      teacherName: 'Aarya'
    },
    {
      id: 'math-ch3',
      subjectId: 'maths',
      name: 'Chapter 3: Coordinate Geometry',
      description: 'Locate points in a Cartesian plane, identify quadrants, abscissa, ordinate, and plot authentic geometry grids.',
      progress: 100,
      difficulty: 'Easy',
      estimatedTime: '2 Hours',
      lessonsCount: 3,
      completedCount: 3,
      teacherName: 'Aarya'
    },
    {
      id: 'math-ch6',
      subjectId: 'maths',
      name: 'Chapter 6: Lines and Angles',
      description: 'Axioms, supplementary angles, parallel lines intersected by transversals, and proof of the angle sum property.',
      progress: 0,
      difficulty: 'Hard',
      estimatedTime: '5 Hours',
      lessonsCount: 6,
      completedCount: 0,
      teacherName: 'Aarya'
    }
  ],
  science: [
    {
      id: 'sci-ch3',
      subjectId: 'science',
      name: 'Chapter 3: Atoms and Molecules',
      description: 'Laws of chemical combination, Dalton\'s atomic theory, molecules, chemical formulas, and the Mole Concept.',
      progress: 50,
      difficulty: 'Hard',
      estimatedTime: '5 Hours',
      lessonsCount: 4,
      completedCount: 2,
      teacherName: 'Aarya'
    },
    {
      id: 'sci-ch9',
      subjectId: 'science',
      name: 'Chapter 9: Force and Laws of Motion',
      description: 'Inertia, balanced and unbalanced forces, Newton\'s Three Laws, and momentum conservation experiments.',
      progress: 80,
      difficulty: 'Medium',
      estimatedTime: '4 Hours',
      lessonsCount: 5,
      completedCount: 4,
      teacherName: 'Aarya'
    }
  ],
  social: [
    {
      id: 'soc-ch1',
      subjectId: 'social',
      name: 'Chapter 1: The French Revolution',
      description: 'French society in the late 18th century, outbreak of the revolution, rise and fall of Robespierre & Napoleon.',
      progress: 30,
      difficulty: 'Medium',
      estimatedTime: '4 Hours',
      lessonsCount: 4,
      completedCount: 1,
      teacherName: 'Aarya'
    }
  ],
  english: [
    {
      id: 'eng-ch1',
      subjectId: 'english',
      name: 'Chapter 1: The Fun They Had',
      description: 'Isaac Asimov\'s futuristic story about automated mechanical schools vs old physical classroom structures.',
      progress: 100,
      difficulty: 'Easy',
      estimatedTime: '1.5 Hours',
      lessonsCount: 2,
      completedCount: 2,
      teacherName: 'Aarya'
    }
  ],
  hindi: [
    {
      id: 'hin-ch1',
      subjectId: 'hindi',
      name: 'पाठ्य 1: दो बैलों की कथा (प्रेमचंद)',
      description: 'प्रेमचंद द्वारा लिखित हीरा और मोती नामक दो बैलों की स्वाभिमान, स्वतंत्रता और गहरी मित्रता की मार्मिक कहानी।',
      progress: 100,
      difficulty: 'Easy',
      estimatedTime: '2 Hours',
      lessonsCount: 2,
      completedCount: 2,
      teacherName: 'Aarya'
    }
  ]
};

const MOCK_LESSONS: Record<string, Lesson[]> = {
  'math-ch2': [
    {
      id: 'les-maths-p1',
      chapterId: 'math-ch2',
      name: 'L1: Introduction & Degrees of Polynomials',
      description: 'Discover variables, constants, exponents, and classifying expressions by their maximum power.',
      duration: '15 Mins',
      order: 1,
      completed: true,
      status: 'completed',
      steps: []
    },
    {
      id: 'les-maths-p2',
      chapterId: 'math-ch2',
      name: 'L2: Classification (Monomial, Binomial, Trinomial)',
      description: 'Classification based on number of terms and coefficients analysis.',
      duration: '18 Mins',
      order: 2,
      completed: true,
      status: 'completed',
      steps: []
    },
    {
      id: 'les-maths-p3',
      chapterId: 'math-ch2',
      name: 'L3: Zero of a Polynomial (बहुपद के शून्यक)',
      description: 'Master how to calculate values of x that reduce a given polynomial to exactly zero.',
      duration: '22 Mins',
      order: 3,
      completed: false,
      status: 'active',
      steps: [
        {
          id: 'step-intro',
          title: 'Classroom Intro',
          type: 'intro',
          duration: '2 Mins',
          completed: true,
          active: true,
          script: 'Good Morning Baccho! Aaj hum Polynomial ka ek bahut important concept seekhenge, jise "Zero of a Polynomial" ya Hindi me "Bahupad ke Shunya" kehte hain. Dhyan se sunna, ye topic exam me har saal pucha jata hai!',
          boardCommands: [
            { id: 'b1', type: 'text', content: 'CHAPTER 2: POLYNOMIALS', color: '#818cf8' },
            { id: 'b2', type: 'text', content: 'Topic: Zero of a Polynomial (बहुपद के शून्यक)', color: '#ffffff' }
          ]
        },
        {
          id: 'step-concept',
          title: 'Concept Explanation',
          type: 'concept',
          duration: '3 Mins',
          completed: false,
          active: false,
          script: 'Acha, zero ka simple matlab kya hota hai? Ki hum variable x ki aisi kaunsi value rakhein jisse hamara pura expression zero ban jaye! Chalo isko mathematical definition ke saath samajhte hain.',
          boardCommands: [
            { id: 'b3', type: 'text', content: 'Definition:', color: '#f59e0b' },
            { id: 'b4', type: 'text', content: 'A real number "k" is called a zero of a polynomial p(x) if:', color: '#ffffff' },
            { id: 'b5', type: 'text', content: 'p(k) = 0', color: '#10b981', strokeWidth: 2 }
          ]
        },
        {
          id: 'step-writing',
          title: 'Board Writing',
          type: 'board_writing',
          duration: '4 Mins',
          completed: false,
          active: false,
          script: 'Dekho idhar. Let\'s write a linear polynomial: p(x) = x - 5. Agar hum x ki jagah 5 rakhein, toh p(5) = 5 - 5 = 0 hoga. Yani, x = 5 is local polynomial ka zero hai! Samajh aaya?',
          boardCommands: [
            { id: 'b6', type: 'text', content: 'Example 1 (Linear):', color: '#38bdf8' },
            { id: 'b7', type: 'text', content: 'p(x) = x - 5', color: '#ffffff' },
            { id: 'b8', type: 'text', content: 'Put x = 5:', color: '#f472b6' },
            { id: 'b9', type: 'text', content: 'p(5) = 5 - 5 = 0', color: '#4ade80' },
            { id: 'b10', type: 'text', content: 'Therefore, 5 is the ZERO of p(x)', color: '#34d399' }
          ]
        },
        {
          id: 'step-animation',
          title: 'Visual Animation',
          type: 'visual_animation',
          duration: '3 Mins',
          completed: false,
          active: false,
          script: 'Ab ek Quadratic Polynomial dekhte hain: p(x) = x² - 2x. Hum isse graphically aur factorisation se samjhenge. Is polynomial ke multiple zeros ho sakte hain!',
          boardCommands: [
            { id: 'b11', type: 'text', content: 'Example 2 (Quadratic): p(x) = x² - 2x', color: '#facc15' },
            { id: 'b12', type: 'graph', content: 'y = x² - 2x', color: '#ffffff' },
            { id: 'b13', type: 'shape', shapeType: 'arrow', points: [[40, 50], [50, 60]], color: '#f87171' },
            { id: 'b14', type: 'text', content: 'Zeros are x = 0 and x = 2', color: '#4ade80' }
          ]
        },
        {
          id: 'step-worked',
          title: 'Worked Example',
          type: 'worked_example',
          duration: '3 Mins',
          completed: false,
          active: false,
          script: 'Chalo, ab hum is question ko step-by-step solve karenge. Hum se pucha hai: Find the zero of p(x) = 2x + 7. Jab bhi kisi linear polynomial ka zero nikalna ho, toh simple p(x) ko zero ke equal put karo.',
          boardCommands: [
            { id: 'b15', type: 'text', content: 'Question: Find zero of p(x) = 2x + 7', color: '#6366f1' },
            { id: 'b16', type: 'text', content: 'Step 1: Set p(x) = 0', color: '#ffffff' },
            { id: 'b17', type: 'text', content: '⇒ 2x + 7 = 0', color: '#ffffff' },
            { id: 'b18', type: 'text', content: '⇒ 2x = -7', color: '#fb923c' },
            { id: 'b19', type: 'text', content: '⇒ x = -7 / 2', color: '#34d399' }
          ]
        },
        {
          id: 'step-practice',
          title: 'Concept Practice',
          type: 'practice',
          duration: '3 Mins',
          completed: false,
          active: false,
          script: 'Ab is practice task ko dhyan se dekhna. Tumhe x = -1 par p(x) = 5x - 4x² + 3 ki value check karni hai. Jaldi se isko apni notebook me solve karo fir whiteboard par correct calculation check karna!',
          boardCommands: [
            { id: 'b20', type: 'text', content: 'PRACTICE EXERCISE', color: '#f43f5e' },
            { id: 'b21', type: 'text', content: 'Evaluate p(x) = 5x - 4x² + 3 at x = -1', color: '#ffffff' }
          ]
        },
        {
          id: 'step-quiz',
          title: 'Topic Quiz',
          type: 'quiz',
          duration: '2 Mins',
          completed: false,
          active: false,
          script: 'Kya sabko samajh aa raha hai? Acha, toh chalo screen par aane wale CBSE quiz card ko attempt karo! Dekhte hain kaun pehle sahi answer choose karta hai!',
          boardCommands: [
            { id: 'b22', type: 'text', content: 'POP QUIZ TIME!', color: '#eab308' }
          ]
        },
        {
          id: 'step-homework',
          title: 'Homework Task',
          type: 'homework',
          duration: '1 Mins',
          completed: false,
          active: false,
          script: 'Shabash baccho! Aaj humne Zeros find karna toh seekh liya. Ab homework note down karo: NCERT Exercise 2.2 ka Question 1 aur 2 pure dhyan se solve karna. Kal hum Remainder Theorem shuru karenge.',
          boardCommands: [
            { id: 'b23', type: 'text', content: 'HOMEWORK ASSIGNMENT', color: '#a855f7' },
            { id: 'b24', type: 'text', content: '1. Verify if x = -1/3 is a zero of p(x) = 3x + 1', color: '#ffffff' },
            { id: 'b25', type: 'text', content: '2. NCERT Exercise 2.2 (Q1, Q2 & Q3)', color: '#ffffff' }
          ]
        },
        {
          id: 'step-summary',
          title: 'Summary',
          type: 'summary',
          duration: '1 Mins',
          completed: false,
          active: false,
          script: 'Bahut badiya, aaj ki class yahi samapt hoti hai. Linear polynomial ka exact ek zero hota hai aur quadratic ke do. Revision karna mat bhoolna, see you tomorrow!',
          boardCommands: [
            { id: 'b26', type: 'text', content: 'SUMMARY KEY POINTS:', color: '#10b981' },
            { id: 'b27', type: 'text', content: '• Linear Polynomial (p(x) = ax + b) has exactly ONE zero.', color: '#ffffff' },
            { id: 'b28', type: 'text', content: '• A zero of a polynomial need not be 0.', color: '#ffffff' },
            { id: 'b29', type: 'text', content: '• 0 may be a zero of a polynomial.', color: '#ffffff' }
          ]
        }
      ]
    },
    {
      id: 'les-maths-p4',
      chapterId: 'math-ch2',
      name: 'L4: Remainder Theorem (शेषफल प्रमेय)',
      description: 'Proof and practical problems on calculating remainders without detailed division.',
      duration: '25 Mins',
      order: 4,
      completed: false,
      status: 'locked',
      steps: []
    }
  ],
  'sci-ch3': [
    {
      id: 'les-sci-a1',
      chapterId: 'sci-ch3',
      name: 'L1: Laws of Chemical Combination',
      description: 'Understanding Lavoisier\'s conservation of mass and constant proportions.',
      duration: '20 Mins',
      order: 1,
      completed: true,
      status: 'completed',
      steps: []
    },
    {
      id: 'les-sci-a2',
      chapterId: 'sci-ch3',
      name: 'L2: What is an Atom? & Dalton\'s Postulates',
      description: 'Interactive atomic model structure, symbol of elements, and Dalton\'s core axioms.',
      duration: '22 Mins',
      order: 2,
      completed: false,
      status: 'active',
      steps: [
        {
          id: 'step-intro',
          title: 'Classroom Intro',
          type: 'intro',
          duration: '2 Mins',
          completed: true,
          active: true,
          script: 'Swagat hai baccho! Aaj hum Chemistry ka sabse exciting topic padhne wale hain: "What is an Atom?". Hum Dalton ki atomic theory aur element symbols ko detail me samjhenge. Shuru karein?',
          boardCommands: [
            { id: 's1', type: 'text', content: 'CHAPTER 3: ATOMS AND MOLECULES', color: '#10b981' },
            { id: 's2', type: 'text', content: 'Topic: Atomic Structure & Dalton\'s Postulates', color: '#ffffff' }
          ]
        },
        {
          id: 'step-concept',
          title: 'Atomic Concept',
          type: 'concept',
          duration: '3 Mins',
          completed: false,
          active: false,
          script: 'Atom kya hota hai? Agar aap kisi building ko bante dekhein toh sabse smallest component kya hota hai? Ek brick, right? Waise hi pure Universe ka sabse basic structural unit "Atom" hai!',
          boardCommands: [
            { id: 's3', type: 'text', content: 'The Building Block of Matter is called an ATOM.', color: '#ffffff' },
            { id: 's4', type: 'chemical', content: 'Structure of Atom (Basic)', color: '#38bdf8' }
          ]
        },
        {
          id: 'step-writing',
          title: 'Dalton Postulates',
          type: 'board_writing',
          duration: '4 Mins',
          completed: false,
          active: false,
          script: 'Dalton ne 1808 me apni theory di thi. Unhone kaha ki saara matter bohot hi tiny particles se bana hai jise Atom kehte hain aur atoms are indivisible! Unhe create ya destroy nahi kiya ja sakta.',
          boardCommands: [
            { id: 's5', type: 'text', content: 'Dalton\'s Atomic Theory (1808):', color: '#f59e0b' },
            { id: 's6', type: 'text', content: '1. Matter is made of tiny particles called atoms.', color: '#ffffff' },
            { id: 's7', type: 'text', content: '2. Atoms are indivisible particles.', color: '#ffffff' },
            { id: 's8', type: 'text', content: '3. Atoms of a given element are identical in mass.', color: '#ffffff' }
          ]
        },
        {
          id: 'step-animation',
          title: 'Molecular Diagram',
          type: 'visual_animation',
          duration: '3 Mins',
          completed: false,
          active: false,
          script: 'Dekho idhar. Hum screens par H2O Molecule yaani water molecule ka shape dekh sakte hain. Isme do Hydrogen atoms, ek oxygen atom ke saath chemically combined hain!',
          boardCommands: [
            { id: 's9', type: 'chemical', content: 'H2O Molecule: O connected to two H atoms', color: '#6366f1' },
            { id: 's10', type: 'shape', shapeType: 'circle', points: [[50, 50], [60, 50]], color: '#f43f5e' }
          ]
        },
        {
          id: 'step-worked',
          title: 'Worked Example',
          type: 'worked_example',
          duration: '3 Mins',
          completed: false,
          active: false,
          script: 'Chalo ab hum carbon dioxide (CO2) ke mass ratio ko calculate karte hain. Carbon ka atomic mass hota hai 12u, Oxygen ka 16u. Carbon Dioxide me inka ratio kya hoga?',
          boardCommands: [
            { id: 's11', type: 'text', content: 'Mass Ratio of CO2:', color: '#06b6d4' },
            { id: 's12', type: 'text', content: 'Carbon (C) mass = 12 u', color: '#ffffff' },
            { id: 's13', type: 'text', content: 'Oxygen (O2) mass = 2 x 16 = 32 u', color: '#ffffff' },
            { id: 's14', type: 'text', content: 'Ratio C : O = 12 : 32 = 3 : 8', color: '#34d399' }
          ]
        },
        {
          id: 'step-practice',
          title: 'Formula Writing Practice',
          type: 'practice',
          duration: '3 Mins',
          completed: false,
          active: false,
          script: 'Ab ek chota sa question practice karte hain. Calcium Oxide (CaO) ka mass ratio ratio of masses of Ca and O nikalna hai. Calcium ka mass ratio 40 aur Oxygen 16 hota hai.',
          boardCommands: [
            { id: 's15', type: 'text', content: 'PRACTICE: Calcium Oxide Ratio', color: '#ec4899' },
            { id: 's16', type: 'text', content: 'Find mass ratio of Calcium (Ca: 40u) and Oxygen (O: 16u) in CaO', color: '#ffffff' }
          ]
        },
        {
          id: 'step-quiz',
          title: 'Atoms Quiz',
          type: 'quiz',
          duration: '2 Mins',
          completed: false,
          active: false,
          script: 'Chalo quiz attempt karte hain. Aap batayein ki kisne kaha tha ki Atoms can neither be created nor destroyed?',
          boardCommands: [
            { id: 's17', type: 'text', content: 'QUIZ: Atomic Combination Law', color: '#facc15' }
          ]
        },
        {
          id: 'step-homework',
          title: 'Homework',
          type: 'homework',
          duration: '1 Mins',
          completed: false,
          active: false,
          script: 'Acha baccho, aaj ka homework note karo: Dalton\'s theory ke limitations ko dhoondhna hai aur modern symbols ko learn karna hai. Chalo kal milte hain, bye-bye!',
          boardCommands: [
            { id: 's18', type: 'text', content: 'HOMEWORK ASSIGNMENT', color: '#a855f7' },
            { id: 's19', type: 'text', content: '1. Write 6 postulates of Dalton\'s theory in notebook.', color: '#ffffff' },
            { id: 's20', type: 'text', content: '2. Learn atomic symbols from Hydrogen (1) to Calcium (20).', color: '#ffffff' }
          ]
        }
      ]
    }
  ]
};

const MOCK_QUIZZES: Record<string, QuizItem[]> = {
  maths: [
    {
      id: 'q-math-1',
      question: 'Which of the following is a polynomial expression?',
      options: ['x² + 2√x + 5', 'x + 1/x', 'y³ - 3y + 2', '√y + y'],
      correctAnswerIndex: 2,
      explanation: 'An expression is a polynomial only if all exponent values of its variables are non-negative integers. Expressions with fractional exponents (like √x) or division by variables (like 1/x) are not polynomials.',
      subjectId: 'maths'
    },
    {
      id: 'q-math-2',
      question: 'What is the value of the polynomial p(x) = x² - 5x + 6 at x = 2?',
      options: ['2', '0', '6', '-4'],
      correctAnswerIndex: 1,
      explanation: 'Substitute x = 2: p(2) = (2)² - 5(2) + 6 = 4 - 10 + 6 = 10 - 10 = 0. Therefore, 2 is a zero of this polynomial.',
      subjectId: 'maths'
    },
    {
      id: 'q-math-3',
      question: 'If x - 2 is a factor of x² + kx + 4, find the value of k.',
      options: ['k = -4', 'k = -2', 'k = 2', 'k = 4'],
      correctAnswerIndex: 0,
      explanation: 'By Factor Theorem, if x - 2 is a factor, then p(2) = 0. So, (2)² + k(2) + 4 = 0 ⇒ 4 + 2k + 4 = 0 ⇒ 2k = -8 ⇒ k = -4.',
      subjectId: 'maths'
    }
  ],
  science: [
    {
      id: 'q-sci-1',
      question: 'Who proposed the Law of Conservation of Mass?',
      options: ['Antoine Lavoisier', 'Joseph Proust', 'John Dalton', 'J.J. Thomson'],
      correctAnswerIndex: 0,
      explanation: 'Antoine Lavoisier, a French chemist, established the Law of Conservation of Mass in 1789, proving that mass can neither be created nor destroyed in a chemical reaction.',
      subjectId: 'science'
    },
    {
      id: 'q-sci-2',
      question: 'What is the ratio of mass of Hydrogen to Oxygen in Water (H₂O)?',
      options: ['1 : 2', '1 : 8', '2 : 1', '8 : 1'],
      correctAnswerIndex: 1,
      explanation: 'Mass of 2 Hydrogen atoms = 2u, Mass of 1 Oxygen atom = 16u. Ratio = 2:16 = 1:8. This is fixed in accordance with Proust\'s Law of Constant Proportions.',
      subjectId: 'science'
    }
  ]
};

const MOCK_HOMEWORK: Record<string, HomeworkItem[]> = {
  maths: [
    {
      id: 'hw-math-1',
      title: 'Polynomial Zero & Value Evaluation Sheet',
      subjectId: 'maths',
      chapterId: 'math-ch2',
      dueDate: '2026-07-10',
      status: 'graded',
      marks: 9,
      totalMarks: 10,
      teacherRemarks: 'Excellent work! Your step-by-step coefficient calculations were flawless. Keep practicing algebraic factorising.',
      questions: [
        { id: 'q1', text: 'Find the value of p(y) = y² - y + 1 at y = 1 and y = 2.', hint: 'Substitute y with 1 and 2 separately.' },
        { id: 'q2', text: 'Verify if -2 and 2 are zeros of the polynomial x + 2.', hint: 'Substitute x = -2 and x = 2 and check if answer is 0.' }
      ]
    },
    {
      id: 'hw-math-2',
      title: 'Remainder Theorem NCERT 2.3 Ex',
      subjectId: 'maths',
      chapterId: 'math-ch2',
      dueDate: '2026-07-15',
      status: 'pending',
      totalMarks: 15,
      questions: [
        { id: 'q1', text: 'Find remainder when x³ + 3x² + 3x + 1 is divided by x + 1', hint: 'Find p(-1) using Remainder Theorem.' },
        { id: 'q2', text: 'Determine if x + 1 is a factor of x³ + x² + x + 1', hint: 'If remainder p(-1) is 0, it is a factor.' }
      ]
    }
  ],
  science: [
    {
      id: 'hw-sci-1',
      title: 'Laws of Chemical Combination Problems',
      subjectId: 'science',
      chapterId: 'sci-ch3',
      dueDate: '2026-07-12',
      status: 'submitted',
      totalMarks: 10,
      questions: [
        { id: 'q1', text: 'State 5 postulates of Dalton\'s Atomic Theory.', hint: 'Check the textbook section on chemical atoms.' },
        { id: 'q2', text: 'In a reaction, 5.3g of sodium carbonate reacted with 6g of ethanoic acid. Product was 2.2g of carbon dioxide, 0.9g of water, and 8.2g of sodium ethanoate. Show that these observations are in agreement with the law of conservation of mass.', hint: 'Calculate Reactants total mass and Products total mass.' }
      ]
    }
  ]
};

const MOCK_RESOURCES: ResourceItem[] = [
  { id: 'res-1', title: 'NCERT Textbook Solutions - Polynomials Class 9', fileType: 'pdf', fileSize: '2.4 MB', downloadUrl: '#' },
  { id: 'res-2', title: 'Chapter 2 Mindmap & Formula Cheat Sheet', fileType: 'pdf', fileSize: '1.1 MB', downloadUrl: '#' },
  { id: 'res-3', title: 'Dalton\'s Atomic Postulates Handouts', fileType: 'pdf', fileSize: '850 KB', downloadUrl: '#' },
  { id: 'res-4', title: 'Interactive Geogebra Graphing Tools Reference', fileType: 'link', downloadUrl: 'https://geogebra.org' }
];

// In-Memory Storage for dynamic notes
let userNotes: NoteItem[] = [
  { id: 'n-1', lessonId: 'les-maths-p3', lessonName: 'L3: Zero of a Polynomial', timestamp: '01:45', text: 'p(k) = 0 is the definition of the zero. Here k is any real number.', isBookmarked: true },
  { id: 'n-2', lessonId: 'les-maths-p3', lessonName: 'L3: Zero of a Polynomial', timestamp: '03:12', text: 'For linear polynomial ax + b, zero is calculated as x = -b/a. Very useful short-cut!', isBookmarked: false }
];

// ============================================================================
// Service Implementations (The Service Layer)
// ============================================================================

export class SubjectService implements ISubjectService {
  async getSubjects(): Promise<Subject[]> {
    return MOCK_SUBJECTS;
  }
  async getSubjectById(id: string): Promise<Subject | undefined> {
    return MOCK_SUBJECTS.find(sub => sub.id === id);
  }
}

export class ChapterService implements IChapterService {
  async getChapters(subjectId: string): Promise<Chapter[]> {
    return MOCK_CHAPTERS[subjectId] || [];
  }
  async getChapterById(id: string): Promise<Chapter | undefined> {
    for (const key in MOCK_CHAPTERS) {
      const found = MOCK_CHAPTERS[key].find(ch => ch.id === id);
      if (found) return found;
    }
    return undefined;
  }
}

export class LessonService implements ILessonService {
  async getLessons(chapterId: string): Promise<Lesson[]> {
    return MOCK_LESSONS[chapterId] || [];
  }
  async getLessonById(id: string): Promise<Lesson | undefined> {
    for (const key in MOCK_LESSONS) {
      const found = MOCK_LESSONS[key].find(les => les.id === id);
      if (found) return found;
    }
    return undefined;
  }
}

export class TeacherService implements ITeacherService {
  async getTeacherState(lessonId: string, stepId: string): Promise<TeacherState> {
    const defaultState: TeacherState = {
      currentAction: 'idle',
      speechText: 'Hello children!',
      emotion: 'smiling',
      facing: 'audience'
    };

    const steps = MOCK_LESSONS['math-ch2'].find(l => l.id === lessonId)?.steps ||
                  MOCK_LESSONS['sci-ch3'].find(l => l.id === lessonId)?.steps || [];

    const currentStep = steps.find(s => s.id === stepId);
    if (!currentStep) return defaultState;

    let currentAction: TeacherState['currentAction'] = 'idle';
    let facing: TeacherState['facing'] = 'audience';
    let emotion: TeacherState['emotion'] = 'smiling';

    if (currentStep.type === 'intro') {
      currentAction = 'walking';
    } else if (currentStep.type === 'concept') {
      currentAction = 'gesturing';
      emotion = 'enthusiastic';
    } else if (currentStep.type === 'board_writing' || currentStep.type === 'worked_example') {
      currentAction = 'writing';
      facing = 'board';
    } else if (currentStep.type === 'visual_animation') {
      currentAction = 'pointing';
      emotion = 'smiling';
    } else if (currentStep.type === 'practice') {
      currentAction = 'gesturing';
      emotion = 'serious';
    } else if (currentStep.type === 'quiz') {
      currentAction = 'pointing';
      emotion = 'enthusiastic';
    }

    return {
      currentAction,
      speechText: currentStep.script,
      emotion,
      facing
    };
  }
}

export class BoardService implements IBoardService {
  async getBoardInstructions(lessonId: string, stepId: string): Promise<BoardInstruction[]> {
    const steps = MOCK_LESSONS['math-ch2'].find(l => l.id === lessonId)?.steps ||
                  MOCK_LESSONS['sci-ch3'].find(l => l.id === lessonId)?.steps || [];
    return steps.find(s => s.id === stepId)?.boardCommands || [];
  }
}

export class QuizService implements IQuizService {
  async getQuizzes(subjectId: string): Promise<QuizItem[]> {
    return MOCK_QUIZZES[subjectId] || [];
  }
}

export class HomeworkService implements IHomeworkService {
  private homeworkList = { ...MOCK_HOMEWORK };

  async getHomework(subjectId: string): Promise<HomeworkItem[]> {
    return this.homeworkList[subjectId] || [];
  }

  async submitHomework(id: string, answers: Record<string, string>): Promise<boolean> {
    console.log(`Submitted HW ${id} with answers:`, answers);
    for (const key in this.homeworkList) {
      const idx = this.homeworkList[key].findIndex(hw => hw.id === id);
      if (idx !== -1) {
        this.homeworkList[key] = [
          ...this.homeworkList[key].slice(0, idx),
          { ...this.homeworkList[key][idx], status: 'submitted' },
          ...this.homeworkList[key].slice(idx + 1)
        ];
        return true;
      }
    }
    return false;
  }
}

export class ProgressService implements IProgressService {
  async getOverallProgress() {
    return {
      completedLessons: 12,
      totalLessons: 24,
      overallPercentage: 50,
      recentActivities: [
        { text: 'Completed Zero of a Polynomial Quiz with 100% Score', date: 'Today, 11:30 AM' },
        { text: 'Submitted Chemistry Atomic Structure Homework', date: 'Yesterday' },
        { text: 'Started Polynomial Division L4 with Aarya Mam', date: '2 days ago' }
      ]
    };
  }

  async markStepCompleted(lessonId: string, stepId: string): Promise<void> {
    console.log(`Step ${stepId} marked completed for lesson ${lessonId}`);
  }
}

export class NotesService implements INotesService {
  async getNotes(lessonId: string): Promise<NoteItem[]> {
    return userNotes.filter(n => n.lessonId === lessonId);
  }

  async addNote(lessonId: string, lessonName: string, text: string, timestamp: string): Promise<NoteItem> {
    const newNote: NoteItem = {
      id: `n-${Date.now()}`,
      lessonId,
      lessonName,
      timestamp,
      text,
      isBookmarked: false
    };
    userNotes.push(newNote);
    return newNote;
  }

  async toggleBookmark(noteId: string): Promise<void> {
    userNotes = userNotes.map(n => n.id === noteId ? { ...n, isBookmarked: !n.isBookmarked } : n);
  }

  async deleteNote(noteId: string): Promise<void> {
    userNotes = userNotes.filter(n => n.id !== noteId);
  }
}

export class TranscriptService implements ITranscriptService {
  async getTranscript(lessonId: string, stepId: string): Promise<TranscriptLine[]> {
    const steps = MOCK_LESSONS['math-ch2'].find(l => l.id === lessonId)?.steps ||
                  MOCK_LESSONS['sci-ch3'].find(l => l.id === lessonId)?.steps || [];
    const currentStep = steps.find(s => s.id === stepId);
    if (!currentStep) return [];

    // Split speech into logical lines
    const sentences = currentStep.script.split(/(?<=[.!?])\s+/);
    return sentences.map((sentence, idx) => ({
      id: `${stepId}-t-${idx}`,
      time: `00:${(idx * 8).toString().padStart(2, '0')}`,
      text: sentence,
      speaker: 'Aarya'
    }));
  }
}

export class MediaService implements IMediaService {
  private speed = 1.0;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private panner: StereoPannerNode | null = null;
  private activeTimeouts: any[] = [];
  private activeOscillators: any[] = [];

  getPlaybackSpeed(): number {
    return this.speed;
  }

  setPlaybackSpeed(speed: number): void {
    this.speed = speed;
  }

  isAudioInitialized(): boolean {
    return this.ctx !== null && this.ctx.state !== 'suspended';
  }

  initAudio(): void {
    if (typeof window === 'undefined') return;
    
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        
        this.ctx = new AudioContextClass();
        
        // 1. Create Volume Normalization (Dynamics Compressor)
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

        // 2. Create Master Volume Gain Node
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

        // 3. Create Spatial Audio Panner (StereoPannerNode)
        if (this.ctx.createStereoPanner) {
          this.panner = this.ctx.createStereoPanner();
          // Position teacher at Left Podium (-0.45) by default to match visual classroom layout
          this.panner.pan.setValueAtTime(-0.45, this.ctx.currentTime);
        }

        // Connect the audio routing graph:
        // [Source] -> [Compressor] -> [Master Gain] -> [Spatial Panner] -> [Speakers]
        if (this.panner) {
          this.compressor.connect(this.masterGain);
          this.masterGain.connect(this.panner);
          this.panner.connect(this.ctx.destination);
        } else {
          this.compressor.connect(this.masterGain);
          this.masterGain.connect(this.ctx.destination);
        }
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('Failed to initialize Web Audio API engine:', e);
    }
  }

  setSpatialPosition(pan: number): void {
    this.initAudio();
    if (this.panner && this.ctx) {
      const clampedPan = Math.max(-1.0, Math.min(1.0, pan));
      this.panner.pan.setValueAtTime(clampedPan, this.ctx.currentTime);
    }
  }

  setVolume(volume: number): void {
    this.initAudio();
    if (this.masterGain && this.ctx) {
      const clampedVol = Math.max(0.0, Math.min(1.5, volume));
      this.masterGain.gain.setValueAtTime(clampedVol, this.ctx.currentTime);
    }
  }

  /**
   * Play a single vowel or consonant phoneme syllable using formant filters
   * to synthesize an authentic female AI voice.
   */
  playSpeechSyllable(vowelType: 'a' | 'o' | 'e' | 'i' | 'consonant', duration: number): void {
    this.initAudio();
    if (!this.ctx || !this.compressor) return;

    const now = this.ctx.currentTime;
    
    // Create fundamental frequency (F0) oscillator for Indian female pitch profile (~210Hz)
    const oscF0 = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    
    // Choose voice wave style
    oscF0.type = 'triangle'; 
    oscF0.frequency.setValueAtTime(210, now);
    // Add micro pitch variation/vibrato for natural warm human feel
    oscF0.frequency.linearRampToValueAtTime(210 + (Math.random() * 8 - 4), now + duration);

    // Formant filter 1 (F1) and 2 (F2) to give the sound a vowel shape
    const filter1 = this.ctx.createBiquadFilter();
    const filter2 = this.ctx.createBiquadFilter();
    
    filter1.type = 'bandpass';
    filter2.type = 'bandpass';
    filter1.Q.setValueAtTime(8, now);
    filter2.Q.setValueAtTime(8, now);

    // Map vocal formants (standard vocal resonance points)
    let f1Freq = 600;
    let f2Freq = 1600;

    switch (vowelType) {
      case 'a': // /a/ vowel: F1 high, F2 mid-high
        f1Freq = 800;
        f2Freq = 1200;
        break;
      case 'o': // /o/ vowel: F1 mid-low, F2 low
        f1Freq = 500;
        f2Freq = 900;
        break;
      case 'i': // /i/ vowel: F1 very low, F2 extremely high
        f1Freq = 300;
        f2Freq = 2300;
        break;
      case 'e': // /e/ vowel: F1 mid, F2 high
        f1Freq = 550;
        f2Freq = 1900;
        break;
      case 'consonant': // Shorter, sibilant noise burst
        f1Freq = 1000;
        f2Freq = 3500;
        oscF0.frequency.setValueAtTime(280, now);
        break;
    }

    filter1.frequency.setValueAtTime(f1Freq, now);
    filter2.frequency.setValueAtTime(f2Freq, now);

    // Apply brief articulation envelope
    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(0.22, now + 0.015); // soft warm transient
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Connections
    oscF0.connect(oscGain);
    
    // Route to both formants in parallel to enrich frequency content
    oscGain.connect(filter1);
    oscGain.connect(filter2);

    // Connect formants to our compressor for normalization
    filter1.connect(this.compressor);
    filter2.connect(this.compressor);

    // Keep track of active oscillators to stop them if needed
    oscF0.start(now);
    oscF0.stop(now + duration + 0.05);
    
    this.activeOscillators.push(oscF0);

    // Cleanup reference after it finishes
    setTimeout(() => {
      this.activeOscillators = this.activeOscillators.filter(o => o !== oscF0);
    }, (duration + 0.1) * 1000);
  }

  /**
   * Web Audio API speech synthesis playback queue.
   * Parses the text and triggers syllable tones in tempo, with a compressor for normalization
   * and a panner for spatial audio, ensuring voice is properly routed to browser speaker.
   */
  async playSpeechPhrase(text: string, rate: number = 1.0): Promise<void> {
    this.stopSpeech();
    this.initAudio();
    
    if (!text) return;
    
    // Split speech text into syllables or words to determine phoneme beats
    const cleanWords = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/);

    if (cleanWords.length === 0) return;

    let delay = 0;
    const baseDuration = 0.14 / (rate * this.speed); // syllable duration based on speed

    cleanWords.forEach((word) => {
      // Simulate multiple syllables per word
      const syllableCount = Math.max(1, Math.min(3, Math.ceil(word.length / 3)));
      
      for (let i = 0; i < syllableCount; i++) {
        // Classify syllable phonetic traits
        let vowelType: 'a' | 'o' | 'e' | 'i' | 'consonant' = 'a';
        if (word.includes('o') || word.includes('u')) vowelType = 'o';
        else if (word.includes('i')) vowelType = 'i';
        else if (word.includes('e')) vowelType = 'e';
        else if (i === 0 && Math.random() > 0.5) vowelType = 'consonant';

        const syllableDuration = baseDuration * (0.8 + Math.random() * 0.4);

        const t = setTimeout(() => {
          this.playSpeechSyllable(vowelType, syllableDuration);
        }, delay * 1000);

        this.activeTimeouts.push(t);
        delay += syllableDuration + 0.015; // gap between syllables
      }

      // Add a slight word boundary pause
      delay += 0.05 / (rate * this.speed);
    });
  }

  stopSpeech(): void {
    // Clear timeouts
    this.activeTimeouts.forEach(clearTimeout);
    this.activeTimeouts = [];

    // Stop and disconnect any playing oscillators
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.activeOscillators = [];
  }
}

// Instantiate Global Service Instances
export const subjectService = new SubjectService();
export const chapterService = new ChapterService();
export const lessonService = new LessonService();
export const teacherService = new TeacherService();
export const boardService = new BoardService();
export const quizService = new QuizService();
export const homeworkService = new HomeworkService();
export const progressService = new ProgressService();
export const notesService = new NotesService();
export const transcriptService = new TranscriptService();
export const mediaService = new MediaService();
export const mockResources = MOCK_RESOURCES;
