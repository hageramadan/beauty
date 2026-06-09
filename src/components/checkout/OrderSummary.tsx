// components/checkout/OrderSummary.tsx
"use client";


import { OrderSummaryProps } from "./types";

export default function OrderSummary({ 
  cartItems, 
  cartSummary,
  deliveryMethod 
}: OrderSummaryProps) {
  
  // استخراج القيم من الكائن الملخص
  const { subtotal, discount, total, deliveryFee } = cartSummary;

  // حساب نسبة الخصم (اختياري، لمزيد من المعلومات)
  const discountPercentage = discount > 0 && (subtotal + discount) > 0
    ? Math.round((discount / (subtotal + discount)) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-20 mb-4 md:mb-0">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
    
        ملخص الطلب
      </h2>

      

      {/* تفاصيل الأسعار باستخدام cartSummary */}
      <div className="space-y-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">المبلغ الإجمالي</span>
          <span className="text-gray-800">EGP {subtotal.toFixed(2)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span>خصم</span>
              <span className="text-xs ">(-{discountPercentage}%)</span>
            </span>
            <span className="text-[#EC221F]">-EGP {discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">رسوم التوصيل</span>
          <span className="text-gray-800">
            {deliveryMethod === "delivery" ? ` ${deliveryFee > 0 ? `EGP ${deliveryFee.toFixed(2)}` : 'مجاني'}` : "مجاني"}
          </span>
        </div>
        
        <div className="flex justify-between pt-3 border-t border-gray-200">
          <span className="text-lg font-bold text-gray-900">الإجمالي</span>
          <span className="text-xl font-bold ">EGP {total.toFixed(2)}</span>
        </div>
      </div>

   
    </div>
  );
}