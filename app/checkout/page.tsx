// app/checkout/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle } from "lucide-react";
import { CartItem, CheckoutFormData, CartSummary } from "@/components/checkout/types";
import { useCartContext } from "@/contexts/CartContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// استيراد المكونات
import ContactInfoForm from "@/components/checkout/ContactInfoForm";
import DeliveryMethodForm from "@/components/checkout/DeliveryMethodForm";
import DeliveryAddressForm from "@/components/checkout/DeliveryAddressForm";
import PaymentMethodForm from "@/components/checkout/PaymentMethodForm";
import NotesForm from "@/components/checkout/NotesForm";
import OrderSummary from "@/components/checkout/OrderSummary";

const API_URL = 'https://dukanah.admin.t-carts.com/api';

// دالة جلب التوكن
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// دالة جلب الهيدرز مع التوكن
const getHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// ✅ دالة التحقق من رقم الهاتف حسب الدولة
const validatePhoneNumberByCountry = (phoneNumber: string, countryCode: string): { isValid: boolean; error: string } => {
  // إزالة أي مسافات أو شرطات
  const cleanNumber = phoneNumber.replace(/[\s\-]/g, "");
  
  if (!cleanNumber) {
    return { isValid: false, error: "رقم الهاتف مطلوب" };
  }
  
  // التحقق من أن الإدخال أرقام فقط
  if (!/^\d+$/.test(cleanNumber)) {
    return { isValid: false, error: "يجب أن يحتوي رقم الهاتف على أرقام فقط" };
  }
  
  // قواعد التحقق حسب الدولة
  const rules: Record<string, { minLength: number; maxLength: number; startsWith: string[]; pattern: RegExp; name: string }> = {
    "+20": {
      name: "مصر",
      minLength: 11,
      maxLength: 11,
      startsWith: ["010", "011", "012", "015"],
      pattern: /^01[0125][0-9]{8}$/
    },
    "+966": {
      name: "السعودية",
      minLength: 9,
      maxLength: 9,
      startsWith: ["05"],
      pattern: /^05[0-9]{8}$/
    },
    "+964": {
      name: "العراق",
      minLength: 11,
      maxLength: 11,
      startsWith: ["07"],
      pattern: /^07[0-9]{9}$/
    },
    "+971": {
      name: "الإمارات",
      minLength: 9,
      maxLength: 9,
      startsWith: ["05"],
      pattern: /^05[0-9]{8}$/
    }
  };
  
  const rule = rules[countryCode];
  if (!rule) {
    return { isValid: false, error: "كود الدولة غير صالح" };
  }
  
  // التحقق من الطول
  if (cleanNumber.length !== rule.minLength) {
    return { 
      isValid: false, 
      error: `رقم الهاتف في ${rule.name} يجب أن يكون ${rule.minLength} أرقام (الطول الحالي: ${cleanNumber.length})` 
    };
  }
  
  // التحقق من البداية
  const startsWithValid = rule.startsWith.some(prefix => cleanNumber.startsWith(prefix));
  if (!startsWithValid) {
    return { 
      isValid: false, 
      error: `رقم الهاتف في ${rule.name} يجب أن يبدأ بـ (${rule.startsWith.join(" أو ")})` 
    };
  }
  
  // التحقق من النمط
  if (!rule.pattern.test(cleanNumber)) {
    return { 
      isValid: false, 
      error: `رقم الهاتف غير صحيح لدولة ${rule.name}` 
    };
  }
  
  return { isValid: true, error: "" };
};

// دالة إنشاء الطلب
const createOrder = async (orderData: any): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/orders/checkout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error creating order:", error);
    throw error;
  }
};

