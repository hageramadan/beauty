"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "../products/ProductCard";
import { Button } from "../ui/button";
import { getNewProducts, ProductData } from "@/services/api";
import { AdsHome } from "./AdsHome";

// ✅ تعريف واجهات الفاريانتات
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

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  hoverImage?: string;
  href: string;
  originalPrice?: number;
  discount?: number;
  colors?: Array<{ color: string; name: string }>;
  rating?: number;
  reviewsCount?: number;
  isBestSeller?: boolean;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  variantId?: number | null;
}

// ✅ دالة استخراج الألوان من جميع الـ variants
const extractColorsFromVariants = (
  variants: ProductVariant[],
): Array<{ color: string; name: string }> => {
  const colorMap = new Map<string, string>();

  if (!variants || variants.length === 0) return [];

  variants.forEach((variant) => {
    if (variant.attributes && Array.isArray(variant.attributes)) {
      variant.attributes.forEach((attr: VariantAttribute) => {
        if (
          attr.attribute_type?.name === "اللون" &&
          attr.value &&
          attr.meta?.color
        ) {
          if (!colorMap.has(attr.value)) {
            colorMap.set(attr.value, attr.meta.color);
          }
        }
      });
    }
  });

  return Array.from(colorMap.entries()).map(([name, color]) => ({
    name: name,
    color: color,
  }));
};

// تحويل البيانات من API إلى شكل المنتج المطلوب - ديناميكي بالكامل
const transformProduct = (product: ProductData): Product => {
  // معالجة الصور بشكل صحيح
  const cleanImageUrl = (url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith('/storage')) {
      return `https://alsas.admin.t-carts.com${url}`;
    }
    return `https://alsas.admin.t-carts.com${url}`;
  };
  
  const mainImage = product.images && product.images.length > 0 
    ? cleanImageUrl(product.images[0])
    : "/images/placeholder.jpg";
    
  const hoverImage = product.images && product.images.length > 1 
    ? cleanImageUrl(product.images[1])
    : mainImage;

  // حساب الخصم بشكل ديناميكي
  let discount: number | undefined;
  let originalPrice: number | undefined;
  
  if (product.pricing.has_discount && product.pricing.price_after_discount) {
    discount = Math.round(((product.pricing.price - product.pricing.price_after_discount) / product.pricing.price) * 100);
    originalPrice = product.pricing.price;
  }

  // ✅ استخراج الألوان من جميع الـ variants ديناميكياً
  let colors: Array<{ color: string; name: string }> = [];
  let hasVariants = false;
  let variants: ProductVariant[] = [];
  let variantId: number | null = null;
  
  if (product.has_variants && product.variants && product.variants.length > 0) {
    hasVariants = true;
    variants = product.variants as ProductVariant[];
    variantId = product.variants[0].id;
    colors = extractColorsFromVariants(product.variants as ProductVariant[]);
  }

  return {
    id: product.id.toString(),
    name: product.name,
    price: product.pricing.final_price,
    image: mainImage,
    hoverImage: hoverImage,
    href: `/product/${product.id}`,
    originalPrice: originalPrice,
    discount: discount,
    colors: colors,
    rating: product.avg_rating || 0,
    reviewsCount: product.total_reviews || 0,
    isBestSeller: product.is_active,
    hasVariants: hasVariants,
    variants: variants,
    variantId: variantId,
  };
};

