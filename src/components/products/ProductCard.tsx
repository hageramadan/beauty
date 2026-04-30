"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";

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
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    console.log("Favorite toggled for product:", id, "new state:", !isFavorite);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Added to cart:", id);
  };

  return (
    <div
      role="article"
      aria-labelledby={`product-name-${id}`}
      className="group relative mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style jsx>{`
        .product-card {
          width: 100%;
          max-width: 172px;
          height: 278px;
          border-radius: 16px;
          border: 1px solid #E4E7E9;
          overflow: hidden;
          background: white;
          position: relative;
          isolation: isolate;
        }
        
        .product-card:hover {
          box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        
        .product-image {
          height: 172px;
          width: 100%;
          border-radius: 16px 16px 0 0;
          position: relative;
          overflow: hidden;
        }
        
        @media (min-width: 640px) {
          .product-card {
            max-width: 308px;
            width: 308px;
            height: 432px;
          }
          .product-image {
            height: 308px;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .spinner {
          animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      <div className="product-card relative">
        {/* Heart Icon - خارج Link تماماً */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 left-2 z-30 rounded-full p-1.5 hover:bg-red-50 transition-all duration-200 hover:scale-110 bg-white/80 backdrop-blur-sm"
          style={{ color: isFavorite ? '#ef4444' : '#112B40' }}
          aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
          aria-pressed={isFavorite}
        >
          <Heart className="h-4 w-4 sm:h-5 sm:w-5" fill={isFavorite ? '#ef4444' : 'none'} />
        </button>

        <Link href={href} className="h-full flex flex-col" aria-label={`عرض تفاصيل ${name}`}>
          {/* Image Container */}
          <div className="product-image bg-gray-100">
            {/* Loading Spinner */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100">
                <div className="spinner w-8 h-8 border-4 border-[#E60076] border-t-transparent rounded-full"></div>
              </div>
            )}
            
            {/* Best Seller Badge */}
            <div className="absolute top-2 right-2 z-20">
              <p className="text-[8px] sm:text-[10px] font-bold text-white bg-[#E60076] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-sm">
                الاكثر مبيعا
              </p>
            </div>

            {/* Add to Cart Button - Overlay on Image */}
            <div 
              className="absolute inset-0 z-20 flex items-end pb-4 justify-center transition-all duration-300"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                opacity: isHovered ? 1 : 0,
                visibility: isHovered ? 'visible' : 'hidden',
              }}
            >
              <Button
                onClick={handleAddToCart}
                className="text-[11px] sm:text-[13px] font-semibold rounded-lg bg-[#E60076] hover:bg-[#E60076]/90 transition-all duration-300 text-white py-1.5 px-3 sm:py-2 sm:px-4 flex items-center justify-center gap-1 sm:gap-2 transform hover:scale-105 active:scale-95 shadow-lg"
                style={{
                  transform: isHovered ? 'scale(1)' : 'scale(0.9)',
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:rotate-12" />
                <span className="text-xs sm:text-sm">اضف الي السلة</span>
              </Button>
            </div>

            {/* Image */}
            <div className="relative w-full h-full">
              <Image
                src={image}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 308px"
                className="object-cover transition-all duration-700 ease-out"
                style={{
                  transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                }}
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="px-2 sm:px-3 py-2 sm:py-3 flex flex-col bg-white">
            {/* Rating */}
            <div className="flex items-center gap-1 mb-1 flex-wrap">
              <div className="flex gap-0.5">
                <FaStar className="text-[#FA8232] w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                <FaStar className="text-[#FA8232] w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                <FaStar className="text-[#FA8232] w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                <FaStar className="text-[#FA8232] w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                <FaRegStar className="text-[#77878F] w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </div>
              <p className="text-[#77878F] text-[10px] sm:text-xs">
                (994)
              </p>
            </div>
            
            {/* Product Name */}
            <h3 
              id={`product-name-${id}`}
              className="text-[11px] sm:text-[13px] font-medium line-clamp-2 mb-1 text-[#112B40]"
            >
              {name}
            </h3>

            {/* Price */}
            <div className="flex items-center gap-1 sm:gap-2 mt-1">
              <span className="text-sm sm:text-base font-bold text-[#E60076]">
                {price.toLocaleString()} $
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}