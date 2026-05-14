// app/account/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaRegEdit } from "react-icons/fa";
import { TbChecklist } from "react-icons/tb";
import { TbTruckReturn } from "react-icons/tb";
import { SlLocationPin } from "react-icons/sl";
import { FaRegHeart } from "react-icons/fa";
import { 
  FaSignOutAlt, 
  FaChevronLeft,
  FaUser,
  FaTimes,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

export default function AccountPage() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState({
    name: "ملك أحمد",
    email: "malak.ahmed@email.com",
    avatar: "/images/account/profile.jpg",
  });

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    toast.success("تم تسجيل الخروج بنجاح 👋", {
      duration: 2000,
      position: "top-center",
    });
    
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const menuItems = [
    {
      id: 1,
      title: "طلباتي",
      icon: <TbChecklist className="w-5 h-5" />,
      href: "/account/orders",
    },
    {
      id: 2,
      title: "المرتجعات",
      icon: <TbTruckReturn className="w-5 h-5" />,
      href: "/account/returns",
    },
    {
      id: 3,
      title: "العناوين المحفوظة",
      icon: <SlLocationPin className="w-5 h-5" />,
      href: "/account/address",
    },
    {
      id: 4,
      title: "المفضلة",
      icon: <FaRegHeart className="w-5 h-5" />,
      href: "/account/wishlist",
    },
  ];

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
        <div className="container mx-auto mb-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#180100]">حسابي</h1>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm px-4 py-4 mb-3 md:mb-5 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              {/* Profile Image */}
              <div className="relative mb-4 md:mb-0">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={100}
                    height={100}
                    className="rounded-full object-cover h-16 w-16 md:w-24 md:h-24 border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-16 w-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#ff3c27] flex items-center justify-center shadow-lg">
                    <FaUser className="w-12 h-12 text-white" />
                  </div>
                )}
                <button 
                  onClick={() => router.push("/account/edit-profile")}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-50 transition"
                >
                  <FaRegEdit className="w-3.5 h-3.5 text-gray-600" />
                </button>
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
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-3 h-fit mt-4 md:mt-0">
              <button
                onClick={() => router.push("/account/edit-profile")}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-[8px] hover:bg-gray-50 transition text-gray-700"
              >
                <FaRegEdit className="w-4 h-4" />
                <span>تعديل الملف الشخصي</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 rounded-[8px] hover:bg-red-50 transition text-red-600"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3 bg-white rounded-[8px] p-2 md:p-4 shadow-sm">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center justify-between bg-white rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <div className="text-gray-600">{item.icon}</div>
                  </div>
                  <span className="text-gray-700 text-base md:text-xl font-medium">{item.title}</span>
                </div>
                <FaChevronLeft className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold text-gray-800">تسجيل الخروج</h3>
              <button
                onClick={cancelLogout}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <FaSignOutAlt className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-gray-700 text-lg font-medium mb-2">
                  هل أنت متأكد من تسجيل الخروج؟
                </p>
                <p className="text-gray-500 text-sm">
                  ستحتاج إلى تسجيل الدخول مرة أخرى للوصول إلى حسابك.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-[8px] hover:bg-gray-50 transition"
              >
                إلغاء
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-[8px] hover:bg-red-700 transition"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}