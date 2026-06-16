// components/OrderTracker.tsx
"use client";

import { Clock, Box, Bike, Home, XCircle, PackageCheck, Truck, AlertCircle } from "lucide-react";
import { FaCircleCheck } from "react-icons/fa6";

// ✅ تصدير النوع هنا
export type OrderStatus = 
  | "ordered"        // تم الطلب
  | "processing"     // قيد المعالجة
  | "ready_for_receive" // جاهز للاستلام
  | "delivering"     // جارٍ التوصيل
  | "delivered"      // تم التسليم
  | "not_delivered"  // لم يتم التسليم
  | "cancelled";     // ملغي

interface OrderTrackerProps {
  currentStatus: OrderStatus;
}

export default function OrderTracker({ currentStatus }: OrderTrackerProps) {
  // تحديد الخطوة الحالية بناءً على الحالة
  const getCurrentStep = (): number => {
    switch (currentStatus) {
      case "ordered":
        return 0;
      case "processing":
        return 1;
      case "ready_for_receive":
        return 2;
      case "delivering":
        return 3;
      case "delivered":
        return 4;
      case "not_delivered":
        return 4; // نفس خطوة delivered لكن بلون مختلف
      case "cancelled":
        return 5; // خطوة منفصلة للإلغاء
      default:
        return 0;
    }
  };

  // تحديد أيقونة خاصة للحالات الاستثنائية
  const getStatusIcon = () => {
    switch (currentStatus) {
      case "not_delivered":
        return <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500" />;
      default:
        return null;
    }
  };

  // تحديد لون الحالة
  const getStatusColor = () => {
    switch (currentStatus) {
      case "not_delivered":
        return "border-red-500 bg-red-50";
      case "cancelled":
        return "border-red-500 bg-red-50";
      case "delivered":
        return "border-green-500 bg-green-50";
      default:
        return "border-[#2D93CA] bg-white";
    }
  };

  // خطوات الطلب الأساسية
  const steps = [
    { label: "تم الطلب", icon: Clock },
    { label: "قيد المعالجة", icon: Box },
    { label: "جاهز للاستلام", icon: PackageCheck },
    { label: "في الطريق", icon: Truck },
    { label: "تم التسليم", icon: Home },
  ];

  // إضافة خطوة الإلغاء إذا كانت الحالة ملغية أو لم يتم التسليم
  const displaySteps = currentStatus === "cancelled" || currentStatus === "not_delivered"
    ? [...steps, { label: currentStatus === "cancelled" ? "ملغي" : "لم يتم التسليم", icon: XCircle }]
    : steps;

  const currentStep = getCurrentStep();

  // إذا كانت الحالة ملغية أو لم يتم التسليم، نعرض حالة خاصة
  if (currentStatus === "cancelled") {
    return (
      <div className="w-full" dir="rtl">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 text-center">
          <XCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg md:text-xl font-bold text-red-600">تم إلغاء الطلب</h3>
          <p className="text-sm md:text-base text-red-500 mt-1">تم إلغاء هذا الطلب ولن يتم تنفيذه</p>
        </div>
      </div>
    );
  }

  if (currentStatus === "not_delivered") {
    return (
      <div className="w-full" dir="rtl">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 text-center">
          <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg md:text-xl font-bold text-red-600">لم يتم التسليم</h3>
          <p className="text-sm md:text-base text-red-500 mt-1">لم نتمكن من توصيل الطلب، يرجى التواصل مع خدمة العملاء</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" dir="rtl">
      <div className="relative">
        {/* الخط الأزرق للمراحل المكتملة */}
        <div 
          className="absolute top-5 h-[2px] bg-[#2D93CA] rounded-full transition-all duration-500"
          style={{
            right: '36px',
            width: currentStep >= 4 
              ? 'calc(100% - 72px)'
              : `calc(${(currentStep / 4) * 100}% - ${(currentStep / 4) * 72}px)`,
          }}
        />
        
        {/* الأيقونات */}
        <div className="relative flex justify-between items-center">
          {displaySteps.map((step, idx) => {
            // ✅ إزالة التحقق غير الضروري من cancelled و not_delivered
            const isCompleted = idx <= currentStep;
            const isCurrent = idx === currentStep;
            
            return (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="relative z-10 mb-2">
                  <div
                    className={`
                      w-10 h-10 md:w-12 md:h-12 rounded-full 
                      flex items-center justify-center bg-white
                      border-2 transition-all duration-300
                      ${isCompleted 
                        ? 'border-[#2D93CA] bg-[#2D93CA]/10'
                        : isCurrent 
                          ? 'border-[#EC221F] animate-pulse'
                          : 'border-gray-300'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <FaCircleCheck className="w-6 h-6 md:w-7 md:h-7 text-[#2D93CA]" />
                    ) : (
                      <step.icon className={`w-5 h-5 md:w-6 md:h-6 ${isCurrent ? 'text-[#EC221F]' : 'text-gray-400'}`} />
                    )}
                  </div>
                </div>
                
                <p className={`
                  font-bold text-xs md:text-sm
                  ${isCompleted || isCurrent ? 'text-gray-800' : 'text-gray-400'}
                `}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}