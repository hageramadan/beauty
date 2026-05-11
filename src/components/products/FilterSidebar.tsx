// components/products/FilterSidebar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { getCategories, getColors, getSizes } from '@/services/api';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { FaArrowLeft } from "react-icons/fa6";

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-right font-semibold text-gray-700 mb-2"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}

export default function ProductFilters({ onFilterChange, isMobile = false, onClose }: ProductFiltersProps) {
  // ========== State variables ==========
  const [minPrice, setMinPrice] = useState<number>(300);
  const [maxPrice, setMaxPrice] = useState<number>(700);
  const [priceRange, setPriceRange] = useState<number[]>([300, 700]);
  const [tempMinPrice, setTempMinPrice] = useState<number>(300);
  const [tempMaxPrice, setTempMaxPrice] = useState<number>(700);
  const [tempPriceRange, setTempPriceRange] = useState<number[]>([300, 700]);
  
  // بيانات ديناميكية من الـ API
  const [categories, setCategories] = useState<any[]>([]);
  const [colors, setColors] = useState<{ name: string; code: string }[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  
  // الفلاتر المختارة
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  // ✅ متغير لمنع التطبيق التلقائي للفلاتر
  const shouldApplyFilters = useRef(false);

  // الحدود القصوى والدنيا للسعر
  const MIN_PRICE = 0;
  const MAX_PRICE = 1000;

  // ========== جلب البيانات من الـ API ==========
  useEffect(() => {
    loadFiltersData();
  }, []);

  const loadFiltersData = async () => {
    try {
      const [categoriesData, colorsData, sizesData] = await Promise.all([
        getCategories(),
        getColors(),
        getSizes()
      ]);
      
      setCategories(categoriesData);
      setColors(colorsData);
      setSizes(sizesData);
      
      console.log('✅ Filters data loaded:', { categories: categoriesData.length, colors: colorsData.length, sizes: sizesData.length });
    } catch (error) {
      console.error('Error loading filters data:', error);
    }
  };

  // ========== تطبيق الفلاتر (فقط عندما يكون shouldApplyFilters = true) ==========
  useEffect(() => {
    // ✅ فقط نطبق الفلاتر إذا كان المستخدم قد تفاعل مع الفلتر
    if (!shouldApplyFilters.current) {
      return;
    }
    
    console.log('🔄 Applying filters...');
    onFilterChange({
      minPrice: minPrice > MIN_PRICE ? minPrice : undefined,
      maxPrice: maxPrice < MAX_PRICE ? maxPrice : undefined,
      categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
      colors: selectedColors.length > 0 ? selectedColors : undefined,
      sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      brands: selectedBrands.length > 0 ? selectedBrands : undefined,
    });
  }, [selectedCategories, selectedColors, selectedSizes, selectedBrands, minPrice, maxPrice]);

  // ========== معالجات تغيير الفلاتر ==========
  const handleTempPriceRangeChange = (value: number[]) => {
    setTempPriceRange(value);
    setTempMinPrice(value[0]);
    setTempMaxPrice(value[1]);
  };

  const applyPriceFilter = () => {
    // ✅ تفعيل تطبيق الفلاتر عند الضغط على زر السعر
    shouldApplyFilters.current = true;
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setPriceRange(tempPriceRange);
  };

  const handleCategoryChange = (categoryId: number) => {
    // ✅ تفعيل تطبيق الفلاتر عند تغيير الفئة
    shouldApplyFilters.current = true;
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleColorChange = (colorName: string) => {
    // ✅ تفعيل تطبيق الفلاتر عند تغيير اللون
    shouldApplyFilters.current = true;
    setSelectedColors(prev =>
      prev.includes(colorName)
        ? prev.filter(c => c !== colorName)
        : [...prev, colorName]
    );
  };

  const handleSizeChange = (size: string) => {
    // ✅ تفعيل تطبيق الفلاتر عند تغيير المقاس
    shouldApplyFilters.current = true;
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleBrandChange = (brand: string) => {
    // ✅ تفعيل تطبيق الفلاتر عند تغيير الماركة
    shouldApplyFilters.current = true;
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  // ========== إعادة تعيين جميع الفلاتر ==========
  const resetFilters = () => {
    // ✅ تفعيل تطبيق الفلاتر عند إعادة التعيين
    shouldApplyFilters.current = true;
    setMinPrice(300);
    setMaxPrice(700);
    setPriceRange([300, 700]);
    setTempMinPrice(300);
    setTempMaxPrice(700);
    setTempPriceRange([300, 700]);
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedBrands([]);
    
    if (onClose && isMobile) onClose();
  };

  // ========== دالة مساعدة للتحقق من اللون الأبيض ==========
  const isWhiteColor = (colorName: string, colorCode: string): boolean => {
    return colorName === 'أبيض' || 
           colorName === 'white' || 
           colorCode === '#FFFFFF' || 
           colorCode === '#F9FAFB';
  };

  return (
    <div 
      className={`border sticky top-[10%] rounded-xl p-4 mx-auto my-3`}
      style={{ width: '344.66px' }}
    >
      {/* Header */}
      <h3 className="text-[18.28px] mb-4 text-[#180100] flex justify-between items-center">
        فلتر
        <button
          onClick={resetFilters}
          className="text-sm text-[#666666] border py-[10px] px-[18px] rounded-full border-[#999999] font-normal"
        >
          مسح الكل
        </button>
      </h3>
      
      {/* ===== فلتر السعر ===== */}
      <FilterSection title="الاسعار">
        <div className="space-y-4">
          <p className="text-sm text-[#333333] flex justify-end gap-1">
            <span>L.E</span>   
            {tempMaxPrice.toLocaleString()}
            <span>-</span>
            <span>L.E</span>   
            {tempMinPrice.toLocaleString()} 
          </p>
          
          <Slider
            value={tempPriceRange}
            onValueChange={handleTempPriceRangeChange}
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={10}
            className="my-6"
          />
          
          <div className="flex gap-3 mt-2 items-center">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">الحد الأقصى</label>
              <input
                type="number"
                value={tempMaxPrice}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value <= MAX_PRICE && value >= tempMinPrice) {
                    setTempMaxPrice(value);
                    setTempPriceRange([tempMinPrice, value]);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">الحد الأدنى</label>
              <input
                type="number"
                value={tempMinPrice}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= MIN_PRICE && value <= tempMaxPrice) {
                    setTempMinPrice(value);
                    setTempPriceRange([value, tempMaxPrice]);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className='mt-4'>
              <button
                onClick={applyPriceFilter}
                className="w-[32.89px] bg-[#0A0500] text-white py-2 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <FaArrowLeft className='w-5 h-5' />
              </button>
            </div>
          </div>
        </div>
      </FilterSection>
      
      {/* ===== فلتر الفئات (ديناميكي) ===== */}
      <FilterSection title="الفئات">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400">جاري تحميل الفئات...</p>
          ) : (
            categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">{category.name}</span>
              </label>
            ))
          )}
        </div>
      </FilterSection>
      
      {/* ===== فلتر الألوان (ديناميكي من الـ API) ===== */}
      <FilterSection title="الألوان">
        <div className="flex flex-wrap gap-3">
          {colors.length === 0 ? (
            <p className="text-sm text-gray-400">جاري تحميل الألوان...</p>
          ) : (
            colors.map((color) => {
              const isWhite = isWhiteColor(color.name, color.code);
              const isSelected = selectedColors.includes(color.name);
              
              return (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.name)}
                  className="group relative"
                  aria-label={`لون ${color.name}`}
                >
                  <div
                    className={`
                      w-7 h-7 rounded-full transition-all duration-200 hover:scale-110
                      ${isSelected ? 'ring-2 ring-offset-2 scale-110' : ''}
                      ${isSelected && isWhite ? 'ring-black ring-offset-white' : isSelected ? 'ring-blue-500' : ''}
                    `}
                    style={{
                      backgroundColor: color.code,
                      ...(isWhite && { border: '1px solid #e5e7eb' })
                    }}
                  />
                </button>
              );
            })
          )}
        </div>
      </FilterSection>
      
      {/* ===== فلتر المقاسات (ديناميكي من الـ API) ===== */}
      <FilterSection title="المقاسات">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sizes.length === 0 ? (
            <p className="text-sm text-gray-400">جاري تحميل المقاسات...</p>
          ) : (
            sizes.map((size) => (
              <label key={size} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={() => handleSizeChange(size)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">{size}</span>
              </label>
            ))
          )}
        </div>
      </FilterSection>
      
      {/* ===== فلتر العلامات التجارية ===== */}
      <FilterSection title="العلامات التجارية">
        <div className="space-y-2 overflow-y-auto">
          <p className="text-sm text-gray-400 text-center py-4">
            سيتم إضافة العلامات التجارية قريباً
          </p>
        </div>
      </FilterSection>
    </div>
  );
}