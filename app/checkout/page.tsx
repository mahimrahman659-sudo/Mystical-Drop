import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete the TerraNova demo checkout with Cash on Delivery. No payment is collected.",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
