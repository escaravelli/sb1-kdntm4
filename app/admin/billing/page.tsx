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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface BillingInfo {
  subscription_status: string;
  subscription_id: string | null;
  stripe_customer_id: string | null;
}

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCreatingPortalSession, setIsCreatingPortalSession] = useState(false);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    loadBillingInfo();

    // Check URL parameters for success/canceled
    if (searchParams.get('success')) {
      toast({
        title: "Assinatura ativada com sucesso!",
        description: "Bem-vindo ao plano Premium",
      });
    } else if (searchParams.get('canceled')) {
      toast({
        variant: "destructive",
        title: "Assinatura cancelada",
        description: "O processo de upgrade foi cancelado",
      });
    }
  }, [searchParams]);

  const loadBillingInfo = async () => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("subscription_status, subscription_id, stripe_customer_id")
        .single();

      if (error) throw error;

      setBillingInfo(profile);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar informações",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao iniciar checkout");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsCreatingPortalSession(true);
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erro ao acessar portal de gerenciamento");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    } finally {
      setIsCreatingPortalSession(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Plano e Pagamento</CardTitle>
            <CardDescription>
              Gerencie seu plano e informações de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Plano Atual</h3>
              <p className="text-2xl font-bold mt-2">
                {billingInfo?.subscription_status === "active"
                  ? "Premium"
                  : "Grátis"}
              </p>
              {billingInfo?.subscription_status === "active" ? (
                <p className="text-sm text-muted-foreground mt-1">
                  Sua assinatura está ativa
                </p>
              ) : (
                <div className="mt-4">
                  <Button onClick={handleUpgrade} disabled={isUpgrading}>
                    {isUpgrading ? "Processando..." : "Fazer Upgrade para Premium"}
                  </Button>
                </div>
              )}
            </div>

            {billingInfo?.subscription_status === "active" && (
              <div>
                <h3 className="text-lg font-medium">Gerenciar Assinatura</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Acesse o portal de gerenciamento para alterar forma de pagamento
                  ou cancelar assinatura
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleManageSubscription}
                  disabled={isCreatingPortalSession}
                >
                  {isCreatingPortalSession
                    ? "Processando..."
                    : "Gerenciar Assinatura"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}