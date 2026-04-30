// services/api.ts
const API_BASE_URL = "https://beauty.admin.t-carts.com/api";
const API_BASE_URL_Img = "https://beauty.admin.t-carts.com";

export interface Category {
  id: number;
  name: string;
  image: string;
  subcategories: any[];
}

export interface ProductPricing {
  price: number;
  has_discount: boolean;
  discount_type: string | null;
  discount_value: number | null;
  price_after_discount: number | null;
  final_price: number;
}

export interface ProductImage {
  id?: number;
  image_path?: string;
}

export interface Product {
  id: number;
  type: string;
  is_active: boolean;
  name: string;
  description: string;
  category: Category;
  subcategory: null | any;
  brand: null | any;
  has_production_date: boolean;
  pricing: ProductPricing;
  has_variants: boolean;
  variants: null | any;
  quantity: number;
  images: string[];
}

export interface ProductsResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    products: Product[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
      next_page: number | null;
      previous_page: number | null;
    };
  };
}

export interface ApiResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    categories: Category[];
  };
}

export interface AdPopup {
  id: number;
  sub_title: string;
  name: string;
  description: string;
  link: string | null;
  image: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface AdsResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    ad_pop_up: AdPopup[];
  };
}
export interface Slider {
  id: number;
  sub_title: string;
  name: string;
  description: string;
  link: string | null;
  image: string;
  is_active: number;
}

export interface SlidersResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    sliders: Slider[];
  };
}
export async function fetchSliders(): Promise<Slider[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/sliders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SlidersResponse = await response.json();
    
    if (data.result && data.data.sliders) {
      // تصفية السلايدرات النشطة فقط
      const activeSliders = data.data.sliders.filter(slider => slider.is_active === 1);
      return activeSliders;
    } else {
      throw new Error(data.message || 'Failed to fetch sliders');
    }
  } catch (error) {
    console.error('Error fetching sliders:', error);
    return [];
  }
}
export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    
    if (data.result && data.data.categories) {
      return data.data.categories;
    } else {
      throw new Error(data.message || 'Failed to fetch categories');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// دالة جديدة لجلب المنتجات الجديدة
export async function fetchNewProducts(page: number = 1, perPage: number = 20): Promise<ProductsResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/new-products?page=${page}&per_page=${perPage}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ProductsResponse = await response.json();
    
    if (data.result && data.data.products) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to fetch new products');
    }
  } catch (error) {
    console.error('Error fetching new products:', error);
    return null;
  }
}

// دالة مساعدة لبناء رابط الصورة الكامل
export function getFullImageUrl(imagePath: string): string {
  if (!imagePath) return '/images/placeholder.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL_Img}${imagePath}`;
}

// دالة لتحويل بيانات المنتج من API إلى الصيغة المطلوبة لـ ProductCard
export function transformProductToCardFormat(product: Product) {
  const hasDiscount = product.pricing.has_discount && product.pricing.price_after_discount;
  const discountPercent = hasDiscount && product.pricing.price > 0
    ? Math.round(((product.pricing.price - product.pricing.price_after_discount!) / product.pricing.price) * 100)
    : undefined;

  return {
    id: product.id.toString(),
    name: product.name,
    price: hasDiscount ? product.pricing.price_after_discount! : product.pricing.price,
    originalPrice: hasDiscount ? product.pricing.price : undefined,
    discount: discountPercent,
    image: getFullImageUrl(product.images[0]),
    href: `/products/${product.id}`,
  };
}

export async function fetchAds(): Promise<AdPopup[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/ads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AdsResponse = await response.json();
    
    if (data.result && data.data.ad_pop_up) {
      return data.data.ad_pop_up;
    } else {
      throw new Error(data.message || 'Failed to fetch ads');
    }
  } catch (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
}