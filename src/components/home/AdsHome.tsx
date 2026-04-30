// components/AdsHome.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'
import Image from 'next/image'
import { fetchAds, AdPopup, getFullImageUrl } from '@/services/api'

export function AdsHome() {
  const [ads, setAds] = useState<AdPopup[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // جلب الإعلانات من API
  useEffect(() => {
    const loadAds = async () => {
      setLoading(true);
      const data = await fetchAds();
      setAds(data);
      setLoading(false);
    };

    loadAds();
  }, []);

  // استخدام أول إعلان نشط
  const activeAd = ads.find(ad => ad.is_active === 1) || ads[0];

  // حساب الوقت المتبقي (افتراضي 3 أيام من تاريخ الإعلان)
  useEffect(() => {
    if (!activeAd) return;

    // حساب تاريخ انتهاء العرض (مثلاً بعد 3 أيام من تاريخ الإنشاء)
    const endDate = new Date(activeAd.created_at);
    endDate.setDate(endDate.getDate() + 3); // العرض يستمر 3 أيام
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [activeAd]);

  // استخراج قيمة الخصم من النص (مثل "خصم 32%")
  const extractDiscount = (text: string) => {
    const match = text.match(/(\d+)%/);
    return match ? match[1] : null;
  };

  // Format numbers to always show 2 digits
  const formatNumber = (num: number) => String(num).padStart(2, '0');

  // عرض شاشة تحميل
  if (loading) {
    return (
      <section className="bg-[#FDF2F8]">
        <div className="flex flex-row items-stretch justify-between gap-3 sm:gap-6 md:gap-10 min-h-[200px]">
          <div className="flex items-center justify-center w-full">
            <div className="relative">
              <div className="w-8 h-8 border-3 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-8 h-8 border-3 border-[#E60076] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // إذا لم يوجد إعلانات، لا تظهر anything
  if (!activeAd) {
    return null;
  }

  const discountValue = extractDiscount(activeAd.sub_title);
  const adImageUrl = getFullImageUrl(activeAd.image);
  const hasTimer = timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0;

  return (
    <section className="bg-[#FDF2F8]">
      <div className="flex flex-row items-stretch justify-between gap-3 sm:gap-6 md:gap-10">
        
        {/* Left Content */}
        <div className="flex px-3 sm:px-4 py-4 sm:py-5 md:py-6 sm:ps-[2%] md:ps-[4%] lg:ps-[10%] xl:ps-[13%] flex-col gap-1 sm:gap-2 md:gap-[22px] w-1/2">
          
          {/* Limited offer badge - من API */}
          <p className="text-[10px] sm:text-[12px] md:text-[16px] font-semibold py-0.5 sm:py-1 px-2 sm:px-3 text-[#BE4646]">
            {activeAd.name}
          </p>
          
          {/* Discount badge - من API */}
          <div className="flex items-center gap-2 sm:gap-3">
            <p className="text-[16px] sm:text-[20px] md:text-[32px] font-bold py-0.5 sm:py-1 px-2 sm:px-3 text-[#191C1F] w-fit rounded-md">
              {activeAd.sub_title}
            </p>
          </div>
          
          {/* Description - من API */}
          <p className="text-xs sm:text-sm md:text-[22px] text-[#191C1F] w-full sm:w-[90%] md:w-[80%] leading-[1.3] sm:leading-[1.5] whitespace-pre-line">
            {activeAd.description}
          </p>
          
          {/* Countdown Timer - يظهر فقط إذا كان هناك وقت متبقي */}
          {hasTimer && (
            <div className="mt-2 sm:mt-4">
              <p className="text-[10px] sm:text-sm md:text-base text-gray-600 mb-1 sm:mb-3">سينتهي الخصم خلال</p>
              <div className="flex gap-2 sm:gap-3 md:gap-5">
                <div className="text-center">
                  <div className="bg-white text-[#191C1F] rounded-lg px-1 py-0.5 sm:px-2 sm:py-1 md:px-4 md:py-2 min-w-[35px] sm:min-w-[50px] md:min-w-[70px]">
                    <span className="text-sm sm:text-xl md:text-3xl font-bold">{formatNumber(timeLeft.days)}</span>
                  </div>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 mt-0.5 sm:mt-1">أيام</p>
                </div>
                <div className="text-center">
                  <div className="bg-white text-[#191C1F] rounded-lg px-1 py-0.5 sm:px-2 sm:py-1 md:px-4 md:py-2 min-w-[35px] sm:min-w-[50px] md:min-w-[70px]">
                    <span className="text-sm sm:text-xl md:text-3xl font-bold">{formatNumber(timeLeft.hours)}</span>
                  </div>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 mt-0.5 sm:mt-1">ساعات</p>
                </div>
                <div className="text-center">
                  <div className="bg-white text-[#191C1F] rounded-lg px-1 py-0.5 sm:px-2 sm:py-1 md:px-4 md:py-2 min-w-[35px] sm:min-w-[50px] md:min-w-[70px]">
                    <span className="text-sm sm:text-xl md:text-3xl font-bold">{formatNumber(timeLeft.minutes)}</span>
                  </div>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 mt-0.5 sm:mt-1">دقائق</p>
                </div>
                <div className="text-center">
                  <div className="bg-white text-[#191C1F] rounded-lg px-1 py-0.5 sm:px-2 sm:py-1 md:px-4 md:py-2 min-w-[35px] sm:min-w-[50px] md:min-w-[70px]">
                    <span className="text-sm sm:text-xl md:text-3xl font-bold">{formatNumber(timeLeft.seconds)}</span>
                  </div>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 mt-0.5 sm:mt-1">ثواني</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Shop Button - Hidden on mobile, visible on tablet and up */}
          <Button
            asChild
            aria-label='buy now'
            className="hidden sm:flex w-full sm:w-[150px] md:w-[180px] md:h-[60px] animate-in text-[11px] sm:text-[12px] md:text-[16px] font-bold fade-in slide-in-from-bottom-5 duration-700 delay-200 rounded-xl mt-2 sm:mt-4"
            style={{ backgroundColor: '#E60076' }}
          >
            <Link href={activeAd.link || '/products'} className="flex items-center justify-center gap-2 text-white">
              تسوق الان
              <FaArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </div>
        
        {/* Right Image - من API */}
        <div className="w-1/2 flex">
          <Image 
            src={adImageUrl}
            alt={activeAd.name}
            className="w-full h-full object-cover"
            width={500}
            height={400}
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/placeholder-ad.jpg';
            }}
          />
        </div>
        
      </div>
    </section>
  )
}