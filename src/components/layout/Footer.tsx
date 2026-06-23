'use client'
import Image from "next/image";
import Link from "next/link";
import { MdEmail, MdPhone } from "react-icons/md";
import { useState, useEffect } from "react";
import { getCategories } from "@/services/api";

interface Category {
  id: number;
  name: string;
  href: string;
}

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // جلب الفئات من API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await getCategories();
        
        const transformedCategories: Category[] = categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          href: `/products?categories=[${cat.id}]`
        }));
        
        setCategories(transformedCategories);
      } catch (error) {
        console.error('Error fetching categories for footer:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  // ✅ دالة للتمرير السلس إلى الأقسام
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // ✅ حساب موضع العنصر مع مراعاة الـ Navbar الثابت
      const navbarHeight = document.querySelector('header')?.getBoundingClientRect().height || 80;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className=" border-t mt-auto bg-[#112B40] text-white pt-5">
      <div className="container mx-auto px-4 py-12 bg-[#112B40]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-[#23A6F0] text-[84px] font-bold mb-4">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={2000}
                height={800}
                className="object-contain w-48 h-48"
              />
            </h3>
          </div>

          {/* Quick Links - Categories from API */}
          <div>
            <h3 className="font-bold text-lg mb-4">الاقسام</h3>
            <ul className="space-y-4 text-sm">
              {/* ✅ رابط الجديد مع تمرير سلس */}
              <li>
                <Link
                  href="#new"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => handleSmoothScroll(e, 'new')}
                >
                  الجديد
                </Link>
              </li>
              {/* ✅ رابط الخصومات مع تمرير سلس */}
              <li>
                <Link
                  href="#discount"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => handleSmoothScroll(e, 'discount')}
                >
                  الخصومات
                </Link>
              </li>
              {/* ✅ عرض الفئات من API */}
              {loadingCategories ? (
                <li className="text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                    جاري التحميل...
                  </div>
                </li>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={category.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground text-sm">لا توجد فئات</li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">المساعدة</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  الشروط والاحكام
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">تواصل معنا</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <MdPhone className="h-5 w-5 text-primary" />
                <div >
                  <p>اتصل بنا</p>
                  <span className="text-muted-foreground">0987654333</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <MdEmail className="h-5 w-5 text-primary" />
                <div>
                  <p>البريد الإلكتروني</p>
                  <span className="text-muted-foreground">
                    ecommerce@gmail.com
                  </span>
                </div>
              </li>
            </ul>
            <div className="flex gap-4 mt-5 md:mt-7 mb-[3rem]">
              <Link href="#">
                <Image
                  src="/images/social/linkedin.png"
                  alt="LinkedIn"
                  className="w-[24px] h-[24px]"
                  width={20000}
                  height={20000}
                />
              </Link>
               <Link href="#">
                <Image
                  src="/images/social/snap.png"
                  alt="Snapchat"
                  className="w-[24px] h-[24px]"
                  width={2000}
                  height={2000}
                />
              </Link>
              <Link href="#">
                <Image
                  src="/images/social/insta.png"
                  alt="Instagram"
                  className="w-[24px] h-[24px]"
                  width={2000}
                  height={2000}
                />
              </Link>
              <Link href="#">
                <Image
                  src="/images/social/face.png"
                  alt="Facebook"
                  className="w-[24px] h-[24px]"
                  width={2000}
                  height={2000}
                />
              </Link>
              <Link href="#">
                <Image
                  src="/images/social/wats.png"
                  alt="WhatsApp"
                  className="w-[24px] h-[24px]"
                  width={2000}
                  height={2000}
                />
              </Link>
               <Link href="#">
                <Image
                  src="/images/social/tiktok.png"
                  alt="TikTok"
                  className="w-[24px] h-[24px]"
                  width={2000}
                  height={2000}
                />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}