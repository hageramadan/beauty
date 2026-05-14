"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaUser, FaCamera, FaArrowRight, FaEye, FaEyeSlash, FaRegEdit } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

export default function EditProfilePage() {
  const router = useRouter();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [user, setUser] = useState({
    name: "ملك أحمد",
    email: "malak.ahmed@email.com",
    phone: "01234567890",
    avatar: "/images/account/profile.jpg",
  });

  const [formData, setFormData] = useState({
    name: "ملك أحمد",
    email: "malak.ahmed@email.com",
    phone: "01234567890",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatar, setAvatar] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        // تحديث الصورة المعروضة
        setUser({ ...user, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // التحقق من الاسم
    if (!formData.name.trim()) {
      newErrors.name = "الاسم الكامل مطلوب";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "الاسم يجب أن يكون 3 أحرف على الأقل";
    }

    // التحقق من البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    // التحقق من رقم الهاتف (اختياري)
    if (formData.phone && !/^\d{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "رقم الهاتف يجب أن يكون 10-11 رقم";
    }

    // التحقق من كلمة المرور الجديدة (إذا تم إدخالها)
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل";
      }
      if (!formData.currentPassword) {
        newErrors.currentPassword = "الرجاء إدخال كلمة المرور الحالية";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "كلمة المرور الجديدة غير متطابقة";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    // تحضير البيانات للحفظ
    const dataToSave: any = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      avatar: avatar || user.avatar,
    };

    // إذا تم تغيير كلمة المرور
    if (formData.newPassword) {
      dataToSave.password = formData.newPassword;
    }

    console.log("تم حفظ البيانات:", dataToSave);
    toast.success("تم تحديث الملف الشخصي بنجاح ✅", {
      duration: 3000,
      position: "top-center",
    });
    
    setTimeout(() => {
      router.push("/account");
    }, 1500);
  };

  const clearFieldError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

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
      
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto  py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <FaArrowRight className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-[#180100]">تعديل الملف الشخصي</h1>
          </div>

          <form onSubmit={handleSubmit} className="">
            {/* Profile Info Section - نفس تصميم صفحة الحساب */}
            <div className="bg-white rounded-2xl shadow-sm p-3 md:p-6  mb-5 flex flex-col md:flex-row items-center justify-between  ">
              <div className="flex items-center">
                {/* Profile Image */}
                <div className="relative">
                  {avatar || user.avatar ? (
                    <Image
                      src={avatar || user.avatar || ""}
                      alt={user.name}
                      width={100}
                      height={100}
                      className="rounded-full object-cover h-16 w-16 md:w-24 md:h-24 border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="h-16 w-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#ff3c27] flex items-center justify-center shadow-lg">
                      <FaUser className="w-8 h-8 md:w-12 md:h-12 text-white" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md cursor-pointer hover:bg-gray-50 transition">
                    <FaCamera className="w-3.5 h-3.5 text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* User Info */}
                <div className="mr-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    {user.name}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
            </div>

           <div className="bg-white rounded-2xl shadow-sm p-6 mt-3">
             {/* المعلومات الشخصية */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800  pb-2 mb-4">
                المعلومات الشخصية
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-3">
                {/* الاسم الكامل */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setUser({ ...user, name: e.target.value });
                    clearFieldError("name");
                  }}
                  placeholder="أدخل الاسم الكامل"
                  className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
               {/* رقم الجوال */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  رقم الجوال
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setUser({ ...user, phone: e.target.value });
                    clearFieldError("phone");
                  }}
                  placeholder="مثال: 01234567890"
                  className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
              </div>

              {/* البريد الإلكتروني */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  البريد الإلكتروني <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setUser({ ...user, email: e.target.value });
                    clearFieldError("email");
                  }}
                  placeholder="example@email.com"
                  className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

             
            </div>

            {/* تغيير كلمة المرور */}
            <div className="my-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">
                تغيير كلمة المرور
              </h2>

              {/* كلمة المرور الحالية */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  كلمة المرور الحالية
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, currentPassword: e.target.value });
                      clearFieldError("currentPassword");
                    }}
                    placeholder="************"
                    className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors ${
                      errors.currentPassword ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
                )}
              </div>

              {/* كلمة المرور الجديدة */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, newPassword: e.target.value });
                      clearFieldError("newPassword");
                    }}
                    placeholder="************"
                    className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors ${
                      errors.newPassword ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                )}
              </div>

              {/* تأكيد كلمة المرور */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      clearFieldError("confirmPassword");
                    }}
                    placeholder="************"
                    className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-[8px] hover:bg-gray-50 transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 flex justify-center gap-1 px-4 py-2 bg-black text-white rounded-[8px] hover:bg-gray-800 transition"
              >
                حفظ <span className="hidden md:flex">التغييرات</span>
              </button>
            </div>
           </div>
          </form>
        </div>
      </div>
    </>
  );
}