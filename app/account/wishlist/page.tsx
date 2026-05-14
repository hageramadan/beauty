// app/account/wishlist/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Trash2, ArrowRight, X } from "lucide-react";
import Pagination from "@/components/products/Pagination";
import { ProductCard } from "@/components/products/ProductCard";
import toast, { Toaster } from "react-hot-toast";

// تعريف نوع المنتج في المفضلة
interface WishlistItem {
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
  addedDate: string;
}

// بيانات تجريبية للمفضلة
const mockWishlistItems: WishlistItem[] = [
  {
    id: "1",
    name: "بلوزه حرير بقصة واسعة - تصميم عصري أنيق مناسب للمناسبات",
    price: 371.56,
    originalPrice: 471.56,
    discount: 21,
    image: "/images/products/product1.png",
    hoverImage: "/images/products/product1-hover.png",
    href: "/product/1",
    colors: [
      { color: "#FFB6C1", name: "وردي" },
      { color: "#FFFFFF", name: "أبيض" },
      { color: "#000000", name: "أسود" }
    ],
    rating: 4.5,
    reviewsCount: 128,
    isBestSeller: true,
    addedDate: "2025-04-28"
  },
  {
    id: "2",
    name: "قميص كلاسيك بقصة عادية - قطن 100%",
    price: 371.56,
    originalPrice: 471.56,
    discount: 21,
    image: "/images/products/product2.png",
    hoverImage: "/images/products/product2-hover.png",
    href: "/product/2",
    colors: [
      { color: "#FFFFFF", name: "أبيض" },
      { color: "#000000", name: "أسود" }
    ],
    rating: 4.2,
    reviewsCount: 89,
    addedDate: "2025-04-27"
  },
  {
    id: "3",
    name: "فستان طويل بقصة واسعة - مناسب للحفلات",
    price: 550.00,
    originalPrice: 699.00,
    discount: 21,
    image: "/images/products/product3.png",
    hoverImage: "/images/products/product3-hover.png",
    href: "/product/3",
    colors: [
      { color: "#FFB6C1", name: "وردي" },
      { color: "#90EE90", name: "اخضر" }
    ],
    rating: 4.8,
    reviewsCount: 245,
    isBestSeller: true,
    addedDate: "2025-04-26"
  },
  {
    id: "4",
    name: "بنطلون جينز بقصة واسعة - مقاس واحد مناسب",
    price: 450.00,
    image: "/images/products/product4.png",
    hoverImage: "/images/products/product4-hover.png",
    href: "/product/4",
    colors: [
      { color: "#00008B", name: "ازرق" },
      { color: "#000000", name: "أسود" }
    ],
    rating: 4.3,
    reviewsCount: 167,
    addedDate: "2025-04-25"
  },
  {
    id: "5",
    name: "جاكيت جلد بقصة عادية - جلد طبيعي فاخر",
    price: 890.00,
    originalPrice: 1200.00,
    discount: 26,
    image: "/images/products/product5.png",
    hoverImage: "/images/products/product5-hover.png",
    href: "/product/5",
    colors: [
      { color: "#000000", name: "أسود" },
      { color: "#8B4513", name: "بني" }
    ],
    rating: 4.7,
    reviewsCount: 312,
    isBestSeller: true,
    addedDate: "2025-04-24"
  },
  {
    id: "6",
    name: "تنورة بقصة واسعة - موكا أنيقة",
    price: 290.00,
    image: "/images/products/product1.png",
    hoverImage: "/images/products/product1-hover.png",
    href: "/product/6",
    colors: [
      { color: "#FFB6C1", name: "وردي" },
      { color: "#FFFFFF", name: "أبيض" }
    ],
    rating: 4.1,
    reviewsCount: 56,
    addedDate: "2025-04-23"
  },
  {
    id: "7",
    name: "تيشرت بقصة عادية - قطن فاخر متعدد الألوان",
    price: 150.00,
    originalPrice: 199.00,
    discount: 25,
    image: "/images/products/product2.png",
    hoverImage: "/images/products/product2-hover.png",
    href: "/product/7",
    colors: [
      { color: "#FFFFFF", name: "أبيض" },
      { color: "#000000", name: "أسود" },
      { color: "#808080", name: "رمادي" }
    ],
    rating: 4.4,
    reviewsCount: 203,
    addedDate: "2025-04-22"
  },
  {
    id: "8",
    name: "حذاء رياضي بقصة واسعة - مريح للمشي",
    price: 650.00,
    image: "/images/products/product3.png",
    hoverImage: "/images/products/product3-hover.png",
    href: "/product/8",
    colors: [
      { color: "#FFFFFF", name: "أبيض" },
      { color: "#000000", name: "أسود" }
    ],
    rating: 4.9,
    reviewsCount: 521,
    isBestSeller: true,
    addedDate: "2025-04-21"
  },
  {
    id: "9",
    name: "ساعة يد بقصة عادية - مقاومة للماء",
    price: 1200.00,
    originalPrice: 1500.00,
    discount: 20,
    image: "/images/products/product4.png",
    hoverImage: "/images/products/product4-hover.png",
    href: "/product/9",
    rating: 4.6,
    reviewsCount: 189,
    addedDate: "2025-04-20"
  },
  {
    id: "10",
    name: "نظارة شمسية بقصة واسعة - حماية من الأشعة",
    price: 350.00,
    image: "/images/products/product5.png",
    hoverImage: "/images/products/product5-hover.png",
    href: "/product/10",
    rating: 4.3,
    reviewsCount: 98,
    addedDate: "2025-04-19"
  },
  {
    id: "11",
    name: "حقيبة يد بقصة عادية - جلد طبيعي",
    price: 750.00,
    originalPrice: 899.00,
    discount: 17,
    image: "/images/products/product1.png",
    hoverImage: "/images/products/product1-hover.png",
    href: "/product/11",
    rating: 4.7,
    reviewsCount: 267,
    addedDate: "2025-04-18"
  },
  {
    id: "12",
    name: "عطر بقصة واسعة - عطر فرنسي فاخر",
    price: 500.00,
    image: "/images/products/product2.png",
    hoverImage: "/images/products/product2-hover.png",
    href: "/product/12",
    rating: 4.8,
    reviewsCount: 432,
    isBestSeller: true,
    addedDate: "2025-04-17"
  }
];

