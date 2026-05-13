// app/account/orders/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  PackageCheck,
  XCircle,ChevronRight} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import OrderTracker from "@/components/OrderTracker";
import { IoCopyOutline } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";

// تعريف نوع الطلب
interface OrderItem {
  id: number;
  name: string;
  brand: string;
  color: string;
  size: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
}

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  status:
    | "pending"
    | "processing"
    | "ready"
    | "delivering"
    | "delivered"
    | "cancelled";
  items: OrderItem[];
  total: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  finalTotal: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    city: string;
    street: string;
    building: string;
    apartment: string;
    governorate: string;
  };
  deliveryMethod: string;
  paymentMethod: string;
  notes?: string;
}

// بيانات تجريبية للطلب
const mockOrderDetails: Order = {
  id: 1,
  orderNumber: "#12345",
  date: "April 28, 2025",
  status: "delivered",
  total: 371.56,
  subtotal: 371.56,
  discount: 100,
  deliveryFee: 50,
  finalTotal: 267,
  shippingAddress: {
    fullName: "مصطفى محمد مصطفى",
    phone: "05xxxxxxxxx",
    city: "الرياض",
    street: "الشارع الرئيسي",
    building: "مبنى 5",
    apartment: "شقة 12",
    governorate: "الرياض",
  },
  deliveryMethod: "توصيل",
  paymentMethod: "مدى",
  notes: "",
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

const statusConfig = {
  pending: { label: "تم الطلب", color: "status-pending", icon: Clock },
  processing: {
    label: "قيد المعالجة",
    color: "status-processing",
    icon: Package,
  },
  ready: { label: "جاهز للاستلام", color: "status-ready", icon: PackageCheck },
  delivering: { label: "في الطريق", color: "status-delivering", icon: Truck },
  delivered: {
    label: "تم التسليم",
    color: "status-delivered",
    icon: CheckCircle,
  },
  cancelled: { label: "ملغي", color: "status-cancelled", icon: XCircle },
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const order = mockOrderDetails;
  const [orderNotes, setOrderNotes] = useState("");
const handleReturnClick = () => {
  router.push(`/account/orders/${order.id}/return`);
};
const handleProductsClick = () => {
  router.push(`/products`);
};

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto px-4 py-8 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            الطلب غير موجود
          </h2>
          <p className="text-gray-500 mb-4">
            عذراً، لا يمكننا العثور على هذا الطلب
          </p>
          <Link
            href="/account/orders"
            className="inline-block bg-[#000000] text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            العودة إلى الطلبات
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
      <div className="container mx-auto mb-3 ">
        
        <h1 className="text-[20px] font-bold mb-2 md:text-2xl text-[#180100] md:mb-4">تفاصيل الطلب</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* العمود الأيمن - معلومات الطلب والمنتجات */}
          <div className="lg:col-span-2 space-y-6">
            {/* المنتجات */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="">
                <div className="flex flex-col gap-3">
                  {/* الصف الأول: رقم الطلب والحالة */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <div className="flex gap-2 sm:gap-4 items-center text-base sm:text-[20px] font-bold text-[#180100]">
                        <h1 className="text-sm sm:text-base">رقم الطلب</h1>
                        <div className="flex gap-1 sm:gap-2 items-center">
                          <p className="font-bold text-gray-800 text-sm sm:text-base">
                            {order.orderNumber}
                          </p>
                          <IoCopyOutline className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    <div
                      className={`px-2 sm:px-3 py-1 rounded-full sm:text-sm font-medium flex items-center gap-1 sm:gap-1.5 ${status.color}`}
                    >
                      <StatusIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      {status.label}
                    </div>
                  </div>

                  {/* الصف الثاني: التاريخ */}
                  <p className="text-sm sm:text-[18px] text-[#333333]">
                    {order.date}
                  </p>
                </div>
              </div>
              <h2 className="text-lg font-bold text-gray-800 my-4">
                المنتجات ({order.items.length})
              </h2>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row items-center   gap-4 mb-4 md:mb-6 border  border-gray-500 rounded-[8px] p-3"
                  >
                    <div className=" w-20 h-20  overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-cover rounded-xl   w-[80px] h-[80px]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 md:text-right text-center ">
                      <div className="flex flex-col md:flex-row gap-3 md:justify-between items-center md:items-start">
                        <div>
                          <p className="font-bold text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.brand}</p>
                          <div className="flex gap-1 md:gap-3 mt-2 text-xs  text-black font-bold">
                            <span className="">اللون: <span className="text-gray-500">{item.color}</span></span>
                            <span>المقاس: <span className="text-gray-500"> {item.size}</span></span>
                            <span>الكمية:  <span className="text-gray-500">x{item.quantity}</span></span>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-800">
                            EGP {item.price.toFixed(2)}
                          </p>
                          {item.originalPrice && (
                            <p className="text-sm text-gray-400 line-through">
                              EGP {item.originalPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="">
                <OrderTracker currentStatus={order.status} />
              </div>
            </div>

            {/* ملخص الطلب */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 my-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                ملخص الطلب
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between ">
                  <span className="text-gray-500">المبلغ الإجمالي</span>
                  <span className="font-bold text-gray-800">
                    EGP {order.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between  ">
                  <span className="text-gray-500">خصم (-20%)</span>
                  <span className="font-bold text-[#EC221F]">
                    -EGP {order.discount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between ">
                  <span className="text-gray-500">رسوم التوصيــل</span>
                  <span className="font-bold text-gray-800">
                    EGP {order.deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
                  <span className="text-lg font-bold text-gray-800">
                    الإجمالـــــــي
                  </span>
                  <span className="text-xl font-bold ">
                    EGP {order.finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* العمود الأيسر - ملخص الطلب */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">
                معلومات الاتصال
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className=" font-bold">الاسم الكامل</span>
                  <span className="font-medium text-gray-600">
                    {order.shippingAddress.fullName}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="font-bold">رقم الجوال</span>
                  <span className="font-medium text-gray-600">
                    {order.shippingAddress.phone}
                  </span>
                </div>
              </div>
            </div>
            {/* طريقة الاستلام */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 my-3 md:my-6">
              <div className="flex items-center gap-3 mb-4">
               
                <h2 className="text-base font-bold ">
                  طريقة الاستلام
                </h2>
              </div>
              <span className="font-medium text-gray-800">
                {order.deliveryMethod}
              </span>
             <div className="flex items-center gap-2  border rounded-xl px-2 py-3 mt-3">
               <FaLocationDot className="text-gray-500"/>
              <p className="font-medium text-gray-400">
                

                {order.shippingAddress.city} , {order.shippingAddress.street} ,{" "}
                {order.shippingAddress.building} ,{" "}
                {order.shippingAddress.apartment}
              </p>
             </div>
           
            </div>
            {/* طريقة الدفع */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 my-3 md:my-6">
              <div className="flex items-center gap-3 mb-4">
               
                <h2 className="text-base font-bold">طريقة الدفع</h2>
              </div>
              <div className="flex items-center gap-3 p-2 border border-gray-300 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Image src="/images/payment/mada.png" width={40} height={40} alt="mada"/>
                </div>
                <div>
                  <p className=" text-gray-500">
                    {order.paymentMethod}
                  </p>
           
                </div>
              </div>
            </div>
            {/* ملاحظات */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">ملاحظات</h2>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="قم بإدخال ملاحظاتك الإضافية.."
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#EC221F] resize-none"
                rows={3}
              />
            </div>
            {/* أزرار الإجراءات */}
            <div className="flex gap-3 mt-3 md:mt-6 mx-2">
              {/* في حالة تم التسليم (delivered): نعرض الزرين معاً */}
              {order.status === "delivered" && (
                <>
                  <button onClick={handleReturnClick} className="flex-1 border-2 border-[#000000] text-[#000000] py-3 rounded-xl font-medium hover:bg-red-50 transition">
                    ارجاع
                  </button>
                  <button onClick={handleProductsClick} className="flex-1 bg-[#000000] text-white py-3 rounded-xl font-medium transition">
                    اعادة الطلب
                  </button>
                </>
              )}

              {/* في حالة قيد المراجعة (pending): نعرض زر إلغاء الطلب فقط */}
              {order.status === "pending" && (
                <button className="flex-1 border-2 border-red-500 text-red-600 py-3 rounded-xl font-medium hover:bg-red-50 transition">
                  الغاء الطلب
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .status-pending {
          background-color: #a0aec03d;
          color: #a0aec0;
        }
        .status-processing {
          background-color: #ed89363d;
          color: #ed8936;
        }
        .status-ready {
          background-color: #9f7aea3d;
          color: #9f7aea;
        }
        .status-delivering {
          background-color: #f6ad553d;
          color: #f6ad55;
        }
        .status-delivered {
          background-color: #48bb783d;
          color: #48bb78;
        }
        .status-cancelled {
          background-color: #f565653d;
          color: #f56565;
        }
      `}</style>
    </div>
  );
}
