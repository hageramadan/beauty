"use client";

import Link from "next/link";
import { FaChevronLeft, FaArrowRight, FaChevronRight } from "react-icons/fa";
import { MdHistory, MdAddCircleOutline } from "react-icons/md";
import { RiWalletFill } from "react-icons/ri";
import { TbTruckReturn } from "react-icons/tb";
import Image from "next/image";

export default function WalletPage() {
  // بيانات الرصيد
  const balance = 371.56;
  const currency = "EGP";

  // قائمة المعاملات (مثال)
  const transactions = [
    {
      id: 1,
      title: "شحن المحفظة",
      date: "2024-05-20",
      amount: "+ 200.00",
      isPositive: true,
    },
    {
      id: 2,
      title: "شراء منتج - هاتف Samsung",
      date: "2024-05-18",
      amount: "- 150.00",
      isPositive: false,
    },
    {
      id: 3,
      title: "استرداد من مرتجع",
      date: "2024-05-15",
      amount: "+ 321.56",
      isPositive: true,
    },
    {
      id: 4,
      title: "شراء منتج - سماعات",
      date: "2024-05-10",
      amount: "- 99.00",
      isPositive: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
      <div className="container mx-auto pb-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#ff3c27] transition mb-4"
          >
            <FaChevronRight className="w-4 h-4" />
            <span>رجوع إلى حسابي</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#180100]">المحفظة</h1>
        </div>

        {/* بطاقة الرصيد - Wallet Card */}
        <div className="space-y-3 mb-6">
          <div className="relative overflow-hidden bg-card-wallet rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between">
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 w-fit">
                  <Image
                    src="/images/wallet.png"
                    alt="Wallet"
                    width={28}
                    height={28}
                    className="brightness-0 invert opacity-90"
                  />
                </div>
                <p className="text-white text-lg md:text-3xl font-medium ">
                  المحفظة
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <span className="text-white text-xl font-medium ">
                  الرصيد الحالي
                </span>

                {/* المبلغ */}
                <div className="mb-6">
                  <span className="text-white text-2xl md:text-3xl font-black tracking-tight">
                    {currency} {balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات السريعة */}
          {/* <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition border border-gray-200">
              <MdAddCircleOutline className="w-5 h-5 text-[#ff3c27]" />
              <span className="text-gray-700 font-medium">شحن المحفظة</span>
            </button>
            <button className="flex items-center justify-center gap-2 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition border border-gray-200">
              <FaArrowRight className="w-4 h-4 text-[#ff3c27]" />
              <span className="text-gray-700 font-medium">تحويل</span>
            </button>
          </div> */}
        </div>

        {/* قسم المعاملات الأخيرة */}
        {/* <div className="bg-white rounded-[8px] p-2 md:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <MdHistory className="w-5 h-5 text-[#ff3c27]" />
              <h2 className="text-lg font-bold text-gray-800">آخر المعاملات</h2>
            </div>
            <button className="text-sm text-[#ff3c27] hover:underline">
              عرض الكل
            </button>
          </div>

          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition"
              >
                <div className="flex flex-col">
                  <span className="text-gray-800 font-medium">{transaction.title}</span>
                  <span className="text-gray-400 text-xs">{transaction.date}</span>
                </div>
                <span
                  className={`text-base font-bold ${
                    transaction.isPositive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {transaction.amount} {currency}
                </span>
              </div>
            ))}
          </div>

        
          {transactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">لا توجد معاملات حتى الآن</p>
            </div>
          )}
        </div> */}

        {/* روابط إضافية مشابهة للقائمة الأصلية */}
        {/* <div className="space-y-3 bg-white rounded-[8px] p-2 md:p-4 shadow-sm mt-6">
          <h2 className="text-lg font-bold text-gray-800 px-2">خدمات المحفظة</h2>
          
          <Link
            href="/account/wallet/transactions"
            className="flex items-center justify-between bg-white rounded-xl p-4 hover:shadow-md transition-border border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-2 rounded-full">
                <MdHistory className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-gray-700 text-base md:text-xl font-medium">جميع المعاملات</span>
            </div>
            <FaChevronLeft className="w-4 h-4 text-gray-400" />
          </Link>

          <Link
            href="/account/wallet/recharge"
            className="flex items-center justify-between bg-white rounded-xl p-4 hover:shadow-md transition-border border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-2 rounded-full">
                <MdAddCircleOutline className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-gray-700 text-base md:text-xl font-medium">شحن المحفظة</span>
            </div>
            <FaChevronLeft className="w-4 h-4 text-gray-400" />
          </Link>

          <Link
            href="/account/wallet/transfer"
            className="flex items-center justify-between bg-white rounded-xl p-4 hover:shadow-md transition-border border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-2 rounded-full">
                <FaArrowRight className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-gray-700 text-base md:text-xl font-medium">تحويل الرصيد</span>
            </div>
            <FaChevronLeft className="w-4 h-4 text-gray-400" />
          </Link>
        </div> */}
      </div>
    </div>
  );
}
