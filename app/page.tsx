import { Button } from '@/components/ui/button';
import { ShoppingBag, Sparkles, Store } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="border-b">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Store className="h-6 w-6" />
            <span className="text-xl font-bold">catalogo.vip</span>
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Começar</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Crie Seu Catálogo
            <span className="text-primary block mt-2">Profissional</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Lance seu catálogo digital em minutos. Compartilhe seus produtos facilmente e comece
            a receber pedidos pelo WhatsApp ou ative pagamentos online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                <ShoppingBag className="h-5 w-5" />
                Começar Grátis
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Ver Preços
              </Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-24">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold mb-4">Configuração Fácil</h3>
              <p className="text-muted-foreground">
                Crie seu catálogo em minutos com nossa interface intuitiva. Não é necessário
                conhecimento técnico.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold mb-4">Integração com WhatsApp</h3>
              <p className="text-muted-foreground">
                Receba pedidos diretamente pelo WhatsApp com todos os detalhes do cliente
                organizados.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold mb-4">Pagamentos Online</h3>
              <p className="text-muted-foreground">
                Aceite pagamentos online com nosso plano premium. Suporte para Pix e cartões
                de crédito.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Store className="h-5 w-5" />
              <span className="font-semibold">catalogo.vip</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Catalogo.vip. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}