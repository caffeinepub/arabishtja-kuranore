import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateQuiz } from '../hooks/useQueries';
import { toast } from 'sonner';
import { QuizType } from '../backend';

interface NewQuizPageProps {
  onBack: () => void;
}

export default function NewQuizPage({ onBack }: NewQuizPageProps) {
  const [title, setTitle] = useState('');
  const [quizType, setQuizType] = useState<QuizType>(QuizType.wordGuess);
  const createQuizMutation = useCreateQuiz();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Ju lutem vendosni një titull për kuizin');
      return;
    }

    try {
      await createQuizMutation.mutateAsync({ title, quizType });
      toast.success('Kuizi u krijua me sukses');
      onBack();
    } catch (error) {
      toast.error('Gabim gjatë krijimit të kuizit');
      console.error('Error creating quiz:', error);
    }
  };

  const getQuizTypeDescription = () => {
    if (quizType === QuizType.wordGuess) {
      return 'Kuizi "Mendo Fjalën" zgjedh 10 fjalë të rastësishme nga fjalori dhe i kërkon nxënësit të tregojë nëse i di ato.';
    } else if (quizType === QuizType.multipleChoice) {
      return 'Kuizi "Zgjedhje e Shumëfishtë" zgjedh 10 fjalë të rastësishme dhe i kërkon nxënësit të zgjedhë kuptimin e saktë nga katër opsione.';
    }
    return '';
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kthehu
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Krijo Kuiz të Ri</h1>
          <p className="text-muted-foreground">Krijo një kuiz të ri për nxënësit</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Detajet e Kuizit</CardTitle>
              <CardDescription>Vendos informacionin bazë për kuizin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titulli i Kuizit</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="p.sh. Kuiz i Fjalëve - Java 1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quizType">Lloji i Kuizit</Label>
                <Select value={quizType} onValueChange={(value) => setQuizType(value as QuizType)}>
                  <SelectTrigger id="quizType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={QuizType.wordGuess}>Mendo Fjalën</SelectItem>
                    <SelectItem value={QuizType.multipleChoice}>Zgjedhje e Shumëfishtë</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {getQuizTypeDescription()}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={createQuizMutation.isPending} className="flex-1">
                  {createQuizMutation.isPending ? 'Duke krijuar...' : 'Krijo Kuizin'}
                </Button>
                <Button type="button" variant="outline" onClick={onBack}>
                  Anulo
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
