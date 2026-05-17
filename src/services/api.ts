// services/api.ts
const API_URL = "https://dukanah.admin.t-carts.com/api";

interface SliderResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    sliders: SlideData[];
  };
}

interface SlideData {
  id: number;
  sub_title: string | null;
  name: string;
  description: string;
  link: string | null;
  image: string;
  is_active: number;
}

export async function getSliders(): Promise<SlideData[]> {
  try {
    const response = await fetch(`${API_URL}/sliders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // إذا كان الـ API يحتاج توثيق، ضيفي الـ token هنا
        // 'Authorization': `Bearer ${yourToken}`,
      },
      cache: 'no-store', // أو 'force-cache' إذا حبيتي caching
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SliderResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.sliders.filter(slider => slider.is_active === 1);
    } else {
      throw new Error(result.message || 'Failed to fetch sliders');
    }
  } catch (error) {
    console.error('Error fetching sliders:', error);
    return [];
  }
}

interface CategoryResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    categories: CategoryData[];
  };
}

interface CategoryData {
  id: number;
  name: string;
  subcategories: any[];
  image: string;
}

export async function getCategories(): Promise<CategoryData[]> {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: CategoryResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.categories;
    } else {
      throw new Error(result.message || 'Failed to fetch categories');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

interface ProductResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    products: ProductData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
      next_page: string | null;
      previous_page: string | null;
    };
  };
}

export interface ProductData {
  id: number;
  type: string;
  is_active: boolean;
  name: string;
  avg_rating: number;
  total_reviews: number;  
  description: string;
  category: {
    id: number;
    name: string;
    subcategories: any[];
    image: string;
  };
  subcategory: any;
  brand: any;
  has_production_date: boolean;
  pricing: {
    price: number;
    has_discount: boolean;
    discount_type: string | null;
    discount_value: number | null;
    price_after_discount: number | null;
    final_price: number;
  };
  has_variants: boolean;
  variants: any;
  quantity: number;
  images: string[];
}

export async function getNewProducts(page: number = 1, perPage: number = 20): Promise<ProductData[]> {
  try {
    const response = await fetch(`${API_URL}/products/new-products?page=${page}&per_page=${perPage}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ProductResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.products;
    } else {
      throw new Error(result.message || 'Failed to fetch new products');
    }
  } catch (error) {
    console.error('Error fetching new products:', error);
    return [];
  }
}

interface AdResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    ad_pop_up: AdData[];
  };
}

export interface AdData {
  id: number;
  sub_title: string | null;
  name: string;
  description: string;
  link: string | null;
  image: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export async function getAds(): Promise<AdData[]> {
  try {
    const response = await fetch(`${API_URL}/ads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: AdResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      // تصفية الإعلانات النشطة فقط
      return result.data.ad_pop_up.filter(ad => ad.is_active === 1);
    } else {
      throw new Error(result.message || 'Failed to fetch ads');
    }
  } catch (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
}

export async function getMostSellingProducts(page: number = 1, perPage: number = 20): Promise<ProductData[]> {
  try {
    const response = await fetch(`${API_URL}/products/most-selling-products?page=${page}&per_page=${perPage}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ProductResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.products;
    } else {
      throw new Error(result.message || 'Failed to fetch most selling products');
    }
  } catch (error) {
    console.error('Error fetching most selling products:', error);
    return [];
  }
}

// ========== واجهات الفلاتر والمنتجات ==========
export interface ProductFilters {
  price_range?: [number, number];  // [min, max]
  brands?: number[];               // مصفوفة من ارقام البراندات
  sizes?: string[];               // مصفوفة من المقاسات ["S", "M", "L"]
  colors?: string[];              // مصفوفة من أكواد الألوان URL encoded
  categories?: number[];          // مصفوفة من ارقام الكاتجوريز
  page?: number;
  per_page?: number;
}

interface ProductsListResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    products: ProductData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
      next_page: string | null;
      previous_page: string | null;
    };
  };
}

// services/api.ts - استبدلي دالة buildFiltersQueryString بهذه النسخة

/**
 * تحويل الفلاتر إلى query string بتنسيق JSON arrays (بدون ترميز)
 */
