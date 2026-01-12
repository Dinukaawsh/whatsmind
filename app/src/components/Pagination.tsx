import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    if (endPage < totalPages) {
      endPage = Math.min(
        totalPages,
        endPage + (maxVisiblePages - 1 - (endPage - startPage))
      );
      startPage = endPage - (maxVisiblePages - 1);
    } else {
      startPage = Math.max(
        1,
        startPage - (maxVisiblePages - 1 - (endPage - startPage))
      );
      endPage = startPage + (maxVisiblePages - 1);
    }
  }

  if (startPage < 4) {
    endPage = Math.min(totalPages, maxVisiblePages);
    startPage = 1;
  } else if (endPage > totalPages - 3) {
    startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    endPage = totalPages;
  }

  if (startPage > 2) {
    pages.push(1);
    pages.push("...");
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages - 1) {
    pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-end mt-4">
      {/* Page count text */}
      <div className="text-sm text-gray-500 mr-6">
        Page {currentPage} of {totalPages}
      </div>

      {/* Outer box with rounded corners */}
      <div className="border rounded-lg p-2 shadow-md">
        {/* Pagination controls without inner border */}
        <div className="flex items-center overflow-hidden">
          {/* Previous page button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-gray-800 disabled:opacity-50 hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Page numbers with ellipsis */}
          <div className="flex items-center">
            {pages.map((page, idx) =>
              typeof page === "number" ? (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center mx-1 rounded-md transition-colors duration-200 ${
                    currentPage === page
                      ? "bg-[#05112b] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span
                  key={`ellipsis-${idx}`}
                  className="mx-1 text-gray-400 select-none"
                >
                  ...
                </span>
              )
            )}
          </div>

          {/* Next page button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-gray-500 disabled:opacity-50 hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
