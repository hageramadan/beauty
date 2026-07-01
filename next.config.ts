import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'alsas.admin.t-carts.com',
        port: '',
        pathname: '/storage/**', 
      },
     
    ],
 
    qualities: [75, 85, 90],
    
  },
};

export default nextConfig;
