import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your Peaceful Cart",
  description:
    "Review your handcrafted TerraNova fountains before continuing to delivery and payment.",
};

export default function CartPage() {
  return <CartView />;
}
