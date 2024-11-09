import { CartSheet } from "@/components/cart/cart-sheet";
import { Store } from "lucide-react";

interface StoreHeaderProps {
  storeName: string;
}

export default function StoreHeader({ storeName }: StoreHeaderProps) {
  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            <h1 className="font-semibold">{storeName}</h1>
          </div>
          <CartSheet />
        </div>
      </div>
    </header>
  );
}