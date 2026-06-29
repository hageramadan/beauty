"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";

interface Category {
  id: number;
  name: string;
  image: string;
  slug: string;
}

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

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

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = direction === 'left' ? -300 : 300;
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const getCategoryImage = (categoryName: string, defaultImage: string): string => {
    const imageMap: { [key: string]: string } = {
      'رجال': '/images/categories/cate1.png',
      'نساء': '/images/categories/cate2.png',
      'أطفال': '/images/categories/cate3.jpg',
      'بنات': '/images/categories/cate4.jpg',
      'بيبي': '/images/categories/cate5.jpg',
      'فورمال': '/images/categories/cate6.jpg',
    };

    for (const [key, value] of Object.entries(imageMap)) {
      if (categoryName.includes(key)) {
        return value;
      }
    }
    
    return defaultImage;
  };

  if (categories.length === 0) {
    return (
      <section className="py-2 md:py-12">
        <div className="container-custom px-4 sm:px-6">
          <div className="text-center text-gray-500">
            <p>لا توجد أقسام متاحة حالياً</p>
          </div>
        </div>
      </section>
    );
  }

  const showArrows = categories.length > 5;

  return (
    <section className="py-2 md:py-12">
      <div className="container-custom px-2 lg:px-6 relative">
        {showArrows && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-5 top-1/2 -translate-y-1/2 z-10 bg-[#23A6F0] rounded-full shadow-lg p-2 md:p-3 hover:bg-[#1f98df] transition-all duration-300 hidden lg:block"
            aria-label="التمرير لليسار"
          >
            <FaArrowRightLong className="text-white" />
          </button>
        )}

        {showArrows && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-5 top-1/2 -translate-y-1/2 z-10 bg-[#23A6F0] rounded-full shadow-lg p-2 md:p-3 hover:bg-[#1f98df] transition-all duration-300 hidden lg:block"
            aria-label="التمرير لليمين"
          >
            <FaArrowLeftLong className="text-white" />
          </button>
        )}

        <div 
          ref={sliderRef}
          className="overflow-x-auto lg:px-5 md:h-[236px] h-[100px] pt-12 hide-scrollbar"
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
          <div className="flex gap-2 md:gap-[26px] justify-start items-center h-full">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex-shrink-0 flex items-center group transition-all duration-300 hover:-translate-y-2"
              >
                <Link href={`/products?categories=[${category.id}]`}>
                  <div className="flex items-center flex-col transition-all w-[85px] md:w-[220px] duration-300 cursor-pointer pb-7">
                    <div 
                      className="relative bg-gray-100 flex items-center justify-center overflow-hidden rounded-full h-[64px] md:h-[196px] w-[64px] md:w-[196px] transition-transform duration-300"
                    >
                      <Image
                        src={getCategoryImage(category.name, category.image)}
                        alt={category.name}
                        fill
                        className="object-contain transition-transform duration-500 p-2 md:p-6"
                        sizes="(max-width: 768px) 64px, 196px"
                      />
                    </div>
                    <div className="text-center mt-2 pb-2 w-full">
                      <h3 
                        className="text-[10px] sm:text-sm whitespace-nowrap"
                        style={{ color: '#112B40' }}
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
    </section>
  );
}