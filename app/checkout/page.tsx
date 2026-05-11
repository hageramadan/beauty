// app/checkout/page.tsx
"use client";

import { useState, useMemo } from "react"; // ✅ استخدم useMemo لحساب القيم مرة واحدة
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { CheckoutForm, OrderSummary } from "@/components/checkout";
import { CartItem, CheckoutFormData, CartSummary } from "@/components/checkout/types";

// ========== البيانات التجريبية (هتجيبها من الـ Cart الفعلي) ==========
const mockCartItems: CartItem[] = [
  {
    id: 1,
    name: "قميص قطني طويل الأكمام",
    brand: "Fashion Brand",
    price: 371.56,
    originalPrice: 464.45,
    image: "/images/products/product1.png",
    color: "أزرق",
    size: "L",
    quantity: 1,
    discount: 20,
  },
  {
    id: 2,
    name: "بنطلون جينز كلاسيك",
    brand: "Denim Co.",
    price: 150.00,
    originalPrice: 200.00,
    image: "/images/products/product2.png",
    color: "أسود",
    size: "M",
    quantity: 2,
    discount: 25,
  },
];

export default function CheckoutPage() {
  const [cartItems] = useState<CartItem[]>(mockCartItems);
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    phone: "",
    address: "",
    notes: "",
    deliveryMethod: "delivery",
    paymentMethod: "cod",
  });

  // ✅ حساب ملخص السلة باستخدام useMemo لمنع إعادة الحساب غير الضرورية
  const cartSummary: CartSummary = useMemo(() => {
    // حساب المجموع الفرعي
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // حساب الخصم الإجمالي
    const discount = cartItems.reduce((sum, item) => {
      if (item.originalPrice) {
        const itemDiscount = (item.originalPrice - item.price) * item.quantity;
        return sum + itemDiscount;
      }
      return sum;
    }, 0);
    
    // رسوم التوصيل بناءً على طريقة الاستلام
    const deliveryFee = formData.deliveryMethod === "delivery" ? 50 : 0;
    
    // المجموع النهائي
    const total = subtotal + deliveryFee;
    
    return { subtotal, discount, deliveryFee, total };
  }, [cartItems, formData.deliveryMethod]); // يعيد الحساب فقط عندما تتغير المنتجات أو طريقة التوصيل

  const handleFormChange = (data: Partial<CheckoutFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = () => {
    // التحقق من صحة البيانات
    if (!formData.fullName.trim()) {
      toast.error("الرجاء إدخال الاسم الكامل");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("الرجاء إدخال رقم الجوال");
      return;
    }
    if (formData.phone.length < 10) {
      toast.error("رقم الجوال غير صحيح");
      return;
    }
    if (formData.deliveryMethod === "delivery" && !formData.address.trim()) {
      toast.error("الرجاء إدخال عنوان التوصيل");
      return;
    }

    toast.success("جاري معالجة الطلب...");
    console.log("Order Data:", { 
      cartItems, 
      formData, 
      cartSummary // ✅ استخدام الكائن الملخص
    });
  };

  return (
    <div className="bg-gradient-to-l min-h-[80vh] from-[#bdcbf12a] to-[#feecea3b]">
      <div className="container page-with-padding mx-auto">
        {/* الهيدر */}
        <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">إتمام الطلب</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/cart" className="hover:text-[#EC221F] transition">سلة التسوق</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#EC221F] font-medium">إتمام الطلب</span>
          </div>
        
        </div>

        {/* تقسيم المساحة: 2/3 و 1/3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* الجانب الأيمن - نماذج الإدخال (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <CheckoutForm 
              formData={formData} 
              onFormChange={handleFormChange} 
              onSubmit={handleSubmit}
              total={cartSummary.total} // تمرير الإجمالي للزر
            />
          </div>

          {/* الجانب الأيسر - ملخص الطلب (1/3) */}
          <div className="lg:col-span-1">
            {/* ✅ تمرير cartSummary كاملاً */}
            <OrderSummary
              cartItems={cartItems}
              cartSummary={cartSummary}
              deliveryMethod={formData.deliveryMethod}
            />
            
            {/* زر إتمام الطلب للشاشات الكبيرة */}
            <button
              onClick={handleSubmit}
              className="hidden lg:block w-full bg-[#EC221F] text-white py-3 rounded-xl font-semibold text-lg hover:bg-red-700 transition mt-4"
            >
              تأكيد الطلب - EGP {cartSummary.total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}