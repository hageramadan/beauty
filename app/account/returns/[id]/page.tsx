// app/account/returns/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  RefreshCw,
  CheckCircle,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  MapPin,
  CreditCard,
  FileText,
  MessageCircle,
  ChevronLeft,
  Download,
  Printer,
} from "lucide-react";

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
  returnReason: string;
  condition?: string;
}

// تعريف نوع المرتجع
interface ReturnDetails {
  id: number;
  returnNumber: string;
  orderNumber: string;
  orderDate: string;
  requestDate: string;
  status: "pending" | "approved" | "picked_up" | "inspected" | "refunded" | "rejected" | "cancelled";
  items: ReturnItem[];
  totalRefund: number;
  refundMethod: string;
  refundStatus: "pending" | "processing" | "completed";
  pickupAddress: {
    street: string;
    city: string;
    governorate: string;
    buildingNo: string;
    floorNo: string;
    apartmentNo: string;
  };
  timeline: {
    date: string;
    status: string;
    description: string;
    completed: boolean;
  }[];
  rejectionReason?: string;
  notes?: string;
}

// بيانات تجريبية لتفاصيل المرتجع
const mockReturnDetails: Record<string, ReturnDetails> = {
  "1": {
    id: 1,
    returnNumber: "#R00123",
    orderNumber: "#12345",
    orderDate: "28 أبريل 2025",
    requestDate: "29 أبريل 2025",
    status: "refunded",
    totalRefund: 371.56,
    refundMethod: "محفظة التطبيق",
    refundStatus: "completed",
    pickupAddress: {
      street: "شارع النيل",
      city: "الزمالك",
      governorate: "القاهرة",
      buildingNo: "10",
      floorNo: "3",
      apartmentNo: "5",
    },
    timeline: [
      {
        date: "29 أبريل 2025 - 10:30",
        status: "تم تقديم طلب المرتجع",
        description: "تم استلام طلب المرتجع بنجاح",
        completed: true,
      },
      {
        date: "30 أبريل 2025 - 14:15",
        status: "تم الموافقة على المرتجع",
        description: "تمت الموافقة على طلب المرتجع وجاري ترتيب عملية الاستلام",
        completed: true,
      },
      {
        date: "1 مايو 2025 - 11:00",
        status: "تم استلام المنتج",
        description: "تم استلام المنتج من مندوب الشحن",
        completed: true,
      },
      {
        date: "2 مايو 2025 - 09:30",
        status: "تم فحص المنتج",
        description: "تم فحص المنتج والتأكد من مطابقته لشروط الاسترجاع",
        completed: true,
      },
      {
        date: "3 مايو 2025 - 15:45",
        status: "تم استرداد المبلغ",
        description: "تم استرداد المبلغ إلى محفظة التطبيق",
        completed: true,
      },
    ],
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
        returnReason: "المنتج غير مطابق للصورة",
        condition: "لم يتم استخدامه، مع البطاقات",
      },
    ],
  },
  "2": {
    id: 2,
    returnNumber: "#R00124",
    orderNumber: "#12346",
    orderDate: "27 أبريل 2025",
    requestDate: "28 أبريل 2025",
    status: "approved",
    totalRefund: 743.12,
    refundMethod: "بطاقة الائتمان",
    refundStatus: "pending",
    pickupAddress: {
      street: "شارع البحر الأعظم",
      city: "العجوزة",
      governorate: "الجيزة",
      buildingNo: "25",
      floorNo: "2",
      apartmentNo: "8",
    },
    timeline: [
      {
        date: "28 أبريل 2025 - 09:20",
        status: "تم تقديم طلب المرتجع",
        description: "تم استلام طلب المرتجع بنجاح",
        completed: true,
      },
      {
        date: "29 أبريل 2025 - 16:00",
        status: "تم الموافقة على المرتجع",
        description: "تمت الموافقة على طلب المرتجع وجاري ترتيب عملية الاستلام",
        completed: true,
      },
      {
        date: "جاري التحديث",
        status: "في انتظار استلام المنتج",
        description: "سيتم التواصل معك لتحديد موعد الاستلام",
        completed: false,
      },
    ],
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
        returnReason: "مقاس غير مناسب",
        condition: "بحالة جيدة",
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
        returnReason: "اللون مختلف",
        condition: "لم يستخدم",
      },
    ],
  },
  "3": {
    id: 3,
    returnNumber: "#R00125",
    orderNumber: "#12347",
    orderDate: "26 أبريل 2025",
    requestDate: "27 أبريل 2025",
    status: "picked_up",
    totalRefund: 471.56,
    refundMethod: "محفظة التطبيق",
    refundStatus: "pending",
    pickupAddress: {
      street: "شارع التسعين",
      city: "مدينة نصر",
      governorate: "القاهرة",
      buildingNo: "5",
      floorNo: "1",
      apartmentNo: "2",
    },
    timeline: [
      {
        date: "27 أبريل 2025 - 11:45",
        status: "تم تقديم طلب المرتجع",
        description: "تم استلام طلب المرتجع بنجاح",
        completed: true,
      },
      {
        date: "28 أبريل 2025 - 10:30",
        status: "تم الموافقة على المرتجع",
        description: "تمت الموافقة على طلب المرتجع",
        completed: true,
      },
      {
        date: "29 أبريل 2025 - 14:00",
        status: "تم استلام المنتج",
        description: "تم استلام المنتج من مندوب الشحن",
        completed: true,
      },
      {
        date: "جاري التحديث",
        status: "جاري فحص المنتج",
        description: "سيتم فحص المنتج والتأكد من حالته",
        completed: false,
      },
    ],
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
        returnReason: "منتج تالف",
        condition: "به عيب في الصناعة",
      },
    ],
  },
  "6": {
    id: 6,
    returnNumber: "#R00128",
    orderNumber: "#12350",
    orderDate: "23 أبريل 2025",
    requestDate: "24 أبريل 2025",
    status: "rejected",
    totalRefund: 0,
    refundMethod: "-",
    refundStatus: "pending",
    pickupAddress: {
      street: "شارع الهرم",
      city: "الهرم",
      governorate: "الجيزة",
      buildingNo: "15",
      floorNo: "4",
      apartmentNo: "12",
    },
    timeline: [
      {
        date: "24 أبريل 2025 - 08:30",
        status: "تم تقديم طلب المرتجع",
        description: "تم استلام طلب المرتجع بنجاح",
        completed: true,
      },
      {
        date: "25 أبريل 2025 - 13:15",
        status: "تم فحص الطلب",
        description: "تم مراجعة طلب المرتجع",
        completed: true,
      },
      {
        date: "26 أبريل 2025 - 11:00",
        status: "تم رفض المرتجع",
        description: "لم يتم الموافقة على طلب المرتجع للأسباب التالية",
        completed: true,
      },
    ],
    rejectionReason: "المنتج تم استخدامه ولا يوجد به أي عيب مصنعي، ولا ينطبق عليه سياسة الاسترجاع",
    items: [
      {
        id: 7,
        name: "قميص",
        brand: "Defacto",
        color: "اسود",
        size: "M",
        price: 299.0,
        quantity: 1,
        image: "/images/products/product2.png",
        returnReason: "لا يوجد عيب في المنتج",
      },
    ],
  },
};

