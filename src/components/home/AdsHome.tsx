"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import Image from 'next/image';
import { MdOutlineTimer } from 'react-icons/md';
import { getAds } from '@/services/api';
interface Ad {
  id: number;
  sub_title: string | null;
  name: string;
  description: string | null;
  link: string | null;
  image: string;
  is_active: number;
}

export function AdsHome() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 48 }); // وقت افتراضي

  // جلب البيانات من API
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const data = await getAds();
        setAds(data);
        setError(null);
      } catch (err) {
        setError("حدث خطأ في تحميل الإعلان");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  // مؤقت للعد التنازلي (اختياري)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59 };
        }
        return prev;
      });
    }, 60000); // يتغير كل دقيقة

    return () => clearInterval(timer);
  }, []);

  // دالة للحصول على مسار الصورة الكامل
  const getFullImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `https://alsas.admin.t-carts.com${imagePath}`;
  };

  // دالة لتنسيق الوصف (إزالة الأسطر الفارغة)
  const formatDescription = (description: string) => {
    return description.replace(/\n/g, ' ').trim();
  };

  if (loading) {
    return (
      <div className="ms-4 sm:mx-0 pt-6 px-2 w-full md:col-span-1 bg-[#FBEDDE] flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7700]"></div>
      </div>
    );
  }

  if (error || ads.length === 0) {
    //如果在加载广告时出错或没有广告，显示默认广告
    return (
      <div className="ms-4 sm:mx-0 pt-6 px-2 w-full md:col-span-1 bg-[#FBEDDE] flex flex-col items-center justify-end gap-4">
        <div className="text-center gap-4 flex flex-col items-center justify-center">
          <p className="text-[#BE4646] text-[14px] font-bold">لفتره محدوده</p>
          <p className="text-[#191C1F] text-[24px] md:text-[32px] font-bold">خصم 32%</p>
          <p className="text-[#475156] text-[1rem]">علي جميع غرف كراسي السفرة</p>
          <div className="flex gap-2 items-center flex-wrap justify-center">
            <p className="text-[#191C1F] text-[14px]">سينتهي الخصم خلال</p>
            <div className="flex gap-1 items-center bg-[#EC221F] text-white px-[12px] py-[4px] rounded">
              <MdOutlineTimer className="w-4 h-4"/>
              <p className="text-[12px]">{String(timeLeft.hours).padStart(2, '0')} : {String(timeLeft.minutes).padStart(2, '0')}</p>
            </div>
          </div>
          <Button
            asChild
            aria-label='buy now'
            className="hidden md:flex w-fit md:w-[180px] md:h-[60px] rounded animate-in text-[12px] md:text-[16px] font-bold fade-in slide-in-from-bottom-5 duration-700 delay-200"
            style={{ backgroundColor: '#FF7700' }}
          >
            <Link href="#" className="flex uppercase items-center justify-center gap-2 text-white">
              <FaArrowRight className="h-4 w-4" />
              Shop now
            </Link>
          </Button>
        </div>
        <div className="text-end mt-8">
          <Image 
            src="/images/left.png" 
            alt="ads Product" 
            width={308} 
            height={442}
            style={{ width: 'auto', height: 'auto' }}
            className="max-w-full h-auto" 
          />
        </div>
      </div>
    );
  }

  // أخذ أول إعلان نشط
  const activeAd = ads[0];

  return (
    <div className="ms-4 sm:mx-0 pt-6 px-2 w-full md:col-span-1 bg-[#FBEDDE] flex flex-col items-center justify-end gap-4">
      <div className="text-center gap-4 flex flex-col items-center justify-center">
        {/* الاسم (مثل: لفتره محدودة) */}
        {activeAd.name && (
          <p className="text-[#BE4646] text-[14px] font-bold">
            {activeAd.name}
          </p>
        )}
        
        {/* العنوان الفرعي (مثل: خصم 32%) */}
        {activeAd.sub_title && (
          <p className="text-[#191C1F] text-[24px] md:text-[32px] font-bold">
            {activeAd.sub_title}
          </p>
        )}
        
        {/* الوصف */}
        {activeAd.description && (
          <p className="text-[#475156] text-[1rem]">
            {formatDescription(activeAd.description)}
          </p>
        )}
        
        {/* مؤقت العد التنازلي */}
        <div className="flex gap-2 items-center flex-wrap justify-center">
          <p className="text-[#191C1F] text-[14px]">سينتهي الخصم خلال</p>
          <div className="flex gap-1 items-center bg-[#EC221F] text-white px-[12px] py-[4px] rounded">
            <MdOutlineTimer className="w-4 h-4"/>
            <p className="text-[12px]">
              {String(timeLeft.hours).padStart(2, '0')} : {String(timeLeft.minutes).padStart(2, '0')}
            </p>
          </div>
        </div>
        
        {/* زر الشراء */}
        <Button
          asChild
          aria-label='buy now'
          className="hidden md:flex w-fit md:w-[180px] md:h-[60px] rounded animate-in text-[12px] md:text-[16px] font-bold fade-in slide-in-from-bottom-5 duration-700 delay-200"
          style={{ backgroundColor: '#FF7700' }}
        >
          <Link 
            href={activeAd.link || "/products"} 
            className="flex uppercase items-center justify-center gap-2 text-white"
          >
            <FaArrowRight className="h-4 w-4" />
            Shop now
          </Link>
        </Button>
      </div>
      
      {/* صورة الإعلان */}
      <div className="text-end mt-8">
        <Image 
          src={getFullImageUrl(activeAd.image)} 
          alt={activeAd.name || "ads Product"} 
          width={308} 
          height={442}
          style={{ width: 'auto', height: 'auto' }}
          className="max-w-full h-auto" 
        />
      </div>
    </div>
  );
}