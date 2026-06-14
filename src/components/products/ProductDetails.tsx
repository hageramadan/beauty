// components/products/ProductDetails.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Heart, Truck, RefreshCw, Ruler, Info } from "lucide-react";
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

  // ✅ استخراج الألوان من الـ variants (مع الاحتفاظ بجميع الـ variants لكل لون)
  const getAvailableColorsFromVariants = (): { name: string; code: string; variants: ProductVariant[] }[] => {
    if (!product.variants || product.variants.length === 0) {
      return product.colors.map(c => ({ ...c, variants: [] }));
    }
    
    const colorMap = new Map<string, { name: string; code: string; variants: ProductVariant[] }>();
    
    product.variants.forEach((variant) => {
      if (!variant.attributes) return;
      
      const colorAttr = variant.attributes.find(attr => 
        attr.attribute_type?.name === "اللون"
      );
      
      if (colorAttr && colorAttr.value) {
        const colorName = colorAttr.value;
        const colorCode = colorAttr.meta?.color || "#000000";
        
        if (!colorMap.has(colorName)) {
          colorMap.set(colorName, {
            name: colorName,
            code: colorCode,
            variants: []
          });
        }
        
        colorMap.get(colorName)!.variants.push(variant);
      }
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
      
      const colorAttr = variant.attributes.find(attr => 
        attr.attribute_type?.name === "اللون"
      );
      
      const sizeAttr = variant.attributes.find(attr => 
        attr.attribute_type?.name === "مقاس" || attr.attribute_type?.name === "المقاس"
      );
      
      if (colorAttr?.value === colorName && sizeAttr?.value) {
        sizes.add(sizeAttr.value);
      }
    });
    
    return Array.from(sizes);
  };

  // ✅ الحصول على الـ variant المناسب للون والمقاس المختارين
  const getSelectedVariant = (colorName: string, sizeName: string): ProductVariant | null => {
    if (!product.variants || product.variants.length === 0) return null;
    
    const variant = product.variants.find(variant => {
      if (!variant.attributes) return false;
      
      const colorAttr = variant.attributes.find(attr => 
        attr.attribute_type?.name === "اللون"
      );
      
      const sizeAttr = variant.attributes.find(attr => 
        attr.attribute_type?.name === "مقاس" || attr.attribute_type?.name === "المقاس"
      );
      
      return colorAttr?.value === colorName && sizeAttr?.value === sizeName;
    });
    
    return variant || null;
  };

  // ✅ استخراج جميع الصور المتاحة للعرض (صورة الـ variant + الصور العادية)
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

  // ✅ الحصول على الصورة الرئيسية بناءً على الصورة المحددة من المعرض
  const getMainImage = (): string => {
    const allImagesList = getAllImages();
    
    // إذا كانت هناك صور متاحة وتم تحديد صورة
    if (allImagesList.length > 0 && selectedImage < allImagesList.length) {
      return allImagesList[selectedImage];
    }
    
    // fallback: إذا لم تكن هناك صور
    return "/images/placeholder.jpg";
  };

  // ✅ دالة التعامل مع حركة الماوس للـ Zoom (داخل نفس الصندوق)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    
    // حساب موقع الماوس داخل الصورة (نسبة من 0 إلى 1)
    let x = (e.clientX - left) / width;
    let y = (e.clientY - top) / height;
    
    // منع الخروج عن الحدود
    x = Math.min(Math.max(x, 0), 1);
    y = Math.min(Math.max(y, 0), 1);
    
    setZoomPosition({ x, y });
  };

  // ✅ دالة التعامل مع اللمس للجوال
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
  }, [availableColors.length]);

  // ✅ عند تغيير اللون، إعادة تعيين المقاس المختار وتعيين أول مقاس متاح
  useEffect(() => {
    if (selectedColor) {
      const sizes = getAvailableSizesForColor(selectedColor);
      if (sizes.length > 0) {
        // إذا كان المقاس المختار موجود في المقاسات الجديدة، احتفظ به
        if (selectedSize && sizes.includes(selectedSize)) {
          // ابق على نفس المقاس
        } else {
          // وإلا اختر أول مقاس
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
      
      // ✅ إعادة تعيين الصورة المحددة إلى 0 عند تغيير اللون
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

  // ✅ إضافة إلى السلة (مع التحقق من تسجيل الدخول)
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
          <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <div className="flex gap-1 md:gap-2 mb-5">
        <Link href="/" className="text-[#726C6C] text-base md:text-[20px]">الرئيسية</Link>
        <span className="text-[#333333] font-bold">/</span>
        <Link href="/products" className="text-[#726C6C] font-bold text-sm md:text-[20px] whitespace-nowrap">
          {product.brand || "المنتجات"}
        </Link>
        <span className="text-[#180100] font-bold text-[20px]">/</span>
        <p className="text-[#180100] font-bold text-sm md:text-[20px] whitespace-nowrap">{product.name}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* ===== قسم الصور مع خاصية الـ Zoom داخل نفس الصندوق ===== */}
        <div className="space-y-4">
          {/* الحاوية الرئيسية للصورة مع الزوم الداخلي */}
          <div
            ref={imageContainerRef}
            className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-zoom-in"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* الصورة مع خاصية التكبير الداخلي */}
            <div
              className="absolute inset-0 w-full h-full transition-transform duration-200"
              style={{
                backgroundImage: `url(${cleanImageUrl(mainImage)})`,
                backgroundPosition: isZoomed ? `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%` : 'center',
                backgroundSize: isZoomed ? '200%' : 'cover',
                backgroundRepeat: 'no-repeat',
              }}
            />
            
            {/* طبقة شفافة للتحكم في التكبير على الأجهزة التي لا تدعم hover */}
            <div className="absolute inset-0 z-10" />

            {/* الخصم */}
            {discountPercentage > 0 && (
              <span className="absolute top-4 right-4 bg-[#EC221F] text-white text-xs font-bold px-2 py-1 rounded-full z-20">
                {discountPercentage}% خصم
              </span>
            )}
          </div>

          {/* الصور المصغرة */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-3 gap-4">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`
                    relative aspect-square bg-gray-100 rounded-xl overflow-hidden
                    border-2 transition-all duration-200
                    ${selectedImage === index ? "border-[#EC221F]" : "border-transparent hover:border-gray-300"}
                  `}
                >
                  <Image
                    src={cleanImageUrl(image)}
                    alt={`${product.name} - صورة ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 20vw"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===== بقية الكود (المعلومات) كما هو بدون تغيير ===== */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-[#000000]">{product.name}</h1>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[20px] text-[#666666]">{product.brand || "بدون ماركة"}</span>
              </div>
            </div>

            <div className="flex gap-0 flex-col">
              <span className="text-2xl md:text-4xl font-bold text-[#C01A13] flex items-center gap-1">
                {currentPrice.toLocaleString()}
                <span className="text-2xl">EGP</span>
              </span>
              {originalPrice && originalPrice !== currentPrice && (
                <span className="text-xl text-[#00000080] line-through flex items-center gap-1">
                  {originalPrice.toLocaleString()}
                  <span className="text-base">EGP</span>
                </span>
              )}
            </div>
          </div>

          {/* التقييم */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#EDF0F8] text-[#3A4980] font-bold text-sm rounded-full px-3 py-2 justify-center gap-1">
              <IoChatboxEllipsesOutline className="w-[18px] h-[18px]" />
              <span> {product.reviewsCount} </span>
              <p>تقييم</p>
            </div>
            {product.avg_rating > 0 && (
              <div className="flex items-center bg-[#FFF5F4] text-[#FA6054] font-bold text-sm rounded-full px-3 py-1.5 justify-center gap-1">
                <FaRegStar className="w-[14px] h-[14px]" />
                <span> {product.avg_rating}</span>
              </div>
            )}
          </div>

          {/* ===== اختيار اللون ===== */}
          {product.has_variants && displayColors.length > 0 && (
            <>
              <div>
                <div className="flex justify-between items-center my-4">
                  <span className="text-[16px] font-bold text-[#333333]">اللون</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {displayColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`
                        group relative w-10 h-10 rounded-full transition-all duration-200
                        ${selectedColor === color.name ? "ring-2 ring-offset-2 scale-110" : "hover:scale-105"}
                      `}
                      style={{ backgroundColor: color.code }}
                      aria-label={`لون ${color.name}`}
                    >
                      {selectedColor === color.name && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <hr />
            </>
          )}

          {/* ===== اختيار المقاس ===== */}
          {product.has_variants && displaySizes.length > 0 && (
            <div>
              <div className="flex justify-between items-center my-4">
                <span className="text-[16px] font-bold text-[#333333]">المقاس</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {displaySizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`
                      flex items-center justify-center rounded-[8px] w-[84px] px-3 h-[36px] font-medium transition-all duration-200
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

          {/* ===== الكمية ===== */}
          <div>
            <div className="flex items-center gap-4 my-4">
              <div className="flex items-center rounded-full bg-[#F3F3F3] h-[56px] w-[169px] justify-center">
                <button
                  onClick={decreaseQuantity}
                  className="w-10 h-10 flex items-center justify-center text-[#A3A3A3] transition"
                >
                  <FaMinus className="w-4 h-4" />
                </button>
                <span className="w-14 text-center text-[22px] font-bold text-[#222222]">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  className="w-10 h-10 flex items-center justify-center text-[#3A4980] font-bold transition"
                >
                  <FaPlus className="w-4 h-4 font-bold" />
                </button>
              </div>
              {selectedVariant && selectedVariant.quantity !== null && selectedVariant.quantity < 5 && selectedVariant.quantity > 0 && (
                <span className="text-sm text-orange-600">
                  ⚠️ متبقي {selectedVariant.quantity} فقط
                </span>
              )}
            </div>
          </div>

          {/* الأزرار */}
          <div className="flex flex-col">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || cartLoading || (product.has_variants && !selectedVariant)}
              className="flex-1 bg-[#0A0500] text-[16px] text-white px-6 py-3 rounded-[8px] font-bold hover:bg-[#2b2b2b] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                "أضف إلى السلة"
              )}
            </button>
            
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleToggleFavorite}
                disabled={isMutating}
                className={`
                  flex-1 md:px-6 py-3 rounded-[8px] font-bold transition-all duration-300 flex items-center justify-center gap-2
                  ${isProductFavorite 
                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
                    : "border border-[#0A0500] hover:bg-[#f3f1f1]"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <Heart 
                  className="w-5 h-5" 
                  fill={isProductFavorite ? "#ef4444" : "none"}
                />
                {isProductFavorite ? "تمت الإضافة إلى المفضلة" : "أضف إلى المفضلة"}
              </button>
              <button className="w-12 h-12 rounded-[8px] border border-[#313131] flex items-center justify-center transition-all duration-300 hover:bg-gray-100">
                <BsShare className="w-5 h-5 font-bold" />
              </button>
            </div>
          </div>

          {/* الأقسام القابلة للطي */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div>
              <button
                onClick={() => setActiveTab(activeTab === "info" ? "shipping" : "info")}
                className="flex justify-between items-center w-full py-3 text-right"
              >
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#EC221F]" />
                  معلومات المنتج
                </span>
                <span className="text-2xl">{activeTab === "info" ? "−" : "+"}</span>
              </button>
              {activeTab === "info" && (
                <div className="pt-2 pb-4 text-gray-600 text-sm leading-relaxed space-y-2">
                  <p>{product.description}</p>
                  <p><strong>رمز المنتج:</strong> {product.sku}</p>
                  <p><strong>القسم:</strong> {product.category}</p>
                  <p><strong>الماركة:</strong> {product.brand || "بدون ماركة"}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100">
              <button
                onClick={() => setActiveTab(activeTab === "shipping" ? "info" : "shipping")}
                className="flex justify-between items-center w-full py-3 text-right"
              >
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#EC221F]" />
                  التسليم والإرجاع والاستبدال
                </span>
                <span className="text-2xl">{activeTab === "shipping" ? "−" : "+"}</span>
              </button>
              {activeTab === "shipping" && (
                <div className="pt-2 pb-4 text-gray-600 text-sm space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
                      <Truck className="w-4 h-4" /> التوصيل
                    </h4>
                    <p>• التوصيل خلال 3-5 أيام عمل</p>
                    <p>• توصيل مجاني للطلبات فوق 1000 جنيه</p>
                    <p>• رسوم التوصيل 50 جنيه للطلبات الأقل من 1000 جنيه</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
                      <RefreshCw className="w-4 h-4" /> الإرجاع والاستبدال
                    </h4>
                    <p>• يمكن إرجاع المنتج خلال 14 يوم من تاريخ الاستلام</p>
                    <p>• يجب أن يكون المنتج بحالته الأصلية مع الفاتورة</p>
                    <p>• استرداد كامل المبلغ خلال 7-14 يوم</p>
                    <p>• خدمة الاستبدال مجانية لأول مرة</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}