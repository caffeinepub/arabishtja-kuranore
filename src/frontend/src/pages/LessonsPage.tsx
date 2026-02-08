import { useState } from 'react';
import { useGetAllLessons, useCanCreateLessons, useDeleteLesson, useSetLessonActive, useSetLessonVisibility } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { BookOpen, Calendar, Plus, Trash2, Pencil, Eye, EyeOff } from 'lucide-react';
import type { Lesson } from '../backend';

interface LessonsPageProps {
  onNavigateToNewLesson: () => void;
  onNavigateToEditLesson: (lessonId: string) => void;
  onNavigateToViewLesson: (lessonId: string) => void;
}

export default function LessonsPage({ onNavigateToNewLesson, onNavigateToEditLesson, onNavigateToViewLesson }: LessonsPageProps) {
  const { data: lessons, isLoading } = useGetAllLessons();
  const canCreateLessons = useCanCreateLessons();
  const { identity } = useInternetIdentity();
  const deleteLesson = useDeleteLesson();
  const setLessonActive = useSetLessonActive();
  const setLessonVisibility = useSetLessonVisibility();

  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);

  const isAuthor = (lesson: Lesson) => {
    if (!identity) return false;
    return lesson.author.toString() === identity.getPrincipal().toString();
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;

    try {
      await deleteLesson.mutateAsync(lessonToDelete.id);
      toast.success('Mësimi u fshi me sukses!');
      setLessonToDelete(null);
    } catch (error) {
      toast.error('Gabim gjatë fshirjes së mësimit');
      console.error(error);
    }
  };

  const handleToggleActive = async (lesson: Lesson, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await setLessonActive.mutateAsync({
        lessonId: lesson.id,
        isActive: !lesson.isActive,
      });
      toast.success(lesson.isActive ? 'Mësimi u çaktivizua' : 'Mësimi u aktivizua');
    } catch (error) {
      toast.error('Gabim gjatë ndryshimit të statusit');
      console.error(error);
    }
  };

  const handleToggleVisibility = async (lesson: Lesson, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await setLessonVisibility.mutateAsync({
        lessonId: lesson.id,
        visibleToStudents: !lesson.visibleToStudents,
      });
      toast.success(lesson.visibleToStudents ? 'Mësimi u fsheh nga nxënësit' : 'Mësimi u bë i dukshëm për nxënësit');
    } catch (error) {
      toast.error('Gabim gjatë ndryshimit të dukshmërisë');
      console.error(error);
    }
  };

  const handleEditLesson = (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigateToEditLesson(lessonId);
  };

  const handleCardClick = (lesson: Lesson) => {
    if (canCreateLessons) {
      // Teachers/admins can edit
      onNavigateToEditLesson(lesson.id);
    } else {
      // Students view in read-only mode
      onNavigateToViewLesson(lesson.id);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Duke ngarkuar mësimet...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full overflow-auto bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
        <div className="container mx-auto px-4 py-6 max-w-6xl pb-24">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">Mësimet</h2>
            <p className="text-muted-foreground">
              {canCreateLessons ? 'Shfletoni dhe menaxhoni mësimet tuaja të ruajtura' : 'Shfletoni mësimet e disponueshme'}
            </p>
          </div>

          {!lessons || lessons.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Nuk ka mësime ende
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {canCreateLessons ? 'Krijoni mësimin e parë duke klikuar butonin +' : 'Nuk ka mësime të disponueshme aktualisht'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.map((lesson) => (
                <Card
                  key={lesson.id}
                  className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleCardClick(lesson)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{lesson.title}</CardTitle>
                      <div className="flex items-center gap-1 shrink-0">
                        {isAuthor(lesson) && canCreateLessons && (
                          <Badge variant="secondary">
                            Juaj
                          </Badge>
                        )}
                        {lesson.isActive && (
                          <Badge variant="default">
                            Aktiv
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-3 mt-2">
                      {lesson.content}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(lesson.createdAt)}</span>
                      </div>
                    </div>
                    {canCreateLessons && (
                      <div className="space-y-3 pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`active-${lesson.id}`} className="text-sm cursor-pointer">
                            Aktiv
                          </Label>
                          <Switch
                            id={`active-${lesson.id}`}
                            checked={lesson.isActive}
                            onCheckedChange={() => handleToggleActive(lesson, { stopPropagation: () => {} } as React.MouseEvent)}
                            disabled={setLessonActive.isPending}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`visible-${lesson.id}`} className="text-sm cursor-pointer flex items-center gap-2">
                            {lesson.visibleToStudents ? (
                              <>
                                <Eye className="w-4 h-4" />
                                I dukshëm
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4" />
                                I fshehur
                              </>
                            )}
                          </Label>
                          <Switch
                            id={`visible-${lesson.id}`}
                            checked={lesson.visibleToStudents}
                            onCheckedChange={() => handleToggleVisibility(lesson, { stopPropagation: () => {} } as React.MouseEvent)}
                            disabled={setLessonVisibility.isPending}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={(e) => handleEditLesson(lesson.id, e)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLessonToDelete(lesson);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Floating Action Button - Visible for Teachers and Administrators */}
        {canCreateLessons && (
          <button
            onClick={onNavigateToNewLesson}
            className="fixed bottom-20 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-primary/50 active:scale-95 z-10"
            aria-label="Krijo mësim të ri"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!lessonToDelete} onOpenChange={(open) => !open && setLessonToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jeni të sigurt?</AlertDialogTitle>
            <AlertDialogDescription>
              Ky veprim nuk mund të zhbëhet. Mësimi "{lessonToDelete?.title}" do të fshihet përgjithmonë.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLesson.isPending}>
              Anulo
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              disabled={deleteLesson.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLesson.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-destructive-foreground border-t-transparent" />
                  Duke fshirë...
                </>
              ) : (
                'Fshi mësimin'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
