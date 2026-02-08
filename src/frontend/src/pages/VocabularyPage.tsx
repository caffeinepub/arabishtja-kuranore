import { useState, useMemo } from 'react';
import { useGetAllLessonsWithWordsAndAyahs, useDeleteWordFromLesson, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookText, ArrowUpDown, Trash2 } from 'lucide-react';
import WordFormWithTooltip from '../components/WordFormWithTooltip';
import { toast } from 'sonner';
import type { Word } from '../backend';

type SortField = 'arabic' | 'albanian';
type SortDirection = 'asc' | 'desc';

export default function VocabularyPage() {
  const { data: lessonsWithWordsAndAyahs, isLoading } = useGetAllLessonsWithWordsAndAyahs();
  const { data: userProfile } = useGetCallerUserProfile();
  const deleteWordFromLesson = useDeleteWordFromLesson();
  
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('arabic');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [wordToDelete, setWordToDelete] = useState<{ word: string; lessonId: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const canManageVocabulary = userProfile?.role === 'admin' || userProfile?.role === 'mesuesi';

  const toggleWordReveal = (wordKey: string) => {
    setRevealedWords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(wordKey)) {
        newSet.delete(wordKey);
      } else {
        newSet.add(wordKey);
      }
      return newSet;
    });
  };

  const openDetailsDialog = (word: Word) => {
    setSelectedWord(word);
    setIsDetailsOpen(true);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDeleteClick = (word: string, lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWordToDelete({ word, lessonId });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!wordToDelete) return;

    try {
      await deleteWordFromLesson.mutateAsync({
        word: wordToDelete.word,
        lessonId: wordToDelete.lessonId,
      });
      toast.success('Fjala u fshi me sukses nga mësimi');
      setIsDeleteDialogOpen(false);
      setWordToDelete(null);
    } catch (error: any) {
      toast.error('Gabim gjatë fshirjes së fjalës');
      console.error(error);
      setIsDeleteDialogOpen(false);
      setWordToDelete(null);
    }
  };

  const allWords = useMemo(() => {
    if (!lessonsWithWordsAndAyahs) return [];
    
    const words: Array<Word & { lessonTitle: string }> = [];
    lessonsWithWordsAndAyahs.forEach((lessonData) => {
      lessonData.words.forEach((word) => {
        words.push({
          ...word,
          lessonTitle: lessonData.lesson.title,
        });
      });
    });
    
    return words;
  }, [lessonsWithWordsAndAyahs]);

  const sortedWords = useMemo(() => {
    const sorted = [...allWords];
    
    sorted.sort((a, b) => {
      let compareValue = 0;
      
      if (sortField === 'arabic') {
        compareValue = a.arabic.localeCompare(b.arabic, 'ar');
      } else {
        const aMeaning = a.albanianMeanings[0] || '';
        const bMeaning = b.albanianMeanings[0] || '';
        compareValue = aMeaning.localeCompare(bMeaning, 'sq');
      }
      
      return sortDirection === 'asc' ? compareValue : -compareValue;
    });
    
    return sorted;
  }, [allWords, sortField, sortDirection]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Duke ngarkuar fjalorin...</p>
        </div>
      </div>
    );
  }

  const totalWords = allWords.length;

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Fjalori</h2>
          <p className="text-muted-foreground">
            Të gjitha fjalët e ruajtura nga mësimet tuaja
          </p>
          {totalWords > 0 && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-sm">
                {totalWords} fjalë gjithsej
              </Badge>
            </div>
          )}
        </div>

        {!lessonsWithWordsAndAyahs || lessonsWithWordsAndAyahs.length === 0 || totalWords === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookText className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nuk ka fjalë ende
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Krijoni mësime dhe shtoni fjalë për të ndërtuar fjalorin tuaj
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('albanian')}
                        className="h-auto p-0 hover:bg-transparent font-semibold"
                      >
                        Kuptimi Shqip
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('arabic')}
                        className="h-auto p-0 hover:bg-transparent font-semibold"
                      >
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Fjala Arabe
                      </Button>
                    </TableHead>
                    {canManageVocabulary && (
                      <TableHead className="w-16"></TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedWords.map((word, index) => {
                    const wordKey = `${word.lessonId}-${word.arabic}-${index}`;
                    const isRevealed = revealedWords.has(wordKey);
                    const firstMeaning = word.albanianMeanings[0] || '';

                    return (
                      <TableRow key={wordKey} className="hover:bg-accent/50">
                        <TableCell
                          className="text-left cursor-pointer"
                          onClick={() => toggleWordReveal(wordKey)}
                        >
                          {isRevealed ? (
                            <span className="text-foreground">{firstMeaning}</span>
                          ) : (
                            <span className="text-muted-foreground">*****</span>
                          )}
                        </TableCell>
                        <TableCell 
                          className="text-right cursor-pointer"
                          onClick={() => openDetailsDialog(word)}
                        >
                          <span className="text-lg font-bold text-foreground" dir="rtl">
                            {word.arabic}
                          </span>
                        </TableCell>
                        {canManageVocabulary && (
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleDeleteClick(word.arabic, word.lessonId, e)}
                              disabled={deleteWordFromLesson.isPending}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center" dir="rtl">
              {selectedWord?.arabic}
            </DialogTitle>
          </DialogHeader>
          {selectedWord && (
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Kuptimet në Shqip:
                </h3>
                <div className="space-y-2">
                  {selectedWord.albanianMeanings.map((meaning, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                      <p className="text-base text-foreground">{meaning}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedWord.forms.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    Format e fjalës:
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {selectedWord.forms.map((form, i) => (
                      <WordFormWithTooltip
                        key={i}
                        form={form}
                        meaning={selectedWord.formMeanings?.[i]}
                        variant="outline"
                        className="text-base px-3 py-1"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmo fshirjen</AlertDialogTitle>
            <AlertDialogDescription>
              A jeni të sigurt që dëshironi të fshini këtë fjalë nga mësimi? Nëse fjala nuk përdoret në asnjë mësim tjetër, ajo do të fshihet përfundimisht nga fjalori.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteWordFromLesson.isPending}>
              Anulo
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteWordFromLesson.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteWordFromLesson.isPending ? 'Duke fshirë...' : 'Fshi'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
