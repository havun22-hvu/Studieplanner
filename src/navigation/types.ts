export type RootStackParamList = {
  Auth: undefined;
  StudentMain: undefined;
  MentorMain: undefined;
};

export type StudentTabParamList = {
  Subjects: undefined;
  Agenda: undefined;
  Stats: undefined;
  Settings: undefined;
};

export type SubjectsStackParamList = {
  SubjectsList: undefined;
  SubjectDetail: { subjectId: string | null };
};

export type AgendaStackParamList = {
  AgendaView: undefined;
  Timer: { sessionId: string };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
};

export type MentorTabParamList = {
  Students: undefined;
  Settings: undefined;
};
