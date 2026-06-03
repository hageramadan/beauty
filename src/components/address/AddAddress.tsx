// components/address/AddAddress.tsx
"use client";

import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import { FaHome, FaBriefcase, FaMapMarkerAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LocationMap from "./LocationMap";
import { Address } from "@/types/address";

// تعريف نوع العنوان باللغة الإنجليزية
type AddressTypeValue = "home" | "work" | "other";

interface AddAddressProps {
  onClose: () => void;
  onSave: (address: any) => void;
  initialData?: Address;
  isEditing?: boolean;
}

export default function AddAddress({
  onClose,
  onSave,
  initialData,
  isEditing,
}: AddAddressProps) {
  // تحويل القيمة المخزنة من العربية إلى الإنجليزية إذا وجدت
  const getInitialAddressType = (type?: string): AddressTypeValue => {
    if (type === "home" || type === "work" || type === "other")
      return type as AddressTypeValue;
    if (type === "المنزل") return "home";
    if (type === "الدوام" || type === "العمل") return "work";
    if (type === "اخرى") return "other";
    return "home";
  };

  // إعداد البيانات الأولية من initialData (بيانات التعديل)
  const getInitialFormData = () => {
    if (initialData && isEditing) {
      return {
        street: initialData.street || "",
        city: initialData.city?.name || "",
        cityId: initialData.city?.id?.toString() || "",
        governorate: initialData.city?.governate?.name || "", // محاولة جلب المحافظة من البيانات
        building: initialData.building || "",
        apartmentNumber: initialData.apartment || "",
        floor: initialData.floor || "",
        addressType: getInitialAddressType(initialData.type),
        saveForFuture: true,
        latitude: initialData.latitude,
        longitude: initialData.longitude,
      };
    }
    return {
      street: "",
      city: "",
      cityId: "",
      governorate: "",
      building: "",
      apartmentNumber: "",
      floor: "",
      addressType: "home" as AddressTypeValue,
      saveForFuture: true,
      latitude: null,
      longitude: null,
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState<{
    street?: string;
    city?: string;
    governorate?: string;
    building?: string;
    apartment?: string;
    floor?: string;
    addressType?: string;
  }>({});

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    city?: string;
    governorate?: string;
  } | null>(
    initialData?.latitude && initialData?.longitude && isEditing
      ? {
          lat: parseFloat(initialData.latitude),
          lng: parseFloat(initialData.longitude),
          address: initialData.street || "",
          city: initialData.city?.name,
          governorate: "",
        }
      : null,
  );

  const [isExtracting, setIsExtracting] = useState(false);

  // --- حالات جديدة للـ API ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [governoratesFromAPI, setGovernoratesFromAPI] = useState<any[]>([]);
  const [citiesFromAPI, setCitiesFromAPI] = useState<any[]>([]);
  const [isLoadingGovernorates, setIsLoadingGovernorates] = useState(true);

  const API_URL = "https://dukanah.admin.t-carts.com/api";

  // --- جلب المحافظات من الـ API ---
  useEffect(() => {
    const fetchGovernorates = async () => {
      setIsLoadingGovernorates(true);
      try {
        const token = localStorage.getItem("auth_token");

        const response = await fetch(`${API_URL}/governates`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (
          result.result === true &&
          result.data &&
          Array.isArray(result.data.governates)
        ) {
          setGovernoratesFromAPI(result.data.governates);

          // استخراج جميع المدن من المحافظات
          const allCities: any[] = [];
          result.data.governates.forEach((gov: any) => {
            if (gov.cities && Array.isArray(gov.cities)) {
              allCities.push(
                ...gov.cities.map((city: any) => ({
                  ...city,
                  governorateId: gov.id,
                  governorateName: gov.name,
                })),
              );
            }
          });
          setCitiesFromAPI(allCities);

          // إذا كان في وضع التعديل، قم بتعيين المحافظة الصحيحة
          if (isEditing && initialData?.city?.name) {
            // البحث عن المحافظة التي تحتوي على هذه المدينة
            const foundGovernorate = result.data.governates.find((gov: any) =>
              gov.cities.some(
                (city: any) => city.name === initialData.city.name,
              ),
            );
            if (foundGovernorate) {
              setFormData((prev) => ({
                ...prev,
                governorate: foundGovernorate.name,
                cityId: initialData.city?.id?.toString() || "",
                city: initialData.city?.name || "",
              }));
            }
          }

          console.log("✅ تم تحميل المحافظات من API:", result.data.governates);
        } else {
          console.log("⚠️ استخدام المحافظات المحلية بدلاً من API");
        }
      } catch (error) {
        console.error("❌ خطأ في جلب المحافظات:", error);
        toast.error("فشل في تحميل المحافظات، سيتم استخدام القائمة المحلية");
      } finally {
        setIsLoadingGovernorates(false);
      }
    };

    fetchGovernorates();
  }, [isEditing, initialData]);

  // دالة للحصول على قائمة المحافظات (من API أو المحلية)
  const getGovernoratesList = () => {
    if (governoratesFromAPI.length > 0) {
      return governoratesFromAPI.map((gov: any) => gov.name);
    }
    return governorates;
  };

  // دالة للحصول على قائمة المدن بناءً على المحافظة المختارة
  const getCitiesListByGovernorate = (governorateName: string) => {
    if (citiesFromAPI.length > 0 && governorateName) {
      const governorate = governoratesFromAPI.find(
        (gov: any) => gov.name === governorateName,
      );
      if (governorate && governorate.cities) {
        return governorate.cities;
      }
    }
    return [];
  };

  // دالة للحصول على city_id من المدينة المختارة
  const getCityIdFromName = (
    cityName: string,
    governorateName: string,
  ): string => {
    const cities = getCitiesListByGovernorate(governorateName);
    const city = cities.find((c: any) => c.name === cityName);
    return city?.id?.toString() || "";
  };

  // دالة لعرض النص العربي للمستخدم
  const getAddressTypeDisplay = (type: AddressTypeValue): string => {
    switch (type) {
      case "home":
        return "المنزل";
      case "work":
        return "الدوام";
      case "other":
        return "اخرى";
      default:
        return "المنزل";
    }
  };

  // دالة للحصول على الأيقونة المناسبة
  const getAddressTypeIcon = (type: AddressTypeValue) => {
    switch (type) {
      case "home":
        return <FaHome className="inline ml-1" />;
      case "work":
        return <FaBriefcase className="inline ml-1" />;
      case "other":
        return <FaMapMarkerAlt className="inline ml-1" />;
      default:
        return <FaHome className="inline ml-1" />;
    }
  };

  // قائمة المحافظات المصرية (احتياطي)
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

  // دالة التحقق من صحة الحقول (جميع الحقول مطلوبة ما عدا الخريطة)
  const validateForm = (): boolean => {
    const newErrors: {
      street?: string;
      city?: string;
      governorate?: string;
      building?: string;
      apartment?: string;
      floor?: string;
      addressType?: string;
    } = {};

    // التحقق من عنوان الشارع (مطلوب)
    if (!formData.street.trim()) {
      newErrors.street = "عنوان التوصيل المفصل مطلوب";
    } else if (formData.street.trim().length < 5) {
      newErrors.street = "عنوان التوصيل قصير جداً (على الأقل 5 حروف)";
    }

    // التحقق من المحافظة (مطلوب)
    if (!formData.governorate) {
      newErrors.governorate = "الرجاء اختيار المحافظة";
    }

    // التحقق من المدينة (مطلوب)
    if (!formData.city) {
      newErrors.city = "الرجاء اختيار المدينة";
    }

    // التحقق من اسم المبنى (مطلوب)
    if (!formData.building.trim()) {
      newErrors.building = "اسم المبنى مطلوب";
    }

    // التحقق من رقم الشقة (مطلوب)
    if (!formData.apartmentNumber.trim()) {
      newErrors.apartment = "رقم الشقة مطلوب";
    }

    // التحقق من رقم الدور (مطلوب)
    if (!formData.floor.trim()) {
      newErrors.floor = "رقم الدور مطلوب";
    }

    // التحقق من نوع العنوان (مطلوب)
    if (!formData.addressType) {
      newErrors.addressType = "الرجاء اختيار تصنيف العنوان";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    setIsExtracting(true);

    const { city, governorate } = await reverseGeocode(
      location.lat,
      location.lng,
    );
    setIsExtracting(false);

    setSelectedLocation({
      ...location,
      city,
      governorate,
    });

    setFormData((prev) => ({
      ...prev,
      street: location.address,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
      city: city || prev.city,
      governorate: governorate || prev.governorate,
      cityId: getCityIdFromName(city, governorate),
    }));
  };

  const reverseGeocode = async (
    lat: number,
    lng: number,
  ): Promise<{ city: string; governorate: string }> => {
    let city = "";
    let governorate = "";

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ar`,
      );
      const data = await response.json();

      if (data && data.address) {
        const address = data.address;
        if (address.state) governorate = address.state;
        else if (address.province) governorate = address.province;
        else if (address.region) governorate = address.region;

        if (address.city) city = address.city;
        else if (address.town) city = address.town;
        else if (address.village) city = address.village;
        else if (address.suburb) city = address.suburb;

        governorate = governorate.replace("محافظة ", "");
        city = city.replace("مدينة ", "");
      }
    } catch (error) {
      console.error("❌ خطأ في استخراج الموقع:", error);
    }

    return { city, governorate };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) toast.error(firstError);
      return;
    }

    setIsSubmitting(true);

    try {
      const cityId =
        formData.cityId ||
        getCityIdFromName(formData.city, formData.governorate);

      if (!cityId) {
        toast.error("لم يتم العثور على المدينة في النظام");
        setIsSubmitting(false);
        return;
      }

      const addressData = {
        city_id: parseInt(cityId),
        street: formData.street,
        building: formData.building,
        floor: formData.floor,
        apartment: formData.apartmentNumber,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        type: formData.addressType,
      };

      const token = localStorage.getItem("auth_token");

      let url = `${API_URL}/addresses`;
      let method = "POST";

      if (isEditing && initialData?.id) {
        url = `${API_URL}/addresses/${initialData.id}/update`;
        method = "POST";
        (addressData as any)._method = "put";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(addressData),
      });

      const result = await response.json();

      if (result.result === true) {
        toast.success(
          isEditing ? "تم تحديث العنوان بنجاح" : "تم إضافة العنوان بنجاح",
        );
        onSave(result.data);
        onClose();
      } else {
        throw new Error(result.message || "حدث خطأ في حفظ العنوان");
      }
    } catch (error) {
      console.error("❌ خطأ في حفظ العنوان:", error);
      toast.error(
        error instanceof Error ? error.message : "حدث خطأ في حفظ العنوان",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingGovernorates) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontSize: "14px",
            padding: "12px 16px",
            borderRadius: "8px",
            direction: "rtl",
          },
          success: { style: { background: "#10B981", color: "white" } },
          error: { style: { background: "#EF4444", color: "white" } },
        }}
      />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
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

          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/2 space-y-5 order-2 md:order-1">
                {/* عنوان التوصيل - Required */}
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
                    className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none ${
                      errors.street ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.street && (
                    <p className="text-red-500 text-xs mt-1">{errors.street}</p>
                  )}
                </div>

                {/* المحافظة والمدينة - Required */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      المحافظة <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.governorate || ""}
                      onValueChange={(value) => {
                        // معالجة القيمة null
                        const selectedValue = value || "";
                        setFormData({
                          ...formData,
                          governorate: selectedValue,
                          city: "",
                          cityId: "",
                        });
                        clearFieldError("governorate");
                      }}
                    >
                      <SelectTrigger
                        className={`w-full ${errors.governorate ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="اختر المحافظة" />
                      </SelectTrigger>
                      <SelectContent>
                        {getGovernoratesList().map((gov) => (
                          <SelectItem key={gov} value={gov}>
                            {gov}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.governorate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.governorate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      المدينة <span className="text-red-500">*</span>
                    </label>
                    {/* المدينة */}
                    <Select
                      value={formData.city || ""}
                      onValueChange={(value) => {
                        // معالجة القيمة null
                        const selectedValue = value || "";
                        const cityId = getCityIdFromName(
                          selectedValue,
                          formData.governorate,
                        );
                        setFormData({
                          ...formData,
                          city: selectedValue,
                          cityId,
                        });
                        clearFieldError("city");
                      }}
                      disabled={!formData.governorate}
                    >
                      <SelectTrigger
                        className={`w-full ${errors.city ? "border-red-500" : ""}`}
                      >
                        <SelectValue
                          placeholder={
                            !formData.governorate
                              ? "اختر المحافظة أولاً"
                              : "اختر المدينة"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {getCitiesListByGovernorate(formData.governorate).map(
                          (city: any) => (
                            <SelectItem key={city.id} value={city.name}>
                              {city.name}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>
                </div>

                {/* اسم المبنى - Required */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    اسم المبنى <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.building}
                    onChange={(e) => {
                      setFormData({ ...formData, building: e.target.value });
                      clearFieldError("building");
                    }}
                    placeholder="اسم المبنى"
                    className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none ${
                      errors.building ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.building && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.building}
                    </p>
                  )}
                </div>

                {/* رقم الشقة ورقم الدور - Required */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      رقم الشقة <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.apartmentNumber}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          apartmentNumber: e.target.value,
                        });
                        clearFieldError("apartment");
                      }}
                      placeholder="رقم الشقة"
                      className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none ${
                        errors.apartment ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.apartment && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.apartment}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      رقم الدور <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.floor}
                      onChange={(e) => {
                        setFormData({ ...formData, floor: e.target.value });
                        clearFieldError("floor");
                      }}
                      placeholder="رقم الدور"
                      className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none ${
                        errors.floor ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.floor && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.floor}
                      </p>
                    )}
                  </div>
                </div>

                {/* تصنيف العنوان - Required */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    تصنيف العنوان <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {(["home", "work", "other"] as AddressTypeValue[]).map(
                      (typeValue) => (
                        <button
                          key={typeValue}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              addressType: typeValue,
                            });
                            clearFieldError("addressType");
                          }}
                          className={`flex items-center gap-2 p-2 md:px-5 md:py-3 border font-semibold rounded-[8px] cursor-pointer ${
                            formData.addressType === typeValue
                              ? "border-black bg-[#D2D6DB3D]"
                              : "border-gray-300"
                          }`}
                        >
                          <span
                            className={
                              formData.addressType === typeValue
                                ? "text-black"
                                : "text-gray-700"
                            }
                          >
                            {getAddressTypeIcon(typeValue)}
                            {getAddressTypeDisplay(typeValue)}
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                  {errors.addressType && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.addressType}
                    </p>
                  )}
                </div>

                {/* Save for future - Optional */}
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
                    disabled={isSubmitting}
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-[8px] hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "جاري الحفظ..."
                      : isEditing
                        ? "تحديث"
                        : "حفظ"}
                  </button>
                </div>
              </div>

              {/* الخريطة - Optional (بدون علامة نجمة) */}
              <div className="lg:w-1/2 order-1 md:order-2">
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <FaLocationDot className="text-red-500" />
                  اختر موقعك على الخريطة (اختياري)
                </label>
                <LocationMap
                  onLocationSelect={handleLocationSelect}
                  initialLocation={
                    formData.latitude && formData.longitude
                      ? {
                          lat: parseFloat(formData.latitude),
                          lng: parseFloat(formData.longitude),
                        }
                      : undefined
                  }
                />
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
