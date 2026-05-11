// components/checkout/PaymentMethodForm.tsx
"use client";

import { CreditCard, Banknote, Wallet } from "lucide-react";
import { PaymentMethodFormProps } from "./types";

const paymentMethods = [
  { value: "card", label: "مدى", icon: CreditCard },
  { value: "credit", label: "بطاقة ائتمان", icon: CreditCard },
  { value: "cod", label: "الدفع عند التسليم", icon: Banknote },
  { value: "wallet", label: "محفظة", icon: Wallet },
];

export default function PaymentMethodForm({ paymentMethod, onPaymentMethodChange }: PaymentMethodFormProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-[#EC221F] rounded-full"></span>
        طريقة الدفع
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <label
              key={method.value}
              className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition ${
                paymentMethod === method.value
                  ? "border-[#EC221F] bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                checked={paymentMethod === method.value}
                onChange={() => onPaymentMethodChange(method.value)}
                className="w-4 h-4 text-[#EC221F] focus:ring-[#EC221F]"
              />
              <Icon className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-800">{method.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}