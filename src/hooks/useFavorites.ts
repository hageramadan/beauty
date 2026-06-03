// src/hooks/useFavorites.ts
import { useFavoritesContext } from '@/contexts/FavoritesContext';
import { transformFavoriteToProductCard } from '@/services/favorites';
import type { FavoriteProduct } from '@/services/favorites';

// إعادة تصدير hook للاستخدام السهل
export const useFavorites = useFavoritesContext;

// إعادة تصدير الدوال المساعدة
export { transformFavoriteToProductCard };
export type { FavoriteProduct };