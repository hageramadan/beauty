"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "../products/ProductCard";
import { Button } from "../ui/button";
import { getOffersSection, ProductData } from "@/services/api";

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

// ✅ تحديث واجهة Product لإضافة خصائص الفاريانتات
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
  // ✅ إضافة خصائص الفاريانتات
  hasVariants?: boolean;
  variants?: ProductVariant[];
  variantId?: number | null;
}

// ✅ دالة استخراج الألوان من جميع الـ variants
const extractColorsFromVariants = (
  variants: ProductVariant[]
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

// ✅ تحويل البيانات من API إلى شكل المنتج المطلوب مع دعم الفاريانتات
const transformProduct = (product: ProductData): Product => {
  const cleanImageUrl = (url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith("/storage")) {
      return `https://alsas.admin.t-carts.com${url}`;
    }
    return `https://alsas.admin.t-carts.com${url}`;
  };

  const mainImage =
    product.images && product.images.length > 0
      ? cleanImageUrl(product.images[0])
      : "/images/placeholder.jpg";

  const hoverImage =
    product.images && product.images.length > 1
      ? cleanImageUrl(product.images[1])
      : mainImage;

  let discount: number | undefined;
  let originalPrice: number | undefined;

  if (product.pricing.has_discount && product.pricing.price_after_discount) {
    discount = Math.round(
      ((product.pricing.price - product.pricing.price_after_discount) /
        product.pricing.price) *
        100
    );
    originalPrice = product.pricing.price;
  }

  // ✅ استخراج معلومات الفاريانتات
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
    // ✅ إضافة معلومات الفاريانتات
    hasVariants: hasVariants,
    variants: variants,
    variantId: variantId,
  };
};

export function BestDiscounts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sectionName, setSectionName] = useState<string>("أقوي الخصومات"); // ✅ قيمة افتراضية
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  const isMounted = useRef(true);
  const fetchingRef = useRef(false);

  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      if (fetchingRef.current) return;

      try {
        fetchingRef.current = true;

        if (page === 1) {
          setIsInitialLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        // ✅ جلب السكشن بدلاً من المنتجات فقط
        const section = await getOffersSection();

        if (!isMounted.current) return;

        if (!section) {
          setError("لا توجد خصومات حالياً");
          setProducts([]);
          setHasMore(false);
          return;
        }

        // ✅ تحديث اسم السكشن
        setSectionName(section.name);

        const productsData = section.products || [];
        
        if (productsData.length === 0) {
          setHasMore(false);
        }

        const transformedProducts = productsData.map(transformProduct);

        // ✅ تطبيق pagination يدوياً (لأن الـ API لا يدعم pagination للأقسام)
        const startIndex = (page - 1) * 12;
        const endIndex = startIndex + 12;
        const paginatedProducts = transformedProducts.slice(startIndex, endIndex);

        if (append) {
          setProducts((prev) => [...prev, ...paginatedProducts]);
        } else {
          setProducts(paginatedProducts);
        }

        setTotalProducts(transformedProducts.length);
        setHasMore(endIndex < transformedProducts.length);
        
      } catch (err) {
        console.error("Error fetching products:", err);
        if (!isMounted.current) return;
        setError("فشل في تحميل المنتجات");
        setProducts([]);
      } finally {
        if (!isMounted.current) return;
        setIsInitialLoading(false);
        setIsLoadingMore(false);
        fetchingRef.current = false;
      }
    },
    []
  );

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

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore && !fetchingRef.current) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(nextPage, true);
    }
  }, [hasMore, isLoadingMore, currentPage, fetchProducts]);

  const visibleProducts = products.slice(0, displayCount);
  const showLoadMoreButton =
    hasMore &&
    products.length >= displayCount &&
    products.length < totalProducts;

  if (isInitialLoading) {
    return (
      <section className="py-6 md:py-12 bg-white">
        <div className="container-custom">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#FF7700] border-t-transparent rounded-full animate-spin"></div>
              </div>
             
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error && products.length === 0) {
    return (
      <section className="py-6 md:py-12 bg-white">
        <div className="container-custom">
          {/* <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchProducts(1, false)}
              className="px-4 py-2 bg-[#23856D] text-white rounded-lg hover:bg-[#1a6b58] transition"
            >
              إعادة المحاولة
            </button>
          </div> */}
        </div>
      </section>
    );
  }

  return (
    ( products.length > 0 &&   <section className="py-6 md:py-12 bg-white" id="discount">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-2 md:mb-5 flex justify-between items-center">
          <div>
            <h2
              className="text-lg md:text-xl font-bold"
              style={{ color: "#112B40" }}
            >
              {sectionName} {/* ✅ استخدام اسم السكشن من الـ API */}
            </h2>
          </div>
          <Link
            href="/products"
            className="text-[#FF7700] text-[14px] font-bold hover:underline transition-all duration-300"
          >
            عرض المزيد
          </Link>
        </div>

        {/* ✅ مؤشر تحميل عند تحميل المزيد */}
        {isLoadingMore && (
          <div className="flex justify-center py-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-[#FF7700] rounded-full animate-spin"></div>
              <span className="text-gray-500 text-sm">جاري تحميل المزيد...</span>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-2 md:mb-5">
          {visibleProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-in fade-in zoom-in duration-500 flex justify-center w-full relative"
              style={{
                animationFillMode: "both",
                animationDelay: `${index * 100}ms`,
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
                // ✅ تمرير معلومات الفاريانتات
                hasVariants={product.hasVariants || false}
                variants={product.variants || []}
                variantId={product.variantId || null}
              />
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {showLoadMoreButton && !isLoadingMore && (
          <div className="text-center mt-4">
            <Button
              onClick={handleLoadMore}
              className="px-6 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: "transparent",
                color: "#FF7700",
                border: "2px solid #FF7700",
                borderRadius: "8px",
              }}
            >
              عرض المزيد
            </Button>
          </div>
        )}

        {/* No Products Message */}
        {/* {products.length === 0 && !isInitialLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد خصومات حالياً</p>
          </div>
        )} */}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </section>)
  
  );
}