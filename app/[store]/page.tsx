import { supabase } from "@/lib/supabase";
import ProductGrid from "@/components/store/product-grid";
import StoreHeader from "@/components/store/store-header";
import { Metadata } from "next";

interface StorePageProps {
  params: {
    store: string;
  };
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("store_name")
    .eq("store_slug", params.store)
    .single();

  return {
    title: profile?.store_name ? `${profile.store_name} - Catalogo.vip` : 'Loja não encontrada',
    description: `Catálogo de produtos de ${profile?.store_name || 'loja não encontrada'}`,
  };
}

export async function generateStaticParams() {
  // This is required for static export
  // In production, we'll handle this dynamically
  return [];
}

export default async function StorePage({ params }: StorePageProps) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("store_slug", params.store)
    .single();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loja não encontrada</p>
      </div>
    );
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-muted/50">
      <StoreHeader storeName={profile.store_name} />
      <main className="container mx-auto px-4 py-8">
        <ProductGrid products={products || []} />
      </main>
    </div>
  );
}