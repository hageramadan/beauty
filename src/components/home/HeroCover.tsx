"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaArrowLeft } from "react-icons/fa";

interface Slide {
  id: number;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

// Data for left slider (3 images)
const leftSlides: Slide[] = [
  {
    id: 1,
    image: "/images/hero/hero11.png",
    title: "تجربة تقنية متكاملة",
    description: "منتجات أصلية من أشهر العلامات التجارية مع ضمان وجودة تستحقها اكتشف عروض حصرية وتوصيل سريع.",
    buttonText: "تسوق الآن",
    buttonLink: "/",
  },
  {
    id: 2,
    image: "/images/hero/hero22.png",
    title: "أحدث التقنيات",
    description: "اكتشف أحدث الأجهزة والتقنيات المتطورة مع أفضل العروض والضمانات.",
    buttonText: "تسوق الآن",
    buttonLink: "/",
  },
  {
    id: 3,
    image: "/images/hero/hero33.png",
    title: "عروض حصرية",
    description: "خصومات تصل إلى 50% على مجموعة مختارة من المنتجات الأصلية.",
    buttonText: "تسوق الآن",
    buttonLink: "/",
  },
];

// Data for right slider (3 images)
const rightSlides: Slide[] = [
  {
    id: 1,
    image: "/images/hero/Fhero1.png",
    title: "منتجات أصلية",
    description: "جميع المنتجات أصلية 100% مع ضمان الجودة وأفضل الأسعار.",
    buttonText: "تسوق الآن",
    buttonLink: "/",
  },
  {
    id: 2,
    image: "/images/hero/Fhero2.png",
    title: "توصيل سريع",
    description: "توصيل مجاني وسريع لجميع الطلبات داخل المدينة خلال 24 ساعة.",
    buttonText: "تسوق الآن",
    buttonLink: "/",
  },
  {
    id: 3,
    image: "/images/hero/hero3.png",
    title: "خدمة عملاء",
    description: "فريق دعم متكامل لخدمتك على مدار الساعة لحل جميع الاستفسارات.",
    buttonText: "تسوق الآن",
    buttonLink: "/",
  },
];

// Individual Slider Component
function IndividualSlider({ 
  slides, 
  position,
  startDelay = 0 
}: { 
  slides: Slide[]; 
  position: 'left' | 'right';
  startDelay?: number;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // استخدام ref لتجنب إعادة تشغيل المؤقتات
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play functionality with delay for right slider
  useEffect(() => {
    // تنظيف أي مؤقتات سابقة
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!isAutoPlaying) return;

    // تأخير بدء التشغيل التلقائي
    timeoutRef.current = setTimeout(() => {
      // بدء التبديل التلقائي
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 4000);
    }, startDelay);

    // تنظيف عند إزالة المكون
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, slides.length, startDelay]); // نفس الحجم دائماً

  const goToNextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    
    // تنظيف المؤقتات الحالية
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

  const goToPrevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    
    // تنظيف المؤقتات الحالية
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
    
    // تنظيف المؤقتات الحالية
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Background Image */}
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                loading="eager"
                className="object-cover"
                priority={index === 0}
                quality={90}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Optional (يمكنك إظهارها إذا أردت) */}
      {/* <button
        onClick={goToPrevSlide}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-1.5 md:p-2 transition-all duration-300 hover:scale-110 hidden sm:flex"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-white" />
      </button>

      <button
        onClick={goToNextSlide}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-1.5 md:p-2 transition-all duration-300 hover:scale-110 hidden sm:flex"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-white" />
      </button> */}

      {/* Dots Navigation - Optional */}
      {/* <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 md:gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? "w-4 md:w-6 h-1 md:h-1.5 bg-[#E60076]"
                : "w-1 h-1 md:w-1.5 md:h-1.5 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div> */}
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative w-full min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] overflow-hidden bg-gray-900">
      
      {/* Two Sliders Side by Side */}
      <div className="w-full h-full">
        <div className="flex  h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh]">
          {/* Left Slider - يتحرك أولاً (بدون تأخير) */}
          <div className="w-full sm:w-1/2 h-full relative">
            <IndividualSlider 
              slides={leftSlides} 
              position="left" 
              startDelay={0} // يبدأ فوراً
            />
            {/* Overlay for better text visibility on mobile */}
            <div className="absolute inset-0 bg-black/20 sm:bg-transparent z-15 pointer-events-none" />
          </div>
          
          {/* Right Slider - يتحرك بعد 2 ثانية من بدء الأيسر */}
          <div className="w-full sm:w-1/2 h-full relative">
            <IndividualSlider 
              slides={rightSlides} 
              position="right" 
              startDelay={2000} // يتأخر 2 ثانية
            />
            {/* Overlay for better text visibility on mobile */}
            <div className="absolute inset-0 bg-black/20 sm:bg-transparent z-15 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Fixed Center Text - Improved responsiveness */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none px-4 sm:px-6">
        <div className="text-center max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%]">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[58px] font-bold mb-2 sm:mb-3 md:mb-4 text-white drop-shadow-lg">
            تجربة تقنية متكاملة
          </h1>
          <p className="text-white/95 mx-auto w-full sm:w-[85%] md:w-[80%] text-sm sm:text-base md:text-lg lg:text-[20px] mb-4 sm:mb-6 md:mb-8 leading-relaxed drop-shadow-md">
            منتجات أصلية من أشهر العلامات التجارية مع ضمان وجودة تستحقها اكتشف عروض حصرية وتوصيل سريع.
          </p>
          <Button
            asChild
            className="text-white text-[14px] sm:text-[16px] font-bold rounded-xl pointer-events-auto hover:scale-105 transition-transform duration-300 mx-auto"
            style={{ 
              backgroundColor: '#E60076',
              width: '150px',
              height: '45px'
            }}
          >
            <Link href="/" className="flex items-center justify-center gap-2">
              تسوق الآن
              <FaArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}