"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";

interface Category {
  id: string;
  name: string;
  image: string;
  href: string;
}

const initialCategories: Category[] = [
  {
    id: "1",
    name: "ميكاب",
    image: "/images/categories/cate1.jpg",
    href: "/",
  },
  {
    id: "2",
    name: "ميكاب",
    image: "/images/categories/cate2.jpg",
    href: "/",
  },
  {
    id: "3",
   name: "ميكاب",
    image: "/images/categories/cate3.jpg",
    href: "/",
  },
  {
    id: "4",
    name: "ميكاب",
    image: "/images/categories/cate4.jpg",
    href: "/",
  },
  {
    id: "5",
    name: "ميكاب",
    image: "/images/categories/cate1.jpg",
    href: "/",
  },
  {
    id: "6",
    name: "ميكاب",
    image: "/images/categories/cate2.jpg",
    href: "/",
  },
  {
    id: "7",
    name: "ميكاب",
    image: "/images/categories/cate3.jpg",
    href: "/",
  },
  {
    id: "8",
    name: "ميكاب",
    image: "/images/categories/cate4.jpg",
    href: "/",
  },
];

export function CategoriesDragDrop() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

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

  return (
    <section className="py-2 md:py-5 ">
      <div className="container-custom px-4 sm:px-6 relative ">
        
        {/* زر السهم الأيمن */}
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

        {/* زر السهم الأيسر */}
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
            {initialCategories.map((category) => (
              // ✅ التعديل هنا: أضفنا classNames للحركة لأعلى وللتحويل السلس
              <div
                key={category.id}
                className="flex-shrink-0 flex items-stretch transition-all duration-300 hover:-translate-y-2" 
              >
                <Link href="#" className="block w-full">
                  <div className="relative w-[85px] md:w-[220px] h-[100px] md:h-[236px] rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                    {/* الصورة - أزلنا group-hover:scale-110 حتى لا تكبر الصورة وحدها */}
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500" 
                      sizes="(max-width: 768px) 85px, 220px"
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