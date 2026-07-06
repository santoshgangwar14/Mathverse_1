export interface Subject {
  id: string;
  name: string;
  icon: string;
  colorClass: string;
  accentColor: string;
  bgColor: string;
  description: string;
  progress: number;
  chaptersCount: number;
  hoursCount: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  progress: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  lessonsCount: number;
  completedCount: number;
  teacherName: string;
}

export type LessonStepType = 
  | 'intro'
  | 'concept'
  | 'board_writing'
  | 'visual_animation'
  | 'worked_example'
  | 'practice'
  | 'quiz'
  | 'homework'
  | 'summary';

export interface LessonStep {
  id: string;
  title: string;
  type: LessonStepType;
  duration: string;
  completed: boolean;
  active: boolean;
  script: string; // Hinglish text spoken by Aarya
  boardCommands: BoardInstruction[];
}

export interface Lesson {
  id: string;
  chapterId: string;
  name: string;
  description: string;
  duration: string;
  order: number;
  completed: boolean;
  status: 'locked' | 'active' | 'completed';
  steps: LessonStep[];
}

export interface BoardInstruction {
  id: string;
  type: 'text' | 'draw' | 'shape' | 'erase' | 'clear' | 'grid' | 'graph' | 'diagram' | 'fraction' | 'chemical';
  content?: string;
  shapeType?: 'circle' | 'arrow' | 'triangle' | 'rectangle';
  points?: [number, number][]; // Relative points on canvas (0-100)
  color?: string;
  strokeWidth?: number;
}

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  subjectId: string;
}

export interface HomeworkItem {
  id: string;
  title: string;
  subjectId: string;
  chapterId: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  marks?: number;
  totalMarks: number;
  teacherRemarks?: string;
  questions: { id: string; text: string; hint?: string }[];
}

export interface NoteItem {
  id: string;
  lessonId: string;
  lessonName: string;
  timestamp: string; // MM:SS format or date
  text: string;
  isBookmarked: boolean;
}

export interface TranscriptLine {
  id: string;
  time: string;
  text: string; // Spoken in Hinglish
  speaker: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  fileType: 'pdf' | 'doc' | 'video' | 'link';
  fileSize?: string;
  downloadUrl: string;
}

export interface TeacherState {
  currentAction: 'idle' | 'walking' | 'writing' | 'pointing' | 'gesturing';
  speechText: string;
  emotion: 'smiling' | 'serious' | 'enthusiastic';
  facing: 'audience' | 'board';
}
