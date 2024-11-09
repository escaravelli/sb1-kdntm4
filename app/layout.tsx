import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { validateEnv } from '@/lib/env';

// Validate environment variables at startup
validateEnv();

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Catalogo.vip - Seu Catálogo Profissional',
  description: 'Crie e gerencie seu catálogo de produtos online com facilidade',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}