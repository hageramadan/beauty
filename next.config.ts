import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  /* config options here */
  images: {
    qualities: [75, 85, 100],
    remotePatterns: [
        {
        protocol: 'https',
        hostname: 'dukanah.admin.t-carts.com',
        port: '',
        pathname: '/storage/tenant_dukanah/ad_image/**',
      },
       {
        protocol: 'https',
        hostname: 'dukanah.admin.t-carts.com',
        port: '',
        pathname: '/storage/tenant_dukanah/product_images/**',
      },
         {
        protocol: 'https',
        hostname: 'dukanah.admin.t-carts.com',
        port: '',
        pathname: '/storage/tenant_dukanah/category_image/**',
      },
      {
        protocol: 'https',
        hostname: 'dukanah.admin.t-carts.com',
        port: '',
        pathname: '/storage/tenant_dukanah/slider_image/**',
        search: '',
      },
          {
        protocol: 'https',
        hostname: 'dukanah.admin.t-carts.com',
        port: '',
        pathname: '/**', // يسمح بكل المسارات من هذا الـ hostname
      },
      {
        protocol: 'https',
        hostname: 'dukanah.admin.t-carts.com',
        port: '',
        pathname: '/storage/**', // يسمح بمسار storage تحديداً
      },
      {
        protocol: 'https',
        hostname: 'dukanah.admin.t-carts.com',
        port: '',
        pathname: '/uploads/**', // يسمح بمسارات uploads
      },
    ],
 
  },
};

export default nextConfig;
