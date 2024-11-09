"use client";

import AdminHeader from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import ProductList from "@/components/products/product-list";
import ProductForm from "@/components/products/product-form";
import { Product } from "@/types/product";

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div>
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Produtos</CardTitle>
                <CardDescription>
                  Gerencie os produtos do seu catálogo
                </CardDescription>
              </div>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ProductList />
          </CardContent>
        </Card>

        <ProductForm
          open={showForm || !!editingProduct}
          onOpenChange={handleFormClose}
          product={editingProduct}
        />
      </main>
    </div>
  );
}