import type { Metadata } from "next";
import { ConfirmationView } from "@/components/checkout/ConfirmationView";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Your Mystical Drop order confirmation and delivery details.",
  robots: { index: false, follow: false },
};

export default function OrderConfirmationPage() {
  return <ConfirmationView />;
}
