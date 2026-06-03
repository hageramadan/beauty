// src/services/favorites.ts

export interface FavoriteProduct {
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
    image: string;
  };
  brand: string | null;
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
  variants: any | null;
  quantity: number;
  images: string[];
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  next_page: number | null;
  previous_page: number | null;
}

interface FavoritesResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    favorites: FavoriteProduct[];
    pagination: PaginationData;
  };
}

interface SingleFavoriteResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: FavoriteProduct;
}

const API_URL = 'https://dukanah.admin.t-carts.com/api';

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const getHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const fetchFavorites = async (page: number = 1, perPage: number = 10): Promise<FavoritesResponse> => {
  try {
    const response = await fetch(`${API_URL}/user-favorites?page=${page}&per_page=${perPage}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ خطأ في جلب المفضلة:', error);
    throw error;
  }
};

export const addToFavorites = async (productId: string | number): Promise<SingleFavoriteResponse> => {
  try {
    const response = await fetch(`${API_URL}/user-favorites`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ product_id: productId }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ خطأ في إضافة المنتج إلى المفضلة:', error);
    throw error;
  }
};

export const removeFromFavorites = async (productId: string | number): Promise<{ result: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/user-favorites/${productId}/delete`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ product_id: productId }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ خطأ في حذف المنتج من المفضلة:', error);
    throw error;
  }
};

export const clearAllFavorites = async (): Promise<boolean> => {
  try {
    let allFavorites: FavoriteProduct[] = [];
    let currentPage = 1;
    let lastPage = 1;
    
    do {
      const response = await fetchFavorites(currentPage, 50);
      if (response.result && response.data && response.data.favorites) {
        const validFavorites = response.data.favorites.filter(item => item && item.id);
        allFavorites = [...allFavorites, ...validFavorites];
        lastPage = response.data.pagination?.last_page || 1;
        currentPage++;
      } else {
        break;
      }
    } while (currentPage <= lastPage);
    
    const deletePromises = allFavorites.map(item => removeFromFavorites(item.id));
    const results = await Promise.all(deletePromises);
    
    return results.every(result => result.result === true);
  } catch (error) {
    console.error('❌ خطأ في حذف جميع المفضلة:', error);
    return false;
  }
};

export const transformFavoriteToProductCard = (favorite: FavoriteProduct | null | undefined) => {
  // التحقق من وجود favorite و id
  if (!favorite || !favorite.id) {
    console.warn('⚠️ تحويل منتج غير صالح:', favorite);
    return {
      id: '0',
      name: 'منتج غير معروف',
      price: 0,
      originalPrice: undefined,
      discount: undefined,
      image: '/images/placeholder.png',
      hoverImage: '/images/placeholder.png',
      href: '/',
      rating: 0,
      reviewsCount: 0,
      isBestSeller: false,
      colors: [
        { color: "#252B42", name: "أزرق داكن" },
        { color: "#E77C40", name: "برتقالي" },
        { color: "#23856D", name: "أخضر" },
      ],
      addedDate: new Date().toISOString(),
    };
  }

  return {
    id: favorite.id.toString(),
    name: favorite.name || 'منتج بدون اسم',
    price: favorite.pricing?.final_price || 0,
    originalPrice: favorite.pricing?.has_discount ? favorite.pricing.price : undefined,
    discount: favorite.pricing?.discount_value || undefined,
    image: (favorite.images && favorite.images[0]) ? favorite.images[0] : '/images/placeholder.png',
    hoverImage: (favorite.images && favorite.images[1]) ? favorite.images[1] : (favorite.images && favorite.images[0]) ? favorite.images[0] : '/images/placeholder.png',
    href: `/product/${favorite.id}`,
    rating: favorite.avg_rating || 0,
    reviewsCount: favorite.total_reviews || 0,
    isBestSeller: false,
    colors: [
      { color: "#252B42", name: "أزرق داكن" },
      { color: "#E77C40", name: "برتقالي" },
      { color: "#23856D", name: "أخضر" },
    ],
    addedDate: new Date().toISOString(),
  };
};