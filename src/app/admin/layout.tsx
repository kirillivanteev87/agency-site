import "./admin.css";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root admin-root--app" data-admin-surface>
      {children}
    </div>
  );
}
