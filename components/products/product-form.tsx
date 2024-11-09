import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import { supabase, uploadProductImage } from "@/lib/supabase";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const productSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  price: z.string().optional(),
  show_price: z.boolean(),
  images: z.array(z.string()).default([]),
});

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  onSuccess?: () => void;
}

export default function ProductForm({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      show_price: true,
      images: [],
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price?.toString() || "",
        show_price: !!product.price,
        images: product.images || [],
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: "",
        show_price: true,
        images: [],
      });
    }
  }, [product, form]);

  async function onSubmit(values: z.infer<typeof productSchema>) {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado");

      // First, ensure user profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Perfil do usuário não encontrado. Por favor, configure seu perfil primeiro.");
      }

      const productData = {
        user_id: session.user.id,
        name: values.name,
        description: values.description,
        price: values.show_price && values.price ? parseFloat(values.price) : null,
        images: values.images,
      };

      if (product) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (error) throw error;

        toast({
          title: "Produto atualizado com sucesso",
          description: "As alterações foram salvas",
        });
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData);

        if (error) throw error;

        toast({
          title: "Produto criado com sucesso",
          description: "O produto foi adicionado ao seu catálogo",
        });
      }

      onSuccess?.();
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: product ? "Erro ao atualizar produto" : "Erro ao criar produto",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);

    // Validate files
    const invalidFiles = files.filter(
      file => 
        !ACCEPTED_IMAGE_TYPES.includes(file.type) || 
        file.size > MAX_FILE_SIZE
    );

    if (invalidFiles.length > 0) {
      toast({
        variant: "destructive",
        title: "Arquivo(s) inválido(s)",
        description: "Por favor, selecione apenas imagens (JPG, PNG, WebP) de até 5MB",
      });
      return;
    }

    setUploadingImages(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado");

      const uploadedUrls = await Promise.all(
        files.map(file => uploadProductImage(file, session.user.id))
      );

      const currentImages = form.getValues("images");
      form.setValue("images", [...currentImages, ...uploadedUrls]);

      toast({
        title: "Imagens enviadas com sucesso",
        description: `${files.length} imagem(ns) adicionada(s)`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar imagens",
        description: error.message,
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images");
    const newImages = currentImages.filter((_, i) => i !== index);
    form.setValue("images", newImages);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="show_price"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Mostrar Preço</FormLabel>
                    <FormDescription>
                      Desative para exibir "Sob Consulta"
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("show_price") && (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagens</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full gap-2"
                        disabled={uploadingImages}
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.multiple = true;
                          input.accept = "image/*";
                          input.onchange = (e) =>
                            handleImageUpload(e as unknown as React.ChangeEvent<HTMLInputElement>);
                          input.click();
                        }}
                      >
                        {uploadingImages ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {uploadingImages
                          ? "Enviando imagens..."
                          : "Adicionar imagens"}
                      </Button>

                      {field.value.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                          {field.value.map((url, index) => (
                            <div
                              key={url}
                              className="relative aspect-square rounded-lg overflow-hidden group"
                            >
                              <Image
                                src={url}
                                alt={`Imagem ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Produto"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}