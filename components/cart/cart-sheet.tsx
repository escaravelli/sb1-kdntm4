"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Trash } from "lucide-react";
import { useCart } from "./cart-provider";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import PixPayment from "@/components/payment/pix-payment";
import { useState } from "react";
import { useToast } from "../ui/use-toast";

export function CartSheet() {
  const { state, dispatch } = useCart();
  const { toast } = useToast();
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    cpf: "",
  });

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
    toast({
      title: "Item removido",
      description: "O item foi removido do carrinho",
    });
  };

  const handleCheckout = () => {
    if (!customerInfo.name || !customerInfo.email) {
      toast({
        variant: "destructive",
        title: "Informações necessárias",
        description: "Preencha seu nome e e-mail para continuar",
      });
      return;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {state.items.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
            >
              {state.items.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Carrinho</SheetTitle>
          <SheetDescription>
            {state.items.length === 0
              ? "Seu carrinho está vazio"
              : `${state.items.length} item(s) no carrinho`}
          </SheetDescription>
        </SheetHeader>

        {state.items.length > 0 && (
          <div className="flex flex-col gap-6 py-6">
            <div className="space-y-4">
              {state.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b pb-4"
                >
                  {item.image && (
                    <div className="h-16 w-16 relative rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="text-lg font-medium flex justify-between">
                <span>Total:</span>
                <span>{formatPrice(state.total)}</span>
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="Nome completo"
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, name: e.target.value })
                  }
                />
                <Input
                  type="email"
                  placeholder="E-mail"
                  value={customerInfo.email}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, email: e.target.value })
                  }
                />
                <Input
                  placeholder="CPF (opcional)"
                  value={customerInfo.cpf}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, cpf: e.target.value })
                  }
                />
              </div>
            </div>

            <SheetFooter>
              <div className="w-full space-y-4">
                <PixPayment
                  amount={state.total}
                  description={`Pedido com ${state.items.length} item(s)`}
                  customer={customerInfo}
                  onSuccess={() => {
                    dispatch({ type: "CLEAR_CART" });
                    toast({
                      title: "Pedido realizado com sucesso",
                      description: "Você receberá as instruções por e-mail",
                    });
                  }}
                />
              </div>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}