export const PAGE_SIZE = 3;

export const getTotalPages = (itemsCount: number, pageSize = PAGE_SIZE): number =>
  Math.max(1, Math.ceil(itemsCount / pageSize));

export const clampPage = (page: number, totalPages: number): number =>
  Math.min(Math.max(1, page), totalPages);

export const paginate = <T>(items: T[], page: number, pageSize = PAGE_SIZE): T[] => {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
};
