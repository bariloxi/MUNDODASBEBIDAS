import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/actions";
import LayoutWrapper from "@/components/LayoutWrapper";
import FirebaseInit from "@/components/FirebaseInit";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MUNDO DAS BEBIDAS DISK | Sistema de Gestão",
  description: "Sistema completo para Adega e Disk Bebidas - PDV, Estoque e Delivery",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-bg-primary text-text-primary selection:bg-primary/30`}>
        <FirebaseInit />
        <div className="layout-container">
          <Sidebar user={user ?? undefined} aria-label="Sidebar principal" />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </div>
      </body>
    </html>
  );
}
