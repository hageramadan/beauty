// components/products/FilterSidebar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { getCategories, getColors, getSizes, getBrands } from '@/services/api'; // ✅ أضفنا getBrands
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
  // السعر - قيم مؤقتة للـ UI وقيم مطبقة
  const [tempMinPrice, setTempMinPrice] = useState<number>(3000);
  const [tempMaxPrice, setTempMaxPrice] = useState<number>(10000);
  const [tempPriceRange, setTempPriceRange] = useState<number[]>([3000, 10000]);
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number] | undefined>(undefined);
  
  // بيانات ديناميكية من الـ API
  const [categories, setCategories] = useState<any[]>([]);
  const [colors, setColors] = useState<{ id: number; name: string; code: string }[]>([]);
  const [sizes, setSizes] = useState<{ id: number; value: string }[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]); // ✅ واجهة البراندات
  
  // الفلاتر المختارة
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  
  const MIN_PRICE = 0;
  const MAX_PRICE = 100000;

  // ========== تطبيق الفلاتر الفورية (بدون السعر) ==========
  useEffect(() => {
    console.log('🔄 Applying instant filters (without price)...');
    
    const filtersToApply: any = {
      categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
      colors: selectedColors.length > 0 ? selectedColors : undefined,
      sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      brands: selectedBrands.length > 0 ? selectedBrands : undefined,
    };
    
    if (appliedPriceRange) {
      filtersToApply.minPrice = appliedPriceRange[0];
      filtersToApply.maxPrice = appliedPriceRange[1];
    }
    
    onFilterChange(filtersToApply);
    
  }, [selectedCategories, selectedColors, selectedSizes, selectedBrands]);

  // ========== معالج تطبيق فلتر السعر بشكل منفصل ==========
  const applyPriceFilter = () => {
    const newPriceRange: [number, number] = [tempMinPrice, tempMaxPrice];
    setAppliedPriceRange(newPriceRange);
    
    const filtersToApply: any = {
      categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
      colors: selectedColors.length > 0 ? selectedColors : undefined,
      sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      brands: selectedBrands.length > 0 ? selectedBrands : undefined,
      minPrice: newPriceRange[0],
      maxPrice: newPriceRange[1],
    };
    
    console.log('💰 Price filter applied manually:', newPriceRange);
    onFilterChange(filtersToApply);
  };

  // ========== جلب البيانات من الـ API ==========
  useEffect(() => {
    loadFiltersData();
  }, []);

  const loadFiltersData = async () => {
    try {
      const [categoriesData, colorsData, sizesData, brandsData] = await Promise.all([
        getCategories(),
        getColors(),
        getSizes(),
        getBrands() // ✅ جلب البراندات
      ]);
      
      setCategories(categoriesData);
      setColors(colorsData);
      setSizes(sizesData);
      setBrands(brandsData);
     
    } catch (error) {
      console.error('Error loading filters data:', error);
    }
  };

  // ========== معالجات تغيير الفلاتر الفورية ==========
  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleColorChange = (colorCode: string) => {
    setSelectedColors(prev =>
      prev.includes(colorCode)
        ? prev.filter(c => c !== colorCode)
        : [...prev, colorCode]
    );
  };

  const handleSizeChange = (sizeValue: string) => {
    setSelectedSizes(prev =>
      prev.includes(sizeValue)
        ? prev.filter(s => s !== sizeValue)
        : [...prev, sizeValue]
    );
  };

  // ✅ معالج تغيير العلامات التجارية
  const handleBrandChange = (brandId: number) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(b => b !== brandId)
        : [...prev, brandId]
    );
  };

  // ========== معالجات تغيير السعر المؤقت ==========
  const handleTempPriceRangeChange = (value: number[]) => {
    setTempPriceRange(value);
    setTempMinPrice(value[0]);
    setTempMaxPrice(value[1]);
  };

  // ========== إعادة تعيين جميع الفلاتر ==========
  const resetFilters = () => {
    setTempMinPrice(3000);
    setTempMaxPrice(10000);
    setTempPriceRange([3000, 10000]);
    setAppliedPriceRange(undefined);
    
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedBrands([]);
    
    console.log('🔄 Reset all filters');
    onFilterChange({});
    
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
                className="w-full px-3 py-2 border border-gray-3000 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-3000 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      
      {/* ===== فلتر الفئات ===== */}
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
      
      {/* ===== فلتر الألوان ===== */}
      <FilterSection title="الألوان">
        <div className="flex flex-wrap gap-3">
          {colors.length === 0 ? (
            <p className="text-sm text-gray-400">جاري تحميل الألوان...</p>
          ) : (
            colors.map((color) => {
              const isWhite = isWhiteColor(color.name, color.code);
              const isSelected = selectedColors.includes(color.code);
              
              return (
                <button
                  key={color.id}
                  onClick={() => handleColorChange(color.code)}
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
      
      {/* ===== فلتر المقاسات ===== */}
      <FilterSection title="المقاسات">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sizes.length === 0 ? (
            <p className="text-sm text-gray-400">جاري تحميل المقاسات...</p>
          ) : (
            sizes.map((size) => (
              <label key={size.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size.value)}
                  onChange={() => handleSizeChange(size.value)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">{size.value}</span>
              </label>
            ))
          )}
        </div>
      </FilterSection>
      
      {/* ===== فلتر العلامات التجارية - ✅ الآن يعمل ===== */}
      <FilterSection title="العلامات التجارية">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {brands.length === 0 ? (
            <p className="text-sm text-gray-400">جاري تحميل العلامات التجارية...</p>
          ) : (
            brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => handleBrandChange(brand.id)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">{brand.name}</span>
              </label>
            ))
          )}
        </div>
      </FilterSection>
    </div>
  );
}