function buildFiltersQueryString(filters: ProductFilters): string {
  const queryParts: string[] = [];
  
  if (filters.page && filters.page > 0) {
    queryParts.push(`page=${filters.page}`);
  }
  
  const perPage = filters.per_page || 20;
  queryParts.push(`per_page=${perPage}`);
  
  // price_range: [5000, 10000] - بدون ترميز
  if (filters.price_range && filters.price_range.length === 2) {
    queryParts.push(`price_range=[${filters.price_range[0]},${filters.price_range[1]}]`);
  }
  
  // brands: [4]
  if (filters.brands && filters.brands.length > 0) {
    queryParts.push(`brands=[${filters.brands.join(',')}]`);
  }
  
  // sizes: ["S"]
  if (filters.sizes && filters.sizes.length > 0) {
    const formattedSizes = filters.sizes.map(s => `"${s}"`).join(',');
    queryParts.push(`sizes=[${formattedSizes}]`);
  }
  
  // colors: ["#252B42"]
  if (filters.colors && filters.colors.length > 0) {
    const formattedColors = filters.colors.map(c => `"${c}"`).join(',');
    queryParts.push(`colors=[${formattedColors}]`);
  }
  
  // categories: [1]
  if (filters.categories && filters.categories.length > 0) {
    queryParts.push(`categories=[${filters.categories.join(',')}]`);
  }
  
  return queryParts.join('&');
}
/**
 * الدالة الرئيسية لجلب المنتجات مع الفلاتر
 * @param filters الفلاتر المطلوب تطبيقها
 * @returns قائمة المنتجات ومعلومات التصفح
 * 
 * @example
 * // فلتر بالسعر فقط
 * getAllProducts({ price_range: [5000, 10000], page: 1 })
 * 
 * // فلتر بالبراند فقط
 * getAllProducts({ brands: [4], page: 1 })
 * 
 * // فلتر بالمقاسات فقط
 * getAllProducts({ sizes: ["S"], page: 1 })
 * 
 * // فلتر باللون فقط
 * getAllProducts({ colors: ["%23252B42"], page: 1 })
 * 
 * // فلتر بالكاتجري فقط
 * getAllProducts({ categories: [1], page: 1 })
 * 
 * // عدة فلاتر معاً
 * getAllProducts({
 *   price_range: [5000, 10000],
 *   brands: [4],
 *   colors: ["%23252B42"],
 *   categories: [1],
 *   sizes: ["S"],
 *   page: 1,
 *   per_page: 20
 * })
 */
export async function getAllProducts(
  filters: ProductFilters = {}
): Promise<{ products: ProductData[]; pagination: ProductsListResponse['data']['pagination'] | null }> {
  try {
    if (!filters.page || filters.page < 1) {
      filters.page = 1;
    }
    
    const queryString = buildFiltersQueryString(filters);
    const url = `${API_URL}/products?${queryString}`;
    
    console.log('Fetching products from URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ProductsListResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return {
        products: result.data.products,
        pagination: result.data.pagination
      };
    } else {
      throw new Error(result.message || 'Failed to fetch products');
    }
  } catch (error) {
    console.error('Error fetching all products:', error);
    return { products: [], pagination: null };
  }
}

/**
 * دالة البحث عن المنتجات باستخدام كلمات مفتاحية
 * @param query كلمة البحث
 * @param page رقم الصفحة
 * @param perPage عدد النتائج في الصفحة
 */
export async function searchProducts(
  query: string,
  page: number = 1,
  perPage: number = 20
): Promise<{ products: ProductData[]; pagination: any }> {
  try {
    const url = `${API_URL}/products/search?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ProductsListResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return {
        products: result.data.products,
        pagination: result.data.pagination
      };
    } else {
      throw new Error(result.message || 'Failed to search products');
    }
  } catch (error) {
    console.error('Error searching products:', error);
    return { products: [], pagination: null };
  }
}

/**
 * دالة جلب منتجات محددة باستخدام IDs
 * @param productIds قائمة IDs المنتجات المطلوبة
 */
export async function getProductsByIds(productIds: number[]): Promise<ProductData[]> {
  try {
    const url = `${API_URL}/products?ids=${productIds.join(',')}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ProductsListResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.products;
    } else {
      throw new Error(result.message || 'Failed to fetch products by ids');
    }
  } catch (error) {
    console.error('Error fetching products by ids:', error);
    return [];
  }
}

