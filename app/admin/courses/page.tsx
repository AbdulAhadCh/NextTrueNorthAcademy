import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/admin/breadcrumb";
import StatusBadge from "@/components/admin/status-badge";
import { adminGet } from "@/lib/admin-api";
import { kindLabel, type Course } from "@/lib/admin-types";

export const metadata: Metadata = {
  title: "Courses | TrueNorth Admin",
};

export default async function CoursesPage() {
  const courses = await adminGet<Course[]>("admin/courses");
  const showModules = courses.some((course) => typeof course.moduleCount === "number");
  const showLessons = courses.some((course) => typeof course.lessonCount === "number");

  return (
    <>
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Courses" }]} />
      <header className="admin-header">
        <h1>Courses</h1>
        <Link className="button button--primary" href="/admin/courses/new">
          New course
        </Link>
      </header>

      {courses.length === 0 ? (
        <section className="admin-card admin-empty">
          <p>No courses yet. Create your first course.</p>
        </section>
      ) : (
        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Kind</th>
                <th scope="col">Status</th>
                {showModules ? <th scope="col" className="admin-table__num">Modules</th> : null}
                {showLessons ? <th scope="col" className="admin-table__num">Lessons</th> : null}
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <Link className="admin-table__title" href={`/admin/courses/${course.id}`}>
                      {course.title}
                    </Link>
                    <span className="admin-table__slug">{course.slug}</span>
                  </td>
                  <td>{kindLabel(course.kind)}</td>
                  <td>
                    <StatusBadge published={course.isPublished} />
                  </td>
                  {showModules ? <td className="admin-table__num">{course.moduleCount ?? "–"}</td> : null}
                  {showLessons ? <td className="admin-table__num">{course.lessonCount ?? "–"}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
