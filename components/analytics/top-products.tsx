"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface TopProductsProps {
  period: "day" | "week" | "month";
}

interface ProductStats {
  id: string;
  name: string;
  total_sales: number;
  revenue: number;
  views: number;
}

export default function TopProducts({ period }: TopProductsProps) {
  const [products, setProducts] = useState<ProductStats[]>([]);

  useEffect(() => {
    loadTopProducts();
  }, [period]);

  async function loadTopProducts() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Implementar lógica real de produtos mais vendidos
      const mockData: ProductStats[] = [
        {
          id: "1",
          name: "Produto Premium",
          total_sales: 45,
          revenue: 4500,
          views: 1200,
        },
        {
          id: "2",
          name: "Produto Popular",
          total_sales: 38,
          revenue: 3800,
          views: 980,
        },
        {
          id: "3",
          name: "Produto Básico",
          total_sales: 32,
          revenue: 1600,
          views: 850,
        },
      ];

      setProducts(mockData);
    } catch (error) {
      console.error("Erro ao carregar produtos mais vendidos:", error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos Mais Vendidos</CardTitle>
        <CardDescription>
          Os produtos com melhor desempenho no período
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Vendas</TableHead>
              <TableHead className="text-right">Receita</TableHead>
              <TableHead className="text-right">Visualizações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-right">{product.total_sales}</TableCell>
                <TableCell className="text-right">
                  {formatPrice(product.revenue)}
                </TableCell>
                <TableCell className="text-right">{product.views}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}