// ========== واجهات (Interfaces) خاصة بـ Attributes ==========
interface AttributeValue {
  id: number;
  value: string;  // هذه تحمل اسم اللون (مثل "ازرق داكن") أو المقاس (مثل "M")
  meta: {
    color?: string; // الكود الخاص باللون (مثل "#252B42") - موجود فقط للألوان
  } | null;
}

interface Attribute {
  id: number;
  name: string;    // "اللون" أو "مقاس"
  slug: string;    // "color" أو "size"
  values: AttributeValue[];
}

interface AttributesResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    attributes: Attribute[];
  };
}

/**
 * دالة جلب خصائص المنتج (الألوان، المقاسات، إلخ)
 * @returns {Promise<Attribute[]>} قائمة الخصائص
 */
export async function getAttributes(): Promise<Attribute[]> {
  try {
    const response = await fetch(`${API_URL}/products/attributes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: AttributesResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.attributes;
    } else {
      throw new Error(result.message || 'Failed to fetch attributes');
    }
  } catch (error) {
    console.error('Error fetching attributes:', error);
    return [];
  }
}

/**
 * دالة جلب الألوان فقط من الـ Attributes
 * @returns {Promise<{name: string, code: string, id: number}[]>} قائمة الألوان (الاسم والكود)
 */
export async function getColors(): Promise<{ id: number; name: string; code: string }[]> {
  const attributes = await getAttributes();
  const colorAttribute = attributes.find(attr => attr.slug === 'color');
  
  if (colorAttribute && colorAttribute.values) {
    return colorAttribute.values.map(value => ({
      id: value.id,
      name: value.value,           // مثلاً: "ازرق داكن"
      code: value.meta?.color || '#000000'  // مثلاً: "#252B42"
    }));
  }
  
  return [];
}

/**
 * دالة جلب المقاسات فقط من الـ Attributes
 * @returns {Promise<{id: number, value: string}[]>} قائمة المقاسات
 */
export async function getSizes(): Promise<{ id: number; value: string }[]> {
  const attributes = await getAttributes();
  const sizeAttribute = attributes.find(attr => attr.slug === 'size');
  
  if (sizeAttribute && sizeAttribute.values) {
    return sizeAttribute.values.map(value => ({
      id: value.id,
      value: value.value // مثلاً: ["S", "M", "L", "XL"]
    }));
  }
  
  return [];
}

/**
 * ترميز اللون للـ URL
 */
export function encodeColor(colorCode: string): string {
  return encodeURIComponent(colorCode);
}

/**
 * فك ترميز اللون من الـ URL
 */
export function decodeColor(encodedColor: string): string {
  return decodeURIComponent(encodedColor);
}

/**
 * جلب جميع البراندات من الـ API
 */
export async function getBrands(): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/brands`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: any = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.brands || [];
    } else {
      throw new Error(result.message || 'Failed to fetch brands');
    }
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

// ========== دوال المنتج الفردي ==========
interface SingleProductResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    product: ProductData;
  };
}

/**
 * دالة جلب منتج معين بواسطة ID
 * @param productId رقم المنتج
 * @returns بيانات المنتج
 */
export async function getProductById(productId: string | number): Promise<ProductData | null> {
  try {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SingleProductResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.product;
    } else {
      throw new Error(result.message || 'Failed to fetch product');
    }
  } catch (error) {
    console.error('Error fetching product by id:', error);
    return null;
  }
}

/**
 * دالة لاستخراج الألوان من المتغيرات (variants)
 * @param product المنتج
 * @returns قائمة الألوان
 */
export function extractColorsFromProduct(product: ProductData): { name: string; code: string }[] {
  const colors: { name: string; code: string }[] = [];
  
  if (product.has_variants && product.variants?.length > 0) {
    product.variants.forEach((variant: any) => {
      if (variant.attributes) {
        variant.attributes.forEach((attr: any) => {
          if (attr.attribute_type?.name === 'اللون' && attr.meta?.color) {
            const exists = colors.some(c => c.name === attr.value);
            if (!exists) {
              colors.push({
                name: attr.value,
                code: attr.meta.color
              });
            }
          }
        });
      }
    });
  }
  
  return colors;
}

