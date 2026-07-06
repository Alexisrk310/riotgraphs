import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") {
    redirect("/");
  }
  return (
    <div className="container mx-auto flex gap-8 px-4 py-8">
      <aside className="w-56 space-y-1 text-sm">
        <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Admin</div>
        {[
          { href: "/admin", label: "Overview" },
          { href: "/admin/users", label: "Users" },
          { href: "/admin/jobs", label: "Jobs" },
          { href: "/admin/audit", label: "Audit Log" },
        ].map((i) => (
          <Link key={i.href} href={i.href} className="block rounded px-3 py-2 hover:bg-white/5">
            {i.label}
          </Link>
        ))}
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
