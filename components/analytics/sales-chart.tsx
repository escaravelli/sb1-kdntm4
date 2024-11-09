"use client";

import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SalesChartProps {
  period: "day" | "week" | "month";
}

export default function SalesChart({ period }: SalesChartProps) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadSalesData();
  }, [period]);

  async function loadSalesData() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: payments } = await supabase
        .from("payments")
        .select("amount, created_at")
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
        )
        .order("created_at");

      if (!payments) return;

      // Agrupar dados por período
      const groupedData = payments.reduce((acc: any[], payment) => {
        const date = new Date(payment.created_at);
        const key =
          period === "day"
            ? `${date.getHours()}h`
            : period === "week"
            ? date.toLocaleDateString("pt-BR", { weekday: "short" })
            : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

        const existingEntry = acc.find((entry) => entry.name === key);
        if (existingEntry) {
          existingEntry.value += payment.amount;
        } else {
          acc.push({ name: key, value: payment.amount });
        }
        return acc;
      }, []);

      setData(groupedData);
    } catch (error) {
      console.error("Erro ao carregar dados de vendas:", error);
    }
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            className="text-xs"
            tick={{ fill: "hsl(var(--foreground))" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "hsl(var(--foreground))" }}
            tickFormatter={(value) =>
              new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 0,
              }).format(value)
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
            }}
            formatter={(value: number) =>
              new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(value)
            }
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}