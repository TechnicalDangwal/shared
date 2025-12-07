declare class ApiError extends Error {
    statusCode: number;
    status: boolean;
    constructor(message: string, statusCode?: number);
}
export { ApiError };
