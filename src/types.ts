// src/types.ts - All application types in a single file at the root level

// Use const enum with as const to make it JavaScript compatible
export const DistortionType = {
  EMOTIONAL_REASONING: "Emotional Reasoning",
  DISQUALIFYING_POSITIVE: "Disqualifying the Positive",
  MIND_READING: "Mind Reading",
  ALL_OR_NOTHING: "All or Nothing Thinking",
  CATASTROPHIZING: "Catastrophizing",
} as const;

// Create a type from the object values
export type DistortionType = typeof DistortionType[keyof typeof DistortionType];

export interface DistortionTypeInfo {
  value: DistortionType;
  label: string;
  description: string;
}

export const distortionTypes: DistortionTypeInfo[] = [
  {
    value: DistortionType.EMOTIONAL_REASONING,
    label: "Emotional Reasoning",
    description: "When you feel something so intensely, so you think it might be true."
  },
  {
    value: DistortionType.DISQUALIFYING_POSITIVE,
    label: "Disqualifying the Positive",
    description: "Focusing only on the small negative aspects."
  },
  {
    value: DistortionType.MIND_READING,
    label: "Mind Reading",
    description: "Making assumptions without enough evidence."
  },
  {
    value: DistortionType.ALL_OR_NOTHING,
    label: "All or Nothing Thinking",
    description: "Beautiful or hideous. Black or white. Nothing in between."
  },
  {
    value: DistortionType.CATASTROPHIZING,
    label: "Catastrophizing",
    description: "Imagining the worst explanations or outcomes."
  },
];

export interface JournalEntry {
  id: string;
  timestamp: number; // milliseconds since epoch
  negativeThought: string;
  distortionType: DistortionType;
  rationalResponse: string;
  createdAt: number; // milliseconds since epoch
}

export type NewJournalEntry = Omit<JournalEntry, "id" | "createdAt">;
