// COMP-15: Pagination
import React from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <nav>
      {/* A11Y-20: missing aria-label="Pagination" */}
      <ul className="pagination">
        <li>
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Prev
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <li key={page}>
            <button
              className={page === currentPage ? "active" : ""}
              onClick={() => onPageChange(page)}
              // A11Y-21: missing aria-current="page" on active page
            >
              {page}
            </button>
          </li>
        ))}
        <li>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};
