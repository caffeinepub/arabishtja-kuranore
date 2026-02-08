import { Plus, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useGetQuizzes, useDeleteQuiz, useCanCreateLessons } from '../hooks/useQueries';
import { useState } from 'react';
import { toast } from 'sonner';
import { QuizType } from '../backend';

interface QuizPageProps {
  onNavigateToNewQuiz: () => void;
  onNavigateToTakeQuiz: (quizId: string) => void;
}

export default function QuizPage({ onNavigateToNewQuiz, onNavigateToTakeQuiz }: QuizPageProps) {
  const { data: quizzes = [], isLoading } = useGetQuizzes();
  const deleteQuizMutation = useDeleteQuiz();
  const canCreateLessons = useCanCreateLessons();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  const handleDeleteClick = (quizId: string) => {
    setQuizToDelete(quizId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!quizToDelete) return;

    try {
      await deleteQuizMutation.mutateAsync(quizToDelete);
      toast.success('Kuizi u fshi me sukses');
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    } catch (error) {
      toast.error('Gabim gjatë fshirjes së kuizit');
      console.error('Error deleting quiz:', error);
    }
  };

  const getQuizTypeLabel = (type: QuizType) => {
    if (type === QuizType.wordGuess) return 'Mendo Fjalën';
    if (type === QuizType.multipleChoice) return 'Zgjedhje e Shumëfishtë';
    return type;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('sq-AL', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Duke ngarkuar kuizet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Kuizet</h1>
          <p className="text-muted-foreground">
            {canCreateLessons ? 'Krijo dhe menaxho kuizet për nxënësit' : 'Zgjidh një kuiz për të filluar'}
          </p>
        </div>

        {quizzes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center mb-4">
                {canCreateLessons ? 'Nuk ka kuize të krijuara ende.' : 'Nuk ka kuize të disponueshme aktualisht.'}
              </p>
              {canCreateLessons && (
                <Button onClick={onNavigateToNewQuiz}>
                  <Plus className="w-4 h-4 mr-2" />
                  Krijo Kuizin e Parë
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{quiz.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {getQuizTypeLabel(quiz.quizType)}
                        </span>
                      </CardDescription>
                    </div>
                    {canCreateLessons && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(quiz.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(quiz.createdAt)}</span>
                  </div>
                  <Button 
                    onClick={() => onNavigateToTakeQuiz(quiz.id)}
                    className="w-full"
                  >
                    Fillo Kuizin
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Floating Action Button for Teachers */}
        {canCreateLessons && (
          <button
            onClick={onNavigateToNewQuiz}
            className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-10"
            aria-label="Krijo Kuiz të Ri"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmo Fshirjen</AlertDialogTitle>
            <AlertDialogDescription>
              A jeni të sigurt që dëshironi të fshini këtë kuiz? Ky veprim nuk mund të zhbëhet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Fshi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
