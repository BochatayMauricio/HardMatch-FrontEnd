export interface ResponseLoginValidationError {
  message: string;
}

export interface ResponseLoginErrorPayload {
  error?: {
    message?: string;
    validationErrors?: ResponseLoginValidationError[];
  };
}
