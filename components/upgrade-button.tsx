"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PREMIUM_PLAN_PRICE_ID } from "@/lib/stripe";
import { useState } from "react";

export default function UpgradeButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price_id: PREMIUM_PLAN_PRICE_ID,
        }),
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
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleUpgrade} disabled={isLoading} className="w-full">
      {isLoading ? "Processando..." : "Fazer Upgrade para Premium"}
    </Button>
  );
}