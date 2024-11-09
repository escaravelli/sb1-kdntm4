import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import UpgradeButton from "@/components/upgrade-button";

const plans = [
  {
    name: "Grátis",
    description: "Perfeito para começar",
    price: "R$0",
    features: [
      "Produtos ilimitados",
      "Imagens e vídeos dos produtos",
      "URL personalizada do catálogo",
      "Integração de pedidos WhatsApp",
      "Análises básicas",
    ],
    button: {
      text: "Começar Grátis",
      href: "/register",
      variant: "outline" as const,
    },
  },
  {
    name: "Premium",
    description: "Para negócios prontos para crescer",
    price: "R$20",
    features: [
      "Tudo do plano Grátis, mais:",
      "Pagamentos online (Pix e Cartão)",
      "Análises avançadas",
      "Suporte prioritário",
      "Suporte a domínio personalizado",
      "Remover marca catalogo.vip",
    ],
    button: {
      text: "Começar Premium",
      href: "/register?plan=premium",
      variant: "default" as const,
    },
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Preços simples e transparentes</h1>
          <p className="text-xl text-muted-foreground">
            Escolha o plano ideal para seu negócio
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.name === "Premium"
                  ? "border-primary shadow-lg"
                  : "border-border"
              }
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.name === "Premium" ? (
                  <UpgradeButton />
                ) : (
                  <Link href={plan.button.href} className="w-full">
                    <Button
                      variant={plan.button.variant}
                      size="lg"
                      className="w-full"
                    >
                      {plan.button.text}
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}