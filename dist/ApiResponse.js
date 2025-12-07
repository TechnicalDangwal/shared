class ApiResponse {
    constructor(statuseCode, message, data) {
        this.statusCode = statuseCode;
        this.status = true;
        this.message = message;
        this.data = data;
    }
}
export { ApiResponse };