// تحويل بيانات السلة
const transformCartItems = (cart: any): CartItem[] => {
  if (!cart || !cart.items) return [];
  
  return cart.items.map((item: any) => {
    let color = "";
    let size = "";
    
    if (item.variant && item.variant.attributes) {
      for (const attr of item.variant.attributes) {
        const attrName = attr.attribute_type?.name;
        if (attrName === "اللون") {
          color = attr.value || "";
        } else if (attrName === "مقاس" || attrName === "المقاس") {
          size = attr.value || "";
        }
      }
    }
    
    let brandName = "ماركة";
    if (item.product.brand) {
      if (typeof item.product.brand === 'string') {
        brandName = item.product.brand;
      } else if (typeof item.product.brand === 'object' && item.product.brand.name) {
        brandName = item.product.brand.name;
      }
    }
    
    const cleanImageUrl = (url: string) => {
      if (!url) return "/images/placeholder.jpg";
      if (url.startsWith("/storage")) {
        return `https://dukanah.admin.t-carts.com${url}`;
      }
      return url;
    };
    
    return {
      id: item.id,
      name: item.product.name,
      brand: brandName,
      price: item.final_price,
      originalPrice: item.product.pricing?.has_discount ? item.product.pricing.price : undefined,
      image: cleanImageUrl(item.product.images?.[0] || ""),
      color: color,
      size: size,
      quantity: item.quantity,
      discount: item.discount_amount || undefined,
    };
  });
};

