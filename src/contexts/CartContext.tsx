// src/contexts/CartContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  CartData,
  AddToCartPayload,
} from '@/services/cart';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: CartData | null;
  isLoading: boolean;
  isMutating: boolean;
  itemCount: number;
  totalAmount: number;
  addItem: (productId: number, quantity: number, variantId?: number | null) => Promise<boolean>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<boolean>;
  removeItem: (cartItemId: number) => Promise<boolean>;
  clearAllItems: () => Promise<boolean>;
  refetchCart: () => Promise<void>;
  updateCart: (newCart: CartData | null) => void; // ✅ إضافة هذه الدالة
  getItemQuantity: (productId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const isMountedRef = useRef(true);

  const fetchCartData = useCallback(async (showLoading: boolean = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await getCart();
      
      if (response.result === true && response.data && response.data.cart) {
        const cartData = response.data.cart;
        
        if (isMountedRef.current) {
          setCart(cartData);
          setItemCount(cartData.total_quantity || 0);
          setTotalAmount(cartData.total_amount || 0);
        }
      } else {
        if (isMountedRef.current) {
          setCart(null);
          setItemCount(0);
          setTotalAmount(0);
        }
      }
    } catch (error) {
      console.error('خطأ في جلب السلة:', error);
    } finally {
      if (showLoading && isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // ✅ دالة تحديث السلة يدوياً
  const updateCart = useCallback((newCart: CartData | null) => {
    if (!isMountedRef.current) return;
    
    setCart(newCart);
    
    if (newCart) {
      setItemCount(newCart.total_quantity || 0);
      setTotalAmount(newCart.total_amount || 0);
    } else {
      setItemCount(0);
      setTotalAmount(0);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchCartData();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchCartData]);

  const addItem = async (productId: number, quantity: number, variantId?: number | null): Promise<boolean> => {
    setIsMutating(true);
    
    try {
      const payload: AddToCartPayload = {
        product_id: productId,
        quantity: quantity,
        product_variant_id: variantId || null,
      };
      
      const response = await addToCart(payload);
      
      if (response.result === true && response.data) {
        toast.success(response.message || 'تم إضافة المنتج إلى السلة');
        await fetchCartData(false);
        return true;
      } else {
        toast.error(response.message || 'فشل في إضافة المنتج');
        return false;
      }
    } catch (error) {
      toast.error('حدث خطأ في إضافة المنتج');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number): Promise<boolean> => {
    setIsMutating(true);
    
    try {
      const response = await updateCartItemQuantity(cartItemId, quantity);
      
      if (response.result === true && response.data) {
        toast.success('تم تحديث الكمية بنجاح');
        await fetchCartData(false);
        return true;
      } else {
        toast.error(response.message || 'فشل في تحديث الكمية');
        return false;
      }
    } catch (error) {
      toast.error('حدث خطأ في تحديث الكمية');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const removeItem = async (cartItemId: number): Promise<boolean> => {
    setIsMutating(true);
    
    try {
      const response = await removeFromCart(cartItemId);
      
      if (response.result === true) {
        toast.success('تم إزالة المنتج من السلة');
        await fetchCartData(false);
        return true;
      } else {
        toast.error(response.message || 'فشل في إزالة المنتج');
        return false;
      }
    } catch (error) {
      toast.error('حدث خطأ في إزالة المنتج');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const clearAllItems = async (): Promise<boolean> => {
    setIsMutating(true);
    
    try {
      const response = await clearCart();
      
      if (response.result === true) {
        toast.success('تم تفريغ السلة بنجاح');
        await fetchCartData(false);
        return true;
      } else {
        toast.error(response.message || 'فشل في تفريغ السلة');
        return false;
      }
    } catch (error) {
      toast.error('حدث خطأ في تفريغ السلة');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const getItemQuantity = (productId: number): number => {
    if (!cart || !cart.items) return 0;
    
    const item = cart.items.find(item => item.product.id === productId);
    return item?.quantity || 0;
  };

  const value = {
    cart,
    isLoading,
    isMutating,
    itemCount,
    totalAmount,
    addItem,
    updateQuantity,
    removeItem,
    clearAllItems,
    refetchCart: () => fetchCartData(true),
    updateCart, // ✅ أضف هذه الدالة هنا
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// ✅ هذا السطر مهم جداً - تصدير الـ hook
export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}