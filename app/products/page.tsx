// app/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/FilterSidebar';
import Pagination from '@/components/products/Pagination';
import { getAllProducts } from '@/services/api';
import { ProductData } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FilterIcon } from 'lucide-react';
import { X } from 'lucide-react';
import { HiOutlineShoppingBag } from "react-icons/hi2";



export default function ProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filters, setFilters] = useState<any>({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const perPage = 12;

  useEffect(() => {
    loadProducts();
  }, [currentPage, filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { products: productsData, pagination } = await getAllProducts(
        currentPage,
        perPage,
        filters
      );
      setProducts(productsData);
      if (pagination) {
        setLastPage(pagination.last_page || 1);
        setTotalProducts(pagination.total || 0);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setIsMobileFilterOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // منع التمرير في الخلفية عند فتح الفلتر
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileFilterOpen]);

  const transformProductForCard = (product: ProductData) => {
    let colors: Array<{ color: string; name: string }> = [];
    
    if (product.has_variants && product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      if (firstVariant.attributes) {
        colors = firstVariant.attributes
          .filter((attr: any) => attr.attribute_type?.name === "اللون")
          .map((attr: any) => ({
            color: attr.meta?.color || '#000000',
            name: attr.value
          }));
      }
    }

    const cleanImageUrl = (url: string) => {
      if (!url) return '/placeholder-image.jpg';
      if (url.startsWith('/storage')) {
        return `https://dukanah.admin.t-carts.com${url}`;
      }
      return `https://dukanah.admin.t-carts.com/storage${url}`;
    };

    return {
      id: product.id.toString(),
      name: product.name,
      price: product.pricing.final_price,
      image: cleanImageUrl(product.images?.[0]),
      hoverImage: product.images?.[1] ? cleanImageUrl(product.images[1]) : cleanImageUrl(product.images?.[0]),
      href: `/product/${product.id}`,
      originalPrice: product.pricing.has_discount ? product.pricing.price : undefined,
      discount: product.pricing.has_discount 
        ? Math.round(((product.pricing.price - (product.pricing.price_after_discount || 0)) / product.pricing.price) * 100)
        : undefined,
      colors: colors,
      rating: product.avg_rating || 0,
      reviewsCount: product.total_reviews || 0,
      isBestSeller: (product.avg_rating || 0) >= 4.5,
    };
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categoryIds && filters.categoryIds.length > 0) count += filters.categoryIds.length;
    if (filters.colors && filters.colors.length > 0) count += filters.colors.length;
    if (filters.sizes && filters.sizes.length > 0) count += filters.sizes.length;
    if (filters.brands && filters.brands.length > 0) count += filters.brands.length;
    if (filters.minPrice !== undefined && filters.minPrice > 0) count++;
    if (filters.maxPrice !== undefined && filters.maxPrice < 1000) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="min-h-screen  page-with-padding">
      <div className="container mx-auto px-4 pb-16">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className=" rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-[#180100]">
                  احدث المنتجات
                  </h1>
                 
                </div>
                
                {/* ✅ زر الفلتر للموبايل */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FilterIcon className="w-5 h-5" />
                  <span>فلتر</span>
                 
                </button>
              </div>
            </div>
            
            {loading ? (
               <LoadingSpinner size="lg" text="جاري تحميل المنتجات..." />
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const cardData = transformProductForCard(product);
                    return (
                      <div
                        key={cardData.id}
                        className="flex justify-center w-full"
                      >
                        <ProductCard
                          id={cardData.id}
                          name={cardData.name}
                          price={cardData.price}
                          image={cardData.image}
                          hoverImage={cardData.hoverImage}
                          href={cardData.href}
                          originalPrice={cardData.originalPrice}
                          discount={cardData.discount}
                          colors={cardData.colors}
                          rating={cardData.rating}
                          reviewsCount={cardData.reviewsCount}
                          isBestSeller={cardData.isBestSeller}
                        />
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-12">
                  <Pagination
                    currentPage={currentPage}
                    lastPage={lastPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-16 ">
                
                <p className="text-xl text-gray-600">لا توجد منتجات متاحة</p>
                <p className="text-gray-500 mt-2">حاول تغيير خيارات الفلتر</p>
                
              </div>
            )}
          </div>
          
          {/* الفلتر الجانبي - يظهر فقط في الشاشات الكبيرة */}
          <div className="hidden md:block">
          
              <ProductFilters onFilterChange={handleFilterChange} />
       
          </div>
        </div>
      </div>

      {/* ✅ نافذة الفلتر المنزلقة من اليمين بحجم كامل للموبايل */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* خلفية معتمة */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          
          {/* الفلتر المنزلق من اليمين بحجم كامل */}
          <div 
            className={`
              absolute top-0 right-0 bottom-0 w-full bg-white shadow-xl
              transition-transform duration-300 ease-out
              ${isMobileFilterOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
          >
            {/* رأس النافذة */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
              <h2 className="text-lg font-bold">تصفية المنتجات</h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* محتوى الفلتر مع تمرير داخلي */}
            <div className="h-[calc(100%-60px)] overflow-y-auto">
              <ProductFilters 
                onFilterChange={handleFilterChange} 
                isMobile={true}
                onClose={() => setIsMobileFilterOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}