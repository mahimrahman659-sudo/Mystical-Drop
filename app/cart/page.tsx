import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your Peaceful Cart",
  description:
    "Review your handcrafted Mystical Drop fountains before continuing to delivery and payment.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartView />;
}
