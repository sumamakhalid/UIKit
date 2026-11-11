import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Hanken_Grotesk } from "next/font/google";
import { ToastProvider } from "@/components/ui";
import { SaasProvider } from "@/lib/saas/store";
import { appConfig } from "@/lib/config";
import "./globals.css";

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });

export const metadata: Metadata = {
  title: { default: appConfig.platformName, template: `%s · ${appConfig.platformName}` },
  description: "Stock, sales and accounts",
};

// Applies the saved theme before first paint so there is no light/dark flash.
const themeScript = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={hanken.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <SaasProvider>
          <ToastProvider>{children}</ToastProvider>
        </SaasProvider>
      </body>
    </html>
  );
}
