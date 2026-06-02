// app/contact/page.tsx
"use client";

import ContactForm from "@/components/contact/ContactForm";
import ServicesSection from "@/components/contact/ServicesSection";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
      <div className="container mx-auto">
        {/* عنوان الصفحة */}
        <div className="text-center ">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 mb-3">تواصل معنا</h1>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mt-7">
       
          <ContactForm />
          <ServicesSection />
        </div>

      
      </div>
    </div>
  );
}