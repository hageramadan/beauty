// app/account/orders/page.tsx
"use client";

import { useState } from "react";
import { Package, ChevronDown, ChevronUp, Truck, CheckCircle, Clock, PackageCheck, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IoCopyOutline } from "react-icons/io5";

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
  status: "pending" | "processing" | "ready" | "delivering" | "delivered" | "cancelled";
  items: OrderItem[];
  total: number;
  shippingAddress?: string;
}

// بيانات تجريبية
const mockOrders: Order[] = [
  {
    id: 1,
    orderNumber: "#12345",
    date: "28 أبريل 2025",
    status: "delivered",
    total: 843.12,
    items: [
      {
        id: 1,
        name: "بلوزه حرير",
        brand: "Defacto",
        color: "بيج",
        size: "L",
        price: 371.56,
        originalPrice: 471.56,
        quantity: 1,
        image: "/images/products/product1.png"
      },
      {
        id: 2,
        name: "قميص",
        brand: "Defacto",
        color: "ابيض",
        size: "L",
        price: 371.56,
        originalPrice: 471.56,
        quantity: 1,
        image: "/images/products/product2.png"
      }
    ]
  },
  {
    id: 2,
    orderNumber: "#12346",
    date: "28 أبريل 2025",
    status: "processing",
    total: 743.12,
    items: [
      {
        id: 3,
        name: "بلوزه حرير",
        brand: "Defacto",
        color: "بيج",
        size: "L",
        price: 371.56,
        originalPrice: 471.56,
        quantity: 1,
        image: "/images/products/product1.png"
      },
      {
        id: 4,
        name: "قميص",
        brand: "Defacto",
        color: "ابيض",
        size: "L",
        price: 371.56,
        originalPrice: 471.56,
        quantity: 1,
        image: "/images/products/product2.png"
      }
    ]
  },
  {
    id: 3,
    orderNumber: "#12347",
    date: "27 أبريل 2025",
    status: "delivering",
    total: 1486.24,
    items: [
      {
        id: 5,
        name: "بلوزه حرير",
        brand: "Defacto",
        color: "بيج",
        size: "L",
        price: 371.56,
        originalPrice: 471.56,
        quantity: 2,
        image: "/images/products/product1.png"
      },
      {
        id: 6,
        name: "قميص",
        brand: "Defacto",
        color: "ابيض",
        size: "L",
        price: 371.56,
        originalPrice: 471.56,
        quantity: 2,
        image: "/images/products/product2.png"
      }
    ]
  },
  {
    id: 4,
    orderNumber: "#12348",
    date: "26 أبريل 2025",
    status: "ready",
    total: 471.56,
    items: [
      {
        id: 7,
        name: "قميص",
        brand: "Defacto",
        color: "ابيض",
        size: "L",
        price: 471.56,
        quantity: 1,
        image: "/images/products/product2.png"
      }
    ]
  },
  {
    id: 5,
    orderNumber: "#12349",
    date: "25 أبريل 2025",
    status: "pending",
    total: 371.56,
    items: [
      {
        id: 8,
        name: "بلوزه حرير",
        brand: "Defacto",
        color: "بيج",
        size: "L",
        price: 371.56,
        quantity: 1,
        image: "/images/products/product1.png"
      }
    ]
  }
];

// حالة الطلب مع التنسيق العربي - استخدام كلاس ثابت
const statusConfig = {
  pending: { label: "تم الطلب", color: "status-pending", icon: Clock },
  processing: { label: "قيد المعالجة", color: "status-processing", icon: Package },
  ready: { label: "جاهز للاستلام", color: "status-ready", icon: PackageCheck },
  delivering: { label: "جارٍ التوصيل", color: "status-delivering", icon: Truck },
  delivered: { label: "تم التسليم", color: "status-delivered", icon: CheckCircle },
  cancelled: { label: "ملغي", color: "status-cancelled", icon: XCircle }
};

type FilterStatus = "all" | "pending" | "processing" | "ready" | "delivering" | "delivered" | "NotDelivered" | "cancelled";

