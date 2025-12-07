declare class ApiResponse {
    statusCode?: number;
    status?: boolean;
    message: string;
    data?: any;
    constructor(statuseCode: number, message: string, data?: Record<string, any>);
}
export { ApiResponse };
