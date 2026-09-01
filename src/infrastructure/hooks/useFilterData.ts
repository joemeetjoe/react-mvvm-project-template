// src/hooks/useFilterData.ts
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

interface UseFilterDataOptions {
  updateUrl?: boolean;
}

type FilterValues = { [key: string]: any };
type DataItem = { [key: string]: any };

interface UseFilterDataReturn<T extends DataItem> {
  filteredData: T[];
  filterData: (values: FilterValues) => T[];
}

export function useFilterData<T extends DataItem = DataItem>(
    initialData: T[] = [],
    options: UseFilterDataOptions = {}
): UseFilterDataReturn<T> {
  const [filteredData, setFilteredData] = useState<T[]>(initialData);
  const navigate = useNavigate();

  const filterData = (values: FilterValues): T[] => {
    const filtered = initialData.filter((item: T) => {
      return Object.entries(values).every(([key, value]) => {
        if (!value) return true;

        const itemValue = item[key];

        if (value instanceof Date) {
          const filterDate = new Date(value);
          const itemDate = new Date(itemValue);
          return filterDate.toDateString() === itemDate.toDateString();
        } else if (typeof value === 'string') {
          return itemValue &&
              itemValue.toString().toLowerCase()
                  .includes(value.toLowerCase());
        }

        return itemValue === value;
      });
    });

    setFilteredData(filtered);

    if (options.updateUrl) {
      // ✅ Better: Update URL with proper typing
      void navigate({
        // @ts-expect-error - TanStack Router typing is complex, suppress for now
        search: (prev: any) => ({ ...prev, ...values }),
        replace: true
      });
    }

    return filtered;
  };

  useEffect(() => {
    setFilteredData(initialData);
  }, [initialData]);

  return {
    filteredData,
    filterData
  };
}

export type { UseFilterDataOptions, UseFilterDataReturn, FilterValues };
