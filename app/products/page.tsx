// app/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/FilterSidebar';
import Pagination from '@/components/products/Pagination';
import { getAllProducts, getCategories } from '@/services/api';
import { ProductData } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FilterIcon } from 'lucide-react';
import { X } from 'lucide-react';
import Link from 'next/link';

// ✅ إضافة الواجهات المطلوبة
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

interface FiltersState {
  categoryIds?: number[];
  colors?: string[];
  sizes?: string[];
  brands?: number[];
  minPrice?: number;
  maxPrice?: number;
}

// ✅ دالة استخراج الألوان من جميع الـ variants
const extractColorsFromVariants = (variants: ProductVariant[]): Array<{ color: string; name: string }> => {
  const colorMap = new Map<string, string>();
  
  if (!variants || variants.length === 0) return [];
  
  variants.forEach((variant) => {
    if (variant.attributes && Array.isArray(variant.attributes)) {
      variant.attributes.forEach((attr: VariantAttribute) => {
        // إذا كان الـ attribute من نوع "اللون"
        if (attr.attribute_type?.name === "اللون" && attr.value && attr.meta?.color) {
          if (!colorMap.has(attr.value)) {
            colorMap.set(attr.value, attr.meta.color);
          }
        }
      });
    }
  });
  
  return Array.from(colorMap.entries()).map(([name, color]) => ({
    name: name,
    color: color
  }));
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filters, setFilters] = useState<FiltersState>({});
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
 
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const perPage = 12;

  // ✅ قراءة الفئة من URL عند تحميل الصفحة
  useEffect(() => {
    const categoriesParam = searchParams.get('categories');
    if (categoriesParam) {
      try {
        // استخراج الـ id من الـ JSON array مثل "[10]"
        const categoryIds = JSON.parse(categoriesParam);
        if (categoryIds && categoryIds.length > 0) {
          const categoryId = categoryIds[0];
          setFilters(prev => ({ ...prev, categoryIds: [categoryId] }));
          
          // جلب اسم الفئة من الـ API
          const fetchCategoryName = async () => {
            const categories = await getCategories();
            const category = categories.find(c => c.id === categoryId);
            if (category) {
              setCategoryName(category.name);
            }
          };
          fetchCategoryName();
        }
      } catch (e) {
        console.error('Error parsing categories param:', e);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, [currentPage, filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const filterParams: any = {
        page: currentPage,
        per_page: perPage,
      };
      
      // تحويل الفلاتر من الصيغة القديمة إلى الصيغة الجديدة
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        filterParams.categories = filters.categoryIds;
      }
      
      if (filters.colors && filters.colors.length > 0) {
        filterParams.colors = filters.colors;
      }
      
      if (filters.sizes && filters.sizes.length > 0) {
        filterParams.sizes = filters.sizes;
      }
      
      if (filters.brands && filters.brands.length > 0) {
        filterParams.brands = filters.brands;
      }
      
      if (filters.minPrice !== undefined && filters.minPrice > 0) {
        filterParams.price_range = [filters.minPrice, filters.maxPrice || 1000000];
      }
      
      const { products: productsData, pagination } = await getAllProducts(filterParams);
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

  // ✅ دالة تحويل المنتج مع استخراج الألوان من جميع الـ variants
  const transformProductForCard = (product: ProductData) => {
    let colors: Array<{ color: string; name: string }> = [];
    
    // ✅ استخراج الألوان من جميع الـ variants وليس فقط الأول
    if (product.has_variants && product.variants && product.variants.length > 0) {
      colors = extractColorsFromVariants(product.variants as ProductVariant[]);
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
    <div className="min-h-screen page-with-padding">
      <div className="container mx-auto px-4 pb-16">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="rounded-lg  mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className='flex items-end gap-1'>
                  <Link href="/" className='text-[#726C6C] text-xl'>الرئيسية</Link>
                  <span>/</span>
                  {/* ✅ عرض اسم الفئة إذا وجدت */}
                  <h1 className="text-xl font-bold text-[#180100]">
                   {categoryName ? ` ${categoryName}` : 'جميع المنتجات'}
                  </h1>
                 
                </div>
                
                {/* زر الفلتر للموبايل */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FilterIcon className="w-5 h-5" />
                  <span>فلتر</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
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
              <div className="text-center py-16">
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

      {/* نافذة الفلتر المنزلقة من اليمين بحجم كامل للموبايل */}
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