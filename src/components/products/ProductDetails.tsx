// components/products/ProductDetails.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Truck, RefreshCw, Ruler, Info } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/hooks/useFavorites";
import Link from "next/link";
import { BsShare } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa6";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { FaRegStar } from "react-icons/fa";

interface ProductDetailsProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    brand: string;
    category: string;
    images: string[];
    colors: Array<{ name: string; code: string }>;
    sizes: string[];
    rating: number;
    reviewsCount: number;
    sku: string;
    availability: boolean;
  };
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0]?.name || "",
  );
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "info" | "measurements" | "shipping"
  >("info");

  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite, isMutating } = useFavorites();

  // التحقق من أن المنتج في المفضلة
  const isProductFavorite = isFavorite(product.id.toString());

  // معالجة إضافة إلى السلة
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
    });
  };

  // معالجة إضافة/إزالة من المفضلة
  const handleToggleFavorite = async () => {
    await toggleFavorite(product.id.toString(), isProductFavorite);
  };

  // تحديث الكمية
  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // تنظيف رابط الصورة
  const cleanImageUrl = (url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith("/storage")) {
      return `https://dukanah.admin.t-carts.com${url}`;
    }
    return url;
  };

  // حساب قيمة الخصم
  const discountAmount = product.originalPrice
    ? product.originalPrice - product.price
    : 0;
  const discountPercentage = product.originalPrice
    ? Math.round((discountAmount / product.originalPrice) * 100)
    : 0;

  return (
    <div className="container-custom">
      <div className="flex gap-2 mb-5">
        <Link href="/" className="text-[#726C6C] text-[20px]">
          الرئيسية
        </Link>
        <span className="text-[#333333] font-bold">/</span>
        <Link href="/products" className="text-[#726C6C] font-bold text-[20px]">
          {product.brand}
        </Link>
        <span className="text-[#180100] font-bold text-[20px]">/</span>

        <p className="text-[#180100] font-bold text-[20px]"> {product.name}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* ========== قسم الصور ========== */}
        <div className="space-y-4">
          {/* الصورة الرئيسية */}
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            <Image
              src={cleanImageUrl(product.images[selectedImage])}
              alt={product.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {product.discount && (
              <span className="absolute top-4 right-4 bg-[#EC221F] text-white text-xs font-bold px-2 py-1 rounded-full">
                {product.discount}% خصم
              </span>
            )}
          </div>

          {/* الصور المصغرة */}
          <div className="grid grid-cols-3 gap-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`
                  relative aspect-square bg-gray-100 rounded-xl overflow-hidden
                  border-2 transition-all duration-200
                  ${selectedImage === index ? "border-[#EC221F]" : "border-transparent hover:border-gray-300"}
                `}
              >
                <Image
                  src={cleanImageUrl(image)}
                  alt={`${product.name} - صورة ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 20vw"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ========== قسم المعلومات ========== */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              {/* اسم المنتج */}
              <h1 className="text-2xl font-bold text-[#000000]">
                {product.name}
              </h1>
              {/* الماركة */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[20px] text-[#666666]">
                  {product.brand}
                </span>
              </div>
            </div>

            {/* السعر */}
            <div className="flex gap-0 flex-col">
              <span className="text-2xl md:text-4xl font-bold text-[#C01A13] flex items-center gap-1">
                {product.price.toLocaleString()}
                <span className="text-2xl">EGP</span>
              </span>
              {product.originalPrice && (
                <span className="text-xl text-[#00000080] line-through flex items-center gap-1">
                  {product.originalPrice.toLocaleString()}
                  <span className="text-base">EGP</span>
                </span>
              )}
            </div>
          </div>

          {/* التقييم */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#EDF0F8] text-[#3A4980] font-bold text-sm rounded-full px-3 py-2 justify-center gap-1">
              <IoChatboxEllipsesOutline className="w-[18px] h-[18px]" />
              <span> {product.reviewsCount} </span>
              <p>تقييم</p>
            </div>

            <div className="flex items-center bg-[#FFF5F4] text-[#FA6054] font-bold text-sm rounded-full px-3 py-1.5 justify-center gap-1">
              <FaRegStar className="w-[14px] h-[14px]" />
              <span> {product.rating}</span>
            </div>
          </div>

          {/* ===== اختيار اللون ===== */}
          <div>
            <div className="flex justify-between items-center my-4">
              <span className="text-[16px] font-bold text-[#333333]">
                اللون
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`
                    group relative w-10 h-10 rounded-full transition-all duration-200
                    ${selectedColor === color.name ? "ring-2 ring-offset-2 scale-110" : "hover:scale-105"}
                  `}
                  style={{
                    backgroundColor: color.code,
                  }}
                  aria-label={`لون ${color.name}`}
                >
                  {/* علامة الصح للون المختار */}
                  {selectedColor === color.name && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">
                      ✓
                    </div>
                  )}

                  {/* حدود اللون الأبيض */}
                  {color.name === "أبيض" && (
                    <div className="absolute inset-0 rounded-full border border-gray-300" />
                  )}

                  {/* حدود خفيفة للألوان الفاتحة عشان تبان علامة الصح */}
                  {selectedColor === color.name &&
                    (color.name === "أبيض" || color.code === "#FFFFFF") && (
                      <div className="absolute inset-0 rounded-full border border-gray-400" />
                    )}
                </button>
              ))}
            </div>
          </div>
          <hr />
          
          {/* ===== اختيار المقاس ===== */}
          <div>
            <div className="flex justify-between items-center my-4">
              <span className="text-[16px] font-bold text-[#333333]">
                المقاس
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size) => (
                <label
                  key={size}
                  className={`
                    flex items-center justify-center rounded-[8px] gap-2 w-[84px] px-3 h-[36px] font-medium transition-all duration-200 cursor-pointer
                    ${
                      selectedSize === size
                        ? "bg-[#EDF0F8] text-[#3A4980]"
                        : "bg-[#F3F3F3] text-[#726C6C] hover:bg-[#EDF0F8]"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="product-size"
                    value={size}
                    checked={selectedSize === size}
                    onChange={() => setSelectedSize(size)}
                    className="w-4 h-4 accent-[#3A4980]"
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ===== الكمية ===== */}
          <div>
            <div className="flex items-center gap-4 my-4">
              <div className="flex items-center rounded-full bg-[#F3F3F3] h-[56px] w-[169px] justify-center">
                <button
                  onClick={increaseQuantity}
                  className="w-10 h-10 flex items-center justify-center text-[#3A4980] font-bold transition"
                >
                  <FaPlus className="w-4 h-4 font-bold" />
                </button>
                <span className="w-14 text-center text-[22px] font-bold text-[#222222]">
                  {quantity}
                </span>
                <button
                  onClick={decreaseQuantity}
                  className="w-10 h-10 flex items-center justify-center text-[#A3A3A3] transition"
                >
                  <FaMinus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ===== الأزرار ===== */}
          <div className="flex flex-col">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-[#0A0500] text-[16px] text-white px-6 py-3 rounded-[8px] font-bold hover:bg-[#2b2b2b] transition-all duration-300 flex items-center justify-center gap-2"
            >
              أضف إلى السلة
            </button>
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleToggleFavorite}
                disabled={isMutating}
                className={`
                  flex-1 px-6 py-3 rounded-[8px] font-bold transition-all duration-300 flex items-center justify-center gap-2
                  ${isProductFavorite 
                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
                    : "border border-[#0A0500] hover:bg-[#f3f1f1]"
                  }
                `}
              >
                <Heart 
                  className="w-5 h-5" 
                  fill={isProductFavorite ? "#ef4444" : "none"}
                />
                {isProductFavorite ? "تمت الإضافة إلى المفضلة" : "أضف إلى المفضلة"}
              </button>
              <button
                className="w-12 h-12 rounded-[8px] border border-[#313131] flex items-center justify-center transition-all duration-300 hover:bg-gray-100"
              >
                <BsShare className="w-5 h-5 font-bold" />
              </button>
            </div>
          </div>

          {/* ========== الأقسام القابلة للطي ========== */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            {/* معلومات المنتج */}
            <div>
              <button
                onClick={() =>
                  setActiveTab(activeTab === "info" ? "shipping" : "info")
                }
                className="flex justify-between items-center w-full py-3 text-right"
              >
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#EC221F]" />
                  معلومات المنتج
                </span>
                <span className="text-2xl">
                  {activeTab === "info" ? "−" : "+"}
                </span>
              </button>
              {activeTab === "info" && (
                <div className="pt-2 pb-4 text-gray-600 text-sm leading-relaxed space-y-2">
                  <p>{product.description}</p>
                  <p>
                    <strong>رمز المنتج:</strong> {product.sku}
                  </p>
                  <p>
                    <strong>القسم:</strong> {product.category}
                  </p>
                  <p>
                    <strong>الماركة:</strong> {product.brand}
                  </p>
                </div>
              )}
            </div>

            {/* القياسات */}
            <div className="border-t border-gray-100">
              <button
                onClick={() =>
                  setActiveTab(
                    activeTab === "measurements" ? "shipping" : "measurements",
                  )
                }
                className="flex justify-between items-center w-full py-3 text-right"
              >
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-[#EC221F]" />
                  القياسات
                </span>
                <span className="text-2xl">
                  {activeTab === "measurements" ? "−" : "+"}
                </span>
              </button>
              {activeTab === "measurements" && (
                <div className="pt-2 pb-4 text-gray-600 text-sm">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 font-semibold">المقاس</th>
                        <th className="py-2 font-semibold">الصدر (سم)</th>
                        <th className="py-2 font-semibold">الطول (سم)</th>
                        <th className="py-2 font-semibold">الكتف (سم)</th>
                       </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">S</td>
                        <td className="py-2">86-91</td>
                        <td className="py-2">65</td>
                        <td className="py-2">40</td>
                       </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">M</td>
                        <td className="py-2">91-96</td>
                        <td className="py-2">67</td>
                        <td className="py-2">42</td>
                       </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">L</td>
                        <td className="py-2">96-101</td>
                        <td className="py-2">69</td>
                        <td className="py-2">44</td>
                       </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">XL</td>
                        <td className="py-2">101-106</td>
                        <td className="py-2">71</td>
                        <td className="py-2">46</td>
                       </tr>
                    </tbody>
                   </table>
                  <p className="text-xs text-gray-400 mt-3">
                    * قد تختلف القياسات بنسبة 1-2 سم
                  </p>
                </div>
              )}
            </div>

            {/* التسليم والإرجاع */}
            <div className="border-t border-gray-100">
              <button
                onClick={() =>
                  setActiveTab(activeTab === "shipping" ? "info" : "shipping")
                }
                className="flex justify-between items-center w-full py-3 text-right"
              >
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#EC221F]" />
                  التسليم والإرجاع والاستبدال
                </span>
                <span className="text-2xl">
                  {activeTab === "shipping" ? "−" : "+"}
                </span>
              </button>
              {activeTab === "shipping" && (
                <div className="pt-2 pb-4 text-gray-600 text-sm space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
                      <Truck className="w-4 h-4" /> التوصيل
                    </h4>
                    <p>• التوصيل خلال 3-5 أيام عمل</p>
                    <p>• توصيل مجاني للطلبات فوق 1000 جنيه</p>
                    <p>• رسوم التوصيل 50 جنيه للطلبات الأقل من 1000 جنيه</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
                      <RefreshCw className="w-4 h-4" /> الإرجاع والاستبدال
                    </h4>
                    <p>• يمكن إرجاع المنتج خلال 14 يوم من تاريخ الاستلام</p>
                    <p>• يجب أن يكون المنتج بحالته الأصلية مع الفاتورة</p>
                    <p>• استرداد كامل المبلغ خلال 7-14 يوم</p>
                    <p>• خدمة الاستبدال مجانية لأول مرة</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}