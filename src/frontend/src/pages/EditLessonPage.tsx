import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { useUpdateLesson, useGetWordsByLesson, useAddWordToLesson, useGetAllLessons, useGetLessonAyahs, useAddAyahToLesson, useUpdateLessonAyah, useDeleteWordFromLesson } from '../hooks/useQueries';
import type { Word, Ayah } from '../backend';

interface EditLessonPageProps {
  lessonId: string;
  onBack: () => void;
}

export default function EditLessonPage({ lessonId, onBack }: EditLessonPageProps) {
  const { data: lessons } = useGetAllLessons();
  const { data: existingWords, isLoading: wordsLoading } = useGetWordsByLesson(lessonId);
  const { data: existingAyahs, isLoading: ayahsLoading } = useGetLessonAyahs(lessonId);
  const updateLesson = useUpdateLesson();
  const addWordToLesson = useAddWordToLesson();
  const addAyahToLesson = useAddAyahToLesson();
  const updateLessonAyah = useUpdateLessonAyah();
  const deleteWordFromLesson = useDeleteWordFromLesson();

  const [showWordDialog, setShowWordDialog] = useState(false);
  const [showAyahDialog, setShowAyahDialog] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [visibleToStudents, setVisibleToStudents] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  
  // Word form state
  const [arabicWord, setArabicWord] = useState('');
  const [albanianMeanings, setAlbanianMeanings] = useState<string[]>(['']);
  const [forms, setForms] = useState<string[]>(['']);
  const [formMeanings, setFormMeanings] = useState<string[]>(['']);
  const [editingWordIndex, setEditingWordIndex] = useState<number | null>(null);

  // Ayah form state
  const [ayahText, setAyahText] = useState('');
  const [ayahTranslation, setAyahTranslation] = useState('');
  const [ayahReference, setAyahReference] = useState('');
  const [editingAyahIndex, setEditingAyahIndex] = useState<number | null>(null);

  // Delete confirmation state
  const [wordToDelete, setWordToDelete] = useState<{ word: string; index: number } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Load lesson data
  useEffect(() => {
    if (lessons) {
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson) {
        setLessonTitle(lesson.title);
        setLessonContent(lesson.content);
        setVisibleToStudents(lesson.visibleToStudents);
      }
    }
  }, [lessons, lessonId]);

  // Load existing words
  useEffect(() => {
    if (existingWords) {
      setWords(existingWords);
    }
  }, [existingWords]);

  // Load existing ayahs
  useEffect(() => {
    if (existingAyahs) {
      setAyahs(existingAyahs);
    }
  }, [existingAyahs]);

  const handleAddMeaning = () => {
    setAlbanianMeanings([...albanianMeanings, '']);
  };

  const handleRemoveMeaning = (index: number) => {
    if (albanianMeanings.length > 1) {
      setAlbanianMeanings(albanianMeanings.filter((_, i) => i !== index));
    }
  };

  const handleMeaningChange = (index: number, value: string) => {
    const updated = [...albanianMeanings];
    updated[index] = value;
    setAlbanianMeanings(updated);
  };

  const handleAddForm = () => {
    setForms([...forms, '']);
    setFormMeanings([...formMeanings, '']);
  };

  const handleRemoveForm = (index: number) => {
    if (forms.length > 1) {
      setForms(forms.filter((_, i) => i !== index));
      setFormMeanings(formMeanings.filter((_, i) => i !== index));
    }
  };

  const handleFormChange = (index: number, value: string) => {
    const updated = [...forms];
    updated[index] = value;
    setForms(updated);
  };

  const handleFormMeaningChange = (index: number, value: string) => {
    const updated = [...formMeanings];
    updated[index] = value;
    setFormMeanings(updated);
  };

  const handleEditWord = (index: number) => {
    const word = words[index];
    setArabicWord(word.arabic);
    setAlbanianMeanings(word.albanianMeanings.length > 0 ? word.albanianMeanings : ['']);
    setForms(word.forms.length > 0 ? word.forms : ['']);
    setFormMeanings(word.formMeanings.length > 0 ? word.formMeanings : ['']);
    setEditingWordIndex(index);
    setShowWordDialog(true);
  };

  const handleSaveWord = async () => {
    if (!arabicWord.trim()) {
      toast.error('Ju lutem shkruani fjalën në arabisht');
      return;
    }

    const validMeanings = albanianMeanings.filter(m => m.trim() !== '');
    if (validMeanings.length === 0) {
      toast.error('Ju lutem shtoni të paktën një kuptim');
      return;
    }

    const validForms = forms.filter(f => f.trim() !== '');
    const validFormMeanings = formMeanings.filter(fm => fm.trim() !== '');

    if (editingWordIndex !== null) {
      // Update existing word in local state
      const updatedWords = [...words];
      updatedWords[editingWordIndex] = {
        arabic: arabicWord.trim(),
        albanianMeanings: validMeanings,
        forms: validForms,
        formMeanings: validFormMeanings,
        lessonId,
      };
      setWords(updatedWords);
      
      // Reset form
      setArabicWord('');
      setAlbanianMeanings(['']);
      setForms(['']);
      setFormMeanings(['']);
      setEditingWordIndex(null);
      setShowWordDialog(false);
      
      toast.success('Fjala u përditësua me sukses!');
    } else {
      // Add new word to backend
      try {
        await addWordToLesson.mutateAsync({
          arabic: arabicWord.trim(),
          albanianMeanings: validMeanings,
          forms: validForms,
          formMeanings: validFormMeanings,
          lessonId,
        });

        const newWord: Word = {
          arabic: arabicWord.trim(),
          albanianMeanings: validMeanings,
          forms: validForms,
          formMeanings: validFormMeanings,
          lessonId,
        };

        setWords([...words, newWord]);
        
        // Reset form
        setArabicWord('');
        setAlbanianMeanings(['']);
        setForms(['']);
        setFormMeanings(['']);
        setShowWordDialog(false);
        
        toast.success('Fjala u shtua me sukses!');
      } catch (error) {
        toast.error('Gabim gjatë shtimit të fjalës');
        console.error(error);
      }
    }
  };

  const handleCancelWordDialog = () => {
    setArabicWord('');
    setAlbanianMeanings(['']);
    setForms(['']);
    setFormMeanings(['']);
    setEditingWordIndex(null);
    setShowWordDialog(false);
  };

  const handleRemoveWordClick = (index: number) => {
    const word = words[index];
    setWordToDelete({ word: word.arabic, index });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteWord = async () => {
    if (!wordToDelete) return;

    try {
      await deleteWordFromLesson.mutateAsync({
        word: wordToDelete.word,
        lessonId,
      });
      
      setWords(words.filter((_, i) => i !== wordToDelete.index));
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

  const handleEditAyah = (index: number) => {
    const ayah = ayahs[index];
    setAyahText(ayah.text);
    setAyahTranslation(ayah.translation || '');
    setAyahReference(ayah.reference || '');
    setEditingAyahIndex(index);
    setShowAyahDialog(true);
  };

  const handleSaveAyah = async () => {
    if (!ayahText.trim()) {
      toast.error('Ju lutem shkruani tekstin e ajetit');
      return;
    }

    if (editingAyahIndex !== null) {
      // Update existing ayah
      try {
        await updateLessonAyah.mutateAsync({
          lessonId,
          ayahIndex: editingAyahIndex,
          text: ayahText.trim(),
          translation: ayahTranslation.trim() || null,
          reference: ayahReference.trim() || null,
        });

        const updatedAyahs = [...ayahs];
        updatedAyahs[editingAyahIndex] = {
          text: ayahText.trim(),
          translation: ayahTranslation.trim() || undefined,
          reference: ayahReference.trim() || undefined,
        };
        setAyahs(updatedAyahs);
        
        // Reset form
        setAyahText('');
        setAyahTranslation('');
        setAyahReference('');
        setEditingAyahIndex(null);
        setShowAyahDialog(false);
        
        toast.success('Ajeti u përditësua me sukses!');
      } catch (error) {
        toast.error('Gabim gjatë përditësimit të ajetit');
        console.error(error);
      }
    } else {
      // Add new ayah
      try {
        await addAyahToLesson.mutateAsync({
          lessonId,
          text: ayahText.trim(),
          translation: ayahTranslation.trim() || null,
          reference: ayahReference.trim() || null,
        });

        const newAyah: Ayah = {
          text: ayahText.trim(),
          translation: ayahTranslation.trim() || undefined,
          reference: ayahReference.trim() || undefined,
        };

        setAyahs([...ayahs, newAyah]);
        
        // Reset form
        setAyahText('');
        setAyahTranslation('');
        setAyahReference('');
        setShowAyahDialog(false);
        
        toast.success('Ajeti u shtua me sukses!');
      } catch (error) {
        toast.error('Gabim gjatë shtimit të ajetit');
        console.error(error);
      }
    }
  };

  const handleCancelAyahDialog = () => {
    setAyahText('');
    setAyahTranslation('');
    setAyahReference('');
    setEditingAyahIndex(null);
    setShowAyahDialog(false);
  };

  const handleRemoveAyah = (index: number) => {
    setAyahs(ayahs.filter((_, i) => i !== index));
    toast.success('Ajeti u hoq nga lista');
  };

  const handleSaveLesson = async () => {
    if (!lessonTitle.trim()) {
      toast.error('Ju lutem shkruani titullin e mësimit');
      return;
    }

    if (!lessonContent.trim()) {
      toast.error('Ju lutem shkruani përmbajtjen e mësimit');
      return;
    }

    try {
      await updateLesson.mutateAsync({
        lessonId,
        title: lessonTitle.trim(),
        content: lessonContent.trim(),
        visibleToStudents,
      });

      toast.success('Mësimi u përditësua me sukses!');
      onBack();
    } catch (error) {
      toast.error('Gabim gjatë përditësimit të mësimit');
      console.error(error);
    }
  };

  if (wordsLoading || ayahsLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Duke ngarkuar mësimin...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full overflow-auto bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header with back button */}
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-foreground">Ndrysho mësimin</h2>
              <p className="text-muted-foreground">
                Përditësoni fjalor dhe ajete për mësimin tuaj
              </p>
            </div>
          </div>

          {/* Lesson Details */}
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Detajet e mësimit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titulli</Label>
                <Input
                  id="title"
                  placeholder="Shkruani titullin e mësimit"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="content">Përmbajtja</Label>
                <Textarea
                  id="content"
                  placeholder="Shkruani përmbajtjen e mësimit"
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="visibility" className="flex items-center gap-2 cursor-pointer">
                  {visibleToStudents ? (
                    <>
                      <Eye className="w-4 h-4" />
                      I dukshëm për nxënësit
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      I fshehur nga nxënësit
                    </>
                  )}
                </Label>
                <Switch
                  id="visibility"
                  checked={visibleToStudents}
                  onCheckedChange={setVisibleToStudents}
                />
              </div>
            </CardContent>
          </Card>

          {/* Main content sections */}
          <div className="space-y-6">
            {/* Fjalori Section */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Fjalori</CardTitle>
              </CardHeader>
              <CardContent>
                {words.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground mb-4 text-center">
                      Shtoni fjalë të reja në fjalor për këtë mësim
                    </p>
                    <Button className="gap-2" onClick={() => setShowWordDialog(true)}>
                      <Plus className="w-4 h-4" />
                      Shto Fjalë
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      {words.map((word, index) => (
                        <Card key={index} className="border-2">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">Arabisht:</span>
                                  <p className="text-lg font-semibold text-right" dir="rtl">{word.arabic}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">Kuptimi:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {word.albanianMeanings.map((meaning, i) => (
                                      <Badge key={i} variant="secondary">{meaning}</Badge>
                                    ))}
                                  </div>
                                </div>
                                {word.forms.length > 0 && (
                                  <div>
                                    <span className="text-sm font-medium text-muted-foreground">Format:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {word.forms.map((form, i) => (
                                        <Badge key={i} variant="outline" className="text-right" dir="rtl">{form}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-primary hover:text-primary hover:bg-primary/10"
                                  onClick={() => handleEditWord(index)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleRemoveWordClick(index)}
                                  disabled={deleteWordFromLesson.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <Button className="gap-2 w-full" onClick={() => setShowWordDialog(true)}>
                      <Plus className="w-4 h-4" />
                      Shto Fjalë Tjetër
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ajetet Section */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Ajetet</CardTitle>
              </CardHeader>
              <CardContent>
                {ayahs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground mb-4 text-center">
                      Shtoni ajete (vargje) për këtë mësim
                    </p>
                    <Button className="gap-2" onClick={() => setShowAyahDialog(true)}>
                      <Plus className="w-4 h-4" />
                      Shto Ajet
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      {ayahs.map((ayah, index) => (
                        <Card key={index} className="border-2">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">Teksti:</span>
                                  <p className="text-lg font-semibold text-right mt-1" dir="rtl">{ayah.text}</p>
                                </div>
                                {ayah.translation && (
                                  <div>
                                    <span className="text-sm font-medium text-muted-foreground">Përkthimi:</span>
                                    <p className="mt-1">{ayah.translation}</p>
                                  </div>
                                )}
                                {ayah.reference && (
                                  <div>
                                    <span className="text-sm font-medium text-muted-foreground">Referenca:</span>
                                    <Badge variant="outline" className="ml-2">{ayah.reference}</Badge>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-primary hover:text-primary hover:bg-primary/10"
                                  onClick={() => handleEditAyah(index)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleRemoveAyah(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <Button className="gap-2 w-full" onClick={() => setShowAyahDialog(true)}>
                      <Plus className="w-4 h-4" />
                      Shto Ajet Tjetër
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Save Lesson Button */}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onBack}>
              Anulo
            </Button>
            <Button 
              onClick={handleSaveLesson}
              disabled={updateLesson.isPending || !lessonTitle.trim() || !lessonContent.trim()}
            >
              {updateLesson.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Duke ruajtur...
                </>
              ) : (
                'Ruaj Ndryshimet'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Add/Edit Word Dialog */}
      <Dialog open={showWordDialog} onOpenChange={handleCancelWordDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingWordIndex !== null ? 'Ndrysho Fjalën' : 'Shto Fjalë të Re'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {/* Arabic Word */}
              <div>
                <Label htmlFor="arabic">Fjala në Arabisht *</Label>
                <Input
                  id="arabic"
                  placeholder="Shkruani fjalën në arabisht"
                  value={arabicWord}
                  onChange={(e) => setArabicWord(e.target.value)}
                  dir="rtl"
                  className="text-right"
                />
              </div>

              {/* Albanian Meanings */}
              <div>
                <Label>Kuptimi në Shqip *</Label>
                <div className="space-y-2 mt-2">
                  {albanianMeanings.map((meaning, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Kuptimi ${index + 1}`}
                        value={meaning}
                        onChange={(e) => handleMeaningChange(index, e.target.value)}
                      />
                      {albanianMeanings.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMeaning(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddMeaning}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Shto Kuptim Tjetër
                  </Button>
                </div>
              </div>

              {/* Forms with Meanings */}
              <div>
                <Label>Format e Disponueshme</Label>
                <div className="space-y-2 mt-2">
                  {forms.map((form, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder={`Forma ${index + 1} (Arabisht)`}
                            value={form}
                            onChange={(e) => handleFormChange(index, e.target.value)}
                            dir="rtl"
                            className="text-right"
                          />
                          <Input
                            placeholder={`Kuptimi i formës ${index + 1} (Shqip)`}
                            value={formMeanings[index] || ''}
                            onChange={(e) => handleFormMeaningChange(index, e.target.value)}
                          />
                        </div>
                        {forms.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveForm(index)}
                            className="shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddForm}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Shto Formë Tjetër
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelWordDialog}>
              Anulo
            </Button>
            <Button onClick={handleSaveWord} disabled={editingWordIndex === null && addWordToLesson.isPending}>
              {editingWordIndex === null && addWordToLesson.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Duke ruajtur...
                </>
              ) : (
                editingWordIndex !== null ? 'Ruaj Ndryshimet' : 'Ruaj Fjalën'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Ayah Dialog */}
      <Dialog open={showAyahDialog} onOpenChange={handleCancelAyahDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingAyahIndex !== null ? 'Ndrysho Ajetin' : 'Shto Ajet të Ri'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {/* Ayah Text */}
              <div>
                <Label htmlFor="ayahText">Teksti i Ajetit (Arabisht) *</Label>
                <Textarea
                  id="ayahText"
                  placeholder="Shkruani tekstin e ajetit në arabisht"
                  value={ayahText}
                  onChange={(e) => setAyahText(e.target.value)}
                  dir="rtl"
                  className="text-right"
                  rows={4}
                />
              </div>

              {/* Translation */}
              <div>
                <Label htmlFor="ayahTranslation">Përkthimi (Shqip)</Label>
                <Textarea
                  id="ayahTranslation"
                  placeholder="Shkruani përkthimin e ajetit në shqip (opsionale)"
                  value={ayahTranslation}
                  onChange={(e) => setAyahTranslation(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Reference */}
              <div>
                <Label htmlFor="ayahReference">Referenca</Label>
                <Input
                  id="ayahReference"
                  placeholder="p.sh. Surja Al-Fatiha, Ajeti 1"
                  value={ayahReference}
                  onChange={(e) => setAyahReference(e.target.value)}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelAyahDialog}>
              Anulo
            </Button>
            <Button 
              onClick={handleSaveAyah} 
              disabled={
                (editingAyahIndex === null && addAyahToLesson.isPending) || 
                (editingAyahIndex !== null && updateLessonAyah.isPending)
              }
            >
              {((editingAyahIndex === null && addAyahToLesson.isPending) || 
                (editingAyahIndex !== null && updateLessonAyah.isPending)) ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Duke ruajtur...
                </>
              ) : (
                editingAyahIndex !== null ? 'Ruaj Ndryshimet' : 'Ruaj Ajetin'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Word Confirmation Dialog */}
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
              onClick={handleConfirmDeleteWord}
              disabled={deleteWordFromLesson.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteWordFromLesson.isPending ? 'Duke fshirë...' : 'Fshi'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