export function LatestProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(6); // ✅ تغيير من 8 إلى 6 (مثل الكود الأول)
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const isMounted = useRef(true);
  const fetchingRef = useRef(false);

  // جلب المنتجات من API
  const fetchProducts = useCallback(async (page: number, append: boolean = false) => {
    if (fetchingRef.current) return;
    
    try {
      fetchingRef.current = true;
      
      if (page === 1) {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const productsData = await getNewProducts(page, 12);
      
      if (!isMounted.current) return;
      
      if (productsData.length === 0) {
        setHasMore(false);
      }
      
      const transformedProducts = productsData.map(transformProduct);
      
      if (append) {
        setProducts(prev => [...prev, ...transformedProducts]);
      } else {
        setProducts(transformedProducts);
      }
      
      setTotalProducts(productsData.length);
      setHasMore(productsData.length === 12);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      if (!isMounted.current) return;
      setError('فشل في تحميل المنتجات');
      setProducts([]);
    } finally {
      if (!isMounted.current) return;
      setIsInitialLoading(false);
      setIsLoadingMore(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    
    const timeoutId = setTimeout(() => {
      fetchProducts(1, false);
    }, 0);
    
    return () => {
      isMounted.current = false;
      clearTimeout(timeoutId);
    };
  }, [fetchProducts]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + 6, products.length));
      setIsLoadingMore(false);
    }, 500);
  };

  // ✅ استخدام displayCount للتحكم في المنتجات المعروضة (مثل الكود الأول)
  const visibleProducts = products.slice(0, displayCount);
  const hasMoreProducts = displayCount < products.length;

  // ✅ آخر منتج للعرض في الموبايل (مثل الكود الأول)
  const lastProduct = products[products.length - 1];

  // عرض السبينر الرئيسي أثناء التحميل الأولي
  if (isInitialLoading) {
    return (
      <section className="py-2 md:py-12 bg-white">
        <div className="container-custom">
          <div className="mb-5 md:mb-10 flex justify-between">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#112B40' }}>
              أحدث المنتجات
            </h2>
          </div>
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF7700]"></div>
          </div>
        </div>
      </section>
    );
  }

  // عرض رسالة خطأ
  if (error && products.length === 0) {
    return (
      <section className="py-2 md:py-12 bg-white">
        <div className="container-custom">
          <div className="mb-5 md:mb-10 flex justify-between">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#112B40' }}>
              أحدث المنتجات
            </h2>
          </div>
          <div className="flex flex-col justify-center items-center py-20 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => fetchProducts(1, false)} 
              className="px-4 py-2 bg-[#FF7700] text-white rounded-md"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-2 md:py-12 bg-white">
        <div className="container-custom">
          <div className="mb-5 md:mb-10 flex justify-between">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#112B40' }}>
              أحدث المنتجات
            </h2>
          </div>
          <div className="text-center py-20">
            <p className="text-gray-500">لا توجد منتجات حالياً</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-2 md:py-12 bg-white">
      <div className="container-custom">
        {/* Header - نفس تصميم الكود الأول */}
        <div className="mb-5 md:mb-10 flex justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#112B40' }}>
            أحدث المنتجات
          </h2>
          <Link href="/products" className="text-[#FF7700] hover:underline">
            عرض المزيد
          </Link>
        </div>

        {/* Products Grid - نفس تصميم الكود الأول */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center mb-10">
          <div className="col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {visibleProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-in fade-in zoom-in duration-500"
                style={{ 
                  animationFillMode: 'both',
                  animationDelay: `${index * 100}ms`
                }}
              >
                <ProductCard 
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  hoverImage={product.hoverImage}
                  href={product.href}
                  originalPrice={product.originalPrice}
                  discount={product.discount}
                  colors={product.colors}
                  rating={product.rating}
                  reviewsCount={product.reviewsCount}
                  isBestSeller={product.isBestSeller}
                  hasVariants={product.hasVariants || false}
                  variants={product.variants || []}
                  variantId={product.variantId || null}
                />
              </div>
            ))}
          </div>
         
          {/* Mobile extra products - نفس تصميم الكود الأول */}
          <div className="sm:hidden flex flex-col gap-6 ms-8">
            {lastProduct && (
              <>
                <ProductCard 
                  id={lastProduct.id}
                  name={lastProduct.name}
                  price={lastProduct.price}
                  image={lastProduct.image}
                  hoverImage={lastProduct.hoverImage}
                  href={lastProduct.href}
                  originalPrice={lastProduct.originalPrice}
                  discount={lastProduct.discount}
                  colors={lastProduct.colors}
                  rating={lastProduct.rating}
                  reviewsCount={lastProduct.reviewsCount}
                  isBestSeller={lastProduct.isBestSeller}
                  hasVariants={lastProduct.hasVariants || false}
                  variants={lastProduct.variants || []}
                  variantId={lastProduct.variantId || null}
                />
                <ProductCard 
                  id={lastProduct.id}
                  name={lastProduct.name}
                  price={lastProduct.price}
                  image={lastProduct.image}
                  hoverImage={lastProduct.hoverImage}
                  href={lastProduct.href}
                  originalPrice={lastProduct.originalPrice}
                  discount={lastProduct.discount}
                  colors={lastProduct.colors}
                  rating={lastProduct.rating}
                  reviewsCount={lastProduct.reviewsCount}
                  isBestSeller={lastProduct.isBestSeller}
                  hasVariants={lastProduct.hasVariants || false}
                  variants={lastProduct.variants || []}
                  variantId={lastProduct.variantId || null}
                />
              </>
            )}
          </div>

          {/* Sale Banner - نفس تصميم الكود الأول مع الحفاظ على AdsHome */}
          <AdsHome/>
        </div>

        {/* Loading State for Load More */}
        {isLoadingMore && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7700]"></div>
          </div>
        )}

        {/* View More Button - نفس تصميم الكود الأول (معلق) */}
        {/* {hasMoreProducts && !isLoadingMore && (
          <div className="text-center">
            <Button
              onClick={handleLoadMore}
              className="group px-8 py-6 text-base font-semibold transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'white',
                color: '#FF7700',
                border: '2px solid #FF7700',
                borderRadius: '12px'
              }}
            >
              عرض المزيد
              <ChevronLeft className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        )} */}
      </div>
    </section>
  );
}