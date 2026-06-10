// types/address.ts

export interface Governorate {
  id: string; // ملاحظة: id من النوع string
  name: string;
  provider: string;
}

export interface City {
  id: string; // ملاحظة: id من النوع string
  name: string;
  provider: string;
  delivery_fee: number;
  governate?: Governorate; // اختياري، قد لا يكون موجوداً دائماً
}

export interface Address {
  id: number;
  city_id?: string; // قد يكون موجوداً أو لا حسب الـ API
  city: City;
  street: string;
  building: string;
  floor: string;
  type: string; // home, work, other
  type_label: string; // المنزل, العمل, اخرى
  apartment: string;
  latitude: string | null;
  longitude: string | null;
  user?: {
    id: number;
    name: string;
    locale: string;
    email: string;
    verified: boolean;
    created_at: string;
    image: string;
  };
  created_at?: string;
  updated_at?: string;
}

// واجهة للرد من API عند إضافة أو تعديل عنوان
export interface AddressResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: Address;
}

// واجهة لقائمة العناوين
export interface AddressesResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    addresses: Address[];
    default_address?: Address;
  };
}

// واجهة للمحافظات
export interface GovernoratesResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    governates: Governorate[];
  };
}

// واجهة للمدن
export interface CitiesResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: City[]; // array من المدن مباشرة
}