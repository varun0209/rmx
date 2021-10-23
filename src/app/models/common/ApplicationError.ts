export class ApplicationError {
    clientId: string;
    message: string;
    comments: string;
    user: string;
    program: string;
    type: string;
    Request: object;
    Response: object;
    URL: string;
    IsTextLog = false;
}
