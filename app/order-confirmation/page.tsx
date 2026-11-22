import type { Metadata } from "next";
import { ConfirmationView } from "@/components/checkout/ConfirmationView";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Your Mystical Drop demo order confirmation.",
  robots: { index: false, follow: false },
};

export default function OrderConfirmationPage() {
  return <ConfirmationView />;
}
