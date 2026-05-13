// app/account/returns/page.tsx
"use client";

import { useState } from "react";
import { Package, ChevronDown, ChevronUp, Truck, CheckCircle, Clock, PackageCheck, XCircle, RefreshCw, AlertCircle, DollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IoCopyOutline } from "react-icons/io5";

// تعريف نوع المنتج في المرتجع
interface ReturnItem {
  id: number;
  name: string;
  brand: string;
  color: string;
  size: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  returnReason?: string;
}

// تعريف نوع المرتجع
interface Return {
  id: number;
  returnNumber: string;
  orderNumber: string;
  date: string;
  status: "pending" | "approved" | "picked_up" | "inspected" | "refunded" | "rejected" | "cancelled";
  items: ReturnItem[];
  totalRefund: number;
  refundMethod?: string;
  pickupAddress?: string;
}

// بيانات تجريبية للمرتجعات
const mockReturns: Return[] = [
  {
    id: 1,
    returnNumber: "#R00123",
    orderNumber: "#12345",
    date: "28 أبريل 2025",
    status: "refunded",
    totalRefund: 371.56,
    refundMethod: "محفظة التطبيق",
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
        image: "/images/products/product1.png",
        returnReason: "المنتج غير مطابق للصورة"
      }
    ]
  },
  {
    id: 2,
    returnNumber: "#R00124",
    orderNumber: "#12346",
    date: "27 أبريل 2025",
    status: "approved",
    totalRefund: 743.12,
    items: [
      {
        id: 2,
        name: "بلوزه حرير",
        brand: "Defacto",
        color: "بيج",
        size: "L",
        price: 371.56,
        originalPrice: 471.56,
        quantity: 1,
        image: "/images/products/product1.png",
        returnReason: "مقاس غير مناسب"
      },
      {
        id: 3,
        name: "قميص",
        brand: "Defacto",
        color: "ابيض",
        size: "L",
        price: 371.56,
        originalPrice: 471.56,
        quantity: 1,
        image: "/images/products/product2.png",
        returnReason: "اللون مختلف"
      }
    ]
  },
  {
    id: 3,
    returnNumber: "#R00125",
    orderNumber: "#12347",
    date: "26 أبريل 2025",
    status: "picked_up",
    totalRefund: 471.56,
    items: [
      {
        id: 4,
        name: "قميص",
        brand: "Defacto",
        color: "ابيض",
        size: "L",
        price: 471.56,
        quantity: 1,
        image: "/images/products/product2.png",
        returnReason: "منتج تالف"
      }
    ]
  },
  {
    id: 4,
    returnNumber: "#R00126",
    orderNumber: "#12348",
    date: "25 أبريل 2025",
    status: "inspected",
    totalRefund: 371.56,
    items: [
      {
        id: 5,
        name: "بلوزه حرير",
        brand: "Defacto",
        color: "بيج",
        size: "L",
        price: 371.56,
        quantity: 1,
        image: "/images/products/product1.png",
        returnReason: "حجم غير مناسب"
      }
    ]
  },
  {
    id: 5,
    returnNumber: "#R00127",
    orderNumber: "#12349",
    date: "24 أبريل 2025",
    status: "pending",
    totalRefund: 843.12,
    items: [
      {
        id: 6,
        name: "بلوزه حرير",
        brand: "Defacto",
        color: "بيج",
        size: "L",
        price: 371.56,
        quantity: 2,
        image: "/images/products/product1.png",
        returnReason: "غير مرغوب"
      }
    ]
  },
  {
    id: 6,
    returnNumber: "#R00128",
    orderNumber: "#12350",
    date: "23 أبريل 2025",
    status: "rejected",
    totalRefund: 0,
    items: [
      {
        id: 7,
        name: "قميص",
        brand: "Defacto",
        color: "اسود",
        size: "M",
        price: 299.00,
        quantity: 1,
        image: "/images/products/product2.png",
        returnReason: "لا يوجد عيب في المنتج"
      }
    ]
  }
];

// حالة المرتجع مع التنسيق العربي
const returnStatusConfig = {
  pending: { label: "قيد المراجعة", color: "status-return-pending", icon: Clock },
  approved: { label: "تم الموافقة", color: "status-return-approved", icon: CheckCircle },
  picked_up: { label: "تم الاستلام", color: "status-return-picked", icon: Truck },
  inspected: { label: "قيد الفحص", color: "status-return-inspected", icon: PackageCheck },
  refunded: { label: "تم الاسترداد", color: "status-return-refunded", icon: DollarSign },
  rejected: { label: "مرفوض", color: "status-return-rejected", icon: XCircle },
  cancelled: { label: "ملغي", color: "status-return-cancelled", icon: AlertCircle }
};

type FilterStatus = "all" | "pending" | "approved" | "picked_up" | "inspected" | "refunded" | "rejected" | "cancelled";

