import type { Metadata } from "next";
import Breadcrumb from "@/components/admin/breadcrumb";
import NewCourseForm from "@/components/admin/new-course-form";

export const metadata: Metadata = {
  title: "New course | TrueNorth Admin",
};

export default function NewCoursePage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Courses", href: "/admin/courses" },
          { label: "New course" },
        ]}
      />
      <header className="admin-header">
        <h1>New course</h1>
      </header>
      <NewCourseForm />
    </>
  );
}
