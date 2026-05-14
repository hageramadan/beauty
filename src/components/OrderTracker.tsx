// components/OrderTracker.tsx (نسخة CSS Grid)
"use client";

import { Clock, Box, Bike, Home, XCircle } from "lucide-react";
import { FaCircleCheck } from "react-icons/fa6";

interface OrderTrackerProps {
  currentStatus: "pending" | "processing" | "ready" | "delivering" | "delivered" |"cancelled" | "NotDelivered";
}

export default function OrderTracker({ currentStatus }: OrderTrackerProps) {
  const getCurrentStep = () => {
    switch (currentStatus) {
      case "pending": return 0;
      case "processing": return 1;
      case "ready": return 1;
      case "delivering": return 2;
      case "delivered": return 3;
      case "cancelled": return 4;
      case "NotDelivered": return 4;
      default: return 0;
    }
  };

  const steps = [
    { label: "تم الطلب", icon: Clock },
    { label: "التغليف", icon: Box },
    { label: "في الطريق", icon: Bike },
    { label: "تم التسليم", icon: Home },
   
  ];

  const currentStep = getCurrentStep();

  return (
    <div className="w-full" dir="rtl">
  
      
      <div className="relative">
     
        
        {/* الخط الأزرق للمراحل المكتملة */}
        <div 
          className="absolute top-5 h-[2px] bg-[#2D93CA] rounded-full transition-all duration-500"
          style={{
            right: '36px',
            width: currentStep >= 3 
              ? 'calc(100% - 72px)'
              : `calc(${(currentStep / 3) * 100}% - ${(currentStep / 3) * 72}px)`,
          }}
        />
        
        {/* الأيقونات */}
        <div className="relative flex justify-between items-center">
          {steps.map((step, idx) => {
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
                        ? 'border-[#2D93CA]' 
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