export default function OrdersPage() {
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const toggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const filteredOrders = mockOrders.filter(order => 
    filterStatus === "all" ? true : order.status === filterStatus
  );

  const statusFilters: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "الكل" },
    { value: "pending", label: "تم الطلب" },
    { value: "processing", label: "قيد المعالجة" },
    { value: "delivering", label: "جارٍ التوصيل" },
    { value: "ready", label: "جاهز للاستلام" },
    { value: "delivered", label: "تم التسليم" },
    { value: "NotDelivered", label: "لم يتم التوصيل" },
    { value: "cancelled", label: "ملغي" },
  ];

  return (
    <div className="bg-gradient-to-l min-h-screen from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-6 ">
        {/* العنوان */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Package className="w-6 h-6 sm:w-7 sm:h-7 text-[#EC221F]" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">طلباتي</h1>
        </div>

        {/* فلتر الحالات - تحسين للموبايل */}
        <div className="flex flex-nowrap gap-2 mb-6 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:gap-3 md:gap-4">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`whitespace-nowrap px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition ${
                filterStatus === filter.value
                  ? "bg-[#000000] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* قائمة الطلبات */}
        <div className="space-y-3 sm:space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="mt-8 md:mt-12 rounded-2xl p-8 sm:p-12 text-center">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">لا توجد طلبات في هذه الفئة</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              const isExpanded = expandedOrderId === order.id;
              const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <div key={order.id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* رأس الطلب */}
                  <div 
                    className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="flex flex-col gap-3">
                      {/* الصف الأول: رقم الطلب والحالة */}
                      <div className="flex justify-between items-start">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <div className="flex gap-2 sm:gap-4 items-center text-base sm:text-[20px] font-bold text-[#180100]">
                            <h1 className="text-sm sm:text-base">رقم الطلب</h1>
                            <div className="flex gap-1 sm:gap-2 items-center">
                              <p className="font-bold text-gray-800 text-sm sm:text-base">{order.orderNumber}</p>
                              <IoCopyOutline className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
                            </div>
                          </div>
                        </div>
                        
                        <div className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 sm:gap-1.5 ${status.color}`}>
                          <StatusIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {status.label}
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* الصف الثاني: التاريخ */}
                      <p className="text-sm sm:text-[18px] text-[#333333]">{order.date}</p>
                      
                      {/* الصف الثالث: عدد المنتجات */}
                      <div className="flex gap-2 items-center text-sm sm:text-base">
                        <p className="text-[#180100]">المنتاجات</p>
                        <span className="text-gray-500">({itemsCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* تفاصيل الطلب الموسعة - تحسين للموبايل */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50">
                      <div className="space-y-3 sm:space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                            {/* صورة المنتج - قابلة للنقر */}
                            <Link 
                              href={`/account/orders/${order.id}`}
                              className="flex-shrink-0"
                            >
                              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg sm:rounded-xl overflow-hidden hover:opacity-80 transition cursor-pointer">
                                {item.image ? (
                                  <Image src={item.image} alt={item.name} width={80} height={80} className="object-cover w-full h-full" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Package className="w-6 h-6 sm:w-8 sm:h-8" />
                                  </div>
                                )}
                              </div>
                            </Link>
                            
                            {/* تفاصيل المنتج - اسم المنتج قابل للنقر */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                                <div>
                                  <Link 
                                    href={`/account/orders/${order.id}`}
                                    className="hover:underline"
                                  >
                                    <p className="font-medium text-gray-800 text-sm sm:text-base cursor-pointer hover:text-[#EC221F] transition">
                                      {item.name}
                                    </p>
                                  </Link>
                                  <p className="text-[11px] sm:text-xs text-gray-500">{item.brand}</p>
                                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-gray-500">
                                    <span>اللون: {item.color}</span>
                                    <span>المقاس: {item.size}</span>
                                    <span>الكمية: x{item.quantity}</span>
                                  </div>
                                </div>
                                <div className="text-left sm:text-right">
                                  <p className="font-semibold text-[#000000] text-sm sm:text-base">EGP {item.price.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* إجمالي الطلب */}
                        <div className="pt-2 sm:pt-3 flex justify-between items-center">
                          <Link 
                            href={`/account/orders/${order.id}`}
                            className="text-[#EC221F] text-sm sm:text-base font-medium hover:underline"
                          >
                            عرض تفاصيل الطلب كامل →
                          </Link>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm text-gray-500">إجمالي الطلب</p>
                            <p className="text-lg sm:text-xl font-bold text-[#EC221F]">EGP {order.total.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* إضافة CSS للألوان */}
      <style jsx global>{`
        .status-pending {
          background-color: #A0AEC03D;
          color: #A0AEC0;
        }
        .status-processing {
          background-color: #ED89363D;
          color: #ED8936;
        }
        .status-ready {
          background-color: #9F7AEA3D;
          color: #9F7AEA;
        }
        .status-delivering {
          background-color: #F6AD553D;
          color: #F6AD55;
        }
        .status-delivered {
          background-color: #48BB783D;
          color: #48BB78;
        }
        .status-cancelled {
          background-color: #F565653D;
          color: #F56565;
        }
      `}</style>
    </div>
  );
}