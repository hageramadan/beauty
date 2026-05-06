// components/Hero.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaArrowLeft } from "react-icons/fa";
import { fetchSliders, Slider, getFullImageUrl } from "@/services/api";

interface Slide {
  id: number;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

// Individual Slider Component with Touch Support
function IndividualSlider({ 
  slides, 
  position,
  startDelay = 0,
  onSlideChange
}: { 
  slides: Slide[]; 
  position: 'left' | 'right';
  startDelay?: number;
  onSlideChange?: (index: number) => void;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // متغيرات السحب باللمس
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const [dragProgress, setDragProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSwipingHorizontal = useRef<boolean>(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play functionality with delay for right slider
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!isAutoPlaying || slides.length === 0) return;

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => {
          const next = (prev + 1) % slides.length;
          onSlideChange?.(next);
          return next;
        });
      }, 4000);
    }, startDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, slides.length, startDelay, onSlideChange]);

  const goToNextSlide = () => {
    if (slides.length === 0) return;
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => {
      const next = (prev + 1) % slides.length;
      onSlideChange?.(next);
      return next;
    });
    
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
    if (slides.length === 0) return;
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => {
      const prevSlide = (prev - 1 + slides.length) % slides.length;
      onSlideChange?.(prevSlide);
      return prevSlide;
    });
    
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

  // دوال السحب للموبايل
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
    setIsAutoPlaying(false);
    isSwipingHorizontal.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;
    
    // تحديد الاتجاه - أفقي أم عمودي
    if (!isSwipingHorizontal.current && Math.abs(diffX) > 5) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        isSwipingHorizontal.current = true;
        e.preventDefault();
      }
    }
    
    if (isSwipingHorizontal.current) {
      e.preventDefault();
      const containerWidth = containerRef.current.clientWidth;
      let progress = diffX / containerWidth;
      // تحديد حدود السحب
      progress = Math.min(Math.max(progress, -0.8), 0.8);
      setDragProgress(progress);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const minSwipeDistance = 0.15; // 15% عتبة السحب
    
    if (Math.abs(dragProgress) > minSwipeDistance && isSwipingHorizontal.current) {
      // سحب ناجح - تغيير الصورة فوراً
      if (dragProgress < 0) {
        goToNextSlide(); // سحب لليسار -> التالي
      } else if (dragProgress > 0) {
        goToPrevSlide(); // سحب لليمين -> السابق
      }
    }
    
    // إعادة التعيين
    setIsDragging(false);
    setDragProgress(0);
    touchStartX.current = 0;
    touchStartY.current = 0;
    isSwipingHorizontal.current = false;
    
    // استئناف التشغيل التلقائي بعد 10 ثواني
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // حساب مؤشرات السلايدات المجاورة
  const getPrevIndex = () => {
    return currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
  };

  const getNextIndex = () => {
    return (currentSlide + 1) % slides.length;
  };

  if (slides.length === 0) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">No slides available</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        touchAction: isDragging && isSwipingHorizontal.current ? 'none' : 'pan-y',
      }}
    >
      <div className="relative w-full h-full">
        {/* السلايد الحالي + السحب المباشر */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translateX(${dragProgress * 100}%)`,
            zIndex: 10,
          }}
        >
          <div className="relative w-full h-full">
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title || `Slide ${currentSlide + 1}`}
              fill
              loading="eager"
              className="object-cover"
              priority
              quality={90}
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder-slide.jpg';
              }}
            />
          </div>
        </div>

        {/* السلايد التالي - يظهر من اليمين عند السحب لليسار */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translateX(${dragProgress < 0 ? (100 + dragProgress * 100) : 100}%)`,
            zIndex: dragProgress < 0 ? 15 : 5,
          }}
        >
          <div className="relative w-full h-full">
            <Image
              src={slides[getNextIndex()].image}
              alt={slides[getNextIndex()].title || `Slide ${getNextIndex() + 1}`}
              fill
              className="object-cover"
              priority={false}
              quality={90}
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder-slide.jpg';
              }}
            />
          </div>
        </div>

        {/* السلايد السابق - يظهر من اليسار عند السحب لليمين */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translateX(${dragProgress > 0 ? (-100 + dragProgress * 100) : -100}%)`,
            zIndex: dragProgress > 0 ? 15 : 5,
          }}
        >
          <div className="relative w-full h-full">
            <Image
              src={slides[getPrevIndex()].image}
              alt={slides[getPrevIndex()].title || `Slide ${getPrevIndex() + 1}`}
              fill
              className="object-cover"
              priority={false}
              quality={90}
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder-slide.jpg';
              }}
            />
          </div>
        </div>
      </div>

      {/* Dots Navigation للسلايدر الفردي - يظهر عند التمرير يدوياً */}
    
    </div>
  );
}

export function Hero() {
  const [leftSlides, setLeftSlides] = useState<Slide[]>([]);
  const [rightSlides, setRightSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [centerText, setCenterText] = useState({
    title: "تجربة تقنية متكاملة",
    description: "منتجات أصلية من أشهر العلامات التجارية مع ضمان وجودة تستحقها اكتشف عروض حصرية وتوصيل سريع."
  });

  // جلب السلايدرات من API
  useEffect(() => {
    const loadSliders = async () => {
      setLoading(true);
      const sliders = await fetchSliders();
      
      if (sliders.length > 0) {
        // تحويل البيانات إلى صيغة Slide
        const formattedSlides: Slide[] = sliders.map(slider => ({
          id: slider.id,
          image: getFullImageUrl(slider.image),
          title: slider.name !== "-" ? slider.name : "",
          description: slider.description || "",
          buttonText: "تسوق الآن",
          buttonLink: slider.link || "/products"
        }));

        // تقسيم السلايدرات: أول 3 للسلايدر الأيسر، والـ 3 التالية للسلايدر الأيمن
        const left = formattedSlides.slice(0, 3);
        const right = formattedSlides.slice(3, 6);
        
        setLeftSlides(left);
        setRightSlides(right);

        // إذا كان هناك سلايدرات، استخدم بيانات أول سلايدر للنص المركزي
        if (formattedSlides.length > 0) {
          setCenterText({
            title: formattedSlides[0].title || "تجربة تقنية متكاملة",
            description: formattedSlides[0].description || "منتجات أصلية من أشهر العلامات التجارية مع ضمان وجودة تستحقها اكتشف عروض حصرية وتوصيل سريع."
          });
        }
      }
      
      setLoading(false);
    };

    loadSliders();
  }, []);

  // عرض شاشة تحميل
  if (loading) {
    return (
      <section className="relative w-full min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] overflow-hidden bg-gray-900">
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#E60076] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] overflow-hidden bg-gray-900">
      
      {/* Two Sliders Side by Side */}
      <div className="w-full h-full">
        <div className="flex h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh]">
          {/* Left Slider - أول 3 صور */}
          <div className="w-full sm:w-1/2 h-full relative">
            <IndividualSlider 
              slides={leftSlides} 
              position="left" 
              startDelay={0}
            />
            <div className="absolute inset-0 bg-black/20 sm:bg-transparent z-15 pointer-events-none" />
          </div>
          
          {/* Right Slider - الـ 3 صور التالية */}
          <div className="w-full sm:w-1/2 h-full relative">
            <IndividualSlider 
              slides={rightSlides} 
              position="right" 
              startDelay={2000}
            />
            <div className="absolute inset-0 bg-black/20 sm:bg-transparent z-15 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Fixed Center Text - من API */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none px-4 sm:px-6">
        <div className="text-center max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%]">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[58px] font-bold mb-2 sm:mb-3 md:mb-4 text-white drop-shadow-lg">
            {centerText.title}
          </h1>
          <p className="text-white/95 mx-auto w-full sm:w-[85%] md:w-[80%] text-sm sm:text-base md:text-lg lg:text-[20px] mb-4 sm:mb-6 md:mb-8 leading-relaxed drop-shadow-md line-clamp-3">
            {centerText.description}
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
            <Link href="/products" className="flex items-center justify-center gap-2">
              تسوق الآن
              <FaArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}