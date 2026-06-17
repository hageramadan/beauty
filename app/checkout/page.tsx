"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle } from "lucide-react";
import {
  CartItem,
  CheckoutFormData,
  CartSummary,
} from "@/components/checkout/types";
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

const API_URL = "https://dukanah.admin.t-carts.com/api";

// دالة جلب التوكن
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

// دالة جلب الهيدرز مع التوكن
const getHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ✅ دالة جلب السلة مع البارامترات (delivery_method و city_id)
const fetchCartWithParams = async (
  deliveryMethod: string,
  cityId?: string,
): Promise<any> => {
  try {
    const token = getToken();
    const params = new URLSearchParams();

    if (deliveryMethod === "delivery") {
      params.append("delivery_method", "delivery");
    } else {
      params.append("delivery_method", "receive");
    }

    if (deliveryMethod === "delivery" && cityId) {
      params.append("city_id", cityId);
    }

    const url = `${API_URL}/cart/preview?${params.toString()}`;
    console.log("🟢 Fetching URL:", url);

    const response = await fetch(url, {
      headers: getHeaders(),
    });

    const data = await response.json();
    console.log("🟢 API Response:", data);

    // ✅ إرجاع كائن cart مباشرة
    if (data.result === true && data.data && data.data.cart) {
      console.log("🟢 Returning cart data:", data.data.cart);
      return data.data.cart;
    }

    return null;
  } catch (error) {
    console.error("❌ Error fetching cart with params:", error);
    throw error;
  }
};

// ✅ دالة التحقق من رقم الهاتف حسب الدولة
const validatePhoneNumberByCountry = (
  phoneNumber: string,
  countryCode: string,
): { isValid: boolean; error: string } => {
  const cleanNumber = phoneNumber.replace(/[\s\-]/g, "");

  if (!cleanNumber) {
    return { isValid: false, error: "رقم الهاتف مطلوب" };
  }

  if (!/^\d+$/.test(cleanNumber)) {
    return { isValid: false, error: "يجب أن يحتوي رقم الهاتف على أرقام فقط" };
  }

  const rules: Record<
    string,
    {
      minLength: number;
      maxLength: number;
      startsWith: string[];
      pattern: RegExp;
      name: string;
    }
  > = {
    "+20": {
      name: "مصر",
      minLength: 11,
      maxLength: 11,
      startsWith: ["010", "011", "012", "015"],
      pattern: /^01[0125][0-9]{8}$/,
    },
    "+966": {
      name: "السعودية",
      minLength: 9,
      maxLength: 9,
      startsWith: ["05"],
      pattern: /^05[0-9]{8}$/,
    },
    "+964": {
      name: "العراق",
      minLength: 11,
      maxLength: 11,
      startsWith: ["07"],
      pattern: /^07[0-9]{9}$/,
    },
    "+971": {
      name: "الإمارات",
      minLength: 9,
      maxLength: 9,
      startsWith: ["05"],
      pattern: /^05[0-9]{8}$/,
    },
  };

  const rule = rules[countryCode];
  if (!rule) {
    return { isValid: false, error: "كود الدولة غير صالح" };
  }

  if (cleanNumber.length !== rule.minLength) {
    return {
      isValid: false,
      error: `رقم الهاتف في ${rule.name} يجب أن يكون ${rule.minLength} أرقام (الطول الحالي: ${cleanNumber.length})`,
    };
  }

  const startsWithValid = rule.startsWith.some((prefix) =>
    cleanNumber.startsWith(prefix),
  );
  if (!startsWithValid) {
    return {
      isValid: false,
      error: `رقم الهاتف في ${rule.name} يجب أن يبدأ بـ (${rule.startsWith.join(" أو ")})`,
    };
  }

  if (!rule.pattern.test(cleanNumber)) {
    return {
      isValid: false,
      error: `رقم الهاتف غير صحيح لدولة ${rule.name}`,
    };
  }

  return { isValid: true, error: "" };
};

