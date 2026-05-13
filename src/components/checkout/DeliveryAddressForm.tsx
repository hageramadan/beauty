// components/checkout/DeliveryAddressForm.tsx
"use client";

import { useState } from "react";
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

interface SavedAddress {
  id: string;
  street: string;
  city: string;
  governorate: string;
  buildingNo?: string;
  floorNo?: string;
  apartmentNo?: string;
  isDefault?: boolean;
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
}

// قائمة المحافظات المصرية
const EGYPT_GOVERNORATES = [
  "القاهرة",
  "الإسكندرية",
  "الجيزة",
];

// قائمة المدن حسب المحافظة (مثال لبعض المحافظات)
const CITIES_BY_GOVERNORATE: Record<string, string[]> = {
  القاهرة: [
    "وسط البلد",
    "مصر الجديدة",
    "مدينة نصر",
    "المعادي",
    "الزمالك",
    "المهندسين",
    "شبرا",
    "العباسية",
  ],
  الإسكندرية: [
    "وسط الإسكندرية",
    "سموحة",
    "لوران",
    "المنتزه",
    "بحري",
    "الرمل",
    "ميامي",
    "سيدي بشر",
  ],
  الجيزة: [
    "المهندسين",
    "الدقي",
    "العجوزة",
    "الهرم",
    "فيصل",
    "الرحاب",
    "الشيخ زايد",
  ],
};

export default function DeliveryAddressForm({
  show,
  addressData,
  onAddressChange,
}: DeliveryAddressFormProps) {
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
    {
      id: "1",
      street: "شارع النيل",
      city: "الزمالك",
      governorate: "القاهرة",
      buildingNo: "10",
      floorNo: "3",
      apartmentNo: "5",
      isDefault: true,
    },
    {
      id: "2",
      street: "شارع البحر الأعظم",
      city: "العجوزة",
      governorate: "الجيزة",
      buildingNo: "25",
      floorNo: "2",
      apartmentNo: "8",
    },
  ]);

  const [selectedSavedAddressId, setSelectedSavedAddressId] =
    useState<string>("");
  const [saveForFuture, setSaveForFuture] = useState(false);

  if (!show) return null;

  // تحديث البيانات
  const updateAddress = (field: string, value: string | null) => {
    onAddressChange({ ...addressData, [field]: value });
  };

  // تحميل عنوان محفوظ
  const handleSelectSavedAddress = (addressId: string) => {
    setSelectedSavedAddressId(addressId);
    const address = savedAddresses.find((a) => a.id === addressId);
    if (address) {
      onAddressChange({
        street: address.street,
        city: address.city,
        governorate: address.governorate,
        buildingNo: address.buildingNo || "",
        floorNo: address.floorNo || "",
        apartmentNo: address.apartmentNo || "",
      });
    }
  };

  // الحصول على المدن المتاحة حسب المحافظة المختارة
  const availableCities = CITIES_BY_GOVERNORATE[addressData.governorate] || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
     
        عنوان التوصيل
      </h2>
      
      {/* نموذج إدخال العنوان - يظهر فقط عند عدم اختيار عنوان محفوظ */}
     
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
              >
                <SelectTrigger className="w-full bg-white rounded-[8px] focus:ring-0 focus:border-black">
                  <SelectValue placeholder="اختر المحافظة" />
                </SelectTrigger>
                <SelectContent>
                  {EGYPT_GOVERNORATES.map((gov) => (
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
                disabled={!addressData.governorate}
              >
                <SelectTrigger className="w-full bg-white rounded-[8px] focus:ring-0 focus:border-black">
                  <SelectValue placeholder="اختر المدينة" />
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
                اسم الشارع <span className="text-[#EC221F]">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={addressData.street}
                  onChange={(e) => updateAddress("street", e.target.value)}
                  placeholder="مثال: شارع النيل، شارع التسعين"
                  className="w-full pr-10 text-sm leading-normal p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none bg-white"
                />
              </div>
            </div>
          </div>

          {/* رقم الشقة ورقم الدور */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الشقة <span className="text-[#EC221F]">*</span>
              </label>
              <div className="relative">
                <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={addressData.apartmentNo}
                  onChange={(e) => updateAddress("apartmentNo", e.target.value)}
                  placeholder="رقم الشقة"
                  className="w-full pr-10 p-3 text-sm border border-gray-200 rounded-xl focus:border-black focus:outline-none bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الدور <span className="text-[#EC221F]">*</span>
              </label>
              <div className="relative">
                <Home className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={addressData.floorNo}
                  onChange={(e) => updateAddress("floorNo", e.target.value)}
                  placeholder="رقم الدور"
                  className="w-full pr-10 p-3 text-sm border border-gray-200 rounded-xl focus:border-black focus:outline-none bg-white"
                />
              </div>
            </div>
          </div>

          {/* حفظ العنوان للطلبات القادمة */}
          <div className="pt-2 mt-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
              <Checkbox
                id="saveForFuture"
                checked={saveForFuture}
                onCheckedChange={(checked) => setSaveForFuture(checked as boolean)}
                className="border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <Save className="w-5 h-5 text-green-600" />
              <label
                htmlFor="saveForFuture"
                className="text-sm font-medium text-green-800 cursor-pointer"
              >
                حفظ العنوان للطلبات القادمة
              </label>
            </div>
          </div>
        </>
  

      {/* خط فاصل */}
      <div className="border-t border-gray-200 my-4 relative">
      <span className=" absolute bottom-[-10px] left-[50%] bg-white px-2">أو</span>
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
                setSelectedSavedAddressId("");
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

        {/* العناوين المحفوظة تظهر تحت بعض كراديو بتاع */}

        {useSavedAddress && savedAddresses.length > 0 && (
          <div className="mt-3 space-y-3 pr-2">
            {savedAddresses.map((address) => (
              <label
                key={address.id}
                className={`flex items-start  gap-1 md:gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
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
                    {address.isDefault && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        العنوان الافتراضي
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {address.buildingNo && `مبنى ${address.buildingNo} `}
                    {address.floorNo && `، دور ${address.floorNo} `}
                    {address.apartmentNo && `، شقة ${address.apartmentNo}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {address.city}، {address.governorate}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        {useSavedAddress && savedAddresses.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            لا توجد عناوين محفوظة. قم بإضافة عنوان جديد أولاً.
          </p>
        )}
      </div>
    </div>
  );
}