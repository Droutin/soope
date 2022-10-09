export interface Pagination {
    page: number;
    perPage: number;
    orderBy?: Record<string, "ASC" | "DESC">;
}
export default Pagination;
