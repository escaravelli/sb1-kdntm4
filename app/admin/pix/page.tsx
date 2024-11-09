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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const pixKeySchema = z.object({
  type: z.enum(["email", "phone", "cpf", "cnpj", "random"], {
    required_error: "Selecione um tipo de chave",
  }),
  key: z.string().min(1, "A chave PIX é obrigatória"),
});

export default function PixSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [pixKey, setPixKey] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof pixKeySchema>>({
    resolver: zodResolver(pixKeySchema),
    defaultValues: {
      type: undefined,
      key: "",
    },
  });

  useEffect(() => {
    loadPixKey();
  }, []);

  async function loadPixKey() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("pix_keys")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      console.error("Erro ao carregar chave PIX:", error);
      return;
    }

    if (data) {
      setPixKey(data);
      form.reset({
        type: data.type,
        key: data.key,
      });
    }
  }

  async function onSubmit(values: z.infer<typeof pixKeySchema>) {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("pix_keys").upsert({
        user_id: session.user.id,
        type: values.type,
        key: values.key,
      });

      if (error) throw error;

      toast({
        title: "Chave PIX salva com sucesso",
        description: "Seus clientes agora podem pagar usando PIX",
      });

      loadPixKey();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar chave PIX",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <QrCode className="h-6 w-6" />
              <div>
                <CardTitle>Configurações do PIX</CardTitle>
                <CardDescription>
                  Configure sua chave PIX para receber pagamentos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Chave</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de chave" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="phone">Telefone</SelectItem>
                          <SelectItem value="cpf">CPF</SelectItem>
                          <SelectItem value="cnpj">CNPJ</SelectItem>
                          <SelectItem value="random">Chave Aleatória</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Escolha o tipo de chave PIX que você deseja usar
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chave PIX</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Digite sua chave PIX conforme o tipo selecionado
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar Chave PIX"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}