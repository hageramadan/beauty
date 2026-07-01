"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getSliders } from "@/services/api";

export function Hero() {
  const [sliders, setSliders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب البيانات من API
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        setLoading(true);
        const data = await getSliders();
        setSliders(data);
        setError(null);
      } catch (err) {
        setError("حدث خطأ في تحميل الصور");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  // دالة للحصول على مسار الصورة الكامل
  const getFullImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `https://alsas.admin.t-carts.com${imagePath}`;
  };

  if (loading) {
    return (
      <section className="relative w-full h-[668px] py-[20px] md:py-[46px] md:h-[400px] lg:h-[660px] overflow-hidden">
        <div className="container-custom h-full mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF7700]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || sliders.length < 4) {
    return (
      <section className="relative w-full h-[668px] py-[20px] md:py-[46px] md:h-[400px] lg:h-[660px] overflow-hidden">
        <div className="container-custom h-full mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col justify-center items-center h-full text-center">
            <p className="text-red-500 mb-4">{error || "لا توجد صور كافية لعرضها (يحتاج 4 صور على الأقل)"}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[#FF7700] text-white rounded-md"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </section>
    );
  }

  // نفس التصميم الأصلي ولكن مع صور من API
  return (
    <section className="relative w-full h-[668px] py-[20px] md:py-[46px] md:h-[400px] lg:h-[660px] overflow-hidden">
      <div className="container-custom h-full mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row h-full gap-4 md:gap-6">
          
          {/* الجانب الأيمن - صورة كبيرة (أول صورة من API) */}
          <div className="w-full md:w-1/2 h-full relative overflow-hidden group">
            <Image
              src={getFullImageUrl(sliders[0].image)}
              alt={sliders[0].name || "Main image"}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-2"
              quality={90}
              priority
            />
          </div>
          
          {/* الجانب الأيسر - صورتين مكدستين */}
          <div className="w-full md:w-1/2 h-full flex flex-col gap-4 md:gap-6">
            
            {/* الصورة العلوية (ثاني صورة من API) */}
            <div className="relative flex-1 overflow-hidden group">
              <Image
                src={getFullImageUrl(sliders[1].image)}
                alt={sliders[1].name || "Image top"}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-2"
                quality={85}
              />
            </div>
            
            {/* القسم السفلي - صورتين جنباً إلى جنب */}
            <div className="flex-1 flex gap-4 md:gap-6">
              
              {/* الصورة السفلية اليسرى (ثالث صورة من API) */}
              <div className="relative w-1/2 overflow-hidden group">
                <Image
                  src={getFullImageUrl(sliders[2].image)}
                  alt={sliders[2].name || "Image bottom left"}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-2"
                  quality={85}
                />
              </div>
              
              {/* الصورة السفلية اليمنى (رابع صورة من API) */}
              <div className="relative w-1/2 overflow-hidden group">
                <Image
                  src={getFullImageUrl(sliders[3].image)}
                  alt={sliders[3].name || "Image bottom right"}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-2"
                  quality={85}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}