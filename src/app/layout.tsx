import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { OrderProvider } from "@/context/OrderContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Tuel Printing | Smarter Printing Automation",
  description: "Automate your printing business with AI-powered color analysis and real-time quoting.",
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans antialiased bg-background text-foreground selection:bg-primary/30`}
      >
        <AuthProvider>
          <OrderProvider>
            {children}
          </OrderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