// دالة إنشاء الطلب
const createOrder = async (orderData: any): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/orders/checkout`, {
      method: "POST",
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
      if (typeof item.product.brand === "string") {
        brandName = item.product.brand;
      } else if (
        typeof item.product.brand === "object" &&
        item.product.brand.name
      ) {
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
      originalPrice: item.product.pricing?.has_discount
        ? item.product.pricing.price
        : undefined,
      image: cleanImageUrl(item.product.images?.[0] || ""),
      color: color,
      size: size,
      quantity: item.quantity,
      discount: item.discount_amount || undefined,
    };
  });
};

// ✅ نوع بيانات الطلب الناجح
interface CompletedOrderResult {
  orderNumber: string | number;
  itemsCount: number;
  total: number;
}

export default function CheckoutPage() {
  const {
    cart,
    isLoading: cartLoading,
    refetchCart,
    updateCart,
  } = useCartContext();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [orderResult, setOrderResult] = useState<CompletedOrderResult | null>(
    null,
  );
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

  // ✅ استخدم useRef لتخزين cityId بشكل فوري
  const selectedCityIdRef = useRef<string | null>(null);
  
  // ✅ منع الاستدعاء المتكرر للـ API
  const isFetchingRef = useRef<boolean>(false);
  
  // ✅ تتبع آخر قيمة لـ deliveryMethod لمنع الاستدعاء المتكرر
  const lastDeliveryMethodRef = useRef<string | null>(null);

  const cartItems = useMemo(() => transformCartItems(cart), [cart]);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    phone: "",
    phoneNumber: "",
    phoneCountryCode: "+20",
    deliveryAddress: {
      street: "",
      city: "",
      governorate: "",
      buildingNo: "",
      floorNo: "",
      apartmentNo: "",
    },
    notes: "",
    deliveryMethod: "delivery",
    paymentMethod: "cash",
  });

const cartSummary: CartSummary = useMemo(() => {
  const subtotal = cart?.subtotal || 0;
  const discount = cart?.discount_amount || 0;
  
  let deliveryFee;
  
  if (formData.deliveryMethod === "pickup") {
    deliveryFee = null;
  } else if (formData.deliveryMethod === "delivery") {
    if (!selectedCityId) {
      deliveryFee = undefined;
    } else {
      if (cart?.delivery_fee !== undefined && cart?.delivery_fee !== null) {
        deliveryFee = cart.delivery_fee;
      } else {
        deliveryFee = cart ? undefined : 0;
      }
    }
  } else {
    deliveryFee = undefined;
  }
  
  // ✅ استخدام total_amount مباشرة من الـ API
  const total = cart?.total_amount || 0;

  console.log("🟢 cartSummary:", { 
    subtotal, 
    discount, 
    deliveryFee, 
    total, 
    total_amount_from_api: cart?.total_amount,
    selectedCityId, 
    hasCart: !!cart 
  });

  return {
    subtotal,
    discount,
    deliveryFee,
    total, // ✅ الآن total هو total_amount من الـ API
  };
}, [cart, formData.deliveryMethod, selectedCityId]);

  // ✅ التعديل المهم: لا تقم بإعادة التوجيه إلى الرئيسية عند فراغ السلة إذا كان الطلب قد تم بنجاح
  useEffect(() => {
    if (isOrderCompleted) return;

    if (!cartLoading && (!cart || cart.items?.length === 0)) {
      router.replace("/");
    }
  }, [cart, cartLoading, router, isOrderCompleted]);

  // ✅ استدعاء الـ API عند تغيير طريقة التوصيل إلى pickup (محسّن)
  useEffect(() => {
    // منع الاستدعاء إذا كان الطلب مكتملاً أو السلة فارغة
    if (isOrderCompleted) return;
    if (!cart || cart.items?.length === 0) return;
    
    // ✅ منع الاستدعاء إذا كان هناك طلب قيد التنفيذ
    if (isFetchingRef.current) return;
    
    // ✅ منع الاستدعاء إذا كانت القيمة لم تتغير
    if (lastDeliveryMethodRef.current === formData.deliveryMethod) {
      console.log("🟢 Skipping - deliveryMethod hasn't changed");
      return;
    }

    // ✅ تحديث آخر قيمة
    lastDeliveryMethodRef.current = formData.deliveryMethod;

    const fetchCart = async () => {
      try {
        if (formData.deliveryMethod === "pickup") {
          console.log("🟢 Fetching cart with pickup method");
          isFetchingRef.current = true;
          
          const cartData = await fetchCartWithParams("pickup");
          console.log("🟢 Cart data received for pickup:", cartData);
          
          if (cartData) {
            updateCart(cartData);
            console.log("🟢 Cart updated for pickup successfully");
          }
        }
      } catch (error) {
        console.error("❌ Error fetching cart for pickup:", error);
      } finally {
        isFetchingRef.current = false;
      }
    };

    fetchCart();
  }, [formData.deliveryMethod, isOrderCompleted, cart, updateCart]);

  const handleFormChange = useCallback((data: Partial<CheckoutFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  // ✅ دالة لاستقبال address_id بعد حفظ العنوان
  const handleAddressSaved = useCallback(
    async (address: any) => {
      console.log("🟢 handleAddressSaved called with:", address);

      // ✅ منع الاستدعاء إذا كان هناك طلب قيد التنفيذ
      if (isFetchingRef.current) {
        console.log("🟢 Skipping - already fetching");
        return;
      }

      if (address && address.id) {
        setSelectedAddressId(address.id);
        toast.success("تم حفظ العنوان بنجاح");

        try {
          let cityId = selectedCityIdRef.current;
          console.log("🟢 cityId from ref:", cityId);

          if (!cityId) {
            cityId = selectedCityId;
            console.log("🟢 cityId from state:", cityId);
          }

          if (!cityId) {
            cityId = address.city?.id || address.city_id;
            console.log("🟢 cityId from address:", cityId);
          }

          if (cityId && formData.deliveryMethod === "delivery") {
            // ✅ تعيين علامة الجلب
            isFetchingRef.current = true;
            
            console.log("🟢 Fetching cart with params:", {
              deliveryMethod: "delivery",
              cityId,
            });
            const cartData = await fetchCartWithParams(
              "delivery",
              String(cityId),
            );
            console.log("🟢 Cart data received:", cartData);

            if (cartData) {
              console.log("🟢 Cart data to update:", cartData);
              updateCart(cartData);
              console.log("🟢 Cart updated successfully");
            } else {
              console.log("🟢 No cart data received");
            }
          } else {
            console.log(
              "🟢 Skipping cart fetch - no cityId or not delivery method",
            );
          }
        } catch (error) {
          console.error("❌ Error updating cart after address save:", error);
        } finally {
          // ✅ إعادة تعيين علامة الجلب بعد الانتهاء
          isFetchingRef.current = false;
        }
      } else {
        console.log("🟢 No address or no id in address");
      }
    },
    [selectedCityId, formData.deliveryMethod, updateCart],
  );

  // ✅ دالة لاستقبال address_id من عنوان محفوظ تم اختياره
  const handleAddressSelected = useCallback(
    async (addressId: number) => {
      console.log("🟢 handleAddressSelected called with addressId:", addressId);
      
      // ✅ منع الاستدعاء إذا كان هناك طلب قيد التنفيذ
      if (isFetchingRef.current) {
        console.log("🟢 Skipping - already fetching");
        return;
      }
      
      setSelectedAddressId(addressId);

      try {
        const cityId = selectedCityIdRef.current;
        console.log("🟢 cityId from ref in handleAddressSelected:", cityId);

        if (cityId && formData.deliveryMethod === "delivery") {
          // ✅ تعيين علامة الجلب
          isFetchingRef.current = true;
          
          console.log("🟢 Fetching cart with params after address selection:", {
            deliveryMethod: "delivery",
            cityId,
          });
          const cartData = await fetchCartWithParams(
            "delivery",
            String(cityId),
          );
          console.log("🟢 Cart data received:", cartData);

          if (cartData) {
            console.log("🟢 Cart data to update:", cartData);
            updateCart(cartData);
            console.log("🟢 Cart updated successfully after address selection");
          } else {
            console.log("🟢 No cart data received");
          }
        } else {
          console.log(
            "🟢 Skipping cart fetch - no cityId or not delivery method",
          );
        }
      } catch (error) {
        console.error("❌ Error updating cart after address selection:", error);
      } finally {
        // ✅ إعادة تعيين علامة الجلب بعد الانتهاء
        isFetchingRef.current = false;
      }
    },
    [formData.deliveryMethod, updateCart],
  );

  // ✅ دالة لاستقبال city_id عند اختيار المدينة
  const handleCitySelected = useCallback((cityId: string) => {
    console.log("🟢 handleCitySelected called with cityId:", cityId);
    selectedCityIdRef.current = cityId;
    setSelectedCityId(cityId);
    console.log("🟢 cityId stored in ref and state");
    // ❌ لا نقوم بجلب السلة هنا، فقط نخزن cityId
  }, []);

// ✅ تحضير بيانات الطلب
const prepareOrderData = useCallback(() => {
  const paymentMethodMap: Record<string, string> = {
    cash: "cash",
    card: "online",
    mada: "online",
    wallet: "online",
  };

  const deliveryMethodMap: Record<string, string> = {
    delivery: "delivery",
    pickup: "receive",
  };

  // ✅ بناء orderData الأساسي
  const orderData: any = {
    payment_method: paymentMethodMap[formData.paymentMethod] || "cash",
    delivery_method: deliveryMethodMap[formData.deliveryMethod] || "delivery",
    notes: formData.notes || "",
    create_account: false,
  };

  // ✅ أضف payment_gateway فقط إذا كانت طريقة الدفع هي المحفظة
  if (formData.paymentMethod === "wallet") {
    orderData.payment_gateway = "wallet";
  }

  if (formData.deliveryMethod === "delivery") {
    if (selectedAddressId) {
      orderData.address_id = selectedAddressId;
    } else {
      orderData.additional_data = {
        name: formData.fullName,
        phone: formData.phone,
        city_id: selectedCityId || 1,
        street: formData.deliveryAddress.street || "N/A",
        building: formData.deliveryAddress.buildingNo || "N/A",
        floor: formData.deliveryAddress.floorNo || "N/A",
        apartment: formData.deliveryAddress.apartmentNo || "N/A",
      };
    }
  } else {
    orderData.additional_data = {
      name: formData.fullName,
      phone: formData.phone,
    };
  }

  console.log("🟢 Order Data:", orderData); // للتأكد
  return orderData;
}, [formData, selectedAddressId, selectedCityId]);

  // ✅ إرسال الطلب
  const handleSubmit = async () => {
    if (isSubmitting || isOrderCompleted) return;

    if (!formData.fullName.trim()) {
      toast.error("الرجاء إدخال الاسم الكامل");
      return;
    }

    const phoneValidation = validatePhoneNumberByCountry(
      formData.phoneNumber ||
        formData.phone.replace(formData.phoneCountryCode || "", ""),
      formData.phoneCountryCode || "+20",
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
        const completedOrder: CompletedOrderResult = {
          orderNumber: response.data.order_number,
          itemsCount: cartItems.length,
          total: response.data.total_amount,
        };

        setOrderResult(completedOrder);
        setIsOrderCompleted(true);
        setShowSuccessPopup(true);

        refetchCart().catch((err) => {
          console.error("❌ Error refetching cart after order success:", err);
        });
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

  const handleClosePopup = useCallback(() => {
    setShowSuccessPopup(false);
    router.push("/");
  }, [router]);

  const handleGoToOrders = useCallback(() => {
    setShowSuccessPopup(false);
    router.push("/account/orders");
  }, [router]);

  const handleGoToHome = useCallback(() => {
    setShowSuccessPopup(false);
    router.push("/");
  }, [router]);

  if (cartLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="" />
      </div>
    );
  }

  if (!isOrderCompleted && (!cart || cart.items?.length === 0)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">سلة التسوق فارغة</p>
        <Link
          href="/products"
          className="bg-[#EC221F] text-white px-6 py-2 rounded-[8px] "
        >
          تسوق الآن
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-l min-h-[80vh] from-[#bdcbf12a] to-[#feecea3b]">
      <div className="container page-with-padding mx-auto mb-3">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            إتمام الطلب
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/cart" className="hover:text-[#EC221F] transition">
              سلة التسوق
            </Link>
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
              onDeliveryMethodChange={(method) =>
                handleFormChange({ deliveryMethod: method })
              }
            />

            {formData.deliveryMethod === "delivery" && (
              <DeliveryAddressForm
                show={true}
                addressData={formData.deliveryAddress}
                onAddressChange={(address) =>
                  handleFormChange({ deliveryAddress: address })
                }
                onAddressSaved={handleAddressSaved}
                onAddressSelected={handleAddressSelected}
                onCitySelected={handleCitySelected}
              />
            )}

            <PaymentMethodForm
              paymentMethod={formData.paymentMethod}
              onPaymentMethodChange={(method) =>
                handleFormChange({ paymentMethod: method as any })
              }
            />

            <NotesForm
              notes={formData.notes}
              onNotesChange={(notes) => handleFormChange({ notes })}
            />

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isOrderCompleted}
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
          onGoToOrders={handleGoToOrders}
          onGoToHome={handleGoToHome}
          orderNumber={orderResult.orderNumber}
          orderDetails={{
            itemsCount: orderResult.itemsCount,
            total: orderResult.total,
          }}
        />
      )}
    </div>
  );
}

// ✅ Popup النجاح
interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToOrders: () => void;
  onGoToHome: () => void;
  orderNumber: string | number;
  orderDetails: {
    itemsCount: number;
    total: number;
  };
}

function SuccessPopup({
  isOpen,
  onClose,
  onGoToOrders,
  onGoToHome,
  orderNumber,
  orderDetails,
}: SuccessPopupProps) {
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
          <h3 className="text-xl font-bold text-gray-800">
            تم إتمام طلبك بنجاح
          </h3>
          <p className="text-gray-500 text-sm mt-2">
            شكراً لتسوقك معنا، طلبك قيد التحضير الآن.
          </p>
        </div>

        <div className="p-1">
          <div className="bg-gray-50 rounded-xl p-2 text-center mb-2">
            <p className="text-xs text-gray-500 mb-1">رقم الطلب</p>
            <p className="text-xl font-bold text-gray-800">#{orderNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-5 mx-auto px-4 md:px-5 mb-5">
          <button
            onClick={onGoToHome}
            className="w-full bg-black text-white py-2 md:py-3 rounded-xl font-medium hover:bg-gray-800 transition"
          >
            العودة إلى الرئيسية
          </button>
          <button
            onClick={onGoToOrders}
            className="w-full bg-[#EC221F] text-white py-2 rounded-xl font-medium hover:bg-[#d41c19] transition"
          >
            متابعة الطلبات
          </button>
        </div>
      </div>
    </div>
  );
}