// حالة المرتجع مع التنسيق
const returnStatusConfig = {
  pending: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  approved: { label: "تم الموافقة", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  picked_up: { label: "تم الاستلام", color: "bg-purple-100 text-purple-800", icon: Truck },
  inspected: { label: "قيد الفحص", color: "bg-indigo-100 text-indigo-800", icon: PackageCheck },
  refunded: { label: "تم الاسترداد", color: "bg-green-100 text-green-800", icon: DollarSign },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-800", icon: XCircle },
  cancelled: { label: "ملغي", color: "bg-gray-100 text-gray-600", icon: AlertCircle },
};

export default function ReturnDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const returnId = params.id as string;
  const returnDetails = mockReturnDetails[returnId];

  const [showContactSupport, setShowContactSupport] = useState(false);

  if (!returnDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">لم يتم العثور على المرتجع</h2>
          <p className="text-gray-500 mb-6">رقم المرتجع غير موجود أو تم حذفه</p>
          <Link
            href="/account/returns"
            className="inline-flex items-center gap-2 bg-[#EC221F] text-white px-6 py-2 rounded-lg hover:bg-[#d11d1a] transition"
          >
            <ArrowRight className="w-5 h-5" />
            العودة إلى المرتجعات
          </Link>
        </div>
      </div>
    );
  }

  const status = returnStatusConfig[returnDetails.status];
  const StatusIcon = status?.icon || AlertCircle;

  const getRefundStatusBadge = () => {
    switch (returnDetails.refundStatus) {
      case "completed":
        return { label: "تم الاسترداد", color: "bg-green-100 text-green-800" };
      case "processing":
        return { label: "جاري الاسترداد", color: "bg-yellow-100 text-yellow-800" };
      default:
        return { label: "في الانتظار", color: "bg-gray-100 text-gray-600" };
    }
  };

  const refundStatusBadge = getRefundStatusBadge();

  return (
    <div className="bg-gradient-to-l min-h-screen from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-6">
        {/* رأس الصفحة */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <Link
            href="/account/returns"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#EC221F] transition text-sm sm:text-base"
          >
            <ChevronLeft className="w-5 h-5" />
            العودة إلى المرتجعات
          </Link>
          
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <Printer className="w-4 h-4" />
              طباعة
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <Download className="w-4 h-4" />
              تحميل PDF
            </button>
          </div>
        </div>

        {/* العنوان الرئيسي */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="w-7 h-7 text-[#EC221F]" />
              <h1 className="text-2xl font-bold text-gray-800">تفاصيل المرتجع</h1>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <span>رقم المرتجع: {returnDetails.returnNumber}</span>
              <span>•</span>
              <span>الطلب: {returnDetails.orderNumber}</span>
              <span>•</span>
              <span>تاريخ الطلب: {returnDetails.orderDate}</span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${status?.color}`}>
            <StatusIcon className="w-4 h-4" />
            {status?.label}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* العمود الأيمن - تفاصيل المرتجع */}
          <div className="lg:col-span-2 space-y-6">
            {/* المنتجات المرتجعة */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#EC221F] rounded-full"></span>
                المنتجات المرتجعة
              </h2>
              <div className="space-y-4">
                {returnDetails.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} width={80} height={80} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <RefreshCw className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.brand}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                        <span>اللون: {item.color}</span>
                        <span>المقاس: {item.size}</span>
                        <span>الكمية: x{item.quantity}</span>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-semibold text-gray-800">EGP {item.price.toFixed(2)}</span>
                        {item.originalPrice && (
                          <span className="text-gray-400 line-through mr-2">EGP {item.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="mt-2 p-2 bg-orange-50 rounded-md">
                        <p className="text-xs text-orange-700 flex items-start gap-1">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          سبب الاسترجاع: {item.returnReason}
                        </p>
                        {item.condition && (
                          <p className="text-xs text-gray-600 mt-1 mr-4">
                            حالة المنتج: {item.condition}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* الجدول الزمني */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#EC221F] rounded-full"></span>
                حالة المرتجع
              </h2>
              <div className="relative">
                {returnDetails.timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-3 mb-6 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        event.completed ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
                      }`}>
                        {event.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      {idx < returnDetails.timeline.length - 1 && (
                        <div className={`w-0.5 h-full min-h-[50px] ${
                          event.completed ? "bg-green-500" : "bg-gray-200"
                        }`}></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-gray-800">{event.status}</p>
                      <p className="text-sm text-gray-500">{event.date}</p>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* سبب الرفض (إذا موجود) */}
            {returnDetails.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <div className="flex gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-800 mb-1">سبب رفض المرتجع</h3>
                    <p className="text-red-700 text-sm">{returnDetails.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* العمود الأيسر - معلومات إضافية */}
          <div className="space-y-6">
            {/* ملخص المرتجع */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#EC221F]" />
                ملخص المرتجع
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">تاريخ الطلب</span>
                  <span className="font-medium">{returnDetails.orderDate}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">تاريخ طلب المرتجع</span>
                  <span className="font-medium">{returnDetails.requestDate}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">عدد المنتجات</span>
                  <span className="font-medium">
                    {returnDetails.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">إجمالي المسترد</span>
                  <span className="font-bold text-lg text-[#EC221F]">EGP {returnDetails.totalRefund.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">طريقة الاسترداد</span>
                  <span className="font-medium flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    {returnDetails.refundMethod}
                  </span>
                </div>
                {returnDetails.totalRefund > 0 && (
                  <div className="flex justify-between pt-2">
                    <span className="text-gray-600">حالة الاسترداد</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${refundStatusBadge.color}`}>
                      {refundStatusBadge.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* عنوان الاستلام */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#EC221F]" />
                عنوان الاستلام
              </h2>
              <div className="space-y-2 text-sm">
                <p className="text-gray-800">
                  {returnDetails.pickupAddress.street && `${returnDetails.pickupAddress.street}، `}
                  {returnDetails.pickupAddress.buildingNo && `مبنى ${returnDetails.pickupAddress.buildingNo}، `}
                  {returnDetails.pickupAddress.floorNo && `دور ${returnDetails.pickupAddress.floorNo}، `}
                  {returnDetails.pickupAddress.apartmentNo && `شقة ${returnDetails.pickupAddress.apartmentNo}`}
                </p>
                <p className="text-gray-600">
                  {returnDetails.pickupAddress.city}، {returnDetails.pickupAddress.governorate}
                </p>
              </div>
            </div>

            {/* معلومات إضافية */}
            {(returnDetails.status === "pending" || returnDetails.status === "approved") && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  الخطوات القادمة
                </h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• سيتم التواصل معك خلال 24 ساعة لتحديد موعد الاستلام</li>
                  <li>• تأكد من تجهيز المنتج مع البطاقات والأختام</li>
                  <li>• بعد الاستلام سيتم فحص المنتج خلال 3-5 أيام عمل</li>
                </ul>
              </div>
            )}

       
          </div>
        </div>
      </div>
    </div>
  );
}