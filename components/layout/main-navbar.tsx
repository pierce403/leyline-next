'use client';

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faGraduationCap,
  faBuilding,
  faChartLine,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export function MainNavbar() {
  // TODO: Wire up real user state, membership level, and admin visibility.
  const membershipLabel = "Leyline Free";
  const showAdminLink = true;

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="rounded bg-leyline-primary px-3 py-1 text-sm font-semibold uppercase tracking-wide text-white">
              Leyline
            </span>
          </Link>
        </div>
        <nav className="hidden items-center gap-3 text-sm text-gray-700 md:flex">
          <NavLink href="/" icon={faTachometerAlt} label="Dashboard" />
          <Separator />
          <NavLink href="/education" icon={faGraduationCap} label="Education" />
          <NavLink href="/companies" icon={faBuilding} label="Companies" />
          <NavLink href="/portfolio" icon={faChartLine} label="Portfolio" />
          {showAdminLink && (
            <>
              <Separator />
              <NavLink href="/admin" icon={faUserShield} label="Admin" />
            </>
          )}
          <Separator />
          <span className="rounded-full bg-leyline-blue px-3 py-1 text-xs font-semibold text-white">
            {membershipLabel}
          </span>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700"
            aria-label="User menu"
          >
            U
          </button>
        </nav>
      </div>
    </header>
  );
}

type NavLinkProps = {
  href: string;
  icon: IconDefinition;
  label: string;
};

function NavLink({ href, icon, label }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-gray-100"
    >
      <FontAwesomeIcon icon={icon} className="h-3 w-3 text-leyline-muted" />
      <span>{label}</span>
    </Link>
  );
}

function Separator() {
  return <span className="text-gray-300">|</span>;
}

