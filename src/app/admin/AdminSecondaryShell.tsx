"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  FileStack,
  LayoutGrid,
  LogOut,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const PROJECTS_NAV: NavItem[] = [
  { href: "/admin/projects/cards", label: "Карточки на главной", icon: <LayoutGrid size={18} /> },
  { href: "/admin/projects/pages", label: "Страницы проектов", icon: <FileStack size={18} /> },
];

type Props = {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  preview: React.ReactNode;
  children: React.ReactNode;
};

export function AdminSecondaryShell({ title, subtitle, headerActions, preview, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [brandName, setBrandName] = useState("REDLINE");
  const [brandHighlightText, setBrandHighlightText] = useState("");
  const [brandHighlightColor, setBrandHighlightColor] = useState("");

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Record<string, unknown> | null) => {
        if (!mounted || !data) return;
        setBrandName(String(data.brandName ?? "REDLINE"));
        setBrandHighlightText(String(data.brandHighlightText ?? ""));
        setBrandHighlightColor(String(data.brandHighlightColor ?? ""));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Link href="/admin" className="admin-sidebar-logo">
            <BrandLogo
              brandName={brandName}
              highlightText={brandHighlightText}
              highlightColor={brandHighlightColor}
            />
          </Link>
          <span className="admin-sidebar-badge">Projects</span>
        </div>

        <nav className="admin-sidebar-nav">
          <Link href="/admin" className="admin-sidebar-link admin-sidebar-link--back">
            <span className="admin-sidebar-link-icon">
              <ArrowLeft size={18} />
            </span>
            <span className="admin-sidebar-link-label">Админ-панель</span>
          </Link>

          <div className="admin-sidebar-divider" />

          <p className="admin-sidebar-section">Проекты</p>
          {PROJECTS_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-sidebar-link ${active ? "admin-sidebar-link--active" : ""}`}
              >
                <span className="admin-sidebar-link-icon">{item.icon}</span>
                <span className="admin-sidebar-link-label">{item.label}</span>
              </Link>
            );
          })}

          <p className="admin-sidebar-section">Кейсы</p>
          <Link
            href="/admin/cases"
            className={`admin-sidebar-link ${pathname.startsWith("/admin/cases") ? "admin-sidebar-link--active" : ""}`}
          >
            <span className="admin-sidebar-link-icon">
              <Sparkles size={18} />
            </span>
            <span className="admin-sidebar-link-label">Страницы кейсов</span>
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-sidebar-link">
            <ExternalLink size={18} className="shrink-0 opacity-70" />
            <span>Открыть сайт</span>
          </a>
          <button
            type="button"
            className="admin-sidebar-link admin-sidebar-link--danger"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/admin/login");
            }}
          >
            <LogOut size={18} className="shrink-0 opacity-70" />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="min-w-0">
            <h1 className="admin-topbar-title">{title}</h1>
            {subtitle ? <p className="admin-topbar-sub">{subtitle}</p> : null}
          </div>
          {headerActions ? <div className="admin-topbar-actions">{headerActions}</div> : null}
        </header>
        <div className="admin-workspace">{children}</div>
      </div>

      {preview}
    </div>
  );
}