export default function ReturnsPage() {
  const [expandedReturnId, setExpandedReturnId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const toggleExpand = (returnId: number) => {
    setExpandedReturnId(expandedReturnId === returnId ? null : returnId);
  };

  const filteredReturns = mockReturns.filter(returnItem => 
    filterStatus === "all" ? true : returnItem.status === filterStatus
  );

  const statusFilters: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "الكل" },
    { value: "pending", label: "قيد المراجعة" },
    { value: "approved", label: "تم الموافقة" },
    { value: "picked_up", label: "تم الاستلام" },
    { value: "inspected", label: "قيد الفحص" },
    { value: "refunded", label: "تم الاسترداد" },
    { value: "rejected", label: "مرفوض" }
  ];

  return (
    <div className="bg-gradient-to-l min-h-screen from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-6">
        {/* العنوان */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <RefreshCw className="w-6 h-6 sm:w-7 sm:h-7 text-[#EC221F]" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">المرتجعات</h1>
        </div>

        {/* فلتر الحالات */}
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

        {/* قائمة المرتجعات */}
        <div className="space-y-3 sm:space-y-4">
          {filteredReturns.length === 0 ? (
            <div className="mt-8 md:mt-12 rounded-2xl p-8 sm:p-12 text-center">
              <RefreshCw className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">لا توجد مرتجعات في هذه الفئة</p>
            </div>
          ) : (
            filteredReturns.map((returnItem) => {
              const status = returnStatusConfig[returnItem.status];
              const StatusIcon = status.icon;
              const isExpanded = expandedReturnId === returnItem.id;
              const itemsCount = returnItem.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <div key={returnItem.id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* رأس المرتجع */}
                  <div 
                    className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => toggleExpand(returnItem.id)}
                  >
                    <div className="flex flex-col gap-3">
                      {/* الصف الأول: رقم المرتجع ورقم الطلب والحالة */}
                      <div className="flex justify-between items-start">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <div className="flex gap-2 sm:gap-4 items-center text-base sm:text-[20px] font-bold text-[#180100]">
                            <h1 className="text-sm sm:text-base">رقم المرتجع</h1>
                            <div className="flex gap-1 sm:gap-2 items-center">
                              <p className="font-bold text-gray-800 text-sm sm:text-base">{returnItem.returnNumber}</p>
                              <IoCopyOutline className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
                            </div>
                          </div>
                          <div className="flex gap-2 sm:gap-4 items-center text-sm sm:text-base text-gray-500">
                            <span className="hidden sm:inline">|</span>
                            <h1 className="text-xs sm:text-sm">الطلب</h1>
                            <div className="flex gap-1 sm:gap-2 items-center">
                              <p className="text-gray-600 text-xs sm:text-sm">{returnItem.orderNumber}</p>
                              <IoCopyOutline className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer" />
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
                      <p className="text-sm sm:text-[18px] text-[#333333]">{returnItem.date}</p>
                      
                      {/* الصف الثالث: عدد المنتجات والمبلغ المسترد */}
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex gap-2 items-center text-sm sm:text-base">
                          <p className="text-[#180100]">المنتاجات</p>
                          <span className="text-gray-500">({itemsCount})</span>
                        </div>
                        {returnItem.status === "refunded" && returnItem.totalRefund > 0 && (
                          <div className="flex gap-1 items-center text-sm font-semibold text-green-600">
                            <DollarSign className="w-4 h-4" />
                            <span>تم استرداد EGP {returnItem.totalRefund.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* تفاصيل المرتجع الموسعة */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50">
                      <div className="space-y-3 sm:space-y-4">
                        {returnItem.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                            {/* صورة المنتج */}
                            <Link 
                              href={`/account/returns/${returnItem.id}`}
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
                            
                            {/* تفاصيل المنتج */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                                <div>
                                  <Link 
                                    href={`/account/returns/${returnItem.id}`}
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
                                  {item.returnReason && (
                                    <div className="mt-2 flex items-start gap-1 text-[10px] sm:text-xs text-orange-600 bg-orange-50 p-1.5 sm:p-2 rounded-md">
                                      <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5 flex-shrink-0" />
                                      <span>سبب الاسترجاع: {item.returnReason}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-left sm:text-right">
                                  <p className="font-semibold text-[#000000] text-sm sm:text-base">EGP {item.price.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* إجمالي المبلغ المسترد والمعلومات الإضافية */}
                        <div className="pt-2 sm:pt-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <Link 
                              href={`/account/returns/${returnItem.id}`}
                              className="text-[#EC221F] text-sm sm:text-base font-medium hover:underline"
                            >
                              عرض تفاصيل المرتجع كامل →
                            </Link>
                            <div className="text-right">
                              <p className="text-xs sm:text-sm text-gray-500">إجمالي المسترد</p>
                              <p className="text-lg sm:text-xl font-bold text-[#EC221F]">EGP {returnItem.totalRefund.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          {returnItem.refundMethod && returnItem.status === "refunded" && (
                            <div className="flex justify-end">
                              <p className="text-xs text-gray-500">
                                تم الاسترداد عبر: {returnItem.refundMethod}
                              </p>
                            </div>
                          )}
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
        .status-return-pending {
          background-color: #A0AEC03D;
          color: #A0AEC0;
        }
        .status-return-approved {
          background-color: #48BB783D;
          color: #48BB78;
        }
        .status-return-picked {
          background-color: #4299E13D;
          color: #4299E1;
        }
        .status-return-inspected {
          background-color: #9F7AEA3D;
          color: #9F7AEA;
        }
        .status-return-refunded {
          background-color: #48BB783D;
          color: #48BB78;
        }
        .status-return-rejected {
          background-color: #F565653D;
          color: #F56565;
        }
        .status-return-cancelled {
          background-color: #A0AEC03D;
          color: #A0AEC0;
        }
      `}</style>
    </div>
  );
}