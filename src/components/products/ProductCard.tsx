"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  href: string;
  originalPrice?: number;
  discount?: number;
}

export function ProductCard({ 
  id, 
  name, 
  price, 
  image, 
  href,
  originalPrice,
  discount 
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add to cart logic here
    console.log("Added to cart:", id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Quick view logic here
    console.log("Quick view:", id);
  };

  return (
    <div
      role="article"
      aria-labelledby={`product-name-${id}`}
      className="group w-[155px] h-[240px] sm:w-[170px] sm:h-[240px] md:w-[308px] md:h-[386px] relative bg-white transition-all duration-300 hover:shadow-lg"
      style={{
       
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '16px 0'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={href} className="block h-full" aria-label={`عرض تفاصيل ${name}`}>
        {/* Image Container */}
        <div 
          className="relative w-[130px] h-[130px] sm:w-[140px] sm:h-[140px] md:w-[276px] md:h-[276px] mx-auto transition-colors duration-300"
          style={{
           
            borderRadius: '8px',
            margin: '0 16px'
          }}
        >
          {/* Heart Icon - Top Left Corner (New) */}
          <button
            onClick={handleFavoriteClick}
            className="block md:hidden absolute top-2 left-2 z-10 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 transition-all duration-200 hover:scale-110"
            style={{ color: isFavorite ? '#ef4444' : '#112B40' }}
              aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            aria-pressed={isFavorite}
          >
            <Heart className="h-4 w-4" fill={isFavorite ? '#ef4444' : 'none'} />
          </button>

          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* الطبقة المظللة التي تظهر عند hover */}
          {isHovered && (
            <div 
              className="absolute inset-0 rounded-[8px] transition-colors duration-300 pointer-events-none"
              style={{ backgroundColor: '#0000001A' }}
            />
          )}

          {/* Icons Overlay - appears at bottom center on hover */}
          {isHovered && (
            <div className="absolute bottom-3 left-0 right-0 justify-center -translate-y-1/2 flex gap-2 animate-in fade-in zoom-in-95 pointer-events-auto">
              {/* Eye Icon - Quick View */}
              <button
                onClick={handleQuickView}
                className="bg-white rounded-full p-2 shadow-lg hover:bg-[#23A6F0] transition-all duration-200 hover:scale-110"
                style={{ color: '#112B40' }}
                aria-label="معاينة سريعة"
              >
                <Eye className="h-5 w-5 hover:text-white" />
              </button>

              {/* Shopping Cart Icon - Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="bg-white rounded-full p-2 shadow-lg hover:bg-[#23A6F0] transition-all duration-200 hover:scale-110"
                style={{ color: '#112B40' }}
                aria-label="أضف إلى السلة"
              >
                <ShoppingCart className="h-5 w-5 hover:text-white" />
              </button>

              {/* Heart Icon - Add to Favorites (kept original) */}
              <button
                onClick={handleFavoriteClick}
                className="bg-white rounded-full p-2 shadow-lg hover:bg-[#23A6F0] transition-all duration-200 hover:scale-110"
                style={{ color: isFavorite ? '#ef4444' : '#112B40' }}
                aria-label="أضف إلى المفضلة"
              >
                <Heart className="h-5 w-5 hover:text-white" fill={isFavorite ? '#ef4444' : 'none'} />
              </button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="px-4 mt-3 ">
          {/* Product Name */}
          <h3 className="text-[16px] font-medium line-clamp-2 mb-1" style={{ color: '#112B40' }}>
            {name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold relative" style={{ color: '#23A6F0' }}>
              {price.toLocaleString()} <span className="text-xs absolute top-1 me-1">EGP</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

// Example usage with multiple products
export function ProductsGrid() {
  const products = [
    {
      id: "1",
      name: "سماعات لاسلكية عالية الجودة مع قاعدة شحن",
      price: 25000,
      originalPrice: 35000,
      discount: 28,
      image: "/images/products/p1.png",
      href: "/products/1",
    },
    {
      id: "2",
      name: "ساعة ذكية رياضية",
      price: 150000,
      image: "/images/products/p2.png",
      href: "/products/2",
    },
    {
      id: "3",
      name: "حقيبة ظهر عصرية",
      price: 45000,
      originalPrice: 60000,
      discount: 25,
      image: "/images/products/p3.png",
      href: "/products/3",
    },
    {
      id: "4",
      name: "سماعة ألعاب احترافية",
      price: 85000,
      image: "/images/products/p4.png",
      href: "/products/4",
    },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: '#112B40' }}>
          منتجات مميزة
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}