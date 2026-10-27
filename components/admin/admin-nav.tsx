"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/students", label: "Students" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="admin-nav">
      {LINKS.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className="admin-nav__link"
            href={href}
            key={href}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
