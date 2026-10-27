"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminMutate } from "@/lib/admin-api";
import { COURSE_KINDS, type Course } from "@/lib/admin-types";

export type CreateCourseState = {
  errors?: string[];
  slugError?: string;
};

export async function createCourse(
  _previous: CreateCourseState,
  formData: FormData,
): Promise<CreateCourseState> {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const kind = String(formData.get("kind") ?? "");
  const description = String(formData.get("description") ?? "").trim();

  if (!title || !slug || !COURSE_KINDS.includes(kind as (typeof COURSE_KINDS)[number])) {
    return { errors: ["Title, slug and kind are required."] };
  }

  // The API checks admin access with the forwarded token.
  const result = await adminMutate<Course>("POST", "admin/courses", {
    title,
    slug,
    kind,
    ...(description ? { description } : {}),
  });

  if (!result.ok) {
    // The only conflict when creating a course is a duplicate slug.
    if (result.status === 409) return { slugError: "That slug is already taken." };
    return { errors: result.messages };
  }

  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${result.data.id}`);
}
