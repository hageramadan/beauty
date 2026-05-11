// components/Pagination.tsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, lastPage, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (lastPage <= maxVisible) {
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(lastPage);
      } else if (currentPage >= lastPage - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = lastPage - 3; i <= lastPage; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(lastPage);
      }
    }
    
    return pages;
  };

  // تنسيق الأرقام بإضافة صفر أمامي إذا كان الرقم أقل من 10
  const formatPageNumber = (page: number) => {
    return page < 10 ? `0${page}` : `${page}`;
  };

  // إذا كان هناك صفحة واحدة فقط
  if (lastPage <= 1) {
    return (
      <div className="flex justify-center items-center gap-2 mt-12 mb-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black text-white font-medium">
          {formatPageNumber(1)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-12 mb-4 flex-wrap">
      {/* زر السابق */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-black'
        }`}
      >
        <ChevronRight size={18} />
      </button>
      
      {/* أرقام الصفحات */}
      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <span key={index} className="w-12 h-12 flex items-center justify-center text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(page as number)}
            className={`w-12 h-12 rounded-full transition-all duration-200 font-medium ${
              page === currentPage
                ? 'bg-black text-white border-2 border-black'
                : 'bg-white text-black border-2 border-gray-300 hover:border-black'
            }`}
          >
            {formatPageNumber(page as number)}
          </button>
        )
      ))}
      
      {/* زر التالي */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center ${
          currentPage === lastPage
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-black'
        }`}
      >
        <ChevronLeft size={18} />
      </button>
    </div>
  );
}