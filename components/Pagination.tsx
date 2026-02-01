import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Calculate generic page range
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages !== 1) {
      range.push(totalPages);
    }

    return range;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 py-8 mt-4">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronsLeft size={18} />
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="px-2 text-slate-600">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`
                  w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all
                  ${currentPage === page 
                    ? 'bg-gradient-to-tr from-violet-600 to-pink-600 text-white shadow-lg shadow-violet-900/50' 
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronRight size={18} />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronsRight size={18} />
      </button>
    </div>
  );
};