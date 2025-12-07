class ApiResponse {
    statusCode?: number;
    status?: boolean;
    message: string;
    data?: any;
    constructor(statuseCode: number, message: string, data?: Record<string, any>) {
        this.statusCode = statuseCode;
        this.status = true;
        this.message = message;
        this.data = data;
    }
}

export { ApiResponse };