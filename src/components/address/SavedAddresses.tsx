// components/address/SavedAddresses.tsx
"use client";
import { useState } from "react";
import { CiEdit } from "react-icons/ci";
import { FaHome, FaBriefcase, FaMapMarkerAlt } from "react-icons/fa";
import { FaRegTrashAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { Address } from "@/types/address";

interface SavedAddressesProps {
  addresses: Address[];
  onDelete: (id: number) => void;
  onEdit: (address: Address) => void;
}

export default function SavedAddresses({
  addresses,
  onDelete,
  onEdit,
}: SavedAddressesProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    id: number | null;
  }>({ show: false, id: null });

  // دالة للحصول على الأيقونة المناسبة لنوع العنوان
  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <FaHome className="text-gray-600 text-xl" />;
      case 'work':
        return <FaBriefcase className="text-gray-600 text-xl" />;
      default:
        return <FaMapMarkerAlt className="text-gray-600 text-xl" />;
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      onDelete(deleteConfirm.id);
    }
    setDeleteConfirm({ show: false, id: null });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: null });
  };

  if (!addresses || addresses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-gray-400 mb-3">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <p className="text-gray-600">لا توجد عناوين محفوظة</p>
        <p className="text-gray-400 text-sm mt-2">أضف عنوانك الأول الآن</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 p-2 md:p-4 rounded-[8px] bg-white">
        {addresses.map((address) => (
          <div key={address.id} className="rounded-xl p-2 bg-[#f5f5f5e1]">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {getAddressIcon(address.type)}
                  <span className="font-bold text-[#0A0500] px-3 py-1 rounded-full text-lg">
                    {address.type_label}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(address)}
                  className="text-[#ff3c27] transition p-2 hover:bg-[#fcb8b075] rounded-full"
                >
                  <CiEdit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(address.id)}
                  className="text-red-500 hover:text-red-700 transition p-2 hover:bg-red-50 rounded-full"
                >
                  <FaRegTrashAlt />
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-100 p-4 rounded-[8px] text-sm mt-3">
              <div className="flex items-center gap-1">
                <p className="text-gray-800 font-medium">
                  {address.city.name}
                </p>
              </div>
              <div className="flex gap-1 mt-1">
                <div className="flex items-center gap-1">
                  <p className="text-gray-800 font-medium">
                    {address.street}
                  </p>
                </div>
              </div>
              {(address.building || address.floor || address.apartment) && (
                <div className="flex gap-2 mt-2 text-gray-600 text-xs flex-wrap">
                  {address.building && <span> مبنى {address.building}</span>}
                  {address.floor && <span> دور {address.floor}</span>}
                  {address.apartment && <span> شقة {address.apartment}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Delete Confirmation Popup */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">تأكيد الحذف</h3>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <IoClose size={24} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 text-center">
                هل أنت متأكد من حذف هذا العنوان؟
              </p>
              <p className="text-gray-500 text-sm text-center mt-2">
                لا يمكنك التراجع عن هذا الإجراء.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-[8px] hover:bg-gray-50 transition"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-[8px] hover:bg-red-700 transition"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}