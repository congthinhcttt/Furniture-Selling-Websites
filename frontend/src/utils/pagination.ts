export function getTotalPages(totalItems: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function paginateItems<T>(items: T[], currentPage: number, pageSize: number) {
  const startIndex = (currentPage - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}

export function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 1), totalPages);
}
