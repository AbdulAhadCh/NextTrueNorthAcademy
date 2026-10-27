"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createCourse, type CreateCourseState } from "@/app/admin/courses/actions";
import { COURSE_KINDS, KIND_LABELS, SLUG_PATTERN, slugify } from "@/lib/admin-types";

export default function NewCourseForm() {
  const [state, formAction, pending] = useActionState<CreateCourseState, FormData>(createCourse, {});
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  // Keep suggesting a slug from the title until the admin edits it by hand.
  const [slugEdited, setSlugEdited] = useState(false);
  const [kind, setKind] = useState<string>("course");
  const [description, setDescription] = useState("");

  return (
    <form action={formAction} className="admin-card admin-form">
      <div className="admin-field">
        <label htmlFor="course-title">Title</label>
        <input
          id="course-title"
          name="title"
          required
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!slugEdited) setSlug(slugify(event.target.value));
          }}
        />
      </div>

      <div className="admin-field">
        <label htmlFor="course-slug">Slug</label>
        <input
          aria-describedby="course-slug-hint"
          aria-invalid={state.slugError ? true : undefined}
          id="course-slug"
          name="slug"
          pattern={SLUG_PATTERN}
          required
          title="Lowercase letters and numbers joined by dashes, e.g. pebc-part-1"
          value={slug}
          onChange={(event) => {
            setSlug(event.target.value);
            setSlugEdited(event.target.value !== "");
          }}
        />
        <p className="admin-field__hint" id="course-slug-hint">
          Used in the course URL. Lowercase letters and numbers joined by dashes.
        </p>
        {state.slugError ? <p className="admin-error" role="alert">{state.slugError}</p> : null}
      </div>

      <div className="admin-field">
        <label htmlFor="course-kind">Kind</label>
        <select id="course-kind" name="kind" value={kind} onChange={(event) => setKind(event.target.value)}>
          {COURSE_KINDS.map((value) => (
            <option key={value} value={value}>
              {KIND_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-field">
        <label htmlFor="course-description">
          Description <span className="admin-field__optional">(optional)</span>
        </label>
        <textarea
          id="course-description"
          name="description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      {state.errors?.length ? (
        <ul className="admin-error admin-error--block" role="alert">
          {state.errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}

      <div className="admin-form__actions">
        <button className="button button--primary" disabled={pending} type="submit">
          {pending ? "Creating…" : "Create course"}
        </button>
        <Link className="button button--secondary" href="/admin/courses">
          Cancel
        </Link>
      </div>
    </form>
  );
}
