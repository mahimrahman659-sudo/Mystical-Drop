import "server-only";

import { BRAND_NAME, rebrandLegacyText } from "../brand";
import { getDb } from "@/lib/db/client";

export const SITE_SETTINGS_COLLECTION = "siteSettings";
const HOME_BANNER_KEY = "homeBanner";

const DEFAULT_BANNER_IMAGE = "/images/triptych-study.jpg";
const DEFAULT_BANNER_ALT = `The three ${BRAND_NAME} handcrafted fountains arranged on a warm wooden study desk with plants, notebooks, and a reading lamp`;

export type SiteBanner = {
  imageSrc: string;
  imageAlt: string;
  updatedAt: Date | null;
  updatedBy: string | null;
};

type SiteSettingsDocument = {
  key: string;
  imageSrc: string;
  imageAlt: string;
  updatedAt: Date;
  updatedBy: string;
};

export async function getSiteBanner(): Promise<SiteBanner> {
  const document = await getDb()
    .collection<SiteSettingsDocument>(SITE_SETTINGS_COLLECTION)
    .findOne({ key: HOME_BANNER_KEY });

  if (!document?.imageSrc?.trim() || !document.imageAlt?.trim()) {
    return {
      imageSrc: DEFAULT_BANNER_IMAGE,
      imageAlt: DEFAULT_BANNER_ALT,
      updatedAt: null,
      updatedBy: null,
    };
  }

  return {
    imageSrc: document.imageSrc,
    imageAlt: rebrandLegacyText(document.imageAlt),
    updatedAt: document.updatedAt ?? null,
    updatedBy: document.updatedBy ?? null,
  };
}

export async function setSiteBanner(input: {
  imageSrc: string;
  imageAlt: string;
  updatedBy: string;
}): Promise<void> {
  const now = new Date();
  await getDb()
    .collection<SiteSettingsDocument>(SITE_SETTINGS_COLLECTION)
    .updateOne(
      { key: HOME_BANNER_KEY },
      {
        $set: {
          imageSrc: input.imageSrc,
          imageAlt: input.imageAlt,
          updatedAt: now,
          updatedBy: input.updatedBy,
        },
        $setOnInsert: { key: HOME_BANNER_KEY },
      },
      { upsert: true },
    );
}
