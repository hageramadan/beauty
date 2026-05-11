// components/checkout/ContactInfoForm.tsx
"use client";

import { ContactInfoFormProps } from "./types";

export default function ContactInfoForm({ formData, onFormChange }: ContactInfoFormProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-[#EC221F] rounded-full"></span>
        معلومات الاتصال
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الاسم الكامل <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => onFormChange({ fullName: e.target.value })}
            placeholder="أدخل اسمك الكامل"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EC221F] focus:border-transparent transition"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            رقم الجوال <span className="text-red-500">*</span>
          </label>
          <input
          dir="rtl"
            type="tel"
            value={formData.phone}
            onChange={(e) => onFormChange({ phone: e.target.value })}
            placeholder="رقم الجوال"
            className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EC221F] focus:border-transparent transition"
          />
        </div>
        
      
      </div>
    </div>
  );
}