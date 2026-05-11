// components/cart/PromoCodeInput.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface PromoCodeInputProps {
  onApply: (code: string, discount: number) => void;
  onRemove: () => void;
  appliedCode: string;
}

// قائمة أكواد الخصم المتاحة
const AVAILABLE_CODES: Record<string, number> = {
  "DISCOUNT20": 20, // 20% off
  "SAVE100": 100,   // 100 EGP off
  "WELCOME50": 50,  // 50 EGP off
};

export function PromoCodeInput({ onApply, onRemove, appliedCode }: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleApply = () => {
    if (!code.trim()) {
      setError("الرجاء إدخال كود الخصم");
      return;
    }

    const discount = AVAILABLE_CODES[code.toUpperCase()];
    
    if (discount) {
      onApply(code.toUpperCase(), discount);
      setError("");
      setCode("");
    } else {
      setError("كود الخصم غير صحيح");
    }
  };

  const handleRemove = () => {
    onRemove();
    setCode("");
    setError("");
  };

  if (appliedCode) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between bg-green-50 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-sm">✓ تم تطبيق الكود</span>
            <span className="text-green-800 font-semibold text-sm">{appliedCode}</span>
          </div>
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
          placeholder="أدخل كود الخصم..."
          className="flex-1 px-2 md:px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EC221F] focus:border-transparent text-sm"
        />
        <button
          onClick={handleApply}
          disabled={!code}
          className="px-3 md:px-5 md:py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          تطبيق
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}