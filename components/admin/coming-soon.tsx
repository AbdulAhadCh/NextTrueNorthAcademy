import Breadcrumb from "@/components/admin/breadcrumb";

export default function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <>
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: title }]} />
      <header className="admin-header">
        <h1>{title}</h1>
      </header>
      <section className="admin-card admin-empty">
        <span className="admin-badge admin-badge--soon">Coming soon</span>
        <p>{description}</p>
      </section>
    </>
  );
}
