// components/checkout/DeliveryAddressForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Home, MapPin, Building, Save, ChevronDown, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Address } from "@/types/address";

interface SavedAddress {
  id: number;
  street: string;
  city: string;
  governorate: string;
  building: string;
  floor: string;
  apartment: string;
  isDefault?: boolean;
  latitude?: string | null;
  longitude?: string | null;
}

interface DeliveryAddressFormProps {
  show: boolean;
  addressData: {
    street: string;
    city: string;
    governorate: string;
    buildingNo: string;
    floorNo: string;
    apartmentNo: string;
  };
  onAddressChange: (data: any) => void;
  onAddressSaved?: (address: any) => void;
}

// قائمة المحافظات المصرية (احتياطي في حال فشل الـ API)
const EGYPT_GOVERNORATES = [
  "القاهرة",
  "الإسكندرية",
  "الجيزة",
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

export default function DeliveryAddressForm({
  show,
  addressData,
  onAddressChange,
  onAddressSaved,
}: DeliveryAddressFormProps) {
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<number | null>(null);
  const [saveForFuture, setSaveForFuture] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // حالات للمحافظات والمدن من الـ API
  const [governoratesFromAPI, setGovernoratesFromAPI] = useState<any[]>([]);
  const [isLoadingGovernorates, setIsLoadingGovernorates] = useState(true);
  
  // استخدام useRef لمنع الحفظ المتكرر
  const hasAutoSavedRef = useRef(false);
  
  const API_URL = 'https://dukanah.admin.t-carts.com/api';

  // دالة للحصول على قيمة الحقل مع تعيين القيمة الافتراضية "1" إذا كان فارغاً
  const getFieldValue = (value: string): string => {
    return value && value.trim() !== "" ? value.trim() : "1";
  };

  // جلب العناوين المحفوظة من الـ API
  const fetchSavedAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_URL}/addresses`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      
      if (result.result === true && Array.isArray(result.data)) {
        const addresses: SavedAddress[] = result.data.map((addr: Address) => ({
          id: addr.id,
          street: addr.street,
          city: addr.city.name,
          governorate: "",
          building: addr.building,
          floor: addr.floor,
          apartment: addr.apartment,
          latitude: addr.latitude,
          longitude: addr.longitude,
        }));
        
        setSavedAddresses(addresses);
      }
    } catch (error) {
      console.error("❌ خطأ في جلب العناوين:", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // جلب المحافظات والمدن من الـ API
  const [citiesFromAPI, setCitiesFromAPI] = useState<any[]>([]);
  
  const fetchGovernorates = async () => {
    setIsLoadingGovernorates(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_URL}/governates`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      const result = await response.json();
      
      if (result.result === true && result.data && Array.isArray(result.data.governates)) {
        setGovernoratesFromAPI(result.data.governates);
        
        // استخراج جميع المدن من المحافظات مع ربطها بالمحافظة
        const allCities: any[] = [];
        result.data.governates.forEach((gov: any) => {
          if (gov.cities && Array.isArray(gov.cities)) {
            gov.cities.forEach((city: any) => {
              allCities.push({
                id: city.id,
                name: city.name,
                delivery_fee: city.delivery_fee,
                governorateId: gov.id,
                governorateName: gov.name,
              });
            });
          }
        });
        setCitiesFromAPI(allCities);
      }
    } catch (error) {
      console.error("❌ خطأ في جلب المحافظات:", error);
    } finally {
      setIsLoadingGovernorates(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchGovernorates();
      fetchSavedAddresses();
      // إعادة تعيين الحالات عند فتح الفورم
      hasAutoSavedRef.current = false;
      setAddressSaved(false);
      setSaveForFuture(false);
      setSaveError(null);
    }
  }, [show]);

  // دالة للتحقق من اكتمال جميع الحقول المطلوبة
  const isAllFieldsFilled = () => {
    return (
      addressData.governorate &&
      addressData.city &&
      addressData.street &&
      addressData.buildingNo &&
      addressData.floorNo &&
      addressData.apartmentNo
    );
  };

  // دالة لحفظ العنوان في الـ API
  const saveAddressToAPI = async () => {
    setSaveError(null);
    
    // التحقق من وجود المحافظة والمدينة
    if (!addressData.governorate) {
      setSaveError("الرجاء اختيار المحافظة");
      return null;
    }
    
    if (!addressData.city) {
      setSaveError("الرجاء اختيار المدينة");
      return null;
    }
    
    setIsSavingAddress(true);
    
    try {
      // البحث عن city_id
      const foundCity = citiesFromAPI.find(
        (c) => c.name === addressData.city && c.governorateName === addressData.governorate
      );
      
      if (!foundCity) {
        console.error("لم يتم العثور على المدينة");
        setSaveError("لم يتم العثور على المدينة في النظام");
        return null;
      }
      
      const token = localStorage.getItem('auth_token');
      
      // استخدام getFieldValue للتعامل مع الحقول الفارغة (إرسال "1" إذا كانت فارغة)
      const addressToSave = {
        city_id: foundCity.id,
        street: getFieldValue(addressData.street),
        building: getFieldValue(addressData.buildingNo),
        floor: getFieldValue(addressData.floorNo),
        apartment: getFieldValue(addressData.apartmentNo),
        latitude: null,
        longitude: null,
        type: 'home',
      };
      
      console.log("📤 إرسال البيانات للحفظ:", addressToSave);
      
      const response = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(addressToSave),
      });
      
      const result = await response.json();
      
      if (result.result === true) {
        console.log("✅ تم حفظ العنوان بنجاح:", result.data);
        // إعادة جلب العناوين لتحديث القائمة
        await fetchSavedAddresses();
        setAddressSaved(true);
        setSaveForFuture(true);
        // استدعاء callback إذا وجد
        if (onAddressSaved) {
          onAddressSaved(result.data);
        }
        return result.data;
      } else {
        console.error("❌ فشل في حفظ العنوان:", result.message);
        setSaveError(result.message || "حدث خطأ في حفظ العنوان");
        return null;
      }
    } catch (error) {
      console.error("❌ خطأ في حفظ العنوان:", error);
      setSaveError("حدث خطأ في الاتصال بالخادم");
      return null;
    } finally {
      setIsSavingAddress(false);
    }
  };

  // دالة للحفظ اليدوي عند الضغط على الزر
  const handleManualSave = async () => {
    if (useSavedAddress) {
      setSaveError("لا يمكن حفظ عنوان مستخدم بالفعل");
      return;
    }
    
    if (!addressData.governorate || !addressData.city) {
      setSaveError("الرجاء اختيار المحافظة والمدينة أولاً");
      return;
    }
    
    await saveAddressToAPI();
  };

  // مراقبة التغييرات في الحقول لحفظ العنوان تلقائياً (اختياري)
  useEffect(() => {
    // لا تقم بالحفظ التلقائي إذا:
    // - تم استخدام عنوان محفوظ
    // - تم الحفظ بالفعل
    // - جاري الحفظ حالياً
    // - الحقول غير مكتملة
    if (useSavedAddress || addressSaved || isSavingAddress || !isAllFieldsFilled()) {
      return;
    }
    
    // منع الحفظ المتكرر
    if (hasAutoSavedRef.current) return;
    
    // تأخير الحفظ للتأكد من استقرار البيانات
    const timer = setTimeout(async () => {
      if (isAllFieldsFilled() && !useSavedAddress && !addressSaved) {
        hasAutoSavedRef.current = true;
        await saveAddressToAPI();
      }
    }, 2000); // تأخير 2 ثانية
    
    return () => clearTimeout(timer);
  }, [addressData, useSavedAddress, addressSaved]);

  if (!show) return null;

  // الحصول على قائمة المحافظات من API أو القائمة المحلية
  const getGovernoratesList = () => {
    if (governoratesFromAPI.length > 0) {
      return governoratesFromAPI.map((gov: any) => gov.name);
    }
    return EGYPT_GOVERNORATES;
  };

  // الحصول على قائمة المدن حسب المحافظة
  const getCitiesListByGovernorate = (governorateName: string) => {
    if (citiesFromAPI.length > 0 && governorateName) {
      return citiesFromAPI
        .filter((city: any) => city.governorateName === governorateName)
        .map((city: any) => city.name);
    }
    return [];
  };

  // تحديث البيانات
  const updateAddress = (field: string, value: string | null) => {
    // عند التعديل اليدوي، إعادة تعيين حالة الحفظ التلقائي
    if (!useSavedAddress) {
      hasAutoSavedRef.current = false;
      setAddressSaved(false);
      setSaveForFuture(false);
      setSaveError(null);
    }
    onAddressChange({ ...addressData, [field]: value || "" });
  };

  // تحميل عنوان محفوظ
  const handleSelectSavedAddress = (addressId: number) => {
    setSelectedSavedAddressId(addressId);
    const address = savedAddresses.find((a) => a.id === addressId);
    if (address) {
      // البحث عن المحافظة الصحيحة للمدينة
      const foundCity = citiesFromAPI.find((c) => c.name === address.city);
      const governorateName = foundCity?.governorateName || "";
      
      onAddressChange({
        street: address.street,
        city: address.city,
        governorate: governorateName,
        buildingNo: address.building,
        floorNo: address.floor,
        apartmentNo: address.apartment,
      });
      
      setAddressSaved(true);
      setSaveForFuture(true);
      setSaveError(null);
    }
  };

  // الحصول على المدن المتاحة حسب المحافظة المختارة
  const availableCities = getCitiesListByGovernorate(addressData.governorate);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        عنوان التوصيل
      </h2>
      
      {/* نموذج إدخال العنوان */}
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* المحافظة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المحافظة <span className="text-[#EC221F]">*</span>
            </label>
            <Select
              value={addressData.governorate}
              onValueChange={(value) => updateAddress("governorate", value)}
              disabled={isLoadingGovernorates || useSavedAddress}
            >
              <SelectTrigger className="w-full bg-white rounded-[8px] focus:ring-0 focus:border-black">
                <SelectValue placeholder={isLoadingGovernorates ? "جاري التحميل..." : "اختر المحافظة"} />
              </SelectTrigger>
              <SelectContent>
                {getGovernoratesList().map((gov) => (
                  <SelectItem key={gov} value={gov}>
                    {gov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* المدينة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المدينة <span className="text-[#EC221F]">*</span>
            </label>
            <Select
              value={addressData.city}
              onValueChange={(value) => updateAddress("city", value)}
              disabled={!addressData.governorate || isLoadingGovernorates || useSavedAddress}
            >
              <SelectTrigger className="w-full bg-white rounded-[8px] focus:ring-0 focus:border-black">
                <SelectValue placeholder={!addressData.governorate ? "اختر المحافظة أولاً" : "اختر المدينة"} />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* اسم الشارع */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الشارع
            </label>
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={addressData.street}
                onChange={(e) => updateAddress("street", e.target.value)}
                placeholder="مثال: شارع النيل، شارع التسعين"
                disabled={useSavedAddress}
                className="w-full pr-10 text-sm leading-normal p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
           
          </div>
        </div>

        {/* رقم الشقة ورقم الدور */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الشقة
            </label>
            <div className="relative">
              <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={addressData.apartmentNo}
                onChange={(e) => updateAddress("apartmentNo", e.target.value)}
                placeholder="رقم الشقة"
                disabled={useSavedAddress}
                className="w-full pr-10 p-3 text-sm border border-gray-200 rounded-xl focus:border-black focus:outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الدور
            </label>
            <div className="relative">
              <Home className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={addressData.floorNo}
                onChange={(e) => updateAddress("floorNo", e.target.value)}
                placeholder="رقم الدور"
                disabled={useSavedAddress}
                className="w-full pr-10 p-3 text-sm border border-gray-200 rounded-xl focus:border-black focus:outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          
          </div>
        </div>

        {/* زر حفظ العنوان */}
        {!useSavedAddress && !addressSaved && (
          <div className="pt-2 mt-3">
            <button
              onClick={handleManualSave}
              disabled={isSavingAddress || !addressData.governorate || !addressData.city}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingAddress ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>حفظ العنوان</span>
                </>
              )}
            </button>
            {(!addressData.governorate || !addressData.city) && (
              <p className="text-xs text-yellow-600 mt-2 text-center">
                * الرجاء اختيار المحافظة والمدينة أولاً
              </p>
            )}
          </div>
        )}

        {/* رسالة الخطأ */}
        {saveError && (
          <div className="pt-2 mt-2">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm font-medium text-red-800">{saveError}</p>
            </div>
          </div>
        )}

        {/* رسالة تأكيد الحفظ */}
        {addressSaved && !useSavedAddress && (
          <div className="pt-2 mt-2">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <Save className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-blue-800">
                تم حفظ عنوانك بنجاح ويمكنك استخدامه في المرات القادمة
              </p>
            </div>
          </div>
        )}
      </>

      {/* خط فاصل - يظهر فقط إذا كان هناك عناوين محفوظة */}
      {savedAddresses.length > 0 && (
        <>
          <div className="border-t border-gray-200 my-4 relative">
            <span className="absolute bottom-[-10px] left-[50%] bg-white px-2">أو</span>
          </div>
          
          {/* خيار استخدام عنوان محفوظ */}
          <div className="mb-5 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 cursor-pointer mb-3">
              <Checkbox
                id="useSavedAddress"
                checked={useSavedAddress}
                onCheckedChange={(checked) => {
                  setUseSavedAddress(checked as boolean);
                  if (!checked) {
                    setSelectedSavedAddressId(null);
                    hasAutoSavedRef.current = false;
                    setAddressSaved(false);
                    setSaveForFuture(false);
                    setSaveError(null);
                    // reset form
                    onAddressChange({
                      street: "",
                      city: "",
                      governorate: "",
                      buildingNo: "",
                      floorNo: "",
                      apartmentNo: "",
                    });
                  }
                }}
                className="border-gray-300 data-[state=checked]:bg-[#EC221F] data-[state=checked]:border-[#EC221F]"
              />
              <Label
                htmlFor="useSavedAddress"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                اختر من العناوين المحفوظة
              </Label>
            </div>

            {/* العناوين المحفوظة */}
            {useSavedAddress && (
              <div className="mt-3 space-y-3 pr-2">
                {isLoadingAddresses ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">جاري تحميل العناوين...</p>
                  </div>
                ) : savedAddresses.length > 0 ? (
                  savedAddresses.map((address) => {
                    // البحث عن المحافظة الصحيحة للمدينة
                    const foundCity = citiesFromAPI.find((c) => c.name === address.city);
                    const governorateName = foundCity?.governorateName || "";
                    
                    return (
                      <label
                        key={address.id}
                        className={`flex items-start gap-1 md:gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedSavedAddressId === address.id
                            ? "border-[#EC221F] bg-red-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                        onClick={() => handleSelectSavedAddress(address.id)}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          value={address.id}
                          checked={selectedSavedAddressId === address.id}
                          onChange={() => handleSelectSavedAddress(address.id)}
                          className="mt-0.5 w-4 h-4 text-[#EC221F] focus:ring-[#EC221F] border-gray-300"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-gray-800">
                              {address.street}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {address.building && `مبنى ${address.building} `}
                            {address.floor && `، دور ${address.floor} `}
                            {address.apartment && `، شقة ${address.apartment}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {address.city}، {governorateName}
                          </p>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 mt-2 text-center py-4">
                    لا توجد عناوين محفوظة. قم بإضافة عنوان جديد أولاً.
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}