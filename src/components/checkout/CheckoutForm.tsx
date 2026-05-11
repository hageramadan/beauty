// components/checkout/CheckoutForm.tsx
"use client";

import { CheckoutFormData } from "./types";
import ContactInfoForm from "./ContactInfoForm";
import DeliveryMethodForm from "./DeliveryMethodForm";
import PaymentMethodForm from "./PaymentMethodForm";
import NotesForm from "./NotesForm";

interface CheckoutFormProps {
  formData: CheckoutFormData;
  onFormChange: (data: Partial<CheckoutFormData>) => void;
  onSubmit: () => void;
  total: number;
}

export default function CheckoutForm({ formData, onFormChange, onSubmit, total }: CheckoutFormProps) {
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
      
      <PaymentMethodForm 
        paymentMethod={formData.paymentMethod}
        onPaymentMethodChange={(method) => onFormChange({  })}
      />
      
      <NotesForm 
        notes={formData.notes}
        onNotesChange={(notes) => onFormChange({ notes })}
      />
      
      {/* زر إتمام الطلب - يظهر فقط في الموبايل */}
      <button
        onClick={onSubmit}
        className="w-full lg:hidden bg-[#EC221F] text-white py-3 rounded-xl font-semibold text-lg hover:bg-red-700 transition"
      >
        تأكيد الطلب - EGP {total.toFixed(2)}
      </button>
    </>
  );
}