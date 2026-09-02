import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubNavbar } from "@/components/layout/SubNavbar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { getSettings } from "@/services/settingsApi";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeStyles } from "@/components/ThemeStyles";
import Script from "next/script";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
});

async function getMetadata(): Promise<{ title: string; description: string }> {
  try {
    const settings = await getSettings();

    const title = settings.setting.meta?.meta_title || "";
    const description = settings.setting.meta?.meta_description || "";

    return { title, description };
  } catch (error) {
    console.error("Failed to fetch settings for metadata:", error);

    return {
      title: "",
      description: "",
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getMetadata();

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: "website",
      locale: "ar_EG",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
    },
    icons: {
      icon: [{ url: "/logo.png", type: "image/png" }],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
       <head>
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-V0EBZWJ9B6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-V0EBZWJ9B6');
          `}
        </Script>
      </head>
      <body className={almarai.className}>
        <ThemeProvider>
          <ThemeStyles />
          <LanguageProvider>
            <CurrencyProvider>
              <CartProvider>
                <AuthProvider>
                  <FavoritesProvider>
                    <SubNavbar />
                    <Navbar />
                    <main>{children}</main>
                    <Toaster position="top-center" reverseOrder={false} />
                    <Footer />
                  </FavoritesProvider>
                </AuthProvider>
              </CartProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
