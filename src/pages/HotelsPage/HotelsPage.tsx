import { useEffect, useState, useCallback, useMemo, startTransition } from 'react';
import styles from './HotelsPage.module.css';
import HotelCard from '../../components/HotelCard/HotelCard';
import Pagination from '../../components/Pagination/Pagination';
import { DatePickerField } from '../../components/DatePickerField/DatePickerField';
import { getHotels } from '../../api/hotels';
import { notifyApiError } from '../../utils/notifyApiError';
import { getTodayStart, parseIsoDate } from '../../utils/datePicker';
import { LocationFilterInput } from './LocationFilterInput';

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

const FILTER_FIELDS: { key: keyof Filters; placeholder: string; inputType: 'text' | 'number' | 'date' | 'location' }[] = [
  { key: 'location', placeholder: 'Локация', inputType: 'location' },
  { key: 'price_from', placeholder: 'Цена от', inputType: 'number' },
  { key: 'price_to', placeholder: 'Цена до', inputType: 'number' },
  { key: 'date_from', placeholder: 'Дата начала', inputType: 'date' },
  { key: 'date_to', placeholder: 'Дата окончания', inputType: 'date' },
];

const HotelsPage = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const todayDate = useMemo(() => getTodayStart(), []);

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
      console.error('HotelsPage: ошибка загрузки отелей', err);
      notifyApiError(err, 'Не удалось загрузить отели');
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

    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleDateChange = (name: 'date_from' | 'date_to', value: string) => {
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

  const handleLocationChange = (value: string) => {
    setFilterError(null);
    setFilters(prevFilters => ({
      ...prevFilters,
      location: value,
    }));
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
        {FILTER_FIELDS.map(({ key: filterKey, placeholder, inputType }) => (
          <div key={filterKey} className={styles.inputWrapper}>
            {inputType === 'location' ? (
              <LocationFilterInput
                value={filters.location}
                placeholder={placeholder}
                onChange={handleLocationChange}
              />
            ) : inputType === 'date' ? (
              <DatePickerField
                value={filters[filterKey]}
                onChange={(value) => handleDateChange(filterKey as 'date_from' | 'date_to', value)}
                minDate={
                  filterKey === 'date_to'
                    ? parseIsoDate(filters.date_from) ?? todayDate
                    : todayDate
                }
                placeholder={placeholder}
                title={placeholder}
                inputClassName={styles.searchInput}
                wrapperClassName={styles.datePickerWrapper}
              />
            ) : (
              <input
                type={inputType}
                name={filterKey}
                placeholder={placeholder}
                className={`${styles.searchInput} ${inputType === 'number' ? styles.searchInputNumber : ''}`}
                value={filters[filterKey]}
                onChange={handleFilterChange}
              />
            )}
            {filters[filterKey] && (
              <button
                type="button"
                className={styles.clearInputButton}
                onClick={() => handleClearInput(filterKey)}
              >
                &times;
              </button>
            )}
          </div>
        ))}
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