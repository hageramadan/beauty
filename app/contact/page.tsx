// app/contact/page.tsx
"use client";

import { useState, useEffect } from "react";
import ContactForm from "@/components/contact/ContactForm";
import ServicesSection from "@/components/contact/ServicesSection";
import { useLanguage } from "@/contexts/LanguageContext";



export default function ContactPage() {
  const { language } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  //  دالة مساعدة للحصول على النص المناسب
  const getText = (ar: string, en: string) => {
    if (!isClient) return ar; // على السيرفر استخدم العربية دائماً
    return language === 'en' ? en : ar;
  };
  
  //  استخدم getText بدلاً من getTranslations
  const title = getText('تواصل معنا', 'Contact Us');
 

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
      <div className="container mx-auto">
        {/* عنوان الصفحة */}
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
            {title}
          </h1>
        
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mt-7">
          <ContactForm />
          <ServicesSection />
        </div>
      </div>
    </div>
  );
}