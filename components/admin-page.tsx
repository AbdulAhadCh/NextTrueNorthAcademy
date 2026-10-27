import Link from "next/link";

const SECTIONS = [
  {
    href: "/admin/courses",
    title: "Courses",
    description: "Create courses, question banks and OSCE portals, and build their modules and lessons.",
  },
  {
    href: "/admin/plans",
    title: "Plans",
    description: "Subscription plans and what each one includes.",
    soon: true,
  },
  {
    href: "/admin/students",
    title: "Students",
    description: "Student accounts, enrolments and progress.",
    soon: true,
  },
];

export default function AdminPage() {
  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Admin overview</h1>
        </div>
      </header>

      <div className="admin-sections">
        {SECTIONS.map((section) => (
          <Link className="admin-card admin-section-link" href={section.href} key={section.href}>
            <h2>
              {section.title}
              {section.soon ? <span className="admin-badge admin-badge--soon">Coming soon</span> : null}
            </h2>
            <p>{section.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
