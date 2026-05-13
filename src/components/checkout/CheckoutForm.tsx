// components/checkout/CheckoutForm.tsx
"use client";

import { useState } from "react";
import { CheckoutFormData } from "./types";
import ContactInfoForm from "./ContactInfoForm";
import DeliveryMethodForm from "./DeliveryMethodForm";
import DeliveryAddressForm from "./DeliveryAddressForm";
import PaymentMethodForm from "./PaymentMethodForm";
import NotesForm from "./NotesForm";
import SuccessPopup from "./SuccessPopup";

interface CheckoutFormProps {
  formData: CheckoutFormData;
  onFormChange: (data: Partial<CheckoutFormData>) => void;
  onSubmit: () => void;
  total: number;
}

export default function CheckoutForm({ formData, onFormChange, onSubmit, total }: CheckoutFormProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // استدعاء دالة onSubmit الأصلية (إرسال الطلب للخادم)
      await onSubmit();
      
      // إنشاء رقم طلب عشوائي (يمكن استلامه من الـ API)
      const newOrderNumber = `#${Math.floor(10000 + Math.random() * 90000)}`;
      setOrderNumber(newOrderNumber);
      
      // إظهار البوب اب
      setShowPopup(true);
    } catch (error) {
      console.error("Error submitting order:", error);
      // يمكن إضافة رسالة خطأ هنا
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    // يمكن إعادة توجيه المستخدم أو تنظيف الفورم هنا
  };

  // تحضير تفاصيل الطلب للبوب اب
  const orderDetails = {
    itemsCount:  0,
    total: total,
    deliveryDate: getDeliveryDate(formData.deliveryMethod),
    address: formData.deliveryMethod === "delivery" && formData.deliveryAddress 
      ? `${formData.deliveryAddress.city} - ${formData.deliveryAddress.governorate}`
      : undefined
  };

  return (
    <>
      <ContactInfoForm 
        formData={formData} 
        onFormChange={onFormChange} 
      />
      
      <DeliveryMethodForm 
        deliveryMethod={formData.deliveryMethod}
        onDeliveryMethodChange={(method) => onFormChange({ deliveryMethod: method })}
      />
      
      {/* إضافة قيمة افتراضية لـ addressData إذا كانت undefined */}
      <DeliveryAddressForm 
        show={formData.deliveryMethod === "delivery"}
        addressData={formData.deliveryAddress || {
          street: "",
          city: "",
          governorate: "",
          buildingNo: "",
          floorNo: "",
          apartmentNo: ""
        }}
        onAddressChange={(address) => onFormChange({ deliveryAddress: address })}
      />
      
      <PaymentMethodForm 
        paymentMethod={formData.paymentMethod}
        onPaymentMethodChange={(method) => onFormChange({ paymentMethod: method as "cash" | "card" | "mada" | "wallet" })}
      />
      
      <NotesForm 
        notes={formData.notes}
        onNotesChange={(notes) => onFormChange({ notes })}
      />
      
      {/* زر إتمام الطلب - يظهر فقط في الموبايل */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`w-full md:mb-4 bg-[#000000] text-white py-3 rounded-xl font-semibold text-lg transition ${
          isSubmitting ? "opacity-90 cursor-not-allowed" : "hover:bg-gray-800"
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            جاري المعالجة...
          </span>
        ) : (
          `تأكيد الطلب `
        )}
      </button>

      {/* Popup النجاح */}
      <SuccessPopup
        isOpen={showPopup}
        onClose={handleClosePopup}
        orderNumber={orderNumber}
        orderDetails={orderDetails}
      />
    </>
  );
}

// دالة مساعدة لحساب تاريخ التوصيل المتوقع
function getDeliveryDate(deliveryMethod: string): string {
  if (deliveryMethod === "delivery") {
    const date = new Date();
    date.setDate(date.getDate() + 3); // بعد 3 أيام
    return date.toLocaleDateString("ar-EG", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  } else {
    const date = new Date();
    date.setDate(date.getDate() + 1); // بعد يوم واحد للاستلام من الفرع
    return date.toLocaleDateString("ar-EG", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  }
}