import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface StableUserProfile {
    name: string;
    role: string;
    principalId: string;
    avatar?: ExternalBlob;
}
export type Time = bigint;
export interface AddLessonWithWordsResponse {
    lessonId: string;
    wordsAdded: bigint;
    ayahsAdded: bigint;
}
export interface Quiz {
    id: string;
    title: string;
    createdAt: Time;
    author: Principal;
    updatedAt?: Time;
    quizType: QuizType;
}
export interface AddLessonWithWordsRequest {
    title: string;
    content: string;
    ayahs: Array<Ayah>;
    visibleToStudents: boolean;
    words: Array<Word>;
}
export interface Lesson {
    id: string;
    title: string;
    content: string;
    createdAt: Time;
    isActive: boolean;
    author: Principal;
    updatedAt?: Time;
    visibleToStudents: boolean;
}
export interface Ayah {
    text: string;
    reference?: string;
    translation?: string;
}
export interface Word {
    forms: Array<string>;
    lessonId: string;
    formMeanings: Array<string>;
    arabic: string;
    albanianMeanings: Array<string>;
}
export interface LessonWithWords {
    lesson: Lesson;
    words: Array<Word>;
}
export interface Note {
    id: string;
    content: string;
    createdAt: Time;
    user: Principal;
    noteType: NoteType;
    updatedAt?: Time;
    associatedId: string;
}
export enum NoteType {
    ayah = "ayah",
    word = "word"
}
export enum QuizType {
    wordGuess = "wordGuess",
    multipleChoice = "multipleChoice"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAyahToLesson(lessonId: string, text: string, translation: string | null, reference: string | null): Promise<void>;
    addLessonWithWordsAndAyahs(request: AddLessonWithWordsRequest): Promise<AddLessonWithWordsResponse>;
    addWordToLesson(arabic: string, albanianMeanings: Array<string>, forms: Array<string>, formMeanings: Array<string>, lessonId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkWordInLessons(word: string): Promise<boolean>;
    createLesson(title: string, content: string, visibleToStudents: boolean): Promise<string>;
    createNote(content: string, associatedId: string, noteType: NoteType): Promise<string>;
    createQuiz(quizType: QuizType, title: string): Promise<string>;
    deleteLesson(lessonId: string): Promise<void>;
    deleteNote(noteId: string): Promise<void>;
    deleteQuiz(quizId: string): Promise<void>;
    deleteWordFromLesson(word: string, lessonId: string): Promise<void>;
    getActiveLessonWithWords(): Promise<LessonWithWords | null>;
    getActiveLessonWithWordsAndAyahs(): Promise<{
        ayahs: Array<Ayah>;
        lesson: Lesson;
        words: Array<Word>;
    } | null>;
    getAllActiveLessons(): Promise<Array<Lesson>>;
    getAllLessons(): Promise<Array<Lesson>>;
    getAllLessonsWithWordsAndAyahs(): Promise<Array<{
        ayahs: Array<Ayah>;
        lesson: Lesson;
        words: Array<Word>;
    }>>;
    getAllUserProfiles(): Promise<Array<StableUserProfile>>;
    getAllVocabulary(): Promise<Array<Word>>;
    getCallerUserProfile(): Promise<StableUserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLessonAyahs(lessonId: string): Promise<Array<Ayah>>;
    getLessonById(lessonId: string): Promise<{
        ayahs: Array<Ayah>;
        lesson: Lesson;
        words: Array<Word>;
    } | null>;
    getLessonWords(): Promise<Array<[string, Array<string>]>>;
    getLessonsByAuthor(author: Principal): Promise<Array<Lesson>>;
    getNotesByAssociatedId(user: Principal, associatedId: string): Promise<Array<Note>>;
    getNotesByUser(user: Principal): Promise<Array<Note>>;
    getQuiz(quizId: string): Promise<Quiz | null>;
    getQuizzes(): Promise<Array<Quiz>>;
    getRandomWords(): Promise<Array<Word>>;
    getUserProfile(user: Principal): Promise<StableUserProfile | null>;
    getVisibleLessons(): Promise<Array<Lesson>>;
    getWordsByLesson(lessonId: string): Promise<Array<Word>>;
    initializeAccessControl(): Promise<void>;
    isAdmin(user: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    promoteToTeacher(user: Principal): Promise<void>;
    registerProfile(name: string): Promise<void>;
    resetAppData(): Promise<void>;
    setLessonActive(lessonId: string, isActive: boolean): Promise<void>;
    setLessonVisibility(lessonId: string, visibleToStudents: boolean): Promise<void>;
    updateLesson(lessonId: string, title: string, content: string, visibleToStudents: boolean): Promise<void>;
    updateLessonAyah(lessonId: string, ayahIndex: bigint, newText: string, newTranslation: string | null, newReference: string | null): Promise<void>;
    updateNote(noteId: string, content: string): Promise<void>;
    updateProfile(name: string, avatar: ExternalBlob | null): Promise<void>;
    updateQuiz(quizId: string, title: string, quizType: QuizType): Promise<void>;
    updateWord(arabic: string, albanianMeanings: Array<string>, forms: Array<string>, formMeanings: Array<string>, lessonId: string): Promise<void>;
    uploadLessonMaterial(file: ExternalBlob): Promise<ExternalBlob>;
}
