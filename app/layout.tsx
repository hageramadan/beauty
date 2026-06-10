import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
});

export const metadata: Metadata = {
  title: "متجر فاشون | أحدث صيحات الموضة والأزياء العصرية أونلاين",
  description:`تسوقي وتسوّق أحدث تشكيلات الملابس والأزياء العصرية بجودة عالية وأفضل الأسعار. شحن سريع، عروض متجددة، وتجربة تسوق مرنة تناسب إطلالتك اليومية.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={almarai.className}>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <Navbar />
              <main>{children}</main>
              <Toaster
                position="top-center" // مكان ظهور الإشعار
                reverseOrder={false}
              />
              <Footer />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
