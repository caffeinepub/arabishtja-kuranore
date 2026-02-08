import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { StableUserProfile, Lesson, Word, LessonWithWords, AddLessonWithWordsRequest, Ayah, Note, NoteType, Quiz, QuizType } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { useInternetIdentity } from './useInternetIdentity';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<StableUserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useRegisterProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerProfile(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, avatar }: { name: string; avatar: ExternalBlob | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProfile(name, avatar);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCanCreateLessons() {
  const { data: userProfile } = useGetCallerUserProfile();

  // Check if user can create lessons based on their role
  // Both "admin" and "mesuesi" roles can create lessons
  const canCreate = userProfile?.role === 'Mësuesi' || userProfile?.role === 'admin' || userProfile?.role === 'mesuesi';

  return canCreate;
}

// Lesson Queries
export function useGetAllLessons() {
  const { actor, isFetching } = useActor();

  return useQuery<Lesson[]>({
    queryKey: ['lessons'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLessons();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllActiveLessons() {
  const { actor, isFetching } = useActor();

  return useQuery<Lesson[]>({
    queryKey: ['activeLessons'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActiveLessons();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetActiveLessonWithWords() {
  const { actor, isFetching } = useActor();

  return useQuery<LessonWithWords | null>({
    queryKey: ['activeLessonWithWords'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getActiveLessonWithWords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetActiveLessonWithWordsAndAyahs() {
  const { actor, isFetching } = useActor();

  return useQuery<{ lesson: Lesson; words: Word[]; ayahs: Ayah[] } | null>({
    queryKey: ['activeLessonWithWordsAndAyahs'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getActiveLessonWithWordsAndAyahs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllLessonsWithWordsAndAyahs() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<{ lesson: Lesson; words: Word[]; ayahs: Ayah[] }>>({
    queryKey: ['allLessonsWithWordsAndAyahs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLessonsWithWordsAndAyahs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLessonById(lessonId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<{ lesson: Lesson; words: Word[]; ayahs: Ayah[] } | null>({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (!actor || !lessonId) return null;
      return actor.getLessonById(lessonId);
    },
    enabled: !!actor && !isFetching && !!lessonId,
  });
}

export function useGetLessonsByAuthor(author: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Lesson[]>({
    queryKey: ['lessons', 'author', author?.toString()],
    queryFn: async () => {
      if (!actor || !author) return [];
      return actor.getLessonsByAuthor(author);
    },
    enabled: !!actor && !isFetching && !!author,
  });
}

export function useCreateLesson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content, visibleToStudents }: { title: string; content: string; visibleToStudents: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createLesson(title, content, visibleToStudents);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessons'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWords'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWordsAndAyahs'] });
      queryClient.invalidateQueries({ queryKey: ['allLessonsWithWordsAndAyahs'] });
    },
  });
}

export function useUpdateLesson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, title, content, visibleToStudents }: { lessonId: string; title: string; content: string; visibleToStudents: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLesson(lessonId, title, content, visibleToStudents);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessons'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWords'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWordsAndAyahs'] });
      queryClient.invalidateQueries({ queryKey: ['allLessonsWithWordsAndAyahs'] });
    },
  });
}

export function useDeleteLesson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteLesson(lessonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessons'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWords'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWordsAndAyahs'] });
      queryClient.invalidateQueries({ queryKey: ['allLessonsWithWordsAndAyahs'] });
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });
}

export function useSetLessonActive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, isActive }: { lessonId: string; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setLessonActive(lessonId, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessons'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWords'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWordsAndAyahs'] });
    },
  });
}

export function useSetLessonVisibility() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, visibleToStudents }: { lessonId: string; visibleToStudents: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setLessonVisibility(lessonId, visibleToStudents);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessons'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWords'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWordsAndAyahs'] });
    },
  });
}

