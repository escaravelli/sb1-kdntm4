"use client";

import { Button } from "@/components/ui/button";
import { Store, LogOut, User, Package, ChartBar, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: ChartBar },
  { href: "/admin/products", label: "Produtos", icon: Package },
  { href: "/admin/profile", label: "Perfil", icon: User },
  { href: "/admin/billing", label: "Assinatura", icon: CreditCard },
];

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Logout realizado com sucesso",
      description: "Até logo!",
    });

    router.push("/login");
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            <span className="font-semibold">Painel Administrativo</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm transition-colors hover:text-primary ${
                    pathname === item.href
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank">
              <Button variant="ghost" size="sm">
                Ver Catálogo
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}