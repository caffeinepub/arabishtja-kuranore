import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";

import List "mo:core/List";
import Set "mo:core/Set";

// This canister uses stable migration.

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();

  let adminPrincipalIds = Set.fromIter([
    "cuxna-it63h-trwek-y6k5d-w4bm3-4m3km-btppv-5bjnb-54vun-qkpqi-sqe",
    "jblrk-velg3-evgb7-7btqq-4qggo-rwz4h-au6fc-lga3s-v4ksn-wezrv-nqe"
  ].values());

  public type UserRole = {
    #admin;
    #mesuesi;
    #nxenes;
  };

  type UserProfile = {
    name : Text;
    avatar : ?Storage.ExternalBlob;
    principalId : Text;
    role : UserRole;
  };

  public type StableUserProfile = {
    name : Text;
    avatar : ?Storage.ExternalBlob;
    principalId : Text;
    role : Text;
  };

  type Lesson = {
    id : Text;
    title : Text;
    content : Text;
    author : Principal;
    createdAt : Time.Time;
    updatedAt : ?Time.Time;
    isActive : Bool;
    visibleToStudents : Bool;
  };

  public type Word = {
    arabic : Text;
    albanianMeanings : [Text];
    forms : [Text];
    formMeanings : [Text];
    lessonId : Text;
  };

  type StableWord = {
    arabic : Text;
    albanianMeanings : List.List<Text>;
    forms : List.List<Text>;
    formMeanings : List.List<Text>;
    lessonId : Text;
  };

  type LessonWithWords = {
    lesson : Lesson;
    words : [Word];
  };

  public type Ayah = {
    text : Text;
    translation : ?Text;
    reference : ?Text;
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
    user : Principal;
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
    author : Principal;
    createdAt : Time.Time;
    updatedAt : ?Time.Time;
  };

  var nextNoteId : Nat = 0;

  let userProfiles = Map.empty<Principal, StableUserProfile>();
  let lessons = Map.empty<Text, Lesson>();
  let vocabulary = Map.empty<Text, StableWord>();
  let lessonWords = Map.empty<Text, Set.Set<Text>>();
  let lessonAyahs = Map.empty<Text, List.List<StableAyah>>();
  let notesByUser = Map.empty<Principal, Map.Map<Text, Note>>();
  let quizzes = Map.empty<Text, Quiz>();

  func isHardcodedAdmin(principal : Principal) : Bool {
    adminPrincipalIds.contains(principal.toText());
  };

  func getUserAppRole(caller : Principal) : UserRole {
    if (isHardcodedAdmin(caller)) {
      return #admin;
    };
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case ("admin") { #admin };
          case ("mesuesi") { #mesuesi };
          case ("nxenes") { #nxenes };
          case (_) { #nxenes };
        };
      };
      case (null) { #nxenes };
    };
  };

  func canCreateLessons(caller : Principal) : Bool {
    let role = getUserAppRole(caller);
    switch (role) {
      case (#admin) { true };
      case (#mesuesi) { true };
      case (#nxenes) { false };
    };
  };

  func canEditLesson(caller : Principal, lesson : Lesson) : Bool {
    let role = getUserAppRole(caller);
    switch (role) {
      case (#admin) { true };
      case (#mesuesi) { lesson.author == caller };
      case (#nxenes) { false };
    };
  };

  func canDeleteLesson(caller : Principal, lesson : Lesson) : Bool {
    let role = getUserAppRole(caller);
    switch (role) {
      case (#admin) { true };
      case (#mesuesi) { lesson.author == caller };
      case (#nxenes) { false };
    };
  };

  func canActivateLesson(caller : Principal, lesson : Lesson) : Bool {
    let role = getUserAppRole(caller);
    switch (role) {
      case (#admin) { true };
      case (#mesuesi) { lesson.author == caller };
      case (#nxenes) { false };
    };
  };

  func canManageVocabulary(caller : Principal) : Bool {
    let role = getUserAppRole(caller);
    switch (role) {
      case (#admin) { true };
      case (#mesuesi) { true };
      case (#nxenes) { false };
    };
  };

  func isTeacherOrAdmin(caller : Principal) : Bool {
    let role = getUserAppRole(caller);
    switch (role) {
      case (#admin) { true };
      case (#mesuesi) { true };
      case (#nxenes) { false };
    };
  };

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    if (isHardcodedAdmin(caller)) {
      return #admin;
    };
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    if (isHardcodedAdmin(caller)) {
      return true;
    };
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query (_) func isAdmin(user : Principal) : async Bool {
    if (isHardcodedAdmin(user)) {
      return true;
    };
    AccessControl.isAdmin(accessControlState, user);
  };

  public shared ({ caller }) func registerProfile(name : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Duhet të jesh përdorues i regjistruar");
    };

    if (userProfiles.containsKey(caller)) {
      Runtime.trap("Profili ekziston tashmë");
    };

    let roleText = if (isHardcodedAdmin(caller)) {
      "admin";
    } else {
      "nxenes";
    };

    let profile : StableUserProfile = {
      name;
      avatar = null;
      principalId = caller.toText();
      role = roleText;
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?StableUserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Duhet të jesh përdorues i regjistruar");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?StableUserProfile {
    if (caller != user and not (isHardcodedAdmin(caller) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Pa Autorizim: Mund të aksesosh vetëm profilin tuaj");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func updateProfile(name : Text, avatar : ?Storage.ExternalBlob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Duhet të jesh përdorues i regjistruar");
    };

    let existingRole = switch (userProfiles.get(caller)) {
      case (?profile) { profile.role };
      case (null) {
        if (isHardcodedAdmin(caller)) {
          "admin";
        } else {
          "nxenes";
        };
      };
    };

    let updatedProfile : StableUserProfile = {
      name;
      avatar;
      principalId = caller.toText();
      role = existingRole;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func createLesson(title : Text, content : Text, visibleToStudents : Bool) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të krijojnë mësime");
    };

    if (not canCreateLessons(caller)) {
      Runtime.trap("Pa Autorizim: Vetëm mësuesit dhe administratorët mund të krijojnë mësime");
    };

    let id = lessons.size().toText();
    let lesson : Lesson = {
      id;
      title;
      content;
      author = caller;
      createdAt = Time.now();
      updatedAt = null;
      isActive = false;
      visibleToStudents;
    };
    lessons.add(id, lesson);
    lessonWords.add(id, Set.empty<Text>());
    lessonAyahs.add(id, List.empty<StableAyah>());
    id;
  };

  public shared ({ caller }) func updateLesson(lessonId : Text, title : Text, content : Text, visibleToStudents : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të përditësojnë mësime");
    };

    switch (lessons.get(lessonId)) {
      case (?existingLesson) {
        if (not canEditLesson(caller, existingLesson)) {
          Runtime.trap("Pa Autorizim: Mund të përditësosh vetëm mësimet e tua");
        };

        let updatedLesson : Lesson = {
          existingLesson with
          title;
          content;
          updatedAt = ?Time.now();
          visibleToStudents;
        };
        lessons.add(lessonId, updatedLesson);
      };
      case (null) {
        Runtime.trap("Mësimi nuk u gjet");
      };
    };
  };

  public shared ({ caller }) func setLessonActive(lessonId : Text, isActive : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të ndryshojnë statusin e mësimeve");
    };

    switch (lessons.get(lessonId)) {
      case (?lesson) {
        if (not canActivateLesson(caller, lesson)) {
          Runtime.trap("Pa Autorizim: Mund të aktivizosh vetëm mësimet e tua");
        };

        if (isActive) {
          for ((id, otherLesson) in lessons.entries()) {
            if (otherLesson.isActive) {
              let deactivatedLesson : Lesson = {
                otherLesson with isActive = false
              };
              lessons.add(id, deactivatedLesson);
            };
          };
        };

        let updatedLesson : Lesson = {
          lesson with isActive;
        };
        lessons.add(lessonId, updatedLesson);
      };
      case (null) {
        Runtime.trap("Mësimi nuk u gjet");
      };
    };
  };

  public shared ({ caller }) func setLessonVisibility(lessonId : Text, visibleToStudents : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të ndryshojnë dukshmërinë e mësimeve");
    };

    switch (lessons.get(lessonId)) {
      case (?lesson) {
        if (not canEditLesson(caller, lesson)) {
          Runtime.trap("Pa Autorizim: Mund të ndryshosh dukshmërinë vetëm të mësimeve tuaja");
        };

        let updatedLesson : Lesson = {
          lesson with visibleToStudents;
        };
        lessons.add(lessonId, updatedLesson);
      };
      case (null) {
        Runtime.trap("Mësimi nuk u gjet");
      };
    };
  };

  public shared ({ caller }) func deleteLesson(lessonId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të fshijnë mësime");
    };

    switch (lessons.get(lessonId)) {
      case (?lesson) {
        if (not canDeleteLesson(caller, lesson)) {
          Runtime.trap("Pa Autorizim: Mund të fshish vetëm mësimet e tua");
        };
        lessons.remove(lessonId);
        lessonAyahs.remove(lessonId);
      };
      case (null) {
        Runtime.trap("Mësimi nuk u gjet");
      };
    };
  };

  public query ({ caller }) func getLessonsByAuthor(author : Principal) : async [Lesson] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shikojnë mësime");
    };

    let lessonsArray = lessons.values().toArray().filter(func(l : Lesson) : Bool { l.author == author });
    lessonsArray.sort(func(a : Lesson, b : Lesson) : Order.Order {
      Int.compare(a.createdAt, b.createdAt);
    });
  };

  public query ({ caller }) func getAllLessons() : async [Lesson] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shikojnë mësime");
    };

    let lessonsArray = if (isTeacherOrAdmin(caller)) {
      lessons.values().toArray();
    } else {
      lessons.values().toArray().filter(func(l : Lesson) : Bool { l.visibleToStudents });
    };

    lessonsArray.sort(func(a : Lesson, b : Lesson) : Order.Order {
      Int.compare(a.createdAt, b.createdAt);
    });
  };

  public query ({ caller }) func getVisibleLessons() : async [Lesson] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shikojnë mësimet e dukshme");
    };

    let lessonsArray = lessons.values().toArray().filter(func(l : Lesson) : Bool { l.visibleToStudents });
    lessonsArray.sort(func(a : Lesson, b : Lesson) : Order.Order {
      Int.compare(a.createdAt, b.createdAt);
    });
  };

  public query ({ caller }) func getAllActiveLessons() : async [Lesson] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shikojnë mësimet aktive");
    };

    let activeLessons = lessons.values().toArray().filter(func(l : Lesson) : Bool { l.isActive });

    if (isTeacherOrAdmin(caller)) {
      activeLessons;
    } else {
      activeLessons.filter(func(l : Lesson) : Bool { l.visibleToStudents });
    };
  };

  public query ({ caller }) func getActiveLessonWithWords() : async ?LessonWithWords {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shikojnë mësimet aktive");
    };

    switch (lessons.entries().find(func((_, lesson)) { lesson.isActive })) {
      case (?(_, activeLesson)) {
        if (not isTeacherOrAdmin(caller) and not activeLesson.visibleToStudents) {
          return null;
        };

        let words = switch (lessonWords.get(activeLesson.id)) {
          case (?wordsSet) {
            wordsSet.toArray().map(
              func(arabic) {
                switch (vocabulary.get(arabic)) {
                  case (?stableWord) {
                    {
                      stableWord with
                      albanianMeanings = stableWord.albanianMeanings.toArray();
                      forms = stableWord.forms.toArray();
                      formMeanings = stableWord.formMeanings.toArray();
                    };
                  };
                  case (null) { Runtime.trap("Fjala nuk u gjet") };
                };
              }
            );
          };
          case (null) { [] };
        };
        ?{
          lesson = activeLesson;
          words;
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getActiveLessonWithWordsAndAyahs() : async ?{
    lesson : Lesson;
    words : [Word];
    ayahs : [Ayah];
  } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shikojnë mësimet aktive");
    };

    switch (lessons.entries().find(func((_, lesson)) { lesson.isActive })) {
      case (?(_, activeLesson)) {
        if (not isTeacherOrAdmin(caller) and not activeLesson.visibleToStudents) {
          return null;
        };

        let words = switch (lessonWords.get(activeLesson.id)) {
          case (?wordsSet) {
            wordsSet.toArray().map(
              func(arabic) {
                switch (vocabulary.get(arabic)) {
                  case (?stableWord) {
                    {
                      stableWord with
                      albanianMeanings = stableWord.albanianMeanings.toArray();
                      forms = stableWord.forms.toArray();
                      formMeanings = stableWord.formMeanings.toArray();
                    };
                  };
                  case (null) { Runtime.trap("Fjala nuk u gjet") };
                };
              }
            );
          };
          case (null) { [] };
        };

        let ayahs = switch (lessonAyahs.get(activeLesson.id)) {
          case (?ayahList) {
            ayahList.toArray().map(
              func(stableAyah) {
                {
                  stableAyah with
                  translation = stableAyah.translation;
                  reference = stableAyah.reference;
                };
              }
            );
          };
          case (null) { [] };
        };

        ?{
          lesson = activeLesson;
          words;
          ayahs;
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getLessonById(lessonId : Text) : async ?{
    lesson : Lesson;
    words : [Word];
    ayahs : [Ayah];
  } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shikojnë mësime");
    };

    switch (lessons.get(lessonId)) {
      case (?lesson) {
        if (not isTeacherOrAdmin(caller) and not lesson.visibleToStudents) {
          Runtime.trap("Pa Autorizim: Ky mësim nuk është i dukshëm për nxënësit");
        };

        let words = switch (lessonWords.get(lesson.id)) {
          case (?wordsSet) {
            wordsSet.toArray().map(
              func(arabic) {
                switch (vocabulary.get(arabic)) {
                  case (?stableWord) {
                    {
                      stableWord with
                      albanianMeanings = stableWord.albanianMeanings.toArray();
                      forms = stableWord.forms.toArray();
                      formMeanings = stableWord.formMeanings.toArray();
                    };
                  };
                  case (null) { Runtime.trap("Fjala nuk u gjet") };
                };
              }
            );
          };
          case (null) { [] };
        };

        let ayahs = switch (lessonAyahs.get(lesson.id)) {
          case (?ayahList) {
            ayahList.toArray().map(
              func(stableAyah) {
                {
                  stableAyah with
                  translation = stableAyah.translation;
                  reference = stableAyah.reference;
                };
              }
            );
          };
          case (null) { [] };
        };

        ?{
          lesson;
          words;
          ayahs;
        };
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func uploadLessonMaterial(file : Storage.ExternalBlob) : async Storage.ExternalBlob {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të ngarkojnë materiale");
    };

    if (not canCreateLessons(caller)) {
      Runtime.trap("Pa Autorizim: Vetëm mësuesit dhe administratorët mund të ngarkojnë materiale");
    };

    file;
  };

  public shared ({ caller }) func promoteToTeacher(user : Principal) : async () {
    if (not (isHardcodedAdmin(caller) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Pa Autorizim: Vetëm administratorët mund të promovojnë përdorues");
    };

    switch (userProfiles.get(user)) {
      case (?profile) {
        let updatedProfile : StableUserProfile = {
          profile with role = "mesuesi"
        };
        userProfiles.add(user, updatedProfile);
      };
      case (null) {
        Runtime.trap("Profili nuk u gjet");
      };
    };
  };

  public query ({ caller }) func getAllUserProfiles() : async [StableUserProfile] {
    if (not (isHardcodedAdmin(caller) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Pa Autorizim: Vetëm administratorët mund të shikojnë të gjithë përdoruesit");
    };

    userProfiles.values().toArray();
  };

  public shared ({ caller }) func addWordToLesson(
    arabic : Text,
    albanianMeanings : [Text],
    forms : [Text],
    formMeanings : [Text],
    lessonId : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shtojnë fjalë");
    };

    if (not canManageVocabulary(caller)) {
      Runtime.trap("Pa Autorizim: Vetëm mësuesit dhe administratorët mund të shtojnë fjalë");
    };

    switch (lessons.get(lessonId)) {
      case (?lesson) {
        if (not canEditLesson(caller, lesson)) {
          Runtime.trap("Pa Autorizim: Mund të shtosh fjalë vetëm në mësimet e tua");
        };

        let stableWord : StableWord = {
          arabic;
          albanianMeanings = List.fromArray(albanianMeanings);
          forms = List.fromArray(forms);
          formMeanings = List.fromArray(formMeanings);
          lessonId;
        };
        vocabulary.add(arabic, stableWord);

        switch (lessonWords.get(lessonId)) {
          case (?wordsSet) {
            wordsSet.add(arabic);
          };
          case (null) {
            let newSet = Set.empty<Text>();
            newSet.add(arabic);
            lessonWords.add(lessonId, newSet);
          };
        };
      };
      case (null) {
        Runtime.trap("Mësimi nuk u gjet");
      };
    };
  };

  public shared ({ caller }) func updateWord(
    arabic : Text,
    albanianMeanings : [Text],
    forms : [Text],
    formMeanings : [Text],
    lessonId : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të përditësojnë fjalë");
    };

    if (not canManageVocabulary(caller)) {
      Runtime.trap("Pa Autorizim: Vetëm mësuesit dhe administratorët mund të përditësojnë fjalë");
    };

    switch (lessons.get(lessonId)) {
      case (?lesson) {
        if (not canEditLesson(caller, lesson)) {
          Runtime.trap("Pa Autorizim: Mund të përditësosh fjalë vetëm në mësimet e tua");
        };

        switch (vocabulary.get(arabic)) {
          case (?existingWord) {
            if (existingWord.lessonId != lessonId) {
              Runtime.trap("Pa Autorizim: Kjo fjalë i përket një mësimi tjetër");
            };

            let updatedWord : StableWord = {
              arabic;
              albanianMeanings = List.fromArray(albanianMeanings);
              forms = List.fromArray(forms);
              formMeanings = List.fromArray(formMeanings);
              lessonId;
            };
            vocabulary.add(arabic, updatedWord);
          };
          case (null) {
            Runtime.trap("Fjala nuk u gjet");
          };
        };
      };
      case (null) {
        Runtime.trap("Mësimi nuk u gjet");
      };
    };
  };

  public query ({ caller }) func getLessonWords() : async [(Text, [Text])] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shikojnë fjalët e mësimeve");
    };

    func convertLessonWordsEntry(entry : (Text, Set.Set<Text>)) : (Text, [Text]) {
      let (lessonId, wordsSet) = entry;
      (lessonId, wordsSet.toArray());
    };

    let wordsIterable = lessonWords.entries();
    wordsIterable.toArray().map(func(entry) { convertLessonWordsEntry(entry) });
  };

  public query ({ caller }) func getAllVocabulary() : async [Word] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shikojnë fjalorin");
    };

    let convertStableWord = func(s : StableWord) : Word {
      {
        s with
        albanianMeanings = s.albanianMeanings.toArray();
        forms = s.forms.toArray();
        formMeanings = s.formMeanings.toArray();
      };
    };

    let valuesArray = vocabulary.values().toArray();
    let convertedArray = Array.tabulate(
      valuesArray.size(),
      func(i) { convertStableWord(valuesArray[i]) },
    );
    convertedArray;
  };

  public query ({ caller }) func getWordsByLesson(lessonId : Text) : async [Word] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shikojnë fjalorin");
    };

    switch (lessonWords.get(lessonId)) {
      case (?wordsSet) {
        let filteredWords = wordsSet.toArray().filter(
          func(arabic) { switch (vocabulary.get(arabic)) { case (?_) { true }; case (null) { false } } }
        );
        let stableWords = filteredWords.map(
          func(arabic) {
            switch (vocabulary.get(arabic)) {
              case (?stableWord) {
                {
                  stableWord with
                  albanianMeanings = stableWord.albanianMeanings.toArray();
                  forms = stableWord.forms.toArray();
                  formMeanings = stableWord.formMeanings.toArray();
                };
              };
              case (null) {
                Runtime.trap("Fjala nuk u gjet");
              };
            };
          }
        );
        stableWords;
      };
      case (null) { [] };
    };
  };

  public type AddLessonWithWordsRequest = {
    title : Text;
    content : Text;
    words : [Word];
    ayahs : [Ayah];
    visibleToStudents : Bool;
  };

  public type AddLessonWithWordsResponse = {
    lessonId : Text;
    wordsAdded : Nat;
    ayahsAdded : Nat;
  };

  public shared ({ caller }) func addLessonWithWordsAndAyahs(request : AddLessonWithWordsRequest) : async AddLessonWithWordsResponse {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shtojnë mësime dhe fjalë");
    };

    if (not canCreateLessons(caller)) {
      Runtime.trap("Pa Autorizim: Vetëm mësuesit dhe administratorët mund të shtojnë mësime dhe fjalë");
    };

    let lessonId = lessons.size().toText();
    let lesson : Lesson = {
      id = lessonId;
      title = request.title;
      content = request.content;
      author = caller;
      createdAt = Time.now();
      updatedAt = null;
      isActive = false;
      visibleToStudents = request.visibleToStudents;
    };
    lessons.add(lessonId, lesson);
    lessonWords.add(lessonId, Set.empty<Text>());
    lessonAyahs.add(lessonId, List.empty<StableAyah>());

    for (word in request.words.values()) {
      let stableWord : StableWord = {
        word with
        albanianMeanings = List.fromArray(word.albanianMeanings);
        forms = List.fromArray(word.forms);
        formMeanings = List.fromArray(word.formMeanings);
      };
      vocabulary.add(word.arabic, stableWord);

      switch (lessonWords.get(lessonId)) {
        case (?wordsSet) {
          wordsSet.add(word.arabic);
        };
        case (null) {
          let newSet = Set.empty<Text>();
          newSet.add(word.arabic);
          lessonWords.add(lessonId, newSet);
        };
      };
    };

    let ayahList = List.empty<StableAyah>();
    for (ayah in request.ayahs.values()) {
      ayahList.add({
        ayah with translation = ayah.translation; reference = ayah.reference;
      });
    };
    lessonAyahs.add(lessonId, ayahList);

    {
      lessonId;
      wordsAdded = request.words.size();
      ayahsAdded = request.ayahs.size();
    };
  };

  public query ({ caller }) func getAllLessonsWithWordsAndAyahs() : async [{
    lesson : Lesson;
    words : [Word];
    ayahs : [Ayah];
  }] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shikojnë mësimet me fjalë dhe ajete");
    };

    let allLessons = lessons.toArray();
    let filteredLessons = if (isTeacherOrAdmin(caller)) {
      allLessons;
    } else {
      allLessons.filter(func((_, lesson)) { lesson.visibleToStudents });
    };

    let results = filteredLessons.map(func((id, lesson)) {
      let words = switch (lessonWords.get(id)) {
        case (?wordsSet) {
          let filteredWords = wordsSet.toArray().filter(
            func(arabic) {
              switch (vocabulary.get(arabic)) {
                case (?_) { true };
                case (null) { false };
              };
            }
          );
          let stableWords = filteredWords.map(
            func(arabic) {
              switch (vocabulary.get(arabic)) {
                case (?stableWord) {
                  {
                    stableWord with
                    albanianMeanings = stableWord.albanianMeanings.toArray();
                    forms = stableWord.forms.toArray();
                    formMeanings = stableWord.formMeanings.toArray();
                  };
                };
                case (null) {
                  Runtime.trap("Fjala nuk u gjet");
                };
              };
            }
          );
          stableWords;
        };
        case (null) { [] };
      };

      let ayahs = switch (lessonAyahs.get(id)) {
        case (?ayaList) {
          ayaList.toArray().map(
            func(stableAyah) {
              {
                stableAyah with
                translation = stableAyah.translation;
                reference = stableAyah.reference;
              };
            }
          );
        };
        case (null) { [] };
      };

      {
        lesson;
        words;
        ayahs;
      };
    });
    results;
  };

  public shared ({ caller }) func addAyahToLesson(
    lessonId : Text,
    text : Text,
    translation : ?Text,
    reference : ?Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shtojnë ajete");
    };

    if (not canManageVocabulary(caller)) {
      Runtime.trap("Pa Autorizim: Vetëm mësuesit dhe administratorët mund të shtojnë ajete");
    };

    switch (lessons.get(lessonId)) {
      case (?lesson) {
        if (not canEditLesson(caller, lesson)) {
          Runtime.trap("Pa Autorizim: Mund të shtosh ajete vetëm në mësimet e tua");
        };

        let stableAyah : StableAyah = {
          text;
          translation;
          reference;
        };

        switch (lessonAyahs.get(lessonId)) {
          case (?ayahList) {
            ayahList.add(stableAyah);
          };
          case (null) {
            let newList = List.empty<StableAyah>();
            newList.add(stableAyah);
            lessonAyahs.add(lessonId, newList);
          };
        };
      };
      case (null) {
        Runtime.trap("Mësimi nuk u gjet");
      };
    };
  };

  public shared ({ caller }) func updateLessonAyah(lessonId : Text, ayahIndex : Nat, newText : Text, newTranslation : ?Text, newReference : ?Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të përditësojnë ajete");
    };

    switch (lessons.get(lessonId)) {
      case (?lesson) {
        if (not canEditLesson(caller, lesson)) {
          Runtime.trap("Pa Autorizim: Mund të përditësosh vetëm ajete të mësimeve tuaja");
        };

        switch (lessonAyahs.get(lessonId)) {
          case (?ayahList) {
            if (ayahIndex >= ayahList.size()) {
              Runtime.trap("Indeksi i ajetit është i gabuar");
            };

            let stableAyah : StableAyah = {
              text = newText;
              translation = newTranslation;
              reference = newReference;
            };
            ayahList.put(ayahIndex, stableAyah);
          };
          case (null) {
            Runtime.trap("Lista e ajetëve për mësimin nuk u gjet");
          };
        };
      };
      case (null) {
        Runtime.trap("Mësimi nuk u gjet");
      };
    };
  };

  public query ({ caller }) func getLessonAyahs(lessonId : Text) : async [Ayah] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shikojnë ajete");
    };

    switch (lessonAyahs.get(lessonId)) {
      case (?ayahList) {
        ayahList.toArray().map(
          func(stableAyah) {
            {
              stableAyah with translation = stableAyah.translation;
              reference = stableAyah.reference;
            };
          }
        );
      };
      case (null) { [] };
    };
  };

  func getUserNotesMap(user : Principal) : Map.Map<Text, Note> {
    switch (notesByUser.get(user)) {
      case (?existingMap) { existingMap };
      case (null) {
        let newMap = Map.empty<Text, Note>();
        notesByUser.add(user, newMap);
        newMap;
      };
    };
  };

  public shared ({ caller }) func createNote(content : Text, associatedId : Text, noteType : NoteType) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Duhet të jesh përdorues i regjistruar");
    };

    let noteId = nextNoteId.toText();
    nextNoteId += 1;
    let newNote : Note = {
      id = noteId;
      content;
      associatedId;
      user = caller;
      createdAt = Time.now();
      updatedAt = null;
      noteType;
    };

    let userNotes = getUserNotesMap(caller);
    userNotes.add(noteId, newNote);

    noteId;
  };

  public shared ({ caller }) func updateNote(noteId : Text, content : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Duhet të jesh përdorues i regjistruar");
    };

    switch (notesByUser.get(caller)) {
      case (?userNotes) {
        switch (userNotes.get(noteId)) {
          case (?existingNote) {
            let updatedNote : Note = {
              existingNote with
              content;
              updatedAt = ?Time.now();
            };
            userNotes.add(noteId, updatedNote);
          };
          case (null) {
            Runtime.trap("Shënimi nuk u gjet");
          };
        };
      };
      case (null) {
        Runtime.trap("Nuk ke shënime të regjistruara për këtë përdorues");
      };
    };
  };

  public shared ({ caller }) func deleteNote(noteId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Duhet të jesh përdorues i regjistruar");
    };

    switch (notesByUser.get(caller)) {
      case (?userNotes) {
        if (userNotes.containsKey(noteId)) {
          userNotes.remove(noteId);
        } else {
          Runtime.trap("Shënimi nuk u gjet");
        };
      };
      case (null) {
        Runtime.trap("Nuk ke shënime të regjistruara për këtë përdorues");
      };
    };
  };

  public query ({ caller }) func getNotesByUser(user : Principal) : async [Note] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Duhet të jesh përdorues i regjistruar");
    };

    if (caller != user and not (isHardcodedAdmin(caller) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Pa Autorizim: Mund të shikosh vetëm shënimet e tua");
    };

    switch (notesByUser.get(user)) {
      case (?userNotes) { userNotes.values().toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getNotesByAssociatedId(user : Principal, associatedId : Text) : async [Note] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Duhet të jesh përdorues i regjistruar");
    };

    if (caller != user and not (isHardcodedAdmin(caller) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Pa Autorizim: Mund të shikosh vetëm shënimet e tua");
    };

    switch (notesByUser.get(user)) {
      case (?userNotes) {
        userNotes.values().toArray().filter(func(note) { note.associatedId == associatedId });
      };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func resetAppData() : async () {
    if (not isHardcodedAdmin(caller)) {
      Runtime.trap("Pa Autorizim: Vetëm administratorët mund të rivendosin të dhenat e aplikacionit");
    };

    userProfiles.clear();
    lessons.clear();
    vocabulary.clear();
    lessonWords.clear();
    lessonAyahs.clear();
    notesByUser.clear();
    quizzes.clear();

    nextNoteId := 0;

    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func checkWordInLessons(word : Text) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Duhet të jesh përdorues i regjistruar");
    };

    if (not canManageVocabulary(caller)) {
      Runtime.trap("Pa Autorizim: Vetëm mësuesit dhe administratorët mund të kontrollojnë përdorimin e fjalëve");
    };

    lessonWords.values().any(func(wordsSet) { wordsSet.contains(word) });
  };

  public shared ({ caller }) func deleteWordFromLesson(word : Text, lessonId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Duhet të jesh përdorues i regjistruar");
    };

    if (not canManageVocabulary(caller)) {
      Runtime.trap("Pa Autorizim: Vetëm mësuesit dhe administratorët mund të fshijnë fjalë");
    };

    switch (lessons.get(lessonId)) {
      case (?lesson) {
        if (not canEditLesson(caller, lesson)) {
          Runtime.trap("Pa Autorizim: Mund të fshish fjalë vetëm nga mësimet e tua");
        };

        switch (lessonWords.get(lessonId)) {
          case (?wordsSet) {
            if (not wordsSet.contains(word)) {
              Runtime.trap("Fjala nuk u gjet në këtë mësim");
            };

            wordsSet.remove(word);

            let wordStillInLessons = lessonWords.values().any(func(ws) { ws.contains(word) });

            if (not wordStillInLessons) {
              vocabulary.remove(word);
            };
          };
          case (null) {
            Runtime.trap("Nuk ka fjalë të regjistruara për këtë mësim");
          };
        };
      };
      case (null) {
        Runtime.trap("Mësimi nuk u gjet");
      };
    };
  };

  public shared ({ caller }) func createQuiz(quizType : QuizType, title : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të krijojnë kuize");
    };

    if (not canCreateLessons(caller)) {
      Runtime.trap("Pa Autorizim: Vetëm mësuesit dhe administratorët mund të krijojnë kuize");
    };

    let id = quizzes.size().toText();
    let quiz : Quiz = {
      id;
      quizType;
      title;
      author = caller;
      createdAt = Time.now();
      updatedAt = null;
    };

    quizzes.add(id, quiz);
    id;
  };

  public shared ({ caller }) func updateQuiz(quizId : Text, title : Text, quizType : QuizType) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të përditësojnë kuize");
    };

    if (not canCreateLessons(caller)) {
      Runtime.trap("Pa Autorizim: Vetëm mësuesit dhe administratorët mund të përditësojnë kuize");
    };

    switch (quizzes.get(quizId)) {
      case (?existingQuiz) {
        let updatedQuiz : Quiz = {
          existingQuiz with
          title;
          quizType;
          updatedAt = ?Time.now();
        };
        quizzes.add(quizId, updatedQuiz);
      };
      case (null) {
        Runtime.trap("Kuizi nuk u gjet");
      };
    };
  };

  public shared ({ caller }) func deleteQuiz(quizId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të fshijnë kuize");
    };

    if (not canCreateLessons(caller)) {
      Runtime.trap("Pa Autorizim: Vetëm mësuesit dhe administratorët mund të fshijnë kuize");
    };

    switch (quizzes.get(quizId)) {
      case (?existingQuiz) {
        quizzes.remove(quizId);
      };
      case (null) {
        Runtime.trap("Kuizi nuk u gjet");
      };
    };
  };

  public query ({ caller }) func getQuizzes() : async [Quiz] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shikojnë kuizet");
    };

    quizzes.values().toArray();
  };

  public query ({ caller }) func getQuiz(quizId : Text) : async ?Quiz {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shikojnë kuizet");
    };

    quizzes.get(quizId);
  };

  public query ({ caller }) func getRandomWords() : async [Word] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Pa Autorizim: Vetëm përdoruesit e regjistruar mund të shikojnë fjalët");
    };

    func convertStableWord(s : StableWord) : Word {
      {
        s with
        albanianMeanings = s.albanianMeanings.toArray();
        forms = s.forms.toArray();
        formMeanings = s.formMeanings.toArray();
      };
    };

    let valuesArray = vocabulary.values().toArray();
    let convertedArray = Array.tabulate(
      valuesArray.size(),
      func(i) { convertStableWord(valuesArray[i]) },
    );
    convertedArray;
  };
};
