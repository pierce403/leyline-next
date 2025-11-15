import Link from "next/link";

export function AdminSidenav() {
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-white md:block">
      <nav className="flex h-full flex-col px-4 py-6 text-sm text-gray-700">
        <div className="mb-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Admin
          </div>
          <AdminLink href="/admin">Dashboard</AdminLink>
        </div>

        <div className="mb-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Users
          </div>
          <AdminLink href="/admin/users">Users</AdminLink>
          <AdminLink href="/admin/registration">Registration</AdminLink>
          <AdminLink href="/admin/invitations">Invitations</AdminLink>
        </div>

        <div className="mb-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Financial
          </div>
          <AdminLink href="/admin/transactions">Transactions</AdminLink>
          <AdminLink href="/admin/subscriptions">Subscriptions</AdminLink>
        </div>

        <div className="mb-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Education
          </div>
          <AdminLink href="/admin/education/programs">Programs</AdminLink>
          <AdminLink href="/admin/education/courses">Courses</AdminLink>
          <AdminLink href="/admin/education/modules">Modules</AdminLink>
          <AdminLink href="/admin/education/links">Links</AdminLink>
        </div>

        <div className="mb-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Settings
          </div>
          <AdminLink href="/admin/settings">App Settings</AdminLink>
        </div>

        <div className="mt-auto pt-4 text-xs text-gray-500">
          <Link href="/" className="hover:text-leyline-blue">
            ← Return to Application
          </Link>
        </div>
      </nav>
    </aside>
  );
}

type AdminLinkProps = {
  href: string;
  children: React.ReactNode;
};

function AdminLink({ href, children }: AdminLinkProps) {
  return (
    <Link
      href={href}
      className="mb-1 block rounded px-2 py-1 hover:bg-gray-100"
    >
      {children}
    </Link>
  );
}

