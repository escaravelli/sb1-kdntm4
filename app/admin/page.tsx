import AdminHeader from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Store, Package, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";

const stats = [
  {
    title: "Total de Produtos",
    value: "0",
    icon: Package,
    description: "Produtos em seu catálogo",
  },
  {
    title: "Pedidos Hoje",
    value: "0",
    icon: ShoppingCart,
    description: "Pedidos recebidos hoje",
  },
  {
    title: "Visitantes",
    value: "0",
    icon: Users,
    description: "Visitantes nos últimos 30 dias",
  },
];

export default function AdminPage() {
  return (
    <div>
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo ao seu Painel</CardTitle>
              <CardDescription>
                Comece adicionando produtos ao seu catálogo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/products">
                <Button>Adicionar Primeiro Produto</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}