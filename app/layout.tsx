import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Pós-Atendimento | Quadra Brasileira",
  description:
    "Sistema unificado de cadastro, segmentação e gestão de pós-atendimento imobiliário.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          scriptProps={{ suppressHydrationWarning: true }}
        >
          <Navbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-10 pb-20 sm:px-8 lg:px-10">
            {children}
          </main>
          <footer className="border-t border-slate-800/70 bg-[#0B0F17] py-6">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-slate-400 sm:flex-row sm:px-8 lg:px-10">
              <p>&copy; {new Date().getFullYear()} Quadra Brasileira — Pós-Atendimento</p>
              <p className="font-medium">Next.js + Supabase</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
