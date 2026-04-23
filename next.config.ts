import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
    qualities: [75, 90], // إضافة جودة 90 إلى القائمة المسموحة
    domains: [], // أضف أي domains تحتاجها هنا
  },
};

export default nextConfig;
