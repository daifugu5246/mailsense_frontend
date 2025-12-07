import React from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  total,
  onPageChange,
}) => {
  // Don't render if there's only one page or no data
  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <footer className="col-span-12 flex flex-col items-center gap-3 mt-6 pb-12">
      <div className="text-sm text-slate-500">
        Total: {total} emails • Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 text-slate-600 hover:text-[#0767B0] hover:border-[#0767B0]/30 disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 px-2">
          {pageNumbers.map((page, index) => (
            typeof page === 'number' ? (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className={`h-9 w-9 font-medium rounded-md ${
                  page === currentPage
                    ? 'bg-[#0767B0] text-white hover:bg-[#0767B0] hover:text-white'
                    : 'text-slate-600 hover:text-[#0767B0]'
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ) : (
              <span key={index} className="text-slate-400 px-1">...</span>
            )
          ))}
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 text-slate-600 hover:text-[#0767B0] hover:border-[#0767B0]/30 disabled:opacity-50"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </footer>
  );
};
