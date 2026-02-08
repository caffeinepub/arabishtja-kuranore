import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGetNotesByAssociatedId, useCreateNote, useUpdateNote, useDeleteNote } from '../hooks/useQueries';
import { NoteType } from '../backend';
import { Trash2, Edit2, Save, X, Calendar } from 'lucide-react';
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

interface NoteDialogProps {
  open: boolean;
  onClose: () => void;
  associatedId: string;
  noteType: NoteType;
  itemLabel: string;
}

export default function NoteDialog({ open, onClose, associatedId, noteType, itemLabel }: NoteDialogProps) {
  const { data: notes, isLoading } = useGetNotesByAssociatedId(associatedId);
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setNewNoteContent('');
      setEditingNoteId(null);
      setEditingContent('');
    }
  }, [open]);

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return;

    await createNoteMutation.mutateAsync({
      content: newNoteContent,
      associatedId,
      noteType,
    });
    setNewNoteContent('');
  };

  const handleStartEdit = (noteId: string, content: string) => {
    setEditingNoteId(noteId);
    setEditingContent(content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const handleSaveEdit = async () => {
    if (!editingNoteId || !editingContent.trim()) return;

    await updateNoteMutation.mutateAsync({
      noteId: editingNoteId,
      content: editingContent,
    });
    setEditingNoteId(null);
    setEditingContent('');
  };

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
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shënimet për: {itemLabel}</DialogTitle>
            <DialogDescription>
              Menaxho shënimet e tua personale për këtë {noteType === NoteType.word ? 'fjalë' : 'ajet'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Existing Notes */}
            {isLoading ? (
              <div className="text-center py-4">
                <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                <p className="text-sm text-muted-foreground">Duke ngarkuar shënimet...</p>
              </div>
            ) : notes && notes.length > 0 ? (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Shënimet ekzistuese:</Label>
                {notes.map((note) => (
                  <Card key={note.id} className="shadow-sm">
                    <CardContent className="pt-4">
                      {editingNoteId === note.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            rows={4}
                            className="resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                              disabled={updateNoteMutation.isPending}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Anulo
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={updateNoteMutation.isPending || !editingContent.trim()}
                            >
                              <Save className="w-4 h-4 mr-1" />
                              {updateNoteMutation.isPending ? 'Duke ruajtur...' : 'Ruaj'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-foreground whitespace-pre-wrap break-words mb-3">
                            {note.content}
                          </p>
                          <Separator className="my-3" />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(note.createdAt)}</span>
                              {note.updatedAt && (
                                <Badge variant="outline" className="text-xs">
                                  Përditësuar
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEdit(note.id, note.content)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(note.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nuk ka shënime për këtë {noteType === NoteType.word ? 'fjalë' : 'ajet'} ende.
              </p>
            )}

            {/* Add New Note */}
            <div className="space-y-2">
              <Label htmlFor="new-note">Shto shënim të ri:</Label>
              <Textarea
                id="new-note"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Shkruaj shënimin tënd këtu..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Mbyll
            </Button>
            <Button
              onClick={handleCreateNote}
              disabled={createNoteMutation.isPending || !newNoteContent.trim()}
            >
              {createNoteMutation.isPending ? 'Duke shtuar...' : 'Shto Shënim'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </>
  );
}
