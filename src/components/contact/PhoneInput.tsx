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
  value: string;
  onChange: (phone: string) => void;
  required?: boolean;
}

interface CountryCode {
  code: string;
  country: string;
  countryCode: string;
  placeholder: string;
  example: string;
  pattern: RegExp;
  maxLength: number;
}

const countryCodes: CountryCode[] = [
  { 
    code: "+20", 
    country: "مصر", 
    countryCode: "EG",
    placeholder: "1XX XXX XXXX",
    example: "012 3456 7890",
    pattern: /^1[0-9]{9}$/,
    maxLength: 10
  },
  { 
    code: "+966", 
    country: "السعودية", 
    countryCode: "SA",
    placeholder: "5X XXX XXXX",
    example: "05 1234 5678",
    pattern: /^5[0-9]{8}$/,
    maxLength: 9
  },
  { 
    code: "+964", 
    country: "العراق", 
    countryCode: "IQ",
    placeholder: "7XX XXX XXXX",
    example: "0770 123 4567",
    pattern: /^7[0-9]{9}$/,
    maxLength: 10
  },
  { 
    code: "+971", 
    country: "الإمارات", 
    countryCode: "AE",
    placeholder: "5X XXX XXXX",
    example: "050 123 4567",
    pattern: /^5[0-9]{8}$/,
    maxLength: 9
  },
];

export default function PhoneInput({ value, onChange, required = false }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
  const [error, setError] = useState("");

  // تعديل الدالة لاستقبال string | null
  const handleCountrySelect = (countryCode: string | null) => {
    if (!countryCode) return; // التعامل مع حالة null
    const country = countryCodes.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      // تحديث الرقم مع الكود الجديد
      const phoneNumber = value.replace(/^\+\d+/, "").trim();
      onChange(`${country.code} ${phoneNumber}`);
      setError("");
    }
  };

  const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
    const number = phone.replace(countryCode, "").trim().replace(/\s/g, "");
    const country = countryCodes.find(c => c.code === countryCode);
    return country ? country.pattern.test(number) : number.length >= 8;
  };

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
    
    // إزالة أي أحرف غير رقمية
    number = number.replace(/[^\d]/g, "");
    
    // تحديد الحد الأقصى لطول الرقم حسب الدولة
    if (number.length > selectedCountry.maxLength) {
      number = number.slice(0, selectedCountry.maxLength);
    }
    
    // تنسيق الرقم
    const formattedNumber = formatPhoneNumber(number, selectedCountry.code);
    const fullPhone = `${selectedCountry.code} ${formattedNumber}`;
    onChange(fullPhone);
    
    // التحقق من صحة الرقم
    if (number.length > 0 && !validatePhoneNumber(fullPhone, selectedCountry.code)) {
      setError(`رقم الهاتف غير صحيح. يجب أن يكون ${selectedCountry.maxLength} أرقام. مثال: ${selectedCountry.example}`);
    } else {
      setError("");
    }
  };

  // استخراج الرقم بدون الكود
  const displayNumber = value.replace(selectedCountry.code, "").trim();

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        رقم الهاتف {required && <span className="text-[#EC221F]">*</span>}
      </label>
      
      <div>
        {/* حاوية الـ Select والـ Input كقطعة واحدة */}
        <div className="relative flex flex-row-reverse items-stretch">
              {/* حقل إدخال رقم الهاتف - على اليسار */}
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
          {/* Select الخاص بالدولة - على اليمين */}
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
        
        {/* نص توضيحي أسفل الحقل */}
       
        
        {/* رسالة الخطأ */}
        {error && (
          <p className="text-xs text-red-500 mt-1 text-left">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}