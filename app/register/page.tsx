"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Store } from "lucide-react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { SITE_URL } from "@/lib/constants";

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Endereço de e-mail inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  storeName: z.string().min(2, "Nome da loja deve ter pelo menos 2 caracteres"),
  storeSlug: z
    .string()
    .min(2, "URL da loja deve ter pelo menos 2 caracteres")
    .max(144, "URL da loja deve ter menos de 144 caracteres")
    .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens são permitidos"),
});

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      storeName: "",
      storeSlug: "",
    },
  });

  const handleSlugChange = async (value: string) => {
    if (!value) {
      setSlugAvailable(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("store_slug", value)
        .single();

      setSlugAvailable(!data);
    } catch (error) {
      setSlugAvailable(true);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!slugAvailable) {
      form.setError("storeSlug", {
        type: "manual",
        message: "Esta URL já está em uso",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            store_name: values.storeName,
            store_slug: values.storeSlug,
          },
        },
      });

      if (signUpError) throw signUpError;

      toast({
        title: "Conta criada com sucesso!",
        description: "Redirecionando para o painel administrativo...",
      });

      router.push("/admin");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Store className="h-5 w-5" />
            <Link href="/" className="font-semibold">
              catalogo.vip
            </Link>
          </div>
          <CardTitle className="text-2xl">Crie sua conta</CardTitle>
          <CardDescription>
            Comece com seu catálogo de produtos profissional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="joao@exemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Loja</FormLabel>
                    <FormControl>
                      <Input placeholder="Minha Loja Incrível" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="storeSlug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Loja</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                          {new URL(SITE_URL).hostname}/
                        </span>
                        <Input
                          className="rounded-l-none"
                          placeholder="minha-loja"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleSlugChange(e.target.value);
                          }}
                        />
                      </div>
                    </FormControl>
                    {slugAvailable !== null && field.value && (
                      <p className={`text-sm ${slugAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {slugAvailable ? 'URL disponível' : 'URL já está em uso'}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}