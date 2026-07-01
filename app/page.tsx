// app/page.tsx
import { Suspense } from "react";
import { AdsHome } from "@/components/home/AdsHome";
import { BestProducts } from "@/components/home/BestProducts";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { Hero } from "@/components/home/HeroCover";
import { LatestProducts } from "@/components/home/LatestProducts";
import { BestDiscounts } from "@/components/home/BestDiscounts";
import { getSliders, getCategories } from "@/services/api";
import HomeLoading from "./HomeLoading";
import HomeError from "./HomeError";

const API_BASE_URL = 'https://alsas.admin.t-carts.com';

interface Slide {
  id: number;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

interface Category {
  id: number;
  name: string;
  image: string;
  slug: string;
}

const getDefaultSlides = (): Slide[] => {
  return [
    {
      id: 1,
      image: "/images/hero/hero1.jpg",
      title: "",
      description:"",
      buttonText: "تسوق الآن",
      buttonLink: "/",
    },
    {
      id: 2,
      image: "/images/hero/hero2.jpg",
      title: "",
      description: "",
      buttonText: "تسوق الآن",
      buttonLink: "/",
    },
    {
      id: 3,
      image: "/images/hero/hero1.jpg",
      title: "",
      description: "",
      buttonText: "تسوق الآن",
      buttonLink: "/",
    },
  ];
};

const generateSlug = (name: string): string => {
  const slugMap: { [key: string]: string } = {
    "رجال": "men",
    "نساء": "women",
    "أطفال": "kids",
    "بنات": "girls",
    "بيبي": "baby",
    "فورمال": "formal"
  };
  return slugMap[name] || name.toLowerCase().replace(/\s+/g, '-');
};

// جلب البيانات في Server Component
async function getHomeData() {
  try {
    // جلب السلايدرز والأقسام بالتوازي
    const [slidersData, categoriesData] = await Promise.all([
      getSliders(),
      getCategories()
    ]);

    // تحويل السلايدرز
    const slides: Slide[] = slidersData.length > 0 
      ? slidersData.map(slider => ({
          id: slider.id,
          image: `${API_BASE_URL}${slider.image}`,
          title: slider.name,
          description: slider.description,
          buttonText: "تسوق الآن",
          buttonLink: "/products",
        }))
      : getDefaultSlides();

    // تحويل الأقسام
    const categories: Category[] = categoriesData.map(cat => ({
      id: cat.id,
      name: cat.name,
      image: `https://alsas.admin.t-carts.com${cat.image}`,
      slug: generateSlug(cat.name)
    }));

    return { slides, categories, error: null };
  } catch (error) {
    console.error('Error loading data:', error);
    return {
      slides: getDefaultSlides(),
      categories: [],
      error: 'فشل في تحميل البيانات'
    };
  }
}

export default async function Home() {
  const { slides, categories, error } = await getHomeData();

  // عرض خطأ إذا حدث
  if (error) {
    return <HomeError error={error} />;
  }

  return (
    <div>
      <Hero  />
      <CategoriesSection categories={categories} />
      <LatestProducts />

      <BestProducts />
      <BestProducts />
     
      <BestDiscounts />
    </div>
  );
}