/**
 * دالة لاستخراج المقاسات من المتغيرات (variants)
 * @param product المنتج
 * @returns قائمة المقاسات
 */
export function extractSizesFromProduct(product: ProductData): string[] {
  const sizes: string[] = [];
  
  if (product.has_variants && product.variants?.length > 0) {
    product.variants.forEach((variant: any) => {
      if (variant.attributes) {
        variant.attributes.forEach((attr: any) => {
          if (attr.attribute_type?.name === 'مقاس') {
            const exists = sizes.includes(attr.value);
            if (!exists) {
              sizes.push(attr.value);
            }
          }
        });
      }
    });
  }
  
  return sizes;
}

/**
 * دالة لحساب السعر النهائي
 * @param product المنتج
 * @returns السعر النهائي
 */
export function getFinalPrice(product: ProductData): number {
  if (product.has_variants && product.variants?.[0]?.price_after_discount) {
    return product.variants[0].price_after_discount;
  }
  return product.pricing?.final_price || product.pricing?.price || 0;
}

/**
 * دالة لحساب السعر الأصلي (قبل الخصم)
 * @param product المنتج
 * @returns السعر الأصلي أو null إذا لا يوجد خصم
 */
export function getOriginalPrice(product: ProductData): number | null {
  if (product.pricing?.has_discount && product.pricing?.price) {
    return product.pricing.price;
  }
  return null;
}

/**
 * دالة لحساب نسبة الخصم
 * @param product المنتج
 * @returns نسبة الخصم أو null
 */
export function getDiscountPercentage(product: ProductData): number | null {
  if (product.pricing?.has_discount && product.pricing?.price && product.pricing?.final_price) {
    return Math.round(((product.pricing.price - product.pricing.final_price) / product.pricing.price) * 100);
  }
  return null;
}

// ========== واجهات (Interfaces) خاصة بالتقييمات ==========
interface ReviewsResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    average_rating: number;
    total_reviews: number;
    reviews: ReviewData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
      next_page: string | null;
      previous_page: string | null;
    };
  };
}

export interface ReviewData {
  id: number;
  rating: number;
  comment: string;
  user: {
    id: number;
    name: string;
    locale: string;
    email: string;
    verified: boolean;
    created_at: string;
    image: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * دالة جلب تقييمات المنتج
 * @param productId رقم المنتج
 * @param page رقم الصفحة
 * @param perPage عدد التقييمات في الصفحة
 * @returns بيانات التقييمات
 */
export async function getProductReviews(
  productId: number,
  page: number = 1,
  perPage: number = 10,
  sort?: string
): Promise<{
  reviews: ReviewData[];
  averageRating: number;
  totalReviews: number;
  pagination: any;
}> {
  try {
    let url = `${API_URL}/reviews/${productId}/show?page=${page}&per_page=${perPage}`;
    
    if (sort) {
      let sortParam = '';
      switch (sort) {
        case 'الأحدث':
          sortParam = '&sort=created_at&order=desc';
          break;
        case 'الأقدم':
          sortParam = '&sort=created_at&order=asc';
          break;
        case 'أعلى تقييم':
          sortParam = '&sort=rating&order=desc';
          break;
        case 'أقل تقييم':
          sortParam = '&sort=rating&order=asc';
          break;
        default:
          sortParam = '&sort=created_at&order=desc';
      }
      url += sortParam;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ReviewsResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return {
        reviews: result.data.reviews,
        averageRating: result.data.average_rating,
        totalReviews: result.data.total_reviews,
        pagination: result.data.pagination
      };
    } else {
      throw new Error(result.message || 'Failed to fetch reviews');
    }
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return {
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      pagination: null
    };
  }
}

/**
 * دالة مساعدة لجلب جميع بيانات الفلاتر مرة واحدة
 */
export async function getAllFiltersData() {
  const [colors, sizes, brands, categories] = await Promise.all([
    getColors(),
    getSizes(),
    getBrands(),
    getCategories()
  ]);

  return {
    colors,    // [{ id, name, code }]
    sizes,     // [{ id, value }]
    brands,    // [{ id, name, ... }]
    categories // [{ id, name, ... }]
  };
}