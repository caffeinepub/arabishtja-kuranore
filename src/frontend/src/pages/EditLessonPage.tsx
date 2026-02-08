import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useGetLessonById, useUpdateLesson } from '../hooks/useQueries';
import RichTextEditor from '../components/RichTextEditor';

interface EditLessonPageProps {
  lessonId: string;
  onBack: () => void;
}

export default function EditLessonPage({ lessonId, onBack }: EditLessonPageProps) {
  const { data: lessonData, isLoading } = useGetLessonById(lessonId);
  const updateLesson = useUpdateLesson();

  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [visibleToStudents, setVisibleToStudents] = useState(false);

  useEffect(() => {
    if (lessonData) {
      setLessonTitle(lessonData.lesson.title);
      setLessonContent(lessonData.lesson.content);
      setVisibleToStudents(lessonData.lesson.visibleToStudents);
    }
  }, [lessonData]);

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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Duke ngarkuar mësimin...</p>
        </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="h-full overflow-auto bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kthehu
          </Button>
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Mësimi nuk u gjet
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Mësimi që po kërkoni nuk ekziston ose nuk është i disponueshëm.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
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
              Përditësoni detajet e mësimit
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
              <RichTextEditor
                value={lessonContent}
                onChange={setLessonContent}
                placeholder="Shkruani përmbajtjen e mësimit..."
                className="mt-2"
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

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onBack}>
            Anulo
          </Button>
          <Button 
            onClick={handleSaveLesson}
            disabled={updateLesson.isPending || !lessonTitle.trim() || !lessonContent.trim()}
          >
            {updateLesson.isPending ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Duke ruajtur...
              </>
            ) : (
              'Ruaj Ndryshimet'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
