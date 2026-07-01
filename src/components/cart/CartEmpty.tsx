// components/cart/CartEmpty.tsx
"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function CartEmpty() {
  return (
    <div className="container h-[80vh]  ">
      <PageHeader title="سلة التسوق" />
      
      <div className="text-center  rounded-2xl mt-5">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          سلة التسوق فارغة
        </h2>
        <p className="text-gray-500 mb-6">
          يبدو أنك لم تقم بإضافة أي منتجات إلى السلة بعد
        </p>
        <Link
          href="/products"
          className="inline-block bg-[#FF7700] text-white px-8 py-3  rounded-[8px]  font-semibold hover:bg-[#2facf5]  transition-all duration-300 shadow-md hover:shadow-lg"
        >
          تسوق الآن
        </Link>
      </div>
    </div>
  );
}

// مكون عنوان الصفحة
import { ChevronRight } from "lucide-react";

const PageHeader = ({ title }: { title: string }) => (
  <div className="page-with-padding">
    <h1 className="text-xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
      <Link href="/" className="hover:text-[#FF7700]">الرئيسية</Link>
      <ChevronRight className="w-4 h-4" />
      <span className="text-[#FF7700]">{title}</span>
    </div>
  </div>
);