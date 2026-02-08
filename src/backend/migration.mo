import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";

import Storage "blob-storage/Storage";

module {
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
    visibleToStudents : Bool;
  };

  public type StableWord = {
    arabic : Text;
    albanianMeanings : List.List<Text>;
    forms : List.List<Text>;
    formMeanings : List.List<Text>;
    lessonId : Text;
  };

  public type StableAyah = {
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

  public type ActorV0 = {
    nextNoteId : Nat;
    userProfiles : Map.Map<Principal.Principal, StableUserProfile>;
    lessons : Map.Map<Text, Lesson>;
    vocabulary : Map.Map<Text, StableWord>;
    lessonWords : Map.Map<Text, Set.Set<Text>>;
    lessonAyahs : Map.Map<Text, List.List<StableAyah>>;
    notesByUser : Map.Map<Principal.Principal, Map.Map<Text, Note>>;
    quizzes : Map.Map<Text, Quiz>;
  };

  public func run(old : ActorV0) : ActorV0 {
    old;
  };
};
