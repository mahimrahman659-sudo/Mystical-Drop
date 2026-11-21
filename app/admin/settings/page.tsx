import type { Metadata } from "next";
import { updateBannerAction } from "@/app/admin/settings/actions";
import { BannerForm } from "@/components/admin/BannerForm";
import { getAdminViewer } from "@/lib/admin/auth";
import { listImageAssets } from "@/lib/admin/images";
import { getSiteBanner } from "@/lib/db/site-settings";

export const metadata: Metadata = {
  title: "Site banner",
};

export default async function AdminSettingsPage() {
  const viewer = await getAdminViewer();
  if (viewer.status !== "admin") return null;

  const [banner, images] = await Promise.all([
    getSiteBanner(),
    listImageAssets(),
  ]);

  return (
    <div>
      <p className="eyebrow text-primary">Storefront</p>
      <h1 className="mt-1 font-display text-display-sm tracking-tight text-on-surface">
        Site banner
      </h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Change the lead image shown on the homepage. Changes appear after the
        next storefront refresh.
      </p>
      <div className="mt-5">
        <BannerForm
          action={updateBannerAction}
          initialImageSrc={banner.imageSrc}
          initialImageAlt={banner.imageAlt}
          images={images}
        />
      </div>
    </div>
  );
}
