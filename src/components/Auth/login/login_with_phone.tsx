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

    // ✅ التحقق من رقم الهاتف - فقط أن الحقل ليس فارغاً (بدون التحقق من الصيغة)
    if (!formData.phoneNumber) {
      newErrors.phone = "رقم الهاتف مطلوب";
    }

    // التحقق من كلمة المرور
    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
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
      {/* <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: '14px',
            padding: '12px 16px',
            borderRadius: '8px',
            direction: 'rtl',
          },
        }}
      /> */}
      
      <div className="bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center ">
        <div className="container mx-auto px-4 py-6 md:py-12">
          <div className="max-w-md mx-auto">
            {/* بطاقة تسجيل الدخول */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              {/* العنوان */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">تسجيل الدخول</h1>
                <p className="text-gray-500 text-sm">يرجى إدخال رقم الهاتف وكلمة المرور</p>
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

                {/* كلمة المرور */}
                <div className="mb-5">
                  <label className="block text-gray-700 font-medium mb-2">
                    كلمة المرور <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        clearPasswordError();
                      }}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className={`w-full text-sm px-4 py-2 pr-10 pl-10 border rounded-[8px]  focus:border-black outline-none transition-colors ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      } ${isLoading ? "opacity-50" : ""}`}
                      dir="rtl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                {/* رابط نسيت كلمة المرور */}
                {/* <div className="text-left mb-6">
                  <button
                    type="button"
                    onClick={() => router.push("/auth/forgot-password")}
                    className="text-sm text-[#23A6F0] hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div> */}

                {/* زر تسجيل الدخول */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center gap-2 px-4 py-3 bg-[#2DA5F3] text-white rounded-[8px] hover:bg-[#37afff] transition font-medium ${
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
                      className="text-[#23A6F0] font-medium hover:underline"
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