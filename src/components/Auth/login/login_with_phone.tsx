"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import PhoneInput from "@/components/contact/PhoneInput";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginWithPhone() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithPhone, loading, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    phoneNumber: "",
    countryCode: "+20",
    password: "",
    email: "",
  });

  const [errors, setErrors] = useState<{
    phone?: string;
    password?: string;
  }>({});

  // إذا كان المستخدم مسجل دخول بالفعل، نوجهه للصفحة الرئيسية
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // عرض رسالة إذا تم التسجيل بنجاح
  useEffect(() => {
    const registered = searchParams.get("registered");
    if (registered === "true") {
      toast.success("تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول ✅", {
        duration: 5000,
        position: "top-center",
      });
    }
  }, [searchParams]);

  // معالج تغيير رقم الهاتف
  const handlePhoneChange = (phoneNumber: string, countryCode: string) => {
    setFormData({
      ...formData,
      phoneNumber: phoneNumber,
      countryCode: countryCode,
    });
    
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // ✅ التحقق من رقم الهاتف - فقط أن الحقل ليس فارغاً
    if (!formData.phoneNumber) {
      newErrors.phone = "رقم الهاتف مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    setIsSubmitting(true);

    // استخدام API حقيقي عبر الـ Context
    const result = await loginWithPhone(
      formData.phoneNumber,
      formData.password,
      formData.countryCode,
    );

    if (result.success) {
      toast.success(result.message || "تم إرسال رمز التحقق إلى هاتفك! ✅", {
        duration: 3000,
        position: "top-center",
      });
      
      // ✅ التوجيه إلى صفحة OTP بعد تسجيل الدخول
      const fullPhone = `${formData.countryCode}${formData.phoneNumber}`;
      setTimeout(() => {
        router.push(`/auth/verify-otp/phone?phone=${encodeURIComponent(fullPhone)}&isLogin=true`);
      }, 1500);
    } else {
      toast.error(result.message || "فشل تسجيل الدخول. يرجى التحقق من بياناتك", {
        duration: 4000,
        position: "top-center",
      });
    }

    setIsSubmitting(false);
  };

  const clearPasswordError = () => {
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: '14px',
            padding: '12px 16px',
            borderRadius: '8px',
            direction: 'rtl',
          },
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center">
        <div className="container mx-auto px-4 py-6 md:py-12">
          <div className="max-w-md mx-auto">
            {/* بطاقة تسجيل الدخول */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              {/* العنوان */}
              <div className="text-center mb-8">
                <h1 className="text-xl font-bold text-gray-800 mb-2">تسجيل الدخول</h1>
                <p className="text-gray-500 text-sm">يرجى إدخال رقم الهاتف</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* رقم الهاتف */}
                <div className="mb-5">
                  <label className="block text-gray-700 font-medium mb-2">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    value={`${formData.countryCode}${formData.phoneNumber}`}
                    onChange={handlePhoneChange}
                    required={true}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* زر تسجيل الدخول */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center gap-2 px-4 py-3 bg-[#FF7700] text-white rounded-[8px] hover:bg-[#37afff] transition font-medium ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    "تسجيل الدخول"
                  )}
                </button>

                {/* رابط إنشاء حساب جديد */}
                <div className="text-center mt-6 pt-4 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">
                    ليس لديك حساب؟{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/auth/register/phone")}
                      className="text-[#FF7700] font-medium hover:underline"
                    >
                      إنشاء حساب جديد
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}