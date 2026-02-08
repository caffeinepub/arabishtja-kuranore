import { useState } from 'react';
import { BookOpen, GraduationCap, BookText, StickyNote, Brain } from 'lucide-react';
import Header from './Header';
import WhiteboardPage from '../pages/WhiteboardPage';
import LessonsPage from '../pages/LessonsPage';
import NewLessonPage from '../pages/NewLessonPage';
import EditLessonPage from '../pages/EditLessonPage';
import ViewLessonPage from '../pages/ViewLessonPage';
import VocabularyPage from '../pages/VocabularyPage';
import NotesPage from '../pages/NotesPage';
import QuizPage from '../pages/QuizPage';
import NewQuizPage from '../pages/NewQuizPage';
import TakeQuizPage from '../pages/TakeQuizPage';
import { useCanCreateLessons } from '../hooks/useQueries';

type View = 'whiteboard' | 'lessons' | 'vocabulary' | 'notes' | 'quiz' | 'newLesson' | 'editLesson' | 'viewLesson' | 'newQuiz' | 'takeQuiz';

export default function MainLayout() {
  const [activeView, setActiveView] = useState<View>('whiteboard');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [viewingLessonId, setViewingLessonId] = useState<string | null>(null);
  const [takingQuizId, setTakingQuizId] = useState<string | null>(null);
  const canCreateLessons = useCanCreateLessons();

  const handleNavigateToNewLesson = () => {
    setActiveView('newLesson');
  };

  const handleNavigateToEditLesson = (lessonId: string) => {
    setEditingLessonId(lessonId);
    setActiveView('editLesson');
  };

  const handleNavigateToViewLesson = (lessonId: string) => {
    setViewingLessonId(lessonId);
    setActiveView('viewLesson');
  };

  const handleBackToLessons = () => {
    setActiveView('lessons');
    setEditingLessonId(null);
    setViewingLessonId(null);
  };

  const handleNavigateToNewQuiz = () => {
    setActiveView('newQuiz');
  };

  const handleNavigateToTakeQuiz = (quizId: string) => {
    setTakingQuizId(quizId);
    setActiveView('takeQuiz');
  };

  const handleBackToQuiz = () => {
    setActiveView('quiz');
    setTakingQuizId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <main className="flex-1 overflow-hidden">
        {activeView === 'whiteboard' && <WhiteboardPage />}
        {activeView === 'lessons' && (
          <LessonsPage 
            onNavigateToNewLesson={handleNavigateToNewLesson}
            onNavigateToEditLesson={handleNavigateToEditLesson}
            onNavigateToViewLesson={handleNavigateToViewLesson}
          />
        )}
        {activeView === 'quiz' && (
          <QuizPage 
            onNavigateToNewQuiz={handleNavigateToNewQuiz}
            onNavigateToTakeQuiz={handleNavigateToTakeQuiz}
          />
        )}
        {activeView === 'vocabulary' && <VocabularyPage />}
        {activeView === 'notes' && <NotesPage />}
        {activeView === 'newLesson' && <NewLessonPage onBack={handleBackToLessons} />}
        {activeView === 'editLesson' && editingLessonId && (
          <EditLessonPage lessonId={editingLessonId} onBack={handleBackToLessons} />
        )}
        {activeView === 'viewLesson' && viewingLessonId && (
          <ViewLessonPage lessonId={viewingLessonId} onBack={handleBackToLessons} />
        )}
        {activeView === 'newQuiz' && <NewQuizPage onBack={handleBackToQuiz} />}
        {activeView === 'takeQuiz' && takingQuizId && (
          <TakeQuizPage quizId={takingQuizId} onBack={handleBackToQuiz} />
        )}
      </main>

      {/* Bottom Navigation - Hidden when on NewLessonPage, EditLessonPage, ViewLessonPage, NewQuizPage, or TakeQuizPage */}
      {activeView !== 'newLesson' && activeView !== 'editLesson' && activeView !== 'viewLesson' && activeView !== 'newQuiz' && activeView !== 'takeQuiz' && (
        <nav className="border-t border-border bg-card shadow-lg">
          <div className="grid h-16 max-w-2xl mx-auto px-4 grid-cols-5">
            <button
              onClick={() => setActiveView('whiteboard')}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'whiteboard'
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <BookOpen className="w-6 h-6" />
              <span className="text-xs font-medium">Dërrasa</span>
            </button>
            
            <button
              onClick={() => setActiveView('lessons')}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'lessons'
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <GraduationCap className="w-6 h-6" />
              <span className="text-xs font-medium">Mësimet</span>
            </button>

            <button
              onClick={() => setActiveView('quiz')}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'quiz'
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Brain className="w-6 h-6" />
              <span className="text-xs font-medium">Kuiz</span>
            </button>

            <button
              onClick={() => setActiveView('vocabulary')}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'vocabulary'
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <BookText className="w-6 h-6" />
              <span className="text-xs font-medium">Fjalori</span>
            </button>

            <button
              onClick={() => setActiveView('notes')}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'notes'
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <StickyNote className="w-6 h-6" />
              <span className="text-xs font-medium">Shënime</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
