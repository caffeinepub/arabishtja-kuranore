import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import Nat "mo:core/Nat";

module {
  public type UserRole = {
    #admin;
    #mesuesi;
    #nxenes;
  };

  public type StableUserProfile = {
    name : Text;
    avatar : ?Storage.ExternalBlob;
    principalId : Text;
    role : Text;
  };

  public type Lesson = {
    id : Text;
    title : Text;
    content : Text;
    author : Principal.Principal;
    createdAt : Time.Time;
    updatedAt : ?Time.Time;
    isActive : Bool;
  };

  public type Word = {
    arabic : Text;
    albanianMeanings : List.List<Text>;
    forms : List.List<Text>;
    formMeanings : List.List<Text>;
    lessonId : Text;
  };

  public type Ayah = {
    text : Text;
    translation : ?Text;
    reference : ?Text;
  };

  public type NoteType = {
    #word;
    #ayah;
  };

  public type Note = {
    id : Text;
    content : Text;
    associatedId : Text;
    user : Principal.Principal;
    createdAt : Time.Time;
    updatedAt : ?Time.Time;
    noteType : NoteType;
  };

  public type QuizType = {
    #wordGuess;
    #multipleChoice;
  };

  public type Quiz = {
    id : Text;
    quizType : QuizType;
    title : Text;
    author : Principal.Principal;
    createdAt : Time.Time;
    updatedAt : ?Time.Time;
  };

  public type OldActor = {
    userProfiles : Map.Map<Principal.Principal, StableUserProfile>;
    lessons : Map.Map<Text, Lesson>;
    vocabulary : Map.Map<Text, Word>;
    lessonWords : Map.Map<Text, Set.Set<Text>>;
    lessonAyahs : Map.Map<Text, List.List<Ayah>>;
    notesByUser : Map.Map<Principal.Principal, Map.Map<Text, Note>>;
    quizzes : Map.Map<Text, Quiz>;
    nextNoteId : Nat;
  };

  public type NewLesson = {
    id : Text;
    title : Text;
    content : Text;
    author : Principal.Principal;
    createdAt : Time.Time;
    updatedAt : ?Time.Time;
    isActive : Bool;
    visibleToStudents : Bool;
  };

  public type NewActor = {
    userProfiles : Map.Map<Principal.Principal, StableUserProfile>;
    lessons : Map.Map<Text, NewLesson>;
    vocabulary : Map.Map<Text, Word>;
    lessonWords : Map.Map<Text, Set.Set<Text>>;
    lessonAyahs : Map.Map<Text, List.List<Ayah>>;
    notesByUser : Map.Map<Principal.Principal, Map.Map<Text, Note>>;
    quizzes : Map.Map<Text, Quiz>;
    nextNoteId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newLessons = old.lessons.map<Text, Lesson, NewLesson>(
      func(_id, lesson) {
        {
          lesson with
          visibleToStudents = false;
        };
      }
    );

    {
      old with
      lessons = newLessons;
    };
  };
};
