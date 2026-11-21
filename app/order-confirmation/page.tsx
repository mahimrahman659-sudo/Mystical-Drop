import type { Metadata } from "next";
import { ConfirmationView } from "@/components/checkout/ConfirmationView";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Your TerraNova demo order confirmation.",
};

export default function OrderConfirmationPage() {
  return <ConfirmationView />;
}
