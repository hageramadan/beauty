// types/address.ts
export interface Address {
  id: number;
  city: {
    id: number;
    name: string;
    delivery_fee: string;
     governate?: {      // جعل governate اختيارياً
      id: number;
      name: string;
    };
  };
  street: string;
  building: string;
  floor: string;
  type: string; // home, work, other
  type_label: string; // المنزل, العمل, اخرى
  apartment: string;
  latitude: string | null;
  longitude: string | null;
  user: {
    id: number;
    name: string;
    locale: string;
    email: string;
    verified: boolean;
    created_at: string;
    image: string;
  };
}