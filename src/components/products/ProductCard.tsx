// src/components/products/ProductCard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import { useFavorites } from "@/hooks/useFavorites";
import { useCartContext } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface ColorOption {
  color: string;
  name: string;
}

//  إضافة واجهة العملة
interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
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
  currency?: Currency;
}

//  دالة للحصول على الترجمات حسب اللغة
const getTranslations = (lang: string) => {
  if (lang === 'en') {
    return {
      loginRequired: "Please login first to add products to favorites",
      errorAdding: "Error adding to favorites",
      bestSeller: "Best Seller",
      addToCart: "Add to Cart",
      removeFromFavorites: "Remove from favorites",
      addToFavorites: "Add to favorites",
      addedToCart: "Product added to cart successfully",
      errorAddingToCart: "Error adding product to cart",
      reviews: "reviews",
    };
  }
  // Arabic (default)
  return {
    loginRequired: "يرجى تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة",
    errorAdding: "حدث خطأ أثناء إضافة المنتج إلى المفضلة",
    bestSeller: "الاكثر طلبا",
    addToCart: "اضف الي السلة",
    removeFromFavorites: "إزالة من المفضلة",
    addToFavorites: "إضافة إلى المفضلة",
    addedToCart: "تم إضافة المنتج إلى السلة",
    errorAddingToCart: "حدث خطأ أثناء إضافة المنتج إلى السلة",
    reviews: "تقييمات",
  };
};

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
  currency,
}: ProductCardProps) {
  const { language } = useLanguage();
  const t = getTranslations(language);
  
  const [isHovered, setIsHovered] = useState(false);
  const [currentImage, setCurrentImage] = useState(image);
  const [imageLoaded, setImageLoaded] = useState(false);
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
        stars.push(<FaStar key={i} className="text-[#FA8232] w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-[#FA8232] w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-[#77878F] w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />);
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
      toast.error(t.loginRequired, {
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
      toast.error(t.errorAdding, {
        duration: 3000,
        position: "top-center",
      });
    }
    
    setIsLocalMutating(false);
  }, [id, localFavorite, isLocalMutating, isLoading, toggleFavorite, isAuthenticated, router, t]);

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
        // toast.success(t.addedToCart, {
        //   duration: 2000,
        //   position: "bottom-right",
        // });
      } catch (error) {
        console.error("❌ Error adding to cart:", error);
        // toast.error(t.errorAddingToCart, {
        //   duration: 2000,
        //   position: "bottom-right",
        // });
      } finally {
        setIsAddingToCart(false);
      }
      return;
    }
    
    setIsAddingToCart(true);
    try {
      const finalVariantId = variantId || null;
      await addItem(productId, quantity, finalVariantId);
      // toast.success(t.addedToCart, {
      //   duration: 2000,
      //   position: "bottom-right",
      // });
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      // toast.error(t.errorAddingToCart, {
      //   duration: 2000,
      //   position: "bottom-right",
      // });
    } finally {
      setIsAddingToCart(false);
    }
  }, [id, variantId, hasVariants, variants, isAddingToCart, cartLoading, addItem, t]);

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
      className="group relative mx-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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

        .favorite-button {
          position: absolute;
          top: 8px;
          left: 8px;
          z-index: 30;
          border-radius: 9999px;
          padding: 6px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(4px);
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
        }

        .favorite-button:hover {
          background: rgba(239, 68, 68, 0.1);
          transform: scale(1.1);
        }

        .favorite-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (min-width: 640px) {
          .favorite-button {
            top: 12px;
            left: 12px;
            padding: 8px;
          }
        }

        .add-to-cart-overlay {
          position: absolute;
          inset: 0;
          z-index: 20;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 16px;
          background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .group:hover .add-to-cart-overlay {
          opacity: 1;
          visibility: visible;
        }

        .add-to-cart-button {
          font-size: 11px;
          font-weight: 600;
          border-radius: 8px;
          background: #E60076;
          color: white;
          padding: 6px 12px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transform: scale(0.9);
        }

        .group:hover .add-to-cart-button {
          transform: scale(1);
        }

        .add-to-cart-button:hover {
          background: #cc0068;
          transform: scale(1.05);
        }

        .add-to-cart-button:active {
          transform: scale(0.95);
        }

        .add-to-cart-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (min-width: 640px) {
          .add-to-cart-button {
            font-size: 13px;
            padding: 8px 16px;
            gap: 8px;
          }
        }

        .product-info {
          padding: 8px 12px 12px 12px;
          display: flex;
          flex-direction: column;
          background: white;
          flex: 1;
        }

        @media (min-width: 640px) {
          .product-info {
            padding: 12px 16px 16px 16px;
          }
        }

        .product-name {
          font-size: 11px;
          font-weight: 500;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 4px;
          color: #112B40;
        }

        @media (min-width: 640px) {
          .product-name {
            font-size: 13px;
            margin-bottom: 8px;
          }
        }

        .rating-container {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }

        @media (min-width: 640px) {
          .rating-container {
            gap: 8px;
            margin-bottom: 8px;
          }
        }

        .price-container {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
        }

        @media (min-width: 640px) {
          .price-container {
            gap: 8px;
            margin-top: 8px;
          }
        }

        .current-price {
          font-size: 14px;
          font-weight: 700;
          color: #E60076;
        }

        @media (min-width: 640px) {
          .current-price {
            font-size: 16px;
          }
        }

        .original-price-text {
          font-size: 12px;
          text-decoration: line-through;
          color: #9CA3AF;
        }

        @media (min-width: 640px) {
          .original-price-text {
            font-size: 14px;
          }
        }

        .currency {
          font-size: 14px;
          font-weight: 700;
          color: #E60076;
        }

        @media (min-width: 640px) {
          .currency {
            font-size: 16px;
          }
        }

        .badge {
          font-size: 8px;
          font-weight: 700;
          color: white;
          background: #E60076;
          padding: 2px 6px;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        @media (min-width: 640px) {
          .badge {
            font-size: 10px;
            padding: 4px 8px;
          }
        }

        .discount-badge {
          position: absolute;
          top: 40px;
          right: 8px;
          z-index: 20;
          font-size: 8px;
          font-weight: 700;
          color: #195073;
          background: #FFDB00;
          padding: 2px 6px;
          border-radius: 4px;
        }

        @media (min-width: 640px) {
          .discount-badge {
            top: 48px;
            right: 12px;
            font-size: 10px;
            padding: 4px 8px;
          }
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid #E60076;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @media (min-width: 640px) {
          .spinner-small {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>

      <div className="product-card">
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={isLocalMutating || isLoading}
          className="favorite-button"
          style={{ color: localFavorite ? '#ef4444' : '#112B40' }}
          aria-label={localFavorite ? t.removeFromFavorites : t.addToFavorites}
          aria-pressed={localFavorite}
        >
          {isLocalMutating ? (
            <div className="spinner-small" />
          ) : (
            <Heart className="h-4 w-4 sm:h-5 sm:w-5" fill={localFavorite ? '#ef4444' : 'none'} />
          )}
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
            
            {/* Best Seller Badge -  استخدام الترجمة */}
            {isBestSeller && (
              <div className="absolute top-2 right-2 z-20">
                <p className="badge">{t.bestSeller}</p>
              </div>
            )}

            {/* Discount Badge */}
            {discount && discount > 0 && (
              <div className="discount-badge">
                {discount}% OFF
              </div>
            )}

            {/* Add to Cart Button - Overlay on Image -  استخدام الترجمة */}
            <div className="add-to-cart-overlay">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || cartLoading}
                className="add-to-cart-button"
              >
                {isAddingToCart || cartLoading ? (
                  <div className="spinner-small border-white" />
                ) : (
                  <>
                    <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{t.addToCart}</span>
                  </>
                )}
              </button>
            </div>

            {/* Image */}
            <div className="relative w-full h-full">
              <Image
                src={currentImage}
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
          <div className="product-info">
            {/* Rating -  استخدام الترجمة */}
            <div className="rating-container">
              <div className="flex gap-0.5">
                {renderStars(rating)}
              </div>
              <p className="text-[#77878F] text-[10px] sm:text-xs">
                ({reviewsCount > 0 ? reviewsCount : 0} {t.reviews})
              </p>
            </div>
            
            {/* Product Name */}
            <h3 
              id={`product-name-${id}`}
              className="product-name"
            >
              {name}
            </h3>

            {/* Price -  استخدام العملة */}
            <div className="price-container">
              {originalPrice && originalPrice > price ? (
                <>
                  <span className="original-price-text">
                    {originalPrice.toLocaleString()}
                  </span>
                  <span className="current-price">
                    {price.toLocaleString()}
                  </span>
                  <span className="currency">{currency?.symbol || '$'}</span>
                </>
              ) : (
                <>
                  <span className="current-price">
                    {price.toLocaleString()}
                  </span>
                  <span className="currency">{currency?.symbol || '$'}</span>
                </>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}