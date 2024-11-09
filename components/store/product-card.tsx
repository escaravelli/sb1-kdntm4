"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useCart } from "../cart/cart-provider";
import { useToast } from "../ui/use-toast";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { dispatch } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!product.price) {
      toast({
        title: "Produto sob consulta",
        description: "Entre em contato para mais informações",
      });
      return;
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images?.[0],
      },
    });

    toast({
      title: "Produto adicionado",
      description: "O item foi adicionado ao carrinho",
    });
  };

  return (
    <Card className="group">
      {product.images?.[0] && (
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-1">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-bold">
          {product.price ? formatPrice(product.price) : "Sob Consulta"}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full gap-2"
          onClick={handleAddToCart}
          disabled={!product.price}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.price ? "Adicionar ao Carrinho" : "Consultar"}
        </Button>
      </CardFooter>
    </Card>
  );
}