"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/lib/admin/auth";
import { updateOrderStatus } from "@/lib/db/orders";
import {
  isFulfillmentStatus,
  type FulfillmentStatus,
} from "@/lib/orders";

export async function updateFulfillmentStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdminAction();
  const orderId = String(formData.get("orderId") || "");
  const expectedStatus = String(formData.get("expectedStatus") || "");
  const nextStatus = String(formData.get("nextStatus") || "");

  if (
    !/^[a-f0-9]{24}$/i.test(orderId) ||
    !isFulfillmentStatus(expectedStatus) ||
    !isFulfillmentStatus(nextStatus)
  ) {
    redirect(`/admin/orders/${orderId}?error=invalid`);
  }

  const result = await updateOrderStatus({
    orderId,
    expectedStatus: expectedStatus as FulfillmentStatus,
    nextStatus: nextStatus as FulfillmentStatus,
    admin: { id: admin.id, name: admin.name, email: admin.email },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  if (!result.ok) {
    redirect(
      `/admin/orders/${orderId}?error=${result.reason === "invalid" ? "invalid" : "stale"}`,
    );
  }

  redirect(`/admin/orders/${orderId}?updated=1`);
}
