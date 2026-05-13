// components/contact/ContactForm.tsx
"use client";

import { useState } from "react";
import FormInput from "./FormInput";
import PhoneInput from "./PhoneInput";
import SubmitButton from "./SubmitButton";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (phone: string) => {
    setFormData((prev) => ({ ...prev, phone }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // محاكاة إرسال البيانات
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Form submitted:", formData);
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: "", email: "", phone: "", message: "" });
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm h-fit">
      

      {isSubmitted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          تم إرسال رسالتك بنجاح! سنقوم بالرد عليك في أقرب وقت.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="الاسم"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="الأسم"
          required
        />

        <FormInput
          label="البريد الإلكتروني"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@domain.com"
          required
        />

        <PhoneInput
          value={formData.phone}
          onChange={handlePhoneChange}
          required
        />

        <FormInput
          label="رسالتك"
          name="message"
          type="textarea"
          value={formData.message}
          onChange={handleChange}
          placeholder="اكتب رسالتك هنا..."
          rows={5}
          required
        />

        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </div>
  );
}