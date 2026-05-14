// app/account/address/page.tsx
"use client";

import { useState } from "react";
import SavedAddresses from "@/components/address/SavedAddresses";
import AddAddress from "@/components/address/AddAddress";
import { BsFillPlusCircleFill } from "react-icons/bs";

export default function AddressPage() {
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: "المنزل",
      governorate: "القاهرة",
      apartmentNumber: "5",
      floor: "5",
      street: "شارع النيل",
      city: "مدينة نصر",
    },
    {
      id: 2,
      type: "الدوام",
      governorate: "الجيزة",
      apartmentNumber: "3",
      floor: "2",
      street: "شارع الهرم",
      city: "المهندسين",
    },
  ]);

  const handleAddAddress = (newAddress: any) => {
    console.log("📦 إضافة عنوان جديد:", newAddress);
    console.log("🏙️ المدينة المستخرجة:", newAddress.city);
    console.log("📍 المحافظة المستخرجة:", newAddress.governorate);
    setAddresses([...addresses, { ...newAddress, id: Date.now() }]);
    setShowAddAddress(false);
    setEditingAddress(null);
  };

  const handleEditAddress = (address: any) => {
    console.log("✏️ تعديل عنوان:", address);
    setEditingAddress(address);
    setShowAddAddress(true);
  };

  const handleUpdateAddress = (updatedAddress: any) => {
    console.log("🔄 تحديث عنوان:", updatedAddress);
    console.log("🏙️ المدينة بعد التحديث:", updatedAddress.city);
    console.log("📍 المحافظة بعد التحديث:", updatedAddress.governorate);
    setAddresses(
      addresses.map((addr) =>
        addr.id === updatedAddress.id ? updatedAddress : addr
      )
    );
    setShowAddAddress(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (id: number) => {
    console.log("🗑️ حذف عنوان بالرقم:", id);
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleCloseModal = () => {
    setShowAddAddress(false);
    setEditingAddress(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
      <div className="container mx-auto">
        <div className="mb-3">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-[#180100]">
              العناوين المحفوظة
            </h1>
          </div>

          <SavedAddresses
            addresses={addresses}
            onDelete={handleDeleteAddress}
            onEdit={handleEditAddress}
          />

          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                setEditingAddress(null);
                setShowAddAddress(true);
              }}
              className="flex items-center gap-2 text-[#180100] hover:text-[#ff6b6b] transition-colors"
            >
              <BsFillPlusCircleFill className="w-10 h-10" />
            </button>
          </div>

          {showAddAddress && (
            <AddAddress
              key={editingAddress?.id || "new"}
              onClose={handleCloseModal}
              onSave={editingAddress ? handleUpdateAddress : handleAddAddress}
              initialData={editingAddress}
              isEditing={!!editingAddress}
            />
          )}
        </div>
      </div>
    </div>
  );
}