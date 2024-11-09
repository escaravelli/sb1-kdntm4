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
import { useCart } from "./cart/cart-provider";
import { useToast } from "./ui/use-toast";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number | null;
  images: string[];
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  images,
}: ProductCardProps) {
  const { dispatch } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!price) {
      toast({
        title: "Produto sob consulta",
        description: "Entre em contato para mais informações",
      });
      return;
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id,
        name,
        price,
        quantity: 1,
        image: images?.[0],
      },
    });

    toast({
      title: "Produto adicionado",
      description: "O item foi adicionado ao carrinho",
    });
  };

  return (
    <Card>
      {images?.[0] && (
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          <Image
            src={images[0]}
            alt={name}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-1">{name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-bold">
          {price ? formatPrice(price) : "Sob Consulta"}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full gap-2"
          onClick={handleAddToCart}
          disabled={!price}
        >
          <ShoppingCart className="h-4 w-4" />
          {price ? "Adicionar ao Carrinho" : "Consultar"}
        </Button>
      </CardFooter>
    </Card>
  );
}