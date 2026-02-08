import { useState } from 'react';
import { useGetLessonById } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { BookOpen, BookMarked, FileText, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import WordFormWithTooltip from '../components/WordFormWithTooltip';

interface ViewLessonPageProps {
  lessonId: string;
  onBack: () => void;
}

export default function ViewLessonPage({ lessonId, onBack }: ViewLessonPageProps) {
  const { data: lessonData, isLoading } = useGetLessonById(lessonId);
  const [isContentExpanded, setIsContentExpanded] = useState(false);

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
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kthehu
          </Button>

          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
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

  const { lesson, words, ayahs } = lessonData;
  const contentLength = lesson.content.length;
  const isContentLong = contentLength > 200;
  const previewContent = isContentLong && !isContentExpanded 
    ? lesson.content.substring(0, 200) + '...' 
    : lesson.content;

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kthehu
        </Button>

        {/* Page Title - Lesson Title */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">{lesson.title}</h2>
          {/* Page Subtitle - Lesson Content with preserved line breaks */}
          <div>
            <p className="text-muted-foreground text-lg whitespace-pre-line">
              {previewContent}
            </p>
            {isContentLong && (
              <button
                onClick={() => setIsContentExpanded(!isContentExpanded)}
                className="mt-2 flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                aria-label={isContentExpanded ? 'Collapse content' : 'Expand content'}
              >
                {isContentExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>Shfaq më pak</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>Shfaq më shumë</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Fjalët e reja Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookMarked className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-semibold text-foreground">Fjalët e reja</h3>
          </div>

          {words && words.length > 0 ? (
            <Card className="shadow-md">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {words.map((word, index) => (
                    <WordAccordionItem
                      key={index}
                      word={word}
                      index={index}
                    />
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookMarked className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-center">
                  Nuk ka fjalë të shtuar për këtë mësim ende.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Shembujt Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-semibold text-foreground">Shembujt</h3>
          </div>

          {ayahs && ayahs.length > 0 ? (
            <Card className="shadow-md">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {ayahs.map((ayah, index) => (
                    <AyahAccordionItem
                      key={index}
                      ayah={ayah}
                      index={index}
                    />
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-center">
                  Nuk ka ajete të shtuar për këtë mësim ende.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function WordAccordionItem({
  word,
  index,
}: {
  word: any;
  index: number;
}) {
  return (
    <AccordionItem value={`word-${index}`} className="border-b last:border-b-0">
      <AccordionTrigger className="px-6 py-4 hover:no-underline w-full">
        <div className="w-full flex items-start justify-end gap-3">
          <span className="text-lg font-semibold text-foreground text-right flex-1">
            {word.arabic}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-4">
        <div className="space-y-4 pt-2">
          {/* Albanian Meanings */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              Kuptimi:
            </h4>
            <div className="space-y-1">
              {word.albanianMeanings.map((meaning: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-primary font-medium">•</span>
                  <span className="text-foreground text-base">{meaning}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Forms */}
          {word.forms && word.forms.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                  Format:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {word.forms.map((form: string, idx: number) => (
                    <WordFormWithTooltip
                      key={idx}
                      form={form}
                      meaning={word.formMeanings?.[idx]}
                      variant="secondary"
                      className="text-right text-base"
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function AyahAccordionItem({
  ayah,
  index,
}: {
  ayah: any;
  index: number;
}) {
  return (
    <AccordionItem value={`ayah-${index}`} className="border-b last:border-b-0">
      <AccordionTrigger className="px-6 py-4 hover:no-underline w-full">
        <div className="w-full flex items-start justify-end gap-3">
          <span className="text-lg font-semibold text-foreground text-right leading-loose flex-1" dir="rtl">
            {ayah.text}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-4">
        <div className="space-y-4 pt-2">
          {/* Translation */}
          {ayah.translation && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                Përkthimi:
              </h4>
              <p className="text-foreground leading-relaxed">
                {ayah.translation}
              </p>
            </div>
          )}

          {/* Reference */}
          {ayah.reference && (
            <>
              {ayah.translation && <Separator />}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                  Referenca:
                </h4>
                <Badge variant="outline" className="text-xs">
                  {ayah.reference}
                </Badge>
              </div>
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
