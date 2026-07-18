export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    
    Object.setPrototypeOf(this, new.target.prototype);
  }


  static badRequest(message: string, code: string = 'BAD_REQUEST'): AppError {
    return new AppError(message, 400, code);
  }

  static unauthorized(message: string, code: string = 'UNAUTHORIZED'): AppError {
    return new AppError(message, 401, code);
  }

  static forbidden(message: string, code: string = 'FORBIDDEN'): AppError {
    return new AppError(message, 403, code);
  }

  static notFound(message: string, code: string = 'NOT_FOUND'): AppError {
    return new AppError(message, 404, code);
  }

  static conflict(message: string, code: string = 'CONFLICT'): AppError {
    return new AppError(message, 409, code);
  }

  static unprocessable(message: string, code: string = 'UNPROCESSABLE_ENTITY'): AppError {
    return new AppError(message, 422, code);
  }

  static internal(message: string = 'Internal Server Error', code: string = 'INTERNAL_SERVER_ERROR'): AppError {
    return new AppError(message, 500, code);
  }
}
