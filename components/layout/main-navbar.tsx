'use client';

import { useState, useEffect } from "react";
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

export type MainNavbarProps = {
  userName?: string;
  userEmail?: string;
  userPictureUrl?: string;
  userRoles?: string[];
  membershipLabel?: string;
  showAdminLink?: boolean;
};

export function MainNavbar({
  userName,
  userEmail,
  userPictureUrl,
  userRoles,
  membershipLabel = "Leyline Free",
  showAdminLink = false,
}: MainNavbarProps) {
  const initial =
    userName?.trim()?.[0]?.toUpperCase() ??
    userName?.trim()?.[0] ??
    undefined;

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center justify-between px-4">
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
          <UserMenu
            userName={userName}
            userEmail={userEmail}
            userPictureUrl={userPictureUrl}
            userRoles={userRoles}
            initial={initial ?? "U"}
          />
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

type UserMenuProps = {
  userName?: string;
  userEmail?: string;
  userPictureUrl?: string;
  userRoles?: string[];
  initial: string;
};

function UserMenu({
  userName,
  userEmail,
  userPictureUrl,
  userRoles,
  initial,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);

  const label = userName ?? userEmail ?? "User";

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700"
        aria-label="User menu"
        onClick={() => setOpen((value) => !value)}
      >
        {userPictureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={userPictureUrl}
            alt={label}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          initial
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-64 rounded-md border bg-white py-3 text-xs shadow-lg">
          <div className="px-3 pb-2">
            <div className="text-[11px] uppercase tracking-wide text-gray-400">
              Signed in as
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {userName ?? userEmail ?? "Unknown user"}
            </div>
            {userEmail && userName && (
              <div className="text-[11px] text-gray-500">{userEmail}</div>
            )}
          </div>
          <div className="border-t px-3 py-2">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Roles
            </div>
            <div className="text-[11px] text-gray-700">
              {userRoles && userRoles.length > 0
                ? userRoles.join(", ")
                : "No roles assigned"}
            </div>
          </div>
          <div className="border-t px-3 py-2">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Appearance
            </div>
            <ThemePreference />
          </div>
          <div className="border-t px-3 pt-2">
            <Link
              href="/account"
              className="block px-3 py-1.5 text-[11px] font-medium text-leyline-blue hover:bg-gray-50"
            >
              Account Settings
            </Link>
            <a
              href="/api/auth/logout"
              className="mt-1 block px-3 py-1.5 text-[11px] font-medium text-red-600 hover:bg-gray-50"
            >
              Log Out
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

type ThemeMode = "light" | "dark" | "system";

function ThemePreference() {
  const [mode, setMode] = useState<ThemeMode>("system");

  // Sync with localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("leyline-theme") as
      | ThemeMode
      | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setMode(stored);
      applyTheme(stored);
    } else {
      applyTheme("system");
    }
  }, []);

  const handleChange = (value: ThemeMode) => {
    setMode(value);
    applyTheme(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("leyline-theme", value);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => handleChange("light")}
        className={`flex-1 rounded border px-2 py-1 text-[11px] ${mode === "light"
          ? "border-leyline-blue bg-leyline-blue/10 text-leyline-blue"
          : "border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => handleChange("dark")}
        className={`flex-1 rounded border px-2 py-1 text-[11px] ${mode === "dark"
          ? "border-leyline-blue bg-leyline-blue/10 text-leyline-blue"
          : "border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
      >
        Dark
      </button>
      <button
        type="button"
        onClick={() => handleChange("system")}
        className={`flex-1 rounded border px-2 py-1 text-[11px] ${mode === "system"
          ? "border-leyline-blue bg-leyline-blue/10 text-leyline-blue"
          : "border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
      >
        System
      </button>
    </div>
  );
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  let target: ThemeMode = mode;

  if (mode === "system") {
    const prefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)",
    ).matches;
    target = prefersDark ? "dark" : "light";
  }

  root.dataset.theme = target;
}
