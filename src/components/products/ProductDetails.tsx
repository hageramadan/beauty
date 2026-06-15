// components/products/ProductDetails.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Heart, Truck, RefreshCw, Ruler, Info, AlertCircle } from "lucide-react";
import { useCartContext } from "@/contexts/CartContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BsShare } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa6";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { FaRegStar } from "react-icons/fa";
import toast from "react-hot-toast";

interface VariantAttribute {
  id: number;
  attribute_type: {
    id: number;
    name: string;
  };
  value: string;
  meta: {
    color?: string;
  } | null;
}

interface ProductVariant {
  id: number;
  sku: string | null;
  price: number;
  has_discount: boolean;
  discount_type: string | null;
  discount_value: number | null;
  price_after_discount: number;
  quantity: number | null;
  is_active: boolean;
  variant_image: string | null;
  attributes: VariantAttribute[];
}

interface ProductDetailsProps {
  product: {
    id: number;
    avg_rating: number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    brand: string | null;
    category: string;
    images: string[];
    colors: Array<{ name: string; code: string }>;
    sizes: string[];
    rating: number;
    reviewsCount: number;
    sku: string;
    availability: boolean;
    variants?: ProductVariant[];
    has_variants?: boolean;
  };
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "info" | "measurements" | "shipping"
  >("info");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // حالات الـ Zoom داخل نفس الصندوق
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const { addItem, getItemQuantity, isLoading: cartLoading } = useCartContext();
  const { toggleFavorite, isFavorite, isMutating } = useFavorites();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // ✅ التحقق من وجود مقاسات في المنتج
  const hasSizes = (): boolean => {
    if (!product.has_variants) return true; // منتج عادي بدون variants
    
    if (!product.variants || product.variants.length === 0) return false;
    
    // البحث عن أي attribute نوعه مقاس
    for (const variant of product.variants) {
      if (!variant.attributes) continue;
      const hasSizeAttr = variant.attributes.some(attr => 
        attr.attribute_type?.name === "مقاس" || attr.attribute_type?.name === "المقاس"
      );
      if (hasSizeAttr) return true;
    }
    return false;
  };

  const productHasSizes = hasSizes();
  const canAddToCart = !product.has_variants || (selectedVariant !== null);

  // ✅ استخراج الألوان من الـ variants (حتى لو كل الألوان في فاريانت واحد)
  const getAvailableColorsFromVariants = (): { name: string; code: string; variants: ProductVariant[] }[] => {
    if (!product.variants || product.variants.length === 0) {
      return product.colors.map(c => ({ ...c, variants: [] }));
    }
    
    const colorMap = new Map<string, { name: string; code: string; variants: ProductVariant[] }>();
    
    product.variants.forEach((variant) => {
      if (!variant.attributes) return;
      
      // البحث عن كل attributes اللي نوعها "اللون"
      variant.attributes.forEach((attr) => {
        if (attr.attribute_type?.name === "اللون" && attr.value) {
          const colorName = attr.value;
          const colorCode = attr.meta?.color || "#000000";
          
          if (!colorMap.has(colorName)) {
            colorMap.set(colorName, {
              name: colorName,
              code: colorCode,
              variants: [variant] // نفس الفاريانت لكل الألوان
            });
          } else {
            // لو اللون موجود، نضيف الفاريانت لو مش موجود
            const existing = colorMap.get(colorName)!;
            if (!existing.variants.find(v => v.id === variant.id)) {
              existing.variants.push(variant);
            }
          }
        }
      });
    });
    
    return Array.from(colorMap.values());
  };

