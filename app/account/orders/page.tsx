// app/account/orders/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Package, ChevronDown, ChevronUp, Truck, CheckCircle, Clock, PackageCheck, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IoCopyOutline } from "react-icons/io5";
import toast from "react-hot-toast";

// ========== تعريف الأنواع ==========
interface OrderItem {
  id: number;
  title: string;
  variant_id: number | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
  images: string[];
}

interface OrderAddress {
  id: number;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  city: {
    id: number;
    name: string;
    delivery_fee: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  date: string;
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
  address: OrderAddress | null;
  items: OrderItem[];
  created_at: string;
}

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

// صورة ثابتة للمنتجات التي لا تحتوي على صورة
const PLACEHOLDER_IMAGE = "/images/placeholder-product.png";

// ========== دالة جلب الطلبات ==========
const fetchOrders = async (): Promise<Order[]> => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    
    if (data.result === true && data.data && data.data.orders) {
      return data.data.orders.map(transformOrder);
    }
    return [];
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    toast.error("حدث خطأ في جلب الطلبات");
    return [];
  }
};

// ========== تحويل حالة الطلب من العربية إلى الإنجليزية ==========
const mapStatusToEnglish = (statusLabel: string): "pending" | "processing" | "ready" | "delivering" | "delivered" | "cancelled" => {
  const statusMap: Record<string, any> = {
    "ordered": "pending",
    "processing": "processing",
    "ready": "ready",
    "delivering": "delivering",
    "delivered": "delivered",
    "cancelled": "cancelled",
  };
  return statusMap[statusLabel] || "pending";
};

// ========== تحويل تاريخ الطلب ==========
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ========== تنظيف رابط الصورة ==========
const cleanImageUrl = (url: string): string => {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.startsWith("/storage")) {
    return `https://dukanah.admin.t-carts.com${url}`;
  }
  return url;
};

// ========== تحويل بيانات الطلب ==========
const transformOrder = (apiOrder: any): Order => {
  const englishStatus = mapStatusToEnglish(apiOrder.status_label);
  
  return {
    id: apiOrder.id,
    orderNumber: apiOrder.order_number,
    date: formatDate(apiOrder.created_at),
    status: englishStatus,
    status_label: apiOrder.status_label,
    payment_method: apiOrder.payment_method,
    payment_status: apiOrder.payment_status,
    delivery_method: apiOrder.delivery_method,
    subtotal: apiOrder.subtotal,
    coupon_discount_amount: apiOrder.coupon_discount_amount,
    total_discount_amount: apiOrder.total_discount_amount,
    subtotal_after_discount: apiOrder.subtotal_after_discount,
    shipping_amount: apiOrder.shipping_amount,
    tax_amount: apiOrder.tax_amount,
    total_amount: apiOrder.total_amount,
    notes: apiOrder.notes,
    address: apiOrder.address,
    items: apiOrder.items || [],
    created_at: apiOrder.created_at,
  };
};

// حالة الطلب مع التنسيق
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "تم الطلب", color: "status-pending", icon: Clock },
  processing: { label: "قيد المعالجة", color: "status-processing", icon: Package },
  ready: { label: "جاهز للاستلام", color: "status-ready", icon: PackageCheck },
  delivering: { label: "جارٍ التوصيل", color: "status-delivering", icon: Truck },
  delivered: { label: "تم التسليم", color: "status-delivered", icon: CheckCircle },
  cancelled: { label: "ملغي", color: "status-cancelled", icon: XCircle }
};

