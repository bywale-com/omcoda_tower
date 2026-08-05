export type PersonaEnrichmentSubjectId = "consultant" | "operator" | "contact";

export type PersonaCantItem = {
  id: string;
  subjectId: PersonaEnrichmentSubjectId;
  title: string;
  rightNowICant: string;
  surfaceIds: string[];
  gap: string;
  need: string;
};

export type PersonaFurnishItem = {
  id: string;
  subjectId: PersonaEnrichmentSubjectId;
  title: string;
  supportingAffordance: string;
  surfaceIds: string[];
  implementationProblem: string;
  implementation: string;
  doesNotChangeCoreFunction: string;
};

export type PersonaEnrichmentSubject = {
  id: PersonaEnrichmentSubjectId;
  label: string;
  cantCount: number;
  furnishCount: number;
};
