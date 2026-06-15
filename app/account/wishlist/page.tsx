// app/account/wishlist/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { Heart, Trash2, ArrowRight, X } from "lucide-react";
import Pagination from "@/components/products/Pagination";
import { ProductCard } from "@/components/products/ProductCard";
import { useFavorites, transformFavoriteToProductCard } from "@/hooks/useFavorites";
import toast, { Toaster } from "react-hot-toast";

// تعريف نوع المنتج المحول
interface TransformedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  hoverImage: string;
  href: string;
  originalPrice?: number;
  discount?: number;
  colors?: Array<{ color: string; name: string }>;
  rating?: number;
  reviewsCount?: number;
  isBestSeller?: boolean;
}

// عدد المنتجات في كل صفحة
const ITEMS_PER_PAGE = 8;

export default function WishlistPage() {
  const { 
    favorites, 
    isLoading, 
    isMutating,
    total,
    clearAllFavorites,
    refetch
  } = useFavorites();
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // ✅ استخدام useRef لمنع التحديثات المتكررة
  const hasFetched = useRef(false);

  // ✅ استخدام useMemo مع dependency محدد لتجنب إعادة الحساب غير الضرورية
  const allProductCardItems = useMemo((): TransformedProduct[] => {
    if (!favorites || favorites.length === 0) return [];
    
    
    const items: TransformedProduct[] = [];
    
    favorites.forEach((favorite) => {
      const transformed = transformFavoriteToProductCard(favorite);
      if (transformed && transformed.id && transformed.id !== '0') {
        items.push(transformed);
      }
    });
    
    // إزالة التكرارات
    const uniqueItems = Array.from(
      new Map(items.map(item => [item.id, item])).values()
    );
    
    return uniqueItems;
  }, [favorites]); // ✅ فقط عندما تتغير favorites

  // ✅ استخدام useMemo منفصل للصفحات
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return allProductCardItems.slice(startIndex, endIndex);
  }, [allProductCardItems, currentPage]);

  const totalPages = Math.ceil(allProductCardItems.length / ITEMS_PER_PAGE);

  // ✅ تحسين: تحديث الصفحة فقط عندما يتغير العدد الكلي
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // ✅ منع الـ refetch المتكرر عند تحميل الصفحة
  useEffect(() => {
    if (!hasFetched.current && favorites.length === 0 && !isLoading) {
      hasFetched.current = true;
      refetch();
    }
  }, [refetch, isLoading, favorites.length]);

  // ✅ استخدام useCallback لمنع إعادة إنشاء الدوال
  const handleClearAll = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const confirmClearAll = useCallback(async () => {
    await clearAllFavorites();
    setShowClearConfirm(false);
    setCurrentPage(1);
  }, [clearAllFavorites]);

  const cancelClearAll = useCallback(() => {
    setShowClearConfirm(false);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const cleanImageUrl = useCallback((url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith('http')) return url;
    if (url.startsWith('/storage')) {
      return `https://dukanah.admin.t-carts.com${url}`;
    }
    return url;
  }, []);

  // عرض حالة التحميل
  if (isLoading && favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#EC221F] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-500 text-sm animate-pulse">جاري تحميل المفضلة...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: '14px',
            padding: '12px 16px',
            borderRadius: '8px',
            direction: 'rtl',
          },
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Heart className="w-7 h-7 text-[#EC221F] fill-current" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">قائمة المفضلة</h1>
              {total > 0 && (
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-[8px]  text-sm">
                  {total} منتج
                </span>
              )}
            </div>
            
            {allProductCardItems.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={isMutating}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 transition disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                <span>حذف الكل</span>
              </button>
            )}
          </div>

          {allProductCardItems.length === 0 ? (
            <div className="rounded-2xl p-12 text-center h-[70vh] flex flex-col items-center justify-center gap-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">قائمة المفضلة فارغة</h2>
              <p className="text-gray-500 mb-6">لم تقم بإضافة أي منتجات إلى قائمة المفضلة بعد</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-[#EC221F] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#d11d1a] transition"
              >
                استكشاف المنتجات
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <>
              <div 
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                style={{ justifyItems: 'center' }}
              >
                {paginatedItems.map((item) => (
                  <div 
                    key={item.id}
                    className="flex justify-center w-full"
                  >
                    <ProductCard
                      id={item.id}
                      name={item.name}
                      price={item.price}
                      image={cleanImageUrl(item.image)}
                      hoverImage={cleanImageUrl(item.hoverImage)}
                      href={item.href}
                      originalPrice={item.originalPrice}
                      discount={item.discount}
                      colors={item.colors}
                      rating={item.rating}
                      reviewsCount={item.reviewsCount}
                      isBestSeller={item.isBestSeller}
                    />
                  </div>
                ))}
              </div>

              {/* استخدام مكون Pagination الموجود */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  lastPage={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>

        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-bold text-gray-800">تأكيد الحذف</h3>
                <button onClick={cancelClearAll} className="text-gray-400 hover:text-gray-600 transition">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-gray-700 text-lg font-medium mb-2">
                    هل أنت متأكد من حذف جميع المنتجات؟
                  </p>
                  <p className="text-gray-500 text-sm">
                    سيتم حذف {total} منتج من قائمة المفضلة بشكل نهائي.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-6 pt-0">
                <button onClick={cancelClearAll} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-[8px] hover:bg-gray-50 transition">
                  إلغاء
                </button>
                <button onClick={confirmClearAll} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-[8px] hover:bg-red-700 transition">
                  حذف الكل
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}