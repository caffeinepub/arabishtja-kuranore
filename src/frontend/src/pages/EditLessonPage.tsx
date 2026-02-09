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
import { isRichTextEmpty } from '../utils/richText';

interface EditLessonPageProps {
  lessonId: string;
  onBack: () => void;
}

export default function EditLessonPage({ lessonId, onBack }: EditLessonPageProps) {
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [visibleToStudents, setVisibleToStudents] = useState(false);

  const { data: lessonData, isLoading } = useGetLessonById(lessonId);
  const updateLesson = useUpdateLesson();

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

    if (isRichTextEmpty(lessonContent)) {
      toast.error('Ju lutem shkruani përmbajtjen e mësimit');
      return;
    }

    try {
      await updateLesson.mutateAsync({
        lessonId,
        title: lessonTitle.trim(),
        content: lessonContent,
        visibleToStudents,
      });

      toast.success('Mësimi u përditësua me sukses!');
      onBack();
    } catch (error) {
      toast.error('Gabim gjatë përditësimit të mësimit');
      console.error(error);
    }
  };

  const isContentEmpty = isRichTextEmpty(lessonContent);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Duke ngarkuar...</p>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Mësimi nuk u gjet</p>
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
            <h2 className="text-3xl font-bold text-foreground">Ndrysho Mësimin</h2>
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
                placeholder="Shkruani përmbajtjen e mësimit"
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
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onBack}>
            Anulo
          </Button>
          <Button 
            onClick={handleSaveLesson}
            disabled={updateLesson.isPending || !lessonTitle.trim() || isContentEmpty}
          >
            {updateLesson.isPending ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
          </Button>
        </div>
      </div>
    </div>
  );
}
