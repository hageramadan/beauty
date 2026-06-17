// components/cart/CartSummary.tsx
"use client";

import Link from "next/link";
import { PromoCodeInput } from "./PromoCodeInput";

interface CartSummaryProps {
  subtotal: number;
  totalDiscount: number;
  promoDiscount: number;
  promoCode: string;
  deliveryFee: number;
  total: number;
  onApplyPromoCode: (code: string, discount: number) => void;
  onRemovePromoCode: () => void;
  isApplying?: boolean;
}

export function CartSummary({
  subtotal,
  totalDiscount,
  promoDiscount,
  promoCode,
  deliveryFee,
  total,
  onApplyPromoCode,
  onRemovePromoCode,
  isApplying = false,
}: CartSummaryProps) {
  const isDeliveryFree = deliveryFee === 0;
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 mb-5">
      <h1 className="text-2xl font-bold text-[#180100] pb-2">
        ملخص الطلب
      </h1>

      <div className="space-y-4 py-4">
        <SummaryRow label="المبلغ الإجمالي" value={subtotal} />
        
        {totalDiscount > 0 && (
          <SummaryRow label="خصم" value={-totalDiscount} isDiscount />
        )}
        
        {promoDiscount > 0 && (
          <SummaryRow label="خصم " value={-promoDiscount} isDiscount />
        )}
        
        <SummaryRow 
          label="رسوم التوصيل" 
          value={"--"} 
        />

        <div className="border-t border-gray-200 my-2" />

        <SummaryRow 
          label="الإجمالي" 
          value={total} 
          isTotal 
        />
      </div>

      {/* كود الخصم */}
      <PromoCodeInput
        onApply={onApplyPromoCode}
        onRemove={onRemovePromoCode}
        appliedCode={promoCode}
      />

      {/* زر إكمال الطلب */}
      <CheckoutButton />
    </div>
  );
}

const SummaryRow = ({ 
  label, 
  value, 
  isDiscount = false, 
  isTotal = false 
}: { 
  label: string; 
  value: number | string; 
  isDiscount?: boolean; 
  isTotal?: boolean;
}) => {
  const formatValue = (val: number | string) => {
    if (typeof val === "string") return val;
    if (isDiscount) return `-EGP ${Math.abs(val).toLocaleString()}`;
    return `EGP ${val.toLocaleString()}`;
  };

  const getValueClassName = () => {
    if (isDiscount) return "text-[#EC221F] font-bold";
    if (isTotal) return "text-[20px] font-bold text-[#EC221F]";
    return "font-semibold text-gray-800";
  };

  const getLabelClassName = () => {
    if (isTotal) return "text-lg font-bold text-gray-800";
    return "text-gray-600";
  };

  return (
    <div className="flex justify-between items-center">
      <span className={getLabelClassName()}>{label}</span>
      <span className={getValueClassName()}>{formatValue(value)}</span>
    </div>
  );
};

const CheckoutButton = () => (
  <Link href="/checkout" className="block w-full">
    <button className="w-full mt-5 bg-black text-white py-2 rounded-xl font-bold text-lg transition-all duration-300 shadow-md hover:shadow-lg hover:bg-gray-800">
      إكمال الطلب
    </button>
  </Link>
);