import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
        remotePatterns: [
      {
        protocol: 'http',
        hostname: 'beauty.admin.t-carts.com',
        port: '',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'beauty.admin.t-carts.com',
        port: '',
        pathname: '/storage/**',
      },
         {
        protocol: 'http',
        hostname: 'beauty.admin.t-carts.com',
        port: '',
        pathname: '/**', 
      },
       {
        protocol: 'http', // في حالة استخدام http للتطوير المحلي
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
    qualities: [75, 90], // إضافة جودة 90 إلى القائمة المسموحة
    domains: [], // أضف أي domains تحتاجها هنا
  },
};

export default nextConfig;


