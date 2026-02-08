import { useGetNotesByUser, useDeleteNote } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StickyNote, Trash2, Calendar } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { NoteType } from '../backend';

export default function NotesPage() {
  const { data: notes, isLoading } = useGetNotesByUser();
  const deleteNoteMutation = useDeleteNote();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const handleDeleteClick = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (noteToDelete) {
      await deleteNoteMutation.mutateAsync(noteToDelete);
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getNoteTypeLabel = (noteType: NoteType) => {
    return noteType === NoteType.word ? 'Fjalë' : 'Ajet';
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Duke ngarkuar shënimet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Shënimet e Mia</h2>
          <p className="text-muted-foreground">
            Menaxho shënimet e tua personale për fjalë dhe ajete
          </p>
        </div>

        {!notes || notes.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <StickyNote className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nuk ka shënime
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Nuk ke krijuar ende asnjë shënim. Shto shënime nga faqja e Dërrasës duke klikuar në butonat e shënimeve pranë fjalëve dhe ajeteve.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Card key={note.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2">
                        {getNoteTypeLabel(note.noteType)}
                      </Badge>
                      <CardTitle className="text-sm font-medium text-muted-foreground line-clamp-1">
                        ID: {note.associatedId}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(note.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground mb-4 whitespace-pre-wrap break-words">
                    {note.content}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fshi Shënimin</AlertDialogTitle>
            <AlertDialogDescription>
              A je i sigurt që dëshiron të fshish këtë shënim? Ky veprim nuk mund të zhbëhet.
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
