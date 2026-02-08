import { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGetQuiz, useGetRandomWords } from '../hooks/useQueries';
import type { Word, QuizType } from '../backend';

interface TakeQuizPageProps {
  quizId: string;
  onBack: () => void;
}

interface QuizAnswer {
  word: Word;
  knew: boolean;
}

interface MultipleChoiceAnswer {
  word: Word;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface MultipleChoiceQuestion {
  word: Word;
  options: string[];
  correctAnswer: string;
}

export default function TakeQuizPage({ quizId, onBack }: TakeQuizPageProps) {
  const { data: quiz } = useGetQuiz(quizId);
  const { data: allWords = [] } = useGetRandomWords();
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState<MultipleChoiceAnswer[]>([]);
  const [multipleChoiceQuestions, setMultipleChoiceQuestions] = useState<MultipleChoiceQuestion[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (allWords.length > 0 && quiz) {
      const shuffled = [...allWords].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(10, allWords.length));
      setQuizWords(selected);

      // Generate multiple choice questions if quiz type is multipleChoice
      if (quiz.quizType === 'multipleChoice') {
        const questions = selected.map((word) => {
          const correctAnswer = word.albanianMeanings[0];
          
          // Get 3 random incorrect answers from other words
          const otherWords = allWords.filter(w => w.arabic !== word.arabic);
          const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
          const incorrectAnswers = shuffledOthers
            .slice(0, 3)
            .map(w => w.albanianMeanings[0]);
          
          // Combine and shuffle all options
          const options = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);
          
          return {
            word,
            options,
            correctAnswer,
          };
        });
        setMultipleChoiceQuestions(questions);
      }
    }
  }, [allWords, quiz]);

  const currentWord = quizWords[currentQuestionIndex];
  const currentQuestion = multipleChoiceQuestions[currentQuestionIndex];
  const totalQuestions = quizWords.length;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleWordGuessAnswer = (knew: boolean) => {
    if (!currentWord) return;

    const newAnswers = [...answers, { word: currentWord, knew }];
    setAnswers(newAnswers);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setIsFlipped(false);
    } else {
      setShowResults(true);
    }
  };

  const handleMultipleChoiceSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleMultipleChoiceContinue = () => {
    if (!currentQuestion || !selectedOption) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newAnswer: MultipleChoiceAnswer = {
      word: currentQuestion.word,
      selectedAnswer: selectedOption,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
    };

    const newAnswers = [...multipleChoiceAnswers, newAnswer];
    setMultipleChoiceAnswers(newAnswers);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setIsFlipped(false);
    setAnswers([]);
    setMultipleChoiceAnswers([]);
    setSelectedOption(null);
    setShowResults(false);
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(10, allWords.length));
    setQuizWords(selected);

    // Regenerate multiple choice questions
    if (quiz?.quizType === 'multipleChoice') {
      const questions = selected.map((word) => {
        const correctAnswer = word.albanianMeanings[0];
        const otherWords = allWords.filter(w => w.arabic !== word.arabic);
        const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
        const incorrectAnswers = shuffledOthers
          .slice(0, 3)
          .map(w => w.albanianMeanings[0]);
        const options = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);
        
        return {
          word,
          options,
          correctAnswer,
        };
      });
      setMultipleChoiceQuestions(questions);
    }
  };

  if (!quiz || quizWords.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Duke ngarkuar kuizin...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const isMultipleChoice = quiz.quizType === 'multipleChoice';
    const correctCount = isMultipleChoice 
      ? multipleChoiceAnswers.filter(a => a.isCorrect).length
      : answers.filter(a => a.knew).length;
    const incorrectCount = isMultipleChoice
      ? multipleChoiceAnswers.filter(a => !a.isCorrect).length
      : answers.filter(a => !a.knew).length;
    const incorrectWords = isMultipleChoice
      ? multipleChoiceAnswers.filter(a => !a.isCorrect)
      : answers.filter(a => !a.knew);

    return (
      <div className="h-full overflow-y-auto bg-background">
        <div className="max-w-3xl mx-auto p-6">
          <div className="mb-6">
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kthehu
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">Rezultatet e Kuizit</h1>
            <p className="text-muted-foreground">{quiz.title}</p>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <div className="text-3xl font-bold text-success mb-1">{correctCount}</div>
                  <div className="text-sm text-muted-foreground">Të sakta</div>
                </div>
                <div className="text-center p-4 bg-destructive/10 rounded-lg">
                  <div className="text-3xl font-bold text-destructive mb-1">{incorrectCount}</div>
                  <div className="text-sm text-muted-foreground">Të gabuara</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleRestart} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Provo Përsëri
                </Button>
                <Button variant="outline" onClick={onBack}>
                  Përfundo
                </Button>
              </div>
            </CardContent>
          </Card>

          {incorrectWords.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">
                  {isMultipleChoice ? 'Përgjigjet e gabuara' : 'Fjalët që duhen përmirësuar'}
                </h2>
                <div className="space-y-3">
                  {isMultipleChoice ? (
                    multipleChoiceAnswers.filter(a => !a.isCorrect).map((answer, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg">
                        <div className="text-right text-2xl font-bold text-foreground mb-2 font-arabic">
                          {answer.word.arabic}
                        </div>
                        <div className="space-y-2">
                          <div className="text-left">
                            <span className="text-sm text-muted-foreground">Përgjigjja juaj: </span>
                            <span className="text-destructive font-medium">{answer.selectedAnswer}</span>
                          </div>
                          <div className="text-left">
                            <span className="text-sm text-muted-foreground">Përgjigjja e saktë: </span>
                            <span className="text-success font-medium">{answer.correctAnswer}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    answers.filter(a => !a.knew).map((answer, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg">
                        <div className="text-right text-2xl font-bold text-foreground mb-2 font-arabic">
                          {answer.word.arabic}
                        </div>
                        <div className="text-left text-muted-foreground">
                          {answer.word.albanianMeanings.join(', ')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Word Guess Quiz Flow
  if (quiz.quizType === 'wordGuess') {
    return (
      <div className="h-full overflow-y-auto bg-background">
        <div className="max-w-3xl mx-auto p-6">
          <div className="mb-6">
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kthehu
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">{quiz.title}</h1>
            <p className="text-muted-foreground">
              Pyetja {currentQuestionIndex + 1} nga {totalQuestions}
            </p>
          </div>

          <div className="mb-6">
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div
                className="relative w-full aspect-[3/2] cursor-pointer perspective-1000"
                onClick={handleFlip}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Front of card - Arabic word */}
                  <div className="absolute w-full h-full backface-hidden flex items-center justify-center bg-card border-2 border-border rounded-lg p-8">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">Kliko për të parë kuptimin</p>
                      <div className="text-5xl font-bold text-foreground font-arabic">
                        {currentWord.arabic}
                      </div>
                    </div>
                  </div>

                  {/* Back of card - Albanian meaning */}
                  <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center bg-primary/5 border-2 border-primary rounded-lg p-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground mb-4 font-arabic">
                        {currentWord.arabic}
                      </div>
                      <div className="text-xl text-muted-foreground">
                        {currentWord.albanianMeanings.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isFlipped && (
                <div className="mt-6 space-y-3">
                  <p className="text-center text-muted-foreground mb-4">E dije këtë fjalë?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleWordGuessAnswer(true)}
                      className="bg-success hover:bg-success/90 text-white"
                    >
                      Po
                    </Button>
                    <Button
                      onClick={() => handleWordGuessAnswer(false)}
                      variant="destructive"
                    >
                      Jo
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {!isFlipped && (
            <p className="text-center text-sm text-muted-foreground">
              Kliko kartën për të parë kuptimin
            </p>
          )}
        </div>

        <style>{`
          .perspective-1000 {
            perspective: 1000px;
          }
          .transform-style-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
          .font-arabic {
            font-family: 'Traditional Arabic', 'Arabic Typesetting', 'Geeza Pro', serif;
          }
        `}</style>
      </div>
    );
  }

  // Multiple Choice Quiz Flow
  if (quiz.quizType === 'multipleChoice' && currentQuestion) {
    return (
      <div className="h-full overflow-y-auto bg-background">
        <div className="max-w-3xl mx-auto p-6">
          <div className="mb-6">
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kthehu
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">{quiz.title}</h1>
            <p className="text-muted-foreground">
              Pyetja {currentQuestionIndex + 1} nga {totalQuestions}
            </p>
          </div>

          <div className="mb-6">
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground mb-4">Çfarë do të thotë kjo fjalë?</p>
                <div className="text-5xl font-bold text-foreground font-arabic">
                  {currentQuestion.word.arabic}
                </div>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleMultipleChoiceSelect(option)}
                    variant={selectedOption === option ? 'default' : 'outline'}
                    className={`w-full text-left justify-start h-auto py-4 px-6 transition-all ${
                      selectedOption === option ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    <span className="text-lg">{option}</span>
                  </Button>
                ))}
              </div>

              {selectedOption && (
                <div className="mt-6">
                  <Button
                    onClick={handleMultipleChoiceContinue}
                    className="w-full"
                  >
                    Vazhdo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {!selectedOption && (
            <p className="text-center text-sm text-muted-foreground">
              Zgjidh një përgjigje për të vazhduar
            </p>
          )}
        </div>

        <style>{`
          .font-arabic {
            font-family: 'Traditional Arabic', 'Arabic Typesetting', 'Geeza Pro', serif;
          }
        `}</style>
      </div>
    );
  }

  return null;
}
