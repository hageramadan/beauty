// components/LatestProducts.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "../products/ProductCard";
import { Button } from "../ui/button";
import { fetchNewProducts, transformProductToCardFormat } from "@/services/api";

interface ProductCardType {
  id: string;
  name: string;
  price: number;
  image: string;
  href: string;
  originalPrice?: number;
  discount?: number;
}

export function LatestProducts() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  // استخدام useRef لمنع الاستدعاءات المتكررة
  const loadingRef = useRef(false);
  const initialLoadRef = useRef(false);

  // دالة تحميل المنتجات - استخدام useCallback لمنع إعادة الإنشاء
  const loadProducts = useCallback(async (page: number, isInitial: boolean = false) => {
    // منع التحميل المتزامن المتكرر
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await fetchNewProducts(page, 20);
      
      if (response && response.data.products) {
        const newProducts = response.data.products.map(transformProductToCardFormat);
        
        // تحديث الحالات دفعة واحدة لتجنب الـ cascade renders
        if (isInitial) {
          setProducts(newProducts);
          // عرض أول 8 منتجات فقط في البداية
          const initialDisplayCount = Math.min(8, newProducts.length);
          setTotalProducts(response.data.pagination.total);
          setHasMore(response.data.pagination.next_page !== null);
          setCurrentPage(page);
        } else {
          setProducts(prev => {
            const updatedProducts = [...prev, ...newProducts];
            setTotalProducts(response.data.pagination.total);
            setHasMore(response.data.pagination.next_page !== null);
            setCurrentPage(page);
            return updatedProducts;
          });
        }
      } else {
        console.error('Failed to load products');
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      if (isInitial) {
        setIsLoading(false);
        setInitialLoadDone(true);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, []); // لا توجد تبعيات لأنها دوال مستقلة

  // تحميل أولي للمنتجات
  useEffect(() => {
    // منع التحميل المزدوج في React Strict Mode
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      loadProducts(1, true);
    }
  }, [loadProducts]);

  const handleLoadMore = async () => {
    if (hasMore && !isLoadingMore && !loadingRef.current) {
      await loadProducts(currentPage + 1, false);
    }
  };

  // عرض أول 8 منتجات فقط
  const visibleProducts = products.slice(0, 8);
  const showLoadMore = hasMore && products.length < totalProducts;

  // Show main spinner while products are loading initially
  if (isLoading && !initialLoadDone) {
    return (
      <section className="py-3 md:py-10 bg-white">
        <div className="container-custom">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#E60076] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-500 text-sm animate-pulse">
                جاري تحميل المنتجات...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state if no products
  if (products.length === 0 && initialLoadDone) {
    return (
      <section className="py-3 md:py-10 bg-white">
        <div className="container-custom">
          <div className="mb-2 md:mb-5 flex justify-between mx-2 md:mx-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#112B40' }}>
              الاكثر طلبا
            </h2>
            
          </div>
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="text-center">
              <p className="text-gray-500 text-lg">لا توجد منتجات حالياً</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-3 md:py-10 bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-2 md:mb-5 flex justify-between items-center mx-2 md:mx-4">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#112B40' }}>
            الاكثر طلبا
          </h2>
     
            <Link 
              href="/products/new" 
              className="text-[#E60076] text-[16px] font-bold hover:underline transition-all"
            >
              عرض المزيد
            </Link>
          
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 justify-items-center mb-2 md:mb-5">
          {visibleProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-in fade-in zoom-in duration-500"
              style={{
                animationFillMode: 'both',
                animationDelay: `${index * 100}ms`
              }}
            >
              <ProductCard {...product} />
            </div>
          ))}
        </div>

        {/* Loading More State */}
        {isLoadingMore && (
          <div className="flex justify-center items-center py-8">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 border-3 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-8 h-8 border-3 border-[#E60076] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-400 text-xs">جاري التحميل...</p>
            </div>
          </div>
        )}

        {/* View More Button */}
        {showLoadMore && !isLoadingMore && (
          <div className="text-center mt-8">
            <Button
              onClick={handleLoadMore}
              className="group px-8 py-6 text-base font-semibold transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'white',
                color: '#E60076',
                border: '2px solid #E60076',
                borderRadius: '12px'
              }}
            >
              عرض المزيد
              <ChevronLeft className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        )}
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
    </section>
  );
}