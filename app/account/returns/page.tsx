// app/account/returns/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Package, ChevronDown, ChevronUp, Truck, CheckCircle, Clock, PackageCheck, XCircle, RefreshCw, AlertCircle, DollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IoCopyOutline } from "react-icons/io5";
import toast from "react-hot-toast";

// ========== إعدادات API ==========
const API_URL = 'https://dukanah.admin.t-carts.com/api';

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const getHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// ========== تعريف أنواع البيانات ==========

// منتج داخل المرتجع
interface ReturnProductItem {
  id: number;
  product_id?: number;
  name?: string;
  title?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  images?: string[];
  image?: string;
}

// بيانات الطلب داخل المرتجع
interface ReturnOrder {
  id: number;
  order_number: string;
  status: string;
  status_label: string;
  payment_method: string;
  payment_status: string;
  delivery_method: string;
  subtotal: number;
  coupon_discount_amount: number;
  total_discount_amount: number;
  subtotal_after_discount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  items: ReturnProductItem[];
  created_at: string;
}

// بيانات المرتجع الرئيسية
interface Return {
  id: number;
  returnNumber?: string;
  status: "pending" | "approved" | "picked_up" | "inspected" | "refunded" | "rejected" | "cancelled";
  status_label: string;
  refund_method: string;
  notes: string | null;
  order: ReturnOrder;
  created_at: string;
}

// الاستجابة من API
interface ReturnsResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    returns: Return[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
      next_page: string | null;
      previous_page: string | null;
    };
  };
}

// حالة المرتجع مع التنسيق العربي
const returnStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "قيد المراجعة", color: "status-return-pending", icon: Clock },
  approved: { label: "تم الموافقة", color: "status-return-approved", icon: CheckCircle },
  picked_up: { label: "تم الاستلام", color: "status-return-picked", icon: Truck },
  inspected: { label: "قيد الفحص", color: "status-return-inspected", icon: PackageCheck },
  refunded: { label: "تم الاسترداد", color: "status-return-refunded", icon: DollarSign },
  rejected: { label: "مرفوض", color: "status-return-rejected", icon: XCircle },
  cancelled: { label: "ملغي", color: "status-return-cancelled", icon: AlertCircle }
};

type FilterStatus = "all" | "pending" | "approved" | "picked_up" | "inspected" | "refunded" | "rejected" | "cancelled";

