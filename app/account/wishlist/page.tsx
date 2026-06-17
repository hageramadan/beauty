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

// ✅ إضافة واجهة Pagination
interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  next_page: number | null;
  previous_page: number | null;
}

// ========== إعدادات API ==========
const API_URL = 'https://dukanah.admin.t-carts.com/api';

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const getHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// ✅ متغيرات لمنع التكرار على مستوى الدالة
let isFetching = false;
let lastFetchTime = 0;

// ✅ دالة جلب المفضلة مع Pagination
const fetchFavorites = async (page: number = 1, perPage: number = 8): Promise<{ items: TransformedProduct[], pagination: PaginationData }> => {
  // ✅ منع التكرار في نفس الثانية
  const now = Date.now();
  if (isFetching || (now - lastFetchTime < 300)) {
    console.log("⏳ Skipping duplicate fetch request");
    return {
      items: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 8,
        total: 0,
        from: 0,
        to: 0,
        next_page: null,
        previous_page: null
      }
    };
  }
  
  isFetching = true;
  lastFetchTime = now;
  
  try {
    console.log(`🟢 Fetching favorites page ${page}`);
    const response = await fetch(`${API_URL}/user-favorites?page=${page}&per_page=${perPage}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    console.log(`📥 Response for page ${page}:`, data);
    
    if (data.result === true && data.data) {
      const favorites = data.data.favorites || data.data || [];
      const pagination = data.data.pagination || {
        current_page: 1,
        last_page: 1,
        per_page: 8,
        total: 0,
        from: 0,
        to: 0,
        next_page: null,
        previous_page: null
      };
      
      // تحويل البيانات
      const items: TransformedProduct[] = [];
      favorites.forEach((favorite: any) => {
        try {
          const transformed = transformFavoriteToProductCard(favorite);
          if (transformed && transformed.id && transformed.id !== '0') {
            items.push(transformed);
          }
        } catch (error) {
          console.error("❌ Error transforming favorite:", error);
        }
      });
      
      // إزالة التكرارات
      const uniqueItems = Array.from(
        new Map(items.map(item => [item.id, item])).values()
      );
      
      console.log(`✅ Loaded ${uniqueItems.length} items for page ${page}`);
      console.log(`📊 Pagination:`, pagination);
      
      return {
        items: uniqueItems,
        pagination: pagination
      };
    }
    
    console.warn(`⚠️ No favorites found for page ${page}`);
    return {
      items: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 8,
        total: 0,
        from: 0,
        to: 0,
        next_page: null,
        previous_page: null
      }
    };
  } catch (error) {
    console.error("❌ Error fetching favorites:", error);
    toast.error("حدث خطأ في جلب المفضلة");
    return {
      items: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 8,
        total: 0,
        from: 0,
        to: 0,
        next_page: null,
        previous_page: null
      }
    };
  } finally {
    isFetching = false;
  }
};

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
  const [items, setItems] = useState<TransformedProduct[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 8,
    total: 0,
    from: 0,
    to: 0,
    next_page: null,
    previous_page: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ استخدام ref لمنع التكرار
  const hasLoadedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const itemsPerPage = 8;

  // ✅ دالة جلب المفضلة مع الصفحة
  const loadFavorites = useCallback(async (page: number = 1) => {
    // ✅ منع التكرار إذا كان هناك طلب قيد التنفيذ
    if (loading && hasLoadedRef.current && page === pagination.current_page) {
      console.log("⏳ Skipping - already loading or loaded");
      return;
    }
    
    // ✅ إلغاء الطلب السابق
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFavorites(page, itemsPerPage);
      
      if (!abortControllerRef.current?.signal.aborted) {
        console.log(`🟢 Setting favorites for page ${page}:`, result.items.length);
        console.log(`📊 Setting pagination:`, result.pagination);
        
        setItems(result.items);
        setPagination(result.pagination);
        setCurrentPage(page);
        hasLoadedRef.current = true;
      }
    } catch (err: any) {
      if (!abortControllerRef.current?.signal.aborted) {
        console.error("❌ Error loading favorites:", err);
        setError(err.message || 'حدث خطأ في تحميل المفضلة');
        toast.error(err.message || 'حدث خطأ في تحميل المفضلة');
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [itemsPerPage, loading, pagination.current_page]);

  // ========== تحميل الصفحة الأولى ==========
  useEffect(() => {
    if (!hasLoadedRef.current) {
      console.log("🟢 Loading favorites for the first time");
      loadFavorites(1);
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadFavorites]);

  // ✅ تحديث الصفحة عند تغيير الـ Page
  const handlePageChange = useCallback((page: number) => {
    console.log(`🔄 Changing to page ${page}`);
    if (page >= 1 && page <= pagination.last_page) {
      loadFavorites(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination.last_page, loadFavorites]);

  // ✅ تحديث القائمة بعد الحذف
  const handleClearAll = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const confirmClearAll = useCallback(async () => {
    try {
      await clearAllFavorites();
      setShowClearConfirm(false);
      // ✅ إعادة تحميل الصفحة الأولى بعد الحذف
      hasLoadedRef.current = false;
      loadFavorites(1);
    } catch (error) {
      console.error("❌ Error clearing favorites:", error);
      toast.error("حدث خطأ في حذف المفضلة");
    }
  }, [clearAllFavorites, loadFavorites]);

  const cancelClearAll = useCallback(() => {
    setShowClearConfirm(false);
  }, []);

  const cleanImageUrl = useCallback((url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith('http')) return url;
    if (url.startsWith('/storage')) {
      return `https://dukanah.admin.t-carts.com${url}`;
    }
    return url;
  }, []);

  // ========== عرض حالة التحميل ==========
  if (loading && items.length === 0) {
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

  // ========== عرض حالة الخطأ ==========
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
          <div className="rounded-2xl p-12 text-center h-[70vh] flex flex-col items-center justify-center gap-4">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">حدث خطأ</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                hasLoadedRef.current = false;
                loadFavorites(1);
              }}
              className="inline-flex items-center gap-2 bg-[#EC221F] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#d11d1a] transition"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Heart className="w-7 h-7 text-[#EC221F] fill-current" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">قائمة المفضلة</h1>
           
          </div>
          
          {items.length > 0 && (
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

        {items.length === 0 ? (
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
              {items.map((item) => (
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

            {/* ✅ استخدام مكون Pagination */}
            {pagination.last_page > 1 && (
              <Pagination
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                onPageChange={handlePageChange}
                total={pagination.total}
              />
            )}
          </>
        )}
      </div>

      {/* ✅ نافذة تأكيد الحذف */}
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
                  سيتم حذف {pagination.total} منتج من قائمة المفضلة بشكل نهائي.
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
  );
}