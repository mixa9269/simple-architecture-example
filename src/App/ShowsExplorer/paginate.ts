export const PAGE_SIZE = 3;

export function getTotalPages(itemsCount: number, pageSize = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(itemsCount / pageSize));
}

export function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(1, page), totalPages);
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
