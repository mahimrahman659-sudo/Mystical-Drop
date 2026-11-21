"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/admin/auth";
import type { BannerFormState } from "@/lib/admin/banner-form";
import { isAllowedImageSource } from "@/lib/admin/images";
import { setSiteBanner } from "@/lib/db/site-settings";

const bannerSchema = z.object({
  imageSrc: z.string().trim().min(1, "Choose or upload a banner image."),
  imageAlt: z
    .string()
    .trim()
    .min(4, "Describe the banner image for accessibility.")
    .max(180, "Keep the description under 180 characters."),
});

export async function updateBannerAction(
  _previousState: BannerFormState,
  formData: FormData,
): Promise<BannerFormState> {
  const admin = await requireAdminAction();
  const parsed = bannerSchema.safeParse({
    imageSrc: String(formData.get("imageSrc") || ""),
    imageAlt: String(formData.get("imageAlt") || ""),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ?? "Review the banner details and try again.",
    };
  }

  if (!(await isAllowedImageSource(parsed.data.imageSrc))) {
    return { error: "Choose or upload a supported banner image." };
  }

  try {
    await setSiteBanner({
      ...parsed.data,
      updatedBy: admin.email,
    });
  } catch {
    return { error: "The banner could not be saved. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: "Homepage banner updated." };
}
