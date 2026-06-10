"use client";

import { useState, useEffect, useRef } from "react";
import { Home, MapPin, Building, Save } from "lucide-react";
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
  onAddressSelected?: (addressId: number) => void;
}

// قائمة المحافظات المصرية (احتياطي في حال فشل الـ API)
const EGYPT_GOVERNORATES = [
  "القاهرة", "الإسكندرية", "الجيزة", "الدقهلية", "الشرقية",
  "المنوفية", "القليوبية", "البحيرة", "كفر الشيخ", "الغربية",
  "الأقصر", "أسوان", "سوهاج", "قنا", "المنيا", "بني سويف",
  "الفيوم", "دمياط", "بورسعيد", "السويس", "الإسماعيلية",
  "مطروح", "شمال سيناء", "جنوب سيناء", "البحر الأحمر", "الوادي الجديد",
];

interface Governorate {
  id: string;
  name: string;
  provider: string;
}

interface City {
  id: string;
  name: string;
  provider: string;
  delivery_fee: number;
}

export default function DeliveryAddressForm({
  show,
  addressData,
  onAddressChange,
  onAddressSaved,
  onAddressSelected,
}: DeliveryAddressFormProps) {
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<number | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingGovernorates, setIsLoadingGovernorates] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  
  const hasAutoSavedRef = useRef(false);
  const API_URL = 'https://dukanah.admin.t-carts.com/api';

  const getFieldValue = (value: string): string => {
    return value && value.trim() !== "" ? value.trim() : "1";
  };

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
          governorate: addr.city.governate?.name || "",
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

  // ✅ جلب المحافظات فقط
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
        setGovernorates(result.data.governates);
        console.log("✅ تم تحميل المحافظات:", result.data.governates);
      } else {
        console.log("⚠️ استخدام المحافظات الاحتياطية");
        // تحويل المحافظات الاحتياطية إلى نفس الهيكل
        setGovernorates(EGYPT_GOVERNORATES.map((name, index) => ({
          id: String(index + 1),
          name,
          provider: "local"
        })));
      }
    } catch (error) {
      console.error("❌ خطأ في جلب المحافظات:", error);
      // استخدام المحافظات الاحتياطية
      setGovernorates(EGYPT_GOVERNORATES.map((name, index) => ({
        id: String(index + 1),
        name,
        provider: "local"
      })));
    } finally {
      setIsLoadingGovernorates(false);
    }
  };

  // ✅ جلب المدن عند اختيار المحافظة باستخدام الـ endpoint الجديد
  const fetchCitiesByGovernorate = async (governorateId: string) => {
    if (!governorateId) {
      setCities([]);
      return;
    }

    setIsLoadingCities(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/governates/${governorateId}/cities`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      
      if (result.result === true && Array.isArray(result.data)) {
        setCities(result.data);
        console.log("✅ تم تحميل المدن:", result.data);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error("❌ خطأ في جلب المدن:", error);
      setCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  };

  // ✅ عند تغيير المحافظة، جلب المدن
  useEffect(() => {
    if (addressData.governorate) {
      const selectedGov = governorates.find(gov => gov.name === addressData.governorate);
      if (selectedGov) {
        fetchCitiesByGovernorate(selectedGov.id);
      }
    } else {
      setCities([]);
    }
  }, [addressData.governorate, governorates]);

  useEffect(() => {
    if (show) {
      fetchGovernorates();
      fetchSavedAddresses();
      hasAutoSavedRef.current = false;
      setAddressSaved(false);
      setSaveError(null);
    }
  }, [show]);

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

  // ✅ الحصول على city_id من اسم المدينة والمحافظة
  const getCityIdByName = (cityName: string, governorateName: string): string | null => {
    const selectedGov = governorates.find(gov => gov.name === governorateName);
    if (!selectedGov) return null;
    
    // نبحث في المدن التي تم تحميلها لهذه المحافظة
    const city = cities.find(c => c.name === cityName);
    return city?.id || null;
  };

  const saveAddressToAPI = async () => {
    setSaveError(null);
    
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
      // ✅ الحصول على city_id من الـ API
      const cityId = getCityIdByName(addressData.city, addressData.governorate);
      
      if (!cityId) {
        setSaveError("لم يتم العثور على المدينة في النظام");
        return null;
      }
      
      const token = localStorage.getItem('auth_token');
      const addressToSave = {
        city_id: cityId, // ✅ إرسال city_id كـ string
        street: getFieldValue(addressData.street),
        building: getFieldValue(addressData.buildingNo),
        floor: getFieldValue(addressData.floorNo),
        apartment: getFieldValue(addressData.apartmentNo),
        latitude: null,
        longitude: null,
        type: 'home',
      };
      
      console.log("📦 حفظ العنوان:", addressToSave);
      
      const response = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(addressToSave),
      });
      
      const result = await response.json();
      console.log("📦 الرد من API:", result);
      
      if (result.result === true) {
        await fetchSavedAddresses();
        setAddressSaved(true);
        
        if (onAddressSaved) {
          onAddressSaved(result.data);
        }
        
        if (onAddressSelected && result.data && result.data.id) {
          onAddressSelected(result.data.id);
        }
        
        return result.data;
      } else {
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

  const handleManualSave = async () => {
    if (useSavedAddress) {
      setSaveError("لا يمكن حفظ عنوان مستخدم بالفعل");
      return;
    }
    
    if (!addressData.governorate || !addressData.city) {
      setSaveError("الرجاء اختيار المحافظة والمدينة أولاً");
      return;
    }
    
    const savedAddress = await saveAddressToAPI();
    
    if (savedAddress && savedAddress.id && onAddressSelected) {
      onAddressSelected(savedAddress.id);
    }
  };

  useEffect(() => {
    if (useSavedAddress || addressSaved || isSavingAddress || !isAllFieldsFilled()) {
      return;
    }
    
    if (hasAutoSavedRef.current) return;
    
    const timer = setTimeout(async () => {
      if (isAllFieldsFilled() && !useSavedAddress && !addressSaved) {
        hasAutoSavedRef.current = true;
        const savedAddress = await saveAddressToAPI();
        if (savedAddress && savedAddress.id && onAddressSelected) {
          onAddressSelected(savedAddress.id);
        }
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [addressData, useSavedAddress, addressSaved]);

  if (!show) return null;

  const getGovernoratesList = () => {
    return governorates.map(gov => gov.name);
  };

  const getCitiesList = () => {
    return cities.map(city => city.name);
  };

  const updateAddress = (field: string, value: string | null) => {
    if (!useSavedAddress) {
      hasAutoSavedRef.current = false;
      setAddressSaved(false);
      setSaveError(null);
    }
    onAddressChange({ ...addressData, [field]: value || "" });
  };

  const handleSelectSavedAddress = (addressId: number) => {
    setSelectedSavedAddressId(addressId);
    const address = savedAddresses.find((a) => a.id === addressId);
    if (address) {
      onAddressChange({
        street: address.street,
        city: address.city,
        governorate: address.governorate,
        buildingNo: address.building,
        floorNo: address.floor,
        apartmentNo: address.apartment,
      });
      
      setAddressSaved(true);
      setSaveError(null);
      
      if (onAddressSelected) {
        onAddressSelected(addressId);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4">عنوان التوصيل</h2>
      
      {!useSavedAddress && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المحافظة <span className="text-[#EC221F]">*</span>
              </label>
              <Select
                value={addressData.governorate}
                onValueChange={(value) => updateAddress("governorate", value)}
                disabled={isLoadingGovernorates}
              >
                <SelectTrigger className="w-full bg-white rounded-[8px]">
                  <SelectValue placeholder={isLoadingGovernorates ? "جاري التحميل..." : "اختر المحافظة"} />
                </SelectTrigger>
                <SelectContent>
                  {getGovernoratesList().map((gov) => (
                    <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المدينة <span className="text-[#EC221F]">*</span>
              </label>
              <Select
                value={addressData.city}
                onValueChange={(value) => updateAddress("city", value)}
                disabled={!addressData.governorate || isLoadingCities}
              >
                <SelectTrigger className="w-full bg-white rounded-[8px]">
                  <SelectValue 
                    placeholder={
                      !addressData.governorate 
                        ? "اختر المحافظة أولاً" 
                        : isLoadingCities 
                        ? "جاري تحميل المدن..." 
                        : "اختر المدينة"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCities ? (
                    <div className="p-4 text-center text-gray-500">
                      جاري تحميل المدن...
                    </div>
                  ) : getCitiesList().length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      لا توجد مدن متاحة
                    </div>
                  ) : (
                    getCitiesList().map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم الشارع</label>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={addressData.street}
                  onChange={(e) => updateAddress("street", e.target.value)}
                  placeholder="مثال: شارع النيل"
                  className="w-full pr-10 p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الشقة</label>
              <div className="relative">
                <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={addressData.apartmentNo}
                  onChange={(e) => updateAddress("apartmentNo", e.target.value)}
                  placeholder="رقم الشقة"
                  className="w-full pr-10 p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الدور</label>
              <div className="relative">
                <Home className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={addressData.floorNo}
                  onChange={(e) => updateAddress("floorNo", e.target.value)}
                  placeholder="رقم الدور"
                  className="w-full pr-10 p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          {!addressSaved && (
            <div className="pt-2 mt-3">
              <button
                onClick={handleManualSave}
                disabled={isSavingAddress || !addressData.governorate || !addressData.city}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
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
            </div>
          )}

          {saveError && (
            <div className="pt-2 mt-2">
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm font-medium text-red-800">{saveError}</p>
              </div>
            </div>
          )}

          {addressSaved && (
            <div className="pt-2 mt-2">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm font-medium text-blue-800">تم حفظ عنوانك بنجاح</p>
              </div>
            </div>
          )}
        </>
      )}

      {savedAddresses.length > 0 && (
        <>
          <div className="border-t border-gray-200 my-4 relative">
            <span className="absolute bottom-[-10px] left-[50%] bg-white px-2">أو</span>
          </div>
          
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
                    setSaveError(null);
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
              />
              <Label htmlFor="useSavedAddress" className="text-sm font-medium text-gray-700 cursor-pointer">
                اختر من العناوين المحفوظة
              </Label>
            </div>

            {useSavedAddress && (
              <div className="mt-3 space-y-3 pr-2">
                {isLoadingAddresses ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  </div>
                ) : (
                  savedAddresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedSavedAddressId === address.id
                          ? "border-[#EC221F] bg-red-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                      onClick={() => handleSelectSavedAddress(address.id)}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedSavedAddressId === address.id}
                        onChange={() => handleSelectSavedAddress(address.id)}
                        className="mt-0.5 w-4 h-4 text-[#EC221F]"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{address.street}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {address.building && `مبنى ${address.building} `}
                          {address.floor && `دور ${address.floor} `}
                          {address.apartment && `شقة ${address.apartment}`}
                        </p>
                        <p className="text-sm text-gray-500">{address.city}، {address.governorate}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}