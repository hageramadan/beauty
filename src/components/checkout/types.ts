// components/checkout/types.ts

export interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  discount?: number;
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
   deliveryAddress: {
    street: string;
    city: string;
    governorate: string;
    buildingNo: string;
    floorNo: string;
    apartmentNo: string;
  };
  notes: string;
  deliveryMethod: "pickup" | "delivery";
  paymentMethod: "cash" | "card" | "mada" | "wallet";
}

// ✅ واجهة جديدة لملخص سلة التسوق
export interface CartSummary {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

// باقي الواجهات تبقى كما هي
export interface ContactInfoFormProps {
  formData: CheckoutFormData;
  onFormChange: (data: Partial<CheckoutFormData>) => void;
}

export interface DeliveryMethodFormProps {
  deliveryMethod: "pickup" | "delivery";
  onDeliveryMethodChange: (method: "pickup" | "delivery") => void;
}

export interface PaymentMethodFormProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}

export interface NotesFormProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

// ✅ تعديل OrderSummaryProps لاستخدام cartSummary
export interface OrderSummaryProps {
  cartItems: CartItem[]; // يمكن الاحتفاظ بالمنتجات لعرضها
  cartSummary: CartSummary;
  deliveryMethod: string;
}