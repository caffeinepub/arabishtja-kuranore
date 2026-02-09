import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useGetLessonById } from '../hooks/useQueries';
import WordFormWithTooltip from '../components/WordFormWithTooltip';
import { sanitizeHtml, getPlainTextFromHtml } from '../utils/richText';

interface ViewLessonPageProps {
  lessonId: string;
  onBack: () => void;
}

export default function ViewLessonPage({ lessonId, onBack }: ViewLessonPageProps) {
  const { data: lessonData, isLoading } = useGetLessonById(lessonId);
  const [isContentExpanded, setIsContentExpanded] = useState(false);

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

  const { lesson, words, ayahs } = lessonData;

  // Check if content is long (based on plain text length)
  const plainTextContent = getPlainTextFromHtml(lesson.content);
  const isLongContent = plainTextContent.length > 300;

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
            <h2 className="text-3xl font-bold text-foreground">{lesson.title}</h2>
          </div>
        </div>

        {/* Lesson Content */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Përmbajtja</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div
                className={`prose prose-sm max-w-none dark:prose-invert ${
                  isLongContent && !isContentExpanded ? 'max-h-[200px] overflow-hidden' : ''
                }`}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }}
              />
              {isLongContent && !isContentExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card to-transparent" />
              )}
            </div>
            {isLongContent && (
              <Button
                variant="ghost"
                onClick={() => setIsContentExpanded(!isContentExpanded)}
                className="mt-4 w-full gap-2"
              >
                {isContentExpanded ? (
                  <>
                    Shfaq më pak
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Shfaq më shumë
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Words Section */}
        {words.length > 0 && (
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Fjalori</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {words.map((word, index) => (
                  <AccordionItem key={index} value={`word-${index}`} className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="text-lg font-semibold text-right" dir="rtl">
                          {word.arabic}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-3">
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
                            <div className="flex flex-wrap gap-2 mt-2">
                              {word.forms.map((form, i) => (
                                <WordFormWithTooltip
                                  key={i}
                                  form={form}
                                  meaning={word.formMeanings[i] || ''}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Ayahs Section */}
        {ayahs.length > 0 && (
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Ajetet</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {ayahs.map((ayah, index) => (
                  <AccordionItem key={index} value={`ayah-${index}`} className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="text-lg font-semibold text-right line-clamp-1" dir="rtl">
                          {ayah.text}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Teksti:</span>
                          <p className="text-lg text-right mt-1" dir="rtl">{ayah.text}</p>
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
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
