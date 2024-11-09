"use client";

import { CartProvider } from "@/components/cart/cart-provider";
import { Toaster } from "@/components/ui/toaster";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {children}
      <Toaster />
    </CartProvider>
  );
}