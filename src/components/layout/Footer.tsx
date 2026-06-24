'use client'
import Image from "next/image";
import Link from "next/link";
import { MdEmail, MdPhone } from "react-icons/md";
import { useState, useEffect } from "react";
import { getCategories } from "@/services/api";
import { getSettings } from "@/services/settingsApi";
import { useRouter, usePathname } from "next/navigation";

interface Category {
  id: number;
  name: string;
  href: string;
}

interface Settings {
  name: string;
  address: string;
  privacy_policy: string;
  terms_and_conditions: string;
  linkedin: string;
  twitter: string;
  facebook: string;
  snapchat: string;
  instagram: string;
  whatsapp: string;
  email: string;
  phone: string;
}

export function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // جلب الفئات والإعدادات من API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await getCategories();
        
        const transformedCategories: Category[] = categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          href: `/products?categories=[${cat.id}]`
        }));
        
        setCategories(transformedCategories);

        setLoadingSettings(true);
        const settingsData = await getSettings();
        setSettings(settingsData.setting);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingCategories(false);
        setLoadingSettings(false);
      }
    };
    
    fetchData();
  }, []);

  // ✅ دالة موثوقة للتمرير مع الانتظار حتى ظهور العنصر
  const scrollToElement = (targetId: string) => {
    // محاولة العثور على العنصر
    let targetElement = document.getElementById(targetId);
    
    // إذا لم يتم العثور على العنصر، ننتظر قليلاً ونحاول مرة أخرى
    if (!targetElement) {
      console.log(`⏳ انتظار ظهور العنصر: #${targetId}`);
      
      // استخدام setInterval للتحقق المستمر
      const intervalId = setInterval(() => {
        targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          console.log(`✅ تم العثور على العنصر: #${targetId}`);
          clearInterval(intervalId);
          
          // التمرير إلى العنصر
          const navbarHeight = document.querySelector('header')?.getBoundingClientRect().height || 80;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // تنظيف الـ hash من الرابط
          window.history.pushState(null, '', '/');
        }
      }, 100); // التحقق كل 100ms
      
      // إيقاف المحاولة بعد 5 ثواني إذا لم يتم العثور على العنصر
      setTimeout(() => {
        clearInterval(intervalId);
        console.warn(`⚠️ لم يتم العثور على العنصر: #${targetId} بعد 5 ثواني`);
      }, 5000);
      
      return;
    }
    
    // إذا تم العثور على العنصر مباشرة
    const navbarHeight = document.querySelector('header')?.getBoundingClientRect().height || 80;
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    window.history.pushState(null, '', '/');
  };

  // ✅ دالة للتعامل مع النقر على الروابط
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    console.log(`🔄 النقر على: ${targetId}, المسار الحالي: ${pathname}`);
    
    if (pathname === '/') {
      // إذا كنا في الصفحة الرئيسية، نمرر مباشرة
      console.log(`📍 التمرير إلى: #${targetId}`);
      scrollToElement(targetId);
    } else {
      // إذا كنا في صفحة أخرى، ننتقل إلى الصفحة الرئيسية
      console.log(`🚀 الانتقال إلى الصفحة الرئيسية مع hash: #${targetId}`);
      router.push(`/#${targetId}`);
      
      // ننتظر قليلاً ثم نحاول التمرير
      setTimeout(() => {
        scrollToElement(targetId);
      }, 300);
    }
  };

  // ✅ التعامل مع التمرير عند تحميل الصفحة مع hash
  useEffect(() => {
    const handleHashChange = () => {
      if (pathname === '/' && window.location.hash) {
        const targetId = window.location.hash.replace('#', '');
        console.log(`📌 تم تحميل الصفحة مع hash: #${targetId}`);
        
        // ننتظر حتى تكتمل الصفحة
        setTimeout(() => {
          scrollToElement(targetId);
        }, 500);
      }
    };

    // تنفيذ الفحص عند تحميل الصفحة
    handleHashChange();

    // الاستماع لتغيرات الـ hash
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname]);

  // ✅ دالة بديلة باستخدام requestAnimationFrame
  const scrollToElementWithRAF = (targetId: string) => {
    const tryScroll = () => {
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const navbarHeight = document.querySelector('header')?.getBoundingClientRect().height || 80;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        window.history.pushState(null, '', '/');
        return true;
      }
      return false;
    };

    // محاولة التمرير فوراً
    if (tryScroll()) return;

    // إذا فشلت، استخدام requestAnimationFrame
    let attempts = 0;
    const maxAttempts = 50; // 50 * 100ms = 5 ثواني
    
    const intervalId = setInterval(() => {
      attempts++;
      if (tryScroll() || attempts >= maxAttempts) {
        clearInterval(intervalId);
        if (attempts >= maxAttempts) {
          console.warn(`⚠️ فشل العثور على العنصر: #${targetId}`);
        }
      }
    }, 100);
  };

  return (
    <footer className="border-t mt-auto bg-[#112B40] text-white pt-5">
      <div className="container mx-auto px-4 py-12 bg-[#112B40]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-[#23A6F0] text-[84px] font-bold mb-4">
              {loadingSettings ? (
                <div className="w-48 h-48 bg-gray-700 animate-pulse rounded-lg"></div>
              ) : (
                <Image
                  src="/images/logo.png"
                  alt={settings?.name || "Logo"}
                  width={2000}
                  height={800}
                  className="object-contain w-48 h-48"
                />
              )}
            </h3>
          </div>

          {/* Quick Links - Categories from API */}
          <div>
            <h3 className="font-bold text-lg mb-4">الاقسام</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="/#new"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => handleLinkClick(e, 'new')}
                >
                  الجديد
                </Link>
              </li>
              <li>
                <Link
                  href="/#discount"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => handleLinkClick(e, 'discount')}
                >
                  الخصومات
                </Link>
              </li>
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
                  {loadingSettings ? 'جاري التحميل...' : settings?.terms_and_conditions || 'الشروط والاحكام'}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {loadingSettings ? 'جاري التحميل...' : settings?.privacy_policy || 'سياسة الخصوصية'}
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
                <div>
                  <p>اتصل بنا</p>
                  <span className="text-muted-foreground" dir="ltr">
                    {loadingSettings ? 'جاري التحميل...' : settings?.phone || '0987654333'}
                  </span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <MdEmail className="h-5 w-5 text-primary" />
                <div>
                  <p>البريد الإلكتروني</p>
                  <span className="text-muted-foreground">
                    {loadingSettings ? 'جاري التحميل...' : settings?.email || 'ecommerce@gmail.com'}
                  </span>
                </div>
              </li>
            </ul>
            <div className="flex gap-4 mt-5 md:mt-7 mb-[3rem]">
              {!loadingSettings && settings && (
                <>
                  <Link href={settings.linkedin || '#'}>
                    <Image
                      src="/images/social/linkedin.png"
                      alt="LinkedIn"
                      className="w-[24px] h-[24px]"
                      width={20000}
                      height={20000}
                    />
                  </Link>
                  <Link href={settings.snapchat || '#'}>
                    <Image
                      src="/images/social/snap.png"
                      alt="Snapchat"
                      className="w-[24px] h-[24px]"
                      width={2000}
                      height={2000}
                    />
                  </Link>
                  <Link href={settings.instagram || '#'}>
                    <Image
                      src="/images/social/insta.png"
                      alt="Instagram"
                      className="w-[24px] h-[24px]"
                      width={2000}
                      height={2000}
                    />
                  </Link>
                  <Link href={settings.facebook || '#'}>
                    <Image
                      src="/images/social/face.png"
                      alt="Facebook"
                      className="w-[24px] h-[24px]"
                      width={2000}
                      height={2000}
                    />
                  </Link>
                  <Link href={`https://wa.me/${settings.whatsapp?.replace('+', '') || ''}`}>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}