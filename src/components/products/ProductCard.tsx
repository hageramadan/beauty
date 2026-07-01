// src/components/products/ProductCard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, ShoppingCart } from "lucide-react";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import { useFavorites } from "@/hooks/useFavorites";
import { useCartContext } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ColorOption {
  color: string;
  name: string;
}

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  hoverImage?: string;
  href: string;
  originalPrice?: number;
  discount?: number;
  colors?: ColorOption[];
  rating?: number;
  reviewsCount?: number;
  isBestSeller?: boolean;
  variantId?: number | null;
  hasVariants?: boolean;
  variants?: Array<{ id: number }>;
}

export function ProductCard({ 
  id, 
  name, 
  price, 
  image, 
  hoverImage,
  href,
  originalPrice,
  discount,
  colors = [],
  rating = 0,
  reviewsCount = 0,
  isBestSeller = false,
  variantId = null,
  hasVariants = false,
  variants = [],
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImage, setCurrentImage] = useState(image);
  const [isLocalMutating, setIsLocalMutating] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const { addItem, isLoading: cartLoading } = useCartContext();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const isProductFavorite = isFavorite(id);
  const [localFavorite, setLocalFavorite] = useState(isProductFavorite);

  // دالة لتوليد نجوم التقييم
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-[#FA8232] w-3 h-3 md:w-4 md:h-4" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-[#FA8232] w-3 h-3 md:w-4 md:h-4" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-[#77878F] w-3 h-3 md:w-4 md:h-4" />);
      }
    }
    return stars;
  };

  useEffect(() => {
    setLocalFavorite(isProductFavorite);
  }, [isProductFavorite]);

  const handleFavoriteClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("يرجى تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة", {
        duration: 3000,
        position: "top-center",
        icon: "❤️",
      });
      
      const currentUrl = window.location.href;
      router.push(`/auth/login?redirectTo=${encodeURIComponent(currentUrl)}`);
      return;
    }
    
    if (isLocalMutating || isLoading) return;
    
    setIsLocalMutating(true);
    const previousState = localFavorite;
    setLocalFavorite(!previousState);
    
    const success = await toggleFavorite(id, previousState);
    
    if (!success) {
      setLocalFavorite(previousState);
      toast.error("حدث خطأ أثناء إضافة المنتج إلى المفضلة", {
        duration: 3000,
        position: "top-center",
      });
    }
    
    setIsLocalMutating(false);
  }, [id, localFavorite, isLocalMutating, isLoading, toggleFavorite, isAuthenticated, router]);

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart || cartLoading) return;
    
    const productId = parseInt(id);
    const quantity = 1;
    
    if (hasVariants && variants.length > 0) {
      const firstVariantId = variants[0].id;
      
      setIsAddingToCart(true);
      try {
        await addItem(productId, quantity, firstVariantId);
      } catch (error) {
        console.error("❌ Error adding to cart:", error);
      } finally {
        setIsAddingToCart(false);
      }
      return;
    }
    
    setIsAddingToCart(true);
    try {
      const finalVariantId = variantId || null;
      await addItem(productId, quantity, finalVariantId);
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  }, [id, variantId, hasVariants, variants, isAddingToCart, cartLoading, addItem]);

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/product/${id}`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hoverImage) {
      setCurrentImage(hoverImage);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImage(image);
  };

  return (
    <div
      role="article"
      aria-labelledby={`product-name-${id}`}
      className="group w-[150px] sm:w-[160px] md:w-[308px] h-[278px] md:h-[442px] relative bg-white transition-all duration-300 hover:shadow-lg"
      style={{
        borderRadius: '4px',
        border: '1px solid #E4E7E9',
        padding: '0 0px 16px 0',
        overflow: 'hidden',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={href} className="block h-full" aria-label={`عرض تفاصيل ${name}`}>
        {/* Image Container */}
        <div 
          className="relative mx-auto transition-colors duration-300"
          style={{
            width: '100%',
            borderRadius: '5px',
          }}
        >
          {/* Heart Icon - Top Left Corner (موبايل) */}
          <button
            onClick={handleFavoriteClick}
            disabled={isLocalMutating || isLoading}
            className="absolute top-1 left-2 z-10 bg-transparent rounded-full p-1.5 hover:bg-red-50 transition-all duration-200 hover:scale-110 disabled:opacity-50"
            style={{ color: localFavorite ? '#ef4444' : '#112B40' }}
            aria-label={localFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            aria-pressed={localFavorite}
          >
            {isLocalMutating ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
            ) : (
              <Heart className="h-5 w-5 md:h-6 md:w-6" fill={localFavorite ? '#ef4444' : 'none'} />
            )}
          </button>

          {/* Best Seller Badge */}
          {isBestSeller && (
            <div className="absolute top-2 right-2 z-10">
              <p className="text-[9px] md:text-xs font-bold text-white bg-[#FF7700] p-1 md:p-1.5 rounded">
                الاكثر مبيعا
              </p>
            </div>
          )}

          {/* Discount Badge */}
          {discount && discount > 0 && (
            <div className="absolute top-12 right-2 z-10">
              <p className="text-[9px] md:text-xs font-bold text-[#195073] bg-[#FFDB00] px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                {discount}% OFF
              </p>
            </div>
          )}

          <Image
            src={currentImage}
            alt={name}
            width={340}
            height={340}
            className="object-cover w-[166px] h-[166px] md:w-[308px] md:h-1/5 lg:h-1/2"
            priority
          />

          {/* Icons Overlay - appears on hover */}
          
        </div>

        {/* Product Info - تصميم الكود الأول مع التقييمات */}
        <div className="px-2 flex flex-col gap-0.5 sm:gap-2 mt-2">
          {/* Rating Stars - جديد من الكود الأول */}
          <div className="flex gap-1 items-center mb-1">
            <p className="text-[#77878F] text-xs md:text-sm">
              ({reviewsCount > 0 ? reviewsCount : 0})
            </p>
            <div className="flex gap-0.5">
              {renderStars(rating)}
            </div>
          </div>

          {/* Product Name */}
          <h3 className="text-[12px] md:text-[14px] font-medium line-clamp-2 mb-1" style={{ color: '#112B40' }}>
            {name}
          </h3>

          {/* Price - نفس تصميم الكود الأول */}
          <div className="flex items-center gap-2">
            {originalPrice && originalPrice > price ? (
              <>
                <span className="text-xs md:text-sm line-through text-gray-400">
                  {originalPrice.toLocaleString()}
                </span>
                <span className="text-sm md:text-[17px] font-semibold relative" style={{ color: '#FF7700' }}>
                  {price.toLocaleString()} <span className="text-[17px] font-semibold">EGP</span>
                </span>
              </>
            ) : (
              <span className="text-sm md:text-[17px] font-semibold relative" style={{ color: '#FF7700' }}>
                {price.toLocaleString()} <span className="text-[17px] font-semibold">EGP</span>
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}