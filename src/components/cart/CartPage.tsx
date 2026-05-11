// components/cart/CartPage.tsx
"use client";

import { useState } from "react";
import { CartItemCard } from "./CartCard";
import { CartSummary } from "./CartSummary";
import { CartEmpty } from "./CartEmpty";

// واجهة بيانات المنتج في السلة
export interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  discount?: number;
}

// بيانات تجريبية - سيتم جلبها من الـ API لاحقاً
const defaultCartItems: CartItem[] = [
  {
    id: 1,
    name: "بلوزه حرير",
    brand: "Defacto",
    price: 371.56,
    originalPrice: 471.56,
    image: "/images/products/product1.png",
    color: "بيج",
    size: "L",
    quantity: 2,
    discount: 21,
  },
  {
    id: 2,
    name: "بلوزه حرير",
    brand: "Defacto",
    price: 371.56,
    originalPrice: 471.56,
    image: "/images/products/product1.png",
    color: "بيج",
    size: "L",
    quantity: 2,
    discount: 21,
  },
  {
    id: 3,
    name: "بلوزه حرير",
    brand: "Defacto",
    price: 371.56,
    originalPrice: 471.56,
    image: "/images/products/product1.png",
    color: "بيج",
    size: "L",
    quantity: 2,
    discount: 21,
  },
];

export function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(defaultCartItems);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);

  // تحديث الكمية
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // حذف منتج من السلة
  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  // حفظ للمرة القادمة
  const saveForLater = (id: number) => {
    // TODO: تنفيذ منطق الحفظ للمرة القادمة
    console.log("Save for later:", id);
  };

  // حساب المجموع الفرعي
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // حساب إجمالي الخصم
  const totalDiscount = cartItems.reduce(
    (sum, item) => sum + ((item.originalPrice || item.price) - item.price) * item.quantity,
    0
  );

  // تطبيق كود الخصم
  const applyPromoCode = (code: string, discount: number) => {
    setPromoCode(code);
    setPromoDiscount(discount);
  };

  // إلغاء كود الخصم
  const removePromoCode = () => {
    setPromoCode("");
    setPromoDiscount(0);
  };

  if (cartItems.length === 0) {
    return <CartEmpty />;
  }

  return (
    <div className=" bg-gradient-to-l min-h-[80vh] from-[#bdcbf12a] to-[#feecea3b]">
      <div className="container page-with-padding ">
      {/* عنوان الصفحة */}
      <PageHeader title="سلة التسوق" />

      <div className="grid grid-cols-1 lg:grid-cols-3 md:gap-8 gap-4">
        {/* قائمة المنتجات */}
        <div className="lg:col-span-2 space-y-4 bg-white rounded-[16px] p-4 mb-5">
          {cartItems.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
              onSaveForLater={saveForLater}
            />
          ))}
        </div>

        {/* ملخص الطلب */}
        <div className="lg:col-span-1">
          <CartSummary
            subtotal={subtotal}
            totalDiscount={totalDiscount}
            promoDiscount={promoDiscount}
            promoCode={promoCode}
            onApplyPromoCode={applyPromoCode}
            onRemovePromoCode={removePromoCode}
          />
        </div>
      </div>
    </div>
    </div>
  );
}

// مكون عنوان الصفحة
const PageHeader = ({ title }: { title: string }) => (
  <div className="mb-8 ">
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
      <Link href="/" className="hover:text-[#EC221F]">الرئيسية</Link>
      <ChevronRight className="w-4 h-4" />
      <span className="text-[#EC221F]">{title}</span>
    </div>
  </div>
);

// إضافة الـ import المطلوبة
import Link from "next/link";
import { ChevronRight } from "lucide-react";