import Breadcrumb from "@/components/admin/breadcrumb";
import StatusBadge from "@/components/admin/status-badge";
import { adminGet } from "@/lib/admin-api";
import { kindLabel, type Course } from "@/lib/admin-types";

// Phase A: read-only summary so "Create course" has somewhere to land.
// Editing, publishing and the structure editor come in later phases.
export default async function CoursePage({ params }: PageProps<"/admin/courses/[id]">) {
  const { id } = await params;
  const course = await adminGet<Course>(`admin/courses/${id}`);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Courses", href: "/admin/courses" },
          { label: course.title },
        ]}
      />
      <header className="admin-header">
        <div>
          <h1>{course.title}</h1>
          <p className="admin-header__meta">
            {kindLabel(course.kind)} · <code>{course.slug}</code> · <StatusBadge published={course.isPublished} />
          </p>
        </div>
      </header>
      <section className="admin-card">
        <p>{course.description || <span className="admin-muted">No description.</span>}</p>
      </section>
    </>
  );
}
