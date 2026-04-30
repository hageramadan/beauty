"use client";

import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";

// بيانات مؤقتة (استبدليها بـ API لاحقاً)
const allProducts = [
  { id: 1, name: "منتج 1", price: 299, image: "/product1.jpg", rating: 4.5, category: "electronics" },
  { id: 2, name: "منتج 2", price: 199, image: "/product2.jpg", rating: 4.2, category: "fashion" },
  { id: 3, name: "منتج 3", price: 499, image: "/product3.jpg", rating: 4.8, category: "electronics" },
  { id: 4, name: "منتج 4", price: 99, image: "/product4.jpg", rating: 4.0, category: "home" },
  { id: 5, name: "منتج 5", price: 349, image: "/product5.jpg", rating: 4.6, category: "fashion" },
  { id: 6, name: "منتج 6", price: 159, image: "/product6.jpg", rating: 4.3, category: "beauty" },
];

const categories = [
  { id: "all", name: "الكل" },
  { id: "electronics", name: "إلكترونيات" },
  { id: "fashion", name: "ملابس" },
  { id: "home", name: "أجهزة منزلية" },
  { id: "beauty", name: "تجميل" },
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(allProducts);

  // تطبيق الفلاتر
  useEffect(() => {
    let filtered = allProducts;

    // فلتر البحث
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فلتر الفئة
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // فلتر السعر
    filtered = filtered.filter(
      product => product.price >= priceRange.min && product.price <= priceRange.max
    );

    // setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, priceRange]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange({ min: 0, max: 1000 });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* عنوان الصفحة */}
     

     

      {/* شبكة المنتجات */}
      {filteredProducts.length > 0 ? (
        <p>لا توجد منتجات تطابق البحث</p>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد منتجات تطابق البحث</p>
          <Button variant="link" onClick={clearFilters} aria-label="delete">
            مسح جميع الفلاتر
          </Button>
        </div>
      )}
    </div>
  );
}