type FilterStatus = "all" | "pending" | "processing" | "ready" | "delivering" | "delivered" | "cancelled";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
      setLoading(false);
    };
    loadOrders();
  }, []);

  const toggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const filteredOrders = orders.filter(order => 
    filterStatus === "all" ? true : order.status === filterStatus
  );

  const statusFilters: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "الكل" },
    { value: "pending", label: "تم الطلب" },
    { value: "processing", label: "قيد المعالجة" },
    { value: "delivering", label: "جارٍ التوصيل" },
    { value: "ready", label: "جاهز للاستلام" },
    { value: "delivered", label: "تم التسليم" },
    { value: "cancelled", label: "ملغي" },
  ];

  const copyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber);
    toast.success("تم نسخ رقم الطلب");
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-l min-h-screen from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC221F] mx-auto"></div>
              <p className="text-gray-500 mt-4">جاري تحميل الطلبات...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-l min-h-screen from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-6">
        {/* العنوان */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Package className="w-6 h-6 sm:w-7 sm:h-7 text-[#EC221F]" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">طلباتي</h1>
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

        {/* قائمة الطلبات */}
        <div className="space-y-3 sm:space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="mt-8 md:mt-12 rounded-2xl p-8 sm:p-12 text-center">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">لا توجد طلبات في هذه الفئة</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const isExpanded = expandedOrderId === order.id;
             const itemsCount = order.items.length;

              return (
                <div key={order.id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* رأس الطلب */}
                  <div 
                    className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <div className="flex gap-2 sm:gap-4 items-center text-base sm:text-[20px] font-bold text-[#180100]">
  <h1 className="text-sm sm:text-base">رقم الطلب</h1>
  <div className="flex gap-1 sm:gap-2 items-center">
    <p className="font-bold text-gray-800 text-sm sm:text-base">
      <span className="hidden sm:inline">{order.orderNumber}</span>
      <span className="sm:hidden">
        {order.orderNumber.length > 10 ? order.orderNumber.substring(0, 10) + '...' : order.orderNumber}
      </span>
    </p>
    <IoCopyOutline 
      className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-[#EC221F] transition" 
      onClick={(e) => {
        e.stopPropagation();
        copyOrderNumber(order.orderNumber);
      }}
    />
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

                      <p className="text-sm sm:text-[18px] text-[#333333]">{order.date}</p>
                      
                      <div className="flex gap-2 items-center text-sm sm:text-base">
                        <p className="text-[#180100]">المنتجات</p>
                        <span className="text-gray-500">({itemsCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* تفاصيل الطلب الموسعة */}
                  {isExpanded && order.items.length > 0 && (
                    <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50">
                      <div className="space-y-3 sm:space-y-4">
                        {order.items.map((item, idx) => {
                          // الحصول على الصورة الأولى من الـ images array
                          const productImage = item.images && item.images.length > 0 
                            ? cleanImageUrl(item.images[0]) 
                            : PLACEHOLDER_IMAGE;
                          
                          return (
                            <div key={idx} className="flex gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                              {/* صورة المنتج */}
                              <Link 
                                href={`/account/orders/${order.id}`}
                                className="flex-shrink-0"
                              >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg sm:rounded-xl overflow-hidden hover:opacity-80 transition cursor-pointer">
                                  <Image 
                                    src={productImage} 
                                    alt={item.title} 
                                    width={80} 
                                    height={80} 
                                    className="object-cover w-full h-full"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                                    }}
                                  />
                                </div>
                              </Link>
                              
                              {/* تفاصيل المنتج */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                                  <div>
                                    <Link 
                                      href={`/account/orders/${order.id}`}
                                      className="hover:underline"
                                    >
                                      <p className="font-medium text-gray-800 text-sm sm:text-base cursor-pointer hover:text-[#EC221F] transition">
                                        {item.title}
                                      </p>
                                    </Link>
                                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-gray-500">
                                      <span>الكمية: x{item.quantity}</span>
                                      <span>السعر: EGP {item.unit_price.toFixed(2)}</span>
                                    </div>
                                  </div>
                                  <div className="text-left sm:text-right">
                                    <p className="font-semibold text-[#000000] text-sm sm:text-base">EGP {item.total_price.toFixed(2)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* إجمالي الطلب */}
                        <div className="pt-2 sm:pt-3 flex justify-between items-center">
                          <Link 
                            href={`/account/orders/${order.id}`}
                            className="text-[#EC221F] text-sm sm:text-base font-medium hover:underline"
                          >
                            عرض تفاصيل الطلب  
                          </Link>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm text-gray-500">إجمالي الطلب</p>
                            <p className="text-base sm:text-xl font-bold text-[#EC221F]">
                              <span className="text-xs md:text-base font-bold text-[#EC221F]">EGP</span> 
                              {order.total_amount.toFixed(2)}</p>
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