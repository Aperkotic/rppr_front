import { useEffect, useState, useCallback, useMemo, startTransition } from 'react';
import styles from './HotelsPage.module.css';
import HotelCard from '../../components/HotelCard/HotelCard';
import Pagination from '../../components/Pagination/Pagination';
import { getHotels } from '../../api/hotels';

// Типы данных
interface Hotel {
  id: number;
  name: string;
  location: string;
  description: string;
  image_url: string;
  rooms: { price_per_night: string }[];
}

interface HotelsApiResponse {
  total: number;
  hotels: Hotel[];
}

interface Filters {
  location: string;
  price_from: string;
  price_to: string;
  date_from: string;
  date_to: string;
}

const initialFilters: Filters = {
  location: '',
  price_from: '',
  price_to: '',
  date_from: '',
  date_to: '',
};

const PAGE_SIZE = 10;

const HotelsPage = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Получаем сегодняшнюю дату в формате YYYY-MM-DD для атрибута min
  const today = new Date().toISOString().split('T')[0];

  const fetchHotels = useCallback(async (page: number, currentFilters: Filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      
      params.append('page', String(page));
      params.append('page_size', String(PAGE_SIZE));

      const data: HotelsApiResponse = await getHotels(params);
      
      setHotels(data.hotels);
      setTotalPages(Math.ceil(data.total / PAGE_SIZE));
    } catch (err: unknown) {
      // Если бэкенд недоступен — просто показываем пустой список
      console.log('HotelsPage: бэкенд недоступен, показываем пустой список', err);
      setHotels([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      fetchHotels(1, initialFilters);
    });
  }, [fetchHotels]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilterError(null);

    setFilters(prevFilters => {
      if (name === 'date_to' && value && prevFilters.date_from && value < prevFilters.date_from) {
        setFilterError('Дата окончания не может быть раньше даты начала');
        return prevFilters;
      }

      if (name === 'date_from' && value && prevFilters.date_to && prevFilters.date_to < value) {
        setFilterError('Дата окончания не может быть раньше даты начала');
        return {
          ...prevFilters,
          date_from: value,
          date_to: '',
        };
      }

      return {
        ...prevFilters,
        [name]: value,
      };
    });
  };

  const handleClearInput = (fieldName: keyof Filters) => {
    setFilterError(null);
    setFilters(prevFilters => ({
      ...prevFilters,
      [fieldName]: '',
    }));
  };

  const handleClearAll = () => {
    setFilterError(null);
    setFilters(initialFilters);
    setCurrentPage(1);
    fetchHotels(1, initialFilters);
  };

  const handleSearch = () => {
    if (filters.date_from && filters.date_to && filters.date_to < filters.date_from) {
      setFilterError('Дата окончания не может быть раньше даты начала');
      return;
    }

    setFilterError(null);
    setCurrentPage(1);
    fetchHotels(1, filters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchHotels(page, filters);
  };

  // Проверяем, применен ли хотя бы один фильтр
  const isAnyFilterApplied = useMemo(() => {
    return Object.values(filters).some(value => value !== '');
  }, [filters]);

  return (
    <div className={styles.hotelsPage}>
      <div className={styles.searchBar}>
        {Object.keys(filters).map((key) => {
          const filterKey = key as keyof Filters;
          const placeholder = {
            location: 'Локация',
            price_from: 'Цена от',
            price_to: 'Цена до',
            date_from: 'Дата начала',
            date_to: 'Дата окончания',
          }[filterKey];
          const type = key.includes('date') ? 'date' : key.includes('price') ? 'number' : 'text';
          const minValue = filterKey === 'date_to' ? filters.date_from || today : type === 'date' ? today : undefined;

          return (
            <div key={filterKey} className={styles.inputWrapper}>
              <input
                type={type}
                name={filterKey}
                placeholder={placeholder}
                className={styles.searchInput}
                value={filters[filterKey]}
                onChange={handleFilterChange}
                min={minValue}
              />
              {filters[filterKey] && (
                <button
                  className={styles.clearInputButton}
                  onClick={() => handleClearInput(filterKey)}
                >
                  &times;
                </button>
              )}
            </div>
          );
        })}
        <button className={styles.searchButton} onClick={handleSearch} disabled={loading}>
          {loading ? 'Поиск...' : 'Найти'}
        </button>
        <button 
          className={styles.clearAllButton} 
          onClick={handleClearAll} 
          disabled={!isAnyFilterApplied || loading}
        >
          Очистить все
        </button>
      </div>
      <p className={styles.filterError} role={filterError ? 'alert' : undefined} aria-live="polite">
        {filterError}
      </p>

      {loading && <p>Загрузка отелей...</p>}
      
      {!loading && hotels.length > 0 && (
        <>
          <div className={styles.hotelGrid}>
            {hotels.map(hotel => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {!loading && hotels.length === 0 && (
        <p>По вашему запросу отелей не найдено.</p>
      )}
    </div>
  );
};

export default HotelsPage;