  // ✅ الحصول على المقاسات المتاحة للون المحدد
  const getAvailableSizesForColor = (colorName: string): string[] => {
    if (!product.variants || product.variants.length === 0) {
      return product.sizes;
    }
    
    const sizes = new Set<string>();
    
    product.variants.forEach((variant) => {
      if (!variant.attributes) return;
      
      // هل هذا الفاريانت فيه اللون المطلوب؟
      const hasColor = variant.attributes.some(attr => 
        attr.attribute_type?.name === "اللون" && attr.value === colorName
      );
      
      if (hasColor) {
        // جيب المقاسات من نفس الفاريانت
        variant.attributes.forEach((attr) => {
          if ((attr.attribute_type?.name === "مقاس" || attr.attribute_type?.name === "المقاس") && attr.value) {
            sizes.add(attr.value);
          }
        });
      }
    });
    
    return Array.from(sizes);
  };

  // ✅ الحصول على الـ variant المناسب للون والمقاس المختارين
  const getSelectedVariant = (colorName: string, sizeName: string): ProductVariant | null => {
    if (!product.variants || product.variants.length === 0) return null;
    
    // البحث عن فاريانت يحتوي على اللون والمقاس معاً
    const variant = product.variants.find(variant => {
      if (!variant.attributes) return false;
      
      const hasColor = variant.attributes.some(attr => 
        attr.attribute_type?.name === "اللون" && attr.value === colorName
      );
      
      const hasSize = variant.attributes.some(attr => 
        (attr.attribute_type?.name === "مقاس" || attr.attribute_type?.name === "المقاس") && attr.value === sizeName
      );
      
      return hasColor && hasSize;
    });
    
    return variant || null;
  };

  // ✅ استخراج جميع الصور المتاحة للعرض
  const getAllImages = (): string[] => {
    const images: string[] = [];
    
    // أضف صورة الـ variant إذا وجدت
    if (selectedVariant && selectedVariant.variant_image) {
      images.push(selectedVariant.variant_image);
    }
    
    // أضف الصور العادية للمنتج
    if (product.images && product.images.length > 0) {
      images.push(...product.images);
    }
    
    // إزالة التكرارات
    return [...new Map(images.map(img => [img, img])).values()];
  };

  // ✅ الحصول على الصورة الرئيسية
  const getMainImage = (): string => {
    const allImagesList = getAllImages();
    
    if (allImagesList.length > 0 && selectedImage < allImagesList.length) {
      return allImagesList[selectedImage];
    }
    
    return "/images/placeholder.jpg";
  };

  // ✅ دالة التعامل مع حركة الماوس للـ Zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    
    let x = (e.clientX - left) / width;
    let y = (e.clientY - top) / height;
    
    x = Math.min(Math.max(x, 0), 1);
    y = Math.min(Math.max(y, 0), 1);
    
