"use client";

import AdminHeader from "@/components/admin-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  Package,
  Percent,
} from "lucide-react";
import SalesChart from "@/components/analytics/sales-chart";
import VisitorChart from "@/components/analytics/visitor-chart";
import TopProducts from "@/components/analytics/top-products";
import TransactionList from "@/components/analytics/transaction-list";

interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  totalVisitors: number;
  averageTimeSpent: number;
  topProducts: any[];
  recentTransactions: any[];
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    totalVisitors: 0,
    averageTimeSpent: 0,
    topProducts: [],
    recentTransactions: [],
  });

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  async function loadAnalytics() {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Carregar dados analíticos do período selecionado
      const { data: payments } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "completed")
        .gte(
          "created_at",
          new Date(
            Date.now() -
              (period === "day"
                ? 86400000
                : period === "week"
                ? 604800000
                : 2592000000)
          ).toISOString()
        );

      // Calcular métricas
      const totalRevenue = payments?.reduce(
        (sum, payment) => sum + payment.amount,
        0
      ) || 0;
      const totalOrders = payments?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setAnalytics({
        ...analytics,
        totalRevenue,
        totalOrders,
        averageOrderValue,
        conversionRate: 2.5, // Exemplo: implementar cálculo real
        totalVisitors: 1000, // Exemplo: implementar tracking real
        averageTimeSpent: 180, // Exemplo: implementar tracking real
        topProducts: [], // Será preenchido pelo componente TopProducts
        recentTransactions: payments || [],
      });
    } catch (error) {
      console.error("Erro ao carregar análises:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const stats = [
    {
      title: "Receita Total",
      value: formatPrice(analytics.totalRevenue),
      icon: DollarSign,
      change: "+12.5%",
      trend: "up",
    },
    {
      title: "Total de Pedidos",
      value: analytics.totalOrders.toString(),
      icon: ShoppingCart,
      change: "+8.2%",
      trend: "up",
    },
    {
      title: "Visitantes",
      value: analytics.totalVisitors.toString(),
      icon: Users,
      change: "-3.1%",
      trend: "down",
    },
    {
      title: "Tempo Médio",
      value: `${Math.floor(analytics.averageTimeSpent / 60)}min`,
      icon: Clock,
      change: "+5.3%",
      trend: "up",
    },
    {
      title: "Produtos Ativos",
      value: "24",
      icon: Package,
      change: "0%",
      trend: "neutral",
    },
    {
      title: "Taxa de Conversão",
      value: `${analytics.conversionRate}%`,
      icon: Percent,
      change: "+1.2%",
      trend: "up",
    },
  ];

  return (
    <div>
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Análises</h1>
            <Tabs
              value={period}
              onValueChange={(value) => setPeriod(value as any)}
            >
              <TabsList>
                <TabsTrigger value="day">Hoje</TabsTrigger>
                <TabsTrigger value="week">7 Dias</TabsTrigger>
                <TabsTrigger value="month">30 Dias</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  <div
                    className={`text-xs flex items-center gap-1 ${
                      stat.trend === "up"
                        ? "text-green-500"
                        : stat.trend === "down"
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : stat.trend === "down" ? (
                      <ArrowDown className="h-3 w-3" />
                    ) : null}
                    {stat.change} vs. período anterior
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <SalesChart period={period} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visitantes</CardTitle>
              </CardHeader>
              <CardContent>
                <VisitorChart period={period} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TopProducts period={period} />
            <TransactionList transactions={analytics.recentTransactions} />
          </div>
        </div>
      </main>
    </div>
  );
}