// ========== دالة جلب المرتجعات من API ==========
const fetchReturns = async (): Promise<Return[]> => {
  try {
    const response = await fetch(`${API_URL}/returns`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data: ReturnsResponse = await response.json();
    
    if (data.result === true && data.errNum === 200 && data.data.returns) {
      return data.data.returns.map((returnItem) => ({
        ...returnItem,
        returnNumber: `#R${String(returnItem.id).padStart(5, '0')}`,
      }));
    }
    return [];
  } catch (error) {
    console.error("❌ Error fetching returns:", error);
    toast.error("حدث خطأ في جلب بيانات المرتجعات");
    return [];
  }
};

// ========== تنظيف رابط الصورة ==========
const cleanImageUrl = (url: string): string => {
  if (!url) return "/images/placeholder-product.png";
  if (url.startsWith("/storage")) {
    return `https://dukanah.admin.t-carts.com${url}`;
  }
  return url;
};

// ========== تنسيق التاريخ ==========
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ========== ترجمة حالة المرتجع من الإنجليزية إلى العربية ==========
const mapStatusToKey = (statusLabel: string): string => {
  const statusMap: Record<string, string> = {
    "pending": "pending",
    "approved": "approved",
    "picked_up": "picked_up",
    "inspected": "inspected",
    "refunded": "refunded",
    "rejected": "rejected",
    "cancelled": "cancelled",
    "قيد المراجعة": "pending",
    "تم الموافقة": "approved",
    "تم الاستلام": "picked_up",
    "قيد الفحص": "inspected",
    "تم رد المبلغ": "refunded",
    "مرفوض": "rejected",
    "ملغي": "cancelled",
  };
  return statusMap[statusLabel] || statusLabel;
};

// ========== ترجمة طريقة استرداد المبلغ ==========
const translateRefundMethod = (method: string): string => {
  const methodMap: Record<string, string> = {
    "wallet": "محفظة التطبيق",
    "bank": "تحويل بنكي",
    "card": "بطاقة الدفع",
  };
  return methodMap[method] || method;
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReturnId, setExpandedReturnId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // جلب المرتجعات عند تحميل الصفحة
  useEffect(() => {
    const loadReturns = async () => {
      setLoading(true);
      const data = await fetchReturns();
      setReturns(data);
      setLoading(false);
    };
    
    loadReturns();
  }, []);

  const toggleExpand = (returnId: number) => {
    setExpandedReturnId(expandedReturnId === returnId ? null : returnId);
  };

  // نسخ النص
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`, {
      duration: 2000,
      position: "top-center",
    });
  };

  // فلترة المرتجعات حسب الحالة
  const filteredReturns = returns.filter(returnItem => {
    const statusKey = mapStatusToKey(returnItem.status_label);
    return filterStatus === "all" ? true : statusKey === filterStatus;
  });

  const statusFilters: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "الكل" },
    { value: "pending", label: "قيد المراجعة" },
    { value: "approved", label: "تم الموافقة" },
    { value: "picked_up", label: "تم الاستلام" },
    { value: "inspected", label: "قيد الفحص" },
    { value: "refunded", label: "تم الاسترداد" },
    { value: "rejected", label: "مرفوض" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC221F] mx-auto"></div>
          <p className="text-gray-500 mt-4">جاري تحميل المرتجعات...</p>
        </div>
      </div>
    );
  }

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
              <p className="text-gray-500 text-sm sm:text-base">
                {returns.length === 0 ? "لا توجد مرتجعات حتى الآن" : "لا توجد مرتجعات في هذه الفئة"}
              </p>
            </div>
          ) : (
            filteredReturns.map((returnItem) => {
              const statusKey = mapStatusToKey(returnItem.status_label);
              const status = returnStatusConfig[statusKey] || returnStatusConfig.pending;
              const StatusIcon = status.icon;
              const isExpanded = expandedReturnId === returnItem.id;
              const itemsCount = returnItem.order?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
              const totalRefund = returnItem.order?.total_amount || 0;

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
                              <p className="font-bold text-gray-800 text-sm sm:text-base">
                                #{String(returnItem.id).padStart(5, '0')}
                              </p>
                              <IoCopyOutline 
                                className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-[#EC221F] transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(`#${String(returnItem.id).padStart(5, '0')}`, "رقم المرتجع");
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 sm:gap-4 items-center text-sm sm:text-base text-gray-500">
                            <span className="hidden sm:inline">|</span>
                            <h1 className="text-xs sm:text-sm">الطلب</h1>
                            <div className="flex gap-1 sm:gap-2 items-center">
                              <p className="text-gray-600 text-xs sm:text-sm">{returnItem.order?.order_number || "-"}</p>
                              <IoCopyOutline 
                                className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-[#EC221F] transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(returnItem.order?.order_number || "", "رقم الطلب");
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 sm:gap-1.5 ${status.color}`}>
                          <StatusIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {returnItem.status_label || status.label}
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* الصف الثاني: التاريخ */}
                      <p className="text-sm sm:text-[18px] text-[#333333]">{formatDate(returnItem.created_at)}</p>
                      
                      {/* الصف الثالث: عدد المنتجات والمبلغ المسترد */}
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex gap-2 items-center text-sm sm:text-base">
                          <p className="text-[#180100]">المنتجات</p>
                          <span className="text-gray-500">({itemsCount})</span>
                        </div>
                        {statusKey === "refunded" && totalRefund > 0 && (
                          <div className="flex gap-1 items-center text-sm font-semibold text-green-600">
                            <DollarSign className="w-4 h-4" />
                            <span>تم استرداد EGP {totalRefund.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* تفاصيل المرتجع الموسعة */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50">
                      <div className="space-y-3 sm:space-y-4">
                        {returnItem.order?.items?.map((item, idx) => {
                          const productImage = item.images && item.images[0] 
                            ? cleanImageUrl(item.images[0]) 
                            : "/images/placeholder-product.png";
                          
                          return (
                            <div key={idx} className="flex gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                              {/* صورة المنتج */}
                              <div className="flex-shrink-0">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-[8px]  sm:rounded-xl overflow-hidden">
                                  <Image 
                                    src={productImage} 
                                    alt={item.title || item.name || "منتج"} 
                                    width={80} 
                                    height={80} 
                                    className="object-cover w-full h-full"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/images/placeholder-product.png";
                                    }}
                                  />
                                </div>
                              </div>
                              
                              {/* تفاصيل المنتج */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                                  <div>
                                    <p className="font-medium text-gray-800 text-sm sm:text-base">
                                      {item.title || item.name || "منتج"}
                                    </p>
                                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-gray-500">
                                      <span>الكمية: x{item.quantity}</span>
                                      <span>السعر: EGP {(item.unit_price || 0).toFixed(2)}</span>
                                    </div>
                                  </div>
                                  <div className="text-left sm:text-right">
                                    <p className="font-semibold text-[#000000] text-sm sm:text-base">
                                      EGP {(item.total_price || item.unit_price * item.quantity || 0).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* إجمالي المبلغ المسترد والمعلومات الإضافية */}
                        <div className="pt-2 sm:pt-3 space-y-2">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <div className="text-right">
                              <p className="text-xs sm:text-sm text-gray-500">إجمالي المسترد</p>
                              <p className="text-base sm:text-xl font-bold text-[#EC221F]">EGP {totalRefund.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          {returnItem.refund_method && statusKey === "refunded" && (
                            <div className="flex justify-end">
                              <p className="text-xs text-gray-500">
                                تم الاسترداد عبر: {translateRefundMethod(returnItem.refund_method)}
                              </p>
                            </div>
                          )}

                          {returnItem.notes && (
                            <div className="mt-3 p-3 bg-gray-100 rounded-[8px] ">
                              <p className="text-xs text-gray-600">
                                <span className="font-bold">ملاحظات:</span> {returnItem.notes}
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
          background-color: #A0AEC03D;
          color: #A0AEC0;
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