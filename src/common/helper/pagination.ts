export type PaginationMeta = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export const paginationUtils = {
  getOffset: (page: number, limit: number) => (page - 1) * limit,
  createMetdata: (page: number, limit: number, totalItems: number) => ({
    currentPage: page,
    itemsPerPage: limit,
    totalItems: totalItems,
    hasNextPage: (totalItems - page * limit) > limit,
    hasPreviousPage: page > 1,
  }),
};
