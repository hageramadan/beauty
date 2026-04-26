"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "../products/ProductCard";
import { Button } from "../ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  href: string;
  originalPrice?: number;
  discount?: number;
}

const latestProducts: Product[] = [
  {
    id: "1",
    name: "سيروم فيتامين سي المشرق للوجه - 30 مل",
    price: 360,
    originalPrice: 500,
    discount: 28,
    image: "/images/products/p1.jpg",
    href: "/products/1",
  },
  {
    id: "2",
    name: "كريم ترطيب عميق بالهيالورونيك اسيد - 50 مل",
    price: 280,
    originalPrice: 400,
    discount: 30,
    image: "/images/products/p2.jpg",
    href: "/products/2",
  },
  {
    id: "3",
    name: "غسول يومي لتنظيف البشرة بالفحم والنعناع - 200 مل",
    price: 150,
    originalPrice: 250,
    discount: 40,
    image: "/images/products/p3.jpg",
    href: "/products/3",
  },
  {
    id: "4",
    name: "تونر ماء الورد الطبيعي منعش للبشرة - 250 مل",
    price: 120,
    originalPrice: 180,
    discount: 33,
    image: "/images/products/p4.jpg",
    href: "/products/4",
  },
  {
    id: "5",
    name: "ماسك الطين البركاني لتنقية المسام - 150 جم",
    price: 200,
    originalPrice: 350,
    discount: 43,
    image: "/images/products/p5.jpg",
    href: "/products/5",
  },
  {
    id: "6",
    name: "كريم العين المضاد للتجاعيد بالكولاجين - 15 مل",
    price: 320,
    originalPrice: 450,
    discount: 29,
    image: "/images/products/p6.jpg",
    href: "/products/6",
  },
  {
    id: "7",
    name: "واقي شمسي بعامل حماية 50 للبشرة الدهنية - 100 مل",
    price: 250,
    originalPrice: 400,
    discount: 37,
    image: "/images/products/p7.jpg",
    href: "/products/7",
  },
  {
    id: "8",
    name: "زيت اللوز الحلو المغذي للبشرة والشعر - 120 مل",
    price: 180,
    originalPrice: 280,
    discount: 36,
    image: "/images/products/p8.jpg",
    href: "/products/8",
  },
];

export function LatestProducts() {
  const [isLoading, setIsLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Simulate fetching all products on mount
  useEffect(() => {
    // Simulate API call delay for loading products
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // يظهر السبينر لمدة 1.5 ثانية

    return () => clearTimeout(timer);
  }, []);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Simulate loading delay
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + 6, latestProducts.length));
      setIsLoadingMore(false);
    }, 500);
  };

  const visibleProducts = latestProducts.slice(0, displayCount);
  const hasMore = displayCount < latestProducts.length;

  // Show main spinner while products are loading initially
  if (isLoading) {
    return (
      <section className="py-3 md:py-10 bg-white">
        <div className="container-custom">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              {/* Spinner */}
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

  return (
    <section className="py-3 md:py-10 bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-2 md:mb-5 flex justify-between mx-2 md:mx-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#112B40' }}>
            أحدث المنتجات
          </h2>
          <p className="text-[#E60076] text-[16px] font-bold">
            عرض المزيد
          </p>
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

        {/* View More Button - Optional, can be uncommented if needed */}
        {/* {hasMore && !isLoadingMore && (
          <div className="text-center">
            <Button
              onClick={handleLoadMore}
              className="group px-8 py-6 text-base font-semibold transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'white',
                color: '#C092BD',
                border: '2px solid #C092BD',
                borderRadius: '12px'
              }}
            >
              عرض المزيد
              <ChevronLeft className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
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
    </section>
  );
}