    setZoomPosition({ x, y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsZoomed(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!imageContainerRef.current) return;
    
    const touch = e.touches[0];
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    
    let x = (touch.clientX - left) / width;
    let y = (touch.clientY - top) / height;
    
    x = Math.min(Math.max(x, 0), 1);
    y = Math.min(Math.max(y, 0), 1);
    
    setZoomPosition({ x, y });
  };

  const handleTouchEnd = () => {
    setIsZoomed(false);
  };

  const availableColors = product.has_variants ? getAvailableColorsFromVariants() : [];
  const availableSizes = selectedColor ? getAvailableSizesForColor(selectedColor) : [];

  // ✅ تعيين أول لون متاح
  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0].name);
    }
  }, [availableColors]);

  // ✅ عند تغيير اللون، إعادة تعيين المقاس
  useEffect(() => {
    if (selectedColor) {
      const sizes = getAvailableSizesForColor(selectedColor);
      if (sizes.length > 0) {
        if (selectedSize && sizes.includes(selectedSize)) {
          // ابق على نفس المقاس
        } else {
          setSelectedSize(sizes[0]);
        }
      } else {
        setSelectedSize("");
      }
    }
  }, [selectedColor]);

  // ✅ تحديث الـ variant عند تغيير اللون أو المقاس
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = getSelectedVariant(selectedColor, selectedSize);
      setSelectedVariant(variant);
      setSelectedImage(0);
    } else if (selectedColor && !selectedSize) {
      setSelectedVariant(null);
    }
  }, [selectedColor, selectedSize]);

  const displayColors = product.has_variants ? availableColors : product.colors;
  const displaySizes = product.has_variants ? availableSizes : product.sizes;

  // ✅ السعر الحالي
  const currentPrice = selectedVariant 
    ? selectedVariant.price_after_discount || selectedVariant.price
    : product.price;
  
  const originalPrice = selectedVariant?.has_discount ? selectedVariant.price : product.originalPrice;

  const isProductFavorite = isFavorite(product.id.toString());
  const itemInCartQuantity = getItemQuantity(product.id);

  // ✅ إضافة إلى السلة مع التحقق من وجود مقاسات
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("يرجى تسجيل الدخول أولاً لإضافة المنتجات إلى السلة", {
        duration: 3000,
        position: "top-center",
        icon: "🔐",
      });
      
      router.push(`/auth/login`);
      return;
    }

    if (isAddingToCart) return;
    
    // ✅ التحقق من وجود مقاسات للمنتج
    if (product.has_variants && !productHasSizes) {
      toast.error("عذراً، لا توجد مقاسات متاحة لهذا المنتج حالياً. لا يمكنك إضافته إلى السلة.", {
        duration: 4000,
        position: "top-center",
        icon: "⚠️",
      });
      return;
    }
    
    if (product.has_variants && !selectedVariant) {
      toast.error("الرجاء اختيار اللون والمقاس أولاً");
      return;
    }
    
    setIsAddingToCart(true);
    
    try {
      const variantId = selectedVariant?.id || null;
      const success = await addItem(product.id, quantity, variantId);
      
      if (success) {
        setQuantity(1);
      }
    } catch (error) {
      console.error("❌ خطأ في الإضافة إلى السلة:", error);
      toast.error("حدث خطأ أثناء إضافة المنتج إلى السلة");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("يرجى تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }
    
    await toggleFavorite(product.id.toString(), isProductFavorite);
  };

  const increaseQuantity = () => {
    const maxQty = selectedVariant?.quantity && selectedVariant.quantity > 0 ? selectedVariant.quantity : 99;
    setQuantity((prev) => Math.min(prev + 1, maxQty));
  };
  
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const cleanImageUrl = (url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith("/storage")) {
      return `https://dukanah.admin.t-carts.com${url}`;
    }
    return url;
  };

  const discountAmount = originalPrice ? originalPrice - currentPrice : 0;
  const discountPercentage = originalPrice
    ? Math.round((discountAmount / originalPrice) * 100)
    : 0;

  const allImages = getAllImages();
  const mainImage = getMainImage();

  if (authLoading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-[8px]  mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <div className="flex gap-1 md:gap-2 mb-3">
        <Link href="/" className="text-[#726C6C] text-sm md:text-[18px]">الرئيسية</Link>
        <span className="text-[#333333] font-bold">/</span>
        <Link href="/products" className="text-[#726C6C] font-bold text-sm md:text-[18px] whitespace-nowrap">
          {product.brand || "المنتجات"}
        </Link>
        <span className="text-[#180100] font-bold text-[18px]">/</span>
        <p className="text-[#180100] font-bold text-sm md:text-[18px] whitespace-nowrap">{product.name}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* قسم الصور */}
        <div className="space-y-2">
          <div
            ref={imageContainerRef}
            className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden cursor-zoom-in"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="absolute inset-0 w-full h-full transition-transform duration-200"
              style={{
                backgroundImage: `url(${cleanImageUrl(mainImage)})`,
                backgroundPosition: isZoomed ? `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%` : 'center',
                backgroundSize: isZoomed ? '200%' : 'cover',
                backgroundRepeat: 'no-repeat',
              }}
            />
            
            <div className="absolute inset-0 z-10" />

            {discountPercentage > 0 && (
              <span className="absolute top-2 right-2 bg-[#EC221F] text-white text-xs font-bold px-1.5 py-0.5 rounded-full z-20">
                {discountPercentage}% خصم
              </span>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`
                    relative aspect-[4/3] bg-gray-100 rounded-[8px]  overflow-hidden
                    border-2 transition-all duration-200
                    ${selectedImage === index ? "border-[#EC221F]" : "border-transparent hover:border-gray-300"}
                  `}
                >
                  <Image
                    src={cleanImageUrl(image)}
                    alt={`${product.name} - صورة ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 30vw, 15vw"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* معلومات المنتج */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0">
              <h1 className="text-xl font-bold text-[#000000]">{product.name}</h1>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[16px] text-[#666666]">{product.brand || "بدون ماركة"}</span>
              </div>
            </div>

            <div className="flex gap-0 flex-col">
              <span className="text-xl md:text-3xl font-bold text-[#C01A13] flex items-center gap-1">
                {currentPrice.toLocaleString()}
                <span className="text-xl">EGP</span>
              </span>
              {originalPrice && originalPrice !== currentPrice && (
                <span className="text-base text-[#00000080] line-through flex items-center gap-1">
                  {originalPrice.toLocaleString()}
                  <span className="text-sm">EGP</span>
                </span>
              )}
            </div>
          </div>

          {/* التقييم */}
          <div className="flex items-center gap-2">
           {product.reviewsCount > 0 &&( <div className="flex items-center bg-[#EDF0F8] text-[#3A4980] font-bold text-sm rounded-full px-2 py-1 justify-center gap-1">
              <IoChatboxEllipsesOutline className="w-4 h-4" />
              <span> {product.reviewsCount || 0} </span>
              <p>تقييم</p>
            </div>)}
            {product.avg_rating > 0 && (
              <div className="flex items-center bg-[#FFF5F4] text-[#FA6054] font-bold text-sm rounded-full px-2 py-1 justify-center gap-1">
                <FaRegStar className="w-3 h-3" />
                <span> {product.avg_rating}</span>
              </div>
            )}
          </div>

          {/* ✅ رسالة تحذير في حالة عدم وجود مقاسات */}
          {product.has_variants && !productHasSizes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <div className="text-sm text-amber-700">
                <p className="font-semibold">لا توجد مقاسات متاحة</p>
                <p className="text-xs">عذراً، لا توجد مقاسات متاحة لهذا المنتج حالياً. لا يمكنك إضافته إلى السلة.</p>
              </div>
            </div>
          )}

          {/* اختيار اللون */}
          {product.has_variants && displayColors.length > 0 && (
            <>
              <div>
                <div className="flex justify-between items-center my-2">
                  <span className="text-[14px] font-bold text-[#333333]">اللون</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {displayColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`
                        group relative w-8 h-8 rounded-full transition-all duration-200
                        ${selectedColor === color.name ? "ring-2 ring-offset-1 scale-105" : "hover:scale-105"}
                      `}
                      style={{ backgroundColor: color.code }}
                      aria-label={`لون ${color.name}`}
                    >
                      {selectedColor === color.name && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <hr className="my-1" />
            </>
          )}

          {/* اختيار المقاس - لو موجود */}
          {product.has_variants && productHasSizes && displaySizes.length > 0 && (
            <div>
              <div className="flex justify-between items-center my-2">
                <span className="text-[14px] font-bold text-[#333333]">المقاس</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {displaySizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`
                      flex items-center justify-center rounded-[8px] w-[70px] px-2 h-[32px] text-sm font-medium transition-all duration-200
                      ${selectedSize === size 
                        ? "bg-[#EDF0F8] text-[#3A4980]" 
                        : "bg-[#F3F3F3] text-[#726C6C] hover:bg-[#EDF0F8]"
                      }
                    `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ✅ رسالة عند وجود ألوان ولكن لا توجد مقاسات */}
          {product.has_variants && displayColors.length > 0 && !productHasSizes && (
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-sm text-gray-500">
                هذا المنتج غير متوفر حالياً. يرجى التحقق لاحقاً.
              </p>
            </div>
          )}

          {/* الكمية - تظهر فقط لو فيه مقاسات أو منتج عادي */}
          {(canAddToCart || !product.has_variants) && productHasSizes !== false && (
            <div>
              <div className="flex items-center gap-3 my-2">
                <div className="flex items-center rounded-full bg-[#F3F3F3] h-[44px] w-[140px] justify-center">
                  <button
                    onClick={decreaseQuantity}
                    className="w-8 h-8 flex items-center justify-center text-[#A3A3A3] transition"
                  >
                    <FaMinus className="w-3 h-3" />
                  </button>
                  <span className="w-12 text-center text-[18px] font-bold text-[#222222]">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    className="w-8 h-8 flex items-center justify-center text-[#3A4980] font-bold transition"
                  >
                    <FaPlus className="w-3 h-3 font-bold" />
                  </button>
                </div>
                {selectedVariant && selectedVariant.quantity !== null && selectedVariant.quantity < 5 && selectedVariant.quantity > 0 && (
                  <span className="text-xs text-orange-600">
                    ⚠️ متبقي {selectedVariant.quantity} فقط
                  </span>
                )}
              </div>
            </div>
          )}

          {/* الأزرار */}
          <div className="flex flex-col">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || cartLoading || (product.has_variants && (!selectedVariant || !productHasSizes))}
              className={`
                flex-1 text-[14px] px-4 py-2.5 rounded-[8px] font-bold transition-all duration-300 
                flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                ${(product.has_variants && (!selectedVariant || !productHasSizes)) 
                  ? "bg-gray-400 text-white cursor-not-allowed" 
                  : "bg-[#0A0500] text-white hover:bg-[#2b2b2b]"
                }
              `}
            >
              {isAddingToCart ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                (product.has_variants && !productHasSizes) ? "غير متوفر حالياً" : "أضف إلى السلة"
              )}
            </button>
            
            <div className="flex gap-3 pt-3">
              <button
                onClick={handleToggleFavorite}
                disabled={isMutating}
                className={`
                  flex-1 md:px-4 py-2.5 rounded-[8px] font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm
                  ${isProductFavorite 
                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
                    : "border border-[#0A0500] hover:bg-[#f3f1f1]"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <Heart 
                  className="w-4 h-4" 
                  fill={isProductFavorite ? "#ef4444" : "none"}
                />
                {isProductFavorite ? "تمت الإضافة" : "أضف إلى المفضلة"}
              </button>
              <button className="w-10 h-10 rounded-[8px] border border-[#313131] flex items-center justify-center transition-all duration-300 hover:bg-gray-100">
                <BsShare className="w-4 h-4 font-bold" />
              </button>
            </div>
          </div>

          {/* الأقسام القابلة للطي */}
          <div className="border-t border-gray-200 pt-3 space-y-2">
            <div>
              <button
                onClick={() => setActiveTab(activeTab === "info" ? "shipping" : "info")}
                className="flex justify-between items-center w-full py-2 text-right"
              >
                <span className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4 text-[#EC221F]" />
                  معلومات المنتج
                </span>
                <span className="text-xl">{activeTab === "info" ? "−" : "+"}</span>
              </button>
              {activeTab === "info" && (
                <div className="pt-1 pb-2 text-gray-600 text-xs leading-relaxed space-y-1">
                  <p>{product.description}</p>
                  <p><strong>رمز المنتج:</strong> {product.sku || "غير متوفر"}</p>
                  <p><strong>القسم:</strong> {typeof product.category === 'object' ? product.category : product.category}</p>
                  <p><strong>الماركة:</strong> {typeof product.brand === 'object' ? product.brand : product.brand || "بدون ماركة"}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}