// عدد العناصر في كل صفحة
const ITEMS_PER_PAGE = 8;

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // State للـ popup المخصص
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<{ show: boolean; id: string | null; name: string }>({
    show: false,
    id: null,
    name: "",
  });

  // محاكاة تحميل البيانات
  useEffect(() => {
    setTimeout(() => {
      setWishlistItems(mockWishlistItems);
      setIsLoading(false);
    }, 500);
  }, []);

  // معالج الضغط على القلب - عرض popup تأكيد الحذف
  const handleFavoriteToggle = (id: string, isFavorite: boolean) => {
    if (!isFavorite) {
      const item = wishlistItems.find(i => i.id === id);
      if (item) {
        setShowRemoveConfirm({
          show: true,
          id: id,
          name: item.name,
        });
      }
    }
  };

  // تأكيد حذف منتج واحد
  const confirmRemoveItem = () => {
    if (showRemoveConfirm.id) {
      setWishlistItems(prev => prev.filter(item => item.id !== showRemoveConfirm.id));
      toast.success("تم إزالة المنتج من المفضلة", {
        duration: 2000,
        position: "top-center",
      });
    }
    setShowRemoveConfirm({ show: false, id: null, name: "" });
  };

  // إلغاء حذف منتج واحد
  const cancelRemoveItem = () => {
    setShowRemoveConfirm({ show: false, id: null, name: "" });
  };

  // حذف جميع المنتجات من المفضلة - عرض popup
  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  // تأكيد حذف الكل
  const confirmClearAll = () => {
    setWishlistItems([]);
    setShowClearConfirm(false);
    toast.success("تم حذف جميع المنتجات من المفضلة", {
      duration: 2000,
      position: "top-center",
    });
  };

  // إلغاء حذف الكل
  const cancelClearAll = () => {
    setShowClearConfirm(false);
  };

  // حساب عدد الصفحات
  const totalPages = Math.ceil(wishlistItems.length / ITEMS_PER_PAGE);
  
  // الحصول على عناصر الصفحة الحالية
  const paginatedItems = wishlistItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // تغيير الصفحة
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
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
          {/* رأس الصفحة */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Heart className="w-7 h-7 text-[#EC221F] fill-current" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">قائمة المفضلة</h1>
              {wishlistItems.length > 0 && (
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-sm">
                  {wishlistItems.length} منتج
                </span>
              )}
            </div>
            
            {wishlistItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-gray-500 hover:text-[#EC221F] transition flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                حذف الكل
              </button>
            )}
          </div>

          {/* قائمة المنتجات */}
          {wishlistItems.length === 0 ? (
            <div className=" rounded-2xl  p-12 text-center">
              
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
              {/* شبكة المنتجات */}
              <div 
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                style={{ justifyItems: 'center' }}
              >
                {paginatedItems.map((item) => (
                  <div key={item.id} className="flex justify-center w-full">
                    <ProductCard
                      id={item.id}
                      name={item.name}
                      price={item.price}
                      image={item.image}
                      hoverImage={item.hoverImage}
                      href={item.href}
                      originalPrice={item.originalPrice}
                      discount={item.discount}
                      colors={item.colors}
                      rating={item.rating}
                      reviewsCount={item.reviewsCount}
                      isBestSeller={item.isBestSeller}
                      isFavorite={true}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
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

        {/* Popup تأكيد حذف الكل */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-bold text-gray-800">تأكيد الحذف</h3>
                <button
                  onClick={cancelClearAll}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
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
                    سيتم حذف {wishlistItems.length} منتج من قائمة المفضلة بشكل نهائي.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={cancelClearAll}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-[8px] hover:bg-gray-50 transition"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmClearAll}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-[8px] hover:bg-red-700 transition"
                >
                  حذف الكل
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Popup تأكيد حذف منتج واحد */}
        {showRemoveConfirm.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-bold text-gray-800">تأكيد الإزالة</h3>
                <button
                  onClick={cancelRemoveItem}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-gray-700 text-lg font-medium mb-2">
                    هل أنت متأكد من إزالة هذا المنتج؟
                  </p>
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {showRemoveConfirm.name}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={cancelRemoveItem}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-[8px] hover:bg-gray-50 transition"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmRemoveItem}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-[8px] hover:bg-red-700 transition"
                >
                  إزالة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}