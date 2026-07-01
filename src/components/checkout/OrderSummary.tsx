"use client";

import { OrderSummaryProps } from "./types";

export default function OrderSummary({ 
  cartItems, 
  cartSummary,
  deliveryMethod 
}: OrderSummaryProps) {
  
  // استخراج القيم من الكائن الملخص مع قيم افتراضية للخصائص الاختيارية
  const { 
    subtotal, 
    discount, 
    total, 
    deliveryFee, 
    couponDiscount = 0,
    couponCode = ""
  } = cartSummary;

  // حساب نسبة الخصم
  const discountPercentage = discount > 0 && (subtotal + discount) > 0
    ? Math.round((discount / (subtotal + discount)) * 100)
    : 0;

  // ✅ تحديد عرض رسوم التوصيل
  const getDeliveryFeeDisplay = () => {
    // إذا لم يتم اختيار طريقة توصيل
    if (!deliveryMethod) {
      return "--";
    }
    
    // إذا كان استلام من الفرع
    if (deliveryMethod === "pickup") {
      return "--";
    }
    
    // ✅ إذا كانت deliveryFee غير محددة (undefined أو null) - لم يتم جلب البيانات بعد
    if (deliveryFee === undefined || deliveryFee === null) {
      return "--";
    }
    
    // ✅ إذا كانت رسوم التوصيل 0 (مجاني)
    if (deliveryFee === 0) {
      return "--";
    }
    
    // رسوم توصيل مدفوعة
    return `EGP ${deliveryFee.toFixed(2)}`;
  };

  // ✅ تحديد ما إذا كانت رسوم التوصيل غير محددة
  const isDeliveryFeeUndefined = () => {
    if (!deliveryMethod || deliveryMethod === "pickup") return true;
    return deliveryFee === undefined || deliveryFee === null;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-20 mb-4 md:mb-0">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        ملخص الطلب
      </h2>

      {/* تفاصيل الأسعار باستخدام cartSummary */}
      <div className="space-y-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">المبلغ الإجمالي</span>
          <span className="text-gray-800">EGP {subtotal?.toFixed(2) || "0.00"}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span>خصم</span>
              <span className="text-xs ">(-{discountPercentage}%)</span>
            </span>
            <span className="text-[#FF7700]">-EGP {discount.toFixed(2)}</span>
          </div>
        )}
        
        {/* ✅ عرض خصم الكوبون إذا كان موجود */}
        {couponDiscount > 0 && couponCode && (
          <div className="flex justify-between text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span>خصم </span>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                {couponCode}
              </span>
            </span>
            <span className="text-[#FF7700]">-EGP {couponDiscount.toFixed(2)}</span>
          </div>
        )}
        
        {/* 🔥 رسوم التوصيل - عرض -- إذا لم يتم تحديد مدينة بعد */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">رسوم التوصيل</span>
          <span className={`font-semibold ${
            isDeliveryFeeUndefined() ? "text-gray-400" : "text-gray-800"
          }`}>
            {getDeliveryFeeDisplay()}
          </span>
        </div>
        
        <div className="flex justify-between pt-3 border-t border-gray-200">
          <span className="text-lg font-bold text-gray-900">الإجمالي</span>
          <span className="text-lg font-bold ">
            EGP {total?.toFixed(2) || "0.00"}
          </span>
        </div>
      </div>
    </div>
  );
}