// components/address/AddAddress.tsx
"use client";

import { useState } from "react";
import { IoClose } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import {
  FaHome,
  FaBriefcase,
  FaMapMarkerAlt,
 
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LocationMap from "./LocationMap";

interface AddAddressProps {
  onClose: () => void;
  onSave: (address: any) => void;
  initialData?: any;
  isEditing?: boolean;
}

export default function AddAddress({
  onClose,
  onSave,
  initialData,
  isEditing,
}: AddAddressProps) {
  const [formData, setFormData] = useState(() => ({
    street: initialData?.street || "",
    city: initialData?.city || "",
    governorate: initialData?.governorate || "",
    apartmentNumber: initialData?.apartmentNumber || "",
    floor: initialData?.floor || "",
    addressType: initialData?.type || "المنزل",
    saveForFuture: true,
    latitude: initialData?.latitude || null,
    longitude: initialData?.longitude || null,
  }));

  const [errors, setErrors] = useState<{
    street?: string;
    city?: string;
    governorate?: string;
    location?: string;
  }>({});

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    city?: string;
    governorate?: string;
  } | null>(
    initialData?.latitude && initialData?.longitude
      ? {
          lat: initialData.latitude,
          lng: initialData.longitude,
          address: initialData.street || "",
          city: initialData.city,
          governorate: initialData.governorate,
        }
      : null,
  );

  const [extractedInfo, setExtractedInfo] = useState<{
    city: string;
    governorate: string;
  } | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // قائمة المحافظات المصرية
  const governorates = [
    "القاهرة",
    "الجيزة",
    "الإسكندرية",
    "الدقهلية",
    "الشرقية",
    "المنوفية",
    "القليوبية",
    "البحيرة",
    "كفر الشيخ",
    "الغربية",
    "الأقصر",
    "أسوان",
    "سوهاج",
    "قنا",
    "المنيا",
    "بني سويف",
    "الفيوم",
    "دمياط",
    "بورسعيد",
    "السويس",
    "الإسماعيلية",
    "مطروح",
    "شمال سيناء",
    "جنوب سيناء",
    "البحر الأحمر",
    "الوادي الجديد",
  ];

  // قائمة المدن والمناطق
  const cities = [
    "مدينة نصر",
    "الهرم",
    "الشيخ زايد",
    "6 أكتوبر",
    "المقطم",
    "المعادي",
    "الجيزة",
    "وسط البلد",
    "مصر الجديدة",
    "حلوان",
    "العاصمة الإدارية",
    "الرحاب",
    "مدينتي",
    "التجمع الخامس",
    "شبرا",
    "روض الفرج",
    "الزمالك",
    "مصر القديمة",
    "العباسية",
    "بني سويف",
    "المنيا",
    "أسيوط",
    "سوهاج",
    "قنا",
    "الأقصر",
    "أسوان",
    "طنطا",
    "المحلة",
    "دمنهور",
    "المنصورة",
    "الزقازيق",
    "بورفؤاد",
  ];

  // دالة التحقق من صحة الحقول
  const validateForm = (): boolean => {
    const newErrors: {
      street?: string;
      city?: string;
      governorate?: string;
      location?: string;
    } = {};

    // التحقق من اختيار موقع من الخريطة
    if (!selectedLocation) {
      newErrors.location = "الرجاء اختيار موقع من الخريطة";
    }

    // التحقق من عنوان التوصيل المفصل
    if (!formData.street.trim()) {
      newErrors.street = "عنوان التوصيل المفصل مطلوب";
    } else if (formData.street.trim().length < 5) {
      newErrors.street = "عنوان التوصيل قصير جداً (على الأقل 5 حروف)";
    }

    // التحقق من المحافظة
    if (!formData.governorate) {
      newErrors.governorate = "الرجاء اختيار المحافظة";
    }

    // التحقق من المدينة
    if (!formData.city) {
      newErrors.city = "الرجاء اختيار المدينة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // دالة مسح خطأ حقل معين عند التعديل
  const clearFieldError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLocationSelect = async (location: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    console.log("📍 تم اختيار موقع من الخريطة:", location);
    console.log("🌐 العنوان الخام:", location.address);

    // مسح خطأ الموقع عند الاختيار
    clearFieldError("location");

    setIsExtracting(true);

    // استخراج المدينة والمحافظة من العنوان باستخدام الـ coordinates
    const { city, governorate } = await reverseGeocode(
      location.lat,
      location.lng,
    );

    console.log("🏙️ النتيجة النهائية:", { city, governorate });

    setIsExtracting(false);

    setExtractedInfo({ city, governorate });

    const selectedLoc = {
      ...location,
      city,
      governorate,
    };

    setSelectedLocation(selectedLoc);
    setFormData({
      ...formData,
      street: location.address,
      latitude: location.lat,
      longitude: location.lng,
      city: city || formData.city,
      governorate: governorate || formData.governorate,
    });
  };

  // دالة عكس الإحداثيات باستخدام API أفضل
  const reverseGeocode = async (
    lat: number,
    lng: number,
  ): Promise<{ city: string; governorate: string }> => {
    let city = "";
    let governorate = "";

    console.log("🔍 جاري استخراج الموقع من الإحداثيات:", lat, lng);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ar`,
      );
      const data = await response.json();

      console.log("📦 بيانات API:", data);

      if (data && data.address) {
        const address = data.address;

        console.log("🏠 تفاصيل العنوان:", address);

        // استخراج المحافظة
        if (address.state) {
          governorate = address.state;
          console.log("✅ المحافظة من state:", governorate);
        } else if (address.province) {
          governorate = address.province;
          console.log("✅ المحافظة من province:", governorate);
        } else if (address.region) {
          governorate = address.region;
          console.log("✅ المحافظة من region:", governorate);
        }

        // استخراج المدينة
        if (address.city) {
          city = address.city;
          console.log("✅ المدينة من city:", city);
        } else if (address.town) {
          city = address.town;
          console.log("✅ المدينة من town:", city);
        } else if (address.village) {
          city = address.village;
          console.log("✅ المدينة من village:", city);
        } else if (address.suburb) {
          city = address.suburb;
          console.log("✅ المدينة من suburb:", city);
        } else if (address.county) {
          city = address.county;
          console.log("✅ المدينة من county:", city);
        }

        // إذا لم يتم العثور على محافظة، نحاول من display_name
        if (!governorate && data.display_name) {
          for (const gov of governorates) {
            if (data.display_name.includes(gov)) {
              governorate = gov;
              console.log("✅ المحافظة من display_name:", governorate);
              break;
            }
          }
        }

        // إذا لم يتم العثور على مدينة، نحاول من display_name
        if (!city && data.display_name) {
          for (const c of cities) {
            if (data.display_name.includes(c) && c !== governorate) {
              city = c;
              console.log("✅ المدينة من display_name:", city);
              break;
            }
          }
        }
      }

      // تنظيف الأسماء
      governorate = cleanGovernorateName(governorate);
      city = city.replace("محافظة ", "").replace("مدينة ", "");
    } catch (error) {
      console.error("❌ خطأ في استخراج الموقع:", error);
    }

    // إذا كانت المحافظة موجودة والمدينة فاضية، نستخدم المحافظة
    if (governorate && !city) {
      city = governorate;
      console.log("🔄 تم تعيين المدينة كمحافظة:", city);
    }

    console.log("📊 النتيجة النهائية:", { city, governorate });
    return { city, governorate };
  };

  // دالة لتنظيف أسماء المحافظات
  const cleanGovernorateName = (name: string): string => {
    if (!name) return "";

    let cleaned = name.replace("محافظة ", "").replace("Governorate", "");

    const nameMap: { [key: string]: string } = {
      Cairo: "القاهرة",
      Giza: "الجيزة",
      Alexandria: "الإسكندرية",
      "Beni Suef": "بني سويف",
      "Beni Souef": "بني سويف",
      Minya: "المنيا",
      Sohag: "سوهاج",
      Qena: "قنا",
      Luxor: "الأقصر",
      Aswan: "أسوان",
    };

    if (nameMap[cleaned]) {
      cleaned = nameMap[cleaned];
    }

    for (const gov of governorates) {
      if (cleaned.includes(gov) || gov.includes(cleaned)) {
        return gov;
      }
    }

    return cleaned;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    if (!validateForm()) {
      // عرض أول خطأ موجود
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    console.log("💾 حفظ العنوان:", {
      street: formData.street,
      city: formData.city,
      governorate: formData.governorate,
      apartmentNumber: formData.apartmentNumber,
      floor: formData.floor,
      addressType: formData.addressType,
      latitude: formData.latitude,
      longitude: formData.longitude,
    });

    const addressToSave = {
      ...(initialData?.id && { id: initialData.id }),
      ...formData,
      type: formData.addressType,
    };
    
    
    
    onSave(addressToSave);
  };

  return (
    <>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontSize: '14px',
            padding: '12px 16px',
            borderRadius: '8px',
            direction: 'rtl',
          },
          success: {
            style: {
              background: '#10B981',
              color: 'white',
            },
            iconTheme: {
              primary: 'white',
              secondary: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: 'white',
            },
            iconTheme: {
              primary: 'white',
              secondary: '#EF4444',
            },
          },
        }}
      />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? "تعديل العنوان" : "إضافة عنوان جديد"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-full"
            >
              <IoClose size={24} />
            </button>
          </div>

          {/* Form - تنسيق مرن: جنب بعض في الكبير، فوق بعض في الصغير */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* الجانب الأيسر: الفورم */}
              <div className="lg:w-1/2 space-y-5 order-2 md:order-1">
                {/* عنوان التوصيل */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    عنوان التوصيل المفصل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => {
                      setFormData({ ...formData, street: e.target.value });
                      clearFieldError("street");
                    }}
                    placeholder="اسم الشارع بالتفصيل"
                    className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors ${
                      errors.street ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.street && (
                    <p className="text-red-500 text-xs mt-1">{errors.street}</p>
                  )}
                </div>

                {/* City and Governorate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      المحافظة <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.governorate}
                      onValueChange={(value) => {
                        console.log("📍 تم تغيير المحافظة يدوياً إلى:", value);
                        setFormData({ ...formData, governorate: value });
                        clearFieldError("governorate");
                      }}
                    >
                      <SelectTrigger className={`w-full ${errors.governorate ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="اختر المحافظة" />
                      </SelectTrigger>
                      <SelectContent>
                        {governorates.map((gov) => (
                          <SelectItem key={gov} value={gov}>
                            {gov}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.governorate && (
                      <p className="text-red-500 text-xs mt-1">{errors.governorate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      المدينة <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => {
                        console.log("🏙️ تم تغيير المدينة يدوياً إلى:", value);
                        setFormData({ ...formData, city: value });
                        clearFieldError("city");
                      }}
                    >
                      <SelectTrigger className={`w-full ${errors.city ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="اختر المدينة" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>
                </div>

                {/* Apartment and Floor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      رقم الشقة (اختياري)
                    </label>
                    <input
                      type="text"
                      value={formData.apartmentNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          apartmentNumber: e.target.value,
                        })
                      }
                      placeholder="رقم الشقة"
                      className="w-full px-4 py-2 border border-gray-300 rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      رقم الدور (اختياري)
                    </label>
                    <input
                      type="text"
                      value={formData.floor}
                      onChange={(e) =>
                        setFormData({ ...formData, floor: e.target.value })
                      }
                      placeholder="رقم الدور"
                      className="w-full px-4 py-2 border border-gray-300 rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none"
                    />
                  </div>
                </div>

                {/* Address Type */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    تصنيف العنوان
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {["المنزل", "الدوام", "اخرى"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, addressType: type })
                        }
                        className={`flex items-center gap-2 p-2 md:px-5 md:py-3 border font-semibold rounded-[8px] cursor-pointer ${
                          formData.addressType === type
                            ? "border-black bg-[#D2D6DB3D]"
                            : "border-gray-300"
                        }`}
                      >
                        <span
                          className={
                            formData.addressType === type
                              ? "text-black"
                              : "text-gray-700"
                          }
                        >
                          {type === "المنزل" && (
                            <FaHome className="inline ml-1" />
                          )}
                          {type === "الدوام" && (
                            <FaBriefcase className="inline ml-1" />
                          )}
                          {type === "اخرى" && (
                            <FaMapMarkerAlt className="inline ml-1" />
                          )}
                          {type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save for future */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.saveForFuture}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        saveForFuture: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-black bg-black rounded"
                  />
                  <span className="text-gray-700">
                    حفظ العنوان للطلبات القادمة
                  </span>
                </label>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-[8px] hover:bg-gray-50 transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-black text-white rounded-[8px] hover:bg-gray-800 transition"
                  >
                    {isEditing ? "تحديث" : "حفظ"}
                  </button>
                </div>
              </div>

              {/* الجانب الأيمن: الخريطة */}
              <div className="lg:w-1/2 order-1 md:order-2">
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <FaLocationDot className="text-red-500" />
                  اختر موقعك على الخريطة <span className="text-red-500">*</span>
                </label>
                <LocationMap
                  onLocationSelect={handleLocationSelect}
                  initialLocation={
                    formData.latitude && formData.longitude
                      ? { lat: formData.latitude, lng: formData.longitude }
                      : undefined
                  }
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                )}
                {isExtracting && (
                  <div className="mt-2 text-center text-sm text-blue-600">
                    جاري استخراج المدينة والمحافظة...
                  </div>
                )}
                {selectedLocation && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-[8px]">
                    <p className="text-sm text-green-800 font-medium">
                      العنوان المختار من الخريطة:
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {selectedLocation.address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}