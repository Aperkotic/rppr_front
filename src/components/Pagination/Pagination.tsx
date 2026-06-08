import React from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null; // Не показывать пагинацию, если страниц мало
  }

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Максимальное количество кнопок страниц для отображения

    if (totalPages <= maxPagesToShow + 2) {
      // Показываем все страницы, если их не много
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={`${styles.button} ${currentPage === i ? styles.active : ''}`}
          >
            {i}
          </button>
        );
      }
    } else {
      // Логика для большого количества страниц с многоточием
      pageNumbers.push(
        <button
          key={1}
          onClick={() => handlePageClick(1)}
          className={`${styles.button} ${currentPage === 1 ? styles.active : ''}`}
        >
          1
        </button>
      );

      if (currentPage > 3) {
        pageNumbers.push(<span key="start-ellipsis" className={styles.ellipsis}>...</span>);
      }

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        endPage = 3;
      }
      if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2;
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={`${styles.button} ${currentPage === i ? styles.active : ''}`}
          >
            {i}
          </button>
        );
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push(<span key="end-ellipsis" className={styles.ellipsis}>...</span>);
      }

      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => handlePageClick(totalPages)}
          className={`${styles.button} ${currentPage === totalPages ? styles.active : ''}`}
        >
          {totalPages}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className={styles.pagination}>
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.button}
      >
        &laquo;
      </button>
      {renderPageNumbers()}
      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.button}
      >
        &raquo;
      </button>
    </div>
  );
};

export default Pagination;