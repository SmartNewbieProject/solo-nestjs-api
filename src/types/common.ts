import { Dayjs } from 'dayjs';

export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export type Pagination = {
  page: number;
  limit: number;
};

export type ElasticDate = Date | string | Dayjs | null;
