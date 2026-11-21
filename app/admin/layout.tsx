import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { AdminNav } from "@/components/admin/AdminNav";
import { getAdminViewer } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s • TerraNova Admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const viewer = await getAdminViewer();
  if (viewer.status === "signed-out") {
    redirect("/login?returnTo=%2Fadmin");
  }
  if (viewer.status === "denied") {
    return <AdminAccessDenied email={viewer.user.email} />;
  }

  return (
    <section className="site-container py-space-lg sm:py-space-xl">
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-space-lg">
        <aside>
          <div className="sticky top-28">
            <div className="mb-3 rounded-lg bg-surface-container-low p-3">
              <p className="eyebrow text-primary">TerraNova</p>
              <p className="mt-1 font-display text-headline-sm text-on-surface">
                Admin panel
              </p>
              <p className="mt-0.5 break-all text-label-sm text-on-surface-variant">
                {viewer.user.email}
              </p>
            </div>
            <AdminNav />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
