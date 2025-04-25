'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Reusable pagination component for admin dashboard and product pages
 */
export default function Pagination({ currentPage, totalPages, onPageChange, className = '' }: PaginationProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    // For 5 or fewer pages, show all page numbers
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // For more than 5 pages, show current page in the middle when possible
    let pages = [];
    
    // Always show first page
    pages.push(1);
    
    // If current page is not near the start, add ellipsis
    if (currentPage > 3) {
      pages.push(-1); // -1 represents ellipsis
    }
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    
    // If current page is not near the end, add ellipsis
    if (currentPage < totalPages - 2) {
      pages.push(-2); // -2 represents ellipsis (different key from the first one)
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
        {/* Previous Page Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium ${
            currentPage === 1
              ? 'cursor-not-allowed text-gray-300'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
          aria-label="Previous page"
        >
          <span className="sr-only">Previous</span>
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((pageNum, index) => {
          // Render ellipsis
          if (pageNum < 0) {
            return (
              <span
                key={`ellipsis-${pageNum}`}
                className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
              >
                ...
              </span>
            );
          }

          // Render page number
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                currentPage === pageNum
                  ? 'z-10 border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
              }`}
              aria-current={currentPage === pageNum ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Page Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium ${
            currentPage === totalPages
              ? 'cursor-not-allowed text-gray-300'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
          aria-label="Next page"
        >
          <span className="sr-only">Next</span>
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </nav>
    </div>
  );
}
