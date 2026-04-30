// components/CategoriesDragDrop.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";
import { fetchCategories, Category } from "@/services/api";

export function CategoriesDragDrop() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب البيانات من API
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
      setLoading(false);
    };

    loadCategories();
  }, []);

  // دوال السحب
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX);
    setScrollStart(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = 'grabbing';
    sliderRef.current.style.userSelect = 'none';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setScrollStart(sliderRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollStart - walk;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const x = e.touches[0].pageX;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollStart - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
      sliderRef.current.style.userSelect = 'auto';
    }
  };

  // دوال أزرار التحريك
  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = direction === 'left' ? -300 : 300;
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // بناء رابط الصورة الكامل
  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return '/images/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://beauty.admin.t-carts.com${imagePath}`;
  };

  if (loading) {
    return (
      <section className="py-2 md:py-5">
        <div className="container-custom px-4 sm:px-6">
          <div className="flex justify-center items-center h-[140px] md:h-[300px]">
            <div className="animate-pulse text-[#E60076]">جاري التحميل...</div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-2 md:py-5 ">
      <div className="container-custom px-4 sm:px-6 relative ">
        
        {/* زر السهم الأيمن */}
        {categories.length > 4 && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#E60076] rounded-full shadow-lg p-2 md:p-3 hover:bg-[#be0063] transition-all duration-300 hidden xl:block"
            style={{ 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transform: 'translateX(50%) translateY(-50%)'
            }}
            aria-label="التمرير لليسار"
          >
            <FaArrowRightLong className="text-white"/>
          </button>
        )}

        {/* زر السهم الأيسر */}
        {categories.length > 4 && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#E60076] rounded-full shadow-lg p-2 md:p-3 hover:bg-[#be0063] transition-all duration-300 hidden xl:block"
            style={{ 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transform: 'translateX(-50%) translateY(-50%)'
            }}
            aria-label="التمرير لليمين"
          >
            <FaArrowLeftLong className="text-white" />
          </button>
        )}

        {/* حاوية السحب الأفقية */}
        <div 
          ref={sliderRef}
          className="overflow-x-auto pt-7 md:h-[300px] h-[140px] hide-scrollbar"
          style={{ 
            width: '100%',
            overflowY: 'hidden',
            cursor: 'grab',
            WebkitOverflowScrolling: 'touch',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="flex gap-6 md:gap-[26px] justify-start items-stretch h-full">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex-shrink-0 flex items-stretch transition-all duration-300 hover:-translate-y-2" 
              >
                <Link href={`/categories/${category.id}`} className="block w-full">
                  <div className="relative w-[85px] md:w-[220px] h-[100px] md:h-[236px] rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                    <Image
                      src={getFullImageUrl(category.image)}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500" 
                      sizes="(max-width: 768px) 85px, 220px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder.jpg';
                      }}
                    />
                    
                    {/* اسم الفئة في الأسفل */}
                    <div className="absolute bottom-0 left-0 right-0 ">
                      <h3 
                        className="text-white text-[16px] font-bold bg-[#E6007699] py-1 md:py-2 w-full md:text-base lg:text-lg text-center line-clamp-2 whitespace-normal"
                      >
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}