export default function CheckoutPage() {
  const { cart, isLoading: cartLoading, refetchCart } = useCartContext();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  // ✅ State لحفظ address_id من العنوان المحفوظ أو المُنشأ
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  
  const cartItems = useMemo(() => transformCartItems(cart), [cart]);
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    phone: "",
    phoneNumber: "",        // ✅ أضف هذا
    phoneCountryCode: "+20", // ✅ أضف هذا (القيمة الافتراضية لمصر)
    deliveryAddress: {
      street: "",
      city: "",
      governorate: "",
      buildingNo: "",
      floorNo: "",
      apartmentNo: ""
    },
    notes: "",
    deliveryMethod: "delivery",
    paymentMethod: "cash",
  });

  const cartSummary: CartSummary = useMemo(() => {
    const subtotal = cart?.subtotal || 0;
    const discount = cart?.discount_amount || 0;
    const deliveryFee = formData.deliveryMethod === "delivery" ? (cart?.delivery_fee || 0) : 0;
    const total = (cart?.total_amount || 0) + deliveryFee;
    
    return { 
      subtotal, 
      discount, 
      deliveryFee, 
      total 
    };
  }, [cart, formData.deliveryMethod]);

  useEffect(() => {
    if (!cartLoading && (!cart || cart.items?.length === 0)) {
      toast.error("سلة التسوق فارغة، الرجاء إضافة منتجات أولاً");
      router.push("/cart");
    }
  }, [cart, cartLoading, router]);

  const handleFormChange = (data: Partial<CheckoutFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // ✅ دالة لاستقبال address_id بعد حفظ العنوان
  const handleAddressSaved = (address: any) => {
    if (address && address.id) {
      setSelectedAddressId(address.id);
      toast.success("تم حفظ العنوان بنجاح");
    }
  };

  // ✅ دالة لاستقبال address_id من عنوان محفوظ تم اختياره
  const handleAddressSelected = (addressId: number) => {
    setSelectedAddressId(addressId);
  };

  // ✅ تحضير بيانات الطلب
  const prepareOrderData = () => {
    const paymentMethodMap: Record<string, string> = {
      "cash": "cash",
      "card": "online",
      "mada": "online",
      "wallet": "online",
    };
    
    const deliveryMethodMap: Record<string, string> = {
      "delivery": "delivery",
      "pickup": "receive",
    };
    
    const orderData: any = {
      payment_method: paymentMethodMap[formData.paymentMethod] || "cash",
      delivery_method: deliveryMethodMap[formData.deliveryMethod] || "delivery",
      notes: formData.notes || "",
      create_account: false,
    };
    
    if (formData.deliveryMethod === "delivery") {
      if (selectedAddressId) {
        // ✅ استخدام address_id من العنوان المحفوظ أو المُنشأ
        orderData.address_id = selectedAddressId;
      } else {
        // استخدام الرقم الكامل مع الكود
        orderData.additional_data = {
          name: formData.fullName,
          phone: formData.phone,  // الرقم الكامل مع الكود
          city_id: 1,
          street: formData.deliveryAddress.street || "N/A",
          building: formData.deliveryAddress.buildingNo || "N/A",
          floor: formData.deliveryAddress.floorNo || "N/A",
          apartment: formData.deliveryAddress.apartmentNo || "N/A",
        };
      }
    } else {
      // استلام من الفرع
      orderData.additional_data = {
        name: formData.fullName,
        phone: formData.phone,
      };
    }
    
    return orderData;
  };

  // ✅ إرسال الطلب مع التحقق من صحة رقم الهاتف
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    // التحقق من صحة البيانات
    if (!formData.fullName.trim()) {
      toast.error("الرجاء إدخال الاسم الكامل");
      return;
    }
    
    // ✅ التحقق من رقم الهاتف حسب الدولة
    const phoneValidation = validatePhoneNumberByCountry(
      formData.phoneNumber || formData.phone.replace(formData.phoneCountryCode || "", ""),
      formData.phoneCountryCode || "+20"
    );
    
    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.error);
      return;
    }
    
    if (formData.deliveryMethod === "delivery" && !selectedAddressId) {
      toast.error("الرجاء حفظ العنوان أو اختيار عنوان محفوظ أولاً");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const orderData = prepareOrderData();
      const response = await createOrder(orderData);
      
      if (response.result === true && response.data) {
        setOrderResult(response.data);
        setShowSuccessPopup(true);
        toast.success("تم إنشاء الطلب بنجاح!");
        await refetchCart();
      } else {
        toast.error(response.message || "حدث خطأ أثناء إنشاء الطلب");
      }
    } catch (error) {
      console.error("❌ Error creating order:", error);
      toast.error("حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    router.push("/account/orders");
  };

  if (cartLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="جاري تحميل السلة..." />
      </div>
    );
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">سلة التسوق فارغة</p>
        <Link href="/" className="bg-[#EC221F] text-white px-6 py-2 rounded-lg">
          تسوق الآن
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-l min-h-[80vh] from-[#bdcbf12a] to-[#feecea3b]">
      <div className="container page-with-padding mx-auto mb-3">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">إتمام الطلب</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/cart" className="hover:text-[#EC221F] transition">سلة التسوق</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#EC221F] font-medium">إتمام الطلب</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ContactInfoForm 
              formData={formData} 
              onFormChange={handleFormChange} 
            />
            
            <DeliveryMethodForm 
              deliveryMethod={formData.deliveryMethod}
              onDeliveryMethodChange={(method) => handleFormChange({ deliveryMethod: method })}
            />
            
            {formData.deliveryMethod === "delivery" && (
              <DeliveryAddressForm
                show={true}
                addressData={formData.deliveryAddress}
                onAddressChange={(address) => handleFormChange({ deliveryAddress: address })}
                onAddressSaved={handleAddressSaved}
                onAddressSelected={handleAddressSelected}
              />
            )}
            
            <PaymentMethodForm 
              paymentMethod={formData.paymentMethod}
              onPaymentMethodChange={(method) => handleFormChange({ paymentMethod: method as any })}
            />
            
            <NotesForm 
              notes={formData.notes}
              onNotesChange={(notes) => handleFormChange({ notes })}
            />
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg transition disabled:opacity-50"
            >
              {isSubmitting ? "جاري المعالجة..." : "تأكيد الطلب"}
            </button>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              cartItems={cartItems}
              cartSummary={cartSummary}
              deliveryMethod={formData.deliveryMethod}
            />
          </div>
        </div>
      </div>

      {showSuccessPopup && orderResult && (
        <SuccessPopup
          isOpen={showSuccessPopup}
          onClose={handleClosePopup}
          orderNumber={orderResult.order_number}
          orderDetails={{
            itemsCount: cartItems.length,
            total: orderResult.total_amount,
          }}
        />
      )}
    </div>
  );
}

// Popup النجاح
function SuccessPopup({ isOpen, onClose, orderNumber }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
        <div className="p-6 text-center border-b border-gray-100">
          <div className="flex justify-center mb-3">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800">تم إتمام طلبك بنجاح</h3>
          <p className="text-gray-500 text-sm mt-2">شكراً لتسوقك معنا، طلبك قيد التحضير الآن.</p>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">رقم الطلب</p>
            <p className="text-2xl font-bold text-gray-800">{orderNumber}</p>
          </div>
        </div>
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition"
          >
            طلباتي
          </button>
        </div>
      </div>
    </div>
  );
}