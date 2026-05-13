// app/account/orders/[id]/return/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IoCopyOutline } from "react-icons/io5";
import SuccessPopup from "@/components/checkout/SuccessPopup";
import PaymentMethodForm from "@/components/checkout/PaymentMethodForm";

// نفس البيانات المؤقتة
const mockOrderDetails = {
  id: 1,
  orderNumber: "#12345",
  date: "Delivered Sep 28, 2024",
  status: "delivered",
  items: [
    {
      id: 1,
      name: "قميص",
      brand: "Defacto",
      color: "ابيض",
      size: "L",
      price: 371.56,
      originalPrice: 471.56,
      quantity: 1,
      image: "/images/products/product2.png",
    },
  ],
};

export default function ReturnRequestPage() {
  const params = useParams();
  const router = useRouter();
  const order = mockOrderDetails;
  const [notes, setNotes] = useState("");
  const [refundMethod, setRefundMethod] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleSubmit = () => {
    console.log({
      orderId: order.id,
      notes,
      refundMethod,
    });
    setShowSuccessPopup(true);
  };

  const handleClosePopup = () => {
    setShowSuccessPopup(false); // فقط يقفل البوب اب ويبقى في نفس الصفحة
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto px-4 py-8 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            الطلب غير موجود
          </h2>
          <Link
            href="/account/orders"
            className="inline-block bg-[#EC221F] text-white px-6 py-2 rounded-lg"
          >
            العودة إلى الطلبات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
      <div className="container mx-auto mb-3">
       

        <div >
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-right">
            طلب إرجاع
          </h1>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            {/* رقم الطلب والتاريخ */}
            <div>
              <div className="flex items-center gap-3 text-xl text-[#180100] font-bold">
                <p className="">رقم الطلب</p>
                <div className="flex items-center gap-1">
                  <p className="">{order.orderNumber}</p>
                  <IoCopyOutline className="cursor-pointer" />
                </div>
              </div>
              <div className="">
                <p className="text-[#333333] text-lg my-3">{order.date}</p>
              </div>
            </div>

            {/* المنتجات */}
            <div>
              <p className="text-gray-600 mb-3">
                المنتجات ({order.items.length})
              </p>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 border border-gray-200 rounded-xl p-3 mb-3"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400 m-auto mt-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.brand}</p>
                        <p className="text-xs text-gray-600 mt-1 flex gap-1">
                          <span className="hidden md:flex font-bold text-black">
                            اللون :
                          </span>
                          <span>{item.color}</span>
                          <span className="hidden md:flex font-bold text-black">
                            المقاس :
                          </span>
                          <span>{item.size}</span>
                        </p>
                        <span className="text-gray-500 text-sm">
                          x{item.quantity}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 md:text-base text-xs flex gap-1">
                          {item.price.toFixed(2)}{" "}
                          <span className="hidden md:flex">EGP</span>
                        </p>
                        {item.originalPrice && (
                          <p className="text-sm text-gray-400 line-through hidden md:flex">
                            EGP {item.originalPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ملاحظات */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-6 space-y-6 my-4">
            
            <label className="block text-[#252525] text-lg md:text-2xl font-bold ">
                 
              ملاحظات
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="قم بإدخال ملاحظاتك الإضافية.."
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#EC221F] resize-none"
              rows={3}
            />
          </div>

          {/* طريقة استرداد المبلغ - استخدام الـ Component الجديد */}
          <PaymentMethodForm
            paymentMethod={refundMethod}
            onPaymentMethodChange={setRefundMethod}
          />

          {/* زر تأكيد الطلب */}
          <button
            onClick={handleSubmit}
            className="w-full bg-[#000000] text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition mt-4"
          >
            تأكيد الطلب
          </button>
        </div>
      </div>

      {/* Popup النجاح - باقي في نفس الصفحة عند الإغلاق */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={handleClosePopup}
        orderNumber={order.orderNumber}
        orderDetails={{
          itemsCount: order.items.length,
          total: order.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        }}
      />
    </div>
  );
}