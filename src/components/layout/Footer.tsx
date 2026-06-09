"use client";

import Image from "next/image";
import Link from "next/link";
import { PiLineVerticalThin } from "react-icons/pi";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// الفئات المستخرجة من الـ Navbar
const footerCategories = [
  { id: 1, name: "رجال", href: "/products?categories=[1]" },
  { id: 2, name: "نساء", href: "/products?categories=[2]" },
  { id: 3, name: "أطفال", href: "/products?categories=[3]" },
  { id: 4, name: "بنات", href: "/products?categories=[4]" },
  { id: 5, name: "بيبي", href: "/products?categories=[5]" },
  { id: 6, name: "فورمال", href: "/products?categories=[6]" },
];

export function Footer() {
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCategoriesDropdown && categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setShowCategoriesDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategoriesDropdown]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCategoriesDropdown) {
        setShowCategoriesDropdown(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showCategoriesDropdown]);

  return (
    <footer className="border-t mt-auto bg-[#141718] text-white pt-6 md:pt-10">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* القسم العلوي - الشبكة الرئيسية */}
        <div className="flex flex-wrap md:flex-row flex-col items-center justify-center md:justify-between gap-8 mb-8">
          
          {/* القسم 1: الشعار والوصف */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-[#FFFFFF] text-xl md:text-2xl font-bold">
                LoGo
              </h1>
              <PiLineVerticalThin className="w-6 h-8 text-[#E8ECEF] text-[14px]" />
              <p className="text-white/70 text-sm leading-relaxed">
                متجرك المثالي هنا كل ما تريد
              </p>
            </div>
          </div>

          {/* روابط التنقل السريع - مع Dropdown للفئات */}
          <div className="flex md:flex-row flex-col justify-center gap-7 items-center text-[14px]">
            <Link href="/" className="font-bold hover:text-[#EC221F] transition-colors">الرئيسية</Link>
            
            {/* Categories Dropdown - يظهر للأعلى */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                onMouseEnter={() => setShowCategoriesDropdown(true)}
                className="flex items-center gap-1 hover:text-[#EC221F] transition-colors"
              >
                الفئات
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showCategoriesDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu - بيظهر فوق الزر (bottom-full) */}
              {showCategoriesDropdown && (
                <div 
                  className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg border shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200"
                  style={{ borderColor: '#e2e8f0' }}
                  onMouseLeave={() => setShowCategoriesDropdown(false)}
                >
                  {/* السهم الصغير اللي يشاور للأسفل (عشان القائمة فوق) */}
                  <div className="absolute -bottom-1.5 right-4 w-3 h-3 rotate-45 bg-white border-r border-b" style={{ borderColor: '#e2e8f0' }}></div>
                  
                  <div className="py-2">
                    {footerCategories.map((category) => (
                      <Link
                        key={category.id}
                        href={category.href}
                        className="block px-4 py-2 text-[14px] transition-colors hover:bg-gray-50 text-right"
                        style={{ color: '#112B40' }}
                        onClick={() => setShowCategoriesDropdown(false)}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#EC221F'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#112B40'}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/contact" className="hover:text-[#EC221F] transition-colors">تواصل معنا</Link>
          </div>
        </div>

        {/* القسم السفلي - الحقوق ووسائل التواصل */}
        <div className="border-t border-white/20 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center gap-7">
              {/* حقوق الملكية */}
              <p className="text-white/60 order-2 md:order-1 text-sm text-[16px] font-bold text-center md:text-right">
                © جميع الحقوق محفوظة | ********** 2025
              </p>

              {/* روابط الشروط والخصوصية */}
              <div className="flex flex-col order-1 md:order-2 md:flex-row gap-6">
                <Link 
                  href="/terms" 
                  className="text-white text-[14px] hover:text-[#EC221F] transition-colors duration-300 text-sm"
                >
                  الشروط والأحكام
                </Link>
                <Link 
                  href="/privacy" 
                  className="text-white text-[14px] hover:text-[#EC221F] transition-colors duration-300 text-sm"
                >
                  سياسة الخصوصية
                </Link>
              </div>
            </div>

            {/* أيقونات وسائل التواصل الاجتماعي */}
            <div className="flex gap-4">
              <Link 
                href="https://www.instagram.com/tcarstofficial/" 
                className="p-2 rounded-full hover:opacity-80 transition-opacity"
                aria-label="Instagram"
              >
                <Image
                  src="/images/social/insta.png"
                  alt="Instagram"
                  className="w-6 h-6"
                  width={26}
                  height={26}
                />
              </Link>
              <Link 
                href="https://www.facebook.com/tcarstofficial/" 
                className="p-2 rounded-full hover:opacity-80 transition-opacity"
                aria-label="Facebook"
              >
                <Image
                  src="/images/social/face.png"
                  alt="Facebook"
                  className="w-6 h-6"
                  width={26}
                  height={26}
                />
              </Link>
              <Link 
                href="https://wa.me/201055099236" 
                className="p-2 rounded-full hover:opacity-80 transition-opacity"
                aria-label="WhatsApp"
                
              >
                <Image
                  src="/images/social/wats.png"
                  alt="WhatsApp"
                  className="w-6 h-6"
                  width={26}
                  height={26}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}