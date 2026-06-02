// components/contact/PhoneInput.tsx
"use client";

import { useState } from "react";
import ReactCountryFlag from "react-country-flag";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface PhoneInputProps {
  value: string;  // القيمة كاملة (مثال: "+966512345678")
  onChange: (phone: string, countryCode: string) => void;
  required?: boolean;
}

interface CountryCode {
  code: string;
  country: string;
  countryCode: string;
  placeholder: string;
  example: string;
}

// تم إزالة pattern و maxLength من هنا، لأن الفالديشن أصبح عاماً
const countryCodes: CountryCode[] = [
  { 
    code: "+20", 
    country: "مصر", 
    countryCode: "EG",
    placeholder: "01X XXX XXXX",
    example: "012 3456 7890"
  },
  { 
    code: "+966", 
    country: "السعودية", 
    countryCode: "SA",
    placeholder: "05X XXX XXXX",
    example: "05 1234 5678"
  },
  { 
    code: "+964", 
    country: "العراق", 
    countryCode: "IQ",
    placeholder: "07XX XXX XXXX",
    example: "0770 123 4567"
  },
  { 
    code: "+971", 
    country: "الإمارات", 
    countryCode: "AE",
    placeholder: "05X XXX XXXX",
    example: "050 123 4567"
  },
];

// الفالديشن الجديد كما طلبتِ
const GLOBAL_PHONE_REGEX = /^\+?[0-9]{10,15}$/;