// Vocabulary Queries
export function useGetAllVocabulary() {
  const { actor, isFetching } = useActor();

  return useQuery<Word[]>({
    queryKey: ['vocabulary'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVocabulary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetWordsByLesson(lessonId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Word[]>({
    queryKey: ['vocabulary', 'lesson', lessonId],
    queryFn: async () => {
      if (!actor || !lessonId) return [];
      return actor.getWordsByLesson(lessonId);
    },
    enabled: !!actor && !isFetching && !!lessonId,
  });
}

export function useAddWordToLesson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      arabic,
      albanianMeanings,
      forms,
      formMeanings,
      lessonId,
    }: {
      arabic: string;
      albanianMeanings: string[];
      forms: string[];
      formMeanings: string[];
      lessonId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addWordToLesson(arabic, albanianMeanings, forms, formMeanings, lessonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
      queryClient.invalidateQueries({ queryKey: ['lesson'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWords'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWordsAndAyahs'] });
      queryClient.invalidateQueries({ queryKey: ['allLessonsWithWordsAndAyahs'] });
    },
  });
}

export function useAddLessonWithWords() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AddLessonWithWordsRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addLessonWithWordsAndAyahs(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessons'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWords'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWordsAndAyahs'] });
      queryClient.invalidateQueries({ queryKey: ['allLessonsWithWordsAndAyahs'] });
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });
}

export function useDeleteWordFromLesson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ word, lessonId }: { word: string; lessonId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteWordFromLesson(word, lessonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
      queryClient.invalidateQueries({ queryKey: ['lesson'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWords'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWordsAndAyahs'] });
      queryClient.invalidateQueries({ queryKey: ['allLessonsWithWordsAndAyahs'] });
    },
  });
}

// Ayah Queries
export function useGetLessonAyahs(lessonId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Ayah[]>({
    queryKey: ['ayahs', 'lesson', lessonId],
    queryFn: async () => {
      if (!actor || !lessonId) return [];
      return actor.getLessonAyahs(lessonId);
    },
    enabled: !!actor && !isFetching && !!lessonId,
  });
}

export function useAddAyahToLesson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      text,
      translation,
      reference,
    }: {
      lessonId: string;
      text: string;
      translation: string | null;
      reference: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAyahToLesson(lessonId, text, translation, reference);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ayahs'] });
      queryClient.invalidateQueries({ queryKey: ['lesson'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWordsAndAyahs'] });
      queryClient.invalidateQueries({ queryKey: ['allLessonsWithWordsAndAyahs'] });
    },
  });
}

export function useUpdateLessonAyah() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      ayahIndex,
      text,
      translation,
      reference,
    }: {
      lessonId: string;
      ayahIndex: number;
      text: string;
      translation: string | null;
      reference: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLessonAyah(lessonId, BigInt(ayahIndex), text, translation, reference);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ayahs'] });
      queryClient.invalidateQueries({ queryKey: ['lesson'] });
      queryClient.invalidateQueries({ queryKey: ['activeLessonWithWordsAndAyahs'] });
      queryClient.invalidateQueries({ queryKey: ['allLessonsWithWordsAndAyahs'] });
    },
  });
}

// Note Queries
export function useGetNotesByUser() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Note[]>({
    queryKey: ['notes', 'user', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getNotesByUser(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetNotesByAssociatedId(associatedId: string | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Note[]>({
    queryKey: ['notes', 'associated', associatedId, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity || !associatedId) return [];
      return actor.getNotesByAssociatedId(identity.getPrincipal(), associatedId);
    },
    enabled: !!actor && !isFetching && !!identity && !!associatedId,
  });
}

export function useCreateNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      associatedId,
      noteType,
    }: {
      content: string;
      associatedId: string;
      noteType: NoteType;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createNote(content, associatedId, noteType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useUpdateNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateNote(noteId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useDeleteNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteNote(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

// Quiz Queries
export function useGetQuizzes() {
  const { actor, isFetching } = useActor();

  return useQuery<Quiz[]>({
    queryKey: ['quizzes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQuizzes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetQuiz(quizId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Quiz | null>({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      if (!actor || !quizId) return null;
      return actor.getQuiz(quizId);
    },
    enabled: !!actor && !isFetching && !!quizId,
  });
}

export function useGetRandomWords() {
  const { actor, isFetching } = useActor();

  return useQuery<Word[]>({
    queryKey: ['randomWords'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRandomWords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateQuiz() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, quizType }: { title: string; quizType: QuizType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createQuiz(quizType, title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useUpdateQuiz() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quizId, title, quizType }: { quizId: string; title: string; quizType: QuizType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateQuiz(quizId, title, quizType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useDeleteQuiz() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteQuiz(quizId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

// Admin Queries
export function useResetAppData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.resetAppData();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
