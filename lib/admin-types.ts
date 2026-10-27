// Shapes returned by the NestJS /admin API. Optional fields may be missing.

export const COURSE_KINDS = ["course", "question_bank", "osce_portal"] as const;
export type CourseKind = (typeof COURSE_KINDS)[number];

export const KIND_LABELS: Record<CourseKind, string> = {
  course: "Course",
  question_bank: "Question Bank",
  osce_portal: "OSCE Portal",
};

export function kindLabel(kind: string) {
  return KIND_LABELS[kind as CourseKind] ?? kind;
}

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  kind: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  moduleCount?: number;
  lessonCount?: number;
};

// Lowercase letters/numbers joined by single dashes, e.g. "pebc-part-1".
export const SLUG_PATTERN = "[a-z0-9]+(-[a-z0-9]+)*";

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
