"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  FileStack,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  MousePointerClick,
  MoveHorizontal,
  ShoppingBag,
  Sparkles,
  Store,
  Type,
} from "lucide-react";
import type { AdminDashboardTab } from "@/lib/admin-preview-paths";
import { BrandLogo } from "@/components/BrandLogo";

type NavItem = {
  id: AdminDashboardTab | "tools";
  label: string;
  icon: React.ReactNode;
  href?: string;
  dividerBefore?: boolean;
};

const MAIN_NAV: NavItem[] = [
  { id: "settings", label: "Сайт", icon: <LayoutDashboard size={18} /> },
  { id: "buttons", label: "Кнопки", icon: <MousePointerClick size={18} /> },
  { id: "hero", label: "Hero", icon: <Sparkles size={18} /> },
  { id: "services", label: "Услуги", icon: <LayoutGrid size={18} /> },
  { id: "marketplace", label: "Marketplace", icon: <Store size={18} /> },
  { id: "faq", label: "FAQ", icon: <HelpCircle size={18} /> },
  { id: "messages", label: "Заявки", icon: <Inbox size={18} />, dividerBefore: true },
];

const TOOL_NAV: NavItem[] = [
  { id: "tools", label: "Тексты (live)", icon: <Type size={18} />, href: "/admin/content-editor" },
  { id: "tools", label: "Отступы", icon: <MoveHorizontal size={18} />, href: "/admin/layout-editor" },
  { id: "tools", label: "Карточки проектов", icon: <LayoutGrid size={18} />, href: "/admin/projects/cards" },
  { id: "tools", label: "Страницы проектов", icon: <FileStack size={18} />, href: "/admin/projects/pages" },
  { id: "tools", label: "Кейсы", icon: <Sparkles size={18} />, href: "/admin/cases" },
];

type Props = {
  activeTab: AdminDashboardTab;
  onTabChange: (tab: AdminDashboardTab) => void;
  unreadCount: number;
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  preview: React.ReactNode;
  hidePreview?: boolean;
  children: React.ReactNode;
};

export function AdminShell({
  activeTab,
  onTabChange,
  unreadCount,
  title,
  subtitle,
  headerActions,
  preview,
  hidePreview,
  children,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
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
    <div className={`admin-dashboard ${hidePreview ? "admin-dashboard--no-preview" : ""}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Link href="/" className="admin-sidebar-logo">
            <BrandLogo
              brandName={brandName}
              highlightText={brandHighlightText}
              highlightColor={brandHighlightColor}
            />
          </Link>
          <span className="admin-sidebar-badge">Admin</span>
        </div>

        <nav className="admin-sidebar-nav">
          <p className="admin-sidebar-section">Контент</p>
          {MAIN_NAV.map((item) => {
            if (item.id === "tools") return null;
            const tab = item.id as AdminDashboardTab;
            const active = activeTab === tab;
            return (
              <div key={tab}>
                {item.dividerBefore ? <div className="admin-sidebar-divider" /> : null}
                <button
                  type="button"
                  className={`admin-sidebar-link ${active ? "admin-sidebar-link--active" : ""}`}
                  onClick={() => onTabChange(tab)}
                >
                  <span className="admin-sidebar-link-icon">{item.icon}</span>
                  <span className="admin-sidebar-link-label">{item.label}</span>
                  {tab === "messages" && unreadCount > 0 ? (
                    <span className="admin-sidebar-count">{unreadCount > 99 ? "99+" : unreadCount}</span>
                  ) : null}
                </button>
              </div>
            );
          })}

          <p className="admin-sidebar-section">Инструменты</p>
          {TOOL_NAV.map((item, i) =>
            item.href ? (
              <Link
                key={`${item.label}-${i}`}
                href={item.href}
                className={`admin-sidebar-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? "admin-sidebar-link--active" : ""}`}
              >
                <span className="admin-sidebar-link-icon">{item.icon}</span>
                <span className="admin-sidebar-link-label">{item.label}</span>
              </Link>
            ) : null,
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-sidebar-link">
            <ExternalLink size={18} className="shrink-0 opacity-70" />
            <span>Открыть сайт</span>
          </a>
          <a href="/marketplace" target="_blank" rel="noopener noreferrer" className="admin-sidebar-link">
            <ShoppingBag size={18} className="shrink-0 opacity-70" />
            <span>Marketplace</span>
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
