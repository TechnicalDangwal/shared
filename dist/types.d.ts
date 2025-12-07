export interface ApiErrorType extends Error {
    statusCode?: number;
    status?: string;
}