export default function PhoneInput({ value, onChange, required = false }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
  const [error, setError] = useState("");

  const handleCountrySelect = (countryCode: string | null) => {
    if (!countryCode) return;
    const country = countryCodes.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      // الحصول على الرقم الحالي (بدون مسافات) وإزالة الكود القديم
      const currentPhoneNumber = getPhoneNumberOnly(value);
      const fullPhoneWithoutSpaces = `${country.code}${currentPhoneNumber}`;
      
      // إرسال الرقم الجديد ورمز الدولة
      onChange(currentPhoneNumber, country.code);
      
      // التحقق من صحة الرقم الكامل الجديد
      validateFullPhone(fullPhoneWithoutSpaces);
      setError("");
    }
  };

  // دالة لاستخراج الرقم فقط بدون رمز الدولة
  const getPhoneNumberOnly = (fullPhone: string): string => {
    // إزالة أي رمز دولة موجود (تبدأ بـ + وتنتهي بمسافة أو نهاية النص)
    let phoneNumber = fullPhone.replace(/^\+\d+\s?/, "");
    // إزالة المسافات
    phoneNumber = phoneNumber.replace(/\s/g, "");
    return phoneNumber;
  };

  // دالة التحقق باستخدام الـ Regex الجديد
  const validateFullPhone = (fullPhone: string): boolean => {
    // إزالة المسافات قبل التحقق
    const phoneWithoutSpaces = fullPhone.replace(/\s/g, "");
    const isValid = GLOBAL_PHONE_REGEX.test(phoneWithoutSpaces);
    
    if (!isValid && phoneWithoutSpaces.length > 0) {
      setError(`رقم الهاتف غير صحيح. يجب أن يكون من 10 إلى 15 رقماً، ويمكن أن يبدأ بعلامة "+" اختيارياً.`);
    } else {
      setError("");
    }
    return isValid;
  };

  // تنسيق الرقم للعرض (حسب كل دولة) - هذه الوظيفة بقيت كما هي للعرض فقط
  const formatPhoneNumber = (number: string, countryCode: string): string => {
    const cleanNumber = number.replace(/\s/g, "");
    
    if (countryCode === "+20" && cleanNumber.length > 3) {
      return `${cleanNumber.slice(0, 3)} ${cleanNumber.slice(3)}`;
    }
    if (countryCode === "+966" && cleanNumber.length > 1) {
      if (cleanNumber.length <= 1) return cleanNumber;
      if (cleanNumber.length <= 5) return `${cleanNumber.slice(0, 1)} ${cleanNumber.slice(1)}`;
      return `${cleanNumber.slice(0, 1)} ${cleanNumber.slice(1, 5)} ${cleanNumber.slice(5)}`;
    }
    if (countryCode === "+964" && cleanNumber.length > 3) {
      return `${cleanNumber.slice(0, 3)} ${cleanNumber.slice(3, 6)} ${cleanNumber.slice(6)}`;
    }
    if (countryCode === "+971" && cleanNumber.length > 2) {
      return `${cleanNumber.slice(0, 2)} ${cleanNumber.slice(2, 6)} ${cleanNumber.slice(6)}`;
    }
    
    return cleanNumber;
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let number = e.target.value;
    
    // إزالة أي أحرف غير رقمية (مع السماح بـ + لأن الفالديشن الجديد يدعمها)
    // لكن هنا نمنع إدخال + لأن المستخدم سيختارها من القائمة، لتجنب الـ +
    // نسمح فقط بالأرقام لأن رمز البلد سيتم إضافته تلقائياً
    number = number.replace(/[^\d]/g, "");
    
    // تحديد حد أقصى (مثلاً 15 رقم كحد أقصى حسب الـ Regex)
    const MAX_DIGITS = 15;
    if (number.length > MAX_DIGITS) {
      number = number.slice(0, MAX_DIGITS);
    }
    
    // تنسيق الرقم للعرض
    const formattedNumber = formatPhoneNumber(number, selectedCountry.code);
    
    // بناء الرقم الكامل (مع رمز البلد) للتحقق
    const fullPhone = `${selectedCountry.code}${number}`;
    
    // التحقق من صحة الرقم الكامل باستخدام الـ Regex الجديد
    const isValid = validateFullPhone(fullPhone);
    
    // إرسال الرقم (بدون رمز الدولة) ورمز الدولة
    onChange(number, selectedCountry.code);
    
    // إذا كان الرقم فارغاً، نزيل الخطأ
    if (number.length === 0) {
      setError("");
    }
  };

  // استخراج الرقم بدون الكود للعرض
  const displayNumber = getPhoneNumberOnly(value);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        رقم الهاتف {required && <span className="text-[#EC221F]">*</span>}
      </label>
      
      <div>
        <div className="relative flex flex-row-reverse items-stretch">
          <div className="flex-1 relative">
            <input
              type="tel"
              value={displayNumber}
              onChange={handleNumberChange}
              required={required}
              placeholder={selectedCountry.placeholder}
              className={`w-full h-12 px-4 py-2 border rounded-l-xl rounded-r-none focus:outline-none focus:ring-1 transition bg-white text-left
                ${error 
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                  : "border-gray-200 focus:border-[#EC221F] focus:ring-[#EC221F]"
                }`}
              style={{
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
              dir="ltr"
            />
          </div>
          
          <div className="relative">
            <Select value={selectedCountry.code} onValueChange={handleCountrySelect}>
              <SelectTrigger 
                className="!h-12 bg-white border-gray-200 rounded-r-xl rounded-l-none border-l-0 focus:ring-0 focus:border-gray-200"
                style={{ 
                  borderTopLeftRadius: 0, 
                  borderBottomLeftRadius: 0,
                  boxShadow: 'none'
                }}
              >
                <div className="flex items-center gap-2">
                  <ReactCountryFlag
                    countryCode={selectedCountry.countryCode}
                    svg
                    style={{
                      width: '24px',
                      height: '16px',
                      objectFit: 'cover'
                    }}
                    title={selectedCountry.country}
                  />
                  <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
                </div>
              </SelectTrigger>
              <SelectContent 
                align="center" 
                side="bottom" 
                sideOffset={4}
                className="min-w-[200px]"
              >
                {countryCodes.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-3 py-1">
                      <ReactCountryFlag
                        countryCode={country.countryCode}
                        svg
                        style={{
                          width: '24px',
                          height: '16px',
                          objectFit: 'cover'
                        }}
                        title={country.country}
                      />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-gray-800">{country.country}</span>
                        <span className="text-xs text-gray-500">{country.code}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {error && (
          <p className="text-xs text-red-500 